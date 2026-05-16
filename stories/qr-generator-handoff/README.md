# Handoff: Bulk QR Code Generator

## Overview

The PiiPharma Retailer Loyalty Program uses physical QR stickers placed on product boxes. Retailers scan the stickers to submit coupons, accumulate them, and claim cashback. This feature lets admins on `loyalty.piipharma.com/admin` generate batches of QR sticker codes (up to 10,000 at a time) for a specific product and download them as print-ready PDFs or ZIPs of PNGs.

Each QR encodes:
- A unique **serial** (per sticker, never reused)
- The **product_id**
- The **batch_id** (admin-defined print-run label)
- An **HMAC signature** for tamper-proofing

The flow is desktop-first but the modal degrades cleanly to 768 px.

## About the Design Files

The files in this bundle (`QR Generator.html`, `qr-screens.jsx`, `admin-screens.jsx`, `PiiPharma Design System.html`) are **design references created in HTML/React**. They are prototypes showing the intended look, copy, and behavior — **not production code to copy directly**.

Your task is to **recreate these designs in the target codebase's existing environment** (whatever framework the PiiPharma admin app is built in — Next.js, Vue, plain React, etc.), using the codebase's established components, routing, styling system, and state management. If no environment exists yet, pick the most appropriate one for the rest of the admin and implement there.

Treat the HTML as a visual + interaction specification. Lift exact values (hex, spacing, copy, validation messages) from this document and from the source files.

## Fidelity

**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, copy, validation messages, and interaction states. The component library in `PiiPharma Design System.html` is the source of truth for primitives (buttons, inputs, badges, table rows). Reuse the existing admin's `Sidebar`, table primitives, and modal patterns wherever they already exist in the codebase.

## Screens / Views

The feature is six screens / states. Screens 2, 3, 4, 6 are state-variants of the same modal — they should share one component shell with content swap.

---

### Screen 01 — Product list with Generate QR trigger

**Purpose:** Surface the generator from the product index. Non-intrusive — must not crowd existing Edit / toggle-active actions.

**Layout:**
- Existing admin shell: 220 px dark sidebar (`#141f2e`) + main area (1220 px wide on a 1440 viewport).
- Page header: `h1` "Products" (22 px, 700) on left. Right side has two buttons: secondary outline **"View All Batches"** (with QR glyph) and primary **"+ Add Product"**.
- Product grid: `repeat(3, 1fr)` with 18 px gap, 32 px page padding × 36 px horizontal.

**Product Card** (white, 10 px radius, 1 px `#EAEAEA` border, 18 × 20 px padding):
- Header row: product name (14 px, 700) above an inline active/inactive toggle (16 px height switch in success green `#3d8c1a` when on, grey `#cdd0d4` when off) + "Active" / "Inactive" label (11 px, 600).
- Stats: 2-up grid with `Coupons Req.` and `Cashback` tiles on `#F4F6F8` surface (8 × 10 px padding, 7 px radius). Caption is 9 px upper, value is 17 px 700 (cashback in primary blue).
- Mini-stats row: "Coupons in: 300" / "Claims: 60" (11 px) with bold values.
- Action row (separated by top 1 px border, 12 px padding):
  - **Generate QR** — primary action, takes ~80% width, ghost-style by default (`#e8f1fb` bg, `#2372B9` text + 1.5 px primary border). On hover or for highlighted card → solid `#2372B9` background, white text, white QR glyph. 7 px radius, 12 px 700 type.
  - **Edit** — 34 × 32 px icon-only square next to it, white bg + 1.5 px border. Pencil glyph in muted grey.
- The triggered card (first card in the design) is shown with a 2 px primary border + 3 px `#e8f1fb` outer glow + soft elevation to signal "hovered/about to click".

**Components:**
- Reuse `Sidebar` (active='products').
- Reuse `Btn` for header buttons.
- `Toggle` is new — model after standard iOS-style switch with two colors only.

**Interaction:**
- Click **Generate QR** → opens Screen 02 modal.
- Click toggle → instant optimistic flip + API call. If API fails, revert with error toast.
- Click **Edit** → opens existing product edit state.

---

### Screen 02 — Generator modal (form state)

**Purpose:** Collect batch parameters, preview the encoded payload, generate.

