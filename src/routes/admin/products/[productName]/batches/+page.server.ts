import { getServiceClient } from '$lib/server/supabase';
import { error, fail } from '@sveltejs/kit';
import type { Product } from '$lib/types/database';

type Params = { productName: string };

export const actions = {
	update: async ({ request, params }: { request: Request; params: Params }) => {
		const supabase = getServiceClient();
		const formData = await request.formData();
		const name             = formData.get('name')?.toString().trim();
		const coupons_required = parseInt(formData.get('coupons_required')?.toString() || '0');
		const cashback_amount  = parseInt(formData.get('cashback_amount')?.toString() || '0');

		if (!name)                return fail(400, { updateError: 'Product name is required.' });
		if (coupons_required < 1) return fail(400, { updateError: 'Coupons required must be at least 1.' });
		if (cashback_amount < 1)  return fail(400, { updateError: 'Cashback must be at least ₹1.' });

		const { error: err } = await supabase
			.from('products')
			.update({ name, coupons_required, cashback_amount } as never)
			.eq('name', decodeURIComponent(params.productName));
		if (err) return fail(500, { updateError: 'Failed to update product.' });
		return {};
	},

	toggleActive: async ({ params }: { params: Params }) => {
		const supabase = getServiceClient();
		const productName = decodeURIComponent(params.productName);

		const { data: product } = await supabase
			.from('products')
			.select('active')
			.eq('name', productName)
			.single();
		if (!product) return fail(404, { toggleError: 'Product not found.' });

		const next = !(product as unknown as { active: boolean }).active;
		const { error: err } = await supabase
			.from('products')
			.update({ active: next } as never)
			.eq('name', productName);
		if (err) return fail(500, { toggleError: 'Failed to toggle product status.' });
		return {};
	},
};

export async function load({ params }: { params: Params }) {
	const supabase = getServiceClient();
	const { data: raw } = await supabase
		.from('products')
		.select('id,name,coupons_required,cashback_amount,active')
		.eq('name', decodeURIComponent(params.productName))
		.single();

	if (!raw) throw error(404, 'Product not found');
	const product = raw as unknown as Pick<Product, 'id' | 'name' | 'coupons_required' | 'cashback_amount' | 'active'>;

	// qr_batches table will be added in #23 — return empty until then
	return {
		product,
		batches: [] as {
			id: string; quantity: number; serial_start: string; serial_end: string;
			format: string; file_size_mb: number; generated_at: string;
			generated_by: string; status: string;
		}[],
		stats: { totalPrinted: 0, inMarket: 0, scannedOnce: 0, lastBatch: null as null | { generated_at: string; quantity: number }, activeBatchCount: 0 },
	};
}
