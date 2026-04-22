

# SITA OS — Repository-Wide Hardening Plan (8 Phases)

This plan covers a full file-by-file audit and implementation pass across the entire repository, executed in safe phases with validation between each.

---

## Phase 0: Global Discovery and Safety Map

**Goal**: Build a complete map of canonical systems, duplicates, stale files, and consumer graphs before making any destructive changes.

**Actions**:
1. Scan all barrel exports (`index.ts`) across `src/lib/`, `src/features/`, `src/platform/`, `src/components/` to map canonical entry points and detect bypass imports.
2. Build a consumer graph for the 228 services in `src/lib/services/` — identify which are actually imported by pages/components vs orphaned.
3. Audit all 1,092 page files for: stub pages (< 30 lines of real content), dead routes (not referenced in any route file), and broken CTA handlers.
4. Map the 850 generated artifacts — classify by age, consumer count, and whether they are referenced by any code or CI.
5. Identify all `as any` violations (28 found in `src/pages/`) and classify the fix type for each.
6. Produce `generated/phase0-discovery-map.json` with classifications: KEEP, MODIFY, MOVE, MERGE, DELETE, ADD_GOVERNANCE for every major file family.

**Validation**: Discovery map reviewed before proceeding. No files changed.

---

## Phase 1: Root / Tooling / Manifest / Deployment Hardening

**Goal**: Fix root configs, eliminate lockfile ambiguity, harden build tooling.

**Actions**:
1. **Lockfile consolidation**: Delete `bun.lockb` (binary duplicate of `bun.lock`). Delete `deno.lock` (only used by remotion workspace, not root). Add both to `.gitignore`. Standardize on `bun.lock` as the canonical lockfile. Keep `package-lock.json` only if CI uses npm (CI currently uses `npm ci`).
2. **package.json cleanup**: Rename from `vite_react_shadcn_ts` to `sita-os`. Add missing `ci` script that chains `typecheck && lint && test && build`. Add `clean:generated` script with retention policy (keep last 7 days of generated artifacts).
3. **tsconfig audit**: Verify `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` are non-overlapping. Ensure `scripts/tsconfig.json` path aliases resolve correctly.
4. **env contract**: Audit `.env.example` vs `.env.production.example` — merge into single `.env.example` with required/optional annotations. Add missing env vars to `src/lib/env-validation.ts`.
5. **Generated artifact retention**: Create `scripts/clean-generated.sh` that prunes generated JSON/MD files older than 30 days. Wire to `clean:generated` script. Add `generated/**/*.json` age-based `.gitignore` pattern commentary.
6. **Stale wave docs**: Move `docs/waves/WAVE*.md` to `docs/archive/waves/`. They are historical planning artifacts, not active documentation.
7. **Docker hardening**: Add `HEALTHCHECK` and non-root `USER` to root `Dockerfile` if missing. Verify `deploy/Dockerfile.api` and `deploy/Dockerfile.brain` have both.

**Validation**: `npm run typecheck && npm run build` pass. Lockfile is singular. CI script exists.

---

## Phase 2: GitHub / CI / Release / Workflow Hardening

**Goal**: Consolidate CI workflows, fix permissions, add artifact retention.

**Actions**:
1. **Workflow audit**: 21 workflows exist. Identify duplicates between `deploy.yml`, `deploy-backend.yml`, `deploy-frontend.yml`. Consolidate deploy workflows into a single `deploy.yml` with matrix strategy or job conditions.
2. **Artifact retention**: Add `retention-days: 14` to all `actions/upload-artifact@v4` steps across workflows.
3. **Permissions tightening**: Ensure all workflows have minimal `permissions:` blocks (not relying on defaults).
4. **Stale workflow cleanup**: `mobile-build.yml` and `native-readiness.yml` reference archived mobile/native code. Mark with `if: false` or add clear "DEFERRED — no native target" comments rather than deleting (preserves intent).
5. **CODEOWNERS verification**: Current file is comprehensive. Verify no new directories (e.g., `src/shell-runtime/`, `src/planes/`, `src/domains/`) are missing ownership entries.
6. **Release gates**: Verify `release-gates.yml` chains typecheck, lint, test, build, and architecture validation before allowing release.

