import { getServiceClient } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import type { Product } from '$lib/types/database';

export async function load() {
	const supabase = getServiceClient();

	const [{ data: rawProducts }, { data: claimStats }, { data: subStats }] = await Promise.all([
		supabase.from('products').select('*').order('name', { ascending: true }),
		supabase.from('claims').select('product_id'),
		supabase.from('coupon_submissions').select('product_id'),
	]);

	const claimCount = (claimStats ?? []).reduce((acc: Record<string, number>, c: { product_id: string }) => {
		acc[c.product_id] = (acc[c.product_id] ?? 0) + 1;
		return acc;
	}, {});

	const subCount = (subStats ?? []).reduce((acc: Record<string, number>, s: { product_id: string }) => {
		acc[s.product_id] = (acc[s.product_id] ?? 0) + 1;
		return acc;
	}, {});

	const products = (rawProducts ?? []).map((p) => ({
		...(p as Product),
		submitted_count: subCount[p.id] ?? 0,
		claims_count:    claimCount[p.id] ?? 0,
	}));

	return { products };
}

export const actions = {
	create: async ({ request }: { request: Request }) => {
		const supabase = getServiceClient();
		const formData = await request.formData();
		const name             = formData.get('name')?.toString().trim();
		const coupons_required = parseInt(formData.get('coupons_required')?.toString() || '0');
		const cashback_amount  = parseInt(formData.get('cashback_amount')?.toString() || '0');

		if (!name)              return fail(400, { createError: 'Product name is required.' });
		if (coupons_required < 1) return fail(400, { createError: 'Coupons required must be at least 1.' });
		if (cashback_amount < 1)  return fail(400, { createError: 'Cashback amount must be at least ₹1.' });

		const { error } = await supabase.from('products').insert({ name, coupons_required, cashback_amount, active: true });
		if (error) return fail(500, { createError: 'Failed to create product.' });
		return {};
	},

	update: async ({ request }: { request: Request }) => {
		const supabase = getServiceClient();
		const formData = await request.formData();
		const id               = formData.get('id')?.toString();
		const name             = formData.get('name')?.toString().trim();
		const coupons_required = parseInt(formData.get('coupons_required')?.toString() || '0');
		const cashback_amount  = parseInt(formData.get('cashback_amount')?.toString() || '0');

		if (!id)                return fail(400, { updateError: 'Product ID missing.' });
		if (!name)              return fail(400, { updateError: 'Product name is required.',          updateId: id });
		if (coupons_required < 1) return fail(400, { updateError: 'Coupons required must be at least 1.', updateId: id });
		if (cashback_amount < 1)  return fail(400, { updateError: 'Cashback amount must be at least ₹1.', updateId: id });

		const { error } = await supabase.from('products').update({ name, coupons_required, cashback_amount }).eq('id', id);
		if (error) return fail(500, { updateError: 'Failed to update product.', updateId: id });
		return {};
	},

	toggleActive: async ({ request }: { request: Request }) => {
		const supabase = getServiceClient();
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { toggleError: 'Product ID missing.' });

		const { data: product } = await supabase.from('products').select('active').eq('id', id).single();
		if (!product) return fail(404, { toggleError: 'Product not found.' });

		const { error } = await supabase.from('products').update({ active: !product.active }).eq('id', id);
		if (error) return fail(500, { toggleError: 'Failed to toggle product status.' });
		return {};
	},
};
