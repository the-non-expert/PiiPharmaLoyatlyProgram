import { getServiceClient } from '$lib/server/supabase';
import { slugify } from '$lib/utils/slug';
import { error, fail } from '@sveltejs/kit';
import type { Product } from '$lib/types/database';

type Params = { productName: string };

type ProductRow = Pick<Product, 'id' | 'name' | 'coupons_required' | 'cashback_amount' | 'active'>;

async function findBySlug(supabase: ReturnType<typeof getServiceClient>, slug: string) {
	const { data } = await supabase
		.from('products')
		.select('id,name,coupons_required,cashback_amount,active');
	const rows = (data ?? []) as unknown as ProductRow[];
	return rows.find((p) => slugify(p.name) === slug);
}

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

		const product = await findBySlug(supabase, params.productName);
		if (!product) return fail(404, { updateError: 'Product not found.' });

		const { error: err } = await supabase
			.from('products')
			.update({ name, coupons_required, cashback_amount } as never)
			.eq('id', product.id);
		if (err) return fail(500, { updateError: 'Failed to update product.' });
		return {};
	},

	toggleActive: async ({ params }: { params: Params }) => {
		const supabase = getServiceClient();
		const product = await findBySlug(supabase, params.productName);
		if (!product) return fail(404, { toggleError: 'Product not found.' });

		const { error: err } = await supabase
			.from('products')
			.update({ active: !product.active } as never)
			.eq('id', product.id);
		if (err) return fail(500, { toggleError: 'Failed to toggle product status.' });
		return {};
	},
};

export async function load({ params }: { params: Params }) {
	const supabase = getServiceClient();
	const product = await findBySlug(supabase, params.productName);
	if (!product) throw error(404, 'Product not found');

	const { data: rawBatches } = await supabase
		.from('qr_batches')
		.select('id,batch_label,serial_prefix,quantity,serial_start,serial_end,created_at')
		.eq('product_id', product.id)
		.order('created_at', { ascending: false });

	type BatchRow = { id: string; batch_label: string; serial_prefix: string; quantity: number; serial_start: string; serial_end: string; created_at: string };
	const batches = (rawBatches ?? []).map((b) => {
		const row = b as unknown as BatchRow;
		return {
			id: row.batch_label,
			quantity: row.quantity,
			serial_start: row.serial_start,
			serial_end: row.serial_end,
			generated_at: row.created_at,
		};
	});

	const totalPrinted = batches.reduce((s, b) => s + b.quantity, 0);
	const lastBatch = batches[0]
		? { generated_at: batches[0].generated_at, quantity: batches[0].quantity }
		: null;

	return {
		product,
		batches,
		stats: {
			totalPrinted,
			inMarket: totalPrinted,
			scannedOnce: 0,
			lastBatch,
			activeBatchCount: batches.length
		},
	};
}
