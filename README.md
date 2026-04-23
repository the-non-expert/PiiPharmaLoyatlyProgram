# PiiPharma Retailer Loyalty Program

A web application for managing retailer coupon cashback claims for [PiiPharma](https://piipharma.com). Replaces a fully manual WhatsApp + Excel + Cashfree workflow with a structured, self-service portal.

**Live:** `loyalty.piipharma.com`

---

## What it does

Retailers submit physical product coupons (photo + serial number) one at a time through a mobile-first portal. When enough coupons for a product are collected, a cashback claim is automatically created and queued for admin review. Approved claims are exported as a CSV for bulk payout upload to Cashfree.

**Two portals, one app:**
- `loyalty.piipharma.com` — Retailer portal (mobile-first, OTP login)
- `loyalty.piipharma.com/admin` — Admin dashboard (desktop)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | SvelteKit (SSR) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL + Storage) |
| Hosting | Netlify |
| Payments | Cashfree Payouts (CSV export) |
| OTP | WhatsApp Business API + SMS fallback |

---

## Key Business Rules

- Login is OTP-only — mobile number is the retailer's identity
- First login triggers registration (name, city, state, UPI ID)
- Each coupon submission = one photo + one serial number
- Serial numbers are globally unique — duplicates are auto-rejected
- Claims are created automatically server-side when coupon count reaches the product threshold — retailers don't submit claims explicitly
- Payouts are exported as CSV and uploaded manually to Cashfree (no direct API in v1)

---

## Domain Model

```
Products           — each with coupons_required and cashback_amount (₹)
Retailers          — identified by mobile_number; one UPI ID per retailer
Coupon_Submissions — one row per physical coupon (photo + serial)
Claims             — auto-created when submissions reach threshold; reviewed by admin
Payouts            — batch export of approved claims as Cashfree-compatible CSV
```

---

## Development

```bash
npm install
npm run dev        # dev server
npm run build      # production build
npm run preview    # preview production build
npm run check      # svelte-check type checking
```

Requires a `.env` file — copy `.env.example` and fill in your Supabase and WhatsApp API credentials.

---

## Scale

~1,000 active retailers, ~500 claiming per payout cycle. Cashback ₹10–100 per claim. Free-tier Supabase and Netlify are sufficient at this scale.
