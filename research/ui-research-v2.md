# UI Research v2 — PiiPharma Retailer Loyalty Portal

**Date:** April 2026  
**Scope:** Full UX/UI design proposal for the retailer-facing portal (`loyalty.piipharma.com`)  
**Audience:** Pharmacy shop owners, semi-urban India, predominantly mobile users

---

## 1. Portal Sections — What Needs to Be Designed

The retailer portal has **6 distinct screens/sections**, each with its own UX purpose:

| # | Screen | Route | Purpose |
|---|--------|--------|---------|
| 1 | **Landing / Login** | `/` | First impression + mobile number entry |
| 2 | **OTP Verification** | `/` (step 2) | 6-digit WhatsApp/SMS OTP |
| 3 | **Registration** | `/app/register` | One-time name + city + state + UPI setup |
| 4 | **Dashboard / Product List** | `/app` | Show claimable products + per-product coupon progress |
| 5 | **Coupon Submission** | `/app/claim/[productId]` | One photo + one serial per visit; accumulates toward threshold |
| 6 | **Claim History** | `/app/history` | Past claims (auto-created on threshold) with status badges |
| 7 | **Profile / UPI Update** | `/app/profile` | Edit name, UPI ID |

---

## 2. Brand Application Rules

### Logo Usage
- Use the PiiPharma wordmark at the top of every screen — not just the landing page.
- Size: `h-8` (32px height), left-aligned with padding, never centered (centering feels like a splash screen, not a utility app).
- Pair with the app sub-name in smaller text below or beside: **"Retailer Cashback"** — so the portal has identity separate from the main marketing site.
- On the landing screen only: logo can be slightly larger (`h-10`) with more vertical breathing room above it.

### Taglines
Use context-specific taglines, not one global tagline:

| Screen | Tagline |
|--------|---------|
| Landing | "Claim your PiiPharma cashback — on WhatsApp, in seconds." |
| After OTP | "Welcome back, [Name]." (returning) / "Almost there — set up takes under a minute." (new) |
| Dashboard | "What would you like to claim today?" |
| Claim success | "Claim submitted. We'll review and credit your UPI within [X] days." |
| History (empty) | "No claims yet. Start with a product below." |

**Hindi subheadline on landing screen only (trust signal):**
> "कूपन कैशबैक यहाँ क्लेम करें"

This one line signals the app is made for Indian retailers, not urban English-first users. Place it in `text-sm text-[#6b7280]` below the English tagline.

---

## 3. Screen-by-Screen Design Proposals

---

### Screen 1: Landing / Login

**Mental model of the user:** "I got a WhatsApp link. What is this? Is it real? What do I have to do?"

**Layout (top to bottom):**

```
┌─────────────────────────────┐
│  [PiiPharma logo]           │  ← h-10, left-aligned, mt-8
│  Retailer Cashback          │  ← text-xs text-[#6b7280] tracking-widest uppercase
│                             │
│                             │  ← spacer, ~32px
│                             │
│  Claim your PiiPharma       │  ← text-2xl font-bold text-[#1a1a2e]
│  cashback instantly.        │
│                             │
│  Upload your coupon.        │  ← text-sm text-[#6b7280]
│  Get cashback on UPI.       │
│  No paperwork.              │
│                             │
│  कूपन कैशबैक यहाँ क्लेम करें │  ← text-sm text-[#6b7280]
│                             │
│  ────────────────────────── │  ← thin divider, ~24px margin top/bottom
│                             │
│  [+91] [__________________] │  ← THE HERO ELEMENT (see below)
│        Your mobile number   │
│                             │
│  [     Send OTP on WhatsApp   ] │  ← Primary CTA button
│                             │
│  No password needed.        │  ← text-xs text-[#9ca3af] text-center
│  We'll send a code on       │
│  WhatsApp.                  │
│                             │
│                             │
│  ── ISO 9001:2015 ── GMP ── │  ← trust footer, very small, bottom
└─────────────────────────────┘
```

