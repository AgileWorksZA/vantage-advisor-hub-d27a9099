
# Outlook-Style Email View & Reply Implementation

## Overview

Replace the current modal-based email viewer with a full-page Outlook-style email interface that includes:
1. **Email View Page** - Full content display with action buttons, client badges, and task linking
2. **Reply Page** - Compose interface with quoted content in Outlook format
3. **Forward Functionality** - Using "Fwd:" prefix instead of "Re:"

## Architecture

```text
Email Flow Redesign
├── Email List (/email)
│   └── Click email row → Navigate to /email/view/:id
├── Email View Page (/email/view/:id)
│   ├── Action Bar: Move to archive | Reply | Forward
│   ├── Subject + Date header
│   ├── Metadata Section: From, To, Clients (with avatars)
│   ├── Task Linking Section (collapsible)
│   └── Email Body (HTML rendered)
└── Reply/Forward Page (/email/compose)
    ├── Action Bar: Send | Attach File | Discard | Save
    ├── Form Fields: From, To (badges), +BCC, CC, Subject
    ├── Clients Section (with avatars)
    ├── Task Linking Section (collapsible)
    ├── Rich Text Editor
    └── Quoted Content (yellow left-border styled)
```

## Key Components

### 1. New Route: `/email/view/:id`

Create a new page that replaces the dialog with a full-page email view matching the first screenshot.

### 2. EmailViewPage Component

Layout matching Image 1:
| Section | Content |
|---------|---------|
| **Action Bar** | Move to archive, Reply (outlined), Forward (outlined) buttons |
| **Header** | Subject line (large) + Date/time on right |
| **Metadata Box** | From field (read-only input style), To field, Clients with avatar badges |
| **Task Linking** | Collapsible panel with Guess Task, Search Task, New Task, Guess Completed Task buttons |
| **Task Table** | Linked tasks with toggle, task number, title, type, assignee, due date, client columns |
| **Email Body** | Rendered HTML content with light blue background container |

### 3. Enhanced Compose Page

Update the existing `/email/compose` page to match Image 2:

| Section | Updates Required |
|---------|------------------|
| **Action Bar** | Send (teal filled), Attach File (outlined), Discard (outlined), Save (outlined) |
| **Form Fields** | From, To* (with badge pills + remove buttons), +BCC button, CC field |
| **Subject** | Pre-filled with "Re:" or "Fwd:" based on mode |
| **Clients** | Avatar badges with initials + name + green status dot |
| **Task Linking** | Same collapsible panel as view page |
| **Rich Text Editor** | Full toolbar matching Outlook |
| **Quoted Content** | Yellow/gold left border styling for original email |

### 4. Client Avatar Badges

