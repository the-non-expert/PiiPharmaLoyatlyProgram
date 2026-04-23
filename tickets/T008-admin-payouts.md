# T008 — Admin Payouts & CSV Export

**Depends on:** T006 (approved claims must exist)
**Stories covered:** admin-payouts (all 3 stories)

## Goal
Admin can view all approved-unpaid claims, download a Cashfree-compatible CSV, then mark the batch as paid.

## Tasks

### Payout Queue
- [ ] Create `src/routes/(admin)/admin/payouts/+page.server.ts` — load all claims with `status = 'approved'`; join retailer (name, upi_id) and product (name, cashback_amount); compute total payout amount
- [ ] Create `src/routes/(admin)/admin/payouts/+page.svelte` — table: retailer name, UPI ID, product, amount; total at top; Export CSV button; Mark as Paid button (disabled if queue empty)

### CSV Export
- [ ] Create `src/routes/(admin)/admin/payouts/export.csv/+server.ts` — GET handler that queries approved-unpaid claims and streams a CSV response
- [ ] CSV columns (verify against Cashfree bulk payout template before finalising): `name`, `beneUpiId` (UPI ID), `amount`, `transferMode` (UPI), `remarks` (product name + claim ID)
- [ ] Set response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="payout-{date}.csv"`

### Mark as Paid
- [ ] Server action `markPaid`: require explicit confirmation param; batch-update all `status = 'approved'` claims to `status = 'paid'`, set `paid_at = now()`; return count and total amount for confirmation display
- [ ] Show confirmation dialog before action: "Marking X claims (₹Y total) as paid. This cannot be undone."

## Notes
- Cashfree CSV format must be verified against their current bulk payout import template — column names above are best-guess and may need adjustment
- `markPaid` is irreversible — the confirmation step is mandatory
- Export and mark-as-paid are separate actions — admin uploads to Cashfree manually between them
