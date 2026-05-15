import { getServiceClient } from '$lib/server/supabase';
import { error } from '@sveltejs/kit';
import type { Product } from '$lib/types/database';

export async function load({ params }: { params: { productId: string } }) {
	const supabase = getServiceClient();
	const { data: raw } = await supabase
		.from('products')
		.select('id,name,coupons_required,cashback_amount,active')
		.eq('id', params.productId)
		.single();

	if (!raw) throw error(404, 'Product not found');
	const product = raw as unknown as Pick<Product, 'id' | 'name' | 'coupons_required' | 'cashback_amount' | 'active'>;

	// coupon_codes table will be added in #9 — return empty until then
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
