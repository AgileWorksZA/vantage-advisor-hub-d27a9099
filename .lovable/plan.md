

## Increase Vantage Logo Size by 15%

### File: `src/pages/Clients.tsx`

**Line 352**: Change the logo height from `h-10` (40px) to `h-[46px]` (40 * 1.15 = 46px). The `object-contain` class already preserves the aspect ratio.

```tsx
// Before
className="h-10 object-contain -rotate-90 origin-center"

// After
className="h-[46px] object-contain -rotate-90 origin-center"
```

One line change, aspect ratio maintained automatically.

