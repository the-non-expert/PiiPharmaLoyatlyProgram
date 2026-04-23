# Color Philosophy — PiiPharma Loyalty Portal

## Source
Extracted directly from piipharma.com CSS (`--primary-color: #2372b9` in Flatsome theme inline styles).

## Brand Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary** | `#2372b9` | Buttons, links, active states, badges, focus rings |
| **Primary dark** | `#1a5a96` | Button hover, pressed states |
| **Primary light** | `#e8f1fb` | Subtle backgrounds, selected rows, info banners |

## Neutral Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Background** | `#f5f6f7` | Page background (site uses `#eaeaea` — slightly lighter for app feel) |
| **Surface** | `#ffffff` | Cards, forms, modals |
| **Border** | `#e2e4e7` | Input borders, card borders, dividers |
| **Text primary** | `#1a1a2e` | Headings, labels |
| **Text secondary** | `#6b7280` | Subtext, hints, placeholders |
| **Text muted** | `#9ca3af` | Disabled, timestamps |

## Semantic Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Success** | `#16a34a` | Approved status, confirmation messages |
| **Success light** | `#dcfce7` | Approved badge background |
| **Warning** | `#d97706` | Pending status |
| **Warning light** | `#fef3c7` | Pending badge background |
| **Danger** | `#dc2626` | Rejected status, errors |
| **Danger light** | `#fee2e2` | Rejected badge background |

## Rules

1. **Never use raw Tailwind color names** like `blue-500` — always use the brand palette above via `@theme` custom tokens
2. **Primary blue is the only accent** — no secondary accent colors
3. **Retailer portal** uses slightly warmer neutrals (mobile-first, approachable)
4. **Admin panel** uses cooler neutrals (desktop-first, functional)
5. **Status badges** always use the semantic palette — never primary blue for status

## Tailwind v4 Token Setup (`app.css`)

```css
@import "tailwindcss";

@theme {
  --color-brand: #2372b9;
  --color-brand-dark: #1a5a96;
  --color-brand-light: #e8f1fb;

  --color-surface: #ffffff;
  --color-page: #f5f6f7;
  --color-border: #e2e4e7;

  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  --color-success: #16a34a;
  --color-success-bg: #dcfce7;
  --color-warning: #d97706;
  --color-warning-bg: #fef3c7;
  --color-danger: #dc2626;
  --color-danger-bg: #fee2e2;
}
```
