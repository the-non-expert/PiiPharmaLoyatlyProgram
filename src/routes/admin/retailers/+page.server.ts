import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') ?? '';

	const db = getServiceClient();

	let query = db
		.from('retailers')
		.select(`
			id,
			name,
			mobile,
			city,
			state,
			upi_id,
			created_at,
			claims(id, products(cashback_amount))
		`)
		.order('created_at', { ascending: false });

	if (search) {
		query = query.or(`name.ilike.%${search}%,mobile.ilike.%${search}%`);
	}

	const { data } = await query;

	const retailers = (data ?? []).map((r: {
		id: string;
		name: string | null;
		mobile: string;
		city: string | null;
		state: string | null;
		upi_id: string | null;
		created_at: string;
		claims: { id: string; products: { cashback_amount: number } | { cashback_amount: number }[] | null }[];
	}) => {
		const claims = r.claims ?? [];
		const cashbackEarned = claims.reduce((s: number, c: { products: { cashback_amount: number } | { cashback_amount: number }[] | null }) => {
			const p = Array.isArray(c.products) ? c.products[0] : c.products;
			return s + (p?.cashback_amount ?? 0);
		}, 0);
		return {
			id:              r.id,
			name:            r.name ?? '—',
			mobile:          r.mobile,
			city:            r.city ?? '—',
			state:           r.state ?? '—',
			upi_id:          r.upi_id ?? '—',
			registered_at:   r.created_at,
			total_claims:    claims.length,
			cashback_earned: cashbackEarned,
		};
	});

	return { retailers, search };
};
