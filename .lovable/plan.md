

# Replace Plus Icon with Custom Image in Sidebar

## Overview
Replace the `+` (Plus) icon in the sidebar navigation across all pages with the uploaded custom image. This icon appears at the top of the sidebar and links to the Command Center.

---

## Implementation Steps

### Step 1: Copy the Image to the Project
Copy the uploaded image to the project's assets folder for proper bundling and optimization.

**Action**: Copy `user-uploads://image-19.png` to `src/assets/command-center-icon.png`

### Step 2: Update All Sidebar Implementations
Replace the `<Plus className="w-5 h-5" />` icon with an `<img>` tag using the imported image across all pages that have the sidebar.

**Files to modify:**
1. `src/pages/Dashboard.tsx` (line 103)
2. `src/pages/Clients.tsx` (line 182)
3. `src/pages/Email.tsx` (line 133)
4. `src/pages/Calendar.tsx` (line 308)
5. `src/pages/Tasks.tsx` (line 321)
6. `src/pages/Insights.tsx` (line 145)
7. `src/pages/Practice.tsx` (line 122)
8. `src/pages/ClientDetail.tsx` (line 135)
9. `src/components/layout/AppLayout.tsx` (line 55)

---

## Technical Details

### Image Import Pattern
Each file will add an import statement for the image:
```typescript
import commandCenterIcon from "@/assets/command-center-icon.png";
```

### Replacement Pattern
Change from:
```typescript
<Plus className="w-5 h-5" />
```

To:
```typescript
<img 
  src={commandCenterIcon} 
  alt="Command Center" 
  className="w-5 h-5" 
/>
```

The image will:
- Maintain the same sizing (`w-5 h-5` = 20x20 pixels)
- Be properly bundled and optimized by Vite
- Work correctly with the existing button hover states

---

## Files to Create
- `src/assets/command-center-icon.png` (copied from uploaded image)

## Files to Modify
- `src/pages/Dashboard.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Email.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Insights.tsx`
- `src/pages/Practice.tsx`
- `src/pages/ClientDetail.tsx`
- `src/components/layout/AppLayout.tsx`

---

## Expected Outcome
After implementation:
- The custom icon will appear at the top of the sidebar on all pages
- The icon will maintain consistent sizing and positioning
- Button hover effects will continue to work as expected
- The icon will link to the Command Center as before

