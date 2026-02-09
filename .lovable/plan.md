
# Seed US Jurisdiction Emails for nico@advizorstack.com

## Overview
Create and run a backend function that generates realistic demo emails from US jurisdiction clients in the database, all linked to the `nico@advizorstack.com` user account. This will populate the Communication Hub with US-specific email content across all folders (Inbox, Task Pool, Sent, Draft, Queue, Failed, Archived).

## What You Will See
- Approximately 114 emails spread across all 7 email folders (15-18 per folder)
- Emails from/to your 120 US clients with US-specific financial topics (401(k), IRA, HSA, S&P 500, etc.)
- WhatsApp, SMS, and Push notification history for up to 10 US clients
- Email attachments (PDF documents) linked to relevant financial communications
- Communications log entries for the client communication history tab

## Technical Details

### 1. New Edge Function: `seed-us-communications`

A one-time function that:
- Looks up the `nico@advizorstack.com` user by email using the service role key
- Fetches all US jurisdiction clients (`country_of_issue = 'United States'`) belonging to that user
- Generates emails using the existing US-specific templates (subjects like "Your 401(k) Performance Review", "Form 1099 and W-2 Tax Documents for 2024", etc.)
- Creates email records with `user_id` set to the nico account
- Sets `from_address` to `nico@advizorstack.com` for outbound emails and client emails for inbound
- Generates WhatsApp, SMS, and Push conversations for a subset of US clients
- Creates email attachments (Portfolio Reports, Tax Certificates, 401k Statements, etc.)
- Populates the `communications` log table for client-level communication history
- Clears any existing communications for this user before seeding (idempotent)

### 2. Folder Distribution

| Folder | Count | Direction |
|--------|-------|-----------|
| Inbox | 18 | Inbound |
| Task Pool | 15 | Inbound |
| Sent | 18 | Outbound |
| Draft | 15 | Outbound |
| Queue | 15 | Outbound |
| Failed | 15 | Outbound |
| Archived | 18 | Mixed |

### 3. Config Update

Add the new function to `supabase/config.toml` with `verify_jwt = false` (since it uses service role key internally to look up the specific user).

### 4. Execution

After deploying the function, it will be called once to populate the data. The function is idempotent -- running it again will clear and re-seed the data.

### No UI Changes Required
The existing Communication Hub already displays emails filtered by jurisdiction. Once US emails are seeded for this user, they will appear automatically when logged in as `nico@advizorstack.com`.
