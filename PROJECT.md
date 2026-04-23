# PiiPharma Retailer Loyalty Program

## What It Does
A web portal at `loyalty.piipharma.com` that automates PiiPharma's retailer cashback program. Retailers submit coupon claims via a mobile-friendly portal (OTP login, photo upload, serial number entry). An admin reviews and approves claims on a dashboard, then exports a Cashfree-compatible CSV to trigger bulk UPI payouts — replacing a fully manual WhatsApp → Excel → Cashfree workflow.

## Type
- [x] Freelance Client

## Target Users
- **Retailer:** submit coupon claims and receive UPI cashback (mobile-first, low-tech users)
- **Admin/employee:** review pending claims, approve or reject, export payout file to Cashfree

## Tech Stack
- Frontend + Backend: SvelteKit (full-stack, SSR)
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` plugin (no PostCSS)
- Database: Supabase (PostgreSQL + Storage for coupon photos)
- Deployment: Netlify
- Payments: Cashfree Payouts (existing account — manual CSV upload in v1)
- OTP: WhatsApp Business API (primary) + SMS fallback

## Key Constraints
- Free-tier infra only (Netlify + Supabase)
- Retailer portal must work on mobile
- No new payment vendor — existing Cashfree account only
- No direct Cashfree API in v1 — admin uploads CSV manually

## Goals for v1
1. Retailer portal: OTP login, one-time registration (name + UPI ID), coupon photo upload + serial number entry, auto duplicate rejection
2. Admin dashboard: claim review queue (photo · serial · retailer · product), approve/reject with reason, payout CSV export
3. Product config panel: coupons required per claim, cashback amount per product

## Out of Scope (v1)
- Direct Cashfree API integration (automated payout trigger)
- NEFT / bank transfer flow
- Analytics or redemption trend dashboards
- WhatsApp intake migration (retailers move from WhatsApp to portal voluntarily)
- Fraud detection beyond serial number deduplication
