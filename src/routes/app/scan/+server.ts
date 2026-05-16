import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceClient } from '$lib/server/supabase';
import { verifyHmac } from '$lib/server/qr-gen';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = locals.retailerSession;
	if (!session) error(401, 'Unauthorized');

	let body: { s?: string; p?: string; b?: string; h?: string };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const serial = (body.s ?? '').trim().toUpperCase();
	const productId = (body.p ?? '').trim();
	const batchId = (body.b ?? '').trim();
	const hmac = (body.h ?? '').trim();

	if (!serial || !productId || !batchId) {
		return json({ status: 'invalid' });
	}

	const hmacSecret = env.HMAC_SECRET;
	if (!hmacSecret) error(500, 'HMAC_SECRET not configured');
	if (!verifyHmac(hmacSecret, serial, productId, batchId, hmac)) {
		return json({ status: 'hmac_failed' });
	}

	const supabase = getServiceClient();

	// Check if serial already used
	const { data: existing } = await supabase
		.from('coupon_submissions')
		.select('created_at')
		.eq('serial', serial)
		.maybeSingle();

	if (existing) {
		const scannedDate = new Date(existing.created_at).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short'
		});
		return json({ status: 'already_scanned', previous_scan_date: scannedDate });
	}

	// Verify product exists and is active
	const { data: product } = await supabase
		.from('products')
		.select('*')
		.eq('id', productId)
		.eq('active', true)
		.single();

	if (!product) {
		return json({ status: 'invalid' });
	}

	const submissionId = crypto.randomUUID();
	const { error: insertError } = await supabase.from('coupon_submissions').insert({
		id: submissionId,
		retailer_id: session.retailer_id,
		product_id: productId,
		serial,
		claim_id: null
	});

	if (insertError) {
		// Unique constraint on serial — race condition
		if (insertError.code === '23505') {
			return json({ status: 'already_scanned' });
		}
		error(500, 'Failed to save scan');
	}

	// Count unlinked submissions for this retailer+product
	const { data: unlinked } = await supabase
		.from('coupon_submissions')
		.select('id')
		.eq('retailer_id', session.retailer_id)
		.eq('product_id', productId)
		.is('claim_id', null);

	const submitted = (unlinked ?? []).length;
	const claimCreated = submitted >= product.coupons_required;
	let upiId: string | null = null;

	if (claimCreated) {
		const claimId = crypto.randomUUID();
		await supabase.from('claims').insert({
			id: claimId,
			retailer_id: session.retailer_id,
			product_id: productId,
			status: 'pending_payout'
		});
		const unlinkedIds = (unlinked ?? []).map((r) => r.id);
		await supabase.from('coupon_submissions').update({ claim_id: claimId }).in('id', unlinkedIds);

		const { data: retailer } = await supabase
			.from('retailers')
			.select('upi_id')
			.eq('id', session.retailer_id)
			.single();
		upiId = retailer?.upi_id ?? null;
	}

	return json({
		status: 'ok',
		product_name: product.name,
		coupons_submitted: claimCreated ? product.coupons_required : submitted,
		coupons_required: product.coupons_required,
		cashback_amount: product.cashback_amount,
		claim_created: claimCreated,
		...(claimCreated && upiId ? { upi_id: upiId } : {})
	});
};
