

# Seed Dashboard Clients to Database

## Problem

The Dashboard displays client data from `src/data/regionalData.ts` (birthdays, top accounts, tasks, etc.), but when users click on a client name, the system cannot find them in the database. The database currently has 50 South African clients, but they don't match the names shown on the dashboard.

## Solution

Create a database seeding migration that adds all clients from the regional data file for all 5 jurisdictions (ZA, AU, CA, GB, US). This includes:
- Clients from the **topAccounts** arrays
- Clients from the **birthdays** arrays  
- Unique clients from the **tasks** arrays

---

## Client Extraction Summary

### South Africa (ZA) - 5 Advisors

| Advisor | Initials | Clients from Dashboard |
|---------|----------|------------------------|
| Johan Botha | JB | NG Kerk Sinode Oos-Kaapland, Marthinus Van Niekerk, Isabella Venter, Andre Thomas Coetzer, Esther Amanda Nieman, Petrus Jacobus Botha, Maria Susanna van Zyl |
| Sarah Mostert | SM | Jean De Villiers, Francois Joubert, Chanelle Steyn, Elsie Sophia Lourens, Melia Nocwaka Malgas, Hendrik Willem Venter, Anna Elizabeth Joubert |
| Pieter Naudé | PN | Rudolph Louw, Werner Le Roux, Annika Marais, Samuel de Jager, Denise Thiart, Gideon Francois Steyn, Catharina Maria le Roux |
| Linda van Wyk | LV | Daan Van Der Sijde, Johannes Pretorius, Lizelle Du Toit, Elana Wasmuth, Elizabeth Saunders, Barend Johannes Marais, Susanna Petronella du Toit |
| David Greenberg | DG | Philippus Koon, Hendrik Coetzee, Marlene Jacobs, Angeline Loraine Mostert, Zonwabele Harry Molefe, Willem Adriaan Coetzee, Johanna Cornelia Jacobs |

### Australia (AU) - 5 Advisors

| Advisor | Initials | Sample Clients |
|---------|----------|----------------|
| James Mitchell | JM | Melbourne Grammar School Foundation, Konstantinos Papadopoulos, David Nguyen, William James Mitchell, Charlotte Grace Wilson, Mai Linh Nguyen |
| Sarah Thompson | ST | Michael O'Connor, Giuseppe Romano, William Chen, Sarah Elizabeth Thompson, Thomas Edward Murphy, Sophia Chen |
| Michael O'Brien | MO | Sarah Thompson, Brendan Kelly, Rajesh Patel, James Robert O'Brien, Olivia Jane Campbell, Priya Patel |
| Emily Anderson | EA | David Williams, Helena Stavros, Andrew Morrison, Emily Rose Anderson, Henry William Scott |
| Thomas Murphy | TM | Jennifer Brown, Benjamin Lee, Catherine Walsh, Michael Patrick Kelly, Sophie Anne Martin |

### Canada (CA) - 5 Advisors

| Advisor | Initials | Sample Clients |
|---------|----------|----------------|
| Pierre Tremblay | PT | Toronto General Hospital Foundation, Jean-François Lavoie, Émilie Bergeron, Pierre Tremblay, Marie Tremblay |
| Marie Bouchard | MB | David Wong, Jennifer Kim, Sophie Bouchard, Jacques Bouchard |
| James MacDonald | JM | Alexander Campbell, Kathleen O'Brien, Marie-Claire Roy, Angus MacDonald |
| Sophie Gagnon | SG | Arun Patel, Nathalie Leblanc, Jean-Luc Gagnon, François Gagnon |
| Robert Singh | RS | Harpreet Singh, Jacques Dumont, Robert Singh, Priya Singh |

### United Kingdom (GB) - 5 Advisors

| Advisor | Initials | Sample Clients |
|---------|----------|----------------|
| William Smith | WS | The Royal Foundation, Richard Thompson, Amir Khan, William Arthur Smith, Charlotte Emma Davies |
| Elizabeth Jones | EJ | William Smith, Meera Patel, Patrick O'Sullivan, Elizabeth Mary Jones, George Henry Wilson |
| Thomas Williams | TW | Elizabeth Jones, Ciara Murphy, Chidi Okonkwo, Thomas Edward Williams, Amelia Rose Evans |
| Victoria Brown | VB | Thomas Williams, Simran Kaur, Fiona Campbell, Victoria Anne Brown, Oliver Charles Thomas |
| James Taylor | JT | James Taylor, Marta Kowalski, Fatima Ahmed, James Robert Taylor, Isabella Grace Roberts |

### United States (US) - 5 Advisors

| Advisor | Initials | Sample Clients |
|---------|----------|----------------|
| Michael Johnson | MJ | St. Mary's Hospital Foundation, Wei Chen, Marcus Washington, Michael David Johnson, Patricia Ann Martinez |
| Jennifer Williams | JW | Robert Johnson, Carlos Hernandez, Jennifer Kim, Jennifer Marie Williams, James Michael Wilson |
| Robert Brown | RB | Patricia Williams, Vikram Patel, Sean O'Connor, Robert James Brown, Linda Sue Anderson |
| Maria Garcia | MG | Miguel Garcia, Angela Washington, Kenji Nakamura, Maria Elena Garcia, David Lee Thompson |
| William Davis | WD | Isabella Martinez, Sofia Rodriguez, Jamal Thompson, William Thomas Davis, Susan Marie Jackson |

