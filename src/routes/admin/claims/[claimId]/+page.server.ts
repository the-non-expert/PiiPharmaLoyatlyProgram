import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params }) => {
	if (dev) {
		const { MOCK_CLAIMS, MOCK_PRODUCTS } = await import('$lib/server/dev-mock');
		const c = MOCK_CLAIMS.find((m) => m.id === params.claimId);
		if (!c) redirect(303, '/admin/claims');
		const prod = MOCK_PRODUCTS.find((p) => p.id === c.product_id);
		return {
			claim: {
				id: c.id,
				status: c.status,
				rejection_reason: c.rejection_reason,
				created_at: c.created_at,
				photo_signed_url: c.photo_signed_url,
			},
			retailer: c.retailer,
			product: {
				...c.product,
				coupons_required: prod?.coupons_required ?? c.serial_count,
			},
			serials: c.serials,
		};
	}

	const db = getServiceClient();

	const { data: claim } = await db
		.from('claims')
		.select(`
			id,
			status,
			rejection_reason,
			photo_url,
			created_at,
			approved_at,
			paid_at,
			retailers ( name, city, state, upi_id, mobile ),
			products ( name, cashback_amount, coupons_required ),
			serial_numbers ( serial )
		`)
		.eq('id', params.claimId)
		.single();

	if (!claim) redirect(303, '/admin/claims');

	const retailer = (Array.isArray(claim.retailers) ? claim.retailers[0] : claim.retailers) ?? null;
	const product  = (Array.isArray(claim.products)  ? claim.products[0]  : claim.products)  ?? null;
	const serials  = (claim.serial_numbers ?? []).map((s: { serial: string }) => s.serial);

	const { data: signedData } = await db.storage
		.from('coupon-photos')
		.createSignedUrl(claim.photo_url, 3600);

	return {
		claim: {
			id:               claim.id,
			status:           claim.status,
			rejection_reason: claim.rejection_reason,
			created_at:       claim.created_at,
			photo_signed_url: signedData?.signedUrl ?? null,
		},
		retailer,
		product,
		serials,
	};
};

export const actions: Actions = {
	approve: async ({ params }) => {
		const db = getServiceClient();
		const { error } = await db
			.from('claims')
			.update({ status: 'approved', approved_at: new Date().toISOString() })
			.eq('id', params.claimId);

		if (error) return fail(500, { error: 'Failed to approve claim.' });
		redirect(303, '/admin/claims');
	},

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
