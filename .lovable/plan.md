
# Multi-Channel Communication Data & Email Viewer Implementation

## Issues Identified

### 1. Direct Messages Not Visible
The seeded data was created for user_id `fa9f27f6-b772-4edb-b95f-5331c7636e2d`, but the current logged-in user has a different ID. RLS policies filter messages to the authenticated user only.

**Solution**: Update the edge function to seed data for the currently authenticated user (from the request's auth token).

### 2. No Email Detail View
Currently, clicking an email row does nothing. Need to create:
- An `EmailViewDialog` component to display email content
- Support for viewing HTML body with proper styling
- Reply functionality (opens compose with pre-filled data)
- Previous mail trail display for threaded conversations

### 3. No Attachment System
The `has_attachments` flag exists but there's no:
- `email_attachments` table to store attachment metadata
- Sample documents (PDFs) to attach
- Preview/download functionality

## Architecture

```text
Email System Enhancement
├── Database Changes
│   ├── email_attachments table (new)
│   └── direct_message_attachments table (new, for media in chats)
├── Sample Documents (public/downloads/)
│   ├── Portfolio_Report_Q4_2024.pdf (placeholder content)
│   ├── Tax_Certificate_2024.pdf
│   ├── FICA_Documents.pdf
│   ├── Financial_Plan_2025.pdf
│   └── Policy_Schedule.pdf
├── New Components
│   ├── EmailViewDialog.tsx - Email detail viewer
│   └── AttachmentPreview.tsx - Attachment list with download/preview
├── Updated Edge Function
│   └── seed-demo-communications - Use authenticated user + create attachments
└── Email.tsx Updates
    └── Email row click → Open EmailViewDialog
```

## Database Schema Changes

### New Table: `email_attachments`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email_id | uuid | FK to emails |
| user_id | uuid | Owner |
| file_name | text | Display name (e.g., "Portfolio_Report.pdf") |
| file_path | text | Path in storage or public folder |
| file_size | integer | Size in bytes |
| content_type | text | MIME type (application/pdf, image/png) |
| created_at | timestamp | Record creation |

### New Table: `direct_message_attachments`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| message_id | uuid | FK to direct_messages |
| user_id | uuid | Owner |
| file_name | text | Display name |
| file_path | text | Storage path |
| file_size | integer | Size in bytes |
| content_type | text | MIME type |
| created_at | timestamp | Record creation |

## Sample Documents

Create placeholder PDF files in `public/downloads/` folder:

| File | Content Description |
|------|---------------------|
| `Portfolio_Report_Q4_2024.pdf` | Quarterly performance summary with graphs |
| `Tax_Certificate_2024.pdf` | IT3(b) Tax certificate |
| `FICA_Documents.pdf` | Client onboarding FICA bundle |
| `Financial_Plan_2025.pdf` | Comprehensive financial plan |
| `Policy_Schedule.pdf` | Life insurance policy schedule |
| `Statement_Jan_2025.pdf` | Monthly investment statement |

For demo purposes, these will be simple HTML-to-PDF style documents rendered as static files.

## EmailViewDialog Component

### Layout
```text
┌─────────────────────────────────────────────────────────────────┐
│  [←]  Email Details                                  [Reply] [X] │
├─────────────────────────────────────────────────────────────────┤
│  From: client@email.com                                          │
│  To: adviser@vantage.co                                          │
│  Date: 04/02/2025 14:30 PM                                      │
│  Subject: RE: Your Q4 2024 Portfolio Performance Summary        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Dear Johan,                                                      │
│                                                                   │
│  Thank you for sending this through. I'm pleased with the       │
│  performance. Can we schedule a call next week to discuss...    │
│                                                                   │
│  Regards,                                                         │
│  Thabo                                                           │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  📎 Attachments (2)                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ 📄 Portfolio.pdf     │  │ 📄 Tax_Cert.pdf      │             │
│  │    245 KB  [↓]       │  │    89 KB  [↓]        │             │
│  └──────────────────────┘  └──────────────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  ▼ Previous Messages                                             │
│  ─────────────────────────────────────────────────────────────  │
│  On 03/02/2025, Johan wrote:                                     │
│  > Please find attached your quarterly portfolio...              │
│  > Key Highlights:                                               │
│  > • Portfolio Value: R2,456,789 (+4.2%)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Features
- Full HTML email body rendering (sanitized with DOMPurify)
- Attachment list with file icons, sizes, and download buttons
- Previous mail trail detection (look for emails with same subject prefix)
- Reply button pre-fills compose with:
  - "RE:" prefix on subject
  - Original sender as recipient
  - Quoted original message in body
- Mark as read on open

## Updated Seed Function

The `seed-demo-communications` edge function will be updated to:

1. **Get authenticated user from request** instead of hardcoding
2. **Create email_attachments records** linking to sample files
3. **Create direct_message_attachments** for some WhatsApp messages
4. **Set `media_url`** field on direct_messages that have attachments

### Attachment Distribution

| Email Subject Contains | Attachments |
|------------------------|-------------|
| "Portfolio Performance" | Portfolio_Report_Q4_2024.pdf |
| "Tax Certificate" | Tax_Certificate_2024.pdf |
| "FICA Documents" | FICA_Documents.pdf |
| "Financial Plan" | Financial_Plan_2025.pdf |
| "Policy" | Policy_Schedule.pdf |
| "Statement" | Statement_Jan_2025.pdf |

### WhatsApp Attachments
- Portfolio summary PDFs sent in conversations
- Proof of address images (simulated)

## Email.tsx Changes

### Current (line 310-340)
```tsx
<tr key={email.id} className={cn(...)}>
  ...table cells...
</tr>
```

### Updated
```tsx
<tr
  key={email.id}
  onClick={() => handleEmailClick(email)}
  className={cn(..., "cursor-pointer")}
>
  ...table cells...
</tr>

{/* Add dialog */}
<EmailViewDialog
  open={selectedEmailOpen}
  onOpenChange={setSelectedEmailOpen}
  email={selectedEmail}
  onReply={handleReply}
/>
```

## New Hooks

### useEmailDetail
Fetch single email with full body and attachments:
```tsx
const { email, attachments, loading, relatedEmails } = useEmailDetail(emailId);
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/email/EmailViewDialog.tsx` | Email detail viewer modal |
| `src/components/email/AttachmentList.tsx` | Display attachments with download |
| `src/hooks/useEmailDetail.ts` | Fetch single email + attachments |
| `public/downloads/Portfolio_Report_Q4_2024.pdf` | Sample attachment |
| `public/downloads/Tax_Certificate_2024.pdf` | Sample attachment |
| `public/downloads/FICA_Documents.pdf` | Sample attachment |
| `public/downloads/Financial_Plan_2025.pdf` | Sample attachment |
| `public/downloads/Policy_Schedule.pdf` | Sample attachment |
| `public/downloads/Statement_Jan_2025.pdf` | Sample attachment |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Email.tsx` | Add click handler, dialog state, EmailViewDialog |
| `src/hooks/useEmails.ts` | Add getEmailById method returning full email |
| `supabase/functions/seed-demo-communications/index.ts` | Use auth user, create attachments |

## Implementation Order

1. **Database migration** - Create email_attachments and direct_message_attachments tables
2. **Sample PDFs** - Create placeholder PDF documents
3. **Update seed function** - Auth user detection + attachment seeding
4. **EmailViewDialog** - Build the email viewer component
5. **Email.tsx updates** - Make rows clickable, add dialog
6. **Test end-to-end** - Verify emails display with attachments

## Technical Notes

- PDF files will be simple single-page documents with basic content
- The seed function will be called with the user's auth token to properly associate data
- Email threading uses subject matching (same subject with "RE:" prefix)
- DOMPurify already installed for HTML sanitization
- Reply flow navigates to /email/compose with query params for pre-fill
