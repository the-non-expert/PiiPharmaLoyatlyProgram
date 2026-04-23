# T007 — Admin Product Config

**Depends on:** T005
**Stories covered:** admin-products (all 4 stories)

## Goal
Admin can create, edit, and deactivate products. Changes to config apply to future claims only.

## Tasks

- [ ] Create `src/routes/(admin)/admin/products/+page.server.ts` — load all products (active + inactive); actions: `create`, `update`, `toggleActive`
- [ ] Create `src/routes/(admin)/admin/products/+page.svelte` — product table with inline status toggle; "Add product" form at top or in modal; edit opens inline form or separate route
- [ ] `create` action: validate name (non-empty), `coupons_required` (int ≥ 1), `cashback_amount` (int ≥ 1); insert; active by default
- [ ] `update` action: same validation; update row; existing claims unaffected (no cascade)
- [ ] `toggleActive` action: flip `active` boolean; immediate effect on retailer portal

## Notes
- No separate edit page needed — inline edit in the table row is sufficient at this scale
- Deactivating a product does not affect existing claims or the payout queue
