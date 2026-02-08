

# Swap Apple and Microsoft Login Buttons

## Change

**File: `src/pages/Auth.tsx`** -- Lines 306-334

Swap the order of the Microsoft and Apple buttons so that Apple appears second (after Google) and Microsoft appears third.

**Current order:**
1. Google
2. Microsoft (Coming Soon)
3. Apple

**New order:**
1. Google
2. Apple
3. Microsoft (Coming Soon)

The button code blocks at lines 306-319 (Microsoft) and lines 321-334 (Apple) will simply be swapped in position. No other changes needed -- all handlers, styles, and attributes remain the same.

