

## Move Direction Filter Inline with Refresh Button

Move the All/Received/Sent toggle group from its own row into the same row as the Refresh button and search bar.

### Change

In `src/components/client-detail/ClientCommunicationTab.tsx`, move the `ToggleGroup` (lines 129-133) into the `flex items-center gap-2` div (line 117) that contains the Refresh button and search input. Delete the standalone `ToggleGroup` block.

The resulting toolbar will read: `[All | Received | Sent]  [Refresh]  [Search...]` all on one line.

### File

| File | Action |
|------|--------|
| `src/components/client-detail/ClientCommunicationTab.tsx` | Move ToggleGroup into the header row, remove standalone block |

