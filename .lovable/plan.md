

## Make World Map More Realistic

### What changes
Replace the current simplified/cartoonish SVG continent shapes with more accurate, detailed SVG paths that closely resemble the actual shapes of the continents. The current paths are very rough approximations -- the new paths will use proper geographic outlines.

### Technical changes in `src/components/client-detail/ClientDashboardTab.tsx`

**Replace SVG continent paths (lines 450-473)**

Swap the current hand-drawn polygon paths with well-known simplified-but-accurate Natural Earth-style continent outlines. The new paths will include:

- **North America** -- recognizable coastline including Alaska, Great Lakes region, Florida, Mexico
- **South America** -- proper shape with Brazil bulge, Patagonia
- **Europe** -- Iberian peninsula, Scandinavian shape, Mediterranean coast
- **Africa** -- Horn of Africa, Madagascar, proper west coast bulge
- **Asia** -- Accurate Siberia, Middle East, Indian subcontinent, Southeast Asian peninsula
- **Australia** -- Proper shape with indented north coast
- **Japan, Indonesia, UK** -- More recognizable island shapes
- **Greenland, New Zealand** -- Added for completeness

All paths keep the same fill classes (`fill-[hsl(180,30%,85%)] dark:fill-[hsl(180,20%,25%)]`) and the viewBox remains `0 0 1000 500` (equirectangular-style projection).

The region marker positions may need minor adjustments to align with the more accurate continent positions, but the overall layout, legend, and interactivity remain unchanged.

