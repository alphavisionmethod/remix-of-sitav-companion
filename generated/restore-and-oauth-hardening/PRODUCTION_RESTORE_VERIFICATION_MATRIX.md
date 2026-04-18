# Production Restore — Post-Restore Verification Matrix

| # | Check | Tool | Severity |
|---|---|---|---|
| 1 | Schema integrity (all expected tables/views) | introspection | BLOCK |
| 2 | Row counts within tolerance per table class | drill | BLOCK |
| 3 | RLS enabled on every table | `check-post-restore-rls-integrity.ts` | BLOCK |
| 4 | Policies present where expected | linter | BLOCK |
| 5 | Critical route renders | `check-post-restore-critical-routes.ts` | BLOCK |
| 6 | Auth/profile visibility intact | smoke test | BLOCK |
| 7 | Boardroom tables queryable | drill | BLOCK |
| 8 | App install truth (`installed_apps`) | drill | WARN |
| 9 | Connector tokens visible (count) | drill | WARN |
| 10 | Notification tables ready | drill | WARN |
| 11 | AI ledger present | drill | WARN |
| 12 | Edge function /health | curl | WARN |
| 13 | No migration drift | manifest diff | BLOCK |

Source of truth: `generated/restore-and-oauth-hardening/post-restore-verification-matrix.json`.
