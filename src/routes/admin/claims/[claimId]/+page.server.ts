import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params }) => {
	const db = getServiceClient();

	const { data: claim } = await db
		.from('claims')
		.select(`
			id,
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

	// Photos and serials live in coupon_submissions, linked by claim_id
	const { data: submissions } = await db
		.from('coupon_submissions')
		.select('serial, photo_url')
		.eq('claim_id', params.claimId)
		.order('created_at', { ascending: true });

	// Generate signed URLs for each submission photo
	const coupons = await Promise.all(
		(submissions ?? []).map(async (s) => {
			let signedUrl: string | null = null;
			if (s.photo_url) {
				const { data } = await db.storage
					.from('coupon-photos')
					.createSignedUrl(s.photo_url, 3600);
				signedUrl = data?.signedUrl ?? null;
			}
			return { serial: s.serial, photo_signed_url: signedUrl };
		})
	);

	return {
		claim: {
			id:               claim.id,
			status:           claim.status,
			rejection_reason: claim.rejection_reason,
			created_at:       claim.created_at,
		},
		retailer,
		product,
		coupons,
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
