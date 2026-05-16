import { getServiceClient } from '$lib/server/supabase';
import type { Product } from '$lib/types/database';

export async function load() {
	const supabase = getServiceClient();

	const [{ data: rawProducts }, { data: rawBatches }] = await Promise.all([
		supabase.from('products').select('id,name,active').order('name', { ascending: true }),
		supabase
			.from('qr_batches')
			.select('product_id,quantity,created_at')
			.order('created_at', { ascending: false }),
	]);

	// Group batch stats by product_id
	const batchStats = new Map<string, { count: number; total: number; last: string | null }>();
	for (const b of (rawBatches ?? [])) {
		const row = b as unknown as { product_id: string; quantity: number; created_at: string };
		const entry = batchStats.get(row.product_id) ?? { count: 0, total: 0, last: null };
		entry.count += 1;
		entry.total += row.quantity;
		if (!entry.last) entry.last = row.created_at;
		batchStats.set(row.product_id, entry);
	}

	const products = (rawProducts ?? []).map((p) => {
		const pid = (p as unknown as Pick<Product, 'id'>).id;
		const stats = batchStats.get(pid) ?? { count: 0, total: 0, last: null };
		return {
			...(p as unknown as Pick<Product, 'id' | 'name' | 'active'>),
			batch_count:   stats.count,
			total_printed: stats.total,
			last_batch_at: stats.last,
		};
	});

	return { products };
}
