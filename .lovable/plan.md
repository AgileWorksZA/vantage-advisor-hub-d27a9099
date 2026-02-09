

## Enhanced WhatsApp Chat with Attachments, Polls, and Tabs

### Overview
Enhance the WhatsApp (and SMS/Push) chat interface to match the reference design, adding image attachments in conversations, WhatsApp polls, bottom navigation tabs (Recent/Favourites/Contacts), jurisdiction-based filtering, and displaying client phone numbers.

### Database Changes

#### 1. Add `message_type` and `poll_data` columns to `direct_messages`
- `message_type TEXT NOT NULL DEFAULT 'text'` -- values: 'text', 'image', 'poll', 'document'
- `poll_data JSONB NULL` -- stores poll question, options, and votes

#### 2. Create `whatsapp_favourites` table
Stores per-user favourite clients for the WhatsApp Favourites tab:
```
id UUID PK
user_id UUID NOT NULL
client_id UUID NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
UNIQUE(user_id, client_id)
```
With RLS: users can only access their own rows.

#### 3. Seed media messages and polls
Create a new edge function `seed-whatsapp-enhanced` that:
- Updates ~20% of existing WhatsApp messages to include `media_url` (using placeholder image URLs like `/images/world-dots.png` or similar stock patterns)
- Inserts ~3-5 poll messages per jurisdiction with realistic poll content (e.g., "What time works best for our review meeting?", "Which fund option do you prefer?")
- Sets `message_type` accordingly

### UI Changes

#### 4. ConversationList -- Add bottom tabs and jurisdiction filtering
- Add "Recent", "Favourites", "Contacts" tabs at the bottom of the conversation list (matching the reference image)
- **Recent**: Current conversation list (default)
- **Favourites**: Shows clients from `whatsapp_favourites` table with star toggle
- **Contacts**: Shows all clients for the selected jurisdiction with their phone numbers
- Filter conversations by the currently selected jurisdiction (region context)
- Display client phone number as subtitle in the conversation list

#### 5. ChatPanel -- Render attachments and polls
- **Image messages**: Render `media_url` as clickable thumbnail images in chat bubbles (rounded corners, max-width 70%, grouped in a grid for multiple images like the reference)
- **Poll messages**: Render poll question with radio-style options, vote counts, and a total votes footer
- **Document messages**: Show as file attachment chip with download icon

#### 6. ChatPanel -- Add poll creation
- Add a "Poll" button in the input bar (next to emoji/attachment)
- Opens a small dialog to create a poll: question + up to 4 options
- Sends as a message with `message_type: 'poll'`

#### 7. ChatInterface -- Pass jurisdiction context
- Import `useRegion` and pass the selected region to `ConversationList` and the hook
- Filter conversations to only show clients matching the current jurisdiction

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/seed-whatsapp-enhanced/index.ts` | Seeds media URLs, polls into existing WhatsApp messages |
| `src/components/email/WhatsAppPollBubble.tsx` | Poll message bubble component |
| `src/components/email/CreatePollDialog.tsx` | Dialog for creating new polls |
| `src/hooks/useWhatsAppFavourites.ts` | Hook for managing favourite contacts |

### Files to Modify
| File | Change |
|------|--------|
| `src/hooks/useDirectMessages.ts` | Add `message_type` and `poll_data` to DirectMessage interface; add jurisdiction filtering parameter |
| `src/components/email/ChatPanel.tsx` | Render image attachments, polls, and document messages; add poll creation button |
| `src/components/email/ConversationList.tsx` | Add Recent/Favourites/Contacts tabs; show phone numbers; accept jurisdiction prop |
| `src/components/email/ChatInterface.tsx` | Pass jurisdiction context from region selector |

### Technical Details

**Poll data structure** (stored in `poll_data` JSONB):
```json
{
  "question": "What time works for our meeting?",
  "options": [
    { "text": "9:00 AM", "votes": 1 },
    { "text": "2:00 PM", "votes": 0 },
    { "text": "4:00 PM", "votes": 2 }
  ],
  "total_votes": 3,
  "is_closed": false
}
```

**Image rendering**: Messages with `message_type: 'image'` will display `media_url` as a thumbnail image inside the chat bubble, with the text content shown as a caption below.

**Jurisdiction filtering**: The `useDirectMessages` hook will accept an optional jurisdiction parameter and join with the `clients` table to filter by `country_of_issue`.