**Layout:**
- Centered modal, **720 px wide**, max-height 85vh. Background dim `rgba(20,31,46,0.42)`. The Products page is faintly visible behind (55 % opacity + 0.5 px blur).
- Modal shell: 14 px radius, white, `0 24px 60px rgba(0,0,0,0.28)` shadow.

**Header** (18 / 24 px padding, 1 px bottom border):
- 36 × 36 px square `#e8f1fb` tile with primary QR glyph.
- Title: "Generate QR Codes — Amoxicillin 500mg" (15 px, 700, line-height 1.2).
- Subtitle: "Each sticker encodes a unique serial + batch + signed HMAC." (11.5 px muted).
- Close × on right (28 × 28, muted on hover bg).

**Body** (22 / 24 px padding, two-column grid: `1fr 220px`, 24 px gap):

**Left column — Form (vertical stack, 16 px gap):**

| Field | Type | Width | Validation | Copy |
|---|---|---|---|---|
| **Product** | read-only text | full | n/a | Pre-filled from context. `#F4F6F8` bg, muted text. |
| **Batch ID** | text | half (12 px gap with Quantity) | Required. Max 32 chars. Pattern `^[A-Z0-9-]+$` (uppercase, digits, hyphens). Unique per product. | Label "Batch ID *", placeholder "e.g. MAY-2026-A", hint "Used to label this print run". Error → "Batch ID 'MAY-2026-A' already exists for this product". |
| **Quantity** | number | half | Required. Integer 1–10,000. | Label "Quantity *", placeholder "1000", hint "1 – 10,000". Errors: <br>• Empty: "Quantity is required" <br>• `<1`: "Quantity must be at least 1" <br>• `>10000`: "Quantity can't exceed 10,000 per batch" <br>• non-integer: "Whole numbers only" |
| **Serial prefix** | text + mono font | full | Optional. Max 8 chars. Pattern `^[A-Z0-9-]*$`. | Label "Serial prefix" + small "Optional" tag. Hint shows live range: "Serials become PP-000001 … PP-010000". |
| **Output format** | segmented control | full | Required, default "PDF sheet" | "PDF sheet" / "ZIP of PNGs". Below: 10.5 px muted hint that describes the chosen format. |

Field component:
- Label: 12 px, 700, body color, optional red `*` for required.
- Hint (right-aligned, 10 px muted) OR error (10.5 px error red with red dot bullet).
- Input: 38 px tall, 1.5 px border `#EAEAEA`, 7 px radius. On error: red border + 3 px `#fde8e8` halo.

Segmented control:
- Inset on `#F4F6F8` (1 px border), 3 px inner padding, 8 px radius.
- Each option: 7 / 14 px padding, 12 px / 600. Selected → white bg, primary text, 700, soft shadow.

Format hint copy (changes by selection):
- **PDF sheet:** "A4 sheet, 35 stickers per page (5 × 7 grid, 38 × 38 mm each). Print-ready."
- **ZIP of PNGs:** "One 600 × 600 px PNG per code, named by serial. ZIP archive."

**Right column — Sample preview (220 px):**
- Uppercase label: "Sample preview" (10 px, 700, muted).
- Preview tile: `#F4F6F8` bg, 10 px radius, 1 px border. Centered:
  - QR rendered at 156 px on white inside a 10 px white-padded sub-tile (8 px radius, border). The QR must be regenerated client-side from the live payload so the preview stays in sync as the admin types.
  - Mono serial label below: "PP-000001" (11 px, 700).
- "Encoded payload" mini-card:
  - 9 px uppercase caption muted.
  - The payload string in 9.5 px monospace, wrap-anywhere, line-height 1.5. Example: `https://piipharma.in/q/PP-000001?b=MAY-2026-A&p=amx500&h=a1f3b9c7`
  - **Encoding format to implement** — URL like the above, where:
    - `q/<serial>` — unique sticker ID
    - `?b=<batch_id>` — admin label
    - `&p=<product_id>` — product slug
    - `&h=<hmac>` — first 8 hex chars of an HMAC-SHA256(serial+batch+product, secret_key)

**Footer** (14 / 24 px padding, top 1 px border, `#fbfbfc` bg):
- Left: 11 px muted note "Stickers can be reprinted any time from Batch History."
- Right: **Cancel** (ghost) + **Generate & Download** (primary, with QR glyph, soft elevation).

