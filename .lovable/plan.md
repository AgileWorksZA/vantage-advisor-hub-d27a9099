
# Swap Task Pool and Inbox Order with Sub-folder Indentation

## Overview

Reorder the folder list so "Inbox" appears first, followed by "Task Pool" indented to indicate it's a sub-folder of Inbox.

## Changes Required

### File: `src/pages/Email.tsx`

**1. Reorder and add indentation property to folderItems array (lines 51-59):**

```tsx
const folderItems: { icon: React.ComponentType<any>; label: string; folder: EmailFolder | null; indent?: boolean }[] = [
  { icon: Inbox, label: "Inbox", folder: "Inbox" },
  { icon: Inbox, label: "Task Pool", folder: "Task Pool", indent: true },
  { icon: FileText, label: "Draft", folder: "Draft" },
  { icon: Send, label: "Sent", folder: "Sent" },
  { icon: Clock, label: "Queue", folder: "Queue" },
  { icon: XCircle, label: "Failed", folder: "Failed" },
  { icon: FolderArchive, label: "Archived", folder: "Archived" },
];
```

**2. Update folder button rendering to apply indentation (lines 256-261):**

```tsx
className={cn(
  "w-full flex items-center gap-2 py-2 text-sm",
  folder.indent ? "pl-8 pr-4" : "px-4",  // Indent Task Pool
  activeFolder === folder.folder
    ? "text-[hsl(180,70%,45%)] bg-[hsl(180,70%,45%)]/10"
    : "text-foreground hover:bg-muted/50"
)}
```

## Visual Result

```
┌──────────────────────┐
│ Inbox            (5) │
│   Task Pool      (3) │  ← Indented to show sub-folder
│ Draft                │
│ Sent                 │
│ Queue                │
│ Failed               │
│ Archived             │
└──────────────────────┘
```

## Summary

| Step | Change |
|------|--------|
| 1 | Add `indent?: boolean` to folder type definition |
| 2 | Swap Inbox and Task Pool order in array |
| 3 | Add `indent: true` to Task Pool item |
| 4 | Apply conditional `pl-8` padding for indented items |
