

## Convert Quote Wizard from Dialog to Full-Screen Inline View

### Overview
Replace the modal/dialog-based Quote Wizard with a full-screen inline view that takes over the main content area of the client detail page, using the entire scrollable area.

### Approach
When the user clicks "+ Quote" in the 360 View tab, instead of opening a dialog, we replace the tab content area with the Quote Wizard rendered inline. A "Back" or "Cancel" action returns the user to the 360 View tab.

### Changes

#### 1. `src/components/client-detail/QuoteWizardDialog.tsx` -- Convert to inline component

- Remove the `Dialog` / `DialogContent` wrapper entirely
- Remove `open` and `onOpenChange` props; replace with just `onClose: () => void`
- Rename component to `QuoteWizardView` (keep the file name for now to minimize churn, or rename file)
- The outer element becomes a plain `div` with `flex h-full` layout (fills the parent content area)
- Left panel and right sidebar remain the same internal layout but now fill the screen naturally
- The "Cancel" and "Save and close" buttons call `onClose()`

#### 2. `src/components/client-detail/Client360ViewTab.tsx` -- Toggle between 360 content and Quote view

- Add a `showQuoteInline` state (boolean)
- When `showQuoteWizard` is triggered (the existing "+ Quote" click), set `showQuoteInline = true` instead of opening a dialog
- Conditionally render: if `showQuoteInline` is true, render `<QuoteWizardView onClose={() => setShowQuoteInline(false)} jurisdiction={jurisdiction} />` instead of the normal 360 View content
- Remove the old `<QuoteWizardDialog>` usage

#### 3. Layout details

The Quote Wizard view will:
- Use `className="flex h-full"` to fill the entire `<main>` scrollable area
- Left panel: `flex-1 flex flex-col min-h-0` with internal `ScrollArea` for step content
- Right sidebar: `w-64 bg-muted/30 border-l` (unchanged from current)
- The whole view stretches to fill the tab content area naturally

### Technical Summary

| File | Change |
|------|--------|
| `QuoteWizardDialog.tsx` | Remove `Dialog`/`DialogContent` wrapper; change props from `open/onOpenChange` to `onClose`; render as plain `div` |
| `Client360ViewTab.tsx` | Replace dialog toggle with inline view toggle; conditionally render Quote view or 360 content |
