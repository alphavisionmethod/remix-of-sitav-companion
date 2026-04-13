

# SITA OS — Comprehensive Master Audit & Frontend Audit Update Plan

## Current State Summary

After deep inspection of the codebase, generated artifacts, database schema, security posture, and frontend architecture, here is the full picture:

**What is already passing:**
- TypeScript: 0 errors
- DB linter: 0 issues
- Profiles RLS: Fixed (authenticated-only)
- intelligence-api auth: Fixed (uses `getUser()`)
- health.json: Present
- 54 generated artifacts: All valid JSON
- 261 routes registered
- 131 services in manifest
- 55 edge functions deployed
- PWA manifest + icons present
- Realtime: notifications table published

**What needs fixing (13 issues across 4 categories):**

---

## Category 1: Generated Artifact Data Quality (5 issues)

### 1.1 architecture-compliance-report.json — 131 "undefined" orphan services
Every violation says `Service "undefined"` — the generator script is reading service entries without accessing the `.name` property. This means the compliance report is useless for debugging.

**Fix**: Update `scripts/architecture/check-architecture-compliance.ts` to properly read `service.name` from the manifest entries, then regenerate the artifact.

### 1.2 route-manifest.json — All 261 routes owned by "invoice-linking"
Every route has `"owner": "invoice-linking"` which is clearly wrong. The route manifest generator is defaulting to a hardcoded fallback owner.

**Fix**: Update the route manifest generator to derive owners from path prefixes (e.g. `/business/*` -> `business`, `/money/*` -> `finance`, `/concierge/*` -> `concierge`, `/admin/*` -> `platform-admin`).

### 1.3 operational-scorecards.json — All 131 services scored "fair" at 60
Every service has `hasServiceImplementation: false` and `hasEdgeFunction: false`. The scorer is not finding implementations because it checks for directories that don't exist in the expected paths.

**Fix**: Update the scorecard generator to look for actual service files in `src/lib/services/` and edge functions in `supabase/functions/`, then regenerate.

### 1.4 launch-tier-index.json — All 131 services classified as "ga"
Zero services at MVP or pilot tier. This means the tiering system is not applying any real classification logic.

**Fix**: Update the launch tier generator with real tier assignments based on domain criticality and implementation maturity.

### 1.5 maturity-thresholds.json — All 131 services at "scaffold" level
Every service is marked as having no implementation, no tests, no edge function, no RLS. The maturity checker is not scanning actual file existence.

**Fix**: Update the maturity checker to scan `src/lib/services/` for real implementations and `supabase/functions/` for edge functions, then regenerate.

---

## Category 2: Validation Summary Gaps (3 issues)

### 2.1 validation-summary.json — Missing new generated artifacts
The validation summary checks 36 files but there are actually 54 generated artifacts. 18 artifacts added later (like `boot-chain-manifest.json`, `kernel-architecture-manifest.json`, `syscall-manifest.json`) are not validated.

**Fix**: Update `check-generated-truth.ts` to include all 54 generated files.

### 2.2 check-final-delivery-conformance.ts — Only checks 9 artifacts
The delivery conformance check only validates 9 of the 54 required artifacts.

**Fix**: Expand the `REQUIRED_ARTIFACTS` list to cover all 54 generated artifacts.

### 2.3 master-dossier-plan.ts — VMware section still "in-progress", Accessibility still "planned"
The dossier plan has not been updated to reflect that accessibility-summary.json exists and is complete.

**Fix**: Update the statuses and add missing sections for kernel, boot-chain, rendering-pipeline, and security-model dossier sections.

---

## Category 3: Frontend Audit Gaps (3 issues)

### 3.1 Missing `visual-regression-baseline.json` real data
The file exists but likely contains placeholder data. It should reference actual screenshot baselines for critical routes.

**Fix**: Regenerate with real route screenshots or mark with honest "no-baseline-captured" status per route.

### 3.2 Missing frontend performance budget enforcement
`surface-performance-budget.json` exists but the Vite build does not enforce chunk size limits. The main bundle is 2.3 MB.

**Fix**: Add `build.chunkSizeWarningLimit` to `vite.config.ts` and add a post-build size check script that fails if any chunk exceeds 500 KB.

### 3.3 Missing error boundary coverage audit
Not all page-level routes have error boundaries wrapping them. The `RouteErrorBoundary` component exists but may not be applied universally.

**Fix**: Add a validation script that checks all route components are wrapped with error boundaries in the router config.

---

## Category 4: Security & Deployment (2 issues)

### 4.1 security-review-manifest.json — `_shared` folder scores 0/5
The shared module scores zero because it's not a standalone function, but it drags down the average score (88). This is a false negative.

**Fix**: Exclude `_shared` from the security review scoring since it's a utility module, not an endpoint.

### 4.2 Run and record a fresh security scan
The security scan results are empty (`{}`). Need to run a fresh scan and persist findings.

**Fix**: Run `security--run_security_scan`, then acknowledge/fix any findings.

---

## Implementation Steps (in order)

1. **Fix architecture-compliance-report generator** — fix the `undefined` service name bug, regenerate the artifact
2. **Fix route-manifest generator** — derive real owners from path prefixes, regenerate
3. **Fix operational-scorecards generator** — scan real file paths, regenerate
4. **Fix launch-tier-index generator** — apply real tier logic, regenerate
5. **Fix maturity-thresholds generator** — scan real implementations, regenerate
6. **Expand validation-summary check list** — add all 54 generated artifacts to `check-generated-truth.ts`
7. **Expand delivery conformance check** — add all 54 artifacts to `check-final-delivery-conformance.ts`
8. **Update master-dossier-plan** — fix statuses, add missing sections
9. **Fix security-review-manifest** — exclude `_shared` from scoring
10. **Add build size enforcement** — chunk size warning + post-build check script
11. **Run fresh security scan** — record and acknowledge findings
12. **Regenerate all 54 artifacts** with corrected generators
13. **Update `.lovable/plan.md`** — replace with comprehensive audit results showing all fixes applied

**Estimated scope**: ~13 files modified/created, ~600 lines changed. All changes are to scripts, generated artifacts, and config — no user-facing UI changes.

