# PiiPharma — Living Schema Reference

Last updated: 2026-05-18 (post `20260518000000_cashback_plans`)

This document is the canonical reference for the current database schema. It must be updated whenever a migration is written. The goal is to capture the *why*, not just the *what* — migration files are append-only and require reading several files in sequence; this document gives the current state in one place.

---

## Enum: `claim_status`

```
pending_payout  → paid
               ↘ rejected
```

- `pending_payout` — auto-set when a claim is created from an HMAC-verified QR scan; ready for CSV export, no manual review step
- `approved` — legacy status from before QR flow; not produced by current code but kept in the enum
- `rejected` — manually set by admin after dispute review
- `paid` — set by admin after Cashfree payout CSV is processed
- `pending` — original default; superseded by `pending_payout` for all new claims

---

## Tables

### `admins`

Admin user accounts for the portal (`/admin`).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `email` | text | UNIQUE NOT NULL |
| `password_hash` | text | NOT NULL (bcrypt) |
| `created_at` | timestamptz | default now() |

**Notes:** Admins use email + password (bcrypt), not OTP. Contrast with retailers who are OTP-only.

---

### `admin_sessions`

Active admin login sessions. One row per login; deleted on logout or expiry.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `admin_id` | uuid | FK → admins(id) ON DELETE CASCADE |
| `expires_at` | timestamptz | NOT NULL |
| `created_at` | timestamptz | default now() |

**Indexes:** `admin_sessions_admin_idx` on `(admin_id)`

---

### `retailers`

Registered retailers. `mobile` is the primary identity — there are no passwords.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `mobile` | text | UNIQUE NOT NULL |
| `name` | text | nullable (set on first login) |
| `city` | text | nullable |
| `state` | text | nullable |
| `upi_id` | text | nullable |
| `created_at` | timestamptz | default now() |

**Notes:** `name`, `city`, `state`, `upi_id` are collected during the first-login registration flow. They are `NULL` until the retailer completes registration.

---

### `retailer_sessions`

Active retailer login sessions. One row per OTP verification; deleted on expiry.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `retailer_id` | uuid | FK → retailers(id) ON DELETE CASCADE |
| `expires_at` | timestamptz | NOT NULL |
| `created_at` | timestamptz | default now() |

**Indexes:** `retailer_sessions_retailer_idx` on `(retailer_id)`

---

### `otp_codes`

Transient OTP storage for the retailer login flow. One row per mobile number; upserted on each OTP request and deleted after successful verification.

| Column | Type | Constraints |
|--------|------|-------------|
| `mobile` | text | PK |
| `code` | text | NOT NULL |
| `expires_at` | timestamptz | NOT NULL |
| `attempts` | int | NOT NULL, default 0 |
| `created_at` | timestamptz | default now() |

**Notes:** `attempts` is incremented on each failed verification. Brute-force protection should check this before accepting a code.

---

### `cashback_plans`

A cashback offer — single-product or multi-product combo. The entity that drives claim creation.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `name` | text | NOT NULL |
| `cashback_amount` | int | NOT NULL, CHECK >= 1 (₹) |
| `active` | boolean | NOT NULL, default true |
| `created_at` | timestamptz | default now() |

**Notes:** `active = false` hides a plan from the retailer portal without deleting historical data. Single-product offers are plans with exactly one leg. Combo offers have two or more legs.

---

### `cashback_plan_legs`

Each leg of a cashback plan: one product and how many coupons are required from that product.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, default gen_random_uuid() |
| `plan_id` | uuid | FK → cashback_plans(id) ON DELETE CASCADE |
| `product_id` | uuid | FK → products(id) |
| `coupons_required` | int | NOT NULL, CHECK >= 1 |

**Constraints:** UNIQUE on `(plan_id, product_id)` — a product can only appear once per plan.

**Indexes:**
- `cashback_plan_legs_plan_idx` on `(plan_id)`
- `cashback_plan_legs_product_idx` on `(product_id)` — used by the scan endpoint to find all active plans for a scanned product

