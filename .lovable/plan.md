
# AI Chat Button -- Global Deployment with Per-Page Prompts and User Toggle

## Overview

Four changes to make the AI assistant chat button available across all app pages, with hover-only pulsation, reduced click area, rebranded text, a user toggle in the settings menu, and page-specific prompt suggestions.

## Changes

### 1. Refactor AIOrb to hover-only pulsation and smaller click target

**File: `src/components/ai-assistant/AIOrb.tsx`**

- Remove the always-on `animate-ping`, `animate-pulse`, and `animate-spin-slow` animations from the outer rings
- Add those animations back but only within a `group-hover:` context so they appear on mouse hover
- Move the `onClick` handler from the outer 24x24 container to just the inner core orb (`inset-4` div, the two inner circles)
- Remove `cursor-pointer` from the outer container; add it to the core orb only
- The "group" class stays on the outer div so hover detection still works for the glow rings

### 2. Rebrand ChatPanel header

**File: `src/components/ai-assistant/ChatPanel.tsx`**

- Change line 75 from `"Powered by Lovable AI"` to `"Powered by Vantage AI"`
- Accept a new `currentPage` prop to determine which suggested prompts to show
- Replace the static `suggestedPrompts` array with a `getPromptsForPage(page)` function

**Page-specific prompts:**

| Page | Prompts |
|------|---------|
| Dashboard | "Summarise my practice performance", "Which clients need attention this week?", "Show AUM trends", "Any upcoming birthdays?" |
| Clients | "Find clients with incomplete FICA", "Which clients haven't been reviewed in 12 months?", "Show high-value clients without protection", "Identify clients at risk of leaving" |
| Portfolio | "Show portfolios drifting from mandate", "Which clients are over-exposed to equities?", "Identify tax-loss harvesting opportunities", "Compare fund performance" |
| Email / Messages | "Draft a follow-up email for my last meeting", "Summarise unread messages", "Find emails about policy renewals", "Create a birthday greeting template" |
| Calendar | "What meetings do I have this week?", "Schedule follow-ups for overdue reviews", "Find gaps in my calendar for client calls", "Prepare agenda for my next meeting" |
| Tasks | "Show overdue tasks", "Which tasks are due this week?", "Prioritise my task list", "Find tasks without assigned clients" |
| Insights | "What are the top growth opportunities?", "Show revenue trends", "Identify cross-sell potential", "Compare advisor performance" |
| Practice | "Show team utilisation", "Which advisors have the most clients?", "Identify training needs", "Review practice compliance status" |
| Command Center | "What are today's priority nudges?", "Show compliance alerts", "Which clients need immediate attention?", "Summarise portfolio drift alerts" |
| AI Assistant | (current prompts kept as-is: "Show me upsell opportunities", etc.) |
| Default/Other | "How can I grow my practice?", "Show me client insights", "What tasks need attention?", "Help me find opportunities" |

### 3. Create a global AI Chat wrapper component

**New file: `src/components/ai-assistant/GlobalAIChat.tsx`**

This component wraps the AIOrb and ChatPanel together for use on any page. It:
- Manages chat open/close state, messages, and typing state internally
- Accepts a `currentPage` prop (string) for page-specific prompts
- Renders the fixed-position orb at bottom-right (z-50)
- Renders the ChatPanel
- Handles message sending with a generic response engine (similar to the one in AIAssistant.tsx but simplified)
- Reads an `aiChatEnabled` flag from localStorage (default: true) and renders nothing if disabled

### 4. Add "AI Assistant" toggle to UserMenu

**File: `src/components/dashboard/UserMenu.tsx`**

- Add a new toggle row between the "Dark Mode" toggle and "Sign Out" button
- Uses a Sparkles icon with label "AI Assistant"
- Reads/writes `aiChatEnabled` from localStorage
- Dispatches a custom event (`ai-chat-toggle`) so GlobalAIChat components across pages react immediately without page reload

### 5. Deploy GlobalAIChat on all app pages

