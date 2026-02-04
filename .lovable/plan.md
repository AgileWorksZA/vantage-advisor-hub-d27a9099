

# Seed Demo Communications Data

## Overview

Create an edge function to populate the `emails`, `direct_messages`, and `communications` tables with realistic financial adviser-client communications. The data will use existing clients from the database and include multi-message conversations with replies, attachments, and typical financial services topics.

## Tables to Populate

| Table | Purpose | Channels |
|-------|---------|----------|
| `emails` | Email inbox/sent items | Email (with attachments flag) |
| `direct_messages` | Chat conversations | WhatsApp, SMS, Push |
| `communications` | Communication log | All channels |

## Database Schema Summary

**emails table:**
- `id`, `user_id`, `client_id`, `folder` (inbox/sent/drafts/archive)
- `direction`, `from_address`, `to_addresses` (jsonb), `cc_addresses`
- `subject`, `body_preview`, `body_html`, `has_attachments`
- `sent_at`, `received_at`, `is_read`, `status`, `external_id`

**direct_messages table:**
- `id`, `user_id`, `client_id`, `channel` (whatsapp/sms/push)
- `direction` (inbound/outbound), `content`, `media_url`
- `status` (sent/delivered/read), `sent_at`

**communications table:**
- `id`, `user_id`, `client_id`, `channel` (Email/SMS/Phone/WhatsApp/Push/Webinar/Office Event)
- `direction`, `from_identifier`, `to_identifier`, `subject`, `content`
- `sent_at`, `status`

## Communication Content Templates

### Email Subjects & Threads (Financial Adviser Context)

| Category | Subject Examples |
|----------|------------------|
| Portfolio Updates | "Your Q4 2024 Portfolio Performance Summary", "Monthly Investment Update - January 2025" |
| Document Requests | "Updated FICA Documents Required", "Tax Certificate for 2024 Tax Year" |
| Annual Reviews | "Reminder: Annual Financial Review Meeting", "Action Required: Review your investment goals" |
| Policy Changes | "Important: Changes to your retirement annuity", "Confirmation: Premium adjustment processed" |
| Claims | "Your claim reference #CL2024-7892 status update", "Documents received - claim in progress" |
| General | "Thank you for your recent meeting", "Welcome to Vantage Financial Services" |
| Client Replies | "RE: Questions about my investment", "RE: Urgent - Please call me" |

### WhatsApp/SMS Conversation Examples

**Portfolio Query Thread:**
```text
Client: Hi, I saw the market dropped yesterday. Should I be worried about my portfolio?
Adviser: Good morning Mrs Van Niekerk! No need to worry - these fluctuations are normal. Your portfolio is well-diversified. Would you like me to send you a quick summary?
Client: Yes please, that would help put my mind at ease
Adviser: [Attachment: Portfolio_Summary_Jan2025.pdf] Here's your current position. As you can see, your long-term performance remains solid at 12.3% p.a.
Client: Thank you so much! That's reassuring 👍
```

**Document Request Thread:**
```text
Adviser: Good day Mr Botha. This is a friendly reminder that your FICA documents expire next month. Could you please send updated proof of address?
Client: Thanks for the reminder. I'll get that to you this week.
Client: [Attachment: Utility_Bill_Jan2025.pdf] Here's my latest municipal account
Adviser: Received, thank you! I'll update your records. You're all set until 2027.
```

**Meeting Reminder:**
```text
Adviser: Hi Chanelle! Just confirming our meeting tomorrow at 10:00 for your annual review. I'll have your updated financial plan ready.
Client: Perfect, see you then! Can we also discuss offshore investments?
Adviser: Absolutely! I'll prepare some options for you. See you tomorrow!
```

### Push Notification Examples

| Type | Message |
|------|---------|
| Market Alert | "Market update: JSE All Share up 2.3% today. Your portfolio value increased by R12,450." |
| Document Ready | "Your tax certificate is ready to download in your client portal." |
| Meeting Reminder | "Reminder: Annual review meeting tomorrow at 14:00 with Johan Botha." |
| Payment Confirmation | "Premium payment of R3,500 received. Thank you!" |
| Birthday | "Happy Birthday from the Vantage team! 🎂" |