**Notes:** A claim is auto-created server-side when all legs of a plan are satisfied (each leg's unlinked submission count ≥ its `coupons_required`). The qualifying submissions across all legs are linked to the claim in a single operation.

---

### `products`

Medicine SKUs enrolled in the loyalty program.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `name` | text | NOT NULL |
| `coupons_required` | int | NOT NULL, CHECK >= 1 |
| `cashback_amount` | int | NOT NULL, CHECK >= 1 (₹) |
| `active` | boolean | NOT NULL, default true |
| `created_at` | timestamptz | default now() |

**Notes:** `active = false` hides a product from the retailer portal without deleting historical data.

---

### `qr_batches`

One row per admin print run. Groups the physical QR stickers generated in one session.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → products(id) ON DELETE RESTRICT |
| `batch_label` | text | NOT NULL (human-readable name for the run) |
| `serial_prefix` | text | NOT NULL (e.g. `PIICURE`) |
| `quantity` | int | NOT NULL, CHECK >= 1 |
| `serial_start` | text | NOT NULL (e.g. `PIICURE-0001`) |
| `serial_end` | text | NOT NULL (e.g. `PIICURE-0100`) |
| `serial_start_num` | int | NOT NULL (numeric start for range queries) |
| `created_at` | timestamptz | default now() |

**Indexes:**
- `qr_batches_product_id_idx` on `(product_id)`
- `qr_batches_prefix_idx` on `(serial_prefix)`

**Notes:** Admin-owned and immutable after generation. Contrast with `coupon_submissions` which is retailer-owned (scan events).

---

### `qr_serials`

One row per physical QR sticker printed. The authoritative registry of all valid serials.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `batch_id` | uuid | FK → qr_batches(id) ON DELETE CASCADE |
| `serial` | text | UNIQUE NOT NULL |
| `hmac` | text | NOT NULL (HMAC-SHA256 of serial, used to verify authenticity of scans) |
| `created_at` | timestamptz | default now() |

**Indexes:**
- `qr_serials_batch_id_idx` on `(batch_id)`
- `qr_serials_serial_prefix_idx` on `(serial text_pattern_ops)` — enables `LIKE 'PREFIX-%'` prefix queries to use the index

**Notes:** Two tables exist intentionally — `qr_serials` (admin-generated, static registry) and `coupon_submissions` (retailer scan events, append-only). Keeping them separate makes it impossible to accidentally overwrite or conflate the two actors. The HMAC on each serial lets the scan endpoint verify a QR code came from a genuine PiiPharma sticker without a database lookup first.

---

### `coupon_submissions`

One row per QR scan by a retailer. The append-only scan log; accumulates over time until a claim is triggered.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `retailer_id` | uuid | FK → retailers(id) ON DELETE CASCADE |
| `product_id` | uuid | FK → products(id) ON DELETE RESTRICT |
| `claim_id` | uuid | FK → claims(id) ON DELETE SET NULL; NULL until claim is auto-created |
| `photo_url` | text | NOT NULL (path in `coupon-photos` Supabase Storage bucket) |
| `serial` | text | UNIQUE NOT NULL |
| `created_at` | timestamptz | default now() |

**Indexes:**
- `coupon_submissions_retailer_product_idx` on `(retailer_id, product_id)` — used to count unlinked submissions per retailer+product
- `coupon_submissions_claim_idx` on `(claim_id)`

**Key design decisions:**
- `serial` has a UNIQUE constraint — a duplicate scan fails with Postgres error `23505`, which the server catches and returns as a "duplicate serial" error to the retailer. No application-level check needed.
- `claim_id` is NULL until the submission count for this retailer+product reaches `products.coupons_required`. At that point the server creates a claim and back-fills `claim_id` on all qualifying rows in a single transaction.
- `ON DELETE SET NULL` on `claim_id` means deleting a claim doesn't delete the underlying scan records — they become unlinked and could re-trigger a new claim.

---

### `claims`

Auto-created server-side when a retailer's unlinked `coupon_submissions` count for a product reaches `products.coupons_required`. Retailers never explicitly submit a claim.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK |
| `retailer_id` | uuid | FK → retailers(id) ON DELETE CASCADE |
| `plan_id` | uuid | FK → cashback_plans(id); NULL on pre-migration legacy rows |
| `product_id` | uuid | FK → products(id) ON DELETE RESTRICT; nullable (legacy — was NOT NULL before the plan abstraction) |
| `photo_url` | text | nullable (legacy field; detail view now reads photos from linked `coupon_submissions`) |
| `status` | claim_status | NOT NULL, default `pending` |
| `rejection_reason` | text | nullable; set when admin rejects |
| `approved_at` | timestamptz | nullable |
| `paid_at` | timestamptz | nullable |
| `created_at` | timestamptz | default now() |

**Indexes:**
- `claims_retailer_idx` on `(retailer_id)`
- `claims_status_idx` on `(status)`
- `claims_product_idx` on `(product_id)`
- `claims_plan_idx` on `(plan_id)`

**Status flow (current):**
- New claims from HMAC-verified QR scans → `pending_payout` (skip admin review)
- `pending_payout` → `paid` after Cashfree CSV payout is processed
- `pending_payout` → `rejected` if admin disputes after the fact
- `approved` and `pending` are legacy statuses; not produced by current code

---

## Storage

### `coupon-photos` bucket

Private Supabase Storage bucket. All `photo_url` values in `coupon_submissions` are paths into this bucket. Signed URLs are generated server-side for admin claim detail views.

---

## Dropped Tables

### `serial_numbers` (dropped 2026-05-17)

Originally the serial deduplication table, linked directly to claims. Replaced by `qr_serials` (registry) + `coupon_submissions` (scan records) when the QR generator feature was built. Had 0 rows in production before being dropped — the QR-based flow made it obsolete before it was ever used.

---

## Convention

Every migration file added to `supabase/migrations/` must have a corresponding update to this file. Update the "Last updated" date at the top, add or modify the relevant table sections, and note any dropped tables in the Dropped Tables section.
