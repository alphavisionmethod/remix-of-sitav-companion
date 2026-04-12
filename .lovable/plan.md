

# Mega Plan: Advanced Window Apps, Dashboard Layouts, and Wow Boardroom

## Overview

This plan covers three major areas: (1) new advanced window apps for the OS shell, (2) layout and sidebar improvements across Business OS, Finance/Money OS, and Concierge OS dashboards, and (3) a dramatic redesign of the Advisor/Boardroom experience.

---

## Part 1: New Advanced Window Apps

Currently the OS has: Terminal, Notes, Calendar, Weather, Settings, System Monitor, Finder. Here are the apps to add:

### 1A. Music Player (`com.nova.music`)
- Waveform/spectrum visualizer using canvas (NovaContext)
- Album art with dominant-color extraction for adaptive UI
- Playlist sidebar, shuffle/repeat, scrubber with time display
- Mini-player mode (small floating bar) vs full window
- Spatial audio panning tied to window position

### 1B. Calculator (`com.nova.calc`)
- Scientific mode with graphing capability (canvas-drawn function plots)
- History tape sidebar showing past calculations
- Unit/currency converter tab
- Programmer mode (hex/bin/oct)
- Glass material + spring-animated button presses

### 1C. Photo Viewer (`com.nova.photos`)
- Grid gallery with masonry layout
- Full-screen lightbox with gesture zoom/pan
- EXIF metadata inspector panel
- Basic filters (brightness, contrast, saturation) with live preview
- Slideshow mode with crossfade transitions

### 1D. Code Editor (`com.nova.code`)
- Syntax-highlighted editor (Monaco-lite or custom highlighter)
- File tree sidebar, tab bar for multiple files
- Minimap, line numbers, bracket matching
- Theme selector (matches OS dark/light)
- Integrated terminal pane at bottom

### 1E. Mail Client (`com.nova.mail`)
- Three-column layout: folders, message list, reading pane
- Compose modal with rich text formatting
- Inbox categories (Primary, Social, Updates)
- Unread badges synced to dock
- Thread view with collapsible messages

### 1F. Maps (`com.nova.maps`)
- Canvas-rendered stylized map with pan/zoom
- Search bar with location autocomplete (mock data)
- Points of interest with info cards
- Directions panel with route visualization
- Day/night map style toggle

---

## Part 2: Dashboard & Sidebar Layout Improvements

### 2A. Global Sidebar Enhancement (`AppSidebar.tsx`)
- Add collapsible sub-navigation: when you enter Business, Money, or Concierge, the sidebar expands to show domain-specific sub-routes (e.g., Business > Pipeline, Invoices, Revenue)
- Add a "Recents" section showing last 5 visited pages
- Mini-mode: show only colored domain icons with tooltip labels
- Active route indicator: animated pill that slides between items (not just highlight)
- Bottom section: user avatar with status dot, quick mode toggle

### 2B. Business OS Dashboard Layouts
- **BusinessOverview**: Convert from single-column to a responsive bento grid (2x3 on desktop) with draggable card reordering
- **Pipeline/Deals pages**: Add a kanban board view toggle alongside the existing list
- **Revenue pages**: Split-pane with left metrics panel + right chart area, collapsible filters rail
- **Customer Health**: Add a heatmap grid view (customers as cells, color = health score)
- Consistent page shell: every business page uses `DomainHeader` with the blue Business accent

### 2C. Finance/Money OS Dashboard Layouts
- **MoneyOverview**: Redesign as a "financial cockpit" — hero cash position card at top, then 3-column grid (Obligations, Receivables, Savings)
- **Bills/Subscriptions**: Timeline view showing upcoming due dates on a horizontal calendar strip
- **Net Worth**: Large area chart hero + breakdown cards below
- **Budget Envelopes**: Visual envelope cards with fill-level indicators (like fuel gauges)
- Add a persistent "Financial Health Score" bar at the top of all money pages