**Interaction:**
- Generate button stays enabled but disabled-visual until all required fields valid.
- Client-side validate on blur + on submit attempt.
- On submit → POST `/api/admin/qr-batches` with body `{product_id, batch_id, quantity, serial_prefix, format}`. Transition to Screen 03 immediately (optimistic spinner).
- Esc and overlay-click close (with confirm dialog if any field touched).

---

### Screen 03 — Generation in progress

**Purpose:** Reassure the admin that work is happening and show that the batch is real.

**Layout:**
- Same modal shell, narrower (**560 px**).
- Header: title "Generating QR codes…", subtitle "Amoxicillin 500mg · Batch MAY-2026-A".

**Body** (30 / 36 px padding, 20 px gap, centered):
- Pulsing QR — 140 × 140 px slot containing a 100 px placeholder QR on a white 10 px-padded card with soft primary elevation. Two concentric primary outlines at `-6 px` and `-14 px` insets, 18 % and 8 % opacity.
- Animation: `qrpulse` keyframes — `0%/100% { opacity:1; transform:scale(1) } 50% { opacity:0.4; transform:scale(0.85) }` on a small primary dot in the status row (1.2 s ease-in-out, infinite).
- **Live count** — `6,420 / 10,000` with 34 px / 18 px Montserrat 700 numerals, en-IN locale formatting.
- **Progress bar** — 8 px tall, full-width, `#EAEAEA` track, fill is `linear-gradient(90deg, #2372B9, #24AEB1)`, animated width on each tick.
- Below the bar (flex row, justify-between):
  - Left: small pulsing primary dot + "Signing & rendering codes" (11.5 px muted).
  - Right: "64 % · ~4 s left" (11.5 px, primary, 700).
- Centered tertiary note (11 px muted, max-width 340): "Keep this window open. The file will start downloading automatically when ready."

**Footer:**
- Left note: "Cancelling discards all generated codes."
- Right: only a single **"Cancel generation"** ghost button.

**Interaction:**
- Poll progress endpoint (or stream via SSE / WebSocket) every 500–1000 ms.
- ETA = `(elapsed_ms / done) * (total - done) / 1000`, rounded to whole seconds.
- Cancel → confirm "Discard 6,420 generated codes?" → on yes, DELETE the in-progress batch.
- On completion → auto-transition to Screen 04 and auto-start file download.

---

### Screen 04 — Success / download-ready

**Purpose:** Confirm completion, summarize, deliver the file.

**Layout:**
- Same modal, **560 px**.
- Header carries a status pill on the right (next to title block): green dot + "Ready to download" on `#f0f9e6` bg.
- Title: "Batch ready". Subtitle: "10,000 QR codes generated and signed."

**Body** (24 / 28 px padding, 18 px gap):

**File card** (`#f0f9e6` bg, `#93CB52` border, 10 px radius, 16 / 18 px padding):
- 44 px round success-green badge with white check on left.
- Bold filename: `piipharma_amoxicillin-500mg_MAY-2026-A.pdf` (14 px, 700, dark green text).
- Meta line: "286 pages · 8.4 MB · expires in 7 days" (11 px).
  - Note: 10,000 codes / 35 per page = 286 pages (round up).
  - "Expires in 7 days" = pre-signed S3 URL expiry; after that, admin re-downloads via Batch History which generates a fresh URL.

**Summary block** (`#F4F6F8` bg, 10 px radius, 14 / 16 px padding):
- "Summary" caption (10 px upper muted).
- Key/value rows, each 5 px vertical pad + 1 px bottom border:
  - Product — "Amoxicillin 500mg"
  - Batch ID — "MAY-2026-A"
  - Quantity — "10,000 stickers"
  - Serial range — "PP-000001 → PP-010000" (mono)
  - Format — "PDF sheet · A4 · 35 per page"
  - Generated — "15 May 2026, 3:42 PM IST · by Sneha Agarwal"

**Info note** (8 px vertical):
- Small info-circle in primary + "You can re-download this batch any time from **Batch History**." (Batch History is bolded primary, links to Screen 05.)

**Footer:**
- Left note: empty (no warning needed).
- **Generate another** (ghost, returns to Screen 02 form with cleared values) + **Download PDF** (primary with download glyph, soft elevation).

