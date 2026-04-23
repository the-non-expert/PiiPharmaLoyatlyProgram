## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: sveltekit-adapter, prettier, eslint

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PiiPharma Retailer Loyalty Program** — a web application at `loyalty.piipharma.com` that replaces a fully manual WhatsApp + Excel + Cashfree workflow for processing retailer coupon cashback claims.

**Client:** PiiPharma (`piipharma.com`) — pharma company  
**Developer:** Ayush Jhunjhunwala (family friend engagement)  
**Status:** Report approved April 2026, development starting

---

## Approved Architecture

**Stack:**
- **Frontend + Backend:** SvelteKit (full-stack, SSR)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` plugin — no PostCSS, no config file
- **Database:** Supabase (free tier — PostgreSQL + storage for coupon photos)
- **Hosting:** Netlify (free tier)
- **Payments:** Cashfree Payouts (existing account, no change to payment rail)
- **OTP:** WhatsApp Business API (primary, ~₹0.40/OTP) + SMS fallback (~₹0.25/OTP)

**Two portals, one app:**
1. `loyalty.piipharma.com` — Retailer-facing (mobile-first)
2. `loyalty.piipharma.com/admin` — Admin dashboard (desktop)

---

## Domain Model

```
Products             — 6–7 products, each with: coupons_required (int), cashback_amount (int ₹)
Retailers            — mobile_number (PK), name, city, state, upi_id, registered_at
Coupon_Submissions   — retailer_id, product_id, photo_url, serial (unique), submitted_at
                       One row per physical coupon. Accumulates over time.
Claims               — retailer_id, product_id, status, created_at
                       Auto-created when a retailer's coupon_submission count for a product
                       reaches products.coupons_required. Links to the qualifying submissions.
Payouts              — batch of approved claims exported as CSV for Cashfree upload
```

**Key flow:** Retailer submits coupons one at a time (photo + serial each). Server counts
unlinked submissions for that retailer+product after every save. When count ≥ coupons_required,
a claim is auto-created and those submissions are marked as linked to it. The claim then
appears in the admin queue.

---

## Core Business Rules

- Retailer login is **OTP-only** (no passwords). Mobile number is the identity.
- First login triggers registration: collect name + city + state + UPI ID, saved for all future claims.
- Each coupon submission = **one photo + one serial number**. Retailers submit one at a time, across multiple days.
- Serial numbers are globally unique — duplicate serial must be **auto-rejected** at submission time.
- When a retailer's unlinked coupon count for a product reaches `coupons_required`, a **claim is auto-created** server-side. The retailer is not explicitly submitting a claim — it happens automatically.
- After saving a coupon the retailer sees: updated progress + two options: "Add another coupon" or "Done for now".
- Admin reviews the auto-created claim: all associated photos and serials, retailer name, product. Approves or rejects with reason.
- Payout is a **CSV export** compatible with Cashfree bulk payout format — admin uploads manually to Cashfree dashboard. No direct Cashfree API integration in v1.
- NEFT fallback: if needed, same Cashfree account supports NEFT — just a config change, no rebuild.

---

## Scale & Constraints

- ~1,000 active retailers, ~500 claiming per payout cycle
- Cashback: ₹10–100 per claim
- Free-tier Supabase and Netlify are sufficient at this scale
- Photo uploads go to Supabase Storage

---

## Development Commands

Once SvelteKit scaffold is created:

```bash
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview production build
npm run check      # svelte-check type checking
```

Current repo only has `md-to-pdf` (used to generate the approved report PDF from `report-draft-1.md`):

```bash
npx md-to-pdf report-draft-1.md   # regenerate report PDF
```

---

## Key Files (pre-development)

- `report-draft-1.md` — approved proposal with full scope, flowcharts, and cost breakdown
- `flow-*.svg` — standalone SVG flowcharts used in the report
