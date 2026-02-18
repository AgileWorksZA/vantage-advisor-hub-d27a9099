

## Precision Dot Map Overhaul to Match Reference Images

### Problem
The current dot map has ~1,200 dots at 8px spacing with radius 1.6. The reference images show a much denser, more precise layout with:
- Tighter spacing (~6px between dots)
- Smaller dot radius (~1.2)
- Roughly 2,500-3,000 dots total
- Much more detailed coastlines and continent shapes

### What changes

**File: `src/data/worldMapDots.ts`** -- Complete rewrite of all coordinate arrays

The dot grid will be rewritten on a 6px spacing (coordinates at multiples of 6) to match the reference density. Key improvements per region:

- **North America**: More detailed Great Lakes indent, proper Hudson Bay gap, narrower Florida peninsula, detailed Pacific Northwest coast, Alaska as clear peninsula, detailed Mexico with Baja California as separate strip, thin Central America isthmus
- **South America**: Proper northeast bulge (Natal), concave western coast (Peru/Chile), wide Amazon basin, narrow Patagonia tail, clear gap at Drake Passage
- **Europe**: Detailed Scandinavian peninsula (Norway/Sweden/Finland), separate British Isles with Ireland, Iberian peninsula with proper shape, Italian boot, Greek peninsula, detailed Baltic coastline
- **Africa**: Proper West African bulge (Guinea), Horn of Africa protruding east, concave Gulf of Guinea coast, tapering Southern Africa, separate Madagascar island
- **Asia**: Dense Russia spanning full width, Arabian Peninsula as distinct block, Indian subcontinent triangle tapering to point, detailed Southeast Asian peninsula, Indonesian archipelago as dot chains, Japan as curved archipelago, Korean peninsula, Philippines as vertical chain, Sri Lanka dot
- **Oceania**: Australia with proper Gulf of Carpentaria indent on north coast, Tasmania separate, New Zealand as two-island cluster
- **Greenland**: Dense elongated oval

**File: `src/components/client-detail/WorldMapSVG.tsx`** -- Update radius

- Reduce `R` from 1.6 to 1.2 for tighter, more refined appearance matching the reference
- No other changes needed -- component structure stays identical

### Technical details
- Grid spacing: 6px (all coordinates multiples of 6)
- Dot radius: 1.2
- Total dots: ~2,500-3,000
- ViewBox remains 0 0 1000 500
- Same theme-aware fill classes
- No changes to ClientDashboardTab.tsx -- markers and legend untouched