### 2D. Concierge OS Dashboard Layouts
- **ConciergeOverview**: Family command center with member avatars across top, today's agenda timeline, task assignments
- **Calendar**: Week view with drag-to-create events, color-coded by family member
- **Household Tasks**: Kanban with assignee avatars and priority flags
- Add a "Family Pulse" summary strip shared across all concierge pages

---

## Part 3: The WOW Boardroom & Advisor Experience

### 3A. Boardroom Redesign — "The War Room"
- **Entry ceremony**: Full-screen animated transition when entering boardroom — lights dim, domain accent ring pulses, "Boardroom session starting..." text with typewriter effect
- **Presentation mode**: Auto-advancing slides with cinematic transitions (fade, slide, zoom) — each section becomes a full-screen slide
- **3D confidence visualization**: Radial chart showing all advisor confidence levels as an interactive radar/spider chart
- **Live disagreement theater**: When advisors disagree, show a split-screen "debate" view with advisor avatars on opposite sides, their positions animated in, audience-poll style confidence bars
- **Decision moment**: When approving, dramatic confirmation animation — ripple effect, seal stamp, receipt generation with satisfying sound
- **Session timeline**: Horizontal scrollable timeline at bottom showing boardroom progression, clickable to jump to any section
- **Ambient audio**: Subtle background hum that changes based on boardroom sentiment (calm for positive, tension for risks)

### 3B. Advisor Council Workspace Redesign
- **Advisor cards as 3D tiles**: Each advisor shown as a floating card with depth/parallax on hover, domain-colored glow, live status pulse
- **Council formation view**: Circular arrangement of advisor avatars (like a round table) with connection lines showing active handoffs
- **Live advisor activity feed**: Real-time scrolling feed of what each advisor is doing/thinking
- **Advisor deep-dive**: Click an advisor to expand into full-screen workspace showing their reasoning chain, evidence sources, confidence history chart, and recent recommendations
- **Model budget as fuel gauge**: Visual fuel tank showing remaining AI budget with projected exhaustion time

### 3C. Boardroom Widgets (New Primitives)
- **VotingCard**: Multi-advisor vote visualization with stacked bar
- **EvidenceChain**: Connected node graph showing how a conclusion was reached
- **ScenarioFork**: Side-by-side scenario comparison with delta highlights
- **DecisionSeal**: Animated approval stamp with receipt hash
- **SentimentPulse**: Real-time sentiment indicator (green/amber/red wave)

---

## Technical Approach

- All new window apps follow Nova SDK patterns: manifest in catalog, lifecycle hooks via `useNovaApp`, AppLayout with title bar
- Dashboard layouts use existing `SitaCard`, `GlassCard`, `KPITile` primitives with new grid compositions
- Boardroom animations use Framer Motion orchestration (staggerChildren, AnimatePresence)
- Canvas visualizations (music waveform, maps, confidence radar) use NovaContext from the SDK
- All apps registered in `catalog.ts`, wired in `ShellLayout.tsx` and `DesktopDock.tsx`

## Implementation Order (suggested)

1. Sidebar enhancement (foundation for all dashboards)
2. Business + Money + Concierge layout upgrades (high visible impact)
3. Boardroom war room redesign (the WOW factor)
4. New window apps (Music, Calculator, Photos, Code Editor, Mail, Maps)
5. Advisor council workspace redesign
6. New boardroom primitives (VotingCard, EvidenceChain, etc.)

---

## File Impact Summary

| Area | Files Created | Files Modified |
|------|--------------|----------------|
| Window Apps | 6 new components | catalog.ts, ShellLayout, DesktopDock, DesktopSurface |
| Sidebar | 1 refactored | AppSidebar.tsx |
| Business layouts | 3-5 modified | BusinessOverview, CustomerHealth, etc. |
| Money layouts | 3-5 modified | MoneyOverview, BillsWorkspace, etc. |
| Concierge layouts | 2-3 modified | ConciergeOverview, HouseholdTasks |
| Boardroom | 2-3 new + 2 modified | Boardroom.tsx, AdvisorWorkspace, new primitives |

