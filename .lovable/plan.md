
# Dark Mode, Chart Enhancement & User Profile Updates

## Overview
This plan addresses four key requirements:
1. Evaluate and recommend a chart library with better dark mode support
2. Update charts to be dark mode compatible
3. Add a dark mode toggle button in the user menu dropdown
4. Change the display name to "Adviser" with email "adviser@vantage.co" and update the avatar initial to "A"

---

## Current State Analysis

### Chart Library
The project currently uses **Recharts** (`recharts` version ^2.15.4), which is already installed and used across:
- `Dashboard.tsx` - Pie charts for AUM by Product
- `Insights.tsx` - Bar charts, Area charts, Pie charts for commission data
- `HeroPortfolioCard.tsx` - Custom SVG charts (not using Recharts)

Recharts is actually a solid choice because:
- It's well-integrated with shadcn/ui via the existing `chart.tsx` component
- It supports theming through CSS variables
- It's lightweight and React-native

**Recommendation**: Keep Recharts but enhance its dark mode compatibility using CSS variables and the existing `ChartContainer` wrapper component.

### Dark Mode
- CSS variables for dark mode are already defined in `index.css` (lines 62-98)
- The `.dark` class is defined but there's no theme toggle mechanism
- `next-themes` package is already installed (version ^0.3.0) but not being used

### User Profile
- Current display name: Falls back to "Adviser" but shows email-based name if available
- No hardcoded default email
- Avatar uses first letter of name

---

## Implementation Plan

### Step 1: Set Up Theme Provider
Add the `ThemeProvider` from `next-themes` to wrap the application.

**File: `src/App.tsx`**
- Import `ThemeProvider` from `next-themes`
- Wrap the entire app with `ThemeProvider`
- Configure with `attribute="class"`, `defaultTheme="system"`, and `enableSystem`

### Step 2: Update UserMenu with Dark Mode Toggle
Add a dark mode toggle as a new menu item in the dropdown.

**File: `src/components/dashboard/UserMenu.tsx`**
- Import `Moon` and `Sun` icons from lucide-react
- Import `useTheme` hook from `next-themes`
- Add a new toggle button between "Account Settings" and "Sign Out"
- Show Moon icon for light mode, Sun icon for dark mode
- Toggle between themes on click

```text
+----------------------------+
|       [Avatar "A"]         |
|        Adviser             |
|   adviser@vantage.co       |
+----------------------------+
| ⚙️  Account Settings      |
| 🌙  Dark Mode      [toggle]|
| 🚪  Sign Out              |
+----------------------------+
```

### Step 3: Update Default User Display
Hardcode the default display name and email for when user metadata is not available.

**Files to update:**
- `src/pages/Dashboard.tsx`
- `src/pages/Clients.tsx`
- `src/pages/Email.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Tasks.tsx`
- `src/pages/Insights.tsx`
- `src/pages/Practice.tsx`
- `src/pages/ClientDetail.tsx`
- `src/pages/CommandCenter.tsx`

For each file:
- Change userName fallback from dynamic to: `"Adviser"`
- Change userEmail to use fallback: `user?.email || "adviser@vantage.co"`

This ensures the avatar displays "A" and the email shows "adviser@vantage.co".

### Step 4: Enhance Charts for Dark Mode
Update chart colors to use CSS variables that respond to theme changes.

**File: `src/pages/Insights.tsx`**
- Replace hardcoded HSL colors with CSS variable-based colors
- Use `var(--foreground)` for text
- Use theme-aware colors for chart elements
- Update tooltip and legend styling

**Color Strategy:**
| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Gridlines | `hsl(0 0% 90%)` | `hsl(217 32% 17%)` |
| Axis text | `hsl(215 16% 47%)` | `hsl(215 20% 65%)` |
| Tooltips | White background | Dark background |
| Chart colors | Vibrant | Same but slightly adjusted for contrast |

**File: `src/pages/Dashboard.tsx`**
- Update the Pie chart tooltip styling for dark mode
- Ensure legend colors work in both modes

### Step 5: Update CSS for Chart Dark Mode Support
Ensure the chart components respond to dark mode.

**File: `src/index.css`**
- Add chart-specific dark mode overrides if needed
- The existing `.dark` class variables should handle most cases

---

## Files to Create
None - all changes are modifications to existing files.

## Files to Modify
1. `src/App.tsx` - Add ThemeProvider wrapper
2. `src/components/dashboard/UserMenu.tsx` - Add dark mode toggle and update styling
3. `src/pages/Dashboard.tsx` - Update userName/userEmail defaults, chart colors
4. `src/pages/Clients.tsx` - Update userName/userEmail defaults
5. `src/pages/Email.tsx` - Update userName/userEmail defaults
6. `src/pages/Calendar.tsx` - Update userName/userEmail defaults
7. `src/pages/Tasks.tsx` - Update userName/userEmail defaults
8. `src/pages/Insights.tsx` - Update userName/userEmail defaults, chart colors
9. `src/pages/Practice.tsx` - Update userName/userEmail defaults
10. `src/pages/ClientDetail.tsx` - Update userName/userEmail defaults
11. `src/pages/CommandCenter.tsx` - Update userName/userEmail defaults

---

## Technical Details

### ThemeProvider Setup
```typescript
import { ThemeProvider } from "next-themes"

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      {/* ... rest of app */}
    </QueryClientProvider>
  </ThemeProvider>
);
```

### Dark Mode Toggle in UserMenu
```typescript
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();

<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
  {theme === "dark" ? <Sun /> : <Moon />}
  <span>Dark Mode</span>
  {/* Visual toggle indicator */}
</button>
```

### Chart Color Updates
Charts will use CSS variables that automatically respond to theme:
- Text: `fill-muted-foreground` (Tailwind class) or `hsl(var(--muted-foreground))`
- Backgrounds: `hsl(var(--background))` and `hsl(var(--card))`
- Borders: `hsl(var(--border))`

---

## Expected Outcome
After implementation:
- Users can toggle between light and dark mode from the user menu
- The avatar shows "A" for "Adviser"
- The dropdown shows "Adviser" and "adviser@vantage.co"
- All charts render correctly in both light and dark modes
- The theme preference persists across page refreshes
- System preference is respected by default
