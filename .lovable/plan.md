
# Enhance Docs Button in AI Chat Header

## Change

**File: `src/components/ai-assistant/ChatPanel.tsx`** -- Lines 159-167

Update the Docs button from an icon-only ghost button to a styled button with both the ExternalLink icon and the text "Docs", matching the Lovable reference design (outlined button with icon + label).

**Before:**
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleDocsClick}
  className="h-8 w-8 text-muted-foreground hover:text-foreground"
  title="Help docs"
>
  <ExternalLink className="w-4 h-4" />
</Button>
```

**After:**
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={handleDocsClick}
  className="h-8 px-2.5 text-muted-foreground hover:text-foreground gap-1.5 text-xs"
  title="Help docs"
>
  <ExternalLink className="w-3.5 h-3.5" />
  Docs
</Button>
```

This changes the button from `ghost`/`icon` to `outline`/`sm` with text, giving it a visible border and the "Docs" label next to the icon -- matching the reference screenshot style.
