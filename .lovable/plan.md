

## Redesign Dot Map to Match Reference Layout

### What changes
The current dot map has ~400 dots at ~14px spacing with radius 2.2, which looks sparse and blocky. The reference image shows a much denser, tighter grid creating highly detailed, immediately recognizable continent shapes. The map needs to be completely rewritten with:

- **Smaller dots**: Reduce radius from 2.2 to ~1.6
- **Tighter grid**: Reduce spacing from ~14px to ~8px between dots
- **Many more dots**: Increase from ~400 to ~1200-1500 dots total
- **Better continent shapes**: Follow the reference image's layout more closely -- dense fill with clean edges that trace real coastlines

### File changed

**`src/components/client-detail/WorldMapSVG.tsx`** -- Full rewrite of all coordinate arrays

Key adjustments per continent to match the reference:
- **North America**: Dense fill covering Alaska, Canada (wide east-west), USA with Great Lakes indent, Florida peninsula, Mexico tapering down, Central America narrow strip
- **South America**: Wide Brazil bulge at top, tapering to narrow Patagonia at bottom
- **Europe**: Small but detailed -- UK/Ireland separate, Scandinavia finger, Iberian/Italian/Greek peninsulas, filled Central Europe
- **Africa**: Large dense block, widest at equator, Horn of Africa bump on east, Madagascar island
- **Asia**: Massive -- wide Russia across top, Middle East, Indian subcontinent triangle, dense China/SE Asia, Japan archipelago as separate dots
- **Australia**: Compact filled shape, New Zealand as small separate cluster
- **Greenland**: Dense oval shape

Technical details:
- Reduce `R` from 2.2 to 1.6
- Grid spacing ~8px (coordinates at multiples of 8)
- All dots use same theme-aware fill class
- No changes to `ClientDashboardTab.tsx` -- component interface stays identical

