

# SITA OS — Full Visual Design System & WOW-Level Implementation Plan

## Current State Assessment

The codebase has strong foundations but several critical gaps prevent it from reaching the "world-class OS" bar:

**What exists and works well:**
- DomainAppShell with 5 domains (business, finance, concierge, files, trust)
- Focus Dock with sections, magnification, drag reorder, app launcher
- Ambient background system with mood orbs
- SystemMenuBar, PageTransition, BoardroomEntryCeremony
- Basic motion primitives (AppLaunchTransition, ListStagger, SkeletonReveal)
- Basic card system (SitaCard) and empty states

**Critical gaps the prompt demands:**

| Gap | Severity |
|-----|----------|
| No card family system (hero, action, queue, proof, comparison, timeline) | High |
| No 4-surface material hierarchy inside apps | High |
| No domain-specific typography/atmosphere differentiation | High |
| No premium loading/skeleton system per domain | Medium |
| No side panel / drawer system with layered depth | High |
| No badge grammar (trust, freshness, urgency, domain, execution) | High |
| No domain-paced motion (Business=sharp, Finance=calm, Concierge=soft) | High |
| No window focus/unfocus visual differentiation in shell | Medium |
| Desktop states (idle, active, degraded, locked) not visually distinct | Medium |
| ~50+ module pages still use flat layouts, no depth | High |
| No cinematic boardroom entry per domain | Medium |

---

## Implementation Plan (6 Workstreams)

### Workstream 1: Design Token Foundation Layer

**Create `src/lib/design-system/sita-design-tokens.ts`** (~200 lines)

The single source of truth for the entire visual system:

- **4 Surface Levels**: `surface0` (workspace bg), `surface1` (content), `surface2` (elevated cards/panels), `surface3` (focused overlays/drawers) — each with light/dark HSL values
- **Domain Atmosphere Tokens**: Per-domain overrides for Business (sharper, higher contrast, faster motion), Finance (calmer, precise, steadier), Concierge (softer, warmer, lighter), Files (quiet, neutral), Trust (serious, amber-accented)
- **Typography Scale**: 12 roles — `os-title`, `app-title`, `page-title`, `section-title`, `pane-title`, `card-title`, `metric-emphasis`, `micro-label`, `trust-annotation`, `timeline-meta`, `command-text`, `system-mono`
- **Motion Pacing**: Domain-keyed spring configs (Business: stiffness 300/damping 22, Finance: 180/28, Concierge: 140/24)
- **Badge Grammar**: Token definitions for trust, proof, freshness, mode, urgency, domain, execution-state badges

### Workstream 2: Premium Card Family System

**Create `src/components/sita/cards/` directory** with 9 card variants (~400 lines total):

| Card | Purpose | Visual Signature |
|------|---------|-----------------|
| `HeroCard` | Top-of-page summary with large metric | Full-width, gradient accent top edge, large display number |
| `SummaryCard` | Compact KPI cluster | Tight grid, tabular nums, subtle trend arrows |
| `ActionCard` | Prepared action with approve/dismiss | Left accent bar (domain color), action buttons row |
| `QueueCard` | Ranked list of items needing attention | Numbered items, urgency dots, revenue weight |
| `ProofCard` | Execution evidence with verification | Mono hash, verification badges, expandable chain |
| `StatusCard` | System/service/connection health | Traffic-light dot, freshness timestamp, confidence bar |
| `AdvisorCard` | Advisor insight with rationale | Avatar gradient, insight text, confidence score, domain tint |
| `ComparisonCard` | Before/after or scenario A vs B | Split layout, delta highlights, recommendation badge |
| `TimelineCard` | Event sequence with annotations | Vertical timeline rail, event dots, expandable detail |

Each card uses Surface Level 2 by default, with domain-aware accent colors and the motion pacing from its parent domain.

**Barrel export** at `src/components/sita/cards/index.ts`.

### Workstream 3: Side Panel / Drawer System + Surface Hierarchy

**Create `src/components/sita/surfaces/AppSurface.tsx`** (~80 lines)
- Wrapper that applies surface level (0-3) via CSS custom properties
- Each level increases opacity, border contrast, and elevation
- Domain-aware: Concierge surface2 uses warmer tones, Business uses sharper borders

**Create `src/components/sita/surfaces/DetailDrawer.tsx`** (~120 lines)
- Slide-from-right panel at Surface Level 3
- Domain-paced spring animation
- Layered shadow system (near sharp + far soft)
- Subtle backdrop dim on parent content
- Close on Escape, swipe on mobile

**Create `src/components/sita/surfaces/SplitWorkspace.tsx`** (~100 lines)
- Replaces the basic ModuleWorkspace grid with a proper resizable split view
- Left: list/queue at Surface 1, Right: detail at Surface 2
- Animated divider with drag-to-resize
- Collapse to full-list or full-detail on mobile

### Workstream 4: Premium Badge System

**Create `src/components/sita/badges/` directory** (~200 lines total):

