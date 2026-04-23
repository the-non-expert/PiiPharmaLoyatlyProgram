# T001 — Database Schema & Supabase Setup

**Depends on:** nothing (first ticket)
**Stories covered:** all domains (foundational)

## Goal
Create all Supabase tables, RLS policies, and storage bucket. Everything else depends on this.

## Tasks

- [ ] Create `retailers` table: `id (uuid pk)`, `mobile (text unique)`, `name (text)`, `city (text)`, `state (text)`, `upi_id (text)`, `created_at`
- [ ] Create `products` table: `id (uuid pk)`, `name (text)`, `coupons_required (int)`, `cashback_amount (int)`, `active (bool default true)`, `created_at`
- [ ] Create `claims` table: `id (uuid pk)`, `retailer_id (uuid fk)`, `product_id (uuid fk)`, `photo_url (text)`, `status (text: pending|approved|rejected|paid)`, `rejection_reason (text nullable)`, `approved_at`, `paid_at`, `created_at`
- [ ] Create `serial_numbers` table: `serial (text pk)`, `claim_id (uuid fk)`, `product_id (uuid fk)`, `created_at`
- [ ] Create `admin_sessions` table: `id (uuid pk)`, `email (text)`, `expires_at (timestamptz)`, `created_at`
- [ ] Create `retailer_sessions` table: `id (uuid pk)`, `retailer_id (uuid fk)`, `expires_at (timestamptz)`, `created_at`
- [ ] Create `otp_codes` table: `mobile (text pk)`, `code (text)`, `expires_at (timestamptz)`, `attempts (int default 0)`, `created_at`
- [ ] Seed admin credentials: insert one row into `admins` table (`id`, `email`, `password_hash`)
- [ ] Create `coupon-photos` storage bucket (private)
- [ ] Add RLS policy: authenticated uploads only to `coupon-photos` bucket
- [ ] Enable RLS on all tables — service role key used server-side bypasses RLS cleanly
- [ ] Generate TypeScript types: `npx supabase gen types typescript --local > src/lib/types/database.ts`

## Notes
- All DB access is server-side via service role key — anon key only used for storage signed URLs
- `serial_numbers` table is the deduplication source of truth
- `status` on claims uses text not enum for flexibility