**Validation**: All workflow YAML passes `actionlint` or manual syntax check. No dead workflow references.

---

## Phase 3: Archive / .lovable / Historical Cleanup

**Goal**: Remove stale residue, govern archive, clean historical artifacts.

**Actions**:
1. **Archive cleanup**:
   - `archive/capacitor/capacitor.config.ts` — single file, DELETE (Capacitor is fully archived per `docs/PLATFORM_SCOPE.md`).
   - `archive/mobile/android/`, `archive/mobile/ios/` — DELETE contents, keep `archive/mobile/ARCHIVED.md` as tombstone.
   - `archive/mobile/store-metadata/` — KEEP (may contain brand assets).
   - `archive/mobile/icons/` — KEEP (brand assets).
   - `archive/infra/` — audit contents, DELETE if superseded by `infra/` and `deploy/`.
2. **`.lovable/` governance**: Memory files are managed by the system. Verify `index.md` references are not stale. No structural changes needed.
3. **Remotion isolation**: `remotion/` is a separate workspace with its own `bun.lock`. Add `remotion/` to root `.gitignore` comment as "separate workspace" for clarity. Verify no root imports reach into `remotion/`.
4. **Backups directory**: `backups/` should be in `.gitignore`. Add if missing.

**Validation**: Archive contains only governed tombstones and brand assets. No dead native template code.

---

## Phase 4: Feature / Route / Page / Component Canonicalization

**Goal**: Fix the 1,092-page sprawl, remove dead stubs, fix `as any` violations, ensure route-page alignment.

**Actions**:
1. **Dead page detection**: Cross-reference all files in `src/pages/` against route files in `src/routes/`. Any page not imported by any route file is classified as orphan. Produce `generated/orphan-pages-report.json`.
2. **Stub page audit**: Scan pages under 40 lines that only render a `PageShell` with placeholder text. Classify as:
   - **Wire up**: If the feature exists elsewhere and the page just needs real data.
   - **Delete**: If the page has no backing feature, no route, and no consumer.
   - **Defer honestly**: Add a "Coming Soon" state with proper UX if the feature is planned but not built.
3. **`as any` elimination**: Fix all 28 `as any` occurrences in `src/pages/`:
   - For Supabase `.from()` calls: use proper table types from generated types.
   - For `.data as any`: add proper type guards or generic parameters.
   - For edge function invokes: type the response properly.
4. **Context deduplication verification**: `ThemeContext.tsx` and `DisplayModeContext.tsx` are already re-export shims. Verify no direct imports of these shims exist outside of `AppearanceContext` — if consumers all import from `AppearanceContext` directly, delete the shim files and update remaining imports.
5. **Feature barrel governance**: Verify all `src/features/*/index.ts` barrels export only public API. Check for bypass imports (importing from `src/features/*/internal/` directly).
6. **Shell/App alignment**: Verify all pages use `PageShell` or equivalent layout wrapper consistently. Flag pages that render raw content without shell integration.

**Validation**: 0 `as any` in `src/pages/`. All routed pages have backing implementations. Orphan report generated.

---

## Phase 5: Services / Backend / Integration / Data Hardening

**Goal**: Reduce 228-service sprawl, standardize service patterns, harden deploy services.

**Actions**:
1. **Service consumer audit**: Scan imports across `src/` to find services in `src/lib/services/` with zero consumers. Produce `generated/unused-services-report.json`.
2. **Service consolidation plan**: Group the 228 services by domain. Identify services that should be merged (e.g., `boardroom-bridge.ts` + `boardroom-service/` + `board-api-client.ts`). Create consolidation tickets in the report but only merge services with clear single-consumer or identical-purpose patterns in this phase.
3. **Service facade validation**: Verify `src/services/index.ts` re-exports the canonical service API. Ensure `src/lib/service-facade.ts` is consistent with it. If both exist, merge into one canonical facade.
4. **Deploy service hardening**:
   - `deploy/api-gateway/`: Verify `server.ts` exists with health/ready endpoints. Add `test` script if missing.
   - `deploy/brain-core/`: Same verification. Add `test` script if missing.
   - Both: Add `Dockerfile` reference validation (ensure `deploy/Dockerfile.api` and `deploy/Dockerfile.brain` reference correct entry points).
