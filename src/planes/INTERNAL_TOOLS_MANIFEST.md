# Internal Tools Plane Manifest

## Purpose
Development, testing, simulation, and forensic tooling. Not deployed to production. Includes reality detection, dual-reality simulation, FIP governance, seed data, and demo scenarios.

## Ownership
- **Primary owner**: Engineering/DevOps
- **Trust level**: Internal only — no production data access

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/domains/simulation/` | Simulation engines (dry-run, policy, what-if) |
| `src/lib/fip/` | Feature Integration Protocol registry |
| `src/lib/dual-reality/` | Dual reality simulation framework |
| `src/lib/reality-audit/` | Reality audit registry |
| `src/lib/reality-records/` | Reality classification records |
| `src/data/fixtures/demo-data/` | Demo/seed data generators |
| `src/data/fixtures/seed/` | Database seed scripts |
| `src/data/fixtures/mock-data/` | Mock fixtures for tests/scenarios |

## Migration Target
```
/internal-tools/simulations/
/internal-tools/fip/
/internal-tools/dual-reality/
/internal-tools/reality-audit/
/internal-tools/reconciliation/
/internal-tools/migrations/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- Must not be imported by production code
- No `@/pages/` imports
- No `@/components/admin/` imports

## Deployment Target
- Local development only
- CI pipelines for validation
