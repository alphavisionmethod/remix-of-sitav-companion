> ⚠️ **Status: Future Monorepo Target — Aspirational Reference**
> This document describes a post-Lovable monorepo migration design. The current platform remains a **single Vite SPA + Lovable Cloud** deployment. Treat as reference architecture, not current state.

# SITA OS — Dependency Matrix

> Allowed and forbidden import directions between planes.

## Matrix

| Source Plane ↓ / Can Import → | shared | backend | os | admin | founder | mobile | product | internal-tools | protocols | release | graph | ai | simulations |
|-------------------------------|--------|---------|-----|-------|---------|--------|---------|----------------|-----------|---------|-------|-----|-------------|
| **shared** | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **protocols** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ❌ |
| **release** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| **graph** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| **ai** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **simulations** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |
| **backend** | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **os** | ✅ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **admin** | ✅ | ❌¹ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **founder** | ✅ | ❌¹ | ❌ | ❌ | — | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **mobile** | ✅ | ❌¹ | ❌ | ❌ | ❌ | — | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **product** | ✅ | ❌¹ | ✅² | ❌ | ❌ | ❌ | — | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **internal-tools** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — | ✅ | ❌ | ❌ | ❌ | ❌ |

### Notes
1. ❌¹ = No direct backend imports. UI planes talk to backend via BFF/API contracts (HTTP/WebSocket), not code imports.
2. ✅² = Product plane may import OS SDK for shell/app rendering (browser simulation).
3. **Control domains** (protocols, release, graph, ai, simulations) are leaf nodes — they import NOTHING. They are consumed by engines and services only.

## Control Domain Rules

| Domain | Location | May Import | Consumed By |
|--------|----------|------------|-------------|
| protocols | `src/packages/protocols/` | Nothing | protocol-bridge, hooks, services |
| release | `src/packages/release-contracts/` | Nothing | release-engine, hooks |
| graph | `src/packages/graph-contracts/` | Nothing | graph-engine, hooks |
| ai | `src/packages/ai-contracts/` | Nothing | ai-governance-engine, hooks |
| simulations | `src/packages/simulation-contracts/` | Nothing | simulation-engine, hooks |

## Enforcement

### ESLint (`eslint.config.js`)
- `no-restricted-imports` patterns block direct `@/lib/core-services/*`, `@/lib/nova-sdk/*`, etc.
- Forces routing through `@/planes/{backend,os,admin,founder,mobile}` barrels.

### CI Script (`scripts/architecture/check-plane-boundaries.ts`)
- Scans all `src/` files
- Maps each file to its owning plane via `PLANE_MEMBERSHIP`
- Checks against `CROSS_PLANE_RULES` for forbidden import patterns
- Generates `generated/boundary-check-report.json`

### CI Validation (`scripts/validation/`)
- `check-protocol-purity.ts` — Ensures all contract packages import nothing from `src/lib/`
- `check-no-runtime-in-shared.ts` — Ensures all `src/packages/` files are pure types
- `check-engine-no-io.ts` — Ensures engines don't import from `@/integrations/supabase`

### Post-Migration (Turborepo)
- Workspace package boundaries enforce dependency direction
- `@sita/shared-*` packages are the only cross-plane dependencies
- TypeScript project references prevent circular imports
