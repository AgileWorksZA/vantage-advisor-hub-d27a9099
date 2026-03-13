

## Wrap Meeting Title

### Change

**`src/components/client-detail/ClientMeetingsTab.tsx` — Line 139**

Replace `truncate` with `line-clamp-2 break-words` so long meeting titles wrap to a second line instead of being cut off with ellipsis.

```tsx
// Before
<p className="text-sm font-medium text-foreground truncate mb-1">{event.title}</p>

// After
<p className="text-sm font-medium text-foreground mb-1 line-clamp-2 break-words">{event.title}</p>
```

Single-line change, no other files affected.

