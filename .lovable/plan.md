

## Add Animated Gradient Border "View All Opportunities" Button

### Overview
Add a button at the bottom of the Client Opportunities widget with text "View All Opportunities" and a continuously animated gradient border that creates a moving color effect around the button edges, matching the style shown in the reference image.

### Animation Approach
Use a CSS `@keyframes` animation that rotates a `conic-gradient` background on a pseudo-element wrapper. The button will have:
- A rounded pill shape
- A thin animated gradient border (violet to cyan to teal, rotating)
- White/card background interior
- Teal-colored text with a trend icon

### Changes

**File: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

- Add a "View All Opportunities" button after the table, inside `CardContent`
- The button navigates to `/ai-assistant` (the opportunities/AI page)
- Use a wrapper div with `overflow: hidden`, `border-radius`, and an animated `conic-gradient` background to create the rotating border effect
- Inner content has the card background color, creating the illusion of an animated border
- Add the `TrendingUp` icon from lucide-react before the text

**File: `src/index.css`**

- Add a `@keyframes spin-gradient` animation that rotates 360 degrees
- Add a `.animated-gradient-border` utility class with the conic-gradient background and rotation animation

### Technical Details

The animated border effect works by:
1. Outer wrapper has `padding: 1.5px`, `border-radius`, and an animated `conic-gradient` background
2. The conic-gradient uses violet, cyan, and teal colors rotating via CSS animation
3. Inner element has the same border-radius with card background, creating the thin animated border illusion
4. Animation duration ~3s, infinite loop, linear timing

| File | Action |
|------|--------|
| `src/index.css` | Edit - add spinning gradient keyframes and utility class |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Edit - add animated border button at bottom |
