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
			cashback_plans ( name, cashback_amount )
		`)
		.eq('status', 'pending_payout')
		.order('approved_at', { ascending: true });

	// Group by retailer_id — one row per retailer
	const byRetailer = new Map<string, {
		retailer_name: string;
		upi_id: string;
		plans: string[];
		totalAmount: number;
		claimCount: number;
		earliest_created_at: string;
	}>();

	for (const c of ((claims ?? []) as Array<any>)) {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const plan     = Array.isArray(c.cashback_plans) ? c.cashback_plans[0] : c.cashback_plans;
		if (!retailer?.id) continue;

		const existing  = byRetailer.get(retailer.id);
		const planName  = plan?.name ?? 'Unknown';
		const amount    = plan?.cashback_amount ?? 0;

		if (existing) {
			existing.totalAmount += amount;
			existing.claimCount  += 1;
			existing.plans.push(planName);
		} else {
			byRetailer.set(retailer.id, {
				retailer_name:       retailer.name ?? '—',
				upi_id:              retailer.upi_id ?? '—',
				plans:               [planName],
				totalAmount:         amount,
				claimCount:          1,
				earliest_created_at: c.created_at,
			});
		}
	}

	const rows  = Array.from(byRetailer.values());
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

		const { data: updated, error } = await (db as any)
			.from('claims')
			.update({ status: 'paid', paid_at: now })
			.eq('status', 'pending_payout')
			.select('id');

		if (error) return fail(500, { error: 'Failed to mark claims as paid.' });

		const count = (updated as any[])?.length ?? 0;
		return { markedPaid: count };
	},
};
