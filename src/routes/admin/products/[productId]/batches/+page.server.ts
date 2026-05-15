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

	// Mock batch data until coupon_codes table exists
	const MOCK_BATCHES = [
		{ id: 'MAY-2026-A', quantity: 10000, serial_start: 'PP-000001', serial_end: 'PP-010000', format: 'pdf', file_size_mb: 8.4,  generated_at: '2026-05-15T10:12:00Z', generated_by: 'Sneha Agarwal', status: 'active'   },
		{ id: 'APR-2026-C', quantity: 5000,  serial_start: 'PP-040001', serial_end: 'PP-045000', format: 'pdf', file_size_mb: 4.2,  generated_at: '2026-04-28T11:08:00Z', generated_by: 'Sneha Agarwal', status: 'active'   },
		{ id: 'APR-2026-B', quantity: 5000,  serial_start: 'PP-035001', serial_end: 'PP-040000', format: 'zip', file_size_mb: 62.0, generated_at: '2026-04-12T17:21:00Z', generated_by: 'Rohit Verma',   status: 'active'   },
		{ id: 'APR-2026-A', quantity: 2500,  serial_start: 'PP-032501', serial_end: 'PP-035000', format: 'pdf', file_size_mb: 2.1,  generated_at: '2026-04-02T09:15:00Z', generated_by: 'Rohit Verma',   status: 'active'   },
		{ id: 'MAR-2026-B', quantity: 5000,  serial_start: 'PP-027501', serial_end: 'PP-032500', format: 'pdf', file_size_mb: 4.2,  generated_at: '2026-03-21T14:47:00Z', generated_by: 'Sneha Agarwal', status: 'active'   },
		{ id: 'MAR-2026-A', quantity: 7500,  serial_start: 'PP-020001', serial_end: 'PP-027500', format: 'zip', file_size_mb: 94.0, generated_at: '2026-03-04T10:30:00Z', generated_by: 'Sneha Agarwal', status: 'archived' },
	];

	const totalPrinted  = MOCK_BATCHES.reduce((s, b) => s + b.quantity, 0);
	const activeBatches = MOCK_BATCHES.filter(b => b.status === 'active');
	const inMarket      = Math.round(totalPrinted * 0.929);
	const scannedOnce   = Math.round(inMarket * 0.567);
	const lastBatch     = MOCK_BATCHES[0];

	return {
		product,
		batches: MOCK_BATCHES,
		stats: { totalPrinted, inMarket, scannedOnce, lastBatch, activeBatchCount: activeBatches.length },
	};
}
