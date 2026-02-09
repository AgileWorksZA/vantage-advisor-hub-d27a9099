

## Style WhatsApp/SMS/Push Conversation List Like Reference Image

### Changes (single file: `src/components/email/ConversationList.tsx`)

#### 1. Bold unread conversation names
- When `unread_count > 0`, apply `font-bold` to the client name (currently only changes color)

#### 2. Bold unread message preview  
- When `unread_count > 0`, apply `font-semibold` to the last message text

#### 3. Green circle for unread count
- Change the unread badge from teal (`bg-[hsl(180,70%,45%)]`) to green (`bg-green-500`)
- Make it a proper circle: `rounded-full w-5 h-5 flex items-center justify-center` instead of the current Badge component
- Display the unread count number inside

#### 4. Time color for unread
- When `unread_count > 0`, show the time in green (`text-green-500`) to match the reference image style

### Technical Details

All changes are in the `renderConversationItem` function (lines 75-113) of `ConversationList.tsx`:

- Line 91: Add `font-bold` when unread (currently `font-medium`)
- Line 94: Add `text-green-500` when unread for the time
- Line 102: Add `font-semibold` when unread for message preview  
- Lines 105-109: Replace `Badge` with a plain green circle `div`

No backend changes needed -- this is purely a UI styling update that applies to all channels (WhatsApp, SMS, Push) across all jurisdictions automatically since they all use the same `renderConversationItem` function.
