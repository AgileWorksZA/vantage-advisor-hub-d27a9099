
# Marketing Communication Compose Screen

## Overview

Create a comprehensive compose screen for the Email page that allows advisers to send single communications or bulk mail campaigns with personalization. The screen adapts dynamically based on communication type (Email, WhatsApp, SMS, Push) and integrates with client data from the database.

---

## Database Schema Changes

### 1. New Table: `user_settings`

Stores user-specific settings including email signature.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | References auth user |
| email_signature | text | NULL | HTML email signature |
| default_from_primary_adviser | boolean | false | Send from primary adviser by default |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

### 2. New Table: `team_members`

Stores practice team members for "send on behalf of" functionality.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | Owner user ID |
| name | text | NOT NULL | Team member name |
| email | text | NOT NULL | Team member email |
| role | text | NULL | Role (Adviser, Support, etc.) |
| is_primary_adviser | boolean | false | Is primary adviser |
| is_active | boolean | true | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

### 3. New Table: `communication_campaigns`

Stores composed communications/campaigns before sending.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | |
| channel | communication_channel | 'Email' | Email/SMS/WhatsApp/Push |
| campaign_type | text | 'Single' | Single/Bulk |
| description | text | NULL | Campaign description |
| from_user_id | uuid | NULL | Sender (team member) |
| from_primary_adviser | boolean | false | |
| subject | text | NULL | Subject line |
| body_html | text | NULL | HTML body with personalization |
| body_text | text | NULL | Plain text version |
| scheduled_at | timestamptz | NULL | For scheduling |
| importance | text | 'Normal' | Low/Normal/High/Urgent |
| request_read_receipt | boolean | false | |
| is_newsletter | boolean | false | |
| allow_duplicates | boolean | false | |
| auto_note_completion | boolean | true | Auto-create note on send |
| recipient_filter | jsonb | '{}' | Client filter criteria |
| recipient_client_ids | uuid[] | '{}' | Explicit client IDs |
| attachment_types | text[] | '{}' | Files/Financial report/etc. |
| status | text | 'Draft' | Draft/Scheduled/Sending/Sent/Failed |
| sent_at | timestamptz | NULL | |
| sent_count | integer | 0 | |
| failed_count | integer | 0 | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |
| is_deleted | boolean | false | |
| deleted_at | timestamptz | NULL | |

### 4. New Table: `campaign_attachments`

Stores attachments for campaigns.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | Primary key |
| user_id | uuid | NOT NULL | |
| campaign_id | uuid | NOT NULL | References campaign |
| attachment_type | text | NOT NULL | Files/Financial report/Client data sheet/Review letter/Survey |
| file_path | text | NULL | For file uploads |
| file_name | text | NULL | |
| file_size | integer | NULL | |
| created_at | timestamptz | now() | |

### 5. Add Storage Bucket: `campaign-attachments`

For storing uploaded files.

---

## Component Architecture

