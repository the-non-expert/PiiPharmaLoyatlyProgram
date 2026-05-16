import { getServiceClient } from '$lib/server/supabase';
import type { Product } from '$lib/types/database';

export async function load() {
	const supabase = getServiceClient();
	const { data: raw } = await supabase
		.from('products')
		.select('id,name,active')
		.order('name', { ascending: true });

	const products = (raw ?? []).map((p) => ({
		...(p as unknown as Pick<Product, 'id' | 'name' | 'active'>),
		// qr_batches table will be added in #23 — return zeros until then
		batch_count:    0,
		total_printed:  0,
		last_batch_at:  null as string | null,
	}));

	return { products };
}
