
# Fix Gradient Background & Restore Projects Section

## Issues Identified

1. **Gradient not working**: The gradient classes inside `@layer utilities` may not be applying correctly due to CSS specificity issues. The animation reference works but the gradients may be overridden by other styles.

2. **Projects section hidden**: The current tab-based layout hides projects behind a "Projects" tab. The user wants projects visible alongside opportunities on the same screen (similar to the original layout).

---

## Solution

### 1. Fix Gradient Background (src/index.css)

Move the gradient mesh classes **outside** of `@layer utilities` to the root level of the CSS file. This ensures the styles apply with proper specificity and aren't processed by Tailwind's utility purging.

**Current structure (broken):**
```css
@layer utilities {
  .gradient-mesh-morning { ... }
  .gradient-mesh-afternoon { ... }
  .gradient-mesh-evening { ... }
}
```

**Fixed structure:**
```css
/* Root level - after all @layer blocks */
.gradient-mesh-morning {
  background: linear-gradient(...);
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}
```

### 2. Restore Unified Layout (src/pages/AIAssistant.tsx)

Replace the tab-based navigation with a unified scrollable layout showing all sections:
- OpportunityMetrics (hero dashboard)
- InsightOrbit (opportunity categories)
- ProjectsList (always visible below)

**Remove:**
- The `Tabs` component wrapper
- The conditional `activeTab === "projects"` check

**Add:**
- Always render `ProjectsList` below the InsightOrbit section
- Keep the opportunity cards inline when a category is selected

---

## Detailed Changes

### src/index.css

Move these three classes from inside `@layer utilities` to the root level (after line 245, before `@keyframes gradient-shift`):

```css
/* Time-based sky gradient backgrounds - must be outside @layer for proper specificity */
.gradient-mesh-morning {
  background: linear-gradient(
    135deg,
    hsl(25, 95%, 55%) 0%,
    hsl(35, 100%, 60%) 25%,
    hsl(200, 80%, 55%) 75%,
    hsl(210, 85%, 50%) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

.gradient-mesh-afternoon {
  background: linear-gradient(
    135deg,
    hsl(30, 90%, 50%) 0%,
    hsl(25, 85%, 55%) 30%,
    hsl(200, 75%, 50%) 70%,
    hsl(220, 80%, 45%) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

.gradient-mesh-evening {
  background: linear-gradient(
    135deg,
    hsl(25, 80%, 40%) 0%,
    hsl(280, 50%, 25%) 35%,
    hsl(240, 60%, 20%) 70%,
    hsl(220, 70%, 15%) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 20s ease infinite;
}
```

### src/pages/AIAssistant.tsx

**Remove:**
- Import of `Tabs, TabsList, TabsTrigger`
- State: `activeTab`
- The entire `<Tabs>` wrapper and triggers

**Restructure main content:**
```jsx
<main className="relative z-10 p-6 max-w-7xl mx-auto space-y-6 pb-24">
  {/* Hero Metrics */}
  <OpportunityMetrics ... />
  
  {/* Insight Categories */}
  <InsightOrbit ... />
  
  {/* Opportunity Cards (when category selected) */}
  {displayedOpportunities.length > 0 && (
    <div className="grid ...">
      {/* cards */}
    </div>
  )}
  
  {/* Projects List - Always visible */}
  <ProjectsList ... />
</main>
```

---

## Visual Result

After these changes:
- Vibrant animated gradient background (orange → blue, shifting slowly)
- Header with time-based greeting and Practice Value Indicator
- Hero metrics dashboard
- Clickable opportunity category cards
- Projects list always visible below (with prepopulated demo projects)

---

## Files to Modify

| File | Action |
|------|--------|
| `src/index.css` | Move gradient classes outside `@layer utilities` |
| `src/pages/AIAssistant.tsx` | Remove tabs, show projects inline |
