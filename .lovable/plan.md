

## Replace Geographic Diversification Chart with World Map Widget

### What changes
The current pie chart (Domestic vs International) in the Geographic Diversification widget will be replaced with a visual world map using the existing `public/images/world-dots.png` as a background, with colored circular markers on key regions showing allocation percentages -- similar to the reference image provided.

### Technical changes

**1. Expand the `geoDiversification` data (lines 187-194)**

Instead of just "Domestic" and "International", generate region-level data with approximate map coordinates (as percentages of the image). For example:
- South Africa, North America, Europe, Asia Pacific, etc.
- Each with a percentage value and x/y position on the map image

**2. Replace ECharts pie chart with a map visual (lines 439-458)**

Remove the `EChartsWrapper` usage and the `geoOption` memo. Replace with:
- A container with `relative` positioning and the `world-dots.png` as a background image (using `object-fit: contain`)
- Colored circular markers (`absolute` positioned) at each region's coordinates
- Tooltips or small labels showing region name and percentage on hover
- The largest allocation gets a pulsing/highlighted marker effect
- Muted green color scheme matching the reference image

**3. Remove unused code**
- Remove the `geoOption` useMemo block (lines 308-316)

**4. Styling**
- Map container: `relative`, fixed height (~180px), `overflow-hidden`
- Markers: small colored circles (8-16px based on allocation weight), `absolute` positioned
- Light mode: green-tinted regions; Dark mode: adjusted opacity
- "View diversification" link remains at the bottom
