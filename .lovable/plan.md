

## Remove Inline Opportunity Tags from Email Screens

The keyword-detected opportunity tags (Insights, Tax Loss, Growth, etc.) appear in three places. Since these are already surfaced in the AI Insights panel, remove them from:

### Changes

| File | What to remove |
|------|---------------|
| `src/pages/EmailView.tsx` (lines 490–505) | Remove the entire "Inline Opportunity Tags" block (the `Insights` label row with `OpportunityTagBadge` badges) |
| `src/pages/Email.tsx` (lines 435–443) | Remove the `OpportunityTagBadge` tags rendered inline next to email subjects in the list rows |
| `src/components/email/ConversationList.tsx` (lines 116–122) | Remove the opportunity tag badges shown below WhatsApp/chat message previews |

Unused imports (`OpportunityTagBadge`, `detectOpportunityTypes`) will also be cleaned up in each file.

