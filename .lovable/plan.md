

## Audit verdict — what is real vs missing

**Already complete (preserve, do not touch):**
- 7 truth panels mounted on AI Engineer hub (`AIRuntimeHome.tsx` lines 30-36, 148)
- Canonical `runtime-host-adapter.ts` + 4 hooks refactored + `portability-boundary-model.ts` (137 lines, classifications live)
- 178 validators in `scripts/validation/`, 181 BLOCK gates in `check-os-release-readiness.ts`
- `supabase/functions/_shared/logger.ts` (`EdgeLogger` class — real, queryable, correlation-id capable) — adopted by **30 of 173 edge functions** (17%)
- Security & Portability closure: 19 deliverables in `generated/security-and-portability-closure/` GREEN

**Gaps the prompt actually targets (real, not hypothetical):**

| Gap | Evidence | Real work |
|---|---|---|
| 11 hooks in `src/hooks/` use `window.*` directly but **only 3 are classified** in `portability-boundary-model.ts` (`use-mobile`, `useReducedMotion`, `useWindowSnap`) | grep result above | 8 hooks need classification (most are legitimate leaf-browser-only — `use-online-status`, `use-realtime-notifications`, `use-unified-ws`, `useGlobalShortcuts`, `useOSRuntime`, `useOfflineStore`, `useWallpaperParallax`, `use-gesture-engine`) |
| 143 of 173 edge functions do **not** import the canonical `_shared/logger.ts` | `grep -l` count above | Standardize the ~50 that have meaningful business logic; the rest (CRUD/passthrough) get an honest classification |
| **0 cleanup deliverables** exist (`generated/architectural-cleanup/` does not exist) | `ls` returned nothing | Create all 16 mandatory deliverables |
| **0 cleanup validators** exist | `ls scripts/validation` | 5 new BLOCK validators required by Part 4 Phase G2 |
| Prior **Economic-Trust-Future closure was abandoned mid-flight** — DB tables, runtime enforcement, microcopy, and registry edits exist but `generated/economic-trust-and-future-closure/` was never created and the truth panel was never mounted | `ls` returned nothing for that directory | Out of scope for THIS prompt — flag as known carryover |

**Scope rule (per user):** All NEW UI lives ONLY on `AIRuntimeHome.tsx` as **1 new tab**. Validators in `scripts/validation/`. Evidence in `generated/architectural-cleanup/`. **Zero edits to other admin domains.**

---

## Phase 1 — Cleanup inventory + dependency map (zero code changes; pure audit)

**1A.** Run real grep/import-graph audits, write 3 audits backed by live file scans:
- `ARCHITECTURAL_CLEANUP_INVENTORY.md` — categorize every cleanup candidate (obsolete scripts, duplicate docs, browser-trapped hooks, unstructured edge fns, stale generated artifacts)
- `CLEANUP_DEPENDENCY_MAP.md` — for each candidate: import refs, route refs, workflow refs, generator refs (computed via `grep -r`)
- `FILE_REMOVAL_SAFETY_POLICY.md` — codified 9-check policy; nothing gets removed without all 9 green

**Output:** evidence-only, zero file deletions in this phase.

---

## Phase 2 — Portability boundary completion (8 hook classifications)

**2A.** Audit + classify the 8 unclassified hooks using `window.*`:
- `BROWSER_GLOBAL_ASSUMPTION_AUDIT.md` — for each of 8 hooks, classify as `leaf-browser-only` (most), `adapter-routed` (if cross-tier), or `shell-specific`
- `RUNTIME_HOST_BOUNDARY_CLEANUP_PLAN.md` — show that **no new adapter methods are needed** (audit will confirm — these are notification/realtime/offline browser-leaf primitives) OR list exact methods to add

**2B.** Extend `src/runtimes/portability-boundary-model.ts` with the 8 missing classifications. **No hook refactors** unless audit proves a portable hook is browser-trapped (expectation: zero refactors needed; all 8 are legit leaf-browser primitives).

---

## Phase 3 — Edge-function structured logging extension

**3A.** Audit:
- `EDGE_FUNCTION_LOGGING_AUDIT.md` — classify all 173 edge fns into:
  - `canonical-compliant` (30 already use `_shared/logger.ts`)
  - `needs-standardization` (high-value business logic without structured logs)
  - `passthrough-acceptable` (CRUD/proxy fns where minimal logs are fine — honestly labeled, not silently ignored)
- `EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN.md` — exact list of fns to refactor (target: ~30 highest-value handlers like `ai-gateway`, `agent-executor`, `admin-bff-gateway`, `app-install`, etc.)

**3B.** Refactor the identified ~30 fns to import `EdgeLogger` and emit structured entries with: `fn`, `correlationId`, `event_type`, `severity`, `actor`, `result`, `latencyMs`, `failure_class`. Preserve existing behavior — additive only.

---

## Phase 4 — Truth-manifest reconciliation

**4A.** Audit every file in `generated/`:
- `TRUTH_MANIFEST_AUDIT.md` — flag duplicates (e.g. multiple plane-boundary reports, overlapping audit files), stale artifacts, files no consumer reads
- `TRUTH_MANIFEST_RECONCILIATION_PLAN.md` — for each conflict: name canonical source, list consumers to rewire, archive path for noncanonical

**4B.** Apply reconciliations: **only relabel/archive** in this pass (zero deletes). Update consumers to point at canonical sources.

