

# Compose Email Dialog for Task Detail

## Problem Summary

When clicking the "Message" button on the Task Detail Sheet:
1. The user navigates away from the task - they want to stay in the task context with a popup/dialog
2. The linked clients are not automatically populated in the "To" field

## Solution Architecture

Create a new `ComposeMessageDialog` component that can be opened as a modal overlay from anywhere in the app, and update the `ComposeToField` to support both filter-based and direct client selection modes.

```text
+------------------------------------------+
|              Task Detail Sheet           |
|  +------------------------------------+  |
|  |     Compose Message Dialog         |  |
|  |  +------------------------------+  |  |
|  |  | From: [current user]         |  |  |
|  |  | To: [John Smith] [Mary Jones]|  |  |
|  |  | Subject: [____________]      |  |  |
|  |  | Message: [rich text editor]  |  |  |
|  |  | [Send] [Save Draft] [Cancel] |  |  |
|  |  +------------------------------+  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Implementation Details

### 1. Create ComposeMessageDialog Component

**File:** `src/components/email/ComposeMessageDialog.tsx`

| Feature | Details |
|---------|---------|
| Dialog wrapper | Full-screen or large dialog using Radix Dialog |
| Pre-populated clients | Accept `initialClientIds` prop |
| Task context | Accept optional `taskId` prop for linking |
| Channel support | Email, SMS, WhatsApp |
| Actions | Send, Save Draft, Cancel |
| On close | Return to previous context (no navigation) |

**Props Interface:**
```typescript
interface ComposeMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientIds?: string[];  // Pre-populate To field
  taskId?: string;              // For task linking
  defaultChannel?: CommunicationChannel;
}
```

### 2. Enhance ComposeToField for Direct Client Selection

**File:** `src/components/email/ComposeToField.tsx`

Add support for:
- **Direct client IDs** (new): Accept array of pre-selected client IDs
- **Filter mode** (existing): Continue supporting filter-based selection
- **Hybrid mode**: Allow adding individual clients + filters

**Updated Props:**
```typescript
interface ComposeToFieldProps {
  // Existing filter-based props
  recipientFilter: { conditions: FilterCondition[] };
  onFilterChange: (filter: { conditions: FilterCondition[] }) => void;
  recipientCount: number;
  
  // NEW: Direct client selection
  selectedClientIds?: string[];
  onSelectedClientIdsChange?: (ids: string[]) => void;
  allClients?: ClientListItem[];  // For lookup
}
```

**UI Changes:**
- Show client badges for directly selected clients (removable)
- Show "X recipients match" for filter-based selection
- Allow mixing both modes

### 3. Update TaskDetailSheet

**File:** `src/components/tasks/TaskDetailSheet.tsx`

| Current | Updated |
|---------|---------|
| Navigate to `/email/compose` | Open `ComposeMessageDialog` |
| Pass clients via URL params | Pass as dialog props |

**Changes:**
```typescript
// Add state for dialog
const [composeDialogOpen, setComposeDialogOpen] = useState(false);

// Update handler
const handleSendMessage = () => {
  setComposeDialogOpen(true);  // Open dialog instead of navigate
};

// Add dialog to JSX
<ComposeMessageDialog
  open={composeDialogOpen}
  onOpenChange={setComposeDialogOpen}
  initialClientIds={taskClients.map(tc => tc.client_id)}
  taskId={task.id}
/>
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/email/ComposeMessageDialog.tsx` | Dialog-based email composer |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/email/ComposeToField.tsx` | Add direct client selection support |
| `src/components/tasks/TaskDetailSheet.tsx` | Use dialog instead of navigation |

## Component Structure

```text
ComposeMessageDialog.tsx
├── Dialog wrapper (Radix UI)
├── CommunicationTypeSelector
├── ComposeFromField (reused)
├── ComposeToField (enhanced)
│   ├── Direct client badges
│   └── Filter-based selection
├── AttachmentSection (reused)
├── Subject input (Email only)
├── RichTextEditor (reused)
├── Signature preview (Email only)
└── Action buttons (Send, Save Draft, Cancel)
```

## Client Pre-population Flow

```text
1. User clicks "Message" button in TaskDetailSheet
2. TaskDetailSheet passes taskClients[].client_id to dialog
3. ComposeMessageDialog initializes selectedClientIds state
4. ComposeToField receives selectedClientIds
5. ComposeToField fetches client details and displays badges
6. User sees linked clients already in "To" field
7. User can add/remove recipients before sending
```

## Expected Behavior

| Scenario | Result |
|----------|--------|
| Click "Message" on task with 2 clients | Dialog opens with 2 clients pre-selected |
| Remove a client from To field | Client badge disappears, count updates |
| Click Cancel or X | Dialog closes, user returns to task |
| Click Send | Message sent, dialog closes, toast shown |
| Click outside dialog | Dialog closes (optional: confirm if has content) |

## Key Design Decisions

1. **Reuse existing components** - Leverage `ComposeFromField`, `RichTextEditor`, `AttachmentSection`
2. **Dual selection mode** - Support both direct clients and filter-based bulk selection
3. **No page navigation** - Everything happens in a dialog overlay
4. **Task context preserved** - User stays on the task detail sheet throughout

