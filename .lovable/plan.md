

## Auto-Generate & Reposition AI Prep Note

### Changes

**1. Auto-generate on mount** (`WebPrepStep.tsx`)
- When the component mounts with an `eventId` and no existing `aiPrepNote`, automatically trigger `handleGenerateNote()` via a `useEffect`. If a seeded note already exists, it displays immediately — no manual click needed.

**2. Move AI Prep Note into the right column** (`WebPrepStep.tsx`)
- Remove the full-width AI Prep Note card from the top of the layout.
- Place it inside the right column of the 2-column grid, after Outstanding Actions and Recommended Actions. This fills the blank space that currently exists below those shorter sections.
- Keep the Regenerate button and typing animation intact.

### Layout Before → After

```text
BEFORE:                          AFTER:
┌─────────────────────────┐      ┌───────────┬─────────────┐
│ AI Prep Note (full)     │      │ Prev Eng  │ Outstanding │
├───────────┬─────────────┤      │ Products  │ Recommended │
│ Prev Eng  │ Outstanding │      │ Opps      │ AI Prep Note│
│ Products  │ Recommended │      ├───────────┴─────────────┤
│ Opps      │             │      │ Key Outcomes (full)     │
├───────────┴─────────────┤      └─────────────────────────┘
│ Key Outcomes (full)     │
└─────────────────────────┘
```

### Files
| File | Change |
|------|--------|
| `src/components/client-detail/meeting-steps/WebPrepStep.tsx` | Add auto-generate `useEffect`; move AI card into right column |

