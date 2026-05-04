import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const supabase = getServiceClient();

  const { data: retailer } = await supabase
    .from('retailers').select('name').eq('id', session.retailer_id).single();
  if (!retailer?.name) redirect(303, '/app/register');

  const { data: products } = await supabase
    .from('products').select('*').eq('active', true).order('name');

  const { data: counts } = await supabase
    .from('coupon_submissions')
    .select('product_id')
    .eq('retailer_id', session.retailer_id)
    .is('claim_id', null);

  const { data: activeClaims } = await supabase
    .from('claims')
    .select('product_id')
    .eq('retailer_id', session.retailer_id)
    .in('status', ['pending', 'approved']);

  const countByProduct = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.product_id] = (acc[row.product_id] ?? 0) + 1;
    return acc;
  }, {});

  const activeClaimProducts = new Set((activeClaims ?? []).map(c => c.product_id));

  const enriched = (products ?? []).map(p => ({
    ...p,
    submitted_count: countByProduct[p.id] ?? 0,
    has_active_claim: activeClaimProducts.has(p.id)
  }));

  return { products: enriched };
};
