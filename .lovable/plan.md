

# SITA OS Master Prompt — Remaining Gaps Analysis & Implementation Plan

## What's Already Done (Confirmed Working)

| Requirement | Status |
|---|---|
| DomainAppShell (traffic lights, accent strip, sidebar nav, ceremony) | Done — all 5 domains use it |
| App state persistence (sub-page + scroll restore) | Done — `useAppStatePersistence.ts` |
| Sidebar running indicators + last-page tooltip | Done — `AppSidebar.tsx` with green dot |
| Dock domain integration | Done — `DesktopDock.tsx` wired |
| Per-app CSS atmosphere (ambient gradients, edge glow) | Done — `domain-atmospheres.ts` + CSS classes |
| Micro-interactions (hover-lift, press, focus-glow) | Done — 3 overview pages use them |
| DomainCard (reads CSS vars for per-app styling) | Done — used in 3 overviews |
| DomainAdvisorBoard (5 modes: roundtable, ask-one, synthesis, debate, evidence) | Done — in all 4 boardrooms + global |
| BoardroomCinematic in all boardrooms | Done |
| PremiumEmptyState in key pages | Done — 6 pages |
| PageTruthBanner | Done — 22 pages |
| Command palette with cross-app actions + smart suggestions | Done |
| Live Activity domain data hook | Done |
| Lock screen + boot splash | Done — already premium |
| App open transitions | Done — `AppOpenTransition` + `AppOpenCeremony` |

## What's NOT Done (8 Gaps)

### Gap 1: ~200+ Legacy Sub-Tool Pages Still Use Old Components
234 files still import `SitaCard`/`SitaSectionHeader`/`SitaPageHeader`. The master prompt requires every module to "feel like a real tool, not a menu item." The 3 overviews use DomainCard + micro-interactions, but the actual sub-tools (CRM detail, Lead Recovery, Bills, Spending Pulse, Travel, Errands, Operations, etc.) still look like old dashboard pages.

**Priority pages (highest traffic, most visible):**
- Business: `BusinessOperations.tsx`, `CommunicationsCenter.tsx`, `CustomerSupportCenter.tsx`, `CollectionsCommandCenter.tsx`, `QuotesWorkspace.tsx`
- Money: `BillsWorkspace.tsx`, `SpendingPulse.tsx`, `PeaceScore.tsx`, `StressRadar.tsx`, `MoneyApprovals.tsx`
- Concierge: `TravelPlanning.tsx`, `LifeAdminCenter.tsx`, `AppointmentsPrep.tsx`, `SchoolActivities.tsx`, `UpcomingNeeds.tsx`

**Action:** Migrate top 15 sub-tool pages to new card family (HeroCard, QueueCard, ActionCard, DomainCard) + PageTruthBanner + micro-interactions + PremiumEmptyState.

### Gap 2: No Progressive Disclosure / Detail Panes
The master prompt (Part 22) explicitly requires "side panels, drill-downs, layered views." Currently zero pages use slide-out detail panes. Everything is full-page renders.

**Action:** Create a reusable `SlidePanel` component (right-side drawer, 400px, animated). Wire into CRM (customer detail), Leads (lead detail), Invoices (invoice detail), Bills (bill detail) as the canonical progressive disclosure pattern.

### Gap 3: No Module-Level Advisor Boards
Part 14.3 requires module-level specialized advisors (CRM advisor board, Collections board, Travel prep board, etc.). Currently only domain-level boards exist.

**Action:** Create `ModuleAdvisorInsight` — a compact, inline advisor card that can be dropped into any sub-tool page with module-specific context (e.g., "CRM Advisor suggests: Follow up with Sarah Chen — relationship cooling").

### Gap 4: Micro-Interactions Only in 3 Pages
`micro-hover-lift`, `micro-press`, `micro-focus-glow` exist but are only used in the 3 overview pages. The master prompt (Part 21) requires them "everywhere they matter."

**Action:** Apply micro-interaction classes to all interactive cards/buttons across the 15 migrated pages in Gap 1.

### Gap 5: No Right-Click Context Menu on Sidebar
Part 4 requires "right-click options" on sidebar items (Pin to Dock, Quit App, etc.).

**Action:** Add a lightweight context menu to `AppSidebar.tsx` for domain items with: Pin to Dock, Open in New Window (future), Clear App State.

