

## Add Portfolio Tab to Sidebar Navigation

### Overview

Add a new "Portfolio" navigation item to the left sidebar below "Clients", with a suitable `Briefcase` icon from lucide-react. This requires:
1. Creating a new Portfolio page
2. Adding the route to App.tsx
3. Updating the sidebar items array in all 9 files that define it

---

## Changes Required

### 1. Create New Portfolio Page

**File:** `src/pages/Portfolio.tsx`

Create a new page following the existing pattern from other pages (Insights, Tasks, etc.):
- Authentication check with redirect to /auth
- AppHeader component
- Sidebar with all navigation items including the new Portfolio item
- Placeholder content for future portfolio management features

The page structure will include:
- Auth state management
- Sidebar navigation (with Portfolio highlighted as active)
- Header with search and user menu
- Main content area with placeholder cards for portfolio features

---

### 2. Add Route to App.tsx

**File:** `src/App.tsx`

Add import and route for the new Portfolio page:

| Line | Change |
|------|--------|
| ~27 | Add import: `import Portfolio from "./pages/Portfolio";` |
| ~50 | Add route: `<Route path="/portfolio" element={<Portfolio />} />` |

---

### 3. Update Sidebar Items (9 Files)

Add the Portfolio item after Clients in the `sidebarItems` array. The new item:

```typescript
{ icon: Briefcase, label: "Portfolio", path: "/portfolio" }
```

**Files to update:**

| File | Line Range | Changes |
|------|------------|---------|
| `src/components/layout/AppLayout.tsx` | ~18-26 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Dashboard.tsx` | ~17-25 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Calendar.tsx` | ~81-89 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Email.tsx` | ~52-60 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/ClientDetail.tsx` | ~52-60 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Practice.tsx` | ~37-45 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Tasks.tsx` | ~68-76 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Insights.tsx` | ~129-137 | Add Briefcase import, add Portfolio after Clients |
| `src/pages/Clients.tsx` | ~65-73 | Add Briefcase import, add Portfolio after Clients |

**Updated sidebar items array (all files):**
```typescript
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Briefcase, label: "Portfolio", path: "/portfolio" },  // NEW
  { icon: Mail, label: "Email", path: "/email" },
  { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];
```

---

## Visual Result

**Sidebar (after):**
```text
┌────────────┐
│  [Command] │
├────────────┤
│   Dash     │
│  Clients   │
│ Portfolio  │  ← NEW (Briefcase icon)
│   Email    │
│  Calendar  │
│   Tasks    │
│  Insights  │
│  Practice  │
│            │
│  [VANTAGE] │
└────────────┘
```

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/pages/Portfolio.tsx` |
| Modify | `src/App.tsx` |
| Modify | `src/components/layout/AppLayout.tsx` |
| Modify | `src/pages/Dashboard.tsx` |
| Modify | `src/pages/Calendar.tsx` |
| Modify | `src/pages/Email.tsx` |
| Modify | `src/pages/ClientDetail.tsx` |
| Modify | `src/pages/Practice.tsx` |
| Modify | `src/pages/Tasks.tsx` |
| Modify | `src/pages/Insights.tsx` |
| Modify | `src/pages/Clients.tsx` |

**Total: 1 new file, 10 modified files**

---

## Technical Notes

- Uses `Briefcase` icon from lucide-react (professional, represents investment portfolios)
- Follows existing authentication and layout patterns
- Portfolio page will use AppHeader and match the visual design of other pages
- The new Portfolio page will be a placeholder ready for future portfolio management features

