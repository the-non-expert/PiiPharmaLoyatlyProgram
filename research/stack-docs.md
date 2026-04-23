# Stack Docs — Key Notes for Development

Fetched via Context7, April 2026. Use these patterns; do not rely on training-data defaults.

---

## SvelteKit

**Form Actions** (`+page.server.ts`) are the primary pattern for all mutations — OTP send, OTP verify, claim submit, admin approve/reject.

```typescript
// +page.server.ts
export const actions = {
  sendOtp: async ({ request, cookies }) => {
    const data = await request.formData();
    const mobile = data.get('mobile');
    // ... send OTP, set temp cookie
  }
} satisfies Actions;
```

**Server load functions** use `cookies` and `locals` (set by hooks) for session access:

```typescript
export const load: PageServerLoad = async ({ locals }) => {
  const { session } = locals; // set by hooks.server.ts
  if (!session) redirect(303, '/login');
  return { user: session.user };
};
```

**Route protection** goes in `hooks.server.ts` — check session and redirect before reaching any load function.

**File uploads** via `request.formData()` in actions — `data.get('photo')` returns a `File` object server-side.

---

## Supabase SSR (`@supabase/ssr`)

**Critical:** Use `@supabase/ssr`, not `@supabase/supabase-js` directly on the server. The old `@supabase/auth-helpers-*` packages are deprecated.

**`hooks.server.ts` pattern** — initialise once, attach to `event.locals`:

```typescript
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: options.path ?? '/' });
          });
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  event.locals.supabase = supabase;
  event.locals.session = session;

  return resolve(event);
};
```

**Note:** We are NOT using Supabase Auth for retailer login. We're implementing custom OTP via WhatsApp/SMS and storing sessions manually in cookies + a `sessions` table. The Supabase client is used for DB queries and storage only.

---

## Supabase Storage

**Coupon photos** go in a private bucket (`coupon-photos`). Use RLS to restrict uploads to authenticated sessions.

**Upload from SvelteKit action:**

```typescript
// Server action — upload coupon photo
const file = data.get('photo') as File;
const path = `claims/${claimId}/${file.name}`;
const { error } = await supabase.storage.from('coupon-photos').upload(path, file);
```

**RLS policy** — restrict uploads to authenticated requests only:

```sql
create policy "authenticated uploads only"
on storage.objects for insert to authenticated
with check (bucket_id = 'coupon-photos');
```

**Signed URLs** for admin to view photos (bucket is private):

```typescript
const { data } = await supabase.storage
  .from('coupon-photos')
  .createSignedUrl(path, 3600); // 1-hour expiry
```

---

## Tailwind CSS v4 (Vite Plugin — No PostCSS)

**Install:**
```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts`** — add alongside `sveltekit()`:
```typescript
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()]
});
```

**`src/app.css`** — single import, no config file needed:
```css
@import "tailwindcss";
```

**Key v4 differences from v3:**
- No `tailwind.config.js` — configuration lives in CSS via `@theme`
- No PostCSS required — Vite plugin handles everything
- `@import "tailwindcss"` replaces the old `@tailwind base/components/utilities` directives
- Custom tokens go in CSS: `@theme { --color-brand: #...; }`

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only, never expose to client
WHATSAPP_API_TOKEN=
SMS_API_KEY=
```
