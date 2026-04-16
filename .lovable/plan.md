
# SITA OS — Deployment Audit & Full Wiring Remediation Plan

## Scope

Two deliverables:
1. **DEPLOYMENT_AUDIT.md** — A comprehensive document mapping every folder and file in the project tree with classification, ownership, wiring status, and deployment readiness.
2. **Full wiring remediation** — Fix all remaining issues found during the audit.

## Project Structure Summary (Verified)

The project contains:
- **4,400+ source files** across 25+ top-level `src/` directories
- **74 edge functions** in `supabase/functions/`
- **140+ migrations** in `supabase/migrations/`
- **235+ scripts** across 17 `scripts/` domains
- **57 generated artifacts** in `generated/`
- **280+ admin pages** in `src/pages/admin/`
- **80+ user pages** in `src/pages/`
- **140+ hooks** in `src/hooks/`
- **22 contexts** in `src/contexts/`
- **14 route families** in `src/routes/`
- **6 Electron files** in `electron/`
- **9 CI workflows** in `.github/workflows/`
- **15 deploy artifacts** in `deploy/`
- **33 packages** in `src/packages/`
- **16+ canonical registries** across `src/lib/`
- **8 script registry files** in `scripts/registry/`
- **35 architecture docs** in `docs/architecture/`
- **9 refactor docs** in `docs/refactor/`

## Implementation Plan

### Phase 1: Generate DEPLOYMENT_AUDIT.md

Create a comprehensive `/generated/DEPLOYMENT_AUDIT.md` document (~2000 lines) containing:

**Section 1 — Root Configuration Files**
Every root file (package.json, Dockerfile, docker-compose.yml, vite.config.ts, tsconfig.json, etc.) with purpose and deployment role.

**Section 2 — Source Tree (`src/`)**
Full directory tree with file counts per directory, organized by architectural layer:
- Web/Public layer (pages, routes, layouts)
- App/User layer (features, hooks, contexts, components)
- OS/Services layer (nova-sdk, os-services, os-security, sync-engine)
- Admin/Operator layer (admin pages, admin components, admin routes)
- Kernel/Core layer (core-services, orchestration, persistence)
- Domain/Capability layer (domain-engines, capabilities, packages)
- Runtime truth layer (runtime, devices, surfaces, deployment, db registries)
- Platform layer (platform-plane, platform-law, control-plane)
- Intelligence layer (advisor-intelligence, strategic-intelligence, intelligence-architecture, boardroom, no-hallucination)

**Section 3 — Backend (`supabase/`)**
All 74 edge functions listed with category, auth requirement, and frontend consumer status.
All 140+ migrations listed chronologically.

**Section 4 — Scripts (`scripts/`)**
All 17 domains with script counts and canonical entrypoints.

**Section 5 — Generated Artifacts (`generated/`)**
All 57+ artifacts with source generator, validator, and consumer mapping.

**Section 6 — Infrastructure**
Electron, deploy, nginx, Docker, CI workflows, infra docs.

**Section 7 — Deployment Readiness Matrix**
Per-plane readiness assessment (Web SPA, Admin, Mobile, Desktop/Electron, Appliance/VMware, Backend/Edge Functions).

**Section 8 — Frontend ↔ Backend Alignment Matrix**
Major feature journeys mapped to page → hook → service → edge function → DB table chain.

**Section 9 — Reality Classification Summary**
What is real, simulated, prototype, docs-only across runtime claims.

**Section 10 — Outstanding Issues & Recommendations**
Remaining gaps, P0 blockers, and remediation priorities.

### Phase 2: Scan for Remaining Stale References

Run grep-based scans for:
- Any remaining `scripts/validation/` references (should be zero after prior fixes)
- Any remaining old script paths in registries, docs, admin pages
- Any broken barrel exports in `src/lib/` index files
- Any route references to non-existent pages

### Phase 3: Fix Any Discovered Issues

Based on Phase 2 scan results, fix:
- Stale import paths
- Broken barrel exports
- Missing index re-exports
- Stale doc references
- Any remaining `platform-law-registry.ts` or `manifest-registry.ts` path issues

### Phase 4: Update GLOBAL_REFACTOR_VERIFICATION_RESULTS.md

Regenerate the verification results with final pass confirmation.

### Phase 5: Build Verification

Run `npx tsc --noEmit` to confirm zero TypeScript errors after all fixes.

## Technical Details

- DEPLOYMENT_AUDIT.md will be generated as a single comprehensive markdown file at `generated/DEPLOYMENT_AUDIT.md`
- The document uses consistent formatting: tables for matrices, tree diagrams for structure, status badges for readiness
- File counts are derived from actual filesystem scans, not estimates
- Edge function classification uses the existing `edge-function-categories.ts` and `edge-function-registry.ts` as sources of truth
- Reality classification uses `product-reality-tiers.ts` and `reality-classification-registry.ts`
- All fixes are non-breaking — no file moves, only path corrections in string references

## Estimated Changes

| Item | Count |
|------|-------|
| New files to create | 1 (DEPLOYMENT_AUDIT.md) |
| Files to scan for stale refs | ~20 registries + docs |
| Potential fixes | 5-15 remaining stale refs |
| Files to update | 1-5 |
| Build verification | 1 pass |
