import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const supabase = getServiceClient();

  const { data: retailer } = await supabase
    .from('retailers').select('name').eq('id', session.retailer_id).single() as any;
  if (!(retailer as any)?.name) redirect(303, '/app/register');

  const retailerName = (retailer as any).name as string;
  const initials = retailerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  const plansWithStats = (async () => {
    const [
      { data: rawPlans },
      { data: rawLegs },
      { data: unlinkedSubs },
      { data: activeClaims },
      { data: earnedClaims },
      { count: totalSubmissions },
    ] = await Promise.all([
      (supabase as any).from('cashback_plans').select('*').eq('active', true).order('name'),
      (supabase as any).from('cashback_plan_legs').select('plan_id, product_id, coupons_required, products(name)'),
      supabase.from('coupon_submissions').select('product_id').eq('retailer_id', session.retailer_id).is('claim_id', null),
      supabase.from('claims').select('plan_id, status').eq('retailer_id', session.retailer_id).in('status', ['pending', 'pending_payout', 'approved']).not('plan_id', 'is', null),
      supabase.from('claims').select('plan_id').eq('retailer_id', session.retailer_id).in('status', ['pending_payout', 'approved', 'paid']).not('plan_id', 'is', null),
      supabase.from('coupon_submissions').select('*', { count: 'exact', head: true }).eq('retailer_id', session.retailer_id),
    ]);

    // Count unlinked submissions per product
    const countByProduct = ((unlinkedSubs ?? []) as Array<any>).reduce<Record<string, number>>((acc, row) => {
      acc[row.product_id] = (acc[row.product_id] ?? 0) + 1;
      return acc;
    }, {});

    // Group legs by plan
    const legsByPlan = (rawLegs ?? []).reduce<Record<string, Array<{
      product_id: string; product_name: string; coupons_required: number;
    }>>>((acc, l) => {
      const name = Array.isArray(l.products) ? (l.products[0] as any)?.name : (l.products as any)?.name;
      acc[l.plan_id] = [...(acc[l.plan_id] ?? []), {
        product_id: l.product_id,
        product_name: name ?? '—',
        coupons_required: l.coupons_required,
      }];
      return acc;
    }, {});

    // Active claims per plan
    const activeClaimsByPlan = (activeClaims ?? []).reduce<Record<string, number>>((acc, c) => {
      if (c.plan_id) acc[c.plan_id] = (acc[c.plan_id] ?? 0) + 1;
      return acc;
    }, {});

    // Earned cashback from paid/approved claims
    const planCashbackMap = new Map((rawPlans ?? []).map(p => [p.id, p.cashback_amount]));
    const cashbackEarned = (earnedClaims ?? []).reduce(
      (sum, c) => sum + (c.plan_id ? (planCashbackMap.get(c.plan_id) ?? 0) : 0), 0
    );

    const plans = (rawPlans ?? []).map(plan => {
      const legs = legsByPlan[plan.id] ?? [];
      const legProgress = legs.map(leg => ({
        product_id:   leg.product_id,
        product_name: leg.product_name,
        submitted:    countByProduct[leg.product_id] ?? 0,
        required:     leg.coupons_required,
      }));

      const totalSubmitted = legProgress.reduce((s, l) => s + l.submitted, 0);
      const activeCount    = activeClaimsByPlan[plan.id] ?? 0;

      return {
        ...plan,
        is_combo:                  legs.length > 1,
        leg_progress:              legProgress,
        has_active_claim:          activeCount > 0,
        active_claim_count:        activeCount,
        active_claim_total_cashback: activeCount * plan.cashback_amount,
        total_submitted:           totalSubmitted,
      };
    });

    // Sort: in-progress first, then processing, then idle
    plans.sort((a, b) => {
      const priority = (p: typeof plans[0]) => {
        if (p.total_submitted > 0 && !p.has_active_claim) return 0;
        if (p.has_active_claim) return 1;
        return 2;
      };
      return priority(a) - priority(b);
    });

    const neverScanned = (totalSubmissions ?? 0) === 0;
    return { plans, cashbackEarned, neverScanned };
  })();

  return { plansWithStats, retailerName, initials };
};
