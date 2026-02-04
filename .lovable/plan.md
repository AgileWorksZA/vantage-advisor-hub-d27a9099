

# Email Setup & Enhanced Email Table Implementation

## Overview

This plan implements email setup functionality with Gmail SSO integration and updates the email table to match the reference design with client matching and clickable client links.

## Key Features

1. **Email Setup Dialog** - Accessible via button next to user email address
2. **Mail Provider Configuration** - Support for Gmail (SSO), Microsoft, and IMAP/POP3
3. **Fetch Mode Selection** - Pull to Inbox or collect from Task Pool folder
4. **Email Fetch Triggers** - On folder click, navigation, or refresh with spinning indicator
5. **Client Matching** - Match sender email against client database
6. **Multiple Clients Display** - Show all matching clients with "+ X more" overflow
7. **Clickable Client Names** - Link to client profile page

## Architecture

```text
Email.tsx
├── EmailSettingsSetupDialog (new)
│   ├── Provider selection (Gmail SSO, Microsoft, IMAP/POP3)
│   ├── Fetch mode selection (Inbox / Task Pool)
│   └── OAuth flow for Gmail/Microsoft
├── useEmailSettings hook (new)
│   ├── Load/save settings from admin_communication_settings
│   └── Manage OAuth tokens
├── Updated useEmails hook
│   ├── Match from_address against clients table
│   ├── Return matched client details
│   └── Support isFetching state for spinner
└── Updated email table
    ├── New date format (DD/MM/YYYY HH:MM AM/PM)
    ├── Unread emails in teal color
    └── Clickable client names with overflow handling
```

## Database Changes

**New table: `email_settings`** - Store user email configuration

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| provider | text | gmail, microsoft, imap |
| email_address | text | User's email address |
| fetch_mode | text | inbox or task_pool |
| oauth_token | text | Encrypted token (nullable) |
| settings | jsonb | Provider-specific config |
| is_active | boolean | Whether sync is enabled |
| last_sync_at | timestamp | Last successful sync |
| created_at | timestamp | Row creation time |
| updated_at | timestamp | Last update time |

**New junction table: `email_clients`** - Support multiple clients per email

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email_id | uuid | Reference to emails |
| client_id | uuid | Reference to clients |
| created_at | timestamp | Row creation time |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/email/EmailSetupDialog.tsx` | Email setup modal with provider selection and OAuth |
| `src/hooks/useEmailSettings.ts` | Manage email settings CRUD and OAuth flow |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Email.tsx` | Add setup button, spinning refresh icon, fetch triggers |
| `src/hooks/useEmails.ts` | Add client matching logic, return matched clients with IDs, isFetching state |

## Component Details

### EmailSetupDialog.tsx

```text
┌─────────────────────────────────────────────┐
│  Email Setup                              X │
├─────────────────────────────────────────────┤
│                                             │
│  Choose your email provider:                │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🔵 Gmail (Google SSO)               │    │
│  │    Sign in with your Google account │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 🔷 Microsoft 365 / Outlook          │    │
│  │    Sign in with Microsoft account   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ⚙️ IMAP/POP3 (Other providers)      │    │
│  │    Manual server configuration      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Fetch mode:                                │
│  ○ Pull emails into Inbox folder            │
│  ● Collect from Task Pool folder            │
│                                             │
├─────────────────────────────────────────────┤
│                    [Cancel]  [Connect]      │
└─────────────────────────────────────────────┘
```

### Email Table Updates (matching reference image)

**Visual Changes:**
- Unread emails: From/Subject in teal color (hsl(180,70%,45%))
- Date format: DD/MM/YYYY HH:MM AM/PM
- Client names formatted as: "Surname, I (FirstName)"
- Multiple clients: "First Client + X more client" (teal clickable)
- Each client name clickable to navigate to `/clients/{client-id}`

### Refresh Button with Spinner

```text
Current:  [↻] Refresh emails
Fetching: [⟳] Refresh emails  (spinning animation)
```

## Implementation Steps

### Step 1: Database Migration
Create `email_settings` and `email_clients` tables with RLS policies

### Step 2: Create useEmailSettings Hook
- Load email settings for current user
- Save settings to database
- Handle OAuth token storage
- Provide connection status

### Step 3: Create EmailSetupDialog Component
- Provider selection cards (Gmail, Microsoft, IMAP)
- Fetch mode radio buttons
- OAuth flow for Gmail/Microsoft using existing patterns
- Manual config form for IMAP/POP3

### Step 4: Update Email.tsx
- Replace static email display with Setup button
- Add setup dialog state management
- Implement spinning refresh icon
- Trigger fetch on folder click and navigation

### Step 5: Update useEmails Hook
- Add isFetching state separate from loading
- Match from_address against clients.email and clients.work_email
- Return array of matched client objects with IDs
- Support multiple client matches per email

### Step 6: Update Email Table Display
- Apply teal color to unread emails
- Format dates correctly
- Display client names with overflow handling
- Make client names clickable links

## Client Matching Logic

```text
For each email:
1. Extract from_address domain and local part
2. Query clients where:
   - email ILIKE '%' || from_address || '%'
   - OR work_email ILIKE '%' || from_address || '%'
3. Return all matching clients (can be 0, 1, or many)
4. Display format:
   - 0 matches: empty
   - 1 match: "Surname, I (FirstName)"
   - 2+ matches: "Surname, I (FirstName) + X more client"
```

## Expected Behavior

| Action | Result |
|--------|--------|
| Click Setup button | Opens EmailSetupDialog |
| Select Gmail | Initiates Google OAuth flow |
| Select fetch mode | Saves preference to database |
| Click folder (Task Pool, Inbox) | Triggers email fetch, shows spinner |
| Click "Message" in sidebar | Triggers email fetch |
| Click Refresh | Fetches new emails with spinning icon |
| Hover unread email | Row highlights, teal text visible |
| Click client name | Navigates to client detail page |
| Click "+ X more" | Shows popover with all client names |

## Technical Notes

1. **Gmail OAuth** - Uses existing OAuth pattern from Auth.tsx but with extended scopes for Gmail API
2. **Email Fetch** - Initially will be UI-ready; actual email fetching requires edge function (future enhancement)
3. **Client Matching** - Performed on frontend initially using loaded clients data
4. **RLS Policies** - All new tables will have user_id scoping with auth.uid() checks

