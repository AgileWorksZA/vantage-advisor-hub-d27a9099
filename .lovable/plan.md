

## Communication Tab Enhancements

### 1. Remove Webinar and Office Event channels

Remove these two channels from both the hook's channel list and the UI's icon mapping.

**Hook (`useClientCommunications.ts`)**: Remove the two entries from the `channelList` array (lines 103-104) and from the `Communication["channel"]` type union.

**Tab (`ClientCommunicationTab.tsx`)**: Remove from `channelIcons` map.

### 2. Remove "Communication" from heading, add contact info tags

Change the heading from `"Communication Email"` to just `"Email"` (use `activeChannel || "All"`).

Next to each channel name in the sidebar, show a small tag with the relevant contact identifier:
- Email: client's email address (e.g. `foundation@stmarys.org`)
- SMS / WhatsApp / Phone: client's cell number (e.g. `+1 212 100 1001`)
- Push: no tag

This requires fetching client data via `useClientDetail(clientId)` in the tab component.

### 3. Replace "Reset" with "Refresh"

Change button label and keep the same `RotateCcw` icon + behavior.

### 4. Add All / Received / Sent direction filter

Add a toggle group (3 buttons) below the heading bar. Filter communications client-side by `direction`:
- **All**: show everything (default)
- **Received**: show `direction === "Inbound"`
- **Sent**: show `direction === "Outbound"`

The hook's `CommunicationListItem` needs to include `direction` so the tab can filter. Add `direction: string` to the interface and include it in `transformCommunicationToListItem`.

### 5. Add AI sentiment indicator

Add a colored dot next to each communication row indicating sentiment:
- Green: Positive tone
- Orange: Neutral/mixed tone
- Red: Negative tone

The sentiment is deterministically derived from the communication content using a simple hash of the content string (simulating AI analysis). Wrap each dot in a `Tooltip` showing an explanation like "Positive sentiment detected" / "Neutral sentiment" / "Negative sentiment detected".

### Technical details

**Files to modify:**

| File | Changes |
|------|---------|
| `src/hooks/useClientCommunications.ts` | Remove Webinar/Office Event from type and channel list; add `direction` to `CommunicationListItem` |
| `src/components/client-detail/ClientCommunicationTab.tsx` | Remove Webinar/Office Event icons; add client detail fetch for contact tags; rename heading; change Reset to Refresh; add direction filter toggle; add sentiment dots with tooltips |

