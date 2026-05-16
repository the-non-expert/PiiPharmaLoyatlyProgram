-- ═══════════════════════════════════════════════════════════════════════════
-- PiiPharma Retailer Loyalty Program — Production Schema
-- Paste this entire file into the Supabase SQL Editor on your new project.
-- Run once. Idempotent via IF NOT EXISTS / ON CONFLICT.
-- Admin login: admin@piipharma.com / admin123
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- 0. Enum
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
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists coupon_submissions (
  id          uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  claim_id    uuid references claims(id) on delete set null,
  photo_url   text,
  serial      text unique not null,
  created_at  timestamptz default now()
);

create index if not exists coupon_submissions_retailer_product_idx
  on coupon_submissions(retailer_id, product_id);
create index if not exists coupon_submissions_claim_idx
  on coupon_submissions(claim_id);


-- ─────────────────────────────────────────────────────────────────────────
-- 5. Serial Numbers
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
-- 10. QR Batches (issue #23)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists qr_batches (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references products(id) on delete restrict,
  batch_label      text not null,
  serial_prefix    text not null,
  quantity         int  not null check (quantity >= 1),
  serial_start     text not null,
  serial_end       text not null,
  serial_start_num int  not null,
  created_at       timestamptz default now()
);

create index if not exists qr_batches_product_id_idx on qr_batches(product_id);
create index if not exists qr_batches_prefix_idx     on qr_batches(serial_prefix);


-- ─────────────────────────────────────────────────────────────────────────
-- 11. QR Serials (issue #23)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists qr_serials (
  id         uuid primary key default gen_random_uuid(),
  batch_id   uuid not null references qr_batches(id) on delete cascade,
  serial     text unique not null,
  hmac       text not null,
  created_at timestamptz default now()
);

create index if not exists qr_serials_batch_id_idx      on qr_serials(batch_id);
-- text_pattern_ops lets LIKE 'PREFIX-%' queries use this index
create index if not exists qr_serials_serial_prefix_idx on qr_serials(serial text_pattern_ops);


-- ─────────────────────────────────────────────────────────────────────────
-- 12. Row Level Security
--     All queries go through the service-role key server-side.
--     Anon gets no direct access to any table.
-- ─────────────────────────────────────────────────────────────────────────
alter table retailers          enable row level security;
alter table products           enable row level security;
alter table claims             enable row level security;
alter table coupon_submissions enable row level security;
alter table serial_numbers     enable row level security;
alter table otp_codes          enable row level security;
alter table retailer_sessions  enable row level security;
alter table admins             enable row level security;
alter table admin_sessions     enable row level security;
alter table qr_batches         enable row level security;
alter table qr_serials         enable row level security;


-- ─────────────────────────────────────────────────────────────────────────
-- 13. Storage bucket: coupon-photos (private)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('coupon-photos', 'coupon-photos', false)
on conflict (id) do nothing;


-- ─────────────────────────────────────────────────────────────────────────
-- 14. Admin user
--     password: admin123
--     hash: bcrypt.hashSync('admin123', 10)
-- ─────────────────────────────────────────────────────────────────────────
insert into admins (id, email, password_hash) values
  ('00000000-0000-0000-0000-000000000001',
   'admin@piipharma.com',
   '$2b$10$3N/2jR5bODDbfAskivF7COynF2aNKcA/e7oHb1oMtm7yEWGFOE6XG')
on conflict (email) do nothing;


-- ═══════════════════════════════════════════════════════════════════════════
-- Done. All tables created, RLS enabled, storage bucket ready.
-- Add products via the admin UI at /admin/products after first login.
-- ═══════════════════════════════════════════════════════════════════════════
