# T003 — Retailer Auth (OTP + Registration)

**Depends on:** T002
**Stories covered:** retailer-auth (all 4 stories)

## Goal
Retailer can log in via OTP (WhatsApp primary, SMS fallback) and complete one-time registration.

## Tasks

### OTP Flow
- [ ] Create `src/lib/server/otp.ts` — `sendOtp(mobile)`: generates 6-digit code, stores in `otp_codes`, sends via WhatsApp API; falls back to SMS if WhatsApp fails
- [ ] Create `POST /api/otp/send` server route — validates 10-digit mobile, calls `sendOtp`, rate-limits resend to 30s
- [ ] Create `POST /api/otp/verify` server route — checks code, expiry (10 min), attempt count (max 3); creates `retailer_sessions` row on success; sets `retailer_session` cookie (7-day expiry)

### Login Page
- [ ] Create `src/routes/(retailer)/+layout.svelte` — mobile-first shell
- [ ] Create `src/routes/(retailer)/+page.svelte` — login page: mobile input → OTP input (two-step, single page)
- [ ] Handle redirect after verify: new retailer → `/app/register`, returning → `/app`

### First-Time Registration
- [ ] Create `src/routes/(retailer)/app/register/+page.server.ts` — load checks session exists but profile incomplete; action saves name, city, state, upi_id
- [ ] Create `src/routes/(retailer)/app/register/+page.svelte` — form: name, city, state, UPI ID (all required); validates UPI format `handle@bank` client-side
- [ ] After successful registration redirect to `/app`

### Session Expiry
- [ ] Hooks middleware already handles expiry redirect (T002)
- [ ] Cleanup cron or on-read: delete expired sessions from `retailer_sessions`

## Notes
- UPI format validation regex: `/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/`
- City and state are free-text inputs, no dropdown in v1
- Mobile number is the retailer's identity — no separate username
