

## Add Region-Specific Advisors

### Overview

Currently, the advisor names and initials in the AdvisorFilter component are hardcoded with South African names. This change will make advisors unique for each jurisdiction (ZA, AU, CA, GB, US), displaying culturally appropriate names when the region is changed.

---

## Implementation Plan

### 1. Update Regional Data Interface

**File**: `src/data/regionalData.ts`

Add a new `AdvisorData` interface and include advisors in the `RegionalData` interface:

```typescript
export interface AdvisorData {
  initials: string;
  name: string;
}

export interface RegionalData {
  // ... existing fields
  advisors: AdvisorData[];
}
```

---

### 2. Add Unique Advisors for Each Jurisdiction

**File**: `src/data/regionalData.ts`

Add 5 advisors with culturally appropriate names for each region:

| Region | Advisors |
|--------|----------|
| **South Africa (ZA)** | Christo van Zyl (CZ), Dale Harding (DH), Emile Wegner (EW), Ihan Nel (IN), Riaan Swart (RS) |
| **Australia (AU)** | James Mitchell (JM), Sarah Thompson (ST), Michael O'Brien (MO), Emily Anderson (EA), Thomas Murphy (TM) |
| **Canada (CA)** | Pierre Tremblay (PT), Marie Bouchard (MB), James MacDonald (JM), Sophie Gagnon (SG), Robert Singh (RS) |
| **United Kingdom (GB)** | William Smith (WS), Elizabeth Jones (EJ), Thomas Williams (TW), Victoria Brown (VB), James Taylor (JT) |
| **United States (US)** | Michael Johnson (MJ), Jennifer Williams (JW), Robert Brown (RB), Maria Garcia (MG), William Davis (WD) |

---

### 3. Update AdvisorFilter to Use Regional Data

**File**: `src/components/dashboard/AdvisorFilter.tsx`

Changes:
- Import `useRegion` hook from context
- Remove hardcoded `advisors` array
- Get advisors from `regionalData.advisors`
- Update state initialization to use regional advisors
- Add `useEffect` to reset selected advisors when region changes

```typescript
import { useRegion } from "@/contexts/RegionContext";

export const AdvisorFilter = () => {
  const { regionalData } = useRegion();
  const advisors = regionalData.advisors;
  
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(
    advisors.map((a) => a.initials)
  );
  
  // Reset selection when region changes
  useEffect(() => {
    setSelectedAdvisors(advisors.map((a) => a.initials));
  }, [advisors]);
  
  // ... rest of component
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/regionalData.ts` | Add `AdvisorData` interface, add `advisors` to `RegionalData`, add unique advisor arrays to each region's data |
| `src/components/dashboard/AdvisorFilter.tsx` | Import `useRegion`, consume `regionalData.advisors`, add `useEffect` to reset on region change |

---

## Result

- Each jurisdiction displays culturally appropriate advisor names and initials
- Advisor filter updates automatically when the region is changed
- All existing functionality (selection, filtering, hover expansion) continues to work

