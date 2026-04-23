# Stories: Retailer Auth

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** retailer-auth

---

## Send OTP

**As a** retailer
**I want to** enter my mobile number and receive a one-time password
**So that** I can log in without needing to remember a password

**Acceptance Criteria:**
- WHEN a retailer submits a valid 10-digit mobile number THEN the system SHALL send an OTP to that number via WhatsApp
- WHEN WhatsApp delivery fails THEN the system SHALL automatically retry via SMS
- WHEN the mobile number is fewer than 10 digits or non-numeric THEN the system SHALL show an inline validation error and not send an OTP
- WHEN an OTP is sent THEN it SHALL expire after 10 minutes

**Notes:** One active OTP per mobile number at a time. Resend button available after 30 seconds.

---

## Verify OTP

**As a** retailer
**I want to** enter the OTP I received and be logged in
**So that** I can access the portal

**Acceptance Criteria:**
- WHEN a retailer enters the correct OTP within 10 minutes THEN the system SHALL create a session and redirect them
- WHEN a retailer enters an incorrect OTP THEN the system SHALL show an error and allow retry (max 3 attempts)
- WHEN 3 incorrect attempts are made THEN the system SHALL invalidate the OTP and require a new one
- WHEN the OTP has expired THEN the system SHALL show an expiry message and offer to resend

**Notes:** On successful verify — if mobile is new, redirect to registration. If returning retailer, redirect to product list.

---

## First-Time Registration

**As a** first-time retailer
**I want to** complete a one-time profile setup after my first login
**So that** the system knows who I am and where to send my cashback

**Acceptance Criteria:**
- WHEN a retailer logs in for the first time THEN the system SHALL show a registration form before allowing any claims
- WHEN the retailer submits the form THEN the system SHALL require: full name, city, state, and UPI ID
- WHEN all fields are filled and submitted THEN the system SHALL save the profile and redirect to the product list
- WHEN any required field is empty THEN the system SHALL show a field-level validation error
- WHEN the UPI ID format is invalid THEN the system SHALL show an inline error (valid format: `handle@bank`)

**Notes:** Registration is one-time only. All four fields are mandatory. City and state are free-text (no dropdown required in v1).

---

## Session Expiry

**As a** retailer
**I want to** be automatically logged out after a period of inactivity
**So that** my account is not accessible if I leave the browser open

**Acceptance Criteria:**
- WHEN a retailer's session has been inactive for 7 days THEN the system SHALL invalidate the session
- WHEN a retailer with an expired session visits any protected page THEN the system SHALL redirect them to the login page
- WHEN a retailer is redirected to login due to expiry THEN the system SHALL not show an error — just the login screen

**Notes:** No explicit logout button needed in v1 — session expiry is sufficient at this scale.

---

## Status

- **structure_ok:** false
- **human_approved:** false
