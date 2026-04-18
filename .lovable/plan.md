
## Plan: Deployment Gap Closure & Hidden Risk Remediation

### Strategy
The codebase already has the **canonical systems** for every claimed gap (install flow, autosave hook, file picker provider, global search hook, AI usage ledger, connector token refresh worker, IndexedDB offline cache, manifest/DB truth registries). The real gaps are **adoption coverage**, **provider-specific implementations**, and **truth classification** — not foundational rebuilds. Per the original prompt's rules: do NOT replace mock with mock, do NOT rebuild what exists, do NOT damage wiring. Audit-first, then targeted fixes, then truth-classify the rest, then guardrail.

### Phase K — Evidence Maps (read-only, no code changes)
Create `scripts/architecture/audits/generate-deployment-gap-evidence.ts` emitting 12 JSON maps + 14 Markdown reports under `generated/deployment-gap-closure/`. Each map cross-references real implementation against canonical systems:

| Map | What it proves |
|---|---|
| `app-install-truth-map.json` | All `installed_apps` consumers; install/uninstall/update edge function call sites; launcher sync; profile awareness |
| `file-picker-adoption-map.json` | Every `<input type="file">` and ad-hoc file dialog vs `useFilePicker` adoption |
| `autosave-adoption-map.json` | All editable surfaces (forms, editors, composers) vs `useDraftAutosave` adoption |
| `window-snap-adoption-map.json` | All `AppWindow` mounts vs snap-zone integration |
| `mobile-offline-truth-map.json` | Confirms mobile is archived (Ubuntu-native canonical); web offline = IndexedDB; classifies honestly |
| `search-wiring-map.json` | All shells vs `useGlobalSearch` integration; result source coverage |
| `ai-cost-metering-map.json` | All `ai-gateway` invocations vs ledger writes; capability/feature coverage |
| `connector-oauth-rotation-map.json` | Per-provider refresh implementation status (stub vs real) |
| `frontend-backend-substrate-matrix.json` | Each major user action → edge function/DB table/local substrate owner |
| `db-truth-closure-map.json` | Builds on existing `db-truth-registry`: feature→table→RLS→tenancy→migration ownership |
| `manifest-truth-closure-map.json` | All 70+ generated artifacts: owner/generator/validator/CI gate/freshness |
| `supportability-coverage-map.json` | Runbook↔alert linkage, golden-path coverage, diagnostic bundle completeness |

**Deliverable:** All 14 required `.md` reports + 12 `.json` maps. Zero code changes.

### Phase L — 12 New Guardrail Checks (warn-level first, baselined)
Under `scripts/architecture/checks/`:

```
check-app-store-install-flow.ts
check-file-picker-adoption.ts
check-autosave-adoption.ts
check-window-snap-integration.ts
check-mobile-offline-persistence.ts
check-search-source-coverage.ts
check-ai-cost-metering.ts
check-connector-oauth-hardening.ts
check-frontend-backend-substrate-map.ts
check-db-truth-completeness.ts
check-manifest-truth-completeness.ts
check-supportability-coverage.ts
```
All start warn-level with budgets baselined from Phase K evidence. No build break on first run.

### Phase M — Targeted Real Fixes (only what evidence proves fixable)

**M1 — App Store install flow (already real):** Phase K will likely show this is already production-grade. If gaps exist, add: `app-install-receipts` table writes confirmation, `installed_apps_status_history` for audit trail, launcher real-time refresh on install. **No rebuild.**

**M2 — File picker adoption:** Migrate the top ~10 highest-traffic `<input type="file">` sites identified in Phase K to `useFilePicker`. Leave intentional fallbacks (e.g., low-level upload streams) and document in adoption map.

**M3 — Autosave adoption:** Wire `useDraftAutosave` into the top ~10 highest-value editable surfaces (invoice forms, message composers, settings panels, app config editors). Upgrade hook persistence from localStorage → IndexedDB via existing `offline-db.ts` for durability.

**M4 — Window snap:** Already implemented in `WindowContext.snapWindow`. Add visible snap-guide overlay component (`SnapGuideOverlay.tsx`) consumed by `AppWindow` during drag. Truth-classify any non-snappable surfaces.

