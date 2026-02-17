

## Fix: Scroll to Top When Opening Product Forms

### Problem
The `window.scrollTo(0, 0)` calls added previously have no effect because the page layout uses `overflow-hidden` on the root container and `overflow-auto` on the `<main>` element. The browser window itself never scrolls -- only the `<main>` element does.

### Solution
Instead of `window.scrollTo(0, 0)`, target the actual scrollable `<main>` element. The simplest approach: give the scrollable `<main>` in `ClientDetail.tsx` a ref, but since the form components are rendered *instead of* the normal tab content (conditional rendering in `Client360ViewTab`), we can scroll the nearest scrollable parent from within `Client360ViewTab` itself.

**File: `src/components/client-detail/Client360ViewTab.tsx`** (1 file, ~4 lines changed)

Replace all four `window.scrollTo(0, 0)` calls with a helper that finds and scrolls the closest scrollable ancestor:

```typescript
// Before each form show:
const scrollToTop = () => {
  const scrollContainer = document.querySelector('main.overflow-auto') 
    || document.querySelector('[class*="overflow-auto"]');
  if (scrollContainer) scrollContainer.scrollTop = 0;
  window.scrollTo(0, 0); // fallback
};
```

Then in each button handler:
```typescript
onClick={() => { setShowMedicalAidForm(true); scrollToTop(); }}
```

This targets the actual scrolling container (`<main className="... overflow-auto">`) and resets its scroll position to the top.