```text
src/pages/Email.tsx
  └── ComposeButton (onClick → navigate to compose)

src/pages/ComposeEmail.tsx (NEW)
  ├── Header: Test Mail Button, Save Draft, Send
  ├── CommunicationTypeSelector (Email/SMS/WhatsApp/Push)
  ├── ComposeSidebar (Options panel)
  │   ├── Description input
  │   ├── Scheduler (date/time picker)
  │   ├── Auto note completion toggle
  │   ├── Importance selector
  │   ├── Read request toggle
  │   ├── Is Newsletter toggle
  │   └── Allow duplicates toggle
  ├── ComposeMainContent
  │   ├── FromField (team member dropdown + primary adviser checkbox)
  │   ├── ToField (opens ClientFilterDialog)
  │   ├── AttachmentSection
  │   │   └── AttachmentTypeSelector (Files/Financial report/etc.)
  │   ├── SubjectField
  │   ├── RichTextEditor (WYSIWYG with personalization variables)
  │   └── SignatureBlock (from user_settings)
  └── ClientFilterDialog (popup for recipient filtering)
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/pages/ComposeEmail.tsx` | Main compose page component |
| `src/components/email/CommunicationTypeSelector.tsx` | Channel selector (Email/SMS/WhatsApp/Push) |
| `src/components/email/ComposeSidebar.tsx` | Options panel |
| `src/components/email/ComposeFromField.tsx` | From field with team member dropdown |
| `src/components/email/ComposeToField.tsx` | To field with filter trigger |
| `src/components/email/ClientFilterDialog.tsx` | Popup for advanced client filtering |
| `src/components/email/AttachmentSection.tsx` | Attachment management |
| `src/components/email/RichTextEditor.tsx` | WYSIWYG editor with personalization |
| `src/components/email/PersonalizationPopover.tsx` | Variable insertion popover |
| `src/hooks/useTeamMembers.ts` | Hook for team member data |
| `src/hooks/useUserSettings.ts` | Hook for user settings (signature) |
| `src/hooks/useCommunicationCampaigns.ts` | Hook for campaign CRUD |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Email.tsx` | Add onClick to Compose button to navigate |
| `src/App.tsx` | Add route for `/email/compose` |

---

## Implementation Details

### Communication Type Selector

Dynamic form that changes based on selected channel:

| Channel | Fields Shown |
|---------|--------------|
| Email | Full form with HTML editor, CC/BCC, attachments |
| SMS | Character-limited text (160 chars), no attachments |
| WhatsApp | Template-based, media attachments |
| Push | Title + short message only |

### From Field Behavior

1. Default: Logged-in user's email
2. Dropdown: List team members from `team_members` table
3. Checkbox: "Send from primary adviser" - overrides to primary adviser

### To Field & Client Filter Dialog

Opens popup with filter builder:
- Multiple filter rows (AND logic)
- Each row: Field selector → Operator → Value

Available CRM fields for filtering:
- Profile Type (Lead/Prospect/Client)
- Client Type (Individual/Family/Business)
- Gender, Language, Nationality
- Age Range (from date_of_birth)
- Location (residential_address)
- Advisor, Wealth Manager
- Rating
- Tags/Interests

Operators: equals, not equals, contains, starts with, greater than, less than, is empty, is not empty

### Rich Text Editor (WYSIWYG)

Toolbar includes:
- Bold, Italic, Underline
- Text alignment
- Lists (bullet, numbered)
- Links
- **Personalization button** → opens PersonalizationPopover

### Personalization Variables

Variables inserted as `{{variable_name}}`:

| Variable | Description |
|----------|-------------|
| `{{first_name}}` | Client's first name |
| `{{surname}}` | Client's surname |
| `{{preferred_name}}` | Preferred name if set |
| `{{title}}` | Mr/Mrs/Ms/Dr |
| `{{email}}` | Primary email |
| `{{cell_number}}` | Cell phone |
| `{{advisor}}` | Assigned advisor name |
| `{{date_of_birth}}` | Date of birth |
| `{{age}}` | Calculated age |

### Attachment Options

| Type | Description |
|------|-------------|
| Files | Upload custom files |
| Financial report | Generate from client data |
| Client data sheet | Export client summary |
| Review letter | Template-based document |
| Survey | Link to survey form |

### Test Mail Functionality

- Single recipient: Sends to logged-in user's email
- Bulk mail: Sends to first 20 clients matching filter (with "[TEST]" prefix in subject)

### Signature Block

Pulls from `user_settings.email_signature`:
- Rendered as read-only preview at bottom
- Link to Practice Settings → Communication tab to edit

---

## Technical Specifications

### RichTextEditor Implementation

Use native `contenteditable` div with custom toolbar (no external WYSIWYG library needed for MVP). Key features:
- `execCommand` for formatting
- Custom personalization insertion at cursor position
- HTML sanitization on save

### Client Filter Query Building

The filter dialog builds a JSONB filter object:
```json
{
  "conditions": [
    { "field": "profile_type", "operator": "equals", "value": "Client" },
    { "field": "language", "operator": "equals", "value": "English" }
  ]
}
```

This is stored in `communication_campaigns.recipient_filter` and processed when sending.

### Route Configuration

```typescript
// App.tsx
<Route path="/email/compose" element={<ComposeEmail />} />
```

---

## UI/UX Design Notes

- Use consistent teal color scheme (`hsl(180,70%,45%)`)
- Compose page uses full-width layout similar to Email page
- Options sidebar on left, main compose area on right
- Test Mail button: Prominent position at top-right, teal outline
- Channel selector: Large segmented control at top
- Responsive: Stack layout on smaller screens

---

## Dependencies

No new npm packages required. Uses:
- Existing Radix UI components
- Native contenteditable for rich text
- Existing Supabase client

---

## RLS Policies

All new tables will have RLS enabled with policies:
- Users can only CRUD their own records
- `auth.uid() = user_id` check on all operations

---

## Summary

This implementation creates a full-featured marketing communication compose screen that:
1. Supports multiple channels (Email, SMS, WhatsApp, Push)
2. Allows single or bulk communications
3. Provides advanced client filtering
4. Includes personalization with CRM variables
5. Integrates adviser signatures from settings
6. Supports scheduling and draft saving
7. Offers test mail functionality
