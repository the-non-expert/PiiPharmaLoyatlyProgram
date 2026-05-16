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
			retailers ( id, name, upi_id ),
			products ( name, cashback_amount )
		`)
		.eq('status', 'pending_payout');

	// Group by retailer_id — one transfer per retailer
	const byRetailer = new Map<string, {
		name: string;
		upi_id: string;
		totalAmount: number;
		products: string[];
	}>();

	for (const c of claims ?? []) {
		const retailer = Array.isArray(c.retailers) ? c.retailers[0] : c.retailers;
		const product  = Array.isArray(c.products)  ? c.products[0]  : c.products;
		if (!retailer?.id) continue;

		const existing = byRetailer.get(retailer.id);
		const productName = product?.name ?? 'Unknown';
		const amount = product?.cashback_amount ?? 0;

		if (existing) {
			existing.totalAmount += amount;
			existing.products.push(productName);
		} else {
			byRetailer.set(retailer.id, {
				name:        retailer.name ?? '',
				upi_id:      retailer.upi_id ?? '',
				totalAmount: amount,
				products:    [productName],
			});
		}
	}

	const header = 'name,beneUpiId,amount,transferMode,remarks';
	const csvRows = Array.from(byRetailer.values()).map((r) => {
		const claimCount = r.products.length;
		const remarks = `${claimCount} claim${claimCount !== 1 ? 's' : ''}: ${r.products.join(', ')}`;
		return [
			csvField(r.name),
			csvField(r.upi_id),
			r.totalAmount,
			'UPI',
			csvField(remarks),
		].join(',');
	});
	const csv = [header, ...csvRows].join('\n');

	const date = new Date().toISOString().slice(0, 10);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename="payout-${date}.csv"`
		}
	});
};