**Interaction:**
- On reach, automatically trigger browser download.
- "Generate another" → reset modal state to Screen 02 with product pre-filled; Batch ID + Quantity cleared, serial prefix preserved.
- Close × persists Batch History entry.

---

### Screen 05 — Batch history (Product detail · Batches tab)

**Purpose:** Audit log + reprint surface, per product.

**Layout:**
- Standard admin shell. URL: `/admin/products/<slug>/batches`.
- 28 / 36 px page padding.

**Breadcrumb:** "Products / Amoxicillin 500mg" — "Products" is primary clickable, slash muted, current product body color.

**Title row:**
- `h1` "Amoxicillin 500mg" (22 px, 700) on left.
- Primary button **"Generate new batch"** (with QR glyph + soft elevation) on right.

**Subtitle line:** "5 coupons required · ₹100 cashback · 32,500 stickers in market · 6 batches printed" (12 px muted).

**Tabs** (bottom border style, marginBottom 18 px): Overview · **Batches (6)** · Settings.

**KPI strip** — `repeat(4, 1fr)`, 14 px gap. Each tile: white, 10 px radius, 14 / 16 px padding, 1 px border, soft shadow.

| Tile | Value | Accent | Sub |
|---|---|---|---|
| Total stickers printed | 35,000 | primary | "across 6 batches" |
| In market | 32,500 | body | "93% of printed" |
| Scanned at least once | 18,420 | success | "56% of in-market" |
| Last batch | 15 May | warning | "10,000 codes" |

**Toolbar row** (12 px gap below): heading "Batch history" (14 px, 700) + "6 batches" muted count + flex-spacer + search input ("Search batch ID", 32 px tall, magnifying-glass leading).

**Table** — uses existing `THead`/`TR`/`TD` primitives. Columns:

1. **Batch ID** — mono, 12 px, primary 700.
2. **Quantity** — body, 700, en-IN formatted.
3. **Serial Range** — mono 11 px muted, e.g. `PP-000001 → PP-010000`.
4. **Format** — pill: `PDF · 8.4 MB` on red-tinted bg `#fde8e8`/`#9b2626`, `ZIP · 62.0 MB` on primary-tinted `#e8f1fb`/`#14407a`. 10 px / 700 / 2 × 7 px padding.
5. **Generated** — "15 May 2026, 3:42 PM" (12 px muted).
6. **By** — admin name.
7. **Status** — `Active` pill (green dot, `#f0f9e6` / `#3d6e10`) or `Archived` pill (grey).
8. **Actions** — `Re-download` button (white bg, primary text, 1.5 px border, download glyph) + 28 × 26 px overflow `⋯` icon button.

**Seed rows** (use as a reference data shape):
| Batch ID | Qty | Range | Fmt | Generated | By | Status |
|---|---|---|---|---|---|---|
| MAY-2026-A | 10,000 | PP-000001 → PP-010000 | PDF · 8.4 MB | 15 May 2026, 3:42 PM | Sneha Agarwal | Active |
| APR-2026-C | 5,000 | PP-040001 → PP-045000 | PDF · 4.2 MB | 28 Apr 2026, 11:08 AM | Sneha Agarwal | Active |
| APR-2026-B | 5,000 | PP-035001 → PP-040000 | ZIP · 62.0 MB | 12 Apr 2026, 5:21 PM | Rohit Verma | Active |
| APR-2026-A | 2,500 | PP-032501 → PP-035000 | PDF · 2.1 MB | 02 Apr 2026, 9:15 AM | Rohit Verma | Active |
| MAR-2026-B | 5,000 | PP-027501 → PP-032500 | PDF · 4.2 MB | 21 Mar 2026, 2:47 PM | Sneha Agarwal | Active |
| MAR-2026-A | 7,500 | PP-020001 → PP-027500 | ZIP · 94.0 MB | 04 Mar 2026, 10:30 AM | Sneha Agarwal | Archived |

**Empty state (when 0 batches):**
- Centered card: dashed QR-icon tile, "No batches printed yet", muted body "Generate your first batch to start placing stickers on product boxes.", primary CTA "Generate first batch". (Reuse the existing `EmptyState` component pattern from the design system, swapping the icon.)

**Overflow menu actions:**
- "View payload sample"
- "Copy serial range"
- "Archive batch" (or "Restore" if archived)
- "Download CSV of serials"