---

## Phase 5 — Docs/scripts/workflows audit (audit-only)

**5A.** Two audits, no edits:
- `DOCUMENTATION_CLEANUP_AUDIT.md` — duplicate/stale/superseded markdowns in `docs/`
- `SCRIPT_AND_WORKFLOW_CLEANUP_AUDIT.md` — never-called scripts, redundant workflows

**5B.** **No removal in this pass** — produce evidence-only registers. The Part 7 safety rule "prove non-use before removal" requires a separate validated removal pass; this plan stops at proven-safe classification.

---

## Phase 6 — Five new BLOCK validators

All real (read live evidence; no stubs). Honest WARN-tier where evidence requires execution.

1. `check-no-browser-globals-in-portable-code.ts` — scans `src/hooks/`, `src/lib/services/` for `window./document./navigator.` and BLOCKs unless the file is in `PORTABILITY_CLASSIFICATIONS` as `leaf-browser-only`/`shell-specific`/`adapter-routed`
2. `check-edge-function-structured-logging.ts` — reads logging audit JSON; BLOCKs on regression (any fn classified `needs-standardization` that doesn't import `_shared/logger.ts`)
3. `check-no-duplicate-truth-manifests.ts` — reads reconciliation JSON; BLOCKs if any non-canonical artifact in `generated/` is referenced by a consumer
4. `check-no-stale-canonical-docs.ts` — reads docs audit JSON; BLOCKs on stale-canonical labeling regression
5. `check-safe-cleanup-regressions.ts` — meta-validator: aggregates the 4 above + verifies build-graph integrity

---

## Phase 7 — 16 deliverables in `generated/architectural-cleanup/`

Per Part 6 spec exactly:
- 12 markdowns: `ARCHITECTURAL_CLEANUP_INVENTORY`, `CLEANUP_DEPENDENCY_MAP`, `BROWSER_GLOBAL_ASSUMPTION_AUDIT`, `RUNTIME_HOST_BOUNDARY_CLEANUP_PLAN`, `EDGE_FUNCTION_LOGGING_AUDIT`, `EDGE_FUNCTION_LOGGING_STANDARDIZATION_PLAN`, `TRUTH_MANIFEST_AUDIT`, `TRUTH_MANIFEST_RECONCILIATION_PLAN`, `DOCUMENTATION_CLEANUP_AUDIT`, `SCRIPT_AND_WORKFLOW_CLEANUP_AUDIT`, `FILE_REMOVAL_SAFETY_POLICY`, `POST_CLEANUP_VERIFICATION_REPORT`
- 4 JSON status mates: `architectural-cleanup-status`, `portability-cleanup-status`, `logging-cleanup-status`, `architectural-cleanup-verification`

All audits backed by live file scans (real grep counts, real import graphs).

---

## Phase 8 — One new truth panel on AI Engineer hub (only place)

`src/components/admin/ai-runtime/ArchitecturalCleanupTruthPanel.tsx` — three sections:
- **Portability boundary status** — count of classified vs unclassified hooks, link to model
- **Edge-function logging coverage** — `30/173 → N/173` after refactor, list of standardized fns
- **Truth-manifest health** — duplicate/stale/canonical counts from JSON status

Mount as 8th tab in `AIRuntimeHome.tsx` after `SecurityAndPortabilityTruthPanel`. **Zero other admin pages touched.**

---

## Phase 9 — Wire 5 new BLOCK gates + npm scripts

**9A.** `check-os-release-readiness.ts` — append `"no-browser-globals-in-portable-code"`, `"edge-function-structured-logging"`, `"no-duplicate-truth-manifests"`, `"no-stale-canonical-docs"`, `"safe-cleanup-regressions"` (181 → **186 BLOCK gates**)

**9B.** `package.json`:
- `closure:architectural-cleanup:emit` (runs cleanup emitters)
- `closure:architectural-cleanup:run-all` (runs 5 validators)
- Update `final:closure:run-all` to include new closure

---

## Honest limits surfaced (no fake green)

- Phase 5 audits docs/scripts but **does not delete anything** — actual removal would require a separate validated pass per the prompt's own safety rules. Honestly labeled `audit-only-pass-1`.
- Phase 4 reconciliation is **archive/relabel only** — no `generated/` files deleted.
- Edge-function refactor scope is **~30 high-value fns**, not all 173 — the rest get honest `passthrough-acceptable` classification rather than fake-green coverage.

---

## Files touched (final summary)

- **NEW (22):** 12 markdown audits + 4 JSON status files + 5 validators + 1 truth panel UI
- **EDITED (4):** `portability-boundary-model.ts` (+8 classifications), `AIRuntimeHome.tsx` (+1 tab), `check-os-release-readiness.ts` (+5 gates), `package.json` (+2 scripts)
- **REFACTORED (~30):** edge functions to use `_shared/logger.ts` (additive, behavior-preserving)
- **ZERO edits to:** other admin domains, security/portability/mobile closures, sealed migrations, archive/* directories

After this pass: 186 BLOCK gates, 8 truth panels on AI Engineer hub, full portability classification of all 11 window-touching hooks, ~60/173 edge fns on canonical structured logging (up from 30), 16 cleanup deliverables, zero deletions (cleanup proven-safe register only). Honest WARN-tier preserved everywhere evidence requires execution.

