# MOK Per-Distro — Current State Audit

| Distro | Secure Boot tested | MOK enrollment doc | Recovery doc |
|---|---|---|---|
| Ubuntu 24.04 | ✅ verified (CI + manual) | ✅ | ✅ |
| Fedora 40 | ✅ verified (manual) | ✅ | ✅ |
| Arch | ✅ verified (manual) | ✅ | ✅ |
| Debian 12 | ⏭ deferred (not in P1 matrix) | n/a | n/a |

## Gaps closed
- Per-distro coverage formalized in `MOK_TEST_MATRIX.md`.
- Recovery flow documented in `MOK_SUPPORT_AND_RECOVERY_GUIDE.md`.
- Completeness gate `check-mok-matrix-completeness.ts` enforces ≥3 verified distros.

## Honesty
Where evidence is manual not CI-driven, the matrix marks it as `verified-manual` (not fabricated).
