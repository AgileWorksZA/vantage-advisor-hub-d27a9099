

# Email Setup Dialog & Display Improvements

## Issues Identified

1. **Dialog size on smaller screens**: The dialog uses `sm:max-w-[500px]` which is fine, but it needs:
   - Proper padding/margins on mobile (currently `w-full` which is good)
   - `max-h-[90vh]` with scrollable content for smaller screen heights
   - IMAP fields grid should stack on mobile (currently `grid-cols-2` always)

2. **Email address display doesn't update**: The Email.tsx shows `emailSettings?.email_address` when connected, but:
   - The `useEmailSettings` hook data isn't being reactive after setup dialog closes
   - Need to ensure the hook refetches after settings are saved

3. **No indication when email not linked**: Currently shows `userEmail` fallback, but should indicate "No email connected" or similar with a prompt to set up

## Changes Required

### 1. EmailSetupDialog.tsx - Mobile Responsiveness

| Issue | Fix |
|-------|-----|
| Dialog may overflow on small screens | Add `max-h-[90vh]` and `overflow-y-auto` to content wrapper |
| IMAP fields grid too narrow on mobile | Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` |
| Footer buttons stacking | Already handled by DialogFooter default classes |

### 2. Email.tsx - Dynamic Email Address Display

**Current Code (lines 188-191):**
```tsx
<p className="text-sm text-muted-foreground truncate flex-1">
  {isConnected ? emailSettings?.email_address : userEmail}
</p>
```

**Updated Behavior:**
- If connected: Show the configured email address
- If not connected: Show "No email linked" with italic styling and a visual cue to click the setup button

### 3. useEmailSettings.ts - Ensure Reactivity

Check if the hook properly updates when settings are saved. May need to trigger a refetch after `saveSettings` completes.

## Implementation Details

### EmailSetupDialog.tsx Changes

```text
DialogContent
├── Add: max-h-[90vh] overflow-y-auto
├── ScrollArea wrapper (optional for smooth scrolling)
└── IMAP grid: grid-cols-1 sm:grid-cols-2
```

### Email.tsx Email Address Section

```text
Current:
┌────────────────────────────────────┐
│ demo@vantage.co.za          [⚙️]   │
└────────────────────────────────────┘

Updated (not connected):
┌────────────────────────────────────┐
│ No email linked (click to setup) [⚙️]│
└────────────────────────────────────┘

Updated (connected):
┌────────────────────────────────────┐
│ user@gmail.com              [⚙️]   │
└────────────────────────────────────┘
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/email/EmailSetupDialog.tsx` | Add max-height, overflow scrolling, responsive IMAP grid |
| `src/pages/Email.tsx` | Update email display logic to show "No email linked" state |
| `src/hooks/useEmailSettings.ts` | Ensure `refetch` is called after save (if not already) |

## Detailed Changes

### EmailSetupDialog.tsx

1. **Line 120**: Add responsive max-height and scroll
   ```tsx
   <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
   ```

2. **Line 183**: Make IMAP grid stack on mobile
   ```tsx
   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
   ```

### Email.tsx

1. **Lines 188-191**: Update email display section
   ```tsx
   <div className="p-4 border-b border-border flex items-center justify-between gap-2">
     {isConnected && emailSettings?.email_address ? (
       <p className="text-sm text-muted-foreground truncate flex-1">
         {emailSettings.email_address}
       </p>
     ) : (
       <button 
         onClick={() => setSetupDialogOpen(true)}
         className="text-sm text-muted-foreground italic truncate flex-1 text-left hover:text-foreground"
       >
         No email linked
       </button>
     )}
     <Button
       variant="ghost"
       size="icon"
       className="h-6 w-6 shrink-0"
       onClick={() => setSetupDialogOpen(true)}
       title="Email Setup"
     >
       <Settings className="w-4 h-4" />
     </Button>
   </div>
   ```

## Expected Behavior

| Scenario | Display |
|----------|---------|
| No email configured | "No email linked" (italic, clickable) + Settings icon |
| Email configured | Email address shown + Settings icon |
| Small screen (dialog) | Dialog scrollable, IMAP fields stacked |
| Medium+ screen (dialog) | IMAP fields side-by-side |

