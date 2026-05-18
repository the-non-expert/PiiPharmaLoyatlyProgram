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

	const serial    = (body.s ?? '').trim().toUpperCase();
	const productId = (body.p ?? '').trim();
	const batchId   = (body.b ?? '').trim();
	const hmac      = (body.h ?? '').trim();

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
			day: 'numeric', month: 'short'
		});
		return json({ status: 'already_scanned', previous_scan_date: scannedDate });
	}

	// Verify product exists and is active
	const { data: product } = await supabase
		.from('products')
		.select('id, name')
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
		if (insertError.code === '23505') {
			return json({ status: 'already_scanned' });
		}
		error(500, 'Failed to save scan');
	}

	// Find all active plans that include this product
	const { data: planLegs } = await (supabase as any)
		.from('cashback_plan_legs')
		.select('plan_id, cashback_plans!inner(id, name, cashback_amount, active)')
		.eq('product_id', productId)
		.eq('cashback_plans.active', true);

	let claimCreated = false;
	let claimedPlanName = '';
	let claimedCashback = 0;
	let claimedIsCombo = false;
	let upiId: string | null = null;

	// For the progress display, track the most relevant plan for this product
	let displayPlanName = '';
	let displaySubmitted = 0;
	let displayRequired = 1;
	let displayIsCombo = false;
	let displayCashback = 0;

	for (const planLeg of planLegs ?? []) {
		const plan = Array.isArray(planLeg.cashback_plans)
			? planLeg.cashback_plans[0]
			: (planLeg.cashback_plans as any);
		if (!plan) continue;

		// Get all legs for this plan
		const { data: allLegs } = await (supabase as any)
			.from('cashback_plan_legs')
			.select('product_id, coupons_required')
			.eq('plan_id', planLeg.plan_id);

		if (!allLegs || allLegs.length === 0) continue;

		const isCombo = allLegs.length > 1;

		// Count unlinked submissions per leg for this retailer
		let allSatisfied = true;
		const qualifyingIds: string[] = [];
		let thisLegSubmitted = 0;
		let thisLegRequired = 1;

		for (const leg of allLegs) {
			const { data: unlinked } = await supabase
				.from('coupon_submissions')
				.select('id')
				.eq('retailer_id', session.retailer_id)
				.eq('product_id', leg.product_id)
				.is('claim_id', null);

			const count = (unlinked ?? []).length;

			if (leg.product_id === productId) {
				thisLegSubmitted = count;
				thisLegRequired  = leg.coupons_required;
			}

			if (count < leg.coupons_required) {
				allSatisfied = false;
				// Still need to collect qualifying ids for other legs, so don't break
			}
			qualifyingIds.push(...(unlinked ?? []).slice(0, leg.coupons_required).map(r => r.id));
		}

		// Update display info for the first plan containing this product
		if (!displayPlanName) {
			displayPlanName  = plan.name;
			displaySubmitted = thisLegSubmitted;
			displayRequired  = thisLegRequired;
			displayIsCombo   = isCombo;
			displayCashback  = plan.cashback_amount;
		}

		if (allSatisfied && !claimCreated) {
			const claimId = crypto.randomUUID();
			await supabase.from('claims').insert({
				id: claimId,
				retailer_id: session.retailer_id,
				plan_id: planLeg.plan_id,
				status: 'pending_payout'
			});
			await supabase
				.from('coupon_submissions')
				.update({ claim_id: claimId })
				.in('id', qualifyingIds);

			claimCreated    = true;
			claimedPlanName = plan.name;
			claimedCashback = plan.cashback_amount;
			claimedIsCombo  = isCombo;

			// Update display info to the triggered plan
			displayPlanName  = plan.name;
			displaySubmitted = thisLegSubmitted;
			displayRequired  = thisLegRequired;
			displayCashback  = plan.cashback_amount;
			displayIsCombo   = isCombo;
		}
	}

	if (claimCreated) {
		const { data: retailer } = await supabase
			.from('retailers')
			.select('upi_id')
			.eq('id', session.retailer_id)
			.single();
		upiId = retailer?.upi_id ?? null;
	}

	return json({
		status:            'ok',
		product_name:      product.name,
		plan_name:         displayPlanName,
		is_combo:          displayIsCombo,
		coupons_submitted: claimCreated ? displayRequired : displaySubmitted,
		coupons_required:  displayRequired,
		cashback_amount:   displayCashback,
		claim_created:     claimCreated,
		...(claimCreated && upiId ? { upi_id: upiId } : {})
	});
};
