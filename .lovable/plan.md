

# Enhanced Client Ribbon

## Overview

Replace the current plain text header ("Manage individual (Owner) - Jackson, Susan Marie") with a rich, information-dense client ribbon that displays key client details at a glance, matching the provided reference design. The three action buttons (Personal financial report, Manage related entity, More options) are preserved.

## Current State

The ribbon currently shows:
- Back button + "Manage individual (Owner) - {clientName}" as plain text
- Three action buttons on the right

## Enhanced Ribbon Design

The new ribbon will display two rows on a light teal gradient background:

**Row 1 (top):** Back button + "Manage individual (Owner) - {clientName}" (preserved from current) + action buttons on the right

**Row 2 (info bar):**
- Large circular avatar with initials (e.g., "EW")
- Person icon + formatted name: "Surname, I (FirstName)" (e.g., "Wegner, E (Emile)")
- Pipe separator + "A: {advisor name}" (from client.advisor field)
- Profile type badge: "Client" / "Lead" / "Prospect" (from client.profile_type)
- Profile state badge: "Onboarding in progress" / "Active" etc. (from client.profile_state, color-coded)
- Green dot + ID/Passport number (from client.id_number or client.passport_number)
- Phone icon + phone number (from client.cell_number or client.work_number)
- Email icon + email (from client.email)

All values are pulled from the existing client record already fetched by useClientDetail.

## Data Mapping

| Ribbon Element | Client Field | Fallback |
|---|---|---|
| Avatar initials | client.initials or first letter of first_name + surname | "?" |
| Display name | "{surname}, {initial} ({preferred_name or first_name})" | -- |
| Advisor | client.advisor | "Unassigned" |
| Profile type badge | client.profile_type ("Client", "Lead", "Prospect") | -- |
| Status badge | client.profile_state ("Active", "Onboarding in progress", etc.) | -- |
| ID number | client.id_number | client.passport_number, or hidden if neither |
| Phone | client.cell_number | client.work_number, or hidden if neither |
| Email | client.email | client.work_email, or hidden if neither |

## Badge Color Coding

- **Profile type**: "Client" = teal outline, "Prospect" = amber outline, "Lead" = blue outline
- **Profile state**: "Active" = green background, "Onboarding in progress" = amber/yellow background, other = gray

## Technical Changes

### File: `src/pages/ClientDetail.tsx`

**Modify the Page Header section (lines 200-273):**

Replace the current simple header with a two-part ribbon:

1. **Top row**: Keep the Back button and title text, plus the three action buttons on the right (Personal financial report Select, Manage related entity dropdown, More options dropdown) -- these are unchanged.

2. **New info bar row below**: A full-width container with a subtle teal gradient background (`bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20`) containing:
   - A `w-14 h-14` circular avatar with the client's initials
   - A green online-status dot on the avatar
   - Client name formatted as "Surname, I (PreferredName)" with a person icon
   - Pipe-separated advisor field
   - Two small Badge components for profile_type and profile_state
   - Contact details (ID, phone, email) each with their respective Lucide icons

**New imports needed:**
- `UserRound, Phone, Mail, Hash` from lucide-react
- `Badge` from `@/components/ui/badge`
- `getInitials` from `@/types/client`

No new files are created. No new components are needed -- the ribbon is built inline in ClientDetail.tsx using existing UI primitives (Avatar, Badge, icons).

## Visual Layout

```text
+-------------------------------------------------------------------------+
| [<- Back]  Manage individual (Owner) - Surname, FirstName (Preferred)   |
|                                    [Report v] [Manage entity v] [...]   |
+-------------------------------------------------------------------------+
| [Gradient teal background]                                              |
|  +----+  Person-icon  Surname, I (Name) | A: Advisor | [Client] [Active]|
|  | EW |  ID-icon 8108255051081  Phone-icon +27744581082  Mail tris@..   |
|  +----+                                                                 |
+-------------------------------------------------------------------------+
```

## Files Summary

| File | Action |
|---|---|
| `src/pages/ClientDetail.tsx` | Modify -- add enhanced info bar below the existing header row |