---

## Implementation Approach

### Database Migration

Create an SQL migration that:

1. **Extracts unique clients** from all regional data sources
2. **Parses names** into first_name and surname fields  
3. **Calculates date of birth** from the age data (approximate based on current date)
4. **Sets appropriate fields**:
   - `advisor` - Full advisor name matching the initials
   - `profile_type` - "Client" for all (as they appear on dashboard)
   - `profile_state` - "Active"
   - `nationality` - Based on region (South African, Australian, Canadian, British, American)
   - `language` - Default for each region

### Estimated Client Count

| Region | From Birthdays | From Top Accounts | From Tasks (Unique) | Estimated Total |
|--------|----------------|-------------------|---------------------|-----------------|
| ZA | 20 | 15 | ~15 | ~35 unique |
| AU | 20 | 15 | ~15 | ~35 unique |
| CA | 20 | 15 | ~15 | ~35 unique |
| GB | 20 | 15 | ~15 | ~35 unique |
| US | 20 | 15 | ~15 | ~35 unique |
| **Total** | 100 | 75 | ~75 | **~150-175 unique clients** |

---

## Migration SQL Structure

The migration will:

1. Create a temporary function to parse names and generate consistent data
2. Insert clients with proper regional attributes
3. Handle organizations (e.g., "NG Kerk Sinode Oos-Kaapland") as Business client types
4. Use `ON CONFLICT DO NOTHING` to avoid duplicates if run multiple times
5. Associate clients with a service user ID (or the authenticated user when applicable)

### Key Fields Per Client

```sql
INSERT INTO clients (
  user_id,
  first_name,
  surname,
  profile_state,
  profile_type,
  client_type,
  nationality,
  language,
  advisor,
  date_of_birth,
  created_at,
  updated_at
) VALUES (
  -- User ID (service account or current user)
  -- Parsed first name
  -- Parsed surname
  'Active',
  'Client',
  'individual' or 'business',
  -- Region-specific nationality
  -- Region-specific language
  -- Full advisor name
  -- Calculated DOB from age
  now(), now()
);
```

---

## User ID Consideration

Since RLS requires `user_id` to match `auth.uid()`, these clients will need to be:

**Option A**: Created with a shared service account user_id (for demo purposes)
**Option B**: Created at runtime when a user logs in (if no clients exist)
**Option C**: Use a database trigger that assigns clients to the logged-in user on first access

For this implementation, we'll use **Option A** with a placeholder user_id that can be updated later, or we can create an edge function that seeds the data for each new user.

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/migrations/XXXXXX_seed_regional_clients.sql` | Database migration with all client inserts |

---

## Sample Insert (South Africa)

```sql
-- Johan Botha's clients (JB)
INSERT INTO clients (user_id, first_name, surname, profile_state, profile_type, client_type, nationality, language, advisor, date_of_birth)
VALUES 
  ('{user_id}', 'Andre Thomas', 'Coetzer', 'Active', 'Client', 'individual', 'South African', 'English', 'Johan Botha', CURRENT_DATE - INTERVAL '42 years'),
  ('{user_id}', 'Esther Amanda', 'Nieman', 'Active', 'Client', 'individual', 'South African', 'Afrikaans', 'Johan Botha', CURRENT_DATE - INTERVAL '74 years'),
  ('{user_id}', 'Marthinus', 'Van Niekerk', 'Active', 'Client', 'individual', 'South African', 'Afrikaans', 'Johan Botha', CURRENT_DATE - INTERVAL '55 years'),
  -- Organization as Business type
  ('{user_id}', 'NG Kerk Sinode', 'Oos-Kaapland', 'Active', 'Client', 'business', 'South African', 'Afrikaans', 'Johan Botha', NULL);
```

---

## Alternative: Edge Function Approach

If we want clients to be user-specific (each user gets their own copy), we can create an edge function:

1. **`seed-user-clients`** edge function that:
   - Checks if user has any clients
   - If not, inserts all regional demo clients for that user
   - Called on first login or dashboard load

This approach respects RLS policies and ensures each user has their own data to work with.

---

## Recommended Approach

Given the RLS policies require `auth.uid() = user_id`, the best approach is:

1. Create an **edge function** `seed-demo-clients` that:
   - Takes the authenticated user's ID
   - Inserts all demo clients with that user_id
   - Only runs if user has < 10 clients (to avoid duplicate seeding)

2. Call this edge function:
   - From the Dashboard page on initial load
   - Or from a "Load Demo Data" button in the UI

This ensures:
- Each user has their own clients
- RLS policies work correctly
- Users can modify/delete demo clients
- No shared data conflicts

---

## Implementation Files

| Type | File | Description |
|------|------|-------------|
| Edge Function | `supabase/functions/seed-demo-clients/index.ts` | Seeds demo clients for authenticated user |
| Frontend Hook | Modify `src/pages/Dashboard.tsx` | Trigger seeding on first load |

---

## Technical Notes

- All client names parsed from regional data file
- Ages converted to approximate DOB
- Organizations detected by keywords (Foundation, Hospital, Church, etc.)
- Advisor names matched to initials from advisor arrays
- Nationality and language set per region
- Profile type set to "Client" (these are existing clients shown on dashboard)

