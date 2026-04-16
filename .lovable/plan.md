

# SITA OS — Component Governance & UI Consolidation

## Scope
Audit, classify, and consolidate 862+ components into a strict 3-class constitution: **Primitive · Domain · Surface**. Eliminate duplication families (cards, badges, shells, panels) without breaking existing imports.

## Phased Execution

### Phase 1 — Audit & Registry (Foundation, no breaking changes)
1. Build `src/lib/architecture/component-registry.ts` — auto-generated inventory of all 862 components with: path, classification, domain, usage count, duplicate-group ID.
2. Build `src/lib/architecture/component-duplication-map.ts` — explicit duplicate families with canonical winner per group.
3. Add `scripts/architecture/audit-components.ts` to scan, classify, and emit the registry.
4. Author governance docs:
   - `docs/architecture/COMPONENT_CONSTITUTION.md` (3-class rules)
   - `docs/architecture/COMPONENT_NAMING_POLICY.md` (suffix grammar: Card/Badge/Panel/Shell/Drawer/Hero/Summary/Inspector)

### Phase 2 — Canonical Primitives
Establish the only allowed style-primitive layer at `src/components/primitives/`:
- `primitives/display/` — BaseCard, Hero, Summary, Panel, StatTile
- `primitives/status/` — StatusBadge, TrustBadge, UrgencyBadge, ProofBadge, FreshnessBadge, ModeBadge (variants, not files)
- `primitives/feedback/` — EmptyState, Skeleton, Spinner
- `primitives/overlays/` — Drawer, Sheet, Dialog
- `primitives/timelines/` — TimelineRow
- `primitives/index.ts` barrel

All primitives compose existing `ui/*` (shadcn) — no logic, no domain imports.

### Phase 3 — Domain Component Consolidation
Collapse the highest-risk duplicate families first:

| Family | Action |
|---|---|
| **Cards** (~40 variants: Advisor, Proof, Recommendation, Recovery, CashPressure, Action, Queue, Hero, Summary, Status, Comparison, Intervention) | Canonicalize via `domain/<area>/*Card.tsx` composing `primitives/display/BaseCard` with `variant` prop |
| **Badges** (Trust/Truth/Status/State/Freshness/Urgency/Execution/Domain/Mode/Proof/LaunchHonesty) | Collapse to 6 primitive badges with variants |
| **Shells** (App/Business/Concierge/Finance/MissionControl/Boardroom/Admin/Owner/Founder/PublicLayout/ConciergePageWrapper) | Reduce to 5 canonical shells: PrimaryAppShell, AdminShell, DomainAppShell, PublicShell, DesktopShell |
| **Panels & Summaries** | Distinguish Panel (interactive) vs Summary (read-only) vs Inspector (drilldown) |
| **Advisors** (AdvisorCard, LiveAdvisorCard, AdvisorProfileCard, AdvisorAgentCard, DomainAdvisorCard) | One `domain/advisors/AdvisorCard` with variants: compact/profile/live/admin/mobile |

### Phase 4 — Compatibility Wrappers (Zero Breakage)
Every legacy path becomes a thin re-export:
```ts
// src/components/sita/cards/ProofCard.tsx
export { ProofCard } from "@/components/domain/proofs/ProofCard";
```
Add `@deprecated` JSDoc pointing to canonical path. No behavior change.

### Phase 5 — Import Migration (Automated)
- Sweep `src/pages/**`, `src/components/**`, route surfaces, nav shells.
- Update barrel exports in `cards/index.ts`, `badges/index.ts`, `primitives/index.ts`, `shell/index.ts`.
- Verify build green after each batch.

### Phase 6 — Governance Tests (Prevent Regression)
Add to `scripts/architecture/`:
- `check-component-classification.ts` — every export classified
- `check-primitive-purity.ts` — primitives import no domain/services/hooks
- `check-domain-purity.ts` — domain imports no page/route modules
- `check-duplicate-families.ts` — fails if unregistered duplicates appear
- `check-deprecated-wrappers.ts` — wrappers must be thin re-exports only
- Wire into existing `ia-governance.ts` script suite

### Phase 7 — Page-Local Demotion
Components used by exactly one page → move to that page's local folder (not exported as system components). Reduces false-sharing footprint.

### Phase 8 — Verification & Documentation
- Run `tsc --noEmit` + `bun run build` → zero errors
- Update `PROJECT_TREE.md` with new component taxonomy
- Update `FULL_ISSUES_AND_FIXES.md` with ISS-097 (Component Governance) marked RESOLVED
- Emit final `generated/COMPONENT_GOVERNANCE_REPORT.md` with before/after counts

## Safety Guarantees
- **No deletion** until zero dependents remain (verified by registry).
- **All legacy import paths** preserved via wrappers through Phase 5.
- **Build must stay green** after every phase.
- **Behavior preserved** — refactor is structural, not functional.

## Deliverables
- Component registry + duplication map (machine-readable truth)
- 6 governance test scripts wired into CI
- 2 governance docs (Constitution + Naming Policy)
- Canonical `primitives/` + `domain/` + `surfaces/` directory structure
- ~40% reduction in unique component file count via wrapper consolidation
- Zero breaking changes for consumers

## Out of Scope
- Visual redesign (grammar stays identical)
- New features
- DB / edge function changes
- shadcn `ui/*` modifications (those remain the lowest layer)

