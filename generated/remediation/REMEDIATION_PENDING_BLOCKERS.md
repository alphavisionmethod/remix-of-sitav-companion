# SITA OS — Remediation Pending Blockers

> Generated: 2026-04-16

## P0 — Launch Blockers (Cannot be auto-fixed)

| # | Blocker | Why It Cannot Be Auto-Fixed | Required Action |
|---|---------|----------------------------|-----------------|
| 1 | **No Sentry/Error Monitoring** | Requires external Sentry DSN and account setup | Create Sentry project, add DSN secret, integrate `@sentry/react` SDK, add ErrorBoundary wrapper |
| 2 | **No Emergency Payment Kill Switch** | Requires business logic decision on kill-switch scope | Create `payment-kill-switch` edge function, add admin toggle UI, wire to payment-process function |
| 3 | **No Proven Green CI Artifacts** | Requires CI infrastructure (GitHub Actions runners, secrets) | Configure CI secrets, run full pipeline, capture green build artifact |

## P1 — Pre-GA Required

| # | Blocker | Why It Cannot Be Auto-Fixed | Required Action |
|---|---------|----------------------------|-----------------|
| 4 | **Investment Office backend gap** | 41 frontend pages need domain-specific edge functions | Create `investment-portfolio-api` edge function, wire to investment tables |
| 5 | **Service sprawl (478 → ~45)** | Requires careful migration of 400+ consumer files | Execute consolidation plan from `service-consolidation-manifest.json` |
| 6 | **Electron CI pipeline** | Requires Electron Forge + code signing setup | Add `build-electron.yml` workflow, configure signing certificates |
| 7 | **Admin demo-data audit** | Requires per-page inspection of 503 admin pages | Manual audit to identify which pages use mock vs real data |

## P2 — Technical Debt

| # | Blocker | Why It Cannot Be Auto-Fixed | Required Action |
|---|---------|----------------------------|-----------------|
| 8 | **Namespace merges** (engine, hooks, journeys, ai-gateway) | Risk of breaking existing imports | Staged merge with consumer updates |
| 9 | **Demo data consolidation** (mock-data + demo-data) | 58 files need careful dedup | Merge into unified demo layer |
| 10 | **Page-level error boundary coverage** | Requires per-route audit | Add ErrorBoundary to each route family |
| 11 | **E2E test coverage expansion** | Requires test authoring | Add Playwright tests for critical journeys |
| 12 | **Load/performance testing** | Requires test infrastructure | Set up k6 or similar load testing |

---

## Blocker Resolution Priority

```
P0 (Must fix before launch):     3 items
P1 (Must fix before GA):         4 items  
P2 (Technical debt, post-GA):    5 items
Total pending:                   12 items
```

---

*These blockers require human decision-making, external service setup, or infrastructure that cannot be automated in this remediation pass.*
