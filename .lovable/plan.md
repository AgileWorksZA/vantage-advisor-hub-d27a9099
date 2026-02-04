

# Multi-Channel Communication Hub Implementation

## Overview

Transform the Email page into a multi-channel communication hub supporting Email, WhatsApp, SMS, and Push notifications. Add a channel selector bar, expand the setup dialog for WhatsApp Business configuration, and create a WhatsApp-style chat interface for direct messaging channels.

## Key Changes

1. **Move gear (setup) and refresh buttons** to the right of the filter button in the header bar
2. **Expand setup dialog** to support WhatsApp for Business account configuration
3. **Replace "Move to inbox/archive" buttons** with channel tabs (Email, WhatsApp, SMS, Push)
4. **Conditional UI rendering**:
   - Email channel: Shows email folders sidebar + email table
   - WhatsApp/SMS/Push channels: Hide email folders, show WhatsApp-style chat interface

## Architecture

```text
Email.tsx (renamed conceptually to CommunicationHub)
├── Channel Tabs Bar (Email | WhatsApp | SMS | Push)
│   └── Uses existing CommunicationTypeSelector component (modified)
├── Email View (when Email selected)
│   ├── Email Folders Sidebar
│   │   ├── Connected account display
│   │   ├── Compose button
│   │   └── Folder list
│   └── Email Table (existing)
├── Chat View (when WhatsApp/SMS/Push selected)
│   ├── Contacts/Conversations List (left column)
│   │   ├── Search bar
│   │   ├── Conversation list with last message preview
│   │   └── Unread indicators
│   └── Chat Panel (right column)
│       ├── Contact header (name, status)
│       ├── Message history (scrollable)
│       └── Message input box
└── Setup Dialog (expanded)
    ├── Email tab (existing)
    └── WhatsApp tab (new - WhatsApp Business API config)
```

## Visual Layout Changes

### Current Header (Email list area)
```text
┌─────────────────────────────────────────────────────────────┐
│                    [Search] [Date] [Filter]                  │
└─────────────────────────────────────────────────────────────┘
```

### New Header with Channel Tabs
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ [Email|WhatsApp|SMS|Push] [Compose]     [Search][Date][Filter][⚙️][🔄] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Chat Interface (for WhatsApp/SMS/Push)
```text
┌─────────────────────────────────────────────────────────────┐
│ [Email|WhatsApp|SMS|Push]    [Search][Date][Filter][⚙️][🔄] │
├───────────────────┬─────────────────────────────────────────┤
│ 🔍 Search...      │  👤 Alice Whitman                      │
│ ─────────────────│      online                    [📞][🔍] │
│ ▸ Archived    2  │ ────────────────────────────────────── │
│                   │                                         │
│ 👤 Maya Kasuma    │  ┌─────────────────────────┐  13:03    │
│   Yes! OK     14:54│  │ Here are all the files │           │
│                   │  └─────────────────────────┘           │
│ 👤 Jason Ballmer  │                                         │
│   Video      15:26│  OK! 👍                        14:04    │
│                   │                                         │
│ 👤 Alice Whitman ●│                 Today                   │
│   Wow! Have... 15:12│                                       │
│                   │  ┌──────────┐               15:06      │
│ ...               │  │  [Image] │                          │
│                   │  └──────────┘                          │
│                   │  So beautiful here!                     │
│                   │                                         │
│                   │  ┌─────────────────────────┐  15:12    │
│                   │  │ Wow! Have great time!   │ ✓✓        │
│                   │  └─────────────────────────┘           │
│                   │ ────────────────────────────────────── │
│                   │ 😊 📎 Type a message...           ▶    │
└───────────────────┴─────────────────────────────────────────┘
```

## Database Changes

**New table: `direct_messages`** - Store WhatsApp/SMS/Push messages

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users (adviser) |
| client_id | uuid | Reference to clients |
| channel | text | whatsapp, sms, push |
| direction | text | inbound, outbound |
| content | text | Message text |
| media_url | text | Optional attachment URL |
| status | text | sent, delivered, read, failed |
| external_id | text | Provider message ID |
| sent_at | timestamp | When message was sent |
| created_at | timestamp | Row creation time |

**Expand `email_settings` table** - Add WhatsApp Business fields

| Column | Type | Description |
|--------|------|-------------|
| whatsapp_phone_number | text | WhatsApp Business phone number |
| whatsapp_business_id | text | WhatsApp Business Account ID |
| whatsapp_api_token | text | API access token |
| whatsapp_is_active | boolean | Whether WhatsApp is enabled |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/email/ChatInterface.tsx` | WhatsApp-style chat view with contacts list and message panel |
| `src/components/email/ConversationList.tsx` | Left sidebar showing client conversations |
| `src/components/email/ChatPanel.tsx` | Right panel with message history and input |
| `src/hooks/useDirectMessages.ts` | Manage direct messages CRUD operations |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Email.tsx` | Add channel tabs, conditional rendering, move buttons to header |
| `src/components/email/EmailSetupDialog.tsx` | Add WhatsApp Business tab with configuration fields |
| `src/hooks/useEmailSettings.ts` | Add WhatsApp settings fields and methods |

