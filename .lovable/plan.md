

# Part 6: Production-Ready Multi-Plane Migration Package

## Reality Check

This project runs on **Lovable Cloud** — a Vite SPA where the build compiles exclusively from `src/`. Moving files to top-level `/os`, `/backend`, `/shared` directories **will break the application immediately** because Vite's entry point and `@` alias resolve to `src/`.

The existing `MIGRATION-BLUEPRINT.md` and `MONOREPO-SCAFFOLD.md` already document the target structure and file mapping. What is missing is the **executable migration tooling** and **in-repo boundary hardening** to make this truly deployment-ready.

## What This Plan Delivers

### A. In-Repo Boundary Hardening (works now, inside Lovable)

1. **Barrel re-exports for every plane** — Create `src/planes/` with explicit barrel files (`os.ts`, `backend.ts`, `shared.ts`, `admin.ts`, `founder.ts`, `mobile.ts`) that re-export only the public API of each logical plane. All cross-plane imports must go through these barrels.

2. **ESLint import restriction rules** — Add `eslint.config.js` rules using `no-restricted-imports` to block direct cross-plane imports (e.g., pages importing from `core-services/`, admin importing from `os-services/`).

3. **Enhanced boundary checker** — Replace the current `check-plane-boundaries.ts` with a production-grade scanner that maps every file to its plane, traces all imports, and fails on any violation. Output: machine-readable JSON report.

4. **Ownership manifest** — Create `generated/plane-ownership.json` mapping every directory to its owning plane, deployment target, and allowed dependencies.

### B. Executable Migration Toolkit (runs after GitHub export)

5. **`scripts/migrate/execute-migration.sh`** — A complete shell script that:
   - Initializes Turborepo + pnpm workspaces
   - Creates all target directories per the blueprint
   - Moves every file according to the migration map
   - Rewrites all `@/` imports to `@sita/` workspace imports
   - Generates per-plane `package.json`, `tsconfig.json`, `vite.config.ts`
   - Copies edge functions to `backend/edge-functions/`
   - Moves infra files (Dockerfile, nginx, docker-compose)

6. **`scripts/migrate/rewrite-imports.ts`** — AST-based import rewriter using TypeScript compiler API that:
   - Parses every `.ts/.tsx` file
   - Maps old `@/lib/core-services/...` paths to new `@sita/backend-services/...` paths
   - Maps old `@/packages/contracts/...` to `@sita/shared-contracts/...`
   - Writes corrected files in-place
   - Generates a diff report

7. **`scripts/migrate/verify-migration.ts`** — Post-migration verification that:
   - Checks every plane builds independently (`turbo run build`)
   - Validates no cross-plane import violations remain
   - Confirms no orphaned files
   - Confirms no duplicate contract definitions
   - Outputs deployment-readiness checklist

### C. Missing First-Class Systems

8. **Protocol layer** (`src/packages/protocols/`) — Canonical protocol definitions for:
   - Command lifecycle protocol (request → approve → execute → receipt)
   - Agent communication protocol (register → heartbeat → command → result)
   - Approval protocol (initiate → evaluate → decide → notify)
   - Trust evaluation protocol (claim → evidence → grade → decision)
   - Rollout protocol (plan → gate → canary → promote → rollback)

9. **Release intelligence** (`src/lib/services/release-intelligence/`) — 
   - Compatibility matrix engine
   - Regression fingerprint tracker
   - Rollback orchestration state machine
   - Release readiness scorer

10. **Degraded-mode architecture** (`src/lib/services/degraded-mode/`) —
    - Service health dependency graph
    - Graceful degradation state machine (Full → Degraded → Minimal → Emergency)
    - Feature availability calculator based on service health
    - User notification engine for degraded states

11. **Economic intelligence** (`src/lib/engines/economic-intelligence-engine.ts`) —
    - Revenue projection with confidence intervals
    - Cost optimization advisor
    - Unit economics tracker (CAC, LTV, payback period)
    - Cash runway calculator with scenario modeling

12. **Digest/journal system** (`src/lib/services/digest-journal/`) —
    - Daily executive digest generator
    - Weekly trend journal with advisor commentary
    - Monthly strategic review assembler
    - Digest delivery preferences and scheduling

### D. Deployment Manifests

13. **Per-plane deployment configs** — Create deployment manifests for each plane:
    - `infra/deploy/product-shell.yaml` (Vite SPA → CDN)
    - `infra/deploy/admin-console.yaml` (Vite SPA → CDN, admin auth)
    - `infra/deploy/founder-center.yaml` (Vite SPA → CDN, founder auth)
    - `infra/deploy/backend.yaml` (Edge functions → Supabase)
    - `infra/deploy/os-artifact.yaml` (Electron/Docker packaging)
    - Each with env config, secrets model, health checks

14. **CI pipeline definitions** — GitHub Actions workflows:
    - `check-boundaries.yml` — runs boundary checker on every PR
    - `build-planes.yml` — independent build verification per plane
    - `deploy-backend.yml` — edge function deployment
    - `deploy-frontend.yml` — SPA deployment per app

## File Count Estimate

- ~8 new files for barrel re-exports and boundary enforcement
- ~5 migration scripts
- ~12 protocol/system files
- ~6 deployment manifests and CI configs
- ~4 engine/service files for missing systems

**Total: ~35 new files, ~3 modified files**

## Technical Details

### Barrel Re-Export Pattern
```typescript
// src/planes/backend.ts — public API of the backend plane
export type { TrustEvaluation } from '@/lib/core-services/trust/types';
export { evaluateTrust } from '@/lib/core-services/trust/engine';
// Pages/components MUST import from here, not directly
```

### ESLint Boundary Rules
```javascript
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['@/lib/core-services/*'],
    importNames: [],
    message: 'Import from @/planes/backend instead'
  }]
}]
```

### Migration Script Core Logic
```bash
# Phase 1: Create workspace structure
mkdir -p shared/{contracts,events,models,auth,sdk}
mkdir -p os/{kernel,runtime,shell,sdk,security}
mkdir -p backend/{edge-functions,services,gateway}
mkdir -p apps/{product-shell,admin-console,founder-center,mobile}

# Phase 2: Move files per blueprint map
mv src/packages/contracts/ shared/contracts/core/
mv src/lib/nova-sdk/ os/sdk/
mv supabase/functions/ backend/edge-functions/
# ... (full map from MIGRATION-BLUEPRINT.md)

# Phase 3: Rewrite imports
npx tsx scripts/migrate/rewrite-imports.ts

# Phase 4: Verify
npx tsx scripts/migrate/verify-migration.ts
```

