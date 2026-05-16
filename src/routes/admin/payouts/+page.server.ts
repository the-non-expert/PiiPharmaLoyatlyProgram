import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const db = getServiceClient();

	const { data: claims } = await db
		.from('claims')
		.select(`
			id,
			created_at,
			retailers ( id, name, upi_id ),
			products ( name, cashback_amount )
		`)
		.eq('status', 'pending_payout')
		.order('approved_at', { ascending: true });

	// Group by retailer_id — one row per retailer
	const byRetailer = new Map<string, {
		retailer_name: string;
		upi_id: string;
		products: string[];
		totalAmount: number;
		claimCount: number;
		earliest_created_at: string;
	}>();

	for (const c of claims ?? []) {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const product  = Array.isArray(c.products)  ? c.products[0]  : c.products;
		if (!retailer?.id) continue;

		const existing = byRetailer.get(retailer.id);
		const productName = product?.name ?? 'Unknown';
		const amount = product?.cashback_amount ?? 0;

		if (existing) {
			existing.totalAmount  += amount;
			existing.claimCount   += 1;
			existing.products.push(productName);
		} else {
			byRetailer.set(retailer.id, {
				retailer_name:        retailer.name ?? '—',
				upi_id:               retailer.upi_id ?? '—',
				products:             [productName],
				totalAmount:          amount,
				claimCount:           1,
				earliest_created_at:  c.created_at,
			});
		}
	}

	const rows = Array.from(byRetailer.values());
	const total = rows.reduce((sum, r) => sum + r.totalAmount, 0);

	let historyData = null;
	try {
		const { data } = await db
			.from('payout_exports')
			.select('id, exported_at, claims_count, total_amount, filename')
			.order('exported_at', { ascending: false })
			.limit(10);
		historyData = data;
	} catch {
		historyData = null;
	}

	return { rows, total, history: historyData ?? [] };
};

export const actions: Actions = {
	markPaid: async ({ request }) => {
		const formData = await request.formData();
		if (formData.get('confirmed') !== 'yes') {
			return fail(400, { error: 'Confirmation required.' });
		}

		const db = getServiceClient();
		const now = new Date().toISOString();

		const { data: updated, error } = await db
			.from('claims')
			.update({ status: 'paid', paid_at: now })
			.eq('status', 'pending_payout')
			.select('id');

		if (error) return fail(500, { error: 'Failed to mark claims as paid.' });

		const count = updated?.length ?? 0;
		return { markedPaid: count };
	},
};
