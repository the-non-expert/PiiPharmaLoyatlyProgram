import { dev } from '$app/environment';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	if (dev) {
		const { MOCK_CLAIMS, MOCK_PRODUCTS, MOCK_RETAILERS } = await import('$lib/server/dev-mock');

		const pendingCount  = MOCK_CLAIMS.filter((c) => c.status === 'pending').length;
		const approvedCount = MOCK_CLAIMS.filter((c) => c.status === 'approved').length;
		const totalSubmissions = MOCK_CLAIMS.reduce((s, c) => s + c.serial_count, 0);
		const cashbackQueued = MOCK_CLAIMS
			.filter((c) => c.status === 'approved')
			.reduce((s, c) => s + c.product.cashback_amount, 0);

		const byProduct = MOCK_PRODUCTS.map((p) => {
			const claimsForProduct = MOCK_CLAIMS.filter((c) => c.product_id === p.id);
			return {
				id: p.id,
				name: p.name,
				coupons_required: p.coupons_required,
				pending_claims: claimsForProduct.filter((c) => c.status === 'pending').length,
				approved_claims: claimsForProduct.filter((c) => c.status === 'approved').length,
				total_submissions: claimsForProduct.reduce((s, c) => s + c.serial_count, 0),
			};
		});

		return {
			stats: {
				pendingCount,
				approvedCount,
				totalRetailers: MOCK_RETAILERS.length,
				totalSubmissions,
				cashbackQueued,
			},
			byProduct,
		};
	}

	const db = getServiceClient();

	const [
		{ count: pendingCount },
		{ count: approvedCount },
		{ count: totalRetailers },
		{ data: products },
	] = await Promise.all([
		db.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
		db.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
		db.from('retailers').select('*', { count: 'exact', head: true }),
		db.from('products').select(`
			id, name, coupons_required,
			claims!inner(status),
			coupon_submissions(id)
		`).order('name'),
	]);

	// Cashback queued: sum cashback_amount for approved claims
	const { data: approvedClaims } = await db
		.from('claims')
		.select('products(cashback_amount)')
		.eq('status', 'approved');

	const cashbackQueued = (approvedClaims ?? []).reduce((s: number, c: { products: { cashback_amount: number } | { cashback_amount: number }[] | null }) => {
		const p = Array.isArray(c.products) ? c.products[0] : c.products;
		return s + (p?.cashback_amount ?? 0);
	}, 0);

	const { data: subCounts } = await db
		.from('products')
		.select(`
			id, name, coupons_required,
			claims(status),
			coupon_submissions(id)
		`)
		.order('name');

	const byProduct = (subCounts ?? []).map((p: { id: string; name: string; coupons_required: number; claims: { status: string }[]; coupon_submissions: { id: string }[] }) => ({
		id: p.id,
		name: p.name,
		coupons_required: p.coupons_required,
		pending_claims: (p.claims ?? []).filter((c: { status: string }) => c.status === 'pending').length,
		approved_claims: (p.claims ?? []).filter((c: { status: string }) => c.status === 'approved').length,
		total_submissions: (p.coupon_submissions ?? []).length,
	}));

	const totalSubmissions = byProduct.reduce((s: number, p: { total_submissions: number }) => s + p.total_submissions, 0);

	return {
		stats: {
			pendingCount: pendingCount ?? 0,
			approvedCount: approvedCount ?? 0,
			totalRetailers: totalRetailers ?? 0,
			totalSubmissions,
			cashbackQueued,
		},
		byProduct,
	};
};
