

## Add Action Menu to On-Platform Investment Products

### Overview
Add a dropdown menu to the 3-dots (MoreVertical) button on each On-Platform Investment Product row in the 360 View tab. The menu will contain 5 action items matching the reference image.

### Menu Items
1. **Additional contribution** (styled in teal, as the primary action)
2. Rebalance
3. Switch
4. Phase-in
5. Withdraw

### Changes

#### `src/components/client-detail/Client360ViewTab.tsx`

1. **Import** `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` from `@/components/ui/dropdown-menu`

2. **Replace** the plain `MoreVertical` button (lines 134-136) with a `DropdownMenu` component:
   - The trigger remains the same ghost icon button with `MoreVertical`
   - The content contains 5 `DropdownMenuItem` entries
   - "Additional contribution" gets `text-[hsl(180,70%,45%)]` styling to match the teal color shown in the reference image
   - Other items use default styling

### Technical Detail

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <MoreVertical className="h-4 w-4 text-muted-foreground" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem className="text-[hsl(180,70%,45%)]">Additional contribution</DropdownMenuItem>
    <DropdownMenuItem>Rebalance</DropdownMenuItem>
    <DropdownMenuItem>Switch</DropdownMenuItem>
    <DropdownMenuItem>Phase-in</DropdownMenuItem>
    <DropdownMenuItem>Withdraw</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

This applies to all On-Platform Investment Product rows for all clients regardless of jurisdiction, since the menu is rendered inside the `.map()` loop over `visibleOnPlatformProducts`.
