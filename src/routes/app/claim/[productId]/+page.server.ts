import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { dev } from '$app/environment';
import { getServiceClient } from '$lib/server/supabase';
import { devProducts, devCouponSubmissions, devClaims } from '$lib/server/dev-store';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  if (dev) {
    const product = devProducts.find(p => p.id === params.productId && p.active);
    if (!product) redirect(303, '/app');
    const submitted_count = devCouponSubmissions.filter(
      s => s.retailer_id === session.retailer_id && s.product_id === product.id && s.claim_id === null
    ).length;
    const has_active_claim = devClaims.some(
      c => c.retailer_id === session.retailer_id && c.product_id === product.id &&
           (c.status === 'pending' || c.status === 'approved')
    );
    return { product, submitted_count, has_active_claim };
  }

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

  const { data: activeClaim } = await supabase
    .from('claims')
    .select('id')
    .eq('retailer_id', session.retailer_id)
    .eq('product_id', params.productId)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  return {
    product,
    submitted_count: (unlinked ?? []).length,
    has_active_claim: !!activeClaim
  };
};

export const actions = {
  default: async ({ request, params, locals }) => {
    const session = locals.retailerSession;
    if (!session) return fail(401, { error: 'Unauthorized' });

    const productId = params.productId;
    const formData = await request.formData();
    const serial = (formData.get('serial') as string)?.trim().toUpperCase();

    if (!serial) return fail(400, { error: 'Serial number is required.' });

    if (dev) {
      const product = devProducts.find(p => p.id === productId && p.active);
      if (!product) return fail(400, { error: 'Product not found.' });

      // Duplicate serial check
      const duplicate = devCouponSubmissions.find(s => s.serial === serial);
      if (duplicate) return fail(400, { error: `Serial ${serial} has already been submitted.` });

      // Save submission
      const submissionId = crypto.randomUUID();
      devCouponSubmissions.push({
        id: submissionId,
        retailer_id: session.retailer_id,
        product_id: productId,
        claim_id: null,
        serial,
        photo_url: 'dev-placeholder',
        created_at: new Date().toISOString()
      });

      // Count unlinked submissions for this retailer+product
      const unlinked = devCouponSubmissions.filter(
        s => s.retailer_id === session.retailer_id && s.product_id === productId && s.claim_id === null
      );
      const newCount = unlinked.length;
      const qualified = newCount >= product.coupons_required;

      if (qualified) {
        const claimId = crypto.randomUUID();
        // Link all unlinked submissions to new claim
        unlinked.forEach(s => { s.claim_id = claimId; });
        devClaims.unshift({
          id: claimId,
          retailer_id: session.retailer_id,
          product_id: productId,
          product_name: product.name,
          status: 'pending',
          rejection_reason: null,
          created_at: new Date().toISOString(),
          serials: unlinked.map(s => s.serial)
        });
      }

      return {
        saved: true,
        newCount: qualified ? product.coupons_required : newCount,
        required: product.coupons_required,
        qualified,
        cashback: product.cashback_amount
      };
    }

    // ── Production path ──────────────────────────────────────────────────────
    const supabase = getServiceClient();

    const { data: product } = await supabase
      .from('products').select('*').eq('id', productId).eq('active', true).single();
    if (!product) return fail(400, { error: 'Product not found.' });

    const photo = formData.get('photo') as File;
    if (!photo || photo.size === 0) return fail(400, { error: 'Photo is required.' });
    if (photo.size > 10 * 1024 * 1024) return fail(400, { error: 'Photo must be less than 10MB.' });

    // Duplicate serial check
    const { data: existing } = await supabase
      .from('coupon_submissions').select('serial').eq('serial', serial).maybeSingle();
    if (existing) return fail(400, { error: `Serial ${serial} has already been submitted.` });

    const submissionId = crypto.randomUUID();
    const photoPath = `submissions/${submissionId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('coupon-photos')
      .upload(photoPath, new Uint8Array(await photo.arrayBuffer()), { contentType: photo.type });
    if (uploadError) return fail(500, { error: 'Failed to upload photo.' });

    const { error: insertError } = await supabase
      .from('coupon_submissions')
      .insert({ id: submissionId, retailer_id: session.retailer_id, product_id: productId, photo_url: photoPath, serial, claim_id: null });
    if (insertError) {
      await supabase.storage.from('coupon-photos').remove([photoPath]);
      return fail(500, { error: 'Failed to save coupon.' });
    }

    // Count unlinked submissions
    const { data: unlinked } = await supabase
      .from('coupon_submissions')
      .select('id')
      .eq('retailer_id', session.retailer_id)
      .eq('product_id', productId)
      .is('claim_id', null);

    const newCount = (unlinked ?? []).length;
    const qualified = newCount >= product.coupons_required;

    if (qualified) {
      const claimId = crypto.randomUUID();
      await supabase.from('claims').insert({
        id: claimId,
        retailer_id: session.retailer_id,
        product_id: productId,
        status: 'pending'
      });
      // Link all unlinked submissions to the new claim
      const unlinkedIds = (unlinked ?? []).map(r => r.id);
      await supabase.from('coupon_submissions').update({ claim_id: claimId }).in('id', unlinkedIds);
    }

    return {
      saved: true,
      newCount: qualified ? product.coupons_required : newCount,
      required: product.coupons_required,
      qualified,
      cashback: product.cashback_amount
    };
  }
} satisfies Actions;
