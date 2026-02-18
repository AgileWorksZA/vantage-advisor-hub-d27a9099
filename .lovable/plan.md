

## Change World Map to Dot-Based Style

### What changes
Replace the solid-filled SVG continent paths in `WorldMapSVG.tsx` with a dot-matrix representation -- a grid of small circles where dots only appear within continent boundaries. This creates a modern, stylized dotted map look.

### Technical approach

**File: `src/components/client-detail/WorldMapSVG.tsx`**

Replace all the `<path>` elements with a programmatic dot grid approach:

1. Define a set of dot coordinates (x, y) that approximate each continent's shape on the 1000x500 viewBox grid
2. Render each position as a small `<circle>` element (radius ~2.5px) with spacing of ~12-15px between dots
3. Use the same color classes for theming: `fill-[hsl(180,30%,85%)]` / `dark:fill-[hsl(180,20%,25%)]`

The dot coordinates will be pre-computed arrays covering:
- North America (Canada, USA, Mexico, Central America)
- South America
- Europe (including UK, Scandinavia, Iberian peninsula)
- Africa (including Madagascar)
- Asia (Russia, Middle East, India, China, Southeast Asia, Japan)
- Australia and New Zealand
- Greenland

Each continent will be represented by roughly 30-80 dots depending on size, totaling around 300-400 dots for the full map. The dots will be spaced on a regular grid but only placed where land exists, creating a recognizable dotted silhouette of each continent.

**No changes needed to `ClientDashboardTab.tsx`** -- the component interface stays the same (just `className` prop), so the markers, legend, and all other functionality remain untouched.

