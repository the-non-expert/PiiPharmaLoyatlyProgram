# Stories: Admin Auth

**Project:** PiiPharma Retailer Loyalty Program
**Domain:** admin-auth

---

## Admin Login

**As an** admin
**I want to** log in with my email and password
**So that** I can access the admin dashboard

**Acceptance Criteria:**
- WHEN an admin submits a valid email and password THEN the system SHALL create a session and redirect to the claims queue
- WHEN the email or password is incorrect THEN the system SHALL show a generic error ("Invalid credentials") and not indicate which field is wrong
- WHEN either field is empty THEN the system SHALL show a validation error without submitting
- WHEN an admin is already logged in and visits the login page THEN the system SHALL redirect them to the dashboard

**Notes:** Admin credentials are seeded directly in the database — no self-registration or password reset flow in v1. 1–2 admin users maximum.

---

## Admin Logout

**As an** admin
**I want to** log out of the dashboard
**So that** my session is not accessible if I leave the browser open

**Acceptance Criteria:**
- WHEN an admin clicks logout THEN the system SHALL invalidate the session and redirect to the admin login page
- WHEN an admin's session has been inactive for 8 hours THEN the system SHALL automatically invalidate it
- WHEN an admin with an expired session visits any admin page THEN the system SHALL redirect them to the admin login page

---

## Status

- **structure_ok:** false
- **human_approved:** false
