// Auto-generate this file with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/types/database.ts
// Manual types below match the migration exactly — replace once connected to a real project.

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface Retailer {
  id: string;
  mobile: string;
  name: string | null;
  city: string | null;
  state: string | null;
  upi_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  coupons_required: number;
  cashback_amount: number;
  active: boolean;
  created_at: string;
}

// One row per physical coupon submitted by a retailer.
// claim_id is null until the retailer accumulates enough coupons for a product;
// at that point a Claim is auto-created and all qualifying submissions are linked.
export interface CouponSubmission {
  id: string;
  retailer_id: string;
  product_id: string;
  claim_id: string | null;
  photo_url: string;
  serial: string;
  created_at: string;
}

// Auto-created when a retailer's unlinked CouponSubmission count reaches
// products.coupons_required. Never created manually by the retailer.
export interface Claim {
  id: string;
  retailer_id: string;
  product_id: string;
  status: ClaimStatus;
  rejection_reason: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface OtpCode {
  mobile: string;
  code: string;
  expires_at: string;
  attempts: number;
  created_at: string;
}

export interface RetailerSession {
  id: string;
  retailer_id: string;
  expires_at: string;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  expires_at: string;
  created_at: string;
}

// Joined types used in server load functions
export interface ClaimWithDetails extends Claim {
  retailer: Pick<Retailer, 'name' | 'city' | 'state' | 'upi_id' | 'mobile'>;
  product: Pick<Product, 'name' | 'cashback_amount'>;
  submissions: Array<{ serial: string; photo_url: string }>;
}

export interface ProductWithProgress extends Product {
  submitted_count: number;   // unlinked coupon_submissions for this retailer+product
  has_active_claim: boolean; // a pending/approved claim already exists
}
