

# Fix Empty Inbox on Load and Seed Jurisdiction-Based Demo Emails

## Overview

Two changes:

1. **Fix the empty inbox bug** -- a race condition causes the Inbox to appear empty on initial navigation. The hook starts fetching "Task Pool" (empty) before settings load, then the stale result briefly overwrites the Inbox data.
2. **Seed comprehensive jurisdiction-based emails** -- create 15-20 emails per folder for each of the 5 jurisdictions, linked to real client email addresses. Emails should filter by jurisdiction (not advisor), so toggling advisors does not change visible emails, but switching jurisdiction does.

---

## Part 1: Fix Empty Inbox on Initial Load

**Root Cause**: When the user navigates to `/email`, `activeFolder` is initialized as `null`. The hook `useEmails(activeFolder || "Task Pool")` immediately fetches Task Pool emails (which is typically empty). When email settings finish loading a moment later, `activeFolder` is set to `"Inbox"`, triggering a second fetch. But the first fetch's empty result can flash or, due to the `allClients.length` dependency cycling, overwrite the Inbox results.

**Fix (2 files)**:

**`src/hooks/useEmails.ts`**
- Make the `folder` parameter accept `null | undefined`
- When `folder` is null/undefined, skip the fetch entirely (return empty state, loading = true)
- This prevents the stale "Task Pool" fetch from racing against the real folder fetch

**`src/pages/Email.tsx`**
- Change `useEmails(activeFolder || "Task Pool")` to `useEmails(activeFolder)`, passing `null` when the folder hasn't been determined yet
- The hook will simply wait until `activeFolder` is set by the settings effect

---

## Part 2: Change Email Filtering from Advisor to Jurisdiction

**Current behavior**: Emails are filtered by selected advisors (matched via client's advisor field). Toggling an advisor in the filter hides/shows emails for that advisor's clients.

**New behavior**: Emails are filtered by the selected jurisdiction only. Toggling advisors should have no effect on which emails are visible. Switching from ZA to AU should show only emails linked to Australian clients.

**Changes (2 files)**:

**`src/hooks/useEmails.ts`**
- Add `country_of_issue` to the `ClientRecord` interface and the Supabase query
- Add `clientCountry` to `EmailListItem` to expose the matched client's jurisdiction
- Enhance client matching to also resolve by `client_id` (not just `from_address`), so outbound emails (where `from_address` is the advisor) are also matched to their linked client

**`src/pages/Email.tsx`**
- Replace the advisor-based filter with a jurisdiction-based filter
- Add a region-to-country mapping: `{ ZA: "South Africa", AU: "Australia", CA: "Canada", GB: "United Kingdom", US: "United States" }`
- Filter logic: for each email, if it has a matched client country, show only if the country matches the selected jurisdiction; if unmatched, show always

---

## Part 3: Overhaul the Seed Function for Jurisdiction-Based Emails

**Current state**: The `seed-demo-communications` function only fetches 10 clients and creates emails in Inbox and Sent folders only. All 57 emails are ZA-centric.

**New approach**: Create 15-20 emails per folder for each jurisdiction, using real client email addresses from the database, spread across the past 6 months.

**File: `supabase/functions/seed-demo-communications/index.ts`**

Major changes:

1. **Fetch clients per jurisdiction** -- query all clients grouped by `country_of_issue` instead of `.limit(10)`, selecting a representative set (~15-20) per jurisdiction

2. **Create jurisdiction-appropriate email templates** -- localize email content per jurisdiction:
   - ZA: "FICA Documents", "RA top-up", advisor names like "Johan Botha", currency "R"
   - AU: "TFN update", "Super contribution", advisor "James Mitchell", currency "A$"
   - CA: "RRSP contribution", "SIN update", advisor "Pierre Tremblay", currency "C$"
   - GB: "ISA top-up", "NI number update", advisor "William Smith", currency "GBP"
   - US: "401(k) rollover", "SSN update", advisor "Michael Johnson", currency "$"

3. **Distribute across all 7 folders** with 15-20 emails per folder per jurisdiction:

   | Folder | Direction | Count per jurisdiction |
   |--------|-----------|----------------------|
   | Inbox | Inbound | 15-20 |
   | Task Pool | Inbound | 15-20 |
   | Sent | Outbound | 15-20 |
   | Draft | Outbound | 15-20 |
   | Queue | Outbound | 15-20 |
   | Failed | Outbound | 15-20 |
   | Archived | Mixed | 15-20 |

   Total: ~105-140 emails per jurisdiction, ~525-700 total

4. **Date spread**: Emails dated randomly across the past 6 months (approximately August 2025 to February 2026)

5. **Link to real client data**: Use actual client email addresses as `from_address` (inbound) or in `to_addresses` (outbound), and set `client_id` to the client's UUID for direct matching

6. **Maintain existing WhatsApp/SMS/Push seeding** -- keep the direct messaging and push notification seeding logic unchanged

---

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useEmails.ts` | Accept null folder (skip fetch); add country_of_issue to client matching; match by client_id for outbound emails |
| `src/pages/Email.tsx` | Pass null folder until determined; filter by jurisdiction instead of advisor |
| `supabase/functions/seed-demo-communications/index.ts` | Overhaul to create jurisdiction-specific emails across all 7 folders with 15-20 per folder |

## Deployment Steps

1. Update the hook and page code
2. Update and deploy the seed function
3. Invoke the seed function to populate the database
4. Verify emails appear per folder and change when jurisdiction is switched

