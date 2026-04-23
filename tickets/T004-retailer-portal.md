# T004 — Retailer Portal

**Depends on:** T003
**Stories covered:** retailer-claims (all 4 stories)

## Goal
Retailer can view products, submit coupon claims with photo + serials, track claim history, and update their UPI ID.

## Tasks

### Product List (home screen)
- [ ] Create `src/routes/(retailer)/app/+page.server.ts` — load all active products from DB
- [ ] Create `src/routes/(retailer)/app/+page.svelte` — product cards showing name, coupons required, cashback amount; mobile-first layout

### Claim Submission
- [ ] Create `src/routes/(retailer)/app/claim/[productId]/+page.server.ts`:
  - `load`: fetch product config (coupons required, cashback amount)
  - `action`: receive photo (File) + serial numbers array; check each serial against `serial_numbers` table; if any duplicate → return error with which serial is duplicate; if all new → upload photo to Supabase Storage (`coupon-photos/{claimId}/photo.jpg`), insert claim + serial rows
- [ ] Create `src/routes/(retailer)/app/claim/[productId]/+page.svelte` — form: photo upload (max 10MB), serial number inputs (count driven by `coupons_required`); show clear duplicate error inline
- [ ] Photo upload: use `createSignedUploadUrl` pattern from stack-docs

### Claim History
- [ ] Create `src/routes/(retailer)/app/history/+page.server.ts` — load all claims for current retailer, sorted newest-first, with product name and serial numbers
- [ ] Create `src/routes/(retailer)/app/history/+page.svelte` — list: product, date, status badge; rejection reason shown inline when rejected

### Update UPI ID
- [ ] Create `src/routes/(retailer)/app/profile/+page.server.ts` — load current profile; action to update `upi_id` with format validation
- [ ] Create `src/routes/(retailer)/app/profile/+page.svelte` — show name, city, state (read-only), UPI ID (editable)

## Notes
- Serial number check must be atomic — use a DB transaction or unique constraint on `serial_numbers.serial`
- Photo size check: reject > 10MB before upload attempt
- Use SvelteKit form actions (not fetch) for progressive enhancement