**Interactions:**
- Generate new batch → Screen 02 modal.
- Re-download → fresh pre-signed URL, downloads immediately. If batch is archived, show confirm "This batch is archived. Continue?".
- Search filter by batch ID (substring, case-insensitive).
- Sort: default newest-first by generated_at.

---

### Screen 06 — Error (serial range collision)

**Purpose:** Recover from the most common failure — admin re-used a serial prefix that overlaps with an existing batch.

**Layout:**
- Same modal shell, **620 px**.
- Header: title "Couldn't generate batch", subtitle "Amoxicillin 500mg · attempted MAY-2026-A", red status pill "Generation failed" on right.

**Body** (22 / 24 px padding, 16 px gap):

**Error block** (`#fde8e8` bg, 1 px error border, 4 px left border, 10 px radius, 14 / 16 px padding, flex row 14 px gap):
- 32 px round error badge with white alert triangle.
- Heading "Serial range collision" (13 px, 700, dark red).
- Body (12 px, normal): "Serials `PP-000001 → PP-010000` overlap with an existing batch. Choose a different serial prefix or let the system auto-assign the next available range." Serial range is monospace + 700.

**Conflicts-with card** (`#F4F6F8` bg, 10 px radius, 1 px border, 12 / 14 px padding):
- 10 px upper caption "Conflicts with".
- Row containing existing batch info:
  - Bold mono batch ID "APR-2026-C" (12.5 px / 700).
  - Sub-line: "5,000 codes · printed 28 Apr 2026 · serials PP-000001 → PP-005000" (11 px muted).
  - Right side: "View batch" link button (history glyph + primary text) → opens that batch detail.

**Suggested fix banner** (`#e8f1fb` bg, 1 px primary border, 10 px radius, 12 / 14 px padding, flex row):
- 24 px round primary badge with white info-i.
- Copy: "**Suggested:** Use next available range `PP-045001 → PP-055000`, or change prefix to e.g. `PP-MAY-`." Ranges + prefix in mono 700 dark primary.

**Trace line** (10.5 px monospace muted):
- `Error code: QR_SERIAL_COLLISION · trace: req_8c4a91e2`
- Helps support look up the failure in logs.

**Footer:**
- Left note: "No codes were generated. No charges or changes to inventory." (Reassures atomicity.)
- **Edit values** (ghost, returns to form preserving inputs) + **Use next available range** (primary, auto-bumps the prefix range and retries).

**Other error variants the implementation must handle:**

| Code | When | Modal title | Recovery action |
|---|---|---|---|
| `QR_SERIAL_COLLISION` | Range overlaps existing batch | "Couldn't generate batch" | "Use next available range" |
| `QR_BATCH_ID_TAKEN` | Batch ID already used for product | "Batch ID already exists" | "Auto-append suffix" (becomes MAY-2026-A-1) |
| `QR_QUANTITY_INVALID` | Server-side validation failed | "Invalid quantity" | "Edit values" |
| `QR_PRODUCT_INACTIVE` | Product was deactivated mid-flow | "Product is inactive" | "Reactivate product" link |
| `QR_RATE_LIMITED` | Too many batches in a short window | "Slow down" | Disabled CTA with countdown |
| `QR_INTERNAL` | Anything else | "Something went wrong" | "Try again" + support link |

All errors are atomic — never leave a partial batch in the database.

---

## Interactions & Behavior

### Modal state machine

```
[Form] --submit--> [Progress] --done--> [Success]
                       |                    |
                       cancel-->[Form]      generate-another-->[Form]
                       |                    |
                       error-->[Error]      close-->[exit]
[Error] --edit-values--> [Form]   (preserves all inputs)
[Error] --use-next-range--> [Progress] (retries with auto-bumped prefix)
```

### Animations & transitions

- Modal enter: 180 ms ease, opacity 0→1, scale 0.97→1 (`popIn` keyframes already in source).
- Card hover (product cards & batch rows): `transform: scale(1.015)`, 180 ms.
- Progress dot pulse: 1.2 s ease-in-out infinite.
- Progress bar fill: 400 ms `width` transition.
- Sample QR re-render: instant (debounce 100 ms on input change).
- Status pill state changes: 200 ms color crossfade.

### Form validation

