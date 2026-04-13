

# SITA OS Part 3 — Full Advanced Integration Plan

## Current Reality (Hard Numbers)

| Metric | Count |
|--------|-------|
| Pages using new design system | 9 |
| Pages still on legacy SitaCard | 193 |
| ComparisonCard usage | 0 pages |
| BoardroomCinematic usage | 0 pages |
| App.tsx lines / routes | 1,899 / 856 |
| ShellLayout lines | 750 |
| Admin pages | 381 |
| Contexts | 23 |
| Command components | 6+ overlapping |
| Empty state components | 6 overlapping |

## Implementation Plan (5 Phases, Prioritized by Impact)

### Phase 1: Route Decomposition + Shell Split

**App.tsx decomposition** — Split 1,899-line monolith into route family files:

| File | Content |
|------|---------|
| `src/routes/os-routes.tsx` | Desktop, DailyPulse, Settings, Profile, MissionControl |
| `src/routes/business-routes.tsx` | All `/business/*` routes |
| `src/routes/money-routes.tsx` | All `/money/*` routes |
| `src/routes/concierge-routes.tsx` | All `/concierge/*` routes |
| `src/routes/files-routes.tsx` | All `/files/*` routes |
| `src/routes/boardroom-routes.tsx` | Boardroom, replays, history |
| `src/routes/trust-routes.tsx` | Trust, proof routes |
| `src/routes/advisor-routes.tsx` | All `/advisors/*` routes |
| `src/routes/experimental-routes.tsx` | Investment office, app platform, speculative |

App.tsx becomes a thin orchestrator (~200 lines) importing these families.

**ShellLayout decomposition** — Extract from 750-line monolith:

| Extract | Purpose |
|---------|---------|
| `ShellWindowLayer.tsx` | All 20 window imports + render logic |
| `ShellAccessoryLayer.tsx` | AdvisorChat, Timeline, Inspector, CompanionBar, ContextualRail |
| `ShellLiveLayer.tsx` | LiveActivityBar, ClickRipple, CommandLayer |

ShellLayout becomes ~250 lines: frame + sidebar + topbar + lazy children.

### Phase 2: Migrate 12 High-Impact Module Pages

Replace `SitaCard`/`GlassCard`/`SitaPageHeader` with new card family, badges, `ListReveal`, and `SplitWorkspace` in:

**Business (4 pages):**
- `FollowThroughCenter.tsx` — `QueueCard` for callback/no-touch/waiting queues, `UrgencyBadge`, `ExecutionBadge`
- `CommunicationsCenter.tsx` — `TimelineCard` for comms feed, `ActionCard` for drafts
- `QuotesWorkspace.tsx` (ProposalsContracts) — `SplitWorkspace`, `ActionCard` for proposals, `ExecutionBadge`
- `BusinessBoardroom.tsx` — `ComparisonCard` for scenario reviews, `BoardroomCinematic` entry, `AdvisorCard`, `ProofCard`

**Money (4 pages):**
- `ReservesSavings.tsx` — `HeroCard` for reserve health, `StatusCard` confidence, `TrustBadge`
- `SubscriptionsWaste.tsx` — `QueueCard` for waste items, `FreshnessBadge`, `ActionCard` cancel/downgrade
- `MoneyBoardroom.tsx` — `ComparisonCard`, `BoardroomCinematic`, `ProofCard` for financial evidence
- `FinancialHealthPulse.tsx` — `HeroCard` peace score, `StatusCard` stress radar

**Concierge (2 pages):**
- `TravelPlanning.tsx` — `QueueCard` for prep tasks, `TimelineCard` for itinerary, `FreshnessBadge`
- `LifeAdminCenter.tsx` — `QueueCard` for admin bundles, `ActionCard` for grouped tasks

**Files + Trust (2 pages):**
- `FilesOverview.tsx` — `StatusCard` for processing state, `HeroCard` for file intelligence summary, `SplitWorkspace`
- `TrustCenter.tsx` — `ProofCard` for evidence chain, `TrustBadge`, `StatusCard` for posture, replace `SitaCard`

### Phase 3: Boardroom Ceremonies + ComparisonCard + ProofCard Integration

**Wire `BoardroomCinematic`** into all 4 boardroom pages:
- `BusinessBoardroom.tsx` — sharp cut entry
- `MoneyBoardroom.tsx` / `FinanceBoardroom.tsx` — calm dissolve entry
- `ConciergeBoardroom.tsx` — soft bloom entry

**Integrate `ComparisonCard`** into all boardrooms for scenario A/B review.

**Integrate `ProofCard`** into:
- `BusinessProof.tsx`
- `MoneyProof.tsx`
- `ConciergeProof.tsx`
- `ProofCenter.tsx`
- `TrustCenter.tsx`

### Phase 4: Design System Consolidation

**Unify empty states** — Make `PremiumEmptyState` the single canonical empty state. Create a shim so `EmptyState`, `EmptyStateCTA`, `EmptyStateCard`, `ContextualEmptyState`, and `ConciergeEmptyState` all re-export from `PremiumEmptyState` with mapped props.

**Unify command system** — Keep 3 canonical command surfaces:
1. `CommandPalette.tsx` — global OS-level (Cmd+K from shell)
2. `DomainCommandPalette.tsx` — domain-scoped (Cmd+K inside app)
3. `AdminCommandPalette.tsx` — admin-only

Mark `UniversalCommand.tsx`, `UniversalCommandSurface.tsx`, `AutopilotCommandCenter.tsx` as deprecated re-exports.

**Consolidate mode/reality contexts** — Merge `DataModeContext`, `DemoModeProvider`, and `RealityModeProvider` into one `RealityModeProvider` that exposes: `mode`, `isDemo`, `isReal`, `source`, `freshness`. Old hooks become shim re-exports.

### Phase 5: Runtime Truth + Premium States

**Per-page truth declaration** — Add a `<PageTruthBanner>` component that reads reality mode and shows elegant inline indicators: "Demo Data", "Live", "Partial", "Connecting...". Apply to all 21 migrated pages.

**Connect-to-activate states** — For pages requiring connectors (CRM, email, calendar, accounting), show `PremiumEmptyState` variant `connect-to-activate` instead of demo data when in live mode with no connector.

**Degraded mode design** — `PremiumEmptyState` variant `degraded` for stale data, failed AI, or disconnected services. Show last-known-good with freshness badge.

---

## Files Summary

| Action | File(s) | Phase |
|--------|---------|-------|
| Create | 9 route family files in `src/routes/` | 1 |
| Rewrite | `src/App.tsx` → thin orchestrator | 1 |
| Create | `ShellWindowLayer.tsx`, `ShellAccessoryLayer.tsx`, `ShellLiveLayer.tsx` | 1 |
| Rewrite | `src/components/sita/ShellLayout.tsx` → ~250 lines | 1 |
| Rewrite | 12 module pages (listed above) | 2 |
| Edit | 4 boardroom pages + 5 proof pages | 3 |
| Edit | 5 empty state files → shim re-exports | 4 |
| Edit | 3 command files → deprecation shims | 4 |
| Create | `src/components/sita/PageTruthBanner.tsx` | 5 |
| Edit | 21 pages to add truth banner | 5 |

After this phase: **21 pages** on new design system (vs 9 today), App.tsx drops from 1,899 to ~200 lines, ShellLayout from 750 to ~250, boardrooms have cinematic entries, and runtime truth is visible everywhere.

