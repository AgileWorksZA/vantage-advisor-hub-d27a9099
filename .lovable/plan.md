

# Fix Header Row Alignment Across All Channels

## Problem Analysis

The channel tabs header row shifts position when switching between Email and WhatsApp/SMS/Push because:

**Email Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│ Email Sidebar (w-72)    │ Main Content Area                          │
│ ┌──────────────────────┐│ ┌────────────────────────────────────────┐ │
│ │ [Search emails...]   ││ │ [Tabs] [Date][Filter][⚙][↻]           │ │◄─ Tabs at top
│ │ [Compose]            ││ └────────────────────────────────────────┘ │
│ │ Folders...           ││ Email Table                                │
│ └──────────────────────┘│                                            │
└──────────────────────────────────────────────────────────────────────┘
```

**WhatsApp Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│ (No sidebar)            │ Main Content Area                          │
│                         │ ┌────────────────────────────────────────┐ │
│                         │ │ [Tabs] [Date][Filter][⚙][↻]           │ │◄─ Tabs at top
│                         │ └────────────────────────────────────────┘ │
│                         │ ┌────────────────┬───────────────────────┐ │
│                         │ │ [Search...]    │ Chat Panel            │ │◄─ Search below tabs
│                         │ │ ConversationList                       │ │
│                         │ └────────────────┴───────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

The tabs row is in the SAME position for both, but the **visual perception** differs because:
1. Email has a sidebar that starts with search (aligned with tabs row)
2. WhatsApp has no sidebar, so the ConversationList search appears BELOW the tabs row

## Solution

Move the channel tabs row and action buttons ABOVE the main flex container so they appear at a consistent position, with content (sidebar + main area OR chat interface) below.

**Target Layout (Both Channels):**
```
┌──────────────────────────────────────────────────────────────────────┐
│ Header Row (full width)                                              │
│ [Email][WhatsApp][SMS][Push]                    [Date][Filter][⚙][↻] │
├──────────────────────────────────────────────────────────────────────┤
│ Content Area (sidebar + main OR chat interface)                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Changes to `src/pages/Email.tsx`

### 1. Move Header Row Above Main Content

Restructure the layout so the channel tabs header is rendered BEFORE the `<main>` element that contains the sidebars and content:

```tsx
{/* Communication Content */}
{/* Header with Channel Tabs - OUTSIDE main, consistent position */}
<div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-background">
  {/* Left side: Channel tabs */}
  <CommunicationTypeSelector value={activeChannel} onChange={setActiveChannel} />

  {/* Right side: Date, Filter, Setup, Refresh */}
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" className="h-8">
      <Calendar className="w-4 h-4 mr-1" />
      Date selection
    </Button>
    <Button variant="outline" size="icon" className="h-8 w-8">
      <Filter className="w-4 h-4" />
    </Button>
    <Button 
      variant="outline" 
      size="icon" 
      className="h-8 w-8"
      onClick={() => setSetupDialogOpen(true)}
      title="Communication Setup"
    >
      <Settings className="w-4 h-4" />
    </Button>
    <Button 
      variant="outline" 
      size="icon" 
      className="h-8 w-8"
      onClick={() => triggerFetch()}
      disabled={isFetching}
      title="Refresh"
    >
      <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
    </Button>
  </div>
</div>

<main className="flex-1 flex overflow-hidden">
  {/* Sidebar and content areas */}
</main>
```

### 2. Remove Duplicate Header from Main Content Area

Delete the header row that's currently inside the main content area (lines 256-290).

## Implementation Summary

| Step | Description |
|------|-------------|
| 1 | Extract the channel tabs header row from inside `<main>` |
| 2 | Place it directly after `<AppHeader>` and before `<main>` |
| 3 | Remove the duplicate header section from the main content area |

This ensures the tabs row stays at a **fixed vertical position** regardless of which channel is selected, and the sidebar/content simply fills the space below.