## Implementation Details

### Email.tsx Changes

1. **Add state for active channel**:
   ```tsx
   const [activeChannel, setActiveChannel] = useState<CommunicationChannel>("Email");
   ```

2. **New header structure**:
   ```tsx
   <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
     {/* Left side: Channel tabs + Compose */}
     <div className="flex items-center gap-3">
       <CommunicationTypeSelector value={activeChannel} onChange={setActiveChannel} />
       <Button size="sm" className="bg-[hsl(180,70%,45%)]">
         <PenSquare /> Compose
       </Button>
     </div>
     
     {/* Right side: Search, Date, Filter, Setup, Refresh */}
     <div className="flex items-center gap-2">
       <Input placeholder="Search..." />
       <Button>Date selection</Button>
       <Button><Filter /></Button>
       <Button onClick={() => setSetupDialogOpen(true)}><Settings /></Button>
       <Button onClick={() => triggerFetch()}>
         <RefreshCw className={isFetching ? "animate-spin" : ""} />
       </Button>
     </div>
   </div>
   ```

3. **Conditional content rendering**:
   ```tsx
   {activeChannel === "Email" ? (
     <div className="flex flex-1 overflow-hidden">
       {/* Email folders sidebar */}
       {/* Email table */}
     </div>
   ) : (
     <ChatInterface channel={activeChannel} />
   )}
   ```

### EmailSetupDialog.tsx Changes

Add tabs for different channel configurations:

```text
┌─────────────────────────────────────────────────────────┐
│  Communication Setup                                  X │
├─────────────────────────────────────────────────────────┤
│  [Email] [WhatsApp]                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  WhatsApp Business Configuration:                       │
│                                                         │
│  Phone Number*                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ +27 XX XXX XXXX                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Business Account ID*                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 123456789012345                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  API Access Token*                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ••••••••••••••••••••                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⓘ Get your credentials from the Meta Business Suite  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                         [Cancel]  [Save Configuration]  │
└─────────────────────────────────────────────────────────┘
```

### ChatInterface.tsx Component

Main container that orchestrates the WhatsApp-style layout:

```tsx
interface ChatInterfaceProps {
  channel: "WhatsApp" | "SMS" | "Push";
}

const ChatInterface = ({ channel }: ChatInterfaceProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  return (
    <div className="flex flex-1 overflow-hidden">
      <ConversationList 
        channel={channel}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />
      <ChatPanel 
        channel={channel}
        clientId={selectedClientId}
      />
    </div>
  );
};
```

### ConversationList.tsx Component

Left sidebar showing recent conversations:

- Search bar for filtering clients
- List of clients with recent message preview
- Timestamp of last message
- Unread message indicator (badge)
- "Archived" section at top
- Client avatar/initials

### ChatPanel.tsx Component

Right panel with chat interface:

- Header: Client name, online status, action buttons
- Message history: Scrollable area with bubbles
  - Outbound messages: Right-aligned, teal background
  - Inbound messages: Left-aligned, gray background
  - Timestamps on each message
  - Read receipts (double checkmarks)
  - Media attachments (images, files)
- Input area: Emoji button, attachment, text input, send button

## Expected Behavior

| Action | Result |
|--------|--------|
| Click Email tab | Show email folders sidebar + email table |
| Click WhatsApp tab | Hide folders, show chat interface with client conversations |
| Click SMS tab | Same as WhatsApp but labeled for SMS |
| Click Push tab | Same interface for push notification history |
| Click gear icon | Open setup dialog with Email and WhatsApp tabs |
| Click refresh | Refresh current channel's messages (spinner) |
| Select client in conversation list | Load message history in chat panel |
| Type and send message | Add message to history, send via API (future) |
| Click client name in chat header | Navigate to client profile |

## Technical Notes

1. **Channel type reuse**: Leverages existing `CommunicationChannel` type from `useCommunicationCampaigns.ts`
2. **CommunicationTypeSelector**: Existing component already implements the tab design matching the reference image
3. **Client data**: Uses `useClients` hook to populate conversation list
4. **Message storage**: New `direct_messages` table stores conversation history
5. **Real-time updates**: Can add Supabase realtime subscription for incoming messages (future enhancement)
6. **WhatsApp Business API**: Requires Meta Business Suite credentials (phone, business ID, token)

