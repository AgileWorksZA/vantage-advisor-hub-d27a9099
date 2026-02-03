

# Time-Based Greeting, Practice Value Indicator & Sky-Themed Background

## Overview

Enhance the AI Assistant header with a dynamic time-based greeting, add a practice value indicator showing revenue metrics with progress percentages, and transform the background gradient to reflect the time of day with animated celestial elements for evening mode.

---

## Changes Summary

| File | Changes |
|------|---------|
| `src/pages/AIAssistant.tsx` | Add greeting logic, value indicator, time-based theme state |
| `src/components/ai-assistant/PracticeValueIndicator.tsx` | New component for revenue metrics |
| `src/components/ai-assistant/NightSky.tsx` | New component for stars, shooting stars, planets |
| `src/index.css` | Add sky gradient classes for morning/afternoon/evening |
| `tailwind.config.ts` | Add twinkle and shooting star animations |

---

## Implementation Details

### 1. Time-of-Day Detection & Greeting

Create a utility function to determine the time period based on user's local timezone:

| Time Range | Greeting | Sky Theme |
|------------|----------|-----------|
| 5:00 - 11:59 | Good Morning | Sunrise gradient (soft oranges, pinks, light blues) |
| 12:00 - 17:59 | Good Afternoon | Daylight gradient (bright blues, cyan accents) |
| 18:00 - 4:59 | Good Evening | Night gradient (deep blues, purples, black) + celestial elements |

```typescript
const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

const getGreeting = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'morning': return 'Good Morning';
    case 'afternoon': return 'Good Afternoon';
    default: return 'Good Evening';
  }
};
```

### 2. User First Name Retrieval

Fetch the user's first name from the profiles table (with fallback to "Adviser"):

```typescript
const [userName, setUserName] = useState("Adviser");

useEffect(() => {
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', user.id)
        .single();
      if (data?.first_name) setUserName(data.first_name);
    }
  };
  fetchProfile();
}, []);
```

### 3. Practice Value Indicator Component

A compact horizontal component to the right of the greeting showing:

| Metric | Calculation | Visual |
|--------|-------------|--------|
| **Existing Revenue** | Sum of `realized_revenue` from all projects | Currency value |
| **Potential Revenue** | Sum of `target_revenue` from all projects | Currency value |
| **% Actual** | (Realized / Total Potential) × 100 | Green badge |
| **% In Progress** | Projects with status "Active" / Total projects × 100 | Yellow/Amber badge |
| **% Not Initiated** | Identified opportunities not in any project / Total opps × 100 | Gray badge |

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Practice Value                                                          │
│ R1.2M Existing  │  R4.5M Potential  │  27% Actual │ 45% In Progress │ 28% Not Started │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. Sky Gradient Backgrounds

Add time-themed gradient mesh classes to `src/index.css`:

**Morning Gradient:**
```css
.gradient-mesh-morning {
  background: 
    radial-gradient(at 20% 80%, hsla(35, 100%, 70%, 0.4) 0px, transparent 50%),
    radial-gradient(at 60% 60%, hsla(330, 80%, 70%, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 40%, hsla(200, 80%, 60%, 0.3) 0px, transparent 50%);
  background-color: hsl(210, 60%, 30%);
}
```

**Afternoon Gradient:**
```css
.gradient-mesh-afternoon {
  background: 
    radial-gradient(at 40% 20%, hsla(200, 90%, 60%, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(189, 100%, 50%, 0.3) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(210, 80%, 50%, 0.2) 0px, transparent 50%);
  background-color: hsl(210, 80%, 45%);
}
```

**Evening Gradient (enhanced current):**
```css
.gradient-mesh-evening {
  background: 
    radial-gradient(at 40% 20%, hsla(280, 70%, 20%, 0.4) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(260, 80%, 15%, 0.4) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(320, 60%, 15%, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 80%, hsla(240, 100%, 10%, 0.3) 0px, transparent 50%);
  background-color: hsl(235, 60%, 5%);
}
```

### 5. NightSky Component (Evening Only)

A new component rendered only when `timeOfDay === 'evening'`:

