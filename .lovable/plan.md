

# Make VANTAGE Logo 2.5x Bigger

## Overview
Increase the size of the VANTAGE logo at the bottom of all sidebars by 2.5 times.

---

## Current State
The logo currently uses `h-4` (16px height).

## New Size
- **Current**: `h-4` = 16px
- **New**: 16px × 2.5 = 40px = `h-10`

---

## Files to Modify

1. `src/components/layout/AppLayout.tsx`
2. `src/pages/Dashboard.tsx`
3. `src/pages/Clients.tsx`
4. `src/pages/Email.tsx`
5. `src/pages/Calendar.tsx`
6. `src/pages/Tasks.tsx`
7. `src/pages/Insights.tsx`
8. `src/pages/Practice.tsx`
9. `src/pages/ClientDetail.tsx`

---

## Change Pattern

**From:**
```typescript
<img 
  src={vantageLogo} 
  alt="Vantage" 
  className="h-4 w-auto -rotate-90 origin-center"
/>
```

**To:**
```typescript
<img 
  src={vantageLogo} 
  alt="Vantage" 
  className="h-10 w-auto -rotate-90 origin-center"
/>
```

---

## Expected Outcome
The VANTAGE logo will be 2.5 times larger (40px height instead of 16px) while maintaining its vertical orientation and position at the bottom of all sidebars.

