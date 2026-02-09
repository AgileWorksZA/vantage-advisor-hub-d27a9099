

## Change Site Font from Manrope to Nunito

### Overview
Replace the current Google Font "Manrope" with "Nunito" across the entire application.

### Changes

#### 1. Update Google Fonts link in `index.html`
**Lines 25-26**: Replace the Manrope font import with Nunito, loading the same weight range (400, 600, 700, 800):
```
Manrope:wght@400;600;700;800  -->  Nunito:wght@400;600;700;800
```

#### 2. Update CSS font-family in `src/index.css`
**Line ~93** (body rule): Change `'Manrope'` to `'Nunito'` in the font-family stack:
```css
font-family: 'Nunito', ui-sans-serif, system-ui, ...
```

### Files Changed
| File | Change |
|------|--------|
| `index.html` | Swap Manrope for Nunito in Google Fonts preload/stylesheet links |
| `src/index.css` | Swap `'Manrope'` for `'Nunito'` in body font-family |

