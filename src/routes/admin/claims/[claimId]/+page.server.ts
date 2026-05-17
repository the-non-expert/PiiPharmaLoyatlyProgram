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
			retailers ( name, city, state, upi_id, mobile ),
			products ( name, cashback_amount, coupons_required )
		`)
		.eq('id', params.claimId)
		.single();

	if (!claim) redirect(303, '/admin/claims');

	const retailer = (Array.isArray(claim.retailers) ? claim.retailers[0] : claim.retailers) ?? null;
	const product  = (Array.isArray(claim.products)  ? claim.products[0]  : claim.products)  ?? null;

	const { data: submissions } = await db
		.from('coupon_submissions')
		.select('serial, created_at')
		.eq('claim_id', params.claimId)
		.order('created_at', { ascending: true });

	const coupons = (submissions ?? []).map(s => ({
		serial:     s.serial,
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
	for (const row of qrRows ?? []) {
		const label = Array.isArray(row.qr_batches)
			? row.qr_batches[0]?.batch_label
			: (row.qr_batches as any)?.batch_label;
		if (label) batchBySerial[row.serial] = label;
	}

	const couponsWithBatch = coupons.map(c => ({
		...c,
		batch_label: batchBySerial[c.serial] ?? null,
	}));

	// Fetch retailer context stats
	const retailerId = (claim as any).retailer_id;
	const { data: allRetailerClaims } = await db
		.from('claims')
		.select('id, status, products(cashback_amount)')
		.eq('retailer_id', retailerId);

	const retailerStats = (() => {
		const all = allRetailerClaims ?? [];
		const paid = all.filter(c => c.status === 'paid');
		const totalCashback = paid.reduce((sum, c) => {
			const p = Array.isArray(c.products) ? c.products[0] : c.products;
			return sum + ((p as any)?.cashback_amount ?? 0);
		}, 0);
		return {
			total_claims:   all.length,
			paid_claims:    paid.length,
			total_cashback: totalCashback,
		};
	})();

	return {
		claim: {
			id:               claim.id,
			status:           claim.status,
			rejection_reason: claim.rejection_reason,
			created_at:       claim.created_at,
			approved_at:      claim.approved_at,
			paid_at:          claim.paid_at,
		},
		retailer,
		retailerStats,
		product,
		coupons: couponsWithBatch,
	};
};

export const actions: Actions = {
	reject: async ({ params, request }) => {
		const formData = await request.formData();
		const reason = (formData.get('reason') as string | null)?.trim() ?? '';

		if (!reason) return fail(400, { error: 'Rejection reason is required.' });

		const db = getServiceClient();
		const { error } = await db
			.from('claims')
			.update({ status: 'rejected', rejection_reason: reason })
			.eq('id', params.claimId);

		if (error) return fail(500, { error: 'Failed to reject claim.' });
		redirect(303, '/admin/claims');
	},
};