## Edge Function Design

### File: `supabase/functions/seed-demo-communications/index.ts`

**Function Structure:**
```text
seed-demo-communications/
├── Fetch existing clients (5-10 clients)
├── Generate Emails
│   ├── 15-20 email threads per client
│   ├── Mix of inbox (inbound) and sent (outbound)
│   ├── Varying is_read status
│   ├── Some with has_attachments = true
│   └── Realistic sent_at dates (past 90 days)
├── Generate Direct Messages
│   ├── WhatsApp: 3-5 conversations per client (5-15 messages each)
│   ├── SMS: 2-3 short exchanges per client (2-5 messages each)
│   └── Push: 5-8 notifications per client
└── Generate Communications Log
    └── Mirror of above for communication history
```

**Data Generation Logic:**

1. **Fetch Clients**: Query 10 clients from database with email addresses
2. **Generate Email Threads**: 
   - Create 3-4 email threads per client (initial + 2-3 replies)
   - Thread subjects: Portfolio updates, document requests, meeting confirmations
   - Some unread, some with attachments
   - Dates spread over last 60 days
3. **Generate WhatsApp Conversations**:
   - 3-5 back-and-forth exchanges per client
   - Realistic message patterns (greetings, queries, confirmations)
   - Status progression: sent → delivered → read
4. **Generate SMS Messages**:
   - Shorter, more urgent messages
   - Meeting reminders, payment confirmations
5. **Generate Push Notifications**:
   - System-generated alerts
   - Market updates, document notifications

## Sample Email HTML Body

```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <p>Dear Mrs Van Niekerk,</p>
  
  <p>Please find attached your quarterly portfolio performance summary for Q4 2024.</p>
  
  <p><strong>Key Highlights:</strong></p>
  <ul>
    <li>Portfolio Value: R2,456,789 (+4.2% this quarter)</li>
    <li>Year-to-date Return: 12.3%</li>
    <li>Asset Allocation: On target</li>
  </ul>
  
  <p>I'd be happy to schedule a call to discuss these results in more detail.</p>
  
  <p>Kind regards,<br>
  <strong>Johan Botha</strong><br>
  Financial Adviser | Vantage Financial Services<br>
  Tel: +27 21 555 1234</p>
</div>
```

## Implementation Details

### Date Distribution

```text
Timeline (last 60 days):
├── Week 1-2 (recent): 40% of messages - mostly read
├── Week 3-4: 30% of messages - mixed read/unread
└── Week 5-8 (older): 30% of messages - all read
```

### Message Status Distribution

| Channel | Status Distribution |
|---------|---------------------|
| Email | 70% read, 30% unread |
| WhatsApp | 60% read, 30% delivered, 10% sent |
| SMS | 70% delivered, 30% sent |
| Push | 80% read, 20% delivered |

## Files to Create

| File | Description |
|------|-------------|
| `supabase/functions/seed-demo-communications/index.ts` | Edge function with all seeding logic |

## Execution Flow

1. Create the edge function with comprehensive demo data
2. Deploy the function
3. Call the function to populate data for the authenticated user

## Sample Data Volume

| Channel | Count per Client | Total (10 clients) |
|---------|------------------|-------------------|
| Emails (inbox) | 8-12 | ~100 |
| Emails (sent) | 5-8 | ~65 |
| WhatsApp messages | 20-40 | ~300 |
| SMS messages | 5-10 | ~75 |
| Push notifications | 5-8 | ~65 |
| **Total** | | **~605 records** |

## Attachment Types Represented

| Email Subject Contains | Implied Attachment |
|------------------------|-------------------|
| "Tax Certificate" | PDF - Tax Certificate |
| "Portfolio Performance" | PDF - Portfolio Report |
| "Updated Documents" | PDF - FICA Documents |
| "Financial Plan" | PDF - Financial Plan |
| "Policy Schedule" | PDF - Policy Document |
| "Statement" | PDF - Statement |

## Technical Notes

- Edge function follows existing patterns from `seed-demo-tasks` and `seed-demo-clients`
- Uses service role key for database access
- Clears existing demo data before seeding to prevent duplicates
- All records scoped to authenticated user's ID
- Dates use realistic South African timezone considerations

