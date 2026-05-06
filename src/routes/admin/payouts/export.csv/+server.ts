import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceClient } from '$lib/server/supabase';

function csvField(value: string | number): string {
	const str = String(value);
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.adminSession) throw error(401, 'Unauthorized');

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
		[csvField(r.name), csvField(r.beneUpiId), r.amount, r.transferMode, csvField(r.remarks)].join(',')
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
