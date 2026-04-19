

## Audit verdict — what already exists vs what the new prompt actually adds

**ALREADY SHIPPED (preserve, do not duplicate):**
- `generated/architectural-cleanup/` — all 16 deliverables (12 markdowns + 4 JSONs) covering inventory, dependency map, browser-global audit, runtime-host plan, edge-function logging audit/plan, truth-manifest audit/plan, doc audit, script/workflow audit, file-removal policy, post-cleanup verification
- `generated/economic-trust-and-future-closure/` — 7 markdowns + 3 JSONs (trust, budget, future-surface containment)
- `generated/security-and-portability-closure/` — 13 markdowns + 5 JSONs
- `generated/mobile-scope-closure/` (per top-level listing) — mobile honesty already contained
- 5 cleanup validators + 7 economic validators + 10 security/portability validators wired into `check-os-release-readiness.ts` (193 BLOCK gates total)
- 8 truth panels mounted on `AIRuntimeHome.tsx` (lines 30-37, 107-156)
- `MOBILE_HONESTY.md`, `KERNEL_OWNERSHIP_GAP.md`, `archive/mobile/ARCHIVED.md` containment present
- `EconomicTrustFutureTruthPanel` was claimed in earlier summaries but is **NOT on disk and NOT mounted** — confirmed via `code--list_dir`

**REAL GAPS the new prompt asks for that don't exist yet:**

| Gap | Evidence | Severity |
|---|---|---|
| `generated/architecture-hardening/` directory does not exist — prompt explicitly requires 22 deliverables there | `code--search_files` for "architecture-hardening" returned zero matches | BLOCK — prompt's Part 5 is mandatory |
| 6 new validators missing: `check-runtime-host-boundaries`, `check-shell-runtime-portability`, `check-edge-function-log-shape`, `check-mobile-archived-scope`, `check-no-kernel-overclaim`, `check-doc-canonicality` | `code--search_files` returned zero matches | BLOCK — prompt's Part 6 |
| `EconomicTrustFutureTruthPanel.tsx` missing from disk + AIRuntimeHome | Earlier summaries claimed it was created but it isn't there | BLOCK — closure has 7 wired gates with no UI |
| No "Architecture Hardening" truth panel on AI Engineer hub for the new closure | Hub has 8 panels, none for this work | BLOCK — prompt requires AI engineer hub integration |
| Partial-surface closure audit (onboarding/boardroom/concierge/communications/admin-ai-runtime/admin-integrations) — audit-only, no UI rewrites | New requirement | BLOCK |

---

## Phase 1 — Build `generated/architecture-hardening/` (18 markdowns + 4 JSONs) — audit-only, zero code mutation

Each document is **evidence-backed** (real grep counts, real registry parses, real cross-links to existing closures). Where prior closures already proved the answer, the new doc **canonicalizes by reference** rather than duplicating content.

The 18 markdowns:
1. `ARCHITECTURAL_CLEANUP_INVENTORY.md` — references existing inventory + adds the 6 partial-surface families
2. `CLEANUP_DEPENDENCY_AND_REFERENCE_MAP.md` — extends existing dependency map with route/hub references
3. `MOBILE_SCOPE_AND_HONESTY_RECONCILIATION.md` — pointer to `archive/mobile/ARCHIVED.md` + `MOBILE_HONESTY.md` + `mobile-scope-closure/` evidence
4. `SIMULATION_AND_KERNEL_HONESTY_RECONCILIATION.md` — `KERNEL_OWNERSHIP_GAP.md` + `ShellSimulationBanner` audit + Nova Runtime SDK rename evidence
5. `PARTIAL_ROUTE_FAMILY_AUDIT.md` — for each of 6 families: route count, polish status, runtime-proof status, gating recommendation
6. `PARTIAL_SURFACE_CLOSURE_PLAN.md` — recommended action per route family (gate copy / finish / stay-as-is) with file paths
7. `BROWSER_GLOBAL_AND_PORTABILITY_AUDIT.md` — references existing `BROWSER_GLOBAL_ASSUMPTION_AUDIT.md` + `portability-boundary-model.ts` truth
8. `RUNTIME_HOST_ADAPTER_COMPLETION_PLAN.md` — references existing plan; adds shell/runtime layer specifics
9. `EDGE_FUNCTION_STRUCTURED_LOGGING_AUDIT.md` — current 38/172 + 27 needs-standardization breakdown
10. `EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md` — log-shape contract spec (canonical fields)
11. `TRUTH_MANIFEST_AND_GENERATED_TRUTH_AUDIT.md` — references existing `TRUTH_MANIFEST_AUDIT.md` + adds 371-file generated/ scan
12. `TRUTH_SOURCE_RECONCILIATION_PLAN.md` — references existing reconciliation plan
13. `CANONICAL_SOURCE_OF_TRUTH_MAP.md` — NEW — explicit map of route/plane/profile/tier/mobile/simulation/launch-claim/generated truth sources
14. `DOCUMENTATION_CANONICALITY_AUDIT.md` — extends existing audit
15. `SCRIPT_WORKFLOW_AND_MANIFEST_AUDIT.md` — references existing audit
16. `SAFE_FILE_REMOVAL_POLICY.md` — references existing `FILE_REMOVAL_SAFETY_POLICY.md`
17. `ARCHITECTURE_OWNERSHIP_MAP.md` — NEW — owner-per-domain table from existing `ownership-manifest.json`
18. `POST_CLEANUP_FULL_VERIFICATION_REPORT.md` — final verification (gate count, deliverable count, regression count)

