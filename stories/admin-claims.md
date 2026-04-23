# Stories: Admin Claims

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** admin-claims

---

## View Pending Queue

**As an** admin
**I want to** see all claims waiting for review
**So that** I can work through them efficiently

**Acceptance Criteria:**
- WHEN an admin opens the dashboard THEN the system SHALL show all pending claims sorted oldest-first
- WHEN a claim is listed THEN it SHALL show: retailer name, product name, number of serials, and time submitted
- WHEN there are no pending claims THEN the system SHALL show an empty state message
- WHEN a new claim arrives while the admin is viewing the queue THEN it SHALL appear without requiring a page refresh

---

## View Claim Detail

**As an** admin
**I want to** open a claim and see all its details
**So that** I can make an informed approve or reject decision

**Acceptance Criteria:**
- WHEN an admin opens a claim THEN the system SHALL display: full-size coupon photo, all serial number(s), retailer name, retailer city and state, retailer UPI ID, product name, and submission timestamp
- WHEN the coupon photo is displayed THEN it SHALL be viewable full-size (zoomable or openable in new tab)
- WHEN a claim has multiple serial numbers THEN all shall be listed clearly

---

## Approve a Claim

**As an** admin
**I want to** approve a valid claim
**So that** it is queued for payout

**Acceptance Criteria:**
- WHEN an admin approves a claim THEN the system SHALL change its status to "approved" and move it to the payout queue
- WHEN a claim is approved THEN it SHALL no longer appear in the pending queue
- WHEN a claim is approved THEN the serial numbers in that claim SHALL be permanently marked as used

**Notes:** Approval is one-click, no confirmation dialog needed at this scale.

---

## Reject a Claim

**As an** admin
**I want to** reject an invalid claim with a reason
**So that** the retailer understands why their submission was not accepted

**Acceptance Criteria:**
- WHEN an admin clicks reject THEN the system SHALL require a rejection reason before confirming
- WHEN the rejection is submitted THEN the system SHALL change the claim status to "rejected" and store the reason
- WHEN a claim is rejected THEN it SHALL no longer appear in the pending queue
- WHEN a claim is rejected THEN the serial numbers used in it SHALL be freed and can be resubmitted

**Notes:** Rejection reason is shown to the retailer in their claim history.

---

## View All Claims

**As an** admin
**I want to** filter and browse all claims regardless of status
**So that** I can look up specific retailers or review past decisions

**Acceptance Criteria:**
- WHEN an admin views all claims THEN the system SHALL support filtering by status: pending, approved, rejected, or all
- WHEN an admin filters by product THEN only claims for that product SHALL be shown
- WHEN claims are listed THEN each SHALL show: retailer name, product, status, and submission date
- WHEN an admin clicks any claim in this view THEN it SHALL open the same claim detail view

---

## Status

- **structure_ok:** false
- **human_approved:** false