### Gap 6: No Hover Preview on Dock
Part 5 mentions "hover preview if elegant" for dock items.

**Action:** Add a tooltip-style hover card to dock domain items showing: domain name, current sub-page, key metric (e.g., "3 bills due").

### Gap 7: Concierge Sub-Tools Still Feel Like Lists
`SchoolActivities.tsx`, `GroceryPlanning.tsx`, `RecurringObligations.tsx` all use raw `SitaCard` grids. The master prompt says these must feel like "beautiful admin relief software" not "reminder dashboards."

**Action:** Included in Gap 1 migration — apply warm Concierge atmosphere + softer card radius + supportive empty states.

### Gap 8: Money Sub-Tools Missing Emotional Design
`PeaceScore.tsx` and `StressRadar.tsx` are supposed to be "signature emotional-finance intelligence surfaces." Currently they use standard cards.

**Action:** Included in Gap 1 — these two specifically need HeroCard with large emotional typography, gradient backgrounds, and confidence visualization.

---

## Implementation Plan (4 Phases)

### Phase A: SlidePanel + Progressive Disclosure (Foundation)
Create reusable `SlidePanel` component. This unlocks the "drill-down" pattern for all sub-tools.

| File | Action |
|------|--------|
| `src/components/sita/surfaces/SlidePanel.tsx` | Create — animated right drawer, 400px, overlay, close on escape |

### Phase B: Migrate 15 High-Impact Sub-Tool Pages
Rewrite imports from `SitaCard`/`SitaPageHeader` to new card family. Add micro-interactions, PremiumEmptyState, PageTruthBanner, and SlidePanel where appropriate.

| Page | Key Changes |
|------|------------|
| `BusinessOperations.tsx` | HeroCard + QueueCard + micro-interactions + PageTruthBanner |
| `CommunicationsCenter.tsx` | Already partially migrated — add DomainCard tiles + PremiumEmptyState |
| `CustomerSupportCenter.tsx` | QueueCard for tickets + SlidePanel for detail |
| `CollectionsCommandCenter.tsx` | HeroCard (total outstanding) + QueueCard + urgency-driven layout |
| `QuotesWorkspace.tsx` | ActionCard for quote actions + SlidePanel for quote detail |
| `BillsWorkspace.tsx` | QueueCard for due/overdue + calm Finance atmosphere |
| `SpendingPulse.tsx` | StatusCard for patterns + AdvisorCard + emotional design |
| `PeaceScore.tsx` | Full HeroCard with large score + gradient + confidence bar |
| `StressRadar.tsx` | HeroCard with stress visualization + emotional typography |
| `MoneyApprovals.tsx` | ActionCard for approve/reject + ProofCard for evidence |
| `TravelPlanning.tsx` | HeroCard for upcoming trip + warm Concierge atmosphere |
| `LifeAdminCenter.tsx` | QueueCard for admin tasks + soft supportive empty states |
| `AppointmentsPrep.tsx` | TimelineCard for prep steps + AdvisorCard |
| `SchoolActivities.tsx` | DomainCard tiles + Concierge atmosphere + PremiumEmptyState |
| `UpcomingNeeds.tsx` | QueueCard for upcoming + TimelineCard for timeline |

### Phase C: Module Advisor Insight + Sidebar Context Menu + Dock Hover
| File | Action |
|------|--------|
| `src/components/sita/domain-shared/ModuleAdvisorInsight.tsx` | Create — compact inline advisor for sub-tools |
| `src/components/sita/AppSidebar.tsx` | Add right-click context menu |
| `src/components/sita/DesktopDock.tsx` | Add hover preview card for domain items |

### Phase D: Wire Module Advisors Into Migrated Pages
Drop `ModuleAdvisorInsight` into all 15 migrated pages with module-specific context strings.

---

## Result After All Phases
- 15 more sub-tool pages feel like "real tools" with premium cards, micro-interactions, and progressive disclosure
- SlidePanel enables drill-down pattern across the system
- Module-level advisors appear inline in sub-tools
- Sidebar has right-click context menu
- Dock has hover previews
- PeaceScore and StressRadar become signature emotional surfaces
- ~50% of old `SitaCard` usage eliminated from high-traffic pages

