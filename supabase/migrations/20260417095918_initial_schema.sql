-- PiiPharma Retailer Loyalty Program — Initial Schema

-- ─────────────────────────────────────────────
-- Retailers
-- ─────────────────────────────────────────────
create table retailers (
  id         uuid primary key default gen_random_uuid(),
  mobile     text unique not null,
  name       text,
  city       text,
  state      text,
  upi_id     text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────
create table products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  coupons_required  int  not null check (coupons_required >= 1),
  cashback_amount   int  not null check (cashback_amount >= 1),
  active            boolean not null default true,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Claims
-- ─────────────────────────────────────────────
create type claim_status as enum ('pending', 'approved', 'rejected', 'paid');

create table claims (
  id               uuid primary key default gen_random_uuid(),
  retailer_id      uuid not null references retailers(id) on delete cascade,
  product_id       uuid not null references products(id) on delete restrict,
  photo_url        text not null,
  status           claim_status not null default 'pending',
  rejection_reason text,
  approved_at      timestamptz,
  paid_at          timestamptz,
  created_at       timestamptz default now()
);

create index claims_retailer_idx on claims(retailer_id);
create index claims_status_idx   on claims(status);

-- ─────────────────────────────────────────────
-- Serial Numbers (deduplication)
-- ─────────────────────────────────────────────
create table serial_numbers (
  serial     text primary key,
  claim_id   uuid not null references claims(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- OTP Codes
-- ─────────────────────────────────────────────
create table otp_codes (
  mobile     text primary key,
  code       text not null,
  expires_at timestamptz not null,
  attempts   int not null default 0,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Retailer Sessions
-- ─────────────────────────────────────────────
create table retailer_sessions (
  id          uuid primary key default gen_random_uuid(),
  retailer_id uuid not null references retailers(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Admins + Admin Sessions
-- ─────────────────────────────────────────────
create table admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

create table admin_sessions (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid not null references admins(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- RLS — enable on all tables
-- (all access is via service role key server-side; anon gets no direct access)
-- ─────────────────────────────────────────────
alter table retailers         enable row level security;
alter table products          enable row level security;
alter table claims            enable row level security;
alter table serial_numbers    enable row level security;
alter table otp_codes         enable row level security;
alter table retailer_sessions enable row level security;
alter table admins            enable row level security;
alter table admin_sessions    enable row level security;

-- ─────────────────────────────────────────────
-- Storage: coupon-photos bucket (private)
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('coupon-photos', 'coupon-photos', false);