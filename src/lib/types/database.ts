// Auto-generate this file with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/types/database.ts
// Manual types below match the migration exactly — replace once connected to a real project.

export type ClaimStatus = 'pending' | 'pending_payout' | 'approved' | 'rejected' | 'paid';

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

export interface CashbackPlan {
  id: string;
  name: string;
  cashback_amount: number;
  active: boolean;
  created_at: string;
}

export interface CashbackPlanLeg {
  id: string;
  plan_id: string;
  product_id: string;
  coupons_required: number;
}

// One row per physical coupon submitted by a retailer.
// claim_id is null until the retailer accumulates enough coupons across all
// legs of a plan; at that point a Claim is auto-created and qualifying
// submissions are linked.
export interface CouponSubmission {
  id: string;
  retailer_id: string;
  product_id: string;
  claim_id: string | null;
  photo_url: string;
  serial: string;
  created_at: string;
}

// Auto-created when all legs of a cashback plan are satisfied.
// plan_id is the authoritative FK; product_id is nullable legacy.
export interface Claim {
  id: string;
  retailer_id: string;
  plan_id: string | null;
  product_id: string | null;
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

export interface QrBatch {
  id: string;
  product_id: string;
  batch_label: string;
  serial_prefix: string;
  quantity: number;
  serial_start: string;
  serial_end: string;
  serial_start_num: number;
  created_at: string;
}

export interface QrSerial {
  id: string;
  batch_id: string;
  serial: string;
  hmac: string;
  created_at: string;
}

// Joined types used in server load functions

export interface CashbackPlanLegWithProduct extends CashbackPlanLeg {
  product: Pick<Product, 'name'>;
}

export interface CashbackPlanWithLegs extends CashbackPlan {
  legs: CashbackPlanLegWithProduct[];
}

export interface ClaimWithDetails extends Claim {
  retailer: Pick<Retailer, 'name' | 'city' | 'state' | 'upi_id' | 'mobile'>;
  plan: Pick<CashbackPlan, 'name' | 'cashback_amount'>;
  legs: Array<Pick<CashbackPlanLeg, 'product_id' | 'coupons_required'> & { product_name: string }>;
  submissions: Array<{ serial: string; photo_url: string }>;
}

// Per-plan progress for the retailer home page
export interface PlanWithProgress extends CashbackPlanWithLegs {
  // Per-leg: how many unlinked submissions this retailer has for that product
  leg_progress: Array<{
    product_id: string;
    product_name: string;
    submitted: number;
    required: number;
  }>;
  has_active_claim: boolean;
  active_claim_count: number;
  active_claim_total_cashback: number;
  is_combo: boolean; // legs.length > 1
}
