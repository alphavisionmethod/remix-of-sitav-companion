

## SITA OS — Forward Audit (post-v6.0): What to Add Next

### Live snapshot (re-verified now)

| Plane | Metric | Value | Δ vs v6.0 |
|---|---|---|---|
| Frontend pages | 1,040 | (was 1,044 — minor cleanup) |
| Components / Hooks | 922 / 168 | stable |
| Edge functions | 126 | stable |
| DB tables / RLS policies | 301 / 643 | stable |
| Tables w/ RLS, no policy | **1** (`connector_oauth_tokens`) | unchanged P0 |
| DB functions | 17 | — |
| Migrations | 188 | — |
| CI check scripts | 182 | — |
| Generated artifacts | 107 | — |
| Tests (unit + e2e) | 123 / 56 | — |
| Supabase linter findings | 2 (1 INFO, 1 WARN) | unchanged |
| i18n locales | 1 (en only) | gap |
| PWA manifest | missing (`manifest.webmanifest` exists but no `manifest.json`) | partial |
| Sentry | wired, **DSN not set** | partial |

### Already in place (don't re-build)
- Sentry SDK integration (`src/lib/observability/sentry.ts`) — only needs DSN secret
- Service worker (`public/sw.js`) + web manifest
- Capacitor (mobile) + Electron (desktop) scaffolding
- Push notifications (`push-dispatch`, `push-track`) with VAPID keys
- Payments (`payment-process`, `payment-kill-switch`)
- 5 flagship loops emitting real receipts
- Phase 32 "It's Real" gate green (13/13)

### What's genuinely missing — prioritized backlog

**P0 — true production blockers (5)**
1. `connector_oauth_tokens` RLS policies (table has RLS on, 0 policies → all access denied)
2. `app-assets` public bucket listing policy (Supabase WARN)
3. Sentry DSN secret not set (SDK wired but inert)
4. `KS-PAYMENTS-AUTH` dedicated kill switch (registry entry missing)
5. Hosted CI run artifacts (only local execution proven)

**P1 — scale & quality (7)**
6. **i18n breadth** — only `en.json` exists. Add at minimum `es`, `fr`, `de`, `ar` (RTL CSS already present but no Arabic strings)
7. **a11y test harness** — no `@axe-core/playwright` in pipeline; WCAG AA not measured
8. **Lighthouse / perf budget CI** — no `.lighthouserc` or perf gate
9. **Storybook** — no component catalog for the 922 components (UX drift risk)
10. **Investment Office API split** — 41 pages on generic `business-api`
11. **Namespace dedupe** — `src/lib/engine/` vs `src/lib/engines/`
12. **Electron signing pipeline** — entitlements present, but no notarization proof

**P2 — net-new capability gaps (8)**
13. **Vector search / RAG** — no `embed-*` or pgvector edge function despite AI-heavy product
14. **Apple APNs push** — only Web VAPID active; iOS push deferred per memory
15. **Android FCM push** — planned, not wired
16. **Real-time co-presence** — no `presence` channels for Boardroom multi-user
17. **Backup verification job** — no cron edge function asserting backup restore-ability
18. **DSAR / data-export endpoint** — GDPR right-to-export not implemented
19. **Account deletion flow** — soft-delete + grace period missing
20. **Audit-log retention policy** — no TTL on `kill_switch_audit_log`, `flagship_loop_completions`

**P3 — polish (5)**
21. Visual regression tests (Percy/Chromatic) for the design system
22. OpenAPI / contract docs for the 126 edge functions
23. SBOM generation for the supply-chain audit
24. Synthetic monitoring (uptime probes hitting 5 flagship golden paths)
25. Cost-attribution dashboard tying AI invocations → tenant → budget class

### Recommended next sprint (single coherent batch)

A focused 6-item sprint that closes the **highest-leverage** gaps without fan-out:

| # | Item | Files | Acceptance |
|---|---|---|---|
| 1 | Add RLS policies on `connector_oauth_tokens` (owner read/write, service-role bypass) | new migration | linter shows 0 RLS-no-policy |
| 2 | Restrict `app-assets` public bucket listing (per-prefix `SELECT` only) | new migration | linter WARN cleared |
| 3 | Register `KS-PAYMENTS-AUTH` in `kill-switch-registry.ts` + runbook RB-020 | 2 files | registry-integrity green |
| 4 | Add i18n locales `es`, `fr`, `de`, `ar` (auto-translate via Lovable AI, RTL toggle) | 4 JSON + locale switcher hook | language menu live |
| 5 | Wire `@axe-core/playwright` into existing E2E suite + new `a11y.spec.ts` running on 10 critical routes | 1 spec + CI step | a11y violations report generated |
| 6 | Add `data-export` edge function (DSAR) + `account-delete` with 30-day grace | 2 functions + UI in Settings | manual export downloads JSON of all user rows |

### Out-of-scope for this sprint (tracked, not built)
- Storybook (large effort, separate sprint)
- Investment Office API split (architectural refactor)
- Apple APNs (requires Apple Developer account)
- Vector search (requires schema design discussion)

### Acceptance for the sprint
- Supabase linter: **0 findings**
- 100% RLS coverage: **301/301** tables
- Kill-switch registry: includes `KS-PAYMENTS-AUTH` with runbook link
- Language switcher live in Settings; 5 locales selectable; RTL flips on `ar`
- E2E a11y report attached to CI artifacts; baseline violations recorded
- DSAR: authenticated user can request + download JSON export of all their data
- Account delete: soft-deletes user, schedules hard-delete in 30 days, emits receipt
- 0 TypeScript errors; existing 13/13 "It's Real" gate stays green

