import type { PageServerLoad } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const tab = url.searchParams.get('tab') ?? 'pending'; // 'pending' | 'all'
	const productFilter = url.searchParams.get('product') ?? '';
	const statusFilter  = url.searchParams.get('status') ?? '';
	const sort          = url.searchParams.get('sort') ?? 'newest'; // 'newest' | 'oldest'

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
			coupon_submissions ( id )
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
			serial_count:     Array.isArray(c.coupon_submissions) ? c.coupon_submissions.length : 0,
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
