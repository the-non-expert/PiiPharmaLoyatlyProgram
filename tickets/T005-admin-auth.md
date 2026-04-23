# T005 — Admin Auth

**Depends on:** T002
**Stories covered:** admin-auth (both stories)

## Goal
Admin can log in with email + password and log out. Session lasts 8 hours.

## Tasks

- [ ] Create `src/lib/server/admin-auth.ts` — `verifyAdmin(email, password)`: queries `admins` table, compares bcrypt hash; `createAdminSession(email)`: inserts into `admin_sessions`, returns session id; `clearAdminSession(sessionId)`
- [ ] Create `src/routes/(admin)/admin/login/+page.server.ts` — action: validate fields, call `verifyAdmin`, set `admin_session` cookie (8-hour expiry) on success; generic error on failure
- [ ] Create `src/routes/(admin)/admin/login/+page.svelte` — simple email + password form
- [ ] Create `src/routes/(admin)/admin/logout/+page.server.ts` — action: clear session from DB + cookie, redirect to login
- [ ] Route protection in `hooks.server.ts` (T002) covers auto-redirect on expiry

## Notes
- Use `bcrypt` (or `@node-rs/bcrypt` for performance) for password comparison
- Error message must be generic: "Invalid credentials" — do not hint which field is wrong
- Admin is pre-seeded — no self-registration, no password reset in v1