**M5 — Mobile offline:** Already correct. Mobile platform is **archived** (Ubuntu-native canonical per memory `features/platform-runtimes`). Truth-classify in evidence map; no code change needed beyond honest labeling.

**M6 — Search wiring:** Audit shows `UniversalCommandSurface` + `SearchPage` already consume `useGlobalSearch`. Add missing app-shell integrations identified in Phase K (likely Files, Communications shells).

**M7 — AI cost metering:** Already real via `ai_usage_ledger` + `ai_invocations`. Add: missing capability instrumentation found in Phase K, admin spend rollup view (if not present), and `ai_cost_alerts` threshold triggers.

**M8 — Connector OAuth rotation:** Current `connector-token-refresh` worker is honestly stubbed (no provider impl). Implement **real Google OAuth refresh** (only provider with active wiring per `provider-family-operations`). Other providers: register in `connector-oauth-provider-registry.ts` with `status: 'manual'` truth label.

**M9 — DB truth:** Run existing `db-truth-registry` validators; emit `DB_TRUTH_CLOSURE.md` with feature↔table↔RLS↔tenancy↔migration matrix.

**M10 — Manifest truth:** Use existing `manifest-registry.ts`; add freshness check + orphan detector.

**M11 — Supportability:** Use existing runbook registry; add alert↔runbook link validator + missing-link report.

### Phase N — Truth Classification (where M cannot fully close)
For every gap M does not fully resolve, write to `generated/deployment-gap-closure/truth-classifications.json`:
- Gap, current status, why-not-fixed-now, classification (`partial` | `deferred` | `archived`), surface labels required
- Update `mobile-feature-truth-registry.ts`, `launch-honesty.service.ts`, admin truth boards accordingly
- No silent downgrades

### Phase O — Verification, Aggregator Wiring, Graduation
1. Run all 12 new checks + existing 36 master gates + `tsc --noEmit`
2. Add `run-all-deployment-gap-gates.ts` orchestrator (mirrors `run-all-profile-runtime-gates.ts` pattern)
3. Add 13 entries to `check-os-release-readiness.ts REQUIRED_GATES` (12 gates + 1 orchestrator)
4. Graduate to **block-level** any check that resolves cleanly to zero
5. Emit `FINAL_DEPLOYMENT_CLOSURE_STATUS.md` + `final-deployment-closure-status.json` + `PHASE_K_O_DEPLOYMENT_CERTIFICATE.md`

### Phase P — Seal & Sign (extend existing attestation)
1. Re-seal hardening baseline to include new evidence files (already-existing `seal-profile-runtime-baseline.ts`)
2. Re-sign attestation (already-existing `sign-profile-runtime-attestation.ts`)
3. Add 4 new npm scripts: `gap-closure:evidence`, `gap-closure:gates`, `gap-closure:verify`, `gap-closure:reseal`
4. Operator runbook addendum for new failure modes

### Final State
- 49 master release gates GREEN (36 existing + 12 new + 1 orchestrator)
- All 14 required `.md` deliverables emitted with real evidence
- 12 new validation scripts integrated and baselined
- Real fixes applied where Phase K proves feasible; honest truth-classification elsewhere
- Sealed + signed baseline extended to cover new surface
- `deployable=true` maintained, materially closer to true 100% deployment readiness

### Explicitly will NOT do
- ❌ Rebuild App Store install flow (already real per migrations + edge functions)
- ❌ Replace `offline-db.ts` IndexedDB layer (already correct, mobile archived)
- ❌ Build new search/picker/autosave systems (canonical ones exist)
- ❌ Promote new checks to block-level on first run
- ❌ Implement fake provider OAuth refresh (Google real, others labeled `manual`)
- ❌ Touch `src/integrations/supabase/{client,types}.ts` or `.env`
- ❌ Mark anything "production-ready" without code-level proof in Phase K

### Ship order
```
K (evidence, ~5 min, additive) →
L (12 guardrails warn-level, ~5 min, additive) →
M (targeted real fixes — scope = K evidence only) →
N (truth-classify residuals) →
O (verify + graduate stable checks + aggregator wire) →
P (re-seal + re-sign + npm scripts + runbook)
```
After approval I execute K → P in a single wave.
