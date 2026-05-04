-- ═══════════════════════════════════════════════════════════════════════════
-- PiiPharma Retailer Loyalty Program — Complete Schema + Seed (Demo)
-- Run this once in the Supabase SQL Editor. Idempotent via IF NOT EXISTS.
-- Admin login: admin@piipharma.com / admin123
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 0. Enum type
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  create type claim_status as enum ('pending', 'approved', 'rejected', 'paid');
exception when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Retailers
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists retailers (
  id         uuid primary key default gen_random_uuid(),
  mobile     text unique not null,
  name       text,
  city       text,
  state      text,
  upi_id     text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Products
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  coupons_required  int  not null check (coupons_required >= 1),
  cashback_amount   int  not null check (cashback_amount >= 1),
  active            boolean not null default true,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Claims
--    Auto-created server-side when a retailer's unlinked coupon_submissions
--    count reaches products.coupons_required.
--    photo_url: path to the "representative" photo in the claim detail view
--    (populated from the first linked coupon_submission for demo; in prod
--     the admin detail view reads it for a signed URL).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists claims (
  id               uuid primary key default gen_random_uuid(),
  retailer_id      uuid not null references retailers(id) on delete cascade,
  product_id       uuid not null references products(id) on delete restrict,
  photo_url        text,
  status           claim_status not null default 'pending',
  rejection_reason text,
  approved_at      timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz default now()
);

create index if not exists claims_retailer_idx on claims(retailer_id);
create index if not exists claims_status_idx   on claims(status);
create index if not exists claims_product_idx  on claims(product_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Coupon Submissions
--    One row per physical coupon uploaded by a retailer.
--    claim_id is null until the batch triggers auto-claim creation.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists coupon_submissions (
  id          uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  claim_id    uuid references claims(id) on delete set null,
  photo_url   text not null,
  serial      text unique not null,
  created_at  timestamptz default now()
);

create index if not exists coupon_submissions_retailer_product_idx
  on coupon_submissions(retailer_id, product_id);
create index if not exists coupon_submissions_claim_idx
  on coupon_submissions(claim_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Serial Numbers
--    Linked directly to claims for the admin list view query.
--    Populated at the same time as coupon_submissions.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists serial_numbers (
  serial      text primary key,
  claim_id    uuid not null references claims(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  created_at  timestamptz default now()
);

create index if not exists serial_numbers_claim_idx on serial_numbers(claim_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. OTP Codes
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists otp_codes (
  mobile     text primary key,
  code       text not null,
  expires_at timestamptz not null,
  attempts   int not null default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Retailer Sessions
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists retailer_sessions (
  id          uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);

create index if not exists retailer_sessions_retailer_idx on retailer_sessions(retailer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Admins
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Admin Sessions
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists admin_sessions (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid not null references admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists admin_sessions_admin_idx on admin_sessions(admin_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 10. Row Level Security
--     All queries go through the service-role key (server-side only).
--     Anon gets no direct access to any table.
-- ─────────────────────────────────────────────────────────────────────────
alter table retailers         enable row level security;
alter table products          enable row level security;
alter table claims            enable row level security;
alter table coupon_submissions enable row level security;
alter table serial_numbers    enable row level security;
alter table otp_codes         enable row level security;
alter table retailer_sessions enable row level security;
alter table admins            enable row level security;
alter table admin_sessions    enable row level security;

-- No permissive policies added — service role bypasses RLS entirely.
-- If you ever need anon read on products (e.g. public product listing),
-- add a policy here like:
--   create policy "public read products" on products for select using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 11. Storage Bucket: coupon-photos (private)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('coupon-photos', 'coupon-photos', false)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 12. Seed: Admin user
--     password: admin123
--     hash generated with: bcrypt.hashSync('admin123', 10)
-- ─────────────────────────────────────────────────────────────────────────
insert into admins (id, email, password_hash) values
  ('00000000-0000-0000-0000-000000000001',
   'admin@piipharma.com',
   '$2b$10$3N/2jR5bODDbfAskivF7COynF2aNKcA/e7oHb1oMtm7yEWGFOE6XG')
on conflict (email) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 13. Seed: Products
-- ─────────────────────────────────────────────────────────────────────────
insert into products (id, name, coupons_required, cashback_amount, active) values
  ('10000000-0000-0000-0000-000000000001', 'PiiCure 500mg',     5,  50,  true),
  ('10000000-0000-0000-0000-000000000002', 'PiiRelief Syrup',   3,  30,  true),
  ('10000000-0000-0000-0000-000000000003', 'PiiShield Tablets', 10, 100, true),
  ('10000000-0000-0000-0000-000000000004', 'PiiCalm Drops',     4,  40,  true),
  ('10000000-0000-0000-0000-000000000005', 'PiiVita Capsules',  2,  20,  true),
  ('10000000-0000-0000-0000-000000000006', 'PiiBoost Sachets',  6,  60,  true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 14. Seed: Retailers (10 demo stores)
-- ─────────────────────────────────────────────────────────────────────────
insert into retailers (id, mobile, name, city, state, upi_id, created_at) values
  ('20000000-0000-0000-0000-000000000001', '9876543210', 'Sharma Medical Store',  'Mumbai',     'Maharashtra',   'sharma.medical@upi',  now() - interval '30 days'),
  ('20000000-0000-0000-0000-000000000002', '9876543211', 'Patel Pharma',          'Ahmedabad',  'Gujarat',       'patelpharma@upi',     now() - interval '25 days'),
  ('20000000-0000-0000-0000-000000000003', '9876543212', 'Gupta Drug House',      'Delhi',      'Delhi',         'gupta.drugs@upi',     now() - interval '20 days'),
  ('20000000-0000-0000-0000-000000000004', '9876543213', 'Singh Medicals',        'Chandigarh', 'Punjab',        'singhmed@upi',        now() - interval '18 days'),
  ('20000000-0000-0000-0000-000000000005', '9876543214', 'Verma Health Care',     'Jaipur',     'Rajasthan',     'vermahealth@upi',     now() - interval '15 days'),
  ('20000000-0000-0000-0000-000000000006', '9876543215', 'Khan Medical Centre',   'Hyderabad',  'Telangana',     'khanmedical@upi',     now() - interval '12 days'),
  ('20000000-0000-0000-0000-000000000007', '9876543216', 'Reddy Pharma Stores',   'Bangalore',  'Karnataka',     'reddypharma@upi',     now() - interval '10 days'),
  ('20000000-0000-0000-0000-000000000008', '9876543217', 'Joshi Chemist',         'Pune',       'Maharashtra',   'joshichemist@upi',    now() - interval '7 days'),
  ('20000000-0000-0000-0000-000000000009', '9876543218', 'Mehta Medicines',       'Surat',      'Gujarat',       'mehtamed@upi',        now() - interval '5 days'),
  ('20000000-0000-0000-0000-000000000010', '9876543219', 'Agarwal Drug Store',    'Lucknow',    'Uttar Pradesh', 'agarwaldrug@upi',     now() - interval '3 days')
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 15. Seed: Claims (various statuses for realistic admin view)
--     photo_url is a placeholder path — no actual file in storage for demo.
-- ─────────────────────────────────────────────────────────────────────────
insert into claims (id, retailer_id, product_id, photo_url, status, rejection_reason, approved_at, paid_at, created_at) values
  -- Pending
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'demo/placeholder.jpg', 'pending', null, null, null, now() - interval '2 hours'),

  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003',
   'demo/placeholder.jpg', 'pending', null, null, null, now() - interval '4 hours'),

  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002',
   'demo/placeholder.jpg', 'pending', null, null, null, now() - interval '6 hours'),

  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005',
   'demo/placeholder.jpg', 'pending', null, null, null, now() - interval '8 hours'),

  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006',
   'demo/placeholder.jpg', 'pending', null, null, null, now() - interval '1 day'),

  -- Approved (ready for payout export)
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
   'demo/placeholder.jpg', 'approved', null, now() - interval '2 days', null, now() - interval '3 days'),

  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004',
   'demo/placeholder.jpg', 'approved', null, now() - interval '3 days', null, now() - interval '4 days'),

  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003',
   'demo/placeholder.jpg', 'approved', null, now() - interval '1 day', null, now() - interval '5 days'),

  -- Rejected
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002',
   'demo/placeholder.jpg', 'rejected', 'Photo is blurry, coupon serial not visible', null, null, now() - interval '6 days'),

  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005',
   'demo/placeholder.jpg', 'rejected', 'Duplicate coupon serial number detected', null, null, now() - interval '7 days'),

  -- Paid
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006',
   'demo/placeholder.jpg', 'paid', null, now() - interval '10 days', now() - interval '8 days', now() - interval '12 days'),

  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'demo/placeholder.jpg', 'paid', null, now() - interval '14 days', now() - interval '11 days', now() - interval '15 days')
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 16. Seed: Serial Numbers (linked to claims for admin list/detail view)
-- ─────────────────────────────────────────────────────────────────────────
insert into serial_numbers (serial, claim_id, product_id) values
  -- Claim 1 (PiiCure, requires 5)
  ('SN-PIICURE-001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-003', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-004', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-005', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  -- Claim 2 (PiiShield, requires 10)
  ('SN-PIISHIELD-001', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-002', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-004', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-005', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-006', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-007', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-008', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-009', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHIELD-010', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003'),
  -- Claim 3 (PiiRelief, requires 3)
  ('SN-PIIRELIEF-001', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002'),
  ('SN-PIIRELIEF-002', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002'),
  ('SN-PIIRELIEF-003', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002'),
  -- Claim 4 (PiiVita, requires 2)
  ('SN-PIIVITA-001', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005'),
  ('SN-PIIVITA-002', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005'),
  -- Claim 5 (PiiBoost, requires 6)
  ('SN-PIIBOOST-001', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-002', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-003', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-004', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-005', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-006', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006'),
  -- Claim 6 (PiiCure approved)
  ('SN-PIICURE-A01', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-A02', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-A03', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-A04', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-A05', '30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  -- Claim 7 (PiiCalm approved)
  ('SN-PIICALM-001', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004'),
  ('SN-PIICALM-002', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004'),
  ('SN-PIICALM-003', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004'),
  ('SN-PIICALM-004', '30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004'),
  -- Claim 8 (PiiShield approved)
  ('SN-PIISHLD-A01', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHLD-A02', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003'),
  ('SN-PIISHLD-A03', '30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003'),
  -- Claim 9 (PiiRelief rejected)
  ('SN-PIIREL-B01', '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002'),
  ('SN-PIIREL-B02', '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002'),
  ('SN-PIIREL-B03', '30000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002'),
  -- Claim 10 (PiiVita rejected)
  ('SN-PIIVIT-B01', '30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005'),
  ('SN-PIIVIT-B02', '30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005'),
  -- Claim 11 (PiiBoost paid)
  ('SN-PIIBOOST-P01', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-P02', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-P03', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-P04', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-P05', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  ('SN-PIIBOOST-P06', '30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006'),
  -- Claim 12 (PiiCure paid)
  ('SN-PIICURE-P01', '30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-P02', '30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-P03', '30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-P04', '30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001'),
  ('SN-PIICURE-P05', '30000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001')
on conflict (serial) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- 17. Seed: Coupon Submissions
--     Mirror of serial_numbers but in the coupon_submissions table.
--     These are the rows the retailer portal reads/writes.
-- ─────────────────────────────────────────────────────────────────────────
insert into coupon_submissions (retailer_id, product_id, claim_id, photo_url, serial, created_at) values
  -- Claim 1
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo/placeholder.jpg', 'SN-PIICURE-001', now() - interval '3 hours'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo/placeholder.jpg', 'SN-PIICURE-002', now() - interval '3 hours'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo/placeholder.jpg', 'SN-PIICURE-003', now() - interval '2 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo/placeholder.jpg', 'SN-PIICURE-004', now() - interval '2 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'demo/placeholder.jpg', 'SN-PIICURE-005', now() - interval '2 hours'),
  -- Claim 2
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-001', now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-002', now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-003', now() - interval '5 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-004', now() - interval '4 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-005', now() - interval '4 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-006', now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-007', now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-008', now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-009', now() - interval '4 hours'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'demo/placeholder.jpg', 'SN-PIISHIELD-010', now() - interval '4 hours'),
  -- Claim 3
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'demo/placeholder.jpg', 'SN-PIIRELIEF-001', now() - interval '7 hours'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'demo/placeholder.jpg', 'SN-PIIRELIEF-002', now() - interval '6 hours 30 minutes'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'demo/placeholder.jpg', 'SN-PIIRELIEF-003', now() - interval '6 hours'),
  -- Claim 4
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', 'demo/placeholder.jpg', 'SN-PIIVITA-001', now() - interval '9 hours'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', 'demo/placeholder.jpg', 'SN-PIIVITA-002', now() - interval '8 hours'),
  -- Claim 5
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-001', now() - interval '2 days'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-002', now() - interval '2 days'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-003', now() - interval '1 day 12 hours'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-004', now() - interval '1 day 12 hours'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-005', now() - interval '1 day'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000005', 'demo/placeholder.jpg', 'SN-PIIBOOST-006', now() - interval '1 day')
on conflict (serial) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Tables created, RLS enabled, seed data loaded.
-- Next step: go to Supabase dashboard → Settings → API → copy the
--   "service_role" key and add it to your .env as SUPABASE_SERVICE_ROLE_KEY.
-- ═══════════════════════════════════════════════════════════════════════════