| Badge | Visual |
|-------|--------|
| `TrustBadge` | Shield icon, green/amber/red, "Verified" / "Pending" / "Unverified" |
| `FreshnessBadge` | Clock icon with relative time, green→amber→red aging |
| `UrgencyBadge` | Pulse dot, "Critical" / "High" / "Normal" / "Low" |
| `DomainBadge` | Domain icon + color pill, "Business" / "Finance" / "Concierge" |
| `ExecutionBadge` | State chip: "Drafted" → "Approved" → "Executing" → "Complete" with domain accent |
| `ProofBadge` | Hash icon, mono text, verification checkmark |
| `ModeBadge` | "Demo" / "Live" / "Sandbox" with appropriate severity |

All badges share a `BadgeBase` component with consistent 20px height, pill shape, and 10px text.

### Workstream 5: Domain-Paced Motion System

**Rewrite `src/components/sita/motion/AppTransitions.tsx`** (~250 lines)

Upgrade from simple wrappers to a domain-aware motion system:

- `DomainTransition` — reads domain from context, applies domain-specific spring config
- `AppOpenCeremony` — cinematic app launch: dock icon scales up → background blurs → app surface reveals from center (different timing per domain)
- `ModuleSlide` — horizontal slide between modules within an app, paced by domain
- `ListReveal` — staggered list with domain-specific stagger delay (Business: 30ms, Finance: 50ms, Concierge: 60ms)
- `CardEntrance` — individual card entry with domain-tuned spring
- `DrawerReveal` — side panel slide with domain pacing
- `SkeletonMorph` — skeleton shapes morph into real content (not just crossfade)
- `BoardroomCinematic` — domain-specific entry ceremony (Business: sharp cut, Finance: calm dissolve, Concierge: soft bloom)

### Workstream 6: Desktop State System + Shell Polish

**Edit `src/components/sita/shell/DesktopSurface.tsx`**:

Add explicit desktop state management with visual differentiation:

| State | Visual Treatment |
|-------|-----------------|
| Fresh boot | Entry ceremony → ambient orbs bloom in |
| Idle calm | Reduced orb intensity, subtle breathing |
| Active work | Normal intensity, app windows visible |
| Heavy review | Slightly warmer ambient, more visible trust indicators |
| Degraded | Muted palette, warning strip at top |
| Locked | Blur overlay, clock hero, auth prompt |

**Edit `src/components/sita/shell/DomainAppShell.tsx`**:
- Apply Surface Level hierarchy internally (sidebar = Surface 0, content = Surface 1, any detail pane = Surface 2)
- Add window focus/unfocus shadow states from `APP_SHADOWS`
- Integrate domain-paced `DomainTransition` wrapper around children

**Edit `src/components/sita/shell/SystemMenuBar.tsx`**:
- Show active domain name in bold next to app title (like macOS shows "Finder" then "File Edit View")
- Subtle domain accent on the underline of active menu item

---

## File Summary

| Action | File | Est. Lines |
|--------|------|-----------|
| Create | `src/lib/design-system/sita-design-tokens.ts` | 200 |
| Create | `src/components/sita/cards/HeroCard.tsx` | 50 |
| Create | `src/components/sita/cards/SummaryCard.tsx` | 45 |
| Create | `src/components/sita/cards/ActionCard.tsx` | 55 |
| Create | `src/components/sita/cards/QueueCard.tsx` | 60 |
| Create | `src/components/sita/cards/ProofCard.tsx` | 55 |
| Create | `src/components/sita/cards/StatusCard.tsx` | 45 |
| Create | `src/components/sita/cards/ComparisonCard.tsx` | 60 |
| Create | `src/components/sita/cards/TimelineCard.tsx` | 65 |
| Create | `src/components/sita/cards/index.ts` | 15 |
| Create | `src/components/sita/surfaces/AppSurface.tsx` | 80 |
| Create | `src/components/sita/surfaces/DetailDrawer.tsx` | 120 |
| Create | `src/components/sita/surfaces/SplitWorkspace.tsx` | 100 |
| Create | `src/components/sita/badges/TrustBadge.tsx` | 30 |
| Create | `src/components/sita/badges/FreshnessBadge.tsx` | 35 |
| Create | `src/components/sita/badges/UrgencyBadge.tsx` | 25 |
| Create | `src/components/sita/badges/DomainBadge.tsx` | 25 |
| Create | `src/components/sita/badges/ExecutionBadge.tsx` | 30 |
| Create | `src/components/sita/badges/ProofBadge.tsx` | 25 |
| Create | `src/components/sita/badges/ModeBadge.tsx` | 20 |
| Create | `src/components/sita/badges/index.ts` | 12 |
| Rewrite | `src/components/sita/motion/AppTransitions.tsx` | 250 |
| Edit | `src/components/sita/shell/DomainAppShell.tsx` | Surface hierarchy + domain transitions |
| Edit | `src/components/sita/shell/DesktopSurface.tsx` | Desktop state system |
| Edit | `src/components/sita/shell/SystemMenuBar.tsx` | Active domain display |
| Edit | `src/lib/design-system/app-window-system.ts` | Add surface level tokens |

## What This Unlocks

After this phase, every future module page can be built with:
- Correct card family (not generic `SitaCard` everywhere)
- Proper surface hierarchy (not flat layouts)
- Domain-paced motion (automatic from context)
- Premium badges (not ad-hoc colored dots)
- Drawer-based detail views (not page navigations)
- The visual foundation that makes SITA OS feel like a real OS with distinct software products inside it

