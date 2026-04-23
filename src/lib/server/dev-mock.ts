// Dev-only mock data — never imported in production (all callers guard with `if (dev)`)
import { dev } from '$app/environment';

if (!dev) throw new Error('dev-mock imported outside dev mode');

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();

export const MOCK_RETAILERS = [
	{ id: 'ret-1',  name: 'Sharma Medical Store', mobile: '9876543210', city: 'Mumbai',     state: 'Maharashtra',   upi_id: 'sharma.medical@upi', registered_at: daysAgo(90), total_claims: 8,  cashback_earned: 340 },
	{ id: 'ret-2',  name: 'Patel Pharma',          mobile: '9876543211', city: 'Ahmedabad',  state: 'Gujarat',       upi_id: 'patelpharma@upi',    registered_at: daysAgo(85), total_claims: 5,  cashback_earned: 450 },
	{ id: 'ret-3',  name: 'Gupta Drug House',      mobile: '9876543212', city: 'Delhi',      state: 'Delhi',         upi_id: 'gupta.drugs@upi',    registered_at: daysAgo(80), total_claims: 12, cashback_earned: 280 },
	{ id: 'ret-4',  name: 'Singh Medicals',        mobile: '9876543213', city: 'Chandigarh', state: 'Punjab',        upi_id: 'singhmed@upi',       registered_at: daysAgo(75), total_claims: 3,  cashback_earned: 120 },
	{ id: 'ret-5',  name: 'Verma Health Care',     mobile: '9876543214', city: 'Jaipur',     state: 'Rajasthan',     upi_id: 'vermahealth@upi',    registered_at: daysAgo(70), total_claims: 6,  cashback_earned: 360 },
	{ id: 'ret-6',  name: 'Khan Medical Centre',   mobile: '9876543215', city: 'Hyderabad',  state: 'Telangana',     upi_id: 'khanmedical@upi',    registered_at: daysAgo(65), total_claims: 9,  cashback_earned: 520 },
	{ id: 'ret-7',  name: 'Reddy Pharma Stores',   mobile: '9876543216', city: 'Bangalore',  state: 'Karnataka',     upi_id: 'reddypharma@upi',    registered_at: daysAgo(60), total_claims: 4,  cashback_earned: 200 },
	{ id: 'ret-8',  name: 'Joshi Chemist',         mobile: '9876543217', city: 'Pune',       state: 'Maharashtra',   upi_id: 'joshichemist@upi',   registered_at: daysAgo(55), total_claims: 7,  cashback_earned: 560 },
	{ id: 'ret-9',  name: 'Mehta Medicines',       mobile: '9876543218', city: 'Surat',      state: 'Gujarat',       upi_id: 'mehtamed@upi',       registered_at: daysAgo(50), total_claims: 2,  cashback_earned: 60  },
	{ id: 'ret-10', name: 'Agarwal Drug Store',    mobile: '9876543219', city: 'Lucknow',    state: 'Uttar Pradesh', upi_id: 'agarwaldrug@upi',    registered_at: daysAgo(45), total_claims: 5,  cashback_earned: 250 },
];

export const MOCK_PAYOUT_HISTORY = [
	{ id: 'ph-1', exported_at: daysAgo(23), claims_count: 24, total_amount: 1680, filename: 'payout_20260331.csv' },
	{ id: 'ph-2', exported_at: daysAgo(53), claims_count: 18, total_amount: 1140, filename: 'payout_20260228.csv' },
	{ id: 'ph-3', exported_at: daysAgo(85), claims_count: 12, total_amount:  720, filename: 'payout_20260131.csv' },
];

export const MOCK_PRODUCTS = [
	{ id: 'prod-1', name: 'PiiCure 500mg',     coupons_required: 5,  cashback_amount: 50,  active: true,  created_at: daysAgo(60) },
	{ id: 'prod-2', name: 'PiiRelief Syrup',   coupons_required: 3,  cashback_amount: 30,  active: true,  created_at: daysAgo(60) },
	{ id: 'prod-3', name: 'PiiShield Tablets', coupons_required: 10, cashback_amount: 100, active: true,  created_at: daysAgo(60) },
	{ id: 'prod-4', name: 'PiiCalm Drops',     coupons_required: 4,  cashback_amount: 40,  active: true,  created_at: daysAgo(60) },
	{ id: 'prod-5', name: 'PiiVita Capsules',  coupons_required: 2,  cashback_amount: 20,  active: true,  created_at: daysAgo(60) },
	{ id: 'prod-6', name: 'PiiBoost Sachets',  coupons_required: 6,  cashback_amount: 60,  active: false, created_at: daysAgo(60) },
];

