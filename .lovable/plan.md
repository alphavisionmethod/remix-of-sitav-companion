

# SITA OS — Design System Integration Phase

## The Problem

The design system primitives are built but **completely unused**. Zero pages import from `@/components/sita/cards`, `@/components/sita/badges`, or `@/components/sita/surfaces`. All ~80 module pages still use the old `SitaCard`, `GlassCard`, `SitaPageHeader`, `ModuleWorkspace`, and `EmptyStateCTA`. Every domain looks structurally identical despite atmosphere tokens existing. The `PremiumEmptyState` component was planned but never created.

## What We Build (High-Impact Integration)

### 1. Rewrite 3 Domain Overview Pages
Replace old shared primitives with the new card family, badges, and domain-paced motion so each domain **looks and feels different**.

**BusinessOverview** — Replace `GlassCard`/`OperatingStateHero` with `HeroCard` (sharp gradient), `QueueCard` (priority queue with `UrgencyBadge`), `ActionCard` (prepared follow-throughs), `TimelineCard` (what-changed), `AdvisorCard`. Use `ListReveal` at 30ms stagger. Wrap in `AppSurface` level hierarchy.

**MoneyOverview** — Same structure but calmer: `HeroCard` with muted green gradient, `StatusCard` for confidence state with `TrustBadge`, `QueueCard` for obligations with `FreshnessBadge`. 50ms stagger. More spacing, softer radii.

**ConciergeOverview** — Warmest: `HeroCard` with soft purple gradient, `QueueCard` with gentler urgency, `ActionCard` with supportive tone. 60ms stagger. Most breathing room, rounded 20px cards.

### 2. DomainAppShell Surface Integration
Edit `DomainAppShell.tsx` to wrap content area in `AppSurface level={0}` and inject domain atmosphere CSS variables (border-radius, contrast, warmth) as inherited styles so all child pages automatically inherit domain feel.

### 3. Rewrite 2 Key Module Pages (proving depth)
**CustomersPage** — Replace `ModuleWorkspace` + `SitaCard` with `SplitWorkspace` (resizable list/detail), customer items using `ListReveal`, detail in right pane at Surface 2, `FreshnessBadge` on last contact, `TrustBadge` on health.

**BillsWorkspace** — Replace flat list with `SplitWorkspace`, `QueueCard` for grouped dues, `ExecutionBadge` on payment status, `FreshnessBadge` on due dates.

### 4. Premium Empty State System
Create `src/components/sita/PremiumEmptyState.tsx` with 7 variants: `first-use`, `no-data`, `disconnected`, `degraded`, `blocked`, `no-results`, `no-permission`. Domain-aware accents, `CardEntrance` animation, replaces the basic `EmptyStateCTA` and `ConciergeEmptyState`.

### 5. Desktop Surface Polish
Update `DesktopSurface.tsx` widgets to use `StatusCard` instead of custom glass cards. Add visual state differentiation (idle reduces orb intensity, active normal, degraded mutes palette).

## Files

| Action | File |
|--------|------|
| Rewrite | `src/pages/business/BusinessOverview.tsx` |
| Rewrite | `src/pages/money/MoneyOverview.tsx` |
| Rewrite | `src/pages/concierge/ConciergeOverview.tsx` |
| Rewrite | `src/pages/business/CustomersPage.tsx` |
| Rewrite | `src/pages/money/BillsWorkspace.tsx` |
| Edit | `src/components/sita/shell/DomainAppShell.tsx` |
| Create | `src/components/sita/PremiumEmptyState.tsx` |
| Edit | `src/components/sita/shell/DesktopSurface.tsx` |

This transforms the app from "has a design system" to "uses the design system everywhere users see first." Every subsequent module page follows these patterns.

