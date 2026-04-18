# Nova Rename — Reference Audit

## Classification

| Class | Count | Action |
|---|---|---|
| Internal code symbol (path: `src/platform/nova-sdk/kernel/*`) | ~40 files | KEEP — compat alias, re-exported under canonical name |
| Historical runtime tier label (`feature-runtime-tier-registry.ts`) | 1 | KEEP with comment |
| Honesty doc (`docs/REAL_VS_SIMULATED.md`) | 1 | KEEP — this IS the honesty narrative |
| Audit narrative (`generated/DEPLOYMENT_AUDIT.md`) | 1 | KEEP — historical record |
| Tests (`*.test.tsx`) | ~3 | KEEP — test internal symbol |
| User-visible surfaces | 0 | none — all renamed |
| Claim-bearing docs | 0 | none — all renamed |

## Canonical replacement
`Nova Kernel` → `Nova Runtime SDK`

## Boundary module
`src/platform/nova-runtime-sdk/index.ts` re-exports the internal substrate under the honest canonical name.

## Validation
`scripts/validation/check-nova-runtime-sdk-naming.ts` enforces no claim-risk references appear outside the allowlist.
