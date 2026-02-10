

## Set Nunito as Global Font

### Overview

Replace the current Manrope font with Google Nunito across the entire application by updating the font import in `index.html` and the body font-family in `index.css`.

### Changes

**File: `index.html`**

- Replace the Manrope Google Fonts `<link>` (preload + noscript fallback) with the equivalent for Nunito, loading weights 400, 600, 700, and 800.
- Update the `rel="preload"` href and `noscript` href to:
  `https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap`

**File: `src/index.css`**

- In the `body` selector inside `@layer base`, change `'Manrope'` to `'Nunito'` in the `font-family` declaration. The full value becomes:
  `font-family: 'Nunito', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji';`

No other font-family overrides exist in the codebase that need removal.

### Technical Summary

| Item | Detail |
|------|--------|
| Files modified | `index.html`, `src/index.css` |
| Font replaced | Manrope -> Nunito |
| Weights loaded | 400, 600, 700, 800 |
| No DB changes | Pure styling update |