**Stars:**
- 40-50 small twinkling dots scattered randomly
- Varying sizes (1-3px) and opacities
- Subtle twinkle animation with staggered delays

**Shooting Stars:**
- 1-2 shooting stars at a time
- Diagonal trajectory with trail effect
- Random intervals (every 4-8 seconds)
- White/cyan gradient with fade

**Planets:**
- 1-2 subtle planet silhouettes
- Small circles with subtle glow (like a distant moon)
- Positioned in upper portion of screen
- Very subtle pulsing glow

```typescript
// NightSky.tsx
const NightSky = () => {
  const [stars] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60, // Upper 60% of screen
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }))
  );

  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShootingStars([{
        id: Date.now(),
        startX: Math.random() * 80 + 10,
        startY: Math.random() * 30,
      }]);
      setTimeout(() => setShootingStars([]), 1000);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (/* render stars, shooting stars, planets */);
};
```

### 6. Tailwind Animation Additions

Add to `tailwind.config.ts` keyframes:

```typescript
'twinkle': {
  '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
  '50%': { opacity: '1', transform: 'scale(1.2)' },
},
'shooting-star': {
  '0%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
  '100%': { transform: 'translateX(200px) translateY(100px)', opacity: '0' },
},
'planet-glow': {
  '0%, 100%': { boxShadow: '0 0 20px 5px rgba(200, 180, 255, 0.2)' },
  '50%': { boxShadow: '0 0 30px 10px rgba(200, 180, 255, 0.4)' },
},
```

---

## Updated Header Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [←] Good Evening, Emile                           │ Practice Value [metrics component] │
│     Discover and track opportunities...           │                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### AIAssistant.tsx Changes

1. Add state for time of day and user name
2. Calculate practice value metrics from project/opportunity data
3. Apply dynamic background class based on time
4. Conditionally render NightSky component
5. Update header with greeting and value indicator

```typescript
const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
const [userName, setUserName] = useState("Adviser");

useEffect(() => {
  setTimeOfDay(getTimeOfDay());
  // Update every minute to catch transitions
  const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000);
  return () => clearInterval(interval);
}, []);

// Calculate practice metrics
const practiceMetrics = useMemo(() => {
  const totalPotential = projectMetrics.totalOpportunityValue;
  const realized = projectMetrics.realizedRevenue;
  const activeCount = projectMetrics.activeProjects;
  const totalProjects = projects.length;
  
  return {
    existingRevenue: realized,
    potentialRevenue: totalPotential,
    actualPercent: totalPotential > 0 ? Math.round((realized / totalPotential) * 100) : 0,
    inProgressPercent: totalProjects > 0 ? Math.round((activeCount / totalProjects) * 100) : 0,
    notStartedPercent: /* calculate from opportunities not in projects */,
  };
}, [projects, projectMetrics]);

// Dynamic background class
const backgroundClass = `gradient-mesh-${timeOfDay}`;
```

---

## Visual Examples

### Morning (5am - 12pm)
- Warm sunrise colors: soft oranges, pinks transitioning to light blue
- No celestial elements
- Bright, energizing feel

### Afternoon (12pm - 6pm)
- Clear sky blue with cyan accents
- Bright and professional
- Current orb glow colors work well

### Evening (6pm - 5am)
- Deep space colors: navy, purple, black
- 40-50 twinkling stars in upper portion
- Occasional shooting star (every 5-8 seconds)
- 1-2 distant planets/moons with subtle glow
- Enhanced mystical/AI feel

---

## Files to Create

**src/components/ai-assistant/PracticeValueIndicator.tsx**
- Props: existingRevenue, potentialRevenue, actualPercent, inProgressPercent, notStartedPercent, formatCurrency
- Compact horizontal layout with glassmorphism styling
- Color-coded percentage badges

**src/components/ai-assistant/NightSky.tsx**
- Self-contained component with stars, shooting stars, planets
- Only rendered when evening mode active
- Performant with CSS animations (no heavy JS)

---

## Localization

The Practice Value Indicator will use the existing `formatCurrency` function from RegionContext, ensuring proper currency display for all 5 jurisdictions (R for ZA, $ for AU/CA/US, £ for GB).