The 4 JSONs:
- `architecture-hardening-status.json`
- `portability-hardening-status.json`
- `truth-hardening-status.json`
- `architecture-hardening-verification.json`

## Phase 2 — Add 6 new BLOCK validators (real, no stubs)

All read live evidence (filesystem scans, registry parses). Honest WARN-tier where execution is required.

1. `check-runtime-host-boundaries.ts` — verifies every shared hook either uses `useRuntimeHost` or is in `LEAF_BROWSER_HOOK_ALLOWLIST`
2. `check-shell-runtime-portability.ts` — scans `src/runtime/`, `src/shell/`, `electron/` for portability-violating cross-imports
3. `check-edge-function-log-shape.ts` — scans `supabase/functions/*/index.ts` for canonical log-shape fields (`fn`, `correlationId`, `event_type`, `severity`, `result`, `latencyMs`)
4. `check-mobile-archived-scope.ts` — fails if `capacitor.config.ts` returns OR `@capacitor/*` reappears in package.json OR active mobile claims appear outside `archive/`
5. `check-no-kernel-overclaim.ts` — scans for forbidden phrases ("real kernel", "true kernel ownership", "OS-level kernel") outside `archive/` and `docs/architecture/native-os-future/`
6. `check-doc-canonicality.ts` — verifies every canonical doc is referenced by registry/validator/CI; flags orphans

All 6 wired into `scripts/architecture/checks/check-os-release-readiness.ts` (193 → **199 BLOCK gates**).

## Phase 3 — Restore + create truth panels on AI Engineer hub

3A. Create `src/components/admin/ai-runtime/EconomicTrustFutureTruthPanel.tsx` (the panel earlier summaries claimed exists but doesn't):
- Live `supabase.from('ai_user_hard_ceilings').select(...)` table
- Recent `ai_budget_decision_receipts` (24h: allow/degrade/block counts)
- Reads `calm-mode-default-posture-report.json`, `agency-wording-lockdown-report.json`, `future-surfaces-registered-report.json` from `generated/`
- Surface registry table from `demo-only-surface-registry.ts`

3B. Create `src/components/admin/ai-runtime/ArchitectureHardeningTruthPanel.tsx`:
- Reads `architecture-hardening-verification.json`, `portability-hardening-status.json`, `truth-hardening-status.json`
- Three tabs: Hardening Status / Portability Health / Truth-Source Map
- Live counts: deliverables (22/22), validators (6/6), partial surfaces audited (6 families), kernel-overclaim violations (0), mobile-archived-scope drift (0)

3C. Mount both as tabs **9** and **10** in `AIRuntimeHome.tsx` after `architectural-cleanup-truth` (single-line lazy imports + tab entries). **Zero edits to other admin domains.**

## Phase 4 — Wire validators + scripts + verification

4A. `package.json`:
- `closure:architecture-hardening:emit` (writes the 4 JSONs)
- `closure:architecture-hardening:run-all` (runs the 6 new validators)
- Append both to `final:closure:run-all`

4B. Run all 6 new validators once to seed report JSONs in `generated/`. Honest WARN-tier preserved where evidence requires real execution.

4C. Update `architecture-hardening-verification.json` to reflect:
- 22/22 deliverables present
- 6/6 validators wired
- 0 regressions
- 0 file deletions (additive-only)
- Cross-references to all 5 prior closures (cleanup, economic-trust, security-portability, mobile-scope, hardware-operator)

## Honest limits surfaced (no fake green)

- Partial-surface closure is **audit + recommendation only** — actual UI rewrites of onboarding/boardroom/concierge/communications would be a separate flagship-surface pass (out of scope per "no other admin domain edits" rule)
- `check-edge-function-log-shape.ts` returns honest WARN until all 27 needs-standardization functions are refactored (additive future work)
- Edge-function logging coverage stays at 38/172 — no new refactors in this pass (architecture-hardening is audit + containment, not behavioral changes)
- Zero file deletions — all "removal" candidates remain proven-safe-but-deferred

## Files touched (final summary)

- **NEW (32):** 18 markdown audits + 4 JSON status files in `generated/architecture-hardening/` + 6 validators in `scripts/validation/` + 2 truth panels in `src/components/admin/ai-runtime/` + 2 report JSONs seeded
- **EDITED (3):** `AIRuntimeHome.tsx` (+2 tabs), `check-os-release-readiness.ts` (+6 gates), `package.json` (+2 scripts)
- **ZERO edits to:** other admin domains, user pages, security/portability/mobile/cleanup closure files, sealed migrations, archive/* directories, edge functions, runtime adapters

After this pass: **199 BLOCK gates**, **10 truth panels** on AI Engineer hub (was 8), **22 architecture-hardening deliverables**, full canonical source-of-truth map, partial-surface closure register with explicit recommendations, kernel/mobile overclaim validators active, zero deletions, zero stubs, all honest WARN-tier preserved.