**The mobile number input — hero element:**

This is the most critical UI element in the entire portal. It must feel substantial and effortless.

```
┌────┬──────────────────────────┐
│+91 │                          │  ← height: 56px (not the standard 44px)
└────┴──────────────────────────┘
```

- **Height:** 56px — larger than standard inputs. This signals "this is the main action."
- **Font size inside the input:** 22px, font-weight 600 — digits feel solid and readable
- **+91 prefix:** Static, non-editable, separated by a vertical line inside the input. Background `#f5f6f7`, slightly recessed. Never a dropdown.
- **Border on focus:** `2px solid #2372b9` — not just a ring, a full border. The blue glow signals "this is live."
- **Label:** "Your mobile number" — above the field at 13px/600, not inside as placeholder.
- **Auto-advance:** Automatically move to OTP screen on 10th digit entry. No "Send OTP" tap needed after number is complete — the button is a fallback for users who don't type all 10 digits in one go.
- **Keyboard:** `inputmode="numeric"` — Android numeric pad, no letters.

**Trust footer:**  
At the very bottom, a 1px `#e2e4e7` divider followed by:  
`ISO 9001:2015 Certified · GMP Compliant`  
in `text-[11px] text-[#9ca3af]` — barely visible but credibility-building for retailers who've seen PiiPharma's packaging.

---

### Screen 2: OTP Verification

**Layout:**

```
┌─────────────────────────────┐
│  ← Back                     │  ← back arrow, takes to landing
│                             │
│  [PiiPharma logo small]     │
│                             │
│  Check your WhatsApp        │  ← text-xl font-bold
│                             │
│  We sent a 6-digit code to  │  ← text-sm text-[#6b7280]
│  your WhatsApp at           │
│  +91 98765 43210  ✏️         │  ← number in blue, pencil icon to edit
│                             │
│  [WhatsApp icon]            │  ← green WhatsApp logo, 24px
│                             │
│  [______________________]   │  ← OTP field — see below
│                             │
│  Resend in 0:28             │  ← countdown, switches to "Resend OTP" link
│                             │
│  [     Verify Code        ] │  ← appears only if not auto-submitted
│                             │
│                             │
│  Having trouble? Contact    │  ← text-xs text-[#9ca3af]
│  your PiiPharma sales rep.  │
└─────────────────────────────┘
```

**OTP input:**
- Single wide field, `text-2xl font-bold tracking-[0.5em]` — digits appear with wide spacing to simulate segmented boxes visually, but it's one input
- `inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"`
- Auto-focus on screen load
- Auto-submit on 6th digit (show inline spinner in the verify button)
- On error: field border turns `#dc2626`, digits auto-clear, error text appears below: "Incorrect code. 2 attempts remaining."

**Channel messaging:**  
If SMS fallback is triggered, update the subtext to:  
"WhatsApp delivery failed. Code sent via SMS to +91 XXXXXX90."  
This prevents retailer confusion about which app to check.

**Resend timer:**  
30-second countdown in `text-sm text-[#6b7280]`: "Resend in 0:28"  
After timer expires, replace with: "Resend OTP" in `text-[#2372b9] font-semibold underline`

---

### Screen 3: Registration (First-Time Only)

**Layout:**

```
┌─────────────────────────────┐
│  [PiiPharma logo small]     │
│                             │
│  Set up your account        │  ← text-xl font-bold
│  Takes under a minute.      │  ← text-sm text-[#6b7280]
│                             │
│  ● ─── ─── ───              │  ← 4-step progress dots (optional, very subtle)
│  Step 1 of 1                │  ← or just this
│                             │
│  Full Name                  │  ← label
│  [_______________________]  │
│                             │
│  City                       │
│  [_______________________]  │
│                             │
│  State                      │
│  [_______________________]  │
│                             │
│  UPI ID                     │
│  [_______________________]  │
│  e.g. shopname@okaxis  ℹ️   │  ← hint text with info icon
│                             │
│  [   Save and Continue    ] │
│                             │
│  Your UPI ID is used only   │  ← text-xs text-[#9ca3af]
│  for cashback transfers.    │
└─────────────────────────────┘
```