5. **Edge function governance**: Verify all functions in `supabase/functions/` have corresponding CODEOWNERS entries. Flag any uncovered functions.
6. **Supabase migration governance**: Verify migrations are sequential and no gaps exist in numbering.

**Validation**: Unused services report generated. Deploy services have complete scripts. Edge functions have ownership.

---

## Phase 6: AI / Advisor / Boardroom / Proof / Supportability Closure

**Goal**: Ensure AI systems degrade honestly, proof chains are complete, support surfaces work.

**Actions**:
1. **AI gateway verification**: Confirm all AI calls go through `src/lib/ai-gateway/` or `src/lib/sovereign-ai-gateway/`. Search for direct `openai`, `anthropic`, or other provider SDK imports outside the gateway. Flag violations.
2. **Advisor registry consistency**: Verify the 34 advisor identities in `src/lib/advisors/` match the database `advisor_registry` table. Flag mismatches.
3. **Proof chain audit**: Verify `src/lib/proof/` produces receipts that are consumed by admin/trust surfaces. Check that `ai_action_receipts` table is referenced by proof display pages.
4. **Support surface wiring**: Verify admin recovery tools (`src/pages/admin/support/`) connect to real Supabase operations (not demo data).
5. **Boardroom integration**: Verify boardroom pages fetch real data from edge functions or Supabase, not hardcoded mock data in production mode.
6. **Fallback/degraded states**: Verify AI-dependent pages show proper fallback UI when AI services are unavailable (error boundaries, loading states, empty states with explanation).

**Validation**: 0 direct AI provider imports outside gateway. Proof surfaces display real receipt data. Support tools are wired.

---

## Phase 7: Final Consolidation / Deletion / Validation

**Goal**: Delete safely migrated files, add governance validators, produce final readiness report.

**Actions**:
1. **Generated artifact pruning**: Run the retention script from Phase 1 to remove the 47 subdirectories of stale proof bundles. Keep only the latest version of each report type.
2. **Delete confirmed dead files**:
   - Orphan pages confirmed in Phase 4.
   - Unused services confirmed in Phase 5.
   - Archive residue confirmed in Phase 3.
3. **Add governance validators**:
   - `scripts/validators/check-no-as-any-pages.sh` — fails if `as any` appears in `src/pages/`.
   - `scripts/validators/check-orphan-pages.sh` — flags pages not referenced by route files.
   - `scripts/validators/check-service-consumers.sh` — flags services with zero imports.
   - Wire all three into `pre-deploy.sh`.
4. **Final build verification**: Run `typecheck`, `lint`, `build`, and all validators. Confirm 0 errors.
5. **Produce final report**: `generated/repository-hardening-report.json` with:
   - Files created, modified, moved, merged, deleted.
   - Remaining `as any` count (target: 0).
   - Orphan page count (target: 0 or honestly deferred).
   - Unused service count (target: 0 or documented).
   - Deployment readiness: PASS/FAIL per gate.

**Validation**: Full clean build. All validators pass. Report generated.

---

## Technical Details

### Key Metrics (Current State)
| Metric | Current | Target |
|--------|---------|--------|
| `as any` in pages | 28 | 0 |
| Lockfiles | 4 (bun.lock, bun.lockb, package-lock.json, deno.lock) | 1-2 |
| Generated artifacts | 850+ files, 14MB | Pruned to latest |
| Services in lib/services | 228 | Audited, unused flagged |
| Page files | 1,092 | Orphans removed or deferred |
| Dead onClick handlers | 0 | 0 (maintained) |
| isDemoMode leaks | 0 | 0 (maintained) |

### Execution Order
Each phase is implemented fully before the next begins. Each phase ends with a build verification (`tsc --noEmit && vite build`). No phase makes changes that break a prior phase's validation.

### Safety Rules
- Consumer search before any file deletion or move.
- Import updates are done atomically with file moves.
- No parallel canonical systems created.
- Working behavior preserved throughout.

