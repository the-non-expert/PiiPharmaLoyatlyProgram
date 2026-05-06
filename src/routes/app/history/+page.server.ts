import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const supabase = getServiceClient();

  const { data: claims } = await supabase
    .from('claims')
    .select(`
      id,
      status,
      rejection_reason,
      created_at,
      products (name, cashback_amount),
      coupon_submissions (serial)
    `)
    .eq('retailer_id', session.retailer_id)
    .order('created_at', { ascending: false });

  const formattedClaims = (claims || []).map(claim => {
    const product = Array.isArray(claim.products) ? claim.products[0] : claim.products;
    return {
      id: claim.id,
      product_name: product?.name || 'Unknown Product',
      cashback_amount: (product as any)?.cashback_amount ?? 0,
      status: claim.status,
      rejection_reason: claim.rejection_reason,
      created_at: claim.created_at,
      serials: claim.coupon_submissions?.map((cs: { serial: string }) => cs.serial) || []
    };
  });

  return { claims: formattedClaims };
};
