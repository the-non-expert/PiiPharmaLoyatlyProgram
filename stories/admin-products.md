# Stories: Admin Products

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** admin-products

---

## View Product List

**As an** admin
**I want to** see all products and their current configuration
**So that** I have a clear picture of what is available to retailers

**Acceptance Criteria:**
- WHEN an admin views the products page THEN the system SHALL list all products (active and inactive)
- WHEN a product is listed THEN it SHALL show: product name, coupons required, cashback amount (₹), and active/inactive status

---

## Add a Product

**As an** admin
**I want to** create a new product with its cashback configuration
**So that** retailers can start submitting claims for it

**Acceptance Criteria:**
- WHEN an admin submits a new product form THEN the system SHALL require: product name, coupons required (integer ≥ 1), and cashback amount (₹, integer ≥ 1)
- WHEN a product is created THEN it SHALL be active by default and immediately visible in the retailer portal
- WHEN any required field is empty or invalid THEN the system SHALL show a field-level validation error

---

## Edit a Product

**As an** admin
**I want to** update a product's coupons required or cashback amount
**So that** the programme terms can be adjusted over time

**Acceptance Criteria:**
- WHEN an admin edits a product and saves THEN the system SHALL update the configuration immediately
- WHEN a product's config is updated THEN it SHALL apply to new claims only — previously submitted claims are not affected
- WHEN an admin submits an edit with invalid values (e.g. 0 coupons required) THEN the system SHALL show a validation error

---

## Deactivate a Product

**As an** admin
**I want to** deactivate a product
**So that** retailers can no longer submit claims for it without permanently deleting it

**Acceptance Criteria:**
- WHEN an admin deactivates a product THEN it SHALL immediately disappear from the retailer portal
- WHEN a product is deactivated THEN all existing claims for it SHALL remain visible to admin and unaffected
- WHEN an admin reactivates a deactivated product THEN it SHALL reappear in the retailer portal immediately

---

## Status

- **structure_ok:** false
- **human_approved:** false
