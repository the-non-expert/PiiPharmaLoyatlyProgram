// In-memory store for dev/testing only. All call sites guard with `if (dev)`.

export interface DevRetailer {
	id: string;
	name: string | null;
	mobile?: string;
	city?: string;
	state?: string;
	upi_id?: string;
}

export interface DevProduct {
	id: string;
	name: string;
	coupons_required: number;
	cashback_amount: number;
	active: boolean;
}

export interface DevCouponSubmission {
	id: string;
	retailer_id: string;
	product_id: string;
	claim_id: string | null;
	serial: string;
	photo_url: string;
	created_at: string;
}

export interface DevClaim {
	id: string;
	retailer_id: string;
	product_id: string;
	product_name: string;
	status: 'pending' | 'approved' | 'rejected' | 'paid';
	rejection_reason: string | null;
	created_at: string;
	serials: string[];
}

export const devRetailers = new Map<string, DevRetailer>();

export const devCouponSubmissions: DevCouponSubmission[] = [];

export const devClaims: DevClaim[] = [];

export const devProducts: DevProduct[] = [
	{ id: 'prod-1', name: 'PiiPharma Paracetamol 500mg', coupons_required: 3, cashback_amount: 30, active: true },
	{ id: 'prod-2', name: 'PiiPharma Amoxicillin 250mg', coupons_required: 5, cashback_amount: 50, active: true },
	{ id: 'prod-3', name: 'PiiPharma Cetirizine 10mg',   coupons_required: 2, cashback_amount: 20, active: true },
	{ id: 'prod-4', name: 'PiiPharma Omeprazole 20mg',   coupons_required: 4, cashback_amount: 40, active: true },
];
