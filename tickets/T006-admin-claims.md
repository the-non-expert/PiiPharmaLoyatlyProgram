# T006 — Admin Claims

**Depends on:** T005, T004 (claims must exist to review)
**Stories covered:** admin-claims (all 5 stories)

## Goal
Admin can review the pending queue, view claim details (with photo), approve or reject with reason, and filter all claims.

## Tasks

### Pending Queue (dashboard home)
- [ ] Create `src/routes/(admin)/admin/+page.server.ts` — load pending claims, sorted oldest-first, with retailer name + product name + serial count + submitted_at
- [ ] Create `src/routes/(admin)/admin/+page.svelte` — claim list; each row links to detail; empty state message

### Claim Detail
- [ ] Create `src/routes/(admin)/admin/claims/[claimId]/+page.server.ts` — load claim with: retailer (name, city, state, upi_id), product name, all serial numbers, photo_url; generate signed URL for photo (1-hour expiry)
- [ ] Create `src/routes/(admin)/admin/claims/[claimId]/+page.svelte` — display all fields; full-size photo (opens in new tab); approve button; reject button that reveals reason textarea

### Approve Action
- [ ] Server action `approve`: set claim `status = 'approved'`, set `approved_at`; serial numbers already inserted at submission — no additional action needed
- [ ] On approve: redirect back to pending queue

### Reject Action
- [ ] Server action `reject`: require non-empty reason; set `status = 'rejected'`, store `rejection_reason`
- [ ] On reject: redirect back to pending queue

### All Claims View (filter)
- [ ] Create `src/routes/(admin)/admin/claims/+page.server.ts` — load all claims; accept `?status=` and `?product=` query params for filtering
- [ ] Create `src/routes/(admin)/admin/claims/+page.svelte` — filter bar (status dropdown, product dropdown); claim table with status badges; each row links to detail

## Notes
- Signed URL for photo: use `supabase.storage.from('coupon-photos').createSignedUrl(path, 3600)`
- Rejection frees serial numbers: set claim to rejected but do NOT delete from `serial_numbers` — resubmission is allowed (query: claim must be in approved/pending state to count as duplicate)
- Duplicate check logic: serial is "used" only if it appears in a claim with `status IN ('pending', 'approved', 'paid')`
