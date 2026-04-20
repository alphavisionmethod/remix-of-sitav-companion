

## Wave 13 — Frontend Canonicalization Closure

### Summary

The project has strong existing frontend infrastructure: canonical primitives barrel (17 exports), component-duplication-map (13 families), page-state contracts (2 files in `src/lib/reality/` and `src/lib/frontend/`), truth-surface-registry (8 entries), component-registry system, 644+ generated proof artifacts, accessibility-summary.json (811 routes, 100% compliant), and surface-performance-budget.json (811 routes). Missing: unified component canonical map, component family taxonomy, layout grammar, page-shell compliance, accessibility/mobile/performance policy files in `src/lib/frontend/`, deprecation registry, and 7 dedicated frontend validators. This wave fills every gap by extending existing systems rather than duplicating.

---

### PART 1 — Canonical Frontend Systems to Preserve

| System | Path | Action |
|---|---|---|
| Primitives barrel | `src/components/primitives/index.ts` | Keep — 17 canonical exports |
| Component duplication map | `src/platform/architecture/component-duplication-map.ts` | Keep — 13 families, extend |
| Component registry | `src/platform/architecture/component-registry.ts` | Keep — classification types, purity rules |
| Page state contract (reality) | `src/lib/reality/page-state-contract.ts` | Keep — 6 page classes, 5 state requirements |
| Page state registry | `src/lib/reality/page-state-registry.ts` | Keep — 43+ registered routes |
| Page state contract (frontend) | `src/lib/frontend/page-state-contract.ts` | Keep — PagePhase + transition machine |
| Truth surface registry | `src/lib/frontend/truth-surface-registry.ts` | Keep — 8 entries, extend |
| Accessibility summary | `generated/accessibility-summary.json` | Keep — 811 routes |
| Performance budgets | `generated/surface-performance-budget.json` | Keep — 811 routes |
| Check component canonicalization | `scripts/frontend/check-component-canonicalization.ts` | Strengthen from stub to real validator |
| Check truth surface coverage | `scripts/frontend/check-truth-surface-coverage.ts` | Keep, strengthen |

### PART 2 — Duplicate/Shadow Systems to Consolidate

No new duplicate systems. The two page-state files serve complementary purposes: `src/lib/reality/page-state-contract.ts` defines page classes and required state types for CI validation; `src/lib/frontend/page-state-contract.ts` defines the runtime PagePhase state machine. Both stay.

Alignment needed:
- `truth-surface-registry.ts` has 8 entries; needs expansion to cover admin AI, connectors, payments, approvals, security surfaces (~20 total)
- `check-component-canonicalization.ts` is a stub that only checks file existence; needs real validation logic

### PART 3 — New Canonical Artifacts

**Phase A — Component Canonical Map and Taxonomy**

1. **`src/lib/frontend/component-canonical-map.ts`** — Master registry of ~25 component families. Each entry: `familyId`, `canonicalPaths[]`, `deprecatedPaths[]`, `purpose`, `grammarRole`, `trustSensitive`, `owner`, `migrationStatus`. Families: buttons, cards (BaseCard), badges (StatusBadge/TrustBadge/ProofBadge/etc), status indicators, alerts/toasts, disclosures (AITruthDisclosure), modals/dialogs, drawers/sheets, tables, forms/fields, nav items, command surfaces, page headers, skeletons, empty states (EmptyState/PremiumEmptyState), error states, evidence primitives (EvidenceLink/ProvenanceChip), operator panels (OperatorActionPanel), timelines (TimelineRow), tiles (StatTile), panels, heroes, summaries.

2. **`src/lib/frontend/component-family-taxonomy.ts`** — Classification enum: `PRIMITIVE`, `DOMAIN`, `SURFACE`, `LIB_UI`. Grammar roles: `display`, `status`, `feedback`, `action`, `overlay`, `layout`, `navigation`, `data`, `trust`. Maps each family to its grammar role and layer.

3. **`src/lib/frontend/primitive-deprecation-registry.ts`** — Extends duplication-map with explicit deprecation enforcement. Each entry: deprecated path, canonical replacement, migration deadline, callers-remaining count, enforcement level (warn/block).

**Phase B — Layout Grammar and Shell Compliance**

