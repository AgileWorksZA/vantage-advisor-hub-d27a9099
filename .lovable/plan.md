

# Add Compose Button to WhatsApp, SMS, and Push Channels

## Overview

Add a "Compose" button to the `ConversationList` component so WhatsApp, SMS, and Push channels have the same compose functionality as the Email channel.

## Current vs Target Layout

**Current WhatsApp/SMS/Push Layout:**
```
┌──────────────────────┐
│ [Search...]          │
├──────────────────────┤
│ Archived          ▶ │
├──────────────────────┤
│ Conversations...     │
└──────────────────────┘
```

**Target Layout (matching Email):**
```
┌──────────────────────┐
│ [Search...]          │
├──────────────────────┤
│ [Compose]            │
├──────────────────────┤
│ Archived          ▶ │
├──────────────────────┤
│ Conversations...     │
└──────────────────────┘
```

## Changes Required

### File: `src/components/email/ConversationList.tsx`

**1. Add imports:**
```tsx
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
```

**2. Add navigate hook inside component:**
```tsx
const navigate = useNavigate();
```

**3. Add Compose button section after Search (between lines 59-60):**
```tsx
{/* Compose Button */}
<div className="p-3 border-b border-border">
  <Button 
    size="sm" 
    className="bg-[hsl(180,70%,45%)] hover:bg-[hsl(180,70%,40%)] text-white"
    onClick={() => navigate("/email/compose")}
  >
    <PenSquare className="w-4 h-4 mr-1" />
    Compose
  </Button>
</div>
```

## Implementation Summary

| Step | Change |
|------|--------|
| 1 | Add `PenSquare` to lucide-react imports |
| 2 | Add `Button` component import |
| 3 | Add `useNavigate` from react-router-dom |
| 4 | Add `navigate` hook inside component |
| 5 | Add Compose button section after Search input |

## Visual Result

All four channels (Email, WhatsApp, SMS, Push) will now have a consistent "Compose" button in the same relative position within their sidebars.

