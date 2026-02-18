

## Make World Map Super Realistic

### What changes
The current hand-drawn SVG continent paths (lines 450-485) are rough approximations that don't look like real continents. They will be replaced with high-fidelity SVG paths derived from actual Natural Earth geographic data, projected into the existing `0 0 1000 500` viewBox using an equirectangular projection.

### Technical changes in `src/components/client-detail/ClientDashboardTab.tsx`

**1. Extract the world map SVG into a separate component file**

Create `src/components/client-detail/WorldMapSVG.tsx` containing a dedicated component with highly detailed continent paths. This keeps the dashboard file clean and makes the map reusable. The paths will be sourced from simplified Natural Earth 110m data converted to SVG coordinates, covering:

- All major continents with accurate coastlines (Great Lakes, Florida, Baja California, Scandinavian fjords, Horn of Africa, Indian subcontinent, etc.)
- Major islands: UK, Ireland, Iceland, Japan, Philippines, Indonesia, Sri Lanka, Madagascar, New Zealand, Taiwan, Cuba, etc.
- Greenland with realistic shape
- Proper Mediterranean coastline detail

The component will accept the same fill classes and render a pure SVG.

**2. Update the map container (lines 448-506)**

- Import and use the new `WorldMapSVG` component in place of the inline SVG block
- Adjust region marker coordinates if needed to align with the accurate continent positions
- All existing marker logic, hover tooltips, pulse animation, and legend remain unchanged

**3. Marker coordinate adjustments (lines 193-198)**

Fine-tune the x/y percentages for each region marker to land precisely on the correct geographic location on the new accurate map:
- South Africa: centered on Johannesburg area
- North America: centered on central US
- Europe: centered on Western Europe
- Asia Pacific: centered on East/Southeast Asia
- UK: centered on Britain

### What stays the same
- The legend below the map
- The "View diversification" link
- Marker sizes, colors, hover tooltips, and pulse animation
- The widget card structure and drag handle
- All data calculations

