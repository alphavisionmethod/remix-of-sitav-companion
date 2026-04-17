

## Plan — `SITA OS — FULL ADVANCED ISSUES, FIXES & INTEGRATION REGISTER v2`

### Verified live snapshot (just gathered, parallel checks)

| Plane | Metric | Value |
|---|---|---|
| Frontend pages | **1,040** |
| Components / Hooks | **922 / 169** |
| Lib modules | **1,835** |
| Edge functions | **128** |
| DB tables / policies | **303 / 652** |
| Tables w/ RLS, no policy | **0** ✅ (was 1 — `connector_oauth_tokens` resolved) |
| Migrations | **189** |
| Scripts | **363** |
| Generated artifacts | **120** |
| Unit tests | **244** |
| E2E specs | **56** (under `tests/e2e/`, not `e2e/`) |
| Phase 32 verdict | **real · 13/13 · deployable: true** |
| Supabase linter | **1 WARN** (public bucket listing — `app-assets`) |
| i18n locales | **5** (en, es, fr, de, ar) |
| Secrets configured | 11 (Sentry DSN **not set**, Apple/Windows signing **not set**, FCM **not set**) |

### Document target

Replace `generated/FULL_ISSUES_AND_FIXES.md` (currently 761 lines, v5.1, fix-history-heavy) with:

**`generated/FULL_ISSUES_AND_FIXES.md` v2.0 — "Issues, Fixes & Integration Register"**

Truth-only, outstanding-only — per documentation-governance memory. **No resolved-issue log. No historical "✅ FIXED" entries.** Only what blocks 100% deployment of OS, app, mobile, desktop, appliance.

### Document structure (~700 lines, 12 sections)

1. **Header & Live Snapshot** — table above + Phase 32 verdict cited verbatim
2. **Audit Methodology** — truth-only model, evidence-anchored, no historical fixes
3. **Section A — P0 Deployment Blockers (Open)** — must be closed before GA
4. **Section B — P1 Scale & Hardening Gaps (Open)**
5. **Section C — P2 Quality & Coverage Gaps (Open)**
6. **Section D — P3 Polish & Future Work (Tracked)**
7. **Section E — Per-Surface Deployment Readiness Matrix** (Web SPA, Electron, Appliance ISO, iOS, Android, PWA, Edge Functions, DB)
8. **Section F — Wiring Gaps Register** — frontend-backend-DB join points still incomplete
9. **Section G — Integration Register** — every external system + status (Stripe, Twilio, Shopify, APNs, FCM, Sentry, OAuth providers)
10. **Section H — Secret & Configuration Gaps** — what's missing from the secret store for full deployment
11. **Section I — Evidence Index** — every claim → `generated/*.json`
12. **Section J — Deployment Decision** — go/no-go per surface

### Outstanding issues to enumerate (verified, open only)

**P0 — true production blockers (5)**

| ID | Issue | Evidence | Surface |
|---|---|---|---|
| OPN-P0-01 | `app-assets` public bucket allows anonymous listing (Supabase WARN 0025) | linter | Storage |
| OPN-P0-02 | Sentry DSN secret not set — SDK wired but inert (`src/lib/observability/sentry.ts` no-ops) | secrets list | Observability |
| OPN-P0-03 | Hosted CI run artifacts unproven — only local execution evidence in `generated/*` | release-pipeline-report | CI/CD |
| OPN-P0-04 | Apple Developer signing chain not configured (4 env vars missing: `APPLE_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`) | desktop-signing-status | Electron / iOS |
| OPN-P0-05 | Windows code-signing chain not configured (`CSC_LINK`, `CSC_KEY_PASSWORD` missing) | desktop-signing-status | Electron Win |

**P1 — scale & hardening (8)**

| ID | Issue | Evidence | Surface |
|---|---|---|---|
| OPN-P1-01 | 41 Investment Office pages share generic `business-api` (no dedicated domain APIs) | edge-function-membership | Backend |
| OPN-P1-02 | Namespace duplication: `src/lib/engine/` vs `src/lib/engines/` | filesystem | Lib |
| OPN-P1-03 | 15 admin pages exceed FounderControlShell module budget | component-governance | Admin |
| OPN-P1-04 | Apple APNs push transport not wired (deferred per memory) | push-notification audit | Mobile iOS |
| OPN-P1-05 | Android FCM push transport not wired (no FCM secret) | secrets list | Mobile Android |
| OPN-P1-06 | OAuth provider catalogue limited — GitHub/Discord/Facebook unsupported in Lovable Cloud | auth-config | Auth |
| OPN-P1-07 | Real-time multi-user co-presence channels not implemented for Boardroom | feature-integration-index | Boardroom |
| OPN-P1-08 | Backup verification cron job missing (no edge function asserts restore-ability) | edge-function topology | Infra |