4. **`src/lib/frontend/layout-grammar-map.ts`** — Canonical layout patterns: `landing` (public, no sidebar), `auth` (centered card), `onboarding` (stepper), `workspace` (sidebar+main), `admin-operator` (AdminControlPlaneShell), `desktop-os` (ShellComposer), `app-detail` (floating window), `settings` (sidebar+tabs), `marketing` (full-width sections), `mobile-optimized` (stack, no sidebar). Each pattern declares: shell component, nav role, sidebar behavior, mobile adaptation.

5. **`src/lib/frontend/page-shell-compliance-map.ts`** — Maps ~30 route prefixes to their required layout grammar. Cross-references route-plane-map and route-intent-taxonomy. Declares expected shell, layout pattern, state contract class, and mobile adaptation standard per route family.

**Phase C — Trust, Accessibility, Mobile, Performance Policies**

6. **Extend `src/lib/frontend/truth-surface-registry.ts`** — Add ~12 entries for admin AI runtime, admin approvals, admin security, connectors settings, payments, investment office, revenue office, owner dashboard, app permissions/install, digital presence, and approval chamber routes. Add `requiredPrimitives` field to each entry listing specific primitives needed (AITruthDisclosure, EvidenceLink, ProvenanceChip, TrustBadge, StatusBadge).

7. **`src/lib/frontend/accessibility-baseline.ts`** — Declares per-page-class requirements: semantic HTML landmarks, keyboard nav, focus management, ARIA labels for interactive elements, dialog/modal focus trapping, reduced-motion respect, contrast compliance, screen-reader state messages. References existing `generated/accessibility-summary.json` as evidence source.

8. **`src/lib/frontend/mobile-adaptive-policy.ts`** — Declares per-layout-grammar mobile expectations: breakpoints (sm: 640, md: 768, lg: 1024, xl: 1280), touch target minimums (44px), navigation collapse behavior, sidebar hide/drawer behavior, desktop-only feature disclosure, reduced-density rules for admin tables. References existing route-runtime-map for runtime tier support.

9. **`src/lib/frontend/page-performance-budget.ts`** — Declares per-page-class budgets: critical routes (LCP <1500ms, FCP <800ms, bundle <150KB), standard routes (LCP <2000ms, FCP <1000ms, bundle <250KB), heavy admin (LCP <2500ms, FCP <1200ms, bundle <400KB). References existing `generated/surface-performance-budget.json` as evidence source. Adds skeleton-required threshold and lazy-load expectations.

**Phase D — Validators (7 scripts)**

10. **`scripts/frontend/check-component-canonicalization.ts`** — Replace existing stub. Load component-canonical-map and component-duplication-map. Scan `src/components/` for files matching deprecated paths still imported. Emit `generated/component-canonicalization-report.json`. BLOCK if undeclared families found.

11. **`scripts/frontend/check-truth-primitive-coverage.ts`** — New. Load truth-surface-registry. For each registered route, verify the page file imports at least one required primitive. Emit `generated/truth-primitive-coverage.json`. ADVISORY.

12. **`scripts/frontend/check-page-state-coverage.ts`** — New. Load page-state-registry. Cross-reference page-state-contract classes. Flag routes missing required states. Emit `generated/page-state-coverage.json`. ADVISORY.

13. **`scripts/frontend/check-layout-grammar.ts`** — New. Load page-shell-compliance-map. Verify page files import expected shell/layout components. Emit `generated/layout-grammar-coverage.json`. ADVISORY.

14. **`scripts/frontend/check-accessibility-baseline.ts`** — New. Load accessibility-baseline. Reference generated/accessibility-summary.json. Emit `generated/accessibility-closure.json` summarizing compliance. ADVISORY.

15. **`scripts/frontend/check-mobile-adaptive-coverage.ts`** — New. Load mobile-adaptive-policy. Cross-reference route-runtime-map. Emit `generated/mobile-adaptive-coverage.json`. ADVISORY.

16. **`scripts/frontend/check-page-performance-budgets.ts`** — New. Load page-performance-budget. Reference generated/surface-performance-budget.json. Flag routes exceeding budget. Emit `generated/page-performance-budget-report.json`. ADVISORY.

**Phase E — Proof Bundle and Gate Registration**

17. **`generated/frontend-closure-bundle.json`** — Update existing `public/generated/frontend-closure-bundle.json` and generate canonical version at `generated/frontend-closure-bundle.json`. Aggregates: component family count, deprecated families, page-state coverage %, layout grammar coverage %, truth primitive coverage %, accessibility score, mobile adaptive %, performance budget compliance %.

