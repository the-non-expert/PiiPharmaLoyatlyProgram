import { fail } from '@sveltejs/kit';
import { getServiceClient } from '$lib/server/supabase';

export async function load() {
	const db = getServiceClient();
	const dba = db as any;

	const [{ data: rawPlans }, { data: legs }, { data: claimStats }] = await Promise.all([
		dba.from('cashback_plans').select('*').order('name'),
		dba.from('cashback_plan_legs').select('plan_id, product_id, coupons_required, products(name)'),
		db.from('claims').select('plan_id').not('plan_id', 'is', null),
	]);

	const claimCount = ((claimStats ?? []) as Array<{ plan_id: string | null }>).reduce<Record<string, number>>((acc, c) => {
		if (c.plan_id) acc[c.plan_id] = (acc[c.plan_id] ?? 0) + 1;
		return acc;
	}, {});

	const legsByPlan = ((legs ?? []) as Array<any>).reduce<Record<string, Array<{
		product_id: string; product_name: string; coupons_required: number;
	}>>>((acc, l) => {
		const name = Array.isArray(l.products) ? l.products[0]?.name : l.products?.name;
		acc[l.plan_id] = [...(acc[l.plan_id] ?? []), {
			product_id: l.product_id,
			product_name: name ?? '—',
			coupons_required: l.coupons_required,
		}];
		return acc;
	}, {});

	const plans = ((rawPlans ?? []) as Array<any>).map((p: any) => ({
		...p,
		legs: legsByPlan[p.id] ?? [],
		claims_count: claimCount[p.id] ?? 0,
	}));

	// Products for the leg picker in the create/edit form
	const { data: products } = await db
		.from('products').select('id, name').eq('active', true).order('name');

	return {
		plans: plans as Array<{
			id: string; name: string; cashback_amount: number; active: boolean; created_at: string;
			legs: Array<{ product_id: string; product_name: string; coupons_required: number }>;
			claims_count: number;
		}>,
		products: (products ?? []) as Array<{ id: string; name: string }>,
	};
}

export const actions = {
	create: async ({ request }: { request: Request }) => {
		const db = getServiceClient();
		const dba = db as any;
		const formData = await request.formData();

		const name            = formData.get('name')?.toString().trim();
		const cashback_amount = parseInt(formData.get('cashback_amount')?.toString() || '0');
		const legsJson        = formData.get('legs')?.toString();

		if (!name)              return fail(400, { createError: 'Plan name is required.' });
		if (cashback_amount < 1) return fail(400, { createError: 'Cashback amount must be at least ₹1.' });

		let legRows: Array<{ product_id: string; coupons_required: number }> = [];
		try {
			legRows = JSON.parse(legsJson ?? '[]');
		} catch {
			return fail(400, { createError: 'Invalid legs data.' });
		}

		if (legRows.length === 0)
			return fail(400, { createError: 'At least one product leg is required.' });

		for (const leg of legRows) {
			if (!leg.product_id)        return fail(400, { createError: 'Each leg must have a product.' });
			if (leg.coupons_required < 1) return fail(400, { createError: 'Each leg must require at least 1 coupon.' });
		}

		const { data: plan, error: planError } = await dba
			.from('cashback_plans')
			.insert({ name, cashback_amount, active: true })
			.select('id')
			.single();

		if (planError || !plan) return fail(500, { createError: 'Failed to create plan.' });

		const { error: legsError } = await dba
			.from('cashback_plan_legs')
			.insert(legRows.map((l: any) => ({ plan_id: plan.id, product_id: l.product_id, coupons_required: l.coupons_required })));

		if (legsError) {
			await dba.from('cashback_plans').delete().eq('id', plan.id);
			return fail(500, { createError: 'Failed to save plan legs.' });
		}

		return {};
	},

	toggleActive: async ({ request }: { request: Request }) => {
		const db = getServiceClient();
		const dba = db as any;
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { toggleError: 'Plan ID missing.' });

		const { data: plan } = await dba.from('cashback_plans').select('active').eq('id', id).single();
		if (!plan) return fail(404, { toggleError: 'Plan not found.' });

		const { error } = await dba.from('cashback_plans').update({ active: !plan.active }).eq('id', id);
		if (error) return fail(500, { toggleError: 'Failed to toggle plan status.' });
		return {};
	},
};