Validate on **blur** (first time field is touched) and on **submit attempt**. Don't validate while typing — too noisy. Show inline error below field + red border + red halo. Disable-style (but keep clickable) the primary CTA until the form is at least syntactically valid; on click of an invalid form, focus the first invalid field.

### Keyboard

- `Esc` closes the modal (with confirm if dirty).
- `Tab` order: Batch ID → Quantity → Serial prefix → Format toggle → Cancel → Generate.
- `Enter` inside any text field submits.
- In Batch History: `/` focuses search.

### Responsive (768 px floor)

- Modal: drop right column (sample preview) **below** the form at < 640 px modal width.
- Product grid: 2-col at < 1024 px, 1-col at < 720 px.
- Batch history table: at < 1024 px, collapse "By", "Format", "Status" into a stacked sub-row on each card.

---

## State Management

### Local component state (modal)

```ts
type ModalState =
  | { phase: 'form';     values: FormValues; errors: FieldErrors }
  | { phase: 'progress'; batchId: string; done: number; total: number; startedAt: number }
  | { phase: 'success';  batch: Batch; downloadUrl: string }
  | { phase: 'error';    code: ErrorCode; conflictBatch?: Batch; values: FormValues };

type FormValues = {
  productId: string;        // pre-filled, read-only
  batchId: string;          // required
  quantity: number | null;  // required, 1–10000
  serialPrefix: string;     // optional, may be ''
  format: 'pdf' | 'zip';    // default 'pdf'
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;
```

### Server state (via your existing data layer — TanStack Query / RTK / Apollo / etc.)

```ts
// Queries
GET  /api/admin/products                         -> Product[]
GET  /api/admin/products/:id/batches?search=&page= -> { rows: Batch[]; total: number }
GET  /api/admin/products/:id/batches/:batchId    -> Batch
GET  /api/admin/products/:id/stats               -> ProductStats   // for KPI strip

// Mutations
POST   /api/admin/qr-batches                     -> { batchId, jobId } | error
GET    /api/admin/qr-batches/:jobId/progress     -> { done, total, status } // poll or SSE
GET    /api/admin/qr-batches/:jobId/file         -> 302 → presigned URL
POST   /api/admin/qr-batches/:jobId/cancel       -> 204
PATCH  /api/admin/products/:id                   -> Product       // active toggle
```

### Batch entity shape

```ts
type Batch = {
  id: string;                  // batch_id, e.g. "MAY-2026-A"
  productId: string;
  productName: string;
  quantity: number;
  serialPrefix: string;
  serialStart: string;         // "PP-000001"
  serialEnd: string;           // "PP-010000"
  format: 'pdf' | 'zip';
  fileSizeBytes: number;
  pageCount?: number;          // PDF only
  generatedAt: string;         // ISO
  generatedBy: { id: string; name: string };
  status: 'active' | 'archived';
};
```

---

## Design Tokens

All tokens taken from `PiiPharma Design System.html` — the existing source of truth for the admin.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2372B9` | Buttons, links, primary actions |
| `--color-primary-dark` | `#1a5a99` | Primary hover |
| `--color-primary-light` | `#e8f1fb` | Primary backgrounds, halos |
| `--color-secondary` | `#24AEB1` | Progress gradient end |
| `--color-success` | `#3d8c1a` | Toggle on, success bg ends |
| `--color-success-soft` | `#93CB52` | Success-state borders |
| `--color-success-light` | `#f0f9e6` | Success card bg |
| `--color-error` | `#E53E3E` | Error states, validation |
| `--color-error-light` | `#fde8e8` | Error card bg, file-format pill |
| `--color-warning` | `#F59E0B` | KPI warning accent |
| `--color-warning-light` | `#fef3cd` | Pending pill bg |
| `--color-body` | `#474545` | Primary text |
| `--color-muted` | `#686868` | Secondary text |
| `--color-white` | `#FFFFFF` | Surfaces |
| `--color-surface` | `#F4F6F8` | Cards, inset blocks |
| `--color-border` | `#EAEAEA` | All borders |
| `--color-sidebar` | `#141f2e` | Sidebar bg |

### Typography

- Family: **Montserrat** (Google Fonts), weights `400, 500, 600, 700, 900`.
- Monospace: system mono (for serials, payloads, error codes, traces).

