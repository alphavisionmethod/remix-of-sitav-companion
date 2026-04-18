# SITA OS — Final Canonical Ownership Model

Generated: 2026-04-18

## Decision: src/lib = Option B (narrow shared utility layer)

After Wave 4 remediation, the role of `src/lib/` is **explicitly narrowed**.

### Allowed (post-decomposition)

| Path | Purpose |
|---|---|
| `src/lib/utils.ts` | The 763-importer hot-path utility (`cn()`, etc.). |
| `src/lib/utils/` | True shared helpers (string, format, time). |
| `src/lib/internal/` | Migration bridges only. |
| `src/lib/hooks/` | Legacy hooks pending move to `src/hooks/`. |
| `src/lib/__tests__/` | Tests for the above. |

### Authority layers (canonical homes)

| Layer | Path | Owns |
|---|---|---|
| Domains | `src/domains/` | Business logic, engines, capability rules. |
| Platform | `src/platform/` | Cross-domain platform services (governance, policy, orchestration). |
| Runtimes | `src/runtimes/` | Execution surfaces (Electron, Web, Mobile). |
| Data | `src/data/` | Persistence, repositories, projections. |
| Integrations | `src/integrations/` | External provider adapters. |
| Contracts | `src/contracts/` | Type contracts, manifests, registries. |

### In-migration entries (allowlisted but tracked)

103 top-level entries currently still live under `src/lib/`. They are tracked in `lib-ownership-drift-report.json` and counted as a release-health metric (declining count = positive signal). New additions outside the allowlist are **blocked** by `check-residual-lib-canonicality.ts` (Phase 7 hardening).
