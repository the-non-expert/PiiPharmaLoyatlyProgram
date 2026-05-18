import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const tab         = url.searchParams.get('tab') ?? 'pendingPayout';
	const planFilter  = url.searchParams.get('plan') ?? '';
	const statusFilter = url.searchParams.get('status') ?? '';
	const sort        = url.searchParams.get('sort') ?? 'newest';

	const db = getServiceClient();

	let query = db
		.from('claims')
		.select(`
			id,
			status,
			created_at,
			rejection_reason,
			retailers ( name, mobile ),
			cashback_plans ( id, name, cashback_amount ),
			coupon_submissions ( id )
		`)
		.order('created_at', { ascending: sort === 'oldest' });

	if (tab === 'pendingPayout') {
		query = query.eq('status', 'pending_payout');
	} else if (tab === 'allClaims' && statusFilter) {
		query = query.eq('status', statusFilter);
	}

	if (planFilter) query = query.eq('plan_id', planFilter);

	const [{ data: claims }, { data: plans }, { count: pendingCount }] = await Promise.all([
		query,
		(db as any).from('cashback_plans').select('id, name').order('name'),
		db.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending_payout'),
	]);

	const mapped = ((claims ?? []) as Array<any>).map((c: any) => {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const plan     = Array.isArray(c.cashback_plans) ? c.cashback_plans[0] : c.cashback_plans;
		return {
			id:               c.id,
			status:           c.status,
			created_at:       c.created_at,
			rejection_reason: c.rejection_reason,
			retailer_name:    retailer?.name ?? '—',
			mobile:           retailer?.mobile ?? '—',
			plan_id:          plan?.id ?? '',
			plan_name:        plan?.name ?? '—',
			cashback_amount:  plan?.cashback_amount ?? 0,
			serial_count:     Array.isArray(c.coupon_submissions) ? c.coupon_submissions.length : 0,
		};
	});

	return {
		claims: mapped,
		plans: plans ?? [],
		pendingCount: pendingCount ?? 0,
		tab,
		planFilter,
		statusFilter,
		sort,
	};
};