New component for displaying clients with:
- Two-letter avatar (initials)
- Client name in "Surname, I (FirstName)" format
- Green status dot
- Remove (×) button

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/EmailView.tsx` | New full-page email viewer |
| `src/components/email/EmailHeader.tsx` | Reusable email header with From/To/Clients |
| `src/components/email/TaskLinkingSection.tsx` | Collapsible task linking UI |
| `src/components/email/ClientAvatarBadge.tsx` | Client badge with avatar, name, remove |
| `src/components/email/EmailQuotedContent.tsx` | Quoted email formatting component |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add route `/email/view/:id` |
| `src/pages/Email.tsx` | Replace dialog click → navigate to view page |
| `src/pages/ComposeEmail.tsx` | Major redesign to match Image 2 layout |
| `src/components/email/EmailViewDialog.tsx` | Remove or deprecate (replaced by page) |

### Route Structure

```
/email                    → Email list (unchanged)
/email/view/:id           → NEW: Full email view page
/email/compose            → Enhanced compose (supports reply/forward modes)
/email/compose?mode=reply&emailId=xxx     → Reply mode
/email/compose?mode=forward&emailId=xxx   → Forward mode
```

### Query Parameters for Compose

| Param | Purpose |
|-------|---------|
| `mode` | "reply" or "forward" |
| `emailId` | Original email ID for loading quote |
| `to` | Pre-filled recipient(s) |
| `subject` | Pre-filled subject line |
| `clientId` | Pre-linked client ID |

## Detailed Component Specifications

### EmailViewPage Layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────┐  ┌─────────┐  ┌───────────┐                          │
│  │ Move to archive│  │ ↩ Reply │  │ ↪ Forward │                          │
│  └────────────────┘  └─────────┘  └───────────┘                          │
├──────────────────────────────────────────────────────────────────────────┤
│  Re: Schedule your Momentic demo                      02/09/2025 03:10 PM│
├──────────────────────────────────────────────────────────────────────────┤
│  ┌─ Light Gray Background ─────────────────────────────────────────────┐ │
│  │ From    │ Wei-Wei Wu <wei-wei@momentic.ai>                 (input)  │ │
│  │ To      │ emilewegner@efgroup.co.za                        (input)  │ │
│  │ Clients │ [CW] Wegner, C (Jonathan) ×   + Add                       │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│  Task linking   [🔮 Guess Task] [🔍 Search Task] [✓ New Task] [📋 GCT]  │
│  ┌──────────────────────────────────────────────────────────────────┐  ↑ │
│  │ Linked │ Task number │ Title │ Task type │ Assignee │ Due date │Client│
│  │   ●    │ Task-95178  │       │ Transfer  │ D.Harding│ 15/08/25 │ W,C  │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                      1 to 1 of 1  ◀ ▶   │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌─ Light Blue Background ─────────────────────────────────────────────┐ │
│  │  ┌─ Yellow Bar ────────────────────────────────────────────────────┐│ │
│  │  │ You don't often get email from wei-wei@momentic.ai. Learn why  ││ │
│  │  └─────────────────────────────────────────────────────────────────┘│ │
│  │                                                                      │ │
│  │  Hey Emile,                                                          │ │
│  │                                                                      │ │
│  │  Before Momentic, Webflow's flakiest tests had a 40% pass rate...   │ │
│  │                                                                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Reply Mode - Subject Formatting

```typescript
// Reply: Add "Re:" if not already present
const replySubject = subject?.startsWith("Re:") 
  ? subject 
  : `Re: ${subject}`;

// Forward: Add "Fwd:" if not already present  
const forwardSubject = subject?.startsWith("Fwd:") 
  ? subject 
  : `Fwd: ${subject}`;
```

### Quoted Content Format (Outlook Style)

```html
<div style="border-left: 3px solid #d4a832; padding-left: 12px; margin-top: 16px;">
  <p><strong>From:</strong> Wei-Wei Wu</p>
  <p><strong>Sent:</strong> Tuesday, 2 September 2025 15:18</p>
  <p><strong>To:</strong> emilewegner@efgroup.co.za</p>
  <p><strong>Subject:</strong> Re: Schedule your Momentic demo</p>
  <br/>
  [Original email content]
</div>
```

### Task Linking Section

Collapsible panel with:
- **Header**: "Task linking" label with collapse chevron
- **Action Buttons**: 
  - Guess Task (AI icon)
  - Search Task (search icon)
  - New Task (checkmark icon) 
  - Guess Completed Task (document icon)
- **Table Columns**: Linked (toggle), Task number, Title, Task type, Assignee, Due date, Client
- **Pagination**: "1 to 1 of 1" with navigation arrows

### Client Avatar Badge Component

```typescript
interface ClientAvatarBadgeProps {
  id: string;
  initials: string;
  name: string;           // "Wegner, C (Jonathan)"
  hasGreenDot?: boolean;  // Active/online indicator
  onRemove?: () => void;  // X button handler
}
```

## Implementation Order

1. **Create ClientAvatarBadge component** - Reusable avatar + name + remove button
2. **Create TaskLinkingSection component** - Collapsible panel with task table
3. **Create EmailViewPage** - Full-page email viewer at `/email/view/:id`
4. **Update App.tsx routing** - Add new route
5. **Update Email.tsx** - Navigate to view page instead of opening dialog
6. **Create EmailQuotedContent component** - Outlook-style quoted content formatting
7. **Enhance ComposeEmail.tsx** - Match Image 2 layout with reply/forward modes
8. **Update EmailViewDialog.tsx** - Keep for backward compatibility or deprecate

## Database Considerations

No schema changes required. Uses existing:
- `emails` table for email data
- `tasks` table for task linking
- `task_communications` junction table for linking
- `clients` table for client info

## Key Differences from Current Implementation

| Current | New (Outlook-Style) |
|---------|---------------------|
| Modal/Dialog popup | Full page navigation |
| Simple Reply button | Reply + Forward buttons |
| No task linking on view | Full task linking panel |
| Basic client links | Avatar badges with initials |
| Plain quoted text | Styled Outlook-format quote |
| No From/To input styling | Input-styled read-only fields |