**P2 — quality & coverage (7)**

| ID | Issue | Evidence | Surface |
|---|---|---|---|
| OPN-P2-01 | E2E coverage exists (56 specs) but **no a11y harness** (`@axe-core/playwright`) wired | tests/e2e | Quality |
| OPN-P2-02 | No Lighthouse / perf budget CI gate (`.lighthouserc` absent) | repo scan | Performance |
| OPN-P2-03 | No Storybook for the 922 components — UX drift risk | repo scan | Design system |
| OPN-P2-04 | `as any` cleanup pending (ISS-091, 68 page-level instances) | type-audit | Type safety |
| OPN-P2-05 | No vector search / pgvector edge function despite AI-heavy product | edge-function topology | AI/RAG |
| OPN-P2-06 | Audit log retention TTL job (`trim_kill_switch_audit_log`) exists but no scheduled trigger (pg_cron not wired) | db-functions | Compliance |
| OPN-P2-07 | Generated artifact freshness — several reports >24h old | mtime scan | Governance |

**P3 — polish (5)**

| ID | Issue | Surface |
|---|---|---|
| OPN-P3-01 | Visual regression tests (Percy/Chromatic) absent | Design |
| OPN-P3-02 | OpenAPI / contract docs missing for 128 edge functions | Docs |
| OPN-P3-03 | SBOM generation not in CI | Supply chain |
| OPN-P3-04 | Synthetic monitoring (uptime probes for 5 flagship paths) absent | Observability |
| OPN-P3-05 | Cost-attribution dashboard (AI invocations → tenant → budget) not built | FinOps |

### Per-surface deployment readiness matrix (Section E)

| Surface | Status | Blockers | Go/No-Go |
|---|---|---|---|
| Web SPA (Tier 1) | ✅ ready | none | **GO** |
| PWA installable | ✅ ready | manifest + sw present | **GO** |
| Edge Functions backend | ✅ ready | none | **GO** |
| Database | ⚠️ near-ready | OPN-P0-01 (bucket listing) | **CONDITIONAL** |
| Observability | ⚠️ wired-inert | OPN-P0-02 (Sentry DSN) | **CONDITIONAL** |
| Electron Desktop (Tier 2) | 🔴 blocked | OPN-P0-04, OPN-P0-05 | **NO-GO** |
| Appliance ISO (Tier 3) | ✅ ready | none (deployability-report ok) | **GO** |
| iOS App Store | 🔴 blocked | OPN-P0-04 + OPN-P1-04 | **NO-GO** |
| Android Play Store | 🔴 blocked | OPN-P1-05 (FCM) | **NO-GO** |
| Hosted CI/CD | 🔴 unproven | OPN-P0-03 | **NO-GO** |

### Wiring Gaps Register (Section F) — incomplete frontend↔backend joins

- Investment Office (41 pages → generic `business-api` instead of dedicated domain functions)
- Co-presence: no `presence` channel wiring in Boardroom multi-user flow
- DSAR/account-delete: edge functions exist, no Settings UI surface yet
- Sentry release tagging: code reads `VITE_SENTRY_RELEASE` but no CI step injects it

### Integration Register (Section G)

| Integration | Status | Gap |
|---|---|---|
| Lovable AI Gateway | ✅ live | none |
| Anthropic / OpenAI | ✅ keys set | gateway-only (no direct SDK use) |
| Twilio SMS | ✅ keys set | flow-tested? unverified |
| Shopify | ✅ tokens set | E2E proof missing |
| Stripe payments | ⚠️ scaffold | not enabled in payments tool |
| Web Push (VAPID) | ✅ live | — |
| Apple APNs | 🔴 deferred | Apple Dev account required |
| Android FCM | 🔴 missing | Firebase service-account key required |
| Sentry | ⚠️ wired-inert | DSN missing |
| Hosted CI | 🔴 unproven | no green run artifact |

### Files

| Action | Path |
|---|---|
| **Overwrite** | `generated/FULL_ISSUES_AND_FIXES.md` (v2.0, ~700 lines) |

### Acceptance

- Document opens with verified live counts matching the snapshot table
- Zero "RESOLVED" entries — only outstanding gaps
- Each open issue has: ID, priority, surface, evidence path, remediation
- Per-surface go/no-go matrix appears in Section E
- Integration register lists every external system + readiness
- Phase 32 verdict (`real / 13-of-13 / deployable: true`) cited verbatim
- The 1 Supabase WARN appears as OPN-P0-01 with linter rule `0025_public_bucket_allows_listing`
- The recently-resolved RLS gap (`connector_oauth_tokens`) is **not mentioned** (truth-only)

