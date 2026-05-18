import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const supabase = getServiceClient();
  const { data: product } = await supabase
    .from('products').select('*').eq('id', params.productId).eq('active', true).single();
  if (!product) redirect(303, '/app');

  const { data: unlinked } = await supabase
    .from('coupon_submissions')
    .select('id')
    .eq('retailer_id', session.retailer_id)
    .eq('product_id', params.productId)
    .is('claim_id', null);

  return {
    product,
    submitted_count: (unlinked ?? []).length,
    has_active_claim: false,
  };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const productId = params.productId;
    const formData  = await request.formData();
    const couponCount = parseInt((formData.get('coupon_count') as string) ?? '1');

    if (!couponCount || couponCount < 1 || couponCount > 20) {
      return fail(400, { error: 'Invalid submission.' });
    }

    const supabase = getServiceClient();

    const { data: product } = await supabase
      .from('products').select('*').eq('id', productId).eq('active', true).single();
    if (!product) return fail(400, { error: 'Product not found.' });

    type Entry = { photo: File; serial: string };
    const entries: Entry[] = [];

    for (let i = 0; i < couponCount; i++) {
      const photo  = formData.get(`photo_${i}`) as File | null;
      const serial = ((formData.get(`serial_${i}`) as string) ?? '').trim().toUpperCase();

      if (!photo || photo.size === 0) return fail(400, { error: `Coupon ${i + 1}: photo is required.` });
      if (photo.size > 10 * 1024 * 1024) return fail(400, { error: `Coupon ${i + 1}: photo must be under 10MB.` });
      if (!serial) return fail(400, { error: `Coupon ${i + 1}: serial number is required.` });

      if (entries.some(e => e.serial === serial)) {
        return fail(400, { error: `Duplicate serial in this submission: ${serial}` });
      }

      entries.push({ photo, serial });
    }

    const serials = entries.map(e => e.serial);
    const { data: existing } = await supabase
      .from('coupon_submissions').select('serial').in('serial', serials);
    if (existing && existing.length > 0) {
      return fail(400, { error: `Already submitted: ${existing[0].serial}` });
    }

    for (const entry of entries) {
      const submissionId = crypto.randomUUID();
      const photoPath    = `submissions/${submissionId}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('coupon-photos')
        .upload(photoPath, new Uint8Array(await entry.photo.arrayBuffer()), { contentType: entry.photo.type });

      if (uploadError) return fail(500, { error: 'Failed to upload a photo. Please try again.' });

      const { error: insertError } = await supabase
        .from('coupon_submissions')
        .insert({ id: submissionId, retailer_id: session.retailer_id, product_id: productId, photo_url: photoPath, serial: entry.serial, claim_id: null });

      if (insertError) {
        await supabase.storage.from('coupon-photos').remove([photoPath]);
        return fail(500, { error: 'Failed to save a coupon. Please try again.' });
      }
    }

    // Plan-aware auto-trigger: check all active plans containing this product
    const { data: planLegs } = await (supabase as any)
      .from('cashback_plan_legs')
      .select('plan_id, cashback_plans!inner(id, name, cashback_amount, active)')
      .eq('product_id', productId)
      .eq('cashback_plans.active', true);

    let qualified = false;
    let cashback  = 0;
    let upi_id: string | null = null;

    for (const planLeg of planLegs ?? []) {
      const plan = Array.isArray(planLeg.cashback_plans)
        ? planLeg.cashback_plans[0]
        : (planLeg.cashback_plans as any);
      if (!plan) continue;

      const { data: allLegs } = await (supabase as any)
        .from('cashback_plan_legs')
        .select('product_id, coupons_required')
        .eq('plan_id', planLeg.plan_id);

      if (!allLegs || allLegs.length === 0) continue;

      let allSatisfied = true;
      const qualifyingIds: string[] = [];

      for (const leg of allLegs) {
        const { data: unlinked } = await supabase
          .from('coupon_submissions')
          .select('id')
          .eq('retailer_id', session.retailer_id)
          .eq('product_id', leg.product_id)
          .is('claim_id', null);

        const count = (unlinked ?? []).length;
        if (count < leg.coupons_required) {
          allSatisfied = false;
        }
        qualifyingIds.push(...(unlinked ?? []).slice(0, leg.coupons_required).map(r => r.id));
      }

      if (allSatisfied && !qualified) {
        const claimId = crypto.randomUUID();
        await supabase.from('claims').insert({
          id: claimId,
          retailer_id: session.retailer_id,
          plan_id: planLeg.plan_id,
          status: 'pending_payout'
        });
        await supabase.from('coupon_submissions').update({ claim_id: claimId }).in('id', qualifyingIds);

        qualified = true;
        cashback  = plan.cashback_amount;

        const { data: retailer } = await supabase
          .from('retailers').select('upi_id').eq('id', session.retailer_id).single();
        upi_id = retailer?.upi_id ?? null;
      }
    }

    const { data: remaining } = await supabase
      .from('coupon_submissions')
      .select('id')
      .eq('retailer_id', session.retailer_id)
      .eq('product_id', productId)
      .is('claim_id', null);

    return {
      saved: true,
      submittedCount: couponCount,
      newCount: (remaining ?? []).length,
      qualified,
      cashback,
      upi_id
    };
  }
} satisfies Actions;
