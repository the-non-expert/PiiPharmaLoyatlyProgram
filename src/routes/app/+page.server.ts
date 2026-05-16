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

  const retailerName = retailer.name;
  const initials = retailerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  // All four queries are independent — run in parallel, streamed to client.
  const productsWithStats = (async () => {
    const [{ data: products }, { data: counts }, { data: activeClaims }, { data: earnedClaims }] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('name'),
      supabase.from('coupon_submissions').select('product_id').eq('retailer_id', session.retailer_id).is('claim_id', null),
      supabase.from('claims').select('product_id, status').eq('retailer_id', session.retailer_id).in('status', ['pending', 'pending_payout', 'approved']),
      supabase.from('claims').select('product_id').eq('retailer_id', session.retailer_id).in('status', ['pending_payout', 'approved', 'paid']),
    ]);

    const countByProduct = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.product_id] = (acc[row.product_id] ?? 0) + 1;
      return acc;
    }, {});

    const claimStatusByProduct = new Map((activeClaims ?? []).map(c => [c.product_id, c.status]));

    const productCashbackMap = new Map((products ?? []).map(p => [p.id, p.cashback_amount]));
    const cashbackEarned = (earnedClaims ?? []).reduce(
      (sum, c) => sum + (productCashbackMap.get(c.product_id) ?? 0), 0
    );

    const list = (products ?? []).map(p => ({
      ...p,
      submitted_count: countByProduct[p.id] ?? 0,
      has_active_claim: claimStatusByProduct.has(p.id),
      claim_status: claimStatusByProduct.get(p.id) ?? null
    }));

    // Completed products (claim already created) go last
    list.sort((a, b) => Number(a.has_active_claim) - Number(b.has_active_claim));

    return { products: list, cashbackEarned };
  })();

  return { productsWithStats, retailerName, initials };
};
