

## Fix WhatsApp Conversations Not Displaying

### Root Causes

**1. Jurisdiction code mismatch**
The `useDirectMessages` hook filters by `country_of_issue` using region codes like `"ZA"`, but the database stores full country names like `"South Africa"`. This means the query `eq("country_of_issue", "ZA")` returns zero clients, so no conversations appear.

**2. Data only seeded for 2 users**
WhatsApp messages only exist for user IDs `demo@vantage.co.za` and `nico@advizorstack.com`. If the logged-in user is different (e.g., `andre@vantage.co.za`), they see nothing.

### Fix

#### 1. Add region-to-country mapping in `useDirectMessages.ts`

Add the same mapping that already exists in `Email.tsx`:

```
ZA -> "South Africa"
AU -> "Australia"  
CA -> "Canada"
GB -> "United Kingdom"
US -> "United States"
```

Convert the `jurisdiction` parameter from a region code to the full country name before querying:
```ts
const regionToCountry: Record<string, string> = {
  ZA: "South Africa", AU: "Australia", CA: "Canada",
  GB: "United Kingdom", US: "United States",
};
// ...
if (jurisdiction) {
  const countryName = regionToCountry[jurisdiction] || jurisdiction;
  clientQuery = clientQuery.eq("country_of_issue", countryName);
}
```

#### 2. Apply the same mapping in `ConversationList.tsx`

The Contacts tab filters clients by `c.countryOfIssue !== jurisdiction` -- this also needs mapping from code to full name.

#### 3. Re-seed WhatsApp data for all users

Update and re-run the `seed-whatsapp-enhanced` edge function to:
- Seed WhatsApp conversations for ALL users in the system (not just 2)
- Cover all 5 jurisdictions (ZA, AU, CA, GB, US)
- Include a mix of text messages, image attachments, and polls

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useDirectMessages.ts` | Map region code to full country name before filtering |
| `src/components/email/ConversationList.tsx` | Map region code to full country name in Contacts tab filter |
| `supabase/functions/seed-whatsapp-enhanced/index.ts` | Seed data for all users across all jurisdictions |

