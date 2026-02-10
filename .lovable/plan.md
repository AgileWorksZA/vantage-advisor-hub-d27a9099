

## Adviser Portrait, Header Avatar & Profile Page

### Overview
Three interconnected features:
1. Add a round portrait image of the selected adviser to the left of the "AdvisorFirst" logo in the mobile header
2. Generate/assign portrait photos for all 25 advisers (male and female variants), with initials fallback
3. Clicking the portrait opens a Facebook-style profile page where the adviser can manage their details and create posts

---

### 1. Adviser Data Enhancement

**File: `src/data/regionalData.ts`**

Extend the `AdvisorData` interface to include gender and optional photo URL:

```typescript
export interface AdvisorData {
  initials: string;
  name: string;
  aum: number;
  clientCount: number;
  gender: "male" | "female";
  photoUrl?: string; // optional override, otherwise uses gender-based default
}
```

Add `gender` to all 25 advisors across 5 regions:

| Region | Advisor | Gender |
|--------|---------|--------|
| ZA | Johan Botha | male |
| ZA | Sarah Mostert | female |
| ZA | Pieter Naude | male |
| ZA | Linda van Wyk | female |
| ZA | David Greenberg | male |
| AU | James Mitchell | male |
| AU | Sarah Thompson | female |
| AU | Michael O'Brien | male |
| AU | Emily Anderson | female |
| AU | Thomas Murphy | male |
| CA | Pierre Tremblay | male |
| CA | Marie Bouchard | female |
| CA | James MacDonald | male |
| CA | Sophie Gagnon | female |
| CA | Robert Singh | male |
| GB | William Smith | male |
| GB | Elizabeth Jones | female |
| GB | Thomas Williams | male |
| GB | Victoria Brown | female |
| GB | James Taylor | male |
| US | Michael Johnson | male |
| US | Jennifer Williams | female |
| US | Robert Brown | male |
| US | Maria Garcia | female |
| US | William Davis | male |

**Portrait generation**: Use the Lovable AI image generation API (via an edge function) to create two professional headshot portraits -- one male, one female -- stored in a Supabase storage bucket. Each advisor will reference the appropriate gender-based image. The initials fallback (existing purple circle) will be used if no photo is available.

### 2. Portrait Storage

**New storage bucket**: `advisor-portraits` (public)

**New edge function**: `generate-advisor-portraits`
- Generates 2 professional headshot images (1 male, 1 female) using the AI image generation API
- Uploads them to the `advisor-portraits` bucket as `male-default.png` and `female-default.png`
- Returns the public URLs

### 3. Advisor Avatar Component

**New file: `src/components/mobile/AdvisorAvatar.tsx`**

A reusable component that:
- Accepts advisor data (name, initials, gender, photoUrl)
- Renders a round portrait image if available, otherwise shows initials in the purple circle
- Accepts size prop for flexibility (header = 32px, profile = large)

### 4. Mobile Header Update

**File: `src/components/mobile/MobileApp.tsx`**

- Import `useRegion` to get the currently selected advisor (first in `selectedAdvisors` array)
- Place the `AdvisorAvatar` component to the left of the "AdvisorFirst" logo text
- Add a small gap (`gap-2`) between the avatar and the logo
- Clicking the avatar navigates to the new profile screen (sets a state like `showProfile: true`)

Updated header structure:
```text
[Advisor Photo] [spacing] AdvisorFirst          [Bell] [Settings]
```

### 5. Adviser Profile Page

**New file: `src/components/mobile/MobileAdvisorProfile.tsx`**

A Facebook-style profile page with:

**Header section:**
- Back arrow to return to main app
- Large cover area (gradient or subtle pattern)
- Large round portrait (80px) overlapping the cover
- Adviser name, role, jurisdiction badge

**Details section (editable):**
- Bio / About me (textarea)
- Specialisations (tags/chips)
- Qualifications
- Contact info (email, phone)
- Years of experience
- Office location
- All stored in localStorage for demo purposes

**Posts/Feed section:**
- "Create Post" card at top with text input + optional image placeholder
- Feed of posts below (demo posts pre-seeded)
- Each post shows: advisor avatar, name, timestamp, content, like/comment counts
- "Post" button to add new entries (stored in localStorage)

**Data structure for posts:**
```typescript
interface AdvisorPost {
  id: string;
  advisorInitials: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: "text" | "market-update" | "insight";
}
```

### 6. Database Table (for future persistence)

Create a `advisor_posts` table for when this connects to the client app:
- id, user_id, advisor_initials, jurisdiction, content, post_type, likes_count, created_at
- RLS policy: users can read/write their own posts

---

### Files Summary

| File | Action |
|------|--------|
| `src/data/regionalData.ts` | Add `gender` field to `AdvisorData` interface and all 25 advisor records |
| `src/components/mobile/AdvisorAvatar.tsx` | New -- reusable avatar component with photo/initials fallback |
| `src/components/mobile/MobileApp.tsx` | Add advisor avatar left of logo, clicking opens profile |
| `src/components/mobile/MobileAdvisorProfile.tsx` | New -- full Facebook-style profile page with details and post feed |
| `supabase/functions/generate-advisor-portraits/index.ts` | New -- edge function to generate and store portrait images |
| Migration | Create `advisor-portraits` storage bucket and `advisor_posts` table with RLS |

### Technical Notes
- The selected advisor is derived from `selectedAdvisors[0]` in the RegionContext, matched against `regionalData.advisors`
- Portrait images are generated once via edge function and served from public storage bucket
- Profile data and posts use localStorage for demo; `advisor_posts` table is scaffolded for future client app integration
- The profile page follows the same full-screen pattern as `MobileSettingsMenu` and `MobileMeetingScreen`

