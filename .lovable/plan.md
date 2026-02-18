

## Update Companies Tab to Show Underlying Shares

### What changes

The Companies tab currently lists investment houses (Allan Gray, Investec, etc.). It needs to instead show the **underlying equities/shares** held across the client's portfolio -- stocks like Amazon, Apple, Microsoft, etc.

### Updates to `src/components/client-detail/portfolio/CompaniesTab.tsx`

1. **Replace the `COMPANIES` array** with a list of global equities:
   - Amazon, Apple, Microsoft, Alphabet, NVIDIA, Meta, Tesla, TSMC, Samsung, Nestle, ASML, Novo Nordisk, Johnson & Johnson, JPMorgan Chase, Visa, Mastercard, Broadcom, Berkshire Hathaway, UnitedHealth, Procter & Gamble

2. **Add ticker symbols and sectors** to each company for richer data:
   - e.g. `{ name: "Amazon", ticker: "AMZN", sector: "Technology" }`

3. **Update the table columns** to reflect share-level data:
   | Company | Ticker | Sector | Value | Weight | Trend | Change |
   - Remove "Products" column (not relevant for shares)
   - Add "Ticker" column (mono font, muted text)
   - Add "Sector" column (small badge style)
   - Keep Value, Weight, Sparkline, and Change columns as-is

4. **Update the card title** from "Companies" to "Underlying Companies"

5. **Data generation** stays the same (seeded random for deterministic values) -- just mapped to share names instead of investment houses

### File

| File | Action |
|------|--------|
| `src/components/client-detail/portfolio/CompaniesTab.tsx` | Edit -- replace investment houses with underlying equities, update columns |
