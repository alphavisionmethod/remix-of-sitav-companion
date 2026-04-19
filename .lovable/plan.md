
This is a large hardening pass. Per scope discipline established in prior turns ("only on the admin AI engineer team"), I will scope all UI mounts to the AI Engineer hub and keep cross-domain edits to read-only audits + shared primitives that the AI Engineer hub already owns. Existing primitives (`PremiumEmptyState`, `StatusBadge`, `EmptyState`, `AdminControlPlaneShell`) are reused — no duplicate component families.

## Phase 1 — Audits (read-only, generated under `generated/admin-coherence-and-responsive-closure/`)

Inspect all 12 admin domain hubs + flagship surfaces and emit:
- `ADMIN_VISUAL_COHERENCE_AUDIT.md` — empty-state, action-panel, status-color, microcopy inconsistencies per domain
- `RESPONSIVE_SURFACE_AUDIT.md` — `/desktop`, `/boardroom/briefing`, mixed-quality `/admin/*` narrow-width findings
- `ADMIN_MICROCOPY_AND_SEMANTICS_MODEL.md` — canonical tone + label rules

No source edits in this phase.

## Phase 2 — Canonical specs (docs only)

Emit the 4 spec docs that future PRs reference:
- `ADMIN_EMPTY_STATE_SYSTEM_SPEC.md` — declares `PremiumEmptyState` as the single canonical primitive (no new component)
- `ADMIN_ACTION_PANEL_HIERARCHY_SPEC.md` — primary / remediation / next / related / evidence ordering
- `ADMIN_STATUS_SEMANTICS_SPEC.md` — locks `StatusBadge` tones to fixed meanings (healthy/info/warning/reauth/critical/preview/archived)
- `RESPONSIVE_OPERATOR_BOARD_RULES.md` — collapse thresholds, table overflow strategy, touch targets

## Phase 3 — Shared canonical components (additive, AI-engineer-owned)

Two small new primitives in `src/components/primitives/feedback/` (sister files to existing `EmptyState.tsx`, no duplication — these are *explanatory* not empty-state):
- `NeedsDataExplainer.tsx` — composes `PremiumEmptyState` with `needs-data` preset
- `NeedsTimeWindowExplainer.tsx` — composes `PremiumEmptyState` with `accumulating-window` preset
- `NeedsHistoricalReleasesExplainer.tsx` — composes `PremiumEmptyState` with `first-use` preset

Plus one shared action module:
- `src/components/primitives/actions/OperatorActionPanel.tsx` — canonical primary / remediation / next / related slot ordering, composes `Button` only

Export all 4 from `src/components/primitives/index.ts`.

## Phase 4 — Responsive hardening (scoped, surgical)

- `/desktop`: add a single honest narrow-width disclosure banner (≥320 to <768) reading "Desktop view — open on a wider screen for the full workspace." No layout overhaul. Mounted in existing `Desktop.tsx`.
- `/boardroom/briefing`: wrap existing dense panels in `overflow-x-auto` scroll containers + stack cards via `flex-col md:grid` where currently fixed grids. Read-only inspection first, edits only where overflow is real.
- Mixed-quality admin boards: extend existing `useIsMobile` consumers; wrap raw `<table>` elements in `<div className="overflow-x-auto">` where missing (canonical SITA pattern).

## Phase 5 — Validators (real checks under `scripts/validation/`)

7 new validators, each emitting `generated/<gate>-report.json` via existing `emit-gate-report` lib:
- `check-admin-empty-state-consistency.ts` — greps admin hubs for raw "No data" strings outside primitives
- `check-admin-action-panel-hierarchy.ts` — asserts `OperatorActionPanel` usage on registered admin boards
- `check-admin-status-semantics.ts` — bans hardcoded `bg-yellow-*` / `bg-red-*` outside `StatusBadge` in admin tree
- `check-admin-microcopy-rules.ts` — bans "Coming soon" / "Check back later" / "Nothing here yet" in `/admin/**`
- `check-responsive-operator-surfaces.ts` — extends existing `check-responsive-surface-integrity.ts` pattern; flags unwrapped `<table>` in admin boards
- `check-boardroom-briefing-narrow-width.ts` — asserts overflow wrappers + responsive grid classes
- `check-desktop-honest-narrow-width.ts` — asserts the disclosure banner exists

WARN-tier (not BLOCK) so we don't break the 215-gate aggregator without a discovery period.

## Phase 6 — AI Engineer hub integration

- Add tab #13 `AdminCoherenceClosureTruthPanel.tsx` to `AIRuntimeHome.tsx` showing live status of the 7 validators + 3 audit deliverables, with `<Link>`s to the spec docs and live boards
- Wire 7 new validators into the `closure:admin-empty-state:run-all` script (rename to `closure:admin-coherence:run-all` or add sibling)
- Update `generated/admin-coherence-and-responsive-closure/admin-coherence-and-responsive-verification.json` master JSON

## Phase 7 — Aggregator wiring

Add the 7 new gates to the 215-gate release readiness aggregator at WARN tier, bringing total to 222. Update `ADMIN_COHERENCE_AND_RESPONSIVE_FINAL_VERIFICATION.md` with the green verdict.

## Files touched (final count)

- **NEW (4 components):** `NeedsDataExplainer.tsx`, `NeedsTimeWindowExplainer.tsx`, `NeedsHistoricalReleasesExplainer.tsx`, `OperatorActionPanel.tsx`
- **NEW (1 truth panel):** `AdminCoherenceClosureTruthPanel.tsx`
- **NEW (7 validators):** the 7 scripts above
- **NEW (12 generated artifacts):** 4 audit/spec docs, 4 spec docs, 3 status JSONs, 1 master verification JSON, 1 final markdown
- **EDITED (3 components):** `src/components/primitives/index.ts` (+4 exports), `Desktop.tsx` (+banner), `AIRuntimeHome.tsx` (+tab #13)
- **EDITED (responsive surgical):** `/boardroom/briefing` panels + 2-3 admin boards with unwrapped tables (exact list determined by Phase 1 audit)
- **EDITED (1 aggregator):** master release readiness aggregator (+7 gate registrations)

## Discipline

- Zero new empty-state component families — all 3 explainers compose `PremiumEmptyState`
- Zero hero art, zero decorative illustrations
- Zero edits to user routes, edge functions, sealed migrations, or `App.tsx` route table
- Zero placeholder copy — every string is operator-grade
- All validators emit real `generated/*-report.json` and exit cleanly
- AI Engineer hub remains the single integration point per established scope

After this pass: 12 admin domains audited and unified through shared primitives, 4 canonical explanatory components shipped, 7 validators green at WARN tier, truth panel mounted as tab #13, `/desktop` honest at narrow widths, `/boardroom/briefing` overflow-safe, mixed-quality admin boards table-wrapped, deployment-ready.
