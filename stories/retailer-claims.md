# Stories: Retailer Claims

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** retailer-claims

---

## View Product List

**As a** registered retailer
**I want to** see all active products with their cashback details
**So that** I know what I can claim and how many coupons I need

**Acceptance Criteria:**
- WHEN a retailer visits the portal after login THEN the system SHALL display all active products
- WHEN a product is displayed THEN it SHALL show: product name, number of coupons required, and cashback amount (₹)
- WHEN a product is deactivated by admin THEN it SHALL NOT appear in the retailer's product list
- WHEN there are no active products THEN the system SHALL show a message indicating none are available

---

## Submit a Claim

**As a** registered retailer
**I want to** submit coupon serial numbers and a photo for a product
**So that** I can receive my cashback after admin approval

**Acceptance Criteria:**
- WHEN a retailer selects a product THEN the system SHALL show how many serial numbers are required for that product
- WHEN a retailer submits a claim THEN the system SHALL require: at least one coupon photo and the required number of serial numbers
- WHEN a serial number has already been used in a previous claim THEN the system SHALL immediately reject the submission with a clear duplicate message — without entering the admin queue
- WHEN all serial numbers are new and the photo is attached THEN the system SHALL create the claim with status "pending" and show a confirmation message
- WHEN the photo file exceeds 10MB THEN the system SHALL show an error and not submit

**Notes:** Serial number check happens server-side on submission. Retailer is told which specific serial is a duplicate if multiple are submitted.

---

## View Claim History

**As a** registered retailer
**I want to** see the status of all my past submissions
**So that** I know which claims were approved, rejected, or are still pending

**Acceptance Criteria:**
- WHEN a retailer views their claim history THEN the system SHALL show all their claims sorted newest-first
- WHEN a claim is displayed THEN it SHALL show: product name, submission date, status (pending / approved / rejected)
- WHEN a claim has been rejected THEN the system SHALL show the rejection reason provided by the admin
- WHEN a claim is pending THEN the system SHALL show no payout amount (amount shown only on approval)

---

## Update UPI ID

**As a** registered retailer
**I want to** update my UPI ID
**So that** future cashback payments go to my current account

**Acceptance Criteria:**
- WHEN a retailer accesses their profile THEN the system SHALL show their current UPI ID with an edit option
- WHEN a retailer submits a new UPI ID THEN the system SHALL validate the format (`handle@bank`) before saving
- WHEN the new UPI ID is saved THEN it SHALL apply to all future payouts — already-queued payouts are not affected
- WHEN the UPI ID format is invalid THEN the system SHALL show an inline validation error

**Notes:** Name, city, and state are not editable after registration in v1.

---

## Status

- **structure_ok:** false
- **human_approved:** false
