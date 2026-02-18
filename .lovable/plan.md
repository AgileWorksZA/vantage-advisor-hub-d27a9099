

## Replace World-Dots Map with Inline SVG World Map

### What changes
- Remove the `world-dots.png` background image and replace with an inline SVG rendering simplified continent shapes in a solid muted green/teal fill
- Remove percentage labels from inside the map area
- Add a clean region breakdown row below the map showing each region name with its percentage
- Keep the colored dot markers on the map for each region

### Technical changes in `src/components/client-detail/ClientDashboardTab.tsx`

**1. Replace the map container (lines 448-470)**

Remove the `<img>` tag and replace with an inline SVG containing simplified continent path outlines (Africa, North America, South America, Europe, Asia, Australia) filled with a muted teal color. The SVG will use a standard viewBox and well-known simplified continent paths.

The colored dot markers remain overlaid on the SVG at the same coordinates, but remove the inline `%` labels from the dots (keep only the hover tooltip).

**2. Add region percentage row below the map**

After the map container, add a flex row showing each region as a small colored dot + name + percentage, e.g.:

```
[dot] South Africa 65%   [dot] North America 5%   [dot] Europe 4%   ...
```

This replaces the per-marker percentage labels with a cleaner legend-style layout beneath the map.

**3. Styling**
- SVG continents: `fill` with `hsl(180, 30%, 85%)` (light mode) / `hsl(180, 20%, 25%)` (dark mode), no stroke
- Map container height stays at 180px
- Region row: `flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px]`
- Each region item: small colored circle (6px) + name + value

