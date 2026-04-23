import { dev } from '$app/environment';
import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const tab = url.searchParams.get('tab') ?? 'pending'; // 'pending' | 'all'
	const productFilter = url.searchParams.get('product') ?? '';
	const statusFilter  = url.searchParams.get('status') ?? '';
	const sort          = url.searchParams.get('sort') ?? 'newest'; // 'newest' | 'oldest'

	if (dev) {
		const { MOCK_CLAIMS, MOCK_PRODUCTS } = await import('$lib/server/dev-mock');

		const mapClaim = (c: typeof MOCK_CLAIMS[0]) => ({
			id:               c.id,
			status:           c.status,
			created_at:       c.created_at,
			rejection_reason: c.rejection_reason,
			retailer_name:    c.retailer_name,
			mobile:           c.retailer.mobile,
			product_id:       c.product_id,
			product_name:     c.product_name,
			cashback_amount:  c.product.cashback_amount,
			serial_count:     c.serial_count,
		});

		let claims = MOCK_CLAIMS.map(mapClaim);

		if (tab === 'pending') {
			claims = claims.filter((c) => c.status === 'pending');
		} else {
			if (statusFilter) claims = claims.filter((c) => c.status === statusFilter);
		}

		if (productFilter) claims = claims.filter((c) => c.product_id === productFilter);
		if (sort === 'oldest') claims.sort((a, b) => a.created_at.localeCompare(b.created_at));
		else                   claims.sort((a, b) => b.created_at.localeCompare(a.created_at));

		return {
			claims,
			products: MOCK_PRODUCTS.map((p) => ({ id: p.id, name: p.name })),
			pendingCount: MOCK_CLAIMS.filter((c) => c.status === 'pending').length,
			tab,
			productFilter,
			statusFilter,
			sort,
		};
	}

	const db = getServiceClient();

	let query = db
		.from('claims')
		.select(`
			id,
			status,
			created_at,
			rejection_reason,
			retailers ( name, mobile ),
			products ( id, name, cashback_amount ),
			serial_numbers ( serial )
		`)
		.order('created_at', { ascending: sort === 'oldest' });

	if (tab === 'pending') {
		query = query.eq('status', 'pending');
	} else if (statusFilter) {
		query = query.eq('status', statusFilter);
	}

	if (productFilter) query = query.eq('product_id', productFilter);

	const [{ data: claims }, { data: products }, { count: pendingCount }] = await Promise.all([
		query,
		db.from('products').select('id, name').order('name'),
		db.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
	]);

	const mapped = (claims ?? []).map((c) => {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const product  = Array.isArray(c.products)  ? c.products[0]  : c.products;
		return {
			id:               c.id,
			status:           c.status,
			created_at:       c.created_at,
			rejection_reason: c.rejection_reason,
			retailer_name:    retailer?.name ?? '—',
			mobile:           retailer?.mobile ?? '—',
			product_id:       product?.id ?? '',
			product_name:     product?.name ?? '—',
			cashback_amount:  product?.cashback_amount ?? 0,
			serial_count:     Array.isArray(c.serial_numbers) ? c.serial_numbers.length : 0,
		};
	});

	return {
		claims: mapped,
		products: products ?? [],
		pendingCount: pendingCount ?? 0,
		tab,
		productFilter,
		statusFilter,
		sort,
	};
};
