# UI Spec — PiiPharma Loyalty Portal

Consolidated design rules for AI-assisted code generation. Every delegated ticket must include this file as context.

---

## Brand Identity

- **Primary color:** `#2372b9` (extracted from piipharma.com `--primary-color`)
- **Font:** Montserrat 400/600/700 (matches piipharma.com marketing site)
- **Tone:** Clean, clinical, trustworthy — not playful, not corporate-dark

---

## Two Portals, Two Feels

| | Retailer Portal (`/`, `/app/*`) | Admin Panel (`/admin/*`) |
|---|---|---|
| **Device** | Mobile-first | Desktop-first |
| **Density** | Spacious — large touch targets (min 44px) | Compact — more info per screen |
| **Bg color** | `#f5f6f7` | `#f5f6f7` |
| **Accent** | Brand blue `#2372b9` | Brand blue `#2372b9` |
| **Nav** | Bottom-anchored or none | Top sidebar or top bar |

---

## Component Patterns

### Buttons

```
Primary:   bg-[#2372b9] hover:bg-[#1a5a96] text-white font-semibold py-3 px-6 rounded-xl text-sm
Secondary: border border-[#2372b9] text-[#2372b9] hover:bg-[#e8f1fb] font-semibold py-3 px-6 rounded-xl text-sm
Danger:    bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold py-3 px-6 rounded-xl text-sm
```

- **Min height:** 44px (touch target)
- **Full-width on mobile** by default for primary actions
- **Disabled state:** `opacity-50 cursor-not-allowed`

### Inputs

```
rounded-xl border border-[#e2e4e7] px-4 py-3 text-sm text-[#1a1a2e]
focus:outline-none focus:ring-2 focus:ring-[#2372b9] focus:border-transparent
placeholder:text-[#9ca3af]
```

- **Labels:** 14px, font-weight 600, color `#1a1a2e`, `mb-1`
- **Error state:** `border-[#dc2626]` + red hint text below at 12px
- **Hint text:** 12px, `#6b7280`, below the input

### Cards

```
bg-white rounded-2xl border border-[#e2e4e7] p-5 shadow-sm
```

- No heavy drop shadows — use `shadow-sm` only
- Hover state on clickable cards: `hover:shadow-md transition-shadow`

### Status Badges

```
Pending:  bg-[#fef3c7] text-[#d97706] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide
Approved: bg-[#dcfce7] text-[#16a34a] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide
Rejected: bg-[#fee2e2] text-[#dc2626] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide
Paid:     bg-[#e8f1fb] text-[#2372b9] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide
```

### Page Layout

**Retailer (mobile):**
```
<main class="min-h-screen bg-[#f5f6f7] px-4 py-6 max-w-lg mx-auto">
```

**Admin (desktop):**
```
<div class="min-h-screen bg-[#f5f6f7] flex">
  <!-- sidebar -->
  <aside class="w-56 bg-white border-r border-[#e2e4e7] ...">
  <!-- content -->
  <main class="flex-1 p-8">
```

### Section Headings

```html
<h1 class="text-xl font-bold text-[#1a1a2e]">Page Title</h1>
<p class="text-sm text-[#6b7280] mt-1">Subtitle or description</p>
```

### Empty States

```html
<div class="text-center py-16">
  <p class="text-[#6b7280] text-sm">No claims pending review.</p>
</div>
```

---

## Do Not

- ❌ Use Tailwind default color names (`blue-500`, `gray-100`) — use hex values from this spec
- ❌ Use `rounded-md` — use `rounded-xl` for cards/inputs, `rounded-full` for badges/pills
- ❌ Heavy shadows (`shadow-lg`, `shadow-xl`) — design is flat-adjacent
- ❌ Gradients — solid colors only
- ❌ Any font other than Montserrat
- ❌ Italic text
- ❌ Body text below 14px

---

## Reference Files

- `research/color-philosophy.md` — full color token definitions and Tailwind `@theme` setup
- `research/font-philosophy.md` — typography scale, weight rules, Google Fonts setup