export const MOCK_CLAIMS = [
	// Pending
	{ id: 'claim-1', status: 'pending' as const, created_at: hoursAgo(2),  rejection_reason: null, retailer_name: 'Sharma Medical Store',  product_id: 'prod-1', product_name: 'PiiCure 500mg',     serial_count: 5,  photo_signed_url: 'https://placehold.co/400x300/e8f5e9/2e7d32?text=Coupon+Photo', retailer: { name: 'Sharma Medical Store',  city: 'Mumbai',     state: 'Maharashtra', upi_id: 'sharma.medical@upi',  mobile: '9876543210' }, product: { name: 'PiiCure 500mg',     cashback_amount: 50  }, serials: ['SN-PIICURE-001','SN-PIICURE-002','SN-PIICURE-003','SN-PIICURE-004','SN-PIICURE-005'] },
	{ id: 'claim-2', status: 'pending' as const, created_at: hoursAgo(4),  rejection_reason: null, retailer_name: 'Patel Pharma',           product_id: 'prod-3', product_name: 'PiiShield Tablets', serial_count: 10, photo_signed_url: 'https://placehold.co/400x300/e3f2fd/1565c0?text=Coupon+Photo', retailer: { name: 'Patel Pharma',           city: 'Ahmedabad',  state: 'Gujarat',     upi_id: 'patelpharma@upi',     mobile: '9876543211' }, product: { name: 'PiiShield Tablets', cashback_amount: 100 }, serials: ['SN-PIISHIELD-001','SN-PIISHIELD-002','SN-PIISHIELD-003','SN-PIISHIELD-004','SN-PIISHIELD-005','SN-PIISHIELD-006','SN-PIISHIELD-007','SN-PIISHIELD-008','SN-PIISHIELD-009','SN-PIISHIELD-010'] },
	{ id: 'claim-3', status: 'pending' as const, created_at: hoursAgo(6),  rejection_reason: null, retailer_name: 'Gupta Drug House',       product_id: 'prod-2', product_name: 'PiiRelief Syrup',   serial_count: 3,  photo_signed_url: 'https://placehold.co/400x300/fff3e0/e65100?text=Coupon+Photo', retailer: { name: 'Gupta Drug House',       city: 'Delhi',      state: 'Delhi',       upi_id: 'gupta.drugs@upi',     mobile: '9876543212' }, product: { name: 'PiiRelief Syrup',   cashback_amount: 30  }, serials: ['SN-PIIRELIEF-001','SN-PIIRELIEF-002','SN-PIIRELIEF-003'] },
	{ id: 'claim-4', status: 'pending' as const, created_at: hoursAgo(8),  rejection_reason: null, retailer_name: 'Singh Medicals',         product_id: 'prod-5', product_name: 'PiiVita Capsules',  serial_count: 2,  photo_signed_url: 'https://placehold.co/400x300/fce4ec/880e4f?text=Coupon+Photo', retailer: { name: 'Singh Medicals',         city: 'Chandigarh', state: 'Punjab',      upi_id: 'singhmed@upi',        mobile: '9876543213' }, product: { name: 'PiiVita Capsules',  cashback_amount: 20  }, serials: ['SN-PIIVITA-001','SN-PIIVITA-002'] },
	{ id: 'claim-5', status: 'pending' as const, created_at: daysAgo(1),   rejection_reason: null, retailer_name: 'Verma Health Care',      product_id: 'prod-6', product_name: 'PiiBoost Sachets',  serial_count: 6,  photo_signed_url: 'https://placehold.co/400x300/f3e5f5/6a1b9a?text=Coupon+Photo', retailer: { name: 'Verma Health Care',      city: 'Jaipur',     state: 'Rajasthan',   upi_id: 'vermahealth@upi',     mobile: '9876543214' }, product: { name: 'PiiBoost Sachets',  cashback_amount: 60  }, serials: ['SN-PIIBOOST-001','SN-PIIBOOST-002','SN-PIIBOOST-003','SN-PIIBOOST-004','SN-PIIBOOST-005','SN-PIIBOOST-006'] },
	// Approved
	{ id: 'claim-6', status: 'approved' as const, created_at: daysAgo(3),  rejection_reason: null, retailer_name: 'Khan Medical Centre',   product_id: 'prod-1', product_name: 'PiiCure 500mg',     serial_count: 5,  photo_signed_url: 'https://placehold.co/400x300/e8f5e9/2e7d32?text=Coupon+Photo', retailer: { name: 'Khan Medical Centre',    city: 'Hyderabad',  state: 'Telangana',   upi_id: 'khanmedical@upi',     mobile: '9876543215' }, product: { name: 'PiiCure 500mg',     cashback_amount: 50  }, serials: ['SN-PIICURE-A01','SN-PIICURE-A02','SN-PIICURE-A03','SN-PIICURE-A04','SN-PIICURE-A05'] },
	{ id: 'claim-7', status: 'approved' as const, created_at: daysAgo(4),  rejection_reason: null, retailer_name: 'Reddy Pharma Stores',   product_id: 'prod-4', product_name: 'PiiCalm Drops',     serial_count: 4,  photo_signed_url: 'https://placehold.co/400x300/e3f2fd/1565c0?text=Coupon+Photo', retailer: { name: 'Reddy Pharma Stores',    city: 'Bangalore',  state: 'Karnataka',   upi_id: 'reddypharma@upi',     mobile: '9876543216' }, product: { name: 'PiiCalm Drops',     cashback_amount: 40  }, serials: ['SN-PIICALM-001','SN-PIICALM-002','SN-PIICALM-003','SN-PIICALM-004'] },
	{ id: 'claim-8', status: 'approved' as const, created_at: daysAgo(5),  rejection_reason: null, retailer_name: 'Joshi Chemist',         product_id: 'prod-3', product_name: 'PiiShield Tablets', serial_count: 10, photo_signed_url: 'https://placehold.co/400x300/fff3e0/e65100?text=Coupon+Photo', retailer: { name: 'Joshi Chemist',          city: 'Pune',       state: 'Maharashtra', upi_id: 'joshichemist@upi',    mobile: '9876543217' }, product: { name: 'PiiShield Tablets', cashback_amount: 100 }, serials: ['SN-PIISHLD-A01','SN-PIISHLD-A02','SN-PIISHLD-A03'] },
	// Rejected
	{ id: 'claim-9', status: 'rejected' as const, created_at: daysAgo(6),  rejection_reason: 'Photo is blurry, coupon serial not visible', retailer_name: 'Mehta Medicines',      product_id: 'prod-2', product_name: 'PiiRelief Syrup',  serial_count: 3,  photo_signed_url: 'https://placehold.co/400x300/fce4ec/880e4f?text=Rejected+Photo', retailer: { name: 'Mehta Medicines',        city: 'Surat',      state: 'Gujarat',     upi_id: 'mehtamed@upi',        mobile: '9876543218' }, product: { name: 'PiiRelief Syrup',   cashback_amount: 30  }, serials: ['SN-PIIREL-B01','SN-PIIREL-B02','SN-PIIREL-B03'] },
	{ id: 'claim-10', status: 'rejected' as const, created_at: daysAgo(7), rejection_reason: 'Duplicate coupon serial number detected',    retailer_name: 'Agarwal Drug Store',   product_id: 'prod-5', product_name: 'PiiVita Capsules', serial_count: 2,  photo_signed_url: 'https://placehold.co/400x300/f3e5f5/6a1b9a?text=Rejected+Photo', retailer: { name: 'Agarwal Drug Store',     city: 'Lucknow',    state: 'Uttar Pradesh', upi_id: 'agarwaldrug@upi',   mobile: '9876543219' }, product: { name: 'PiiVita Capsules',  cashback_amount: 20  }, serials: ['SN-PIIVIT-B01','SN-PIIVIT-B02'] },
	// Paid
	{ id: 'claim-11', status: 'paid' as const, created_at: daysAgo(12),    rejection_reason: null, retailer_name: 'Sharma Medical Store',  product_id: 'prod-6', product_name: 'PiiBoost Sachets',  serial_count: 6,  photo_signed_url: 'https://placehold.co/400x300/e8f5e9/2e7d32?text=Coupon+Photo', retailer: { name: 'Sharma Medical Store',  city: 'Mumbai',     state: 'Maharashtra', upi_id: 'sharma.medical@upi',  mobile: '9876543210' }, product: { name: 'PiiBoost Sachets',  cashback_amount: 60  }, serials: ['SN-PIIBOOST-P01','SN-PIIBOOST-P02','SN-PIIBOOST-P03','SN-PIIBOOST-P04','SN-PIIBOOST-P05','SN-PIIBOOST-P06'] },
	{ id: 'claim-12', status: 'paid' as const, created_at: daysAgo(15),    rejection_reason: null, retailer_name: 'Patel Pharma',          product_id: 'prod-1', product_name: 'PiiCure 500mg',     serial_count: 5,  photo_signed_url: 'https://placehold.co/400x300/e3f2fd/1565c0?text=Coupon+Photo', retailer: { name: 'Patel Pharma',           city: 'Ahmedabad',  state: 'Gujarat',     upi_id: 'patelpharma@upi',     mobile: '9876543211' }, product: { name: 'PiiCure 500mg',     cashback_amount: 50  }, serials: ['SN-PIICURE-P01','SN-PIICURE-P02','SN-PIICURE-P03','SN-PIICURE-P04','SN-PIICURE-P05'] },
];