**UPI ID field specifics:**
- `autocapitalize="none"`, `spellcheck="false"`, `autocorrect="off"`, `autocomplete="off"` — all four, because keyboards will destroy UPI handles otherwise
- Real-time validation on blur: show green `✓` when format is `something@something`
- Error on submit if invalid: "UPI ID should look like shopname@okaxis or 9876543210@ybl"
- Inline helper text below the field: "e.g. shopname@okaxis" — always visible, not on hover

**Privacy micro-copy:**  
`"Your UPI ID is used only for cashback transfers. Never shared."` in `text-[11px] text-[#9ca3af]` below the submit button — this addresses the single biggest anxiety (UPI phishing scams) directly.

---

### Screen 4: Dashboard / Product List

**Mental model:** The retailer scans the list to see how close they are to earning cashback for each product. Progress is the primary signal.

**Layout:**

```
┌─────────────────────────────┐
│  [PiiPharma logo]  [👤 Ayush]│  ← logo left, avatar/name right
│                             │
│  What would you like        │  ← text-xl font-bold
│  to claim today?            │
│                             │
│  ┌─────────────────────────┐│
│  │ [Product Name]           ││  ← Product card
│  │ ₹50 cashback             ││  ← cashback amount prominent
│  │ ██████░░░░  2 / 3 coupons││  ← progress bar + count
│  │                  [+ Add] ││  ← Add Coupon button, right-aligned
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ [Product Name]           ││
│  │ ₹30 cashback             ││
│  │ ░░░░░░░░░░  0 / 5 coupons││
│  │                  [+ Add] ││
│  └─────────────────────────┘│
│                             │
│  ┌──────────────────────── ┐│
│  │ [Product Name]  ✓ SENT  ││  ← fully submitted, pending review
│  │ ₹20 cashback             ││
│  │ Submitted for review     ││  ← no Add button, greyed card
│  └─────────────────────────┘│
│                             │
│  [🏠 Home] [📋 History] [👤]│
└─────────────────────────────┘
```

**Product cards:**
- Cashback amount: `text-xl font-bold text-[#2372b9]` — most prominent element
- Product name: `text-base font-semibold text-[#1a1a2e]`
- Progress bar: `w-full h-2 rounded-full bg-[#e2e4e7]` with fill `bg-[#2372b9]`, width = `(submitted/required * 100)%`
- Coupon count: `text-sm text-[#6b7280]` — "2 / 3 coupons"
- "Add Coupon" button: secondary blue outline, right-aligned, `text-sm`
- When a claim has been auto-submitted for this product (pending/approved): replace button with a "Sent for review" badge, card background `bg-[#f5f6f7]`, no Add button

**Loading state:** 2–3 skeleton cards with grey animated shimmer — not a spinner.

---

### Screen 5: Coupon Submission (one coupon at a time)

**Mental model:** The retailer just sold a product, has a coupon in hand, and wants to log it quickly. This is a 2-tap flow: photo → serial → save. They do this once per coupon, across multiple days if needed.

**Layout:**

```
┌─────────────────────────────┐
│  ← [Product Name]           │  ← back arrow + product as title
│                             │
│  ₹50 cashback · 1 of 3      │  ← progress reminder, text-sm text-[#6b7280]
│  ██░░░░░░░░                 │  ← thin progress bar showing current count
│                             │
│  ┌─────────────────────────┐│
│  │                          ││  ← photo capture zone
│  │   📷 Tap to photograph   ││     dashed border #2372b9
│  │      the coupon          ││     min-height: 180px
│  │                          ││
│  └─────────────────────────┘│
│  Photo will be reviewed     │  ← text-xs text-[#9ca3af]
│  before approval.           │
│                             │
│  Coupon Serial Number       │  ← label, text-sm font-semibold
│  [_______________________]  │
│  Number printed on coupon.  │  ← hint, text-xs text-[#6b7280]
│                             │
│  [   Save Coupon          ] │  ← primary, disabled until photo + serial filled
└─────────────────────────────┘
```

