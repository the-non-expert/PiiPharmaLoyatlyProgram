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
			retailers ( name, upi_id ),
			products ( name, cashback_amount )
		`)
		.eq('status', 'approved')
		.order('approved_at', { ascending: true });

	const rows = (claims ?? []).map((c) => ({
		id:              c.id,
		created_at:      c.created_at,
		retailer_name:   (Array.isArray(c.retailers) ? c.retailers[0] : c.retailers)?.name ?? '—',
		upi_id:          (Array.isArray(c.retailers) ? c.retailers[0] : c.retailers)?.upi_id ?? '—',
		product_name:    (Array.isArray(c.products)  ? c.products[0]  : c.products)?.name ?? '—',
		cashback_amount: (Array.isArray(c.products)  ? c.products[0]  : c.products)?.cashback_amount ?? 0,
	}));

	const total = rows.reduce((sum, r) => sum + r.cashback_amount, 0);

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
			.eq('status', 'approved')
			.select('id');

		if (error) return fail(500, { error: 'Failed to mark claims as paid.' });

		const count = updated?.length ?? 0;
		return { markedPaid: count };
	},
};
