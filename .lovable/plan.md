

## Replace Dot-Matrix Map with Image

### What changes
Replace the programmatic SVG dot-matrix world map with the uploaded dot-map image. This will use the actual image file instead of rendering thousands of SVG circles, giving pixel-perfect accuracy to the reference and better performance.

### Steps

1. **Copy the uploaded image** to `src/assets/world-dots-map.png`

2. **Rewrite `src/components/client-detail/WorldMapSVG.tsx`**
   - Replace the SVG circle rendering with a simple `<img>` tag
   - Import the image from `@/assets/world-dots-map.png`
   - Apply CSS opacity/filter for the light teal tint matching the current theme styling
   - Keep the same `className` prop interface so nothing breaks in the parent component
   - Use CSS `filter` or `opacity` to achieve the subtle, muted look (light mode: low opacity teal tint; dark mode: inverted/adjusted)

3. **No changes to `ClientDashboardTab.tsx`** -- the component interface stays identical, so markers, legend, and layout remain untouched

4. **`src/data/worldMapDots.ts` can be deleted** since it will no longer be needed (the dot coordinates are replaced by the image)

### Technical details
- The image is black dots on white/transparent background, so in light mode we apply low opacity (~0.15-0.2) to get the subtle teal-gray look; in dark mode we use CSS `invert` + low opacity
- Component keeps `preserveAspectRatio` behavior via `object-fit: contain` on the img
- Performance improvement: rendering 1 image vs ~2,500 SVG circle elements