**After saving — post-save screen (replaces form):**

```
┌─────────────────────────────┐
│  ← [Product Name]           │
│                             │
│         ✓                   │  ← checkmark, #16a34a, 40px
│   Coupon saved!             │  ← text-xl font-bold
│                             │
│  ██████░░░░  2 / 3 coupons  │  ← updated progress bar
│  1 more coupon to go        │  ← text-sm text-[#6b7280]
│  for ₹50 cashback.          │
│                             │
│  [  + Add another coupon  ] │  ← primary button → reloads form
│  [     Done for now       ] │  ← secondary button → /app
└─────────────────────────────┘
```

**If this coupon tips over the threshold (auto-qualified):**

```
│         ✓                   │  ← larger, #16a34a
│   You've qualified!         │  ← text-xl font-bold
│                             │
│  All 3 coupons submitted.   │
│  We'll review and credit    │
│  ₹50 to your UPI within     │
│  2–3 business days.         │
│                             │
│  [ View My Claims ]         │  ← primary → /app/history
│  [ Back to Home   ]         │  ← secondary → /app
```

**Photo capture specifics:**
- `accept="image/*" capture="environment"` — defaults to rear camera on Android; iOS shows camera/gallery picker
- Compress to <500KB client-side before upload
- After capture: show thumbnail preview with a "Retake" (×) option
- No gallery-first UX — camera is the primary intent

**Serial number field:**
- `autocapitalize="characters"`, `autocorrect="off"`, `spellcheck="false"` — alphanumeric serials
- Single field only — one serial per coupon

**Save button disabled state:** Disabled until photo is captured AND serial is entered.

---

### Screen 6: Claim History

**Layout:**

```
┌─────────────────────────────┐
│  [PiiPharma logo]  [👤 Name]│
│                             │
│  Your Claims                │  ← text-xl font-bold
│                             │
│  ┌─────────────────────────┐│
│  │ ProductName   [PENDING] ││  ← status badge, right-aligned
│  │ Submitted 12 Apr 2026   ││  ← text-xs text-[#6b7280]
│  │ Cashback: ₹50           ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ ProductName  [APPROVED] ││
│  │ Submitted 05 Apr 2026   ││
│  │ Cashback: ₹30           ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ ProductName  [REJECTED] ││
│  │ Submitted 01 Apr 2026   ││
│  │ Reason: Invalid photo   ││  ← show rejection reason if rejected
│  └─────────────────────────┘│
│                             │
│  [🏠 Home] [📋 History] [👤]│
└─────────────────────────────┘
```

**Empty state:**
```
  [icon: clipboard with a tick, 48px, #9ca3af]
  No claims yet.
  Start by claiming a product
  from the home screen.
  
  [ Go to Home ]   ← secondary button
```

**Rejection reason:** Always show it. Retailers need to know why their claim was rejected to fix and resubmit. `text-xs text-[#dc2626]` with a soft red tint on the card background (`bg-[#fff5f5]`).

---

### Screen 7: Profile / UPI Update

**Layout:**

```
┌─────────────────────────────┐
│  ← Profile                  │
│                             │
│  [👤 large avatar initial]  │  ← 64px circle, bg-[#2372b9], white initial letter
│  Ayush Jhunjhunwala         │  ← text-xl font-bold, center
│  +91 98765 43210            │  ← text-sm text-[#6b7280], center
│                             │
│  ─────────────────────────  │
│                             │
│  Full Name                  │
│  [Ayush Jhunjhunwala_____]  │
│                             │
│  UPI ID                     │
│  [shopname@okaxis_________] │
│  e.g. shopname@okaxis  ℹ️   │
│                             │
│  [   Save Changes         ] │
│                             │
│  ─────────────────────────  │
│                             │
│  [   Log Out              ] │  ← danger/secondary style
└─────────────────────────────┘
```