**Files to modify** (add the GlobalAIChat component just before the closing wrapper div):

- `src/pages/Dashboard.tsx` -- currentPage="dashboard"
- `src/pages/Clients.tsx` -- currentPage="clients"
- `src/pages/ClientDetail.tsx` -- currentPage="clients"
- `src/pages/Portfolio.tsx` -- currentPage="portfolio"
- `src/pages/Email.tsx` -- currentPage="email"
- `src/pages/EmailView.tsx` -- currentPage="email"
- `src/pages/ComposeEmail.tsx` -- currentPage="email"
- `src/pages/Calendar.tsx` -- currentPage="calendar"
- `src/pages/Tasks.tsx` -- currentPage="tasks"
- `src/pages/Insights.tsx` -- currentPage="insights"
- `src/pages/Practice.tsx` -- currentPage="practice"
- `src/pages/CommandCenter.tsx` -- currentPage="command-center"
- `src/pages/Administration.tsx` -- currentPage="administration"

The **AI Assistant page** (`src/pages/AIAssistant.tsx`) keeps its existing orb and chat implementation unchanged since it has deeper integration with opportunity data.

### 6. Adapt ChatPanel styling for light/dark mode

Currently ChatPanel uses hardcoded dark-mode styles (`text-white`, `bg-white/10`, etc.) since it was only used on the AI Assistant page which forces dark mode. For global use on light-mode pages:

- Use theme-aware classes: `bg-background`, `text-foreground`, `border-border` for structural elements
- Keep the gradient accent on user message bubbles
- Use `bg-muted` for assistant messages instead of `bg-white/10`
- Wrap the panel in a dark-themed container using a glassmorphism approach with `bg-slate-900/95 backdrop-blur-xl` so the chat panel always appears dark regardless of page theme -- this keeps it visually consistent and avoids the complexity of full light/dark adaptations

## Technical Details

**LocalStorage key:** `vantage-ai-chat-enabled` (default: `"true"`)

**Custom event for cross-component sync:**
```typescript
// In UserMenu when toggling:
window.dispatchEvent(new CustomEvent('ai-chat-toggle', { detail: { enabled } }));

// In GlobalAIChat listening:
useEffect(() => {
  const handler = (e: CustomEvent) => setEnabled(e.detail.enabled);
  window.addEventListener('ai-chat-toggle', handler);
  return () => window.removeEventListener('ai-chat-toggle', handler);
}, []);
```

**AIOrb click target change:**
```tsx
// Outer div: no onClick, keeps group for hover
<div className="relative w-24 h-24 group">
  {/* Glow rings - animate only on hover */}
  <div className="absolute inset-0 rounded-full ... opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
  
  {/* Core orb - this is the click target */}
  <div className="absolute inset-4 rounded-full cursor-pointer ..." onClick={onClick}>
    ...
  </div>
</div>
```

## Files Summary

| File | Action |
|------|--------|
| `src/components/ai-assistant/AIOrb.tsx` | Modify -- hover-only animation, restricted click area |
| `src/components/ai-assistant/ChatPanel.tsx` | Modify -- rebrand text, accept currentPage prop, page-specific prompts |
| `src/components/ai-assistant/GlobalAIChat.tsx` | Create -- wrapper component for global deployment |
| `src/components/dashboard/UserMenu.tsx` | Modify -- add AI Assistant toggle |
| `src/pages/Dashboard.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Clients.tsx` | Modify -- add GlobalAIChat |
| `src/pages/ClientDetail.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Portfolio.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Email.tsx` | Modify -- add GlobalAIChat |
| `src/pages/EmailView.tsx` | Modify -- add GlobalAIChat |
| `src/pages/ComposeEmail.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Calendar.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Tasks.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Insights.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Practice.tsx` | Modify -- add GlobalAIChat |
| `src/pages/CommandCenter.tsx` | Modify -- add GlobalAIChat |
| `src/pages/Administration.tsx` | Modify -- add GlobalAIChat |
