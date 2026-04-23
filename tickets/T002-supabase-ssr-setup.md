# T002 — Supabase SSR + Server Infrastructure

**Depends on:** T001
**Stories covered:** foundational for all sessions and DB access

## Goal
Wire up `hooks.server.ts`, Supabase server client, session helpers, and route protection so all subsequent tickets can use `event.locals`.

## Tasks

- [ ] Install `@supabase/ssr` (already done) — confirm `src/app.d.ts` has `locals` types
- [ ] Update `src/app.d.ts` — add `locals.supabase`, `locals.retailerSession`, `locals.adminSession`
- [ ] Create `src/hooks.server.ts` — init Supabase server client with cookie handlers per stack-docs pattern
- [ ] Create `src/lib/server/supabase.ts` — export `createClient()` helper using service role key for DB mutations
- [ ] Create `src/lib/server/session.ts` — helpers: `getRetailerSession(cookies)`, `getAdminSession(cookies)`, `clearSession(cookies)`
- [ ] Add route protection in `hooks.server.ts`:
  - `/admin/*` → redirect to `/admin/login` if no valid admin session
  - `/app/*` (retailer portal) → redirect to `/` if no valid retailer session
  - `/app/register` → accessible without full profile (for first-time registration flow)

## Notes
- Do NOT use Supabase Auth — sessions are manual (retailer_sessions + admin_sessions tables)
- Service role key goes only in server-side code, never in `VITE_` prefixed env vars
- Session cookie name: `retailer_session` and `admin_session`
