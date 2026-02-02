

# Add VANTAGE Logo to Sidebar Bottom

## Overview
Add the VANTAGE logo to the bottom of all left sidebars across the application. The text will be displayed vertically, reading from bottom to top, positioned at the bottom of the sidebar.

---

## Implementation Approach

### Step 1: Copy the Logo Image
Copy the uploaded VANTAGE logo image to the project assets folder.

**Action**: Copy `user-uploads://image-20.png` to `src/assets/vantage-logo.png`

### Step 2: Update Sidebar Structure
Modify each sidebar to include a flex container with proper spacing so the navigation items stay at the top and the logo stays at the bottom. This requires:

1. Wrap navigation items in a `div` that doesn't grow
2. Add a spacer element (`flex-1`) to push the logo to the bottom
3. Add the VANTAGE logo image with vertical rotation

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

## Technical Details

### Import Statement
Each file will add an import for the logo:
```typescript
import vantageLogo from "@/assets/vantage-logo.png";
```

### Sidebar Structure Change

**Current Pattern:**
```typescript
<aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
  <Button>...</Button>  {/* Command Center */}
  {sidebarItems.map(...)}  {/* Nav items */}
</aside>
```

**New Pattern:**
```typescript
<aside className="w-16 bg-[hsl(180,25%,25%)] flex flex-col items-center py-4 gap-1 shrink-0">
  <Button>...</Button>  {/* Command Center */}
  {sidebarItems.map(...)}  {/* Nav items */}
  
  {/* Spacer to push logo to bottom */}
  <div className="flex-1" />
  
  {/* VANTAGE Logo - rotated to read bottom to top */}
  <div className="mb-2">
    <img 
      src={vantageLogo} 
      alt="Vantage" 
      className="h-4 w-auto -rotate-90 origin-center"
    />
  </div>
</aside>
```

The logo will:
- Be positioned at the very bottom of the sidebar
- Be rotated 90 degrees counter-clockwise to read from bottom to top
- Maintain its aspect ratio
- Have consistent sizing across all pages

---

## Expected Outcome
After implementation:
- The VANTAGE logo will appear at the bottom of every sidebar
- The logo reads vertically from bottom to top
- Navigation items remain at the top, unaffected
- The logo is consistently styled across all pages

