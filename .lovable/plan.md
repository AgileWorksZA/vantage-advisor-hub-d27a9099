

## Remove Green/Teal Color from "Additional contribution" Menu Item

### Change

#### `src/components/client-detail/Client360ViewTab.tsx`

Remove the `className="text-[hsl(180,70%,45%)]"` from the "Additional contribution" `DropdownMenuItem` so it renders in the default text color like the other menu items.

**Line ~147**: Change from:
```tsx
<DropdownMenuItem className="text-[hsl(180,70%,45%)]">Additional contribution</DropdownMenuItem>
```
To:
```tsx
<DropdownMenuItem>Additional contribution</DropdownMenuItem>
```