**Avatar:** First letter of their name in a `#2372b9` circle. No photo upload — keeping it dead simple.

**Log Out:** Danger secondary style (`border-[#dc2626] text-[#dc2626]`) — not primary red. Destructive but not alarming.

---

## 4. Bottom Navigation Design

3 items. No hamburger. No labels optionally hidden.

```
┌──────────────────────────────┐
│  🏠 Home    📋 History    👤  │
│  (active: #2372b9 icon+label)│
│  (inactive: #9ca3af)         │
└──────────────────────────────┘
```

- Height: 64px
- `bg-white border-t border-[#e2e4e7]`
- Active tab: icon + label in `#2372b9`, font-semibold
- Inactive: icon + label in `#9ca3af`, font-normal
- "New Claim" is accessed from the product card on Home — no separate nav tab needed

---

## 5. Step Indicators and Flow Visualization

For claim submission, use a subtle 2-step indicator at the top of the form:

```
① Upload Photo  →  ② Enter Serial
```

Style: small circles (`w-6 h-6 rounded-full`), connected by a line. Active step: `bg-[#2372b9] text-white`. Complete step: `bg-[#16a34a] text-white` with checkmark. Inactive: `bg-[#e2e4e7] text-[#9ca3af]`.

---

## 6. Success & Confirmation States

### After OTP verified (returning user)
```
Brief animation: checkmark circle in #2372b9
"Welcome back, [Name]."
Auto-redirect to /app in 1.5s
```

### After registration complete
```
"You're all set, [Name]!"
"Your first cashback claim is just ahead."
[ Start Claiming ]  ← manual CTA, do not auto-redirect
```

### After claim submitted
```
Full-screen success state (not a toast):
  ✓ (large, #16a34a)
  "Claim submitted!"
  "We'll review your coupon photo and credit ₹50 to your UPI ID within 2–3 business days."
  [ View My Claims ]    [ Claim Another ]
```

---

## 7. What NOT to Design

- No splash screen / loading screen on app open — go straight to the login state
- No email field anywhere
- No password anywhere
- No file size warning overlays — handle silently by compressing
- No cookie consent banners — this is a utility app, not a marketing site
- No promotional popups or interstitials
- No dark mode — scope creep for v1, inconsistent with PiiPharma marketing site

---

## 8. Responsive Width

All retailer screens: `max-w-sm mx-auto` (384px max). On tablets/larger phones: the content stays centered and narrow, with background `#f5f6f7` visible on the sides. This is a mobile-first utility app — wide-screen tablet layout is not required in v1.

---

## 9. Priority Implementation Order

Build screens in this order (value/dependency sequence):

1. Landing + OTP (the gate — nothing works without this)
2. Registration (required before first claim)
3. Dashboard / Product List (the core destination)
4. Claim Submission (the primary action)
5. Claim History (the feedback loop)
6. Profile / UPI Update (utility, lower priority)

---

## 10. Design References & Inspiration

| App | What to borrow |
|-----|----------------|
| **PhonePe** | Mobile number input pattern, +91 prefix, OTP auto-advance |
| **Udaan** | B2B retailer trust signals, ₹ amount prominence, bottom nav |
| **Meesho** | Registration flow lightness, resend timer pattern |
| **Google Pay** | OTP single-field auto-submit, success confirmation style |
| **PiiPharma.com** | Brand blue `#2372b9`, Montserrat, quality/trust positioning, ISO badge usage |

---

*This document supersedes the layout/UX sections of `ui-spec.md`. Component-level styling (button classes, input classes, badge classes) in `ui-spec.md` remains authoritative and should not be duplicated here.*
