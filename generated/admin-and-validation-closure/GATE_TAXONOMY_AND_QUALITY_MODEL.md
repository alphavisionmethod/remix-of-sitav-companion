# Gate Taxonomy & Quality Model

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## 5-class taxonomy

| Class | Definition | Strength |
|---|---|---|
| **structural** | file/registry shape only | weak — cannot detect runtime regression |
| **smoke** | minimal happy-path runtime | medium — catches gross failures |
| **behavioral** | real runtime path + assertions | strong — proves the feature works |
| **e2e** | multi-system end-to-end | strongest — proves cross-system contracts |
| **warn-only** | informational | n/a — does not block release |

## Per-gate classification

The full per-gate classification table lives in
`generated/admin-and-validation-closure/gate-quality-status.json`. Every of the
171 BLOCK gates wired into `scripts/architecture/checks/check-os-release-readiness.ts`
has an explicit `class` and `deployment_critical` flag.

## Quality-of-green model

A **defensible green** means:
- gate is `behavioral` or `e2e`, OR
- gate is `structural`/`smoke` AND has a paired behavioral validator covering the
  same concern, OR
- gate is `warn-only` AND not deployment-critical.

A **questionable green** means:
- gate is `structural` only AND deployment-critical AND has no paired behavioral
  validator.

## Enforcement

`scripts/validation/check-gate-quality-classification.ts` asserts:
1. `gate-quality-status.json` exists
2. every BLOCK gate from `REQUIRED_GATES` appears in the classification
3. no deployment-critical gate is `structural` without a paired behavioral validator
