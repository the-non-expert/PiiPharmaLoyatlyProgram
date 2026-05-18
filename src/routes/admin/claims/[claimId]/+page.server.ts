import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params }) => {
	const db = getServiceClient();

	const { data: claim } = await db
		.from('claims')
		.select(`
			id,
			retailer_id,
			status,
			rejection_reason,
			created_at,
			approved_at,
			paid_at,
			plan_id,
			retailers ( name, city, state, upi_id, mobile ),
			cashback_plans ( name, cashback_amount, cashback_plan_legs ( product_id, coupons_required, products(name) ) )
		`)
		.eq('id', params.claimId)
		.single();

	if (!claim) redirect(303, '/admin/claims');

	const c        = claim as any;
	const retailer = (Array.isArray(c.retailers) ? c.retailers[0] : c.retailers) ?? null;
	const planRaw  = (Array.isArray(c.cashback_plans) ? c.cashback_plans[0] : c.cashback_plans) ?? null;

	const plan = planRaw ? {
		name:            (planRaw as any).name,
		cashback_amount: (planRaw as any).cashback_amount,
	} : null;

	const legs = ((planRaw as any)?.cashback_plan_legs ?? []).map((l: any) => {
		const pname = Array.isArray(l.products) ? l.products[0]?.name : (l.products as any)?.name;
		return {
			product_id:       l.product_id,
			product_name:     pname ?? '—',
			coupons_required: l.coupons_required,
		};
	});

	const { data: submissions } = await db
		.from('coupon_submissions')
		.select('serial, created_at, product_id')
		.eq('claim_id', params.claimId)
		.order('created_at', { ascending: true });

	const coupons = ((submissions ?? []) as Array<any>).map((s: any) => ({
		serial:     s.serial,
		product_id: s.product_id,
		scanned_at: s.created_at,
	}));

	// Fetch batch label for each serial
	const serials = coupons.map(c => c.serial);
	const { data: qrRows } = serials.length
		? await db
			.from('qr_serials')
			.select('serial, qr_batches(batch_label)')
			.in('serial', serials)
		: { data: [] };

	const batchBySerial: Record<string, string> = {};
	for (const row of ((qrRows ?? []) as Array<any>)) {
		const label = Array.isArray(row.qr_batches)
			? row.qr_batches[0]?.batch_label
			: row.qr_batches?.batch_label;
		if (label) batchBySerial[row.serial] = label;
	}

	// Attach product name from legs for display
	const legProductNames: Record<string, string> = {};
	for (const leg of legs) legProductNames[leg.product_id] = leg.product_name;

	const couponsWithBatch = coupons.map(c => ({
		...c,
		batch_label:  batchBySerial[c.serial] ?? null,
		product_name: legProductNames[c.product_id] ?? null,
	}));

	// Retailer context stats
	const retailerId = (claim as any).retailer_id;
	const { data: allRetailerClaims } = await db
		.from('claims')
		.select('id, status, cashback_plans(cashback_amount)')
		.eq('retailer_id', retailerId);

	const retailerStats = (() => {
		const all  = ((allRetailerClaims ?? []) as Array<any>);
		const paid = all.filter((rc: any) => rc.status === 'paid');
		const totalCashback = paid.reduce((sum: number, rc: any) => {
			const p = Array.isArray(rc.cashback_plans) ? rc.cashback_plans[0] : rc.cashback_plans;
			return sum + (p?.cashback_amount ?? 0);
		}, 0);
		return {
			total_claims:   all.length,
			paid_claims:    paid.length,
			total_cashback: totalCashback,
		};
	})();

	return {
		claim: {
			id:               c.id,
			status:           c.status,
			rejection_reason: c.rejection_reason,
			created_at:       c.created_at,
			approved_at:      c.approved_at,
			paid_at:          c.paid_at,
		},
		retailer,
		retailerStats,
		plan,
		legs,
		coupons: couponsWithBatch,
	};
};

export const actions: Actions = {
	reject: async ({ params, request }) => {
		const formData = await request.formData();
		const reason = (formData.get('reason') as string | null)?.trim() ?? '';

		if (!reason) return fail(400, { error: 'Rejection reason is required.' });

		const db = getServiceClient();
		const { error } = await (db as any)
			.from('claims')
			.update({ status: 'rejected', rejection_reason: reason })
			.eq('id', params.claimId);

		if (error) return fail(500, { error: 'Failed to reject claim.' });
		redirect(303, '/admin/claims');
	},
};
