# Font Philosophy — PiiPharma Loyalty Portal

## Source
Extracted from piipharma.com: `fonts.googleapis.com/css?family=Montserrat%3Aregular%2C700`

## Primary Font: Montserrat

**Why:** Matches the piipharma.com marketing site exactly. Montserrat is geometric, clean, and highly legible at small sizes — critical for low-literacy mobile users reading in varied lighting conditions.

**Weights used:** 400 (regular), 600 (semi-bold), 700 (bold). Do not use 300 or 800.

## Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 12px | 400 | 1.5 | Hints, timestamps, muted text |
| `text-sm` | 14px | 400 | 1.5 | Body, form labels, secondary info |
| `text-base` | 16px | 400 | 1.6 | Primary body text |
| `text-lg` | 18px | 600 | 1.4 | Card titles, section headings |
| `text-xl` | 20px | 700 | 1.3 | Page headings |
| `text-2xl` | 24px | 700 | 1.2 | Hero headings (login page only) |

## Rules

1. **Montserrat only** — no system font fallback for UI text (only for code/monospace)
2. **600 for labels, 700 for headings** — never use 400 for anything that needs visual hierarchy
3. **Minimum 14px for body** — retailers use phones in varied conditions, never go below 14px for readable content
4. **Tracking:** Use `tracking-wide` (0.05em) on uppercase labels and status badges only
5. **No italic** — Montserrat italic is not loaded, don't use it

## Tailwind v4 Token Setup (`app.css`)

```css
@theme {
  --font-sans: 'Montserrat', system-ui, sans-serif;
}
```

```html
<!-- Add to <head> in app.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
```