| Use | Size | Weight |
|---|---|---|
| Page H1 | 22 px | 700 |
| Modal title | 15 px | 700 |
| Card title | 14 px | 700 |
| Body | 13 px | 400 / 600 |
| Form label | 12 px | 700 |
| Caption (muted) | 11 / 11.5 / 12 px | 500 |
| Upper-case caption | 10 px | 700, letter-spacing 0.07–0.08 em |
| Big stat | 22 / 34 px | 700 |
| Mono code | 9–12 px | varies |

### Spacing

8 px base grid: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`. Layout sections use multiples of 8; tight typographic stacks use 4–6.

### Radii

- 4 px — inputs, sub-tiles
- 7 px — buttons, form controls
- 8 px — sub-cards, segmented control
- 10 px — major cards, blocks
- 14 px — modal shell
- 99 px / 50 % — pills, dots, avatars

### Shadows

- Card resting: `0 1px 4px rgba(0,0,0,0.04)`
- Card elevated/hover: `0 2px 12px rgba(0,0,0,0.06)`
- Primary CTA: `0 2px 8px rgba(35,114,185,0.3)` (matches existing admin)
- Modal: `0 24px 60px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.12)`
- Highlighted card (Generate QR target): `0 0 0 3px #e8f1fb, 0 6px 18px rgba(35,114,185,0.18)`

---

## Assets

- **Icons** — all icons in the design are inline SVGs (in `qr-screens.jsx` see the `I` object). Migrate them to your icon system (Lucide, Heroicons, hand-rolled) using the same paths. Specific glyphs needed: QR-grid, edit/pencil, download, X/close, check, alert-triangle, info-circle, clock-history, search, chevron-down.
- **QR rendering** — the design uses a **placeholder** SVG grid (`SampleQR` in `qr-screens.jsx`). In production, use a real QR library:
  - JS preview: `qrcode` (npm) or `qr-code-styling`.
  - Server-side rendering for batch output: a Python/Go/Node library that supports SVG output (e.g. `qrcode` Python, `go-qrcode`, `qrcode-svg`). PDF assembly via `pdfkit` / `reportlab` / `WeasyPrint`.
  - **Error correction:** at least level M (15 %) so the sticker survives mild damage. Level Q (25 %) is better for pharma where the sticker may be partially obscured by labels.
- **Fonts** — Montserrat 400/500/600/700/900 from Google Fonts. Already loaded in `<link>`.
- **Logo / brand** — the "Pii" wordmark tile is text in primary blue. Not an image asset.

---

## Backend Notes

The frontend lead should sync with backend on:

1. **Atomic batch creation.** Generating 10,000 codes must be transactional. Either commit all serials + the batch row, or roll back. The error modal's "No codes were generated" copy is a contract.
2. **Serial uniqueness.** Use a unique constraint on `(product_id, serial)`. Reserve the range up front before signing — that's how `QR_SERIAL_COLLISION` is detected.
3. **HMAC signing.** Server-side only. Key rotation strategy needed; QR payload may want to include a `k=v1` key-version tag so old stickers stay verifiable.
4. **Job runtime.** 10,000 SVGs + PDF assembly is ~ 5–15 s in most stacks. Run async (background worker) and stream progress. The progress polling endpoint should be cheap (just reads job state).
5. **File storage.** Output goes to object storage (S3-compatible). Pre-signed URLs, 7-day expiry. Re-download from Batch History generates a fresh URL on demand — files themselves are retained.
6. **Audit log.** Persist `generated_by` (admin user id + name snapshot at time of generation). Visible in Screen 04 and 05.

---

## Files in this handoff

| File | What it is |
|---|---|
| `QR Generator.html` | Canvas page that lays out all 6 screens at scaled-down + click-to-focus. Open this first. |
| `qr-screens.jsx` | All 6 screen components. Source of truth for layout, copy, validation strings, error codes. |
| `admin-screens.jsx` | Existing admin primitives (`Sidebar`, `AdminLayout`, `Btn`, `THead`/`TR`/`TD`, `ABadge`, `Pagination`, `ASelect`, `AInput`). The QR screens depend on these — they're included so you can see how the rest of the admin is built and stay consistent. |
| `PiiPharma Design System.html` | Full component library + tokens reference. Treat as canonical for any styling decision not covered here. |

To preview: open `QR Generator.html` in a browser. Click any screen to zoom; use ← / → to navigate.
