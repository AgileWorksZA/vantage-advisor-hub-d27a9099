

# Email Page Layout Alignment

## Overview

Restructure the Email page to have consistent sidebar width and layout across all communication channels (Email, WhatsApp, SMS, Push). The WhatsApp width (`w-72`) becomes the standard for all channels.

## Changes Required

### 1. Email Sidebar Width: `w-48` → `w-72`

Change line 188 in `src/pages/Email.tsx`:
```tsx
// FROM:
<div className="w-48 bg-background border-r border-border flex flex-col">

// TO:
<div className="w-72 bg-background border-r border-border flex flex-col">
```

### 2. Remove Search from Header (Lines 254-257)

Remove the search input from the header area so filters remain in fixed position:
```tsx
// REMOVE:
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input placeholder="Search..." className="pl-10 w-48 h-8 text-sm" />
</div>
```

### 3. Restructure Email Sidebar Layout

**New order:**
1. **Search** - Add at top (matching ConversationList style)
2. **Compose Button** - Below search
3. **Folder List** - Task Pool through Archived
4. **Email Address** - Move to bottom with `border-t`

**Updated sidebar structure:**
```tsx
{activeChannel === "Email" && (
  <div className="w-72 bg-background border-r border-border flex flex-col">
    {/* Search - NEW: Top position to align with other channels */}
    <div className="p-3 border-b border-border">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search emails..." className="pl-10 h-9" />
      </div>
    </div>

    {/* Action Buttons - Compose */}
    <div className="p-3 flex flex-wrap gap-2 border-b border-border">
      <Button ...>Compose</Button>
    </div>

    {/* Folder List */}
    <div className="flex-1 py-2">
      {folderItems.map(...)}
    </div>

    {/* Email Address - MOVED: Below Archived with top border */}
    <div className="p-4 border-t border-border">
      {isConnected && emailSettings?.email_address ? (
        <p className="text-sm text-muted-foreground truncate">
          {emailSettings.email_address}
        </p>
      ) : (
        <button onClick={() => setSetupDialogOpen(true)} ...>
          No email linked
        </button>
      )}
    </div>
  </div>
)}
```

## Visual Layout Comparison

**Before:**
```
┌──────────────────────────────────────────────────────────────────────┐
│ Email Sidebar (w-48)    │ Header                                     │
│ ┌──────────────────────┐│ [Tabs]        [Search][Date][Filter][⚙][↻] │
│ │ adviser@email.com    ││                                            │
│ │ [Compose]            ││                                            │
│ │ Task Pool ... Archived││                                           │
│ └──────────────────────┘│                                            │
└──────────────────────────────────────────────────────────────────────┘

│ WhatsApp Sidebar (w-72) │ Header                                     │
│ ┌──────────────────────┐│ [Tabs]        [Search][Date][Filter][⚙][↻] │
│ │ [Search...]          ││                                            │
│ │ Archived             ││                                            │
│ │ Conversations...     ││                                            │
│ └──────────────────────┘│                                            │
```

**After (Aligned):**
```
┌──────────────────────────────────────────────────────────────────────┐
│ Email Sidebar (w-72)    │ Header                                     │
│ ┌──────────────────────┐│ [Tabs]              [Date][Filter][⚙][↻]   │
│ │ [Search emails...]   ││                                            │
│ │ [Compose]            ││                                            │
│ │ Task Pool            ││                                            │
│ │ ... Archived         ││                                            │
│ │ adviser@email.com    ││                                            │
│ └──────────────────────┘│                                            │
└──────────────────────────────────────────────────────────────────────┘

│ WhatsApp Sidebar (w-72) │ Header                                     │
│ ┌──────────────────────┐│ [Tabs]              [Date][Filter][⚙][↻]   │
│ │ [Search WhatsApp...] ││                                            │
│ │ Archived             ││                                            │
│ │ Conversations...     ││                                            │
│ └──────────────────────┘│                                            │
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Email.tsx` | 1. Change sidebar width `w-48` → `w-72`<br>2. Remove search from header<br>3. Add search to top of sidebar<br>4. Move email address to bottom of sidebar |

## Implementation Order

1. Change sidebar width from `w-48` to `w-72`
2. Remove search input from header (lines 254-257)
3. Add search input at top of email sidebar (before Compose)
4. Move email address display to bottom of sidebar (after folder list)

