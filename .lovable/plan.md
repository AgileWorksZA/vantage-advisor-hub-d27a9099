

# Add Paperclip Icon to Email List and Relocate Attachments in Email View

## Overview

This plan addresses two requirements:
1. Ensure a paperclip icon is visible between the checkbox/selector column and the "From" column for emails with attachments
2. Relocate the attachments section in the Email View page to appear below Task Linking and above the email body

## Current State Analysis

### Email List (Email.tsx)
- The paperclip icon column already exists (lines 342-345)
- It displays a `Paperclip` icon when `email.hasAttachment` is true
- The table structure has the column in the correct position

### Email View (EmailView.tsx)
- Attachments are currently displayed at the bottom after the email body (lines 313-320)
- Uses the `AttachmentList` component which already opens files in new windows

## Changes Required

### File: `src/pages/EmailView.tsx`

**Move Attachments Section**: Relocate the attachments section from after the email body to between the TaskLinkingSection and the email body.

**Current order (lines 287-320):**
1. Task Linking Section
2. Email Body
3. Attachments (bottom)

**New order:**
1. Task Linking Section
2. Attachments (new position - matching the reference screenshot style)
3. Email Body

**Updated styling**: Match the reference screenshot showing "Attachments" label with a clickable document chip/badge that opens the file in a new window.

### Visual Reference

The attachments section should look like the second uploaded screenshot:
- Label: "Attachments" on the left
- Document chips/badges showing file icon and filename
- Clicking opens in new browser tab

### Code Changes

```tsx
{/* Task Linking Section */}
<TaskLinkingSection ... />

{/* Attachments - NEW POSITION */}
{attachments.length > 0 && (
  <div className="flex items-center gap-3">
    <Label className="text-sm text-muted-foreground">Attachments</Label>
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <button
          key={attachment.id}
          onClick={() => window.open(attachment.file_path, "_blank")}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded border border-border hover:bg-muted transition-colors text-sm"
        >
          <FileIcon className="w-4 h-4 text-primary" />
          {attachment.file_name}
        </button>
      ))}
    </div>
  </div>
)}

{/* Email Body */}
<div className="bg-accent/30 rounded-lg p-6">
  ...
</div>
```

## Summary of Changes

| File | Change | Description |
|------|--------|-------------|
| `src/pages/EmailView.tsx` | Modify | Move attachments section from bottom to between Task Linking and Email Body |
| `src/pages/EmailView.tsx` | Modify | Add FileText icon import for document display |
| `src/pages/EmailView.tsx` | Modify | Style attachments as clickable chips that open in new window |

## Notes

- The Email.tsx page already has the paperclip icon in the correct position
- The `AttachmentList` component already supports opening files in new tabs via `window.open`
- The new inline attachment display provides a cleaner, more prominent experience matching the reference design

