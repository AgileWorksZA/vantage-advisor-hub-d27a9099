

# Remove Avatar Icon from General Details Card

## Overview
Remove the circular avatar/initials icon (the teal circle showing e.g. "KF") from the "General details" card header on the Client Summary tab. This frees up vertical space in the card.

## Change

### `src/components/client-detail/ClientSummaryTab.tsx`
- Remove the `Avatar` and `AvatarFallback` components from inside the General Details `CardHeader`
- Remove the wrapping `div` with `flex items-start justify-between` since it is no longer needed to position the avatar opposite the title
- Keep the `CardTitle` as-is
- Remove the now-unused `Avatar` and `AvatarFallback` imports (if not used elsewhere in the file)

**Before:**
```text
<CardHeader>
  <div className="flex items-start justify-between">
    <CardTitle>General details</CardTitle>
    <Avatar>           <-- remove
      <AvatarFallback> <-- remove
        {initials}
      </AvatarFallback>
    </Avatar>
  </div>
</CardHeader>
```

**After:**
```text
<CardHeader>
  <CardTitle>General details</CardTitle>
</CardHeader>
```

This is a single-file, single-location change. No other files or components are affected.

