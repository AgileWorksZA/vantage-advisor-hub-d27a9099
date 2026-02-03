
# Add Missing Client Info and Contact Details for All Demo Clients

## Overview

Enhance the `seed-demo-clients` edge function to populate comprehensive client information including contact details, identification, employment, and demographic data for all ~160 demo clients across all 5 jurisdictions (ZA, AU, CA, GB, US).

---

## File to Modify

| File | Changes |
|------|---------|
| `supabase/functions/seed-demo-clients/index.ts` | Add comprehensive client data to all demo client records |

---

## Fields to Populate

For each demo client, we'll add:

| Category | Fields |
|----------|--------|
| **Contact** | `email`, `cell_number`, `work_number`, `home_number`, `preferred_contact` |
| **Identity** | `title`, `gender`, `id_number`, `initials` |
| **Employment** | `occupation`, `employer`, `industry` |
| **Tax/Legal** | `tax_number`, `country_of_issue`, `tax_resident_country` |

---

## Data Generation Strategy

### Email Format
- Personal: `firstname.surname@gmail.com` (or regional variants like `@yahoo.com`, `@outlook.com`)
- Work: `firstname.surname@company.com`

### Phone Numbers (by jurisdiction)
| Region | Format |
|--------|--------|
| ZA | `+27 xx xxx xxxx` |
| AU | `+61 x xxxx xxxx` |
| CA | `+1 xxx xxx xxxx` |
| GB | `+44 xxxx xxxxxx` |
| US | `+1 xxx xxx xxxx` |

### ID Numbers
- **ZA**: 13-digit RSA ID format (YYMMDD SSSS C A Z)
- **AU**: No national ID (use Medicare number format or leave null)
- **CA**: No national ID (leave null)
- **GB**: National Insurance number format (AB 12 34 56 C)
- **US**: No SSN for privacy (leave null)

### Titles
Based on gender and age: Mr, Mrs, Ms, Miss, Dr (for professional occupations)

### Occupations & Employers
Realistic industry-appropriate roles based on advisor specialty and regional context:
- Financial sector, healthcare, legal, business owners, retirees

---

## Implementation Details

### 1. Expand Demo Client Data Structure

Each client object will include:

```typescript
{
  first_name: 'Marthinus',
  surname: 'Van Niekerk',
  advisor: 'Johan Botha',
  nationality: 'South African',
  language: 'Afrikaans',
  client_type: 'individual',
  age: 55,
  // NEW FIELDS:
  gender: 'Male',
  title: 'Mr',
  email: 'marthinus.vanniekerk@gmail.com',
  cell_number: '+27 82 123 4567',
  work_number: '+27 11 555 1234',
  occupation: 'Civil Engineer',
  employer: 'Murray & Roberts',
  industry: 'Construction',
  id_number: '6908155012081',
  tax_number: '1234567890',
  country_of_issue: 'South Africa',
  preferred_contact: 'Cell',
}
```

### 2. Update Client Insert Mapping

Modify the insert mapping in lines 298-309 to include all new fields:

```typescript
.map(client => ({
  user_id: user.id,
  first_name: client.first_name,
  surname: client.surname,
  profile_state: 'Active',
  profile_type: 'Client',
  client_type: client.client_type,
  nationality: client.nationality,
  language: client.language,
  advisor: client.advisor,
  date_of_birth: calculateDOB(client.age),
  // NEW FIELDS:
  gender: client.gender,
  title: client.title,
  email: client.email,
  cell_number: client.cell_number,
  work_number: client.work_number,
  home_number: client.home_number,
  occupation: client.occupation,
  employer: client.employer,
  industry: client.industry,
  id_number: client.id_number,
  tax_number: client.tax_number,
  country_of_issue: client.country_of_issue,
  tax_resident_country: client.tax_resident_country,
  preferred_contact: client.preferred_contact,
  initials: client.initials,
}))
```

### 3. Create Update Function for Existing Clients

Since many demo clients may already exist, add logic to update existing records with the new data:

```typescript
// Update existing clients that are missing contact info
const existingClientsToUpdate = existingClients?.filter(ec => {
  const demoClient = demoClients.find(dc => 
    dc.first_name.toLowerCase() === ec.first_name?.toLowerCase() &&
    dc.surname.toLowerCase() === ec.surname?.toLowerCase()
  );
  return demoClient && !ec.email; // Update if missing email
});

if (existingClientsToUpdate?.length > 0) {
  for (const ec of existingClientsToUpdate) {
    const demoData = demoClients.find(dc => /* match */);
    await supabase.from('clients').update({ ...newFields }).eq('id', ec.id);
  }
}
```

---

## Sample Data (First 10 ZA Clients)

| Name | Email | Cell | Occupation | Employer |
|------|-------|------|------------|----------|
| Marthinus Van Niekerk | m.vanniekerk@gmail.com | +27 82 123 4567 | Civil Engineer | Murray & Roberts |
| Isabella Venter | isabella.venter@outlook.com | +27 83 234 5678 | Marketing Director | Woolworths |
| Andre Thomas Coetzer | andre.coetzer@gmail.com | +27 84 345 6789 | Investment Banker | FirstRand |
| Esther Amanda Nieman | esther.nieman@vodamail.co.za | +27 82 456 7890 | Retired Teacher | - |
| Petrus Jacobus Botha | pj.botha@telkomsa.net | +27 83 567 8901 | Farmer | Self-employed |
| Maria Susanna van Zyl | maria.vanzyl@gmail.com | +27 84 678 9012 | Retired Nurse | - |
| Jean De Villiers | jean.devilliers@discovery.co.za | +27 82 789 0123 | Medical Doctor | Netcare |
| Francois Joubert | francois.joubert@gmail.com | +27 83 890 1234 | Architect | Self-employed |
| Chanelle Steyn | chanelle.steyn@icloud.com | +27 84 901 2345 | HR Manager | Discovery |
| Elsie Sophia Lourens | elsie.lourens@mweb.co.za | +27 82 012 3456 | Retired | - |

---

## Deployment Steps

1. Update the edge function with comprehensive client data
2. Deploy the function automatically
3. Call the function to update existing demo clients with new contact info
4. Verify updates in the Clients list

---

## Result

- All ~160 demo clients will have complete profiles with:
  - Email addresses (personal format)
  - Cell phone numbers (region-appropriate format)
  - Work phone numbers (where applicable)
  - Gender and title
  - Occupation and employer
  - ID numbers (for ZA and GB only)
  - Tax numbers
  - Preferred contact method
- Client detail views will show populated contact and personal information
- Client list will display complete data in phone/email columns
