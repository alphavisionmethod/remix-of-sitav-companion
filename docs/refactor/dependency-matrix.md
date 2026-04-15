# SITA OS — Dependency Matrix

> Allowed and forbidden import directions between planes.

## Matrix

| Source Plane ↓ / Can Import → | shared | backend | os | admin | founder | mobile | product | internal-tools |
|-------------------------------|--------|---------|-----|-------|---------|--------|---------|----------------|
| **shared** | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **backend** | ✅ | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **os** | ✅ | ❌ | — | ❌ | ❌ | ❌ | ❌ | ❌ |
| **admin** | ✅ | ❌¹ | ❌ | — | ❌ | ❌ | ❌ | ❌ |
| **founder** | ✅ | ❌¹ | ❌ | ❌ | — | ❌ | ❌ | ❌ |
| **mobile** | ✅ | ❌¹ | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| **product** | ✅ | ❌¹ | ✅² | ❌ | ❌ | ❌ | — | ❌ |
| **internal-tools** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | — |

### Notes
1. ❌¹ = No direct backend imports. UI planes talk to backend via BFF/API contracts (HTTP/WebSocket), not code imports.
2. ✅² = Product plane may import OS SDK for shell/app rendering (browser simulation).

## Enforcement

### ESLint (`eslint.config.js`)
- `no-restricted-imports` patterns block direct `@/lib/core-services/*`, `@/lib/nova-sdk/*`, etc.
- Forces routing through `@/planes/{backend,os,admin,founder,mobile}` barrels.

### CI Script (`scripts/architecture/check-plane-boundaries.ts`)
- Scans all `src/` files
- Maps each file to its owning plane via `PLANE_MEMBERSHIP`
- Checks against `CROSS_PLANE_RULES` for forbidden import patterns
- Generates `generated/boundary-check-report.json`

### Post-Migration (Turborepo)
- Workspace package boundaries enforce dependency direction
- `@sita/shared-*` packages are the only cross-plane dependencies
- TypeScript project references prevent circular imports