18. Register `component-canonicalization` as a **BLOCK** gate in `check-os-release-readiness.ts`. Register the other 6 as **WARN** gates in the admin AI engineer warn array.

### PART 4 — Trust / Accessibility / Mobile / Performance Wiring

- Truth surface registry expanded from 8 → ~20 entries covering all trust-sensitive domains (admin AI, connectors, payments, boardroom, finance, approvals, security, owner, app platform)
- Each entry gains `requiredPrimitives: string[]` field linking to canonical primitive exports
- Accessibility baseline references existing 811-route accessibility-summary.json (all compliant)
- Mobile adaptive policy cross-references existing route-runtime-map (30 entries) for runtime tier support
- Performance budget policy cross-references existing surface-performance-budget.json (811 routes)

### PART 5 — Route / Shell / Page Ownership Integration

- `page-shell-compliance-map.ts` cross-references existing `route-plane-map.ts` (23 entries), `route-intent-taxonomy.ts` (30 entries), and `layer-manifest.ts` (27 entries)
- No duplication of route metadata — compliance map imports from existing route architecture
- Shell assignment per route family uses existing `ShellComposer`, `AdminControlPlaneShell`, and `PublicLayout` components

### PART 6 — Validators and Generated Artifacts

| Script | Gate ID | Level | Output |
|---|---|---|---|
| `check-component-canonicalization.ts` | `component-canonicalization` | BLOCK | `generated/component-canonicalization-report.json` |
| `check-truth-primitive-coverage.ts` | `truth-primitive-coverage` | WARN | `generated/truth-primitive-coverage.json` |
| `check-page-state-coverage.ts` | `frontend-page-state-coverage` | WARN | `generated/page-state-coverage.json` |
| `check-layout-grammar.ts` | `layout-grammar-coverage` | WARN | `generated/layout-grammar-coverage.json` |
| `check-accessibility-baseline.ts` | `accessibility-baseline` | WARN | `generated/accessibility-closure.json` |
| `check-mobile-adaptive-coverage.ts` | `mobile-adaptive-coverage` | WARN | `generated/mobile-adaptive-coverage.json` |
| `check-page-performance-budgets.ts` | `page-performance-budget` | WARN | `generated/page-performance-budget-report.json` |

### PART 7 — No-Duplication Enforcement

- Component canonical map becomes the single source of truth for "what family does this component belong to"
- Primitive deprecation registry lists all 7 MIGRATING families from duplication-map with explicit enforcement paths
- `check-component-canonicalization.ts` BLOCK gate prevents introduction of new undeclared component families
- Existing `check-duplicate-families.ts` continues to enforce name-collision governance
- No new primitive families created — all referenced primitives already exist in `src/components/primitives/`

### PART 8 — Implementation Phases

**Phase A** (Core registries): Create component-canonical-map, component-family-taxonomy, primitive-deprecation-registry (3 files)

**Phase B** (Layout/shell): Create layout-grammar-map, page-shell-compliance-map (2 files)

**Phase C** (Policies): Extend truth-surface-registry, create accessibility-baseline, mobile-adaptive-policy, page-performance-budget (4 files)

**Phase D** (Validators): Replace check-component-canonicalization stub, create 6 new validators (7 files)

**Phase E** (Proof + gates): Generate frontend-closure-bundle.json, register gates in release aggregator

**Phase F** (Verification): `npx tsc --noEmit` — zero errors, verify no duplicate frontend systems

### PART 9 — Deployment Closure Checklist

- [ ] `component-canonical-map.ts` with ~25 families, canonical paths, deprecated paths
- [ ] `component-family-taxonomy.ts` with classification + grammar roles
- [ ] `primitive-deprecation-registry.ts` with 7+ deprecated families and enforcement levels
- [ ] `layout-grammar-map.ts` with 10 canonical layout patterns
- [ ] `page-shell-compliance-map.ts` with ~30 route prefix mappings
- [ ] `truth-surface-registry.ts` expanded to ~20 entries with requiredPrimitives
- [ ] `accessibility-baseline.ts` with per-page-class requirements
- [ ] `mobile-adaptive-policy.ts` with breakpoints, touch targets, collapse rules
- [ ] `page-performance-budget.ts` with per-class budgets
- [ ] 7 validator scripts in `scripts/frontend/`
- [ ] 8 generated proof artifacts
- [ ] `component-canonicalization` registered as BLOCK gate
- [ ] 6 WARN gates registered
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate frontend architecture systems

