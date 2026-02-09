

## Fix Calendar Event Text Color for Light Mode

### Problem
Event pills/blocks across all calendar views use hardcoded `text-white`, making text invisible against the lighter event background colors in light mode (as shown in the screenshot).

### Changes

**1. Month View events (`src/pages/Calendar.tsx`, line 678)**
- Change `text-white` to `text-gray-900 dark:text-white` on event buttons

**2. Week View events (`src/components/calendar/WeekView.tsx`)**
- Line 196: timed events - change `text-white` to `text-gray-900 dark:text-white`
- Line 209: event time subtitle - change `text-white/80` to `text-gray-700 dark:text-white/80`
- Line 228: all-day events - change `text-white` to `text-gray-900 dark:text-white`

**3. Day View events (`src/components/calendar/DayView.tsx`)**
- Line 146: all-day events - change `text-white` to `text-gray-900 dark:text-white`
- Line 216: timed events - change `text-white` to `text-gray-900 dark:text-white`
- Line 228: event time - change `text-white/80` to `text-gray-700 dark:text-white/80`
- Line 232: location - change `text-white/70` to `text-gray-600 dark:text-white/70`
- Line 235: client name - change `text-white/70` to `text-gray-600 dark:text-white/70`

This ensures dark readable text on light mode backgrounds while preserving white text in dark mode.

