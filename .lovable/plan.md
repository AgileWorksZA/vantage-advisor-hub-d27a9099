

## Add Key Outcomes Section to Prep and Outcomes Steps

### Overview
Add a "Key Outcomes" section to the Prep step (after AI prep notes) where advisors can define desired meeting outcomes. These outcomes then carry forward to the Outcomes step as a checklist, enriched with transcription data and origin tags.

### State Management

All key outcomes will be managed via React state in `MobileMeetingScreen.tsx` (the parent) and passed down to both PrepStep and OutcomesStep. Each outcome has this shape:

```text
{
  id: string (uuid)
  text: string
  completed: boolean
  origin: "prep" | "meeting" | "post-meeting"
  note: string | null
  transcriptTimestamp: string | null  (e.g. "12:34")
  transcriptSnippet: string | null
}
```

No new database tables are needed -- outcomes live in component state for this iteration (they could later be persisted to the meeting_recordings ai_summary JSONB if needed).

---

### Changes by File

#### 1. `src/components/mobile/MobileMeetingScreen.tsx`

- Add `useState<KeyOutcome[]>` for the outcomes list
- Derive initial outcomes from prep data (opportunities, overdue tasks, expiring docs) with `origin: "prep"`
- Pass `keyOutcomes` + `setKeyOutcomes` / `onAddOutcome` to PrepStep, MeetStep, and OutcomesStep
- Update OutcomesStep props to include `keyOutcomes` and handlers

#### 2. `src/components/mobile/meeting-steps/PrepStep.tsx`

- Add a new "Key Outcomes" section after "Recommended Actions" at the bottom
- Display existing prep-derived outcomes as editable chips/rows
- Include an input field + "Add" button for the advisor to add custom outcomes (these get `origin: "prep"`)
- Each outcome row shows the text with a small delete/remove icon

#### 3. `src/components/mobile/meeting-steps/MeetStep.tsx`

- Add a collapsible "Key Outcomes" section (below quick notes) showing the current outcomes as reference
- Include an "Add Outcome" input so the advisor can add new outcomes during the meeting (these get `origin: "meeting"`)

#### 4. `src/components/mobile/meeting-steps/OutcomesStep.tsx` (major changes)

**Key Outcomes Checklist:**
- Display all outcomes as a checklist at the top, before the existing AI Summary
- Each outcome row includes:
  - A checkbox (auto-ticked if transcription matched the outcome, or manually tickable)
  - The outcome text
  - An **origin tag** badge: "Prep" (blue), "During Meeting" (teal), or "Post-Meeting" (amber)
  - If matched from transcription: a timestamp badge (e.g. "at 12:34") and an expand/collapse chevron
  - When expanded: show the relevant transcript snippet in a muted card
  - A small note icon to add/view an advisor note per outcome
- "Add Outcome" input at the bottom of the checklist for post-meeting additions (`origin: "post-meeting"`)

**Transcript Matching Logic:**
- When a recording with transcription exists, do a simple keyword match: for each outcome text, search the transcription for relevant keywords
- If found, extract a ~100-character snippet around the match and note the approximate timestamp using the word-level timing data from the `transcription` field (or a rough estimate based on position in the text)
- Auto-tick outcomes where a transcript match is found

**Manual Controls:**
- Advisor can manually tick/untick any outcome regardless of AI match
- Advisor can add a text note to any outcome via a small inline input that appears on tap

**Origin Tags:**
| Origin | Badge Style | Label |
|--------|-------------|-------|
| prep | Blue bg, blue text | Prep |
| meeting | Teal bg, teal text | During Meeting |
| post-meeting | Amber bg, amber text | Post-Meeting |

---

### UI Layout (Outcomes Step)

```text
+------------------------------------------+
| KEY OUTCOMES                    [+ Add]  |
+------------------------------------------+
| [x] Discuss investment opportunity       |
|     [Prep] [at 14:22] [v expand]         |
|     > "...client expressed interest in    |
|       diversifying into..."              |
|     [Add note]                           |
+------------------------------------------+
| [ ] Review expiring documents            |
|     [Prep]                               |
|     [Add note]                           |
+------------------------------------------+
| [x] Address retirement timeline          |
|     [During Meeting] [at 08:45]          |
+------------------------------------------+
| [ ] Follow up on tax planning            |
|     [Post-Meeting]                       |
+------------------------------------------+
| [input: Add new outcome...] [+]         |
+------------------------------------------+
|                                          |
| --- AI SUMMARY (existing) ---           |
| --- Key Topics (existing) ---           |
| --- Decisions Made (existing) ---       |
+------------------------------------------+
```

### Technical Notes

- The `KeyOutcome` type will be defined in a shared types location or inline in `MobileMeetingScreen.tsx`
- Transcript matching is best-effort client-side string matching -- no AI call needed
- The `useMeetingRecordings` hook already provides `transcription` (full text) and `aiSummary` which can be leveraged
- Collapsible snippets use the existing `Collapsible` component from radix
- Checkboxes use the existing `Checkbox` component from radix

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileMeetingScreen.tsx` | Update -- add shared outcomes state, derive from prep, pass to steps |
| `src/components/mobile/meeting-steps/PrepStep.tsx` | Update -- add Key Outcomes section with add/remove |
| `src/components/mobile/meeting-steps/MeetStep.tsx` | Update -- add Key Outcomes reference + add input |
| `src/components/mobile/meeting-steps/OutcomesStep.tsx` | Update -- major rework: checklist with checkboxes, origin tags, transcript snippets, expand/collapse, notes, add new |

