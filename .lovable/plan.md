

## Add More Clients for Birthdays and Top Accounts

### Overview

Currently, each jurisdiction has only 5 top accounts (1 per advisor) and 10 birthdays (2 per advisor). When filtering to fewer advisors, widgets appear sparse. This change will add more entries distributed across all advisors to ensure the widgets remain populated regardless of filter selection.

---

## Data Expansion

### Current vs. New Counts

| Widget | Current Count | New Count | Per Advisor |
|--------|---------------|-----------|-------------|
| **Top Accounts** | 5 | 15 | 3 per advisor |
| **Birthdays** | 10 | 20 | 4 per advisor |

This ensures that even when a single advisor is selected:
- Top 5 Accounts shows 3 entries
- Birthdays shows 4 entries (widget displays up to 6)

---

## Implementation

### File: `src/data/regionalData.ts`

#### South Africa (ZA) - Additional Entries

**Top Accounts (add 10 more, distributed evenly):**
| Investor | Value | Advisor |
|----------|-------|---------|
| Van Niekerk, Marthinus | R 26,500,000 | JB |
| Venter, Isabella | R 24,800,000 | JB |
| Joubert, Francois | R 23,100,000 | SM |
| Steyn, Chanelle | R 21,400,000 | SM |
| Le Roux, Werner | R 19,700,000 | PN |
| Marais, Annika | R 18,000,000 | PN |
| Pretorius, Johannes | R 16,300,000 | LV |
| Du Toit, Lizelle | R 14,600,000 | LV |
| Coetzee, Hendrik | R 12,900,000 | DG |
| Jacobs, Marlene | R 11,200,000 | DG |

**Birthdays (add 10 more, distributed evenly):**
| Name | Date | Age | Advisor |
|------|------|-----|---------|
| Petrus Jacobus Botha | 29 January | 55 | JB |
| Maria Susanna van Zyl | 29 January | 48 | JB |
| Hendrik Willem Venter | 30 January | 62 | SM |
| Anna Elizabeth Joubert | 30 January | 51 | SM |
| Gideon Francois Steyn | 31 January | 44 | PN |
| Catharina Maria le Roux | 31 January | 59 | PN |
| Barend Johannes Marais | 1 February | 67 | LV |
| Susanna Petronella du Toit | 1 February | 43 | LV |
| Willem Adriaan Coetzee | 2 February | 56 | DG |
| Johanna Cornelia Jacobs | 2 February | 38 | DG |

#### Australia (AU) - Additional Entries

**Top Accounts (add 10 more):**
Culturally appropriate Australian names (mix of Anglo, Irish, Greek, Italian, Asian backgrounds)

**Birthdays (add 10 more):**
Distributed evenly across JM, ST, MO, EA, TM

#### Canada (CA) - Additional Entries

**Top Accounts (add 10 more):**
Mix of French-Canadian, English-Canadian, and multicultural names

**Birthdays (add 10 more):**
Distributed evenly across PT, MB, JM, SG, RS

#### United Kingdom (GB) - Additional Entries

**Top Accounts (add 10 more):**
Traditional British names reflecting diverse UK population

**Birthdays (add 10 more):**
Distributed evenly across WS, EJ, TW, VB, JT

#### United States (US) - Additional Entries

**Top Accounts (add 10 more):**
Diverse American names (Anglo, Hispanic, Asian, African-American)

**Birthdays (add 10 more):**
Distributed evenly across MJ, JW, RB, MG, WD

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/regionalData.ts` | Add 10 additional top accounts and 10 additional birthdays to each of the 5 jurisdictions (ZA, AU, CA, GB, US) |

---

## Result

- Each advisor now has 3 top accounts assigned to them
- Each advisor now has 4 birthday entries assigned to them
- Selecting a single advisor displays meaningful data in all widgets
- All entries use culturally appropriate names for each jurisdiction
- Values for additional top accounts are scaled appropriately below existing entries

