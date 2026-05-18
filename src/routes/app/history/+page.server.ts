import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
  const session = locals.retailerSession;
  if (!session) redirect(303, '/');

  const supabase = getServiceClient();

  const [{ data: claims }, { data: pendingSubmissions }] = await Promise.all([
    supabase
      .from('claims')
      .select(`
        id,
        status,
        rejection_reason,
        created_at,
        plan_id,
        cashback_plans ( name, cashback_amount ),
        coupon_submissions ( serial )
      `)
      .eq('retailer_id', session.retailer_id)
      .order('created_at', { ascending: false }),

    supabase
      .from('coupon_submissions')
      .select('product_id, products(name, coupons_required, cashback_amount)')
      .eq('retailer_id', session.retailer_id)
      .is('claim_id', null)
  ]);

  const formattedClaims = ((claims || []) as Array<any>).map((claim: any) => {
    const plan = Array.isArray(claim.cashback_plans) ? claim.cashback_plans[0] : claim.cashback_plans;
    return {
      id: claim.id,
      plan_name: plan?.name || 'Unknown Plan',
      cashback_amount: plan?.cashback_amount ?? 0,
      status: claim.status,
      rejection_reason: claim.rejection_reason,
      created_at: claim.created_at,
      serials: claim.coupon_submissions?.map((cs: { serial: string }) => cs.serial) || []
    };
  });

  // Group unlinked submissions by product to build in-progress list
  // (still product-keyed since coupon_submissions is product-keyed)
  const inProgressMap = new Map<string, {
    product_id: string;
    name: string;
    coupons_required: number;
    cashback_amount: number;
    scanned: number;
  }>();

  for (const sub of ((pendingSubmissions || []) as Array<any>)) {
    const product = Array.isArray(sub.products) ? sub.products[0] : sub.products;
    if (!product) continue;
    const pid = sub.product_id;
    if (inProgressMap.has(pid)) {
      inProgressMap.get(pid)!.scanned++;
    } else {
      inProgressMap.set(pid, {
        product_id: pid,
        name: (product as any).name,
        coupons_required: (product as any).coupons_required,
        cashback_amount: (product as any).cashback_amount,
        scanned: 1
      });
    }
  }

  return {
    claims: formattedClaims,
    inProgress: Array.from(inProgressMap.values())
  };
};
