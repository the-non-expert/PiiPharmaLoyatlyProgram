import type { RequestHandler } from './$types';
import { getServiceClient } from '$lib/server/supabase';

export const GET: RequestHandler = async () => {
	const db = getServiceClient();

	const { data: claims } = await db
		.from('claims')
		.select(`
			id,
			retailers ( name, upi_id ),
			products ( name, cashback_amount )
		`)
		.eq('status', 'approved');

	const rows = (claims ?? []).map((c) => {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const product = Array.isArray(c.products) ? c.products[0] : c.products;
		return {
			name: retailer?.name ?? '',
			beneUpiId: retailer?.upi_id ?? '',
			amount: product?.cashback_amount ?? 0,
			transferMode: 'UPI',
			remarks: `${product?.name ?? ''} - ${c.id}`
		};
	});

	const header = 'name,beneUpiId,amount,transferMode,remarks';
	const csvRows = rows.map((r) =>
		[r.name, r.beneUpiId, r.amount, r.transferMode, `"${r.remarks.replace(/"/g, '""')}"`].join(',')
	);
	const csv = [header, ...csvRows].join('\n');

	const date = new Date().toISOString().slice(0, 10);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="payout-${date}.csv"`
		}
	});
};
