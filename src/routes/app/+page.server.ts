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

  // All queries are independent — run in parallel, streamed to client.
  const productsWithStats = (async () => {
    const [
      { data: products },
      { data: counts },
      { data: activeClaims },
      { data: earnedClaims },
      { count: totalSubmissions },
    ] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('name'),
      supabase.from('coupon_submissions').select('product_id').eq('retailer_id', session.retailer_id).is('claim_id', null),
      supabase.from('claims').select('product_id, status').eq('retailer_id', session.retailer_id).in('status', ['pending', 'pending_payout', 'approved']),
      supabase.from('claims').select('product_id').eq('retailer_id', session.retailer_id).in('status', ['pending_payout', 'approved', 'paid']),
      supabase.from('coupon_submissions').select('*', { count: 'exact', head: true }).eq('retailer_id', session.retailer_id),
    ]);

    const countByProduct = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.product_id] = (acc[row.product_id] ?? 0) + 1;
      return acc;
    }, {});

    // Aggregate active claims per product (handles multiple claims per product)
    const claimsByProduct = (activeClaims ?? []).reduce<Record<string, { count: number }>>((acc, c) => {
      acc[c.product_id] = { count: (acc[c.product_id]?.count ?? 0) + 1 };
      return acc;
    }, {});

    const productCashbackMap = new Map((products ?? []).map(p => [p.id, p.cashback_amount]));
    const cashbackEarned = (earnedClaims ?? []).reduce(
      (sum, c) => sum + (productCashbackMap.get(c.product_id) ?? 0), 0
    );

    const list = (products ?? []).map(p => ({
      ...p,
      submitted_count: countByProduct[p.id] ?? 0,
      has_active_claim: p.id in claimsByProduct,
      claim_count: claimsByProduct[p.id]?.count ?? 0,
      claim_total_cashback: (claimsByProduct[p.id]?.count ?? 0) * p.cashback_amount,
    }));

    // Sort: in-progress first, then processing, then idle/completed
    list.sort((a, b) => {
      const priority = (p: typeof list[0]) => {
        if (p.submitted_count > 0 && !p.has_active_claim) return 0;
        if (p.has_active_claim) return 1;
        return 2;
      };
      return priority(a) - priority(b);
    });

    const neverScanned = (totalSubmissions ?? 0) === 0;
    return { products: list, cashbackEarned, neverScanned };
  })();

  return { productsWithStats, retailerName, initials };
};
