# Archive Retention & Governance Policy

> Last updated: 2026-04-21

## Purpose

The `archive/` directory holds a **minimal governed set** of historical assets
that are actively referenced by compliance validators, platform scope documents,
or mobile reactivation contracts. It is **not** a dumping ground for dead code.

## What MAY live in archive

| Category | Example | Condition |
|---|---|---|
| Compliance sentinels | `mobile/ARCHIVED.md` | Must be referenced by an active validator or compliance map |
| Platform config sentinels | `capacitor/capacitor.config.ts` | Must be referenced by an active validator |
| Infrastructure manifests | `infra/mobile.yaml` | Must be referenced by an active script or doc |
| Store/signing policy docs | `mobile/ios/SIGNING.md` | Must be referenced by compliance map |
| Icon assets | `mobile/icons/` | Retained for reactivation path only |

## What MUST NOT live in archive

| Category | Example | Action |
|---|---|---|
| Generated JSON/MD reports | `*.json`, `*-report.json` | Delete immediately |
| TypeScript/TSX source code | `*.ts`, `*.tsx` (except `capacitor.config.ts`) | Delete or promote to active |
| Dead template trees | `android-templates/`, `ios-templates/` | Delete |
| Node artifacts | `package.json`, `node_modules/` | Delete |
| Dead CI workflows | `*.yml` workflow files | Delete |
| Dead validation scripts | `check-*.ts` | Delete |

## Boundary rules

1. **No active code imports from archive.** Validators may _check for the existence_ of sentinel files but must not import or execute archived code.
2. **No generated artifacts accumulate.** If a script produces output, it writes to `generated/` (project root), never to `archive/`.
3. **Every retained file must have at least one active reference** in a validator, compliance map, or canonical doc. Orphaned files must be removed.
4. **Archive is not release truth.** Nothing in `archive/` represents active readiness, active capability, or active deployment status.
5. **Archive is not runtime truth.** No runtime system may depend on archive content for functionality.

## Enforcement

The `scripts/root/check-archive-boundary.ts` validator enforces these rules in CI.
It checks for:
- Presence of required sentinel files
- Absence of prohibited file types (generated JSON, source code, node artifacts)
- No unauthorized new subtrees

## Review cadence

Archive contents should be reviewed quarterly. Any file that loses its last
active reference should be removed in the same PR that removes the reference.