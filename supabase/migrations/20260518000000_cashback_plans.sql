-- Introduces cashback_plans + cashback_plan_legs to replace the
-- "product drives the claim" model. A plan has one or more legs;
-- single-product offers are just plans with one leg.
-- This enables combo cashback offers (e.g. 3×ProductA + 2×ProductB → ₹200).

-- A cashback plan (single-product or combo)
create table cashback_plans (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  cashback_amount int         not null check (cashback_amount >= 1),
  active          boolean     not null default true,
  created_at      timestamptz default now()
);

-- Each leg: one product + how many coupons are required for that leg
create table cashback_plan_legs (
  id               uuid primary key default gen_random_uuid(),
  plan_id          uuid not null references cashback_plans(id) on delete cascade,
  product_id       uuid not null references products(id),
  coupons_required int  not null check (coupons_required >= 1),
  unique (plan_id, product_id)
);

create index cashback_plan_legs_plan_idx    on cashback_plan_legs(plan_id);
create index cashback_plan_legs_product_idx on cashback_plan_legs(product_id);

-- Add plan_id to claims; keep product_id as nullable for legacy reads
alter table claims
  add column plan_id uuid references cashback_plans(id);

alter table claims
  alter column product_id drop not null;

create index claims_plan_idx on claims(plan_id);
