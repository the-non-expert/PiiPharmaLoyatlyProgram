# Stories: Admin Payouts

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** admin-payouts

---

## View Payout Queue

**As an** admin
**I want to** see all approved claims that have not yet been paid
**So that** I know exactly who needs to be paid and how much

**Acceptance Criteria:**
- WHEN an admin views the payout queue THEN the system SHALL show all approved, unpaid claims
- WHEN a claim is listed THEN it SHALL show: retailer name, retailer UPI ID, product name, cashback amount (₹), and approval date
- WHEN there are no pending payouts THEN the system SHALL show an empty state message
- WHEN the queue is shown THEN the system SHALL display a total payout amount at the top

---

## Export CSV

**As an** admin
**I want to** download a CSV of all pending payout claims
**So that** I can upload it to Cashfree and trigger the bulk UPI transfer

**Acceptance Criteria:**
- WHEN an admin clicks export THEN the system SHALL generate and download a CSV file
- WHEN the CSV is generated THEN each row SHALL contain: retailer name, UPI ID, cashback amount, and a transfer remarks field (product name + claim ID)
- WHEN the CSV is generated THEN the column order and headers SHALL match Cashfree's bulk payout import format
- WHEN there are no claims in the payout queue THEN the export button SHALL be disabled

**Notes:** CSV format must be verified against Cashfree's current bulk payout template before implementation.

---

## Mark Batch as Paid

**As an** admin
**I want to** mark the exported batch as paid after uploading to Cashfree
**So that** paid claims are removed from the queue and not included in the next export

**Acceptance Criteria:**
- WHEN an admin clicks "Mark as Paid" THEN the system SHALL require a confirmation step
- WHEN confirmed THEN the system SHALL set all currently-queued approved claims to status "paid" and remove them from the payout queue
- WHEN claims are marked paid THEN they SHALL still be visible in the all-claims view with "paid" status and a paid timestamp
- WHEN the action is confirmed THEN the system SHALL show how many claims and the total amount being marked as paid before proceeding

**Notes:** This is manual confirmation — there is no webhook or API call to Cashfree in v1. Admin uploads CSV to Cashfree dashboard separately, then returns to mark as paid.

---

## Status

- **structure_ok:** false
- **human_approved:** false
