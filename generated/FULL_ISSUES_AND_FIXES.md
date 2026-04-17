# SITA OS — FULL ADVANCED ISSUES, FIXES & INTEGRATION REGISTER

**Version:** 2.0 — Truth-Only / Outstanding-Only
**Generated:** 2026-04-17
**Supersedes:** v5.1 (fix-history-heavy log, retired per documentation-governance policy)
**Scope:** 100% deployment readiness for OS, Web App, PWA, Electron Desktop, Appliance ISO, iOS, Android
**Model:** No resolved-issue log. No historical "✅ FIXED" entries. Only what currently blocks GA.

---

## 1. Header & Live Snapshot

Re-verified by parallel code/DB/linter scans on the date above.

| Plane | Metric | Value |
|---|---|---|
| Frontend pages | **1,040** |
| Components / Hooks | **922 / 169** |
| Lib modules | **1,835** |
| Edge functions | **128** |
| DB tables / policies | **303 / 652** |
| Tables w/ RLS, no policy | **0** |
| Migrations | **189** |
| CI / governance scripts | **363** |
| Generated artifacts | **120** |
| Unit tests | **244** |
| E2E specs (`tests/e2e/`) | **56** |
| Phase 32 "It's Real" verdict | **real · 13/13 · deployable: true** |
| Supabase linter findings | **1 WARN** (`0025_public_bucket_allows_listing` — `app-assets`) |
| i18n locales | **5** (en, es, fr, de, ar) |
| Runtime secrets configured | 11 (Sentry DSN **not set**, Apple/Windows signing **not set**, FCM **not set**) |

> **Phase 32 verdict (verbatim from `generated/its-real-gate-report.json`):**
> `verdict: "real"  · checks: 13/13 ok  · deployable: true`

---

## 2. Audit Methodology

- **Truth-only model.** This document enumerates **only outstanding gaps**. Every claim is anchored to a generated artifact under `generated/*.json` or to a live database / linter probe.
- **Evidence-anchored.** Every issue carries: `ID · Priority · Surface · Evidence path · Remediation`.
- **No historical log.** Resolved items are deliberately omitted to prevent stale truth and false-confidence drift.
- **Surfaces audited:** Web SPA, PWA, Edge Functions, Database, Storage, Observability, Electron Desktop (mac/win), Appliance ISO, iOS, Android, Hosted CI/CD.
- **Severity ladder:** P0 (blocks GA) → P1 (blocks scale) → P2 (blocks quality bar) → P3 (polish, tracked).

---

## 3. Section A — P0 Deployment Blockers (Open) · 5

### OPN-P0-01 — `app-assets` public bucket allows anonymous listing
- **Surface:** Storage
- **Evidence:** Supabase linter rule `0025_public_bucket_allows_listing`
- **Impact:** Anonymous clients can enumerate every object key in the public asset bucket — leaks UI asset paths and any accidentally-uploaded artifact names.
- **Remediation:** Migration replacing the bucket-wide public `SELECT` with a per-prefix policy (e.g. allow `SELECT` only on `branding/*`, `icons/*`, `public/*`). Listing on the bucket root must require service role.
- **Verification:** `supabase--linter` returns 0 findings.

### OPN-P0-02 — Sentry DSN secret not set (SDK wired but inert)
- **Surface:** Observability
- **Evidence:** `src/lib/observability/sentry.ts` no-ops when `VITE_SENTRY_DSN` is absent; secret not present in runtime secret list.
- **Impact:** Production runtime errors are not captured externally. Crash, perf, and replay signals invisible.
- **Remediation:** Provision Sentry project → set `VITE_SENTRY_DSN` (build-time) + `SENTRY_AUTH_TOKEN` (release tagging). Add CI step to inject `VITE_SENTRY_RELEASE`.
- **Verification:** First synthetic error received in Sentry dashboard.

### OPN-P0-03 — Hosted CI run artifacts unproven
- **Surface:** CI/CD
- **Evidence:** `infra/ci/pipeline.yaml` defines 9 jobs but no green run artifact exists outside local `generated/*` outputs (`generated/release-pipeline-report.json` reflects local execution only).
- **Impact:** No external proof that the pipeline executes end-to-end on hosted infrastructure. Release gate cannot be flipped from "manual" to "enforced".
- **Remediation:** Trigger pipeline on hosted runner; archive `generated/` outputs as workflow artifacts; record run URL in `generated/hosted-ci-run.json`.
- **Verification:** One green workflow run with all 9 jobs passing.

### OPN-P0-04 — Apple Developer signing chain not configured
- **Surface:** Electron (mac) · iOS App Store
- **Evidence:** `generated/desktop-signing-status.json` → `apple.ready: false` (4 env vars missing: `APPLE_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`)
- **Impact:** Cannot produce notarized macOS builds; cannot ship to App Store / TestFlight.
- **Remediation:** Acquire Apple Developer membership ($99/yr), generate `Developer ID Application` + app-specific password, set 4 env vars in build secrets. `electron/forge.config.cjs` and `electron/entitlements.plist` are already wired.
- **Verification:** `verify-signing-credentials.ts` reports `apple.ready: true`; one notarized .dmg produced.

### OPN-P0-05 — Windows code-signing chain not configured
- **Surface:** Electron (win)
- **Evidence:** `generated/desktop-signing-status.json` → `windows.ready: false` (`CSC_LINK`, `CSC_KEY_PASSWORD` missing)
- **Impact:** SmartScreen warns on every install of unsigned `.exe`; enterprise distribution blocked.
- **Remediation:** Purchase EV or OV code-signing cert; upload `.pfx` to secret store; set `CSC_LINK` (path) + `CSC_KEY_PASSWORD`. `forge.config.cjs` `windowsSign` block already activates on env presence.
- **Verification:** `verify-signing-credentials.ts` reports `windows.ready: true`; signed installer passes Defender.

---

## 4. Section B — P1 Scale & Hardening Gaps (Open) · 8

| ID | Surface | Issue | Evidence | Remediation |
|---|---|---|---|---|
| **OPN-P1-01** | Backend | 41 Investment Office pages share a single generic `business-api` edge function | `generated/edge-function-membership.json` | Split into `investment-portfolio-api`, `investment-strategy-api`, `investment-execution-api`. Migrate per-page calls. |
| **OPN-P1-02** | Lib | Namespace duplication: `src/lib/engine/` vs `src/lib/engines/` | filesystem | Pick one (`engines/` plural is current convention); move + redirect imports; add ESLint rule blocking the deprecated path. |
| **OPN-P1-03** | Admin | 15 admin pages exceed `FounderControlShell` module budget (lines/imports) | `generated/component-governance-report.json` | Extract sub-routes; move heavy widgets to lazy-loaded panels. |
| **OPN-P1-04** | Mobile iOS | Apple APNs push transport not wired (deferred per `constraints/push-notification-scope`) | `generated/push-notification-audit.json` | Provision APNs key after Apple Dev membership; add `apns-dispatch` edge function variant. Until then: continue classifying as `planned`. |
| **OPN-P1-05** | Mobile Android | Android FCM transport not wired | runtime secrets list (no `FCM_SERVICE_ACCOUNT_JSON`) | Create Firebase project; download service account JSON; add as secret; add `fcm-dispatch` edge function variant; wire Capacitor `PushNotifications` plugin. |
| **OPN-P1-06** | Auth | OAuth provider catalogue limited to Google/Apple/Email — GitHub, Discord, Facebook not exposed in Lovable Cloud auth | `supabase--configure_social_auth` capability list | Add GitHub provider when developer-segment users requested; document Discord/Facebook as out-of-platform. |
| **OPN-P1-07** | Boardroom | No real-time multi-user co-presence (`presence` channels) | `generated/feature-integration-index.json` | Add Supabase Realtime `presence` channel keyed by `boardroom_session_id`; render avatar stack + cursor positions. |
| **OPN-P1-08** | Infra | Backup verification cron job missing | edge function topology | Add `backup-verify` scheduled function: PITR probe + restore-to-temp assertion; emit receipt to `flagship_loop_completions`. |

---

## 5. Section C — P2 Quality & Coverage Gaps (Open) · 7

| ID | Surface | Issue | Remediation |
|---|---|---|---|
| **OPN-P2-01** | Quality | E2E suite (56 specs) has no a11y harness | Add `@axe-core/playwright`; new `a11y.spec.ts` over 10 critical routes; attach JSON report to CI artifacts. |
| **OPN-P2-02** | Performance | No Lighthouse / perf budget gate | Add `.lighthouserc.json` (LCP < 2.5s, CLS < 0.1, TBT < 200ms); CI job runs against preview URL. |
| **OPN-P2-03** | Design system | No Storybook for 922 components | Stand up Storybook 8; auto-generate stories from component prop types; visual catalogue link in `/admin/design`. |
| **OPN-P2-04** | Type safety | `as any` cleanup pending — 68 page-level instances (ISS-091) | Replace with explicit DTOs from `src/lib/contracts/`; add ESLint rule `@typescript-eslint/no-explicit-any` at `error`. |
| **OPN-P2-05** | AI / RAG | No vector search or pgvector edge function despite AI-heavy product | Enable `pgvector` extension; `embeddings` table; `embed-and-search` edge function; wire into Concierge memory. |
| **OPN-P2-06** | Compliance | `trim_kill_switch_audit_log()` exists but no scheduled trigger (pg_cron not wired) | Enable `pg_cron`; schedule `SELECT trim_kill_switch_audit_log(90)` daily at 03:00 UTC. Same for `flagship_loop_completions` (180-day TTL). |
| **OPN-P2-07** | Governance | Several `generated/` reports >24h old | Add CI step: regenerate full `generated/*` set on every `main` push; fail on any artifact > 24h at release time. |

---

## 6. Section D — P3 Polish & Future Work (Tracked) · 5

| ID | Surface | Issue | Notes |
|---|---|---|---|
| **OPN-P3-01** | Design | Visual regression tests (Percy / Chromatic) absent | Wait for Storybook (OPN-P2-03) first. |
| **OPN-P3-02** | Docs | OpenAPI / contract docs missing for 128 edge functions | Auto-generate from `src/lib/contracts/` Zod schemas. |
| **OPN-P3-03** | Supply chain | SBOM (CycloneDX) not generated in CI | `npx @cyclonedx/cyclonedx-npm` step in pipeline. |
| **OPN-P3-04** | Observability | Synthetic monitoring (uptime probes) for 5 flagship paths absent | Use Better Stack or self-host via `synthetic-probe` cron edge function. |
| **OPN-P3-05** | FinOps | Cost-attribution dashboard (AI invocations → tenant → budget class) not built | Data is collected (`ai_usage_ledger`); needs Recharts surface in `/admin/ai-runtime`. |

---

## 7. Section E — Per-Surface Deployment Readiness Matrix

| Surface | Status | Active Blockers | Decision |
|---|---|---|---|
| Web SPA (Tier 1) | ✅ ready | none | **GO** |
| PWA installable | ✅ ready | manifest + service worker present | **GO** |
| Edge Functions backend (128) | ✅ ready | none | **GO** |
| Database (303 tables · 100% RLS) | ⚠️ near-ready | OPN-P0-01 | **CONDITIONAL** |
| Observability | ⚠️ wired-inert | OPN-P0-02 | **CONDITIONAL** |
| Appliance ISO (Tier 3) | ✅ ready | `generated/deployability-report.json` ok | **GO** |
| Electron Desktop — macOS | 🔴 blocked | OPN-P0-04 | **NO-GO** |
| Electron Desktop — Windows | 🔴 blocked | OPN-P0-05 | **NO-GO** |
| Electron Desktop — Linux | ✅ ready (zip maker active) | none | **GO** |
| iOS App Store | 🔴 blocked | OPN-P0-04 + OPN-P1-04 | **NO-GO** |
| Android Play Store | 🔴 blocked | OPN-P1-05 (FCM) | **NO-GO** |
| Hosted CI/CD | 🔴 unproven | OPN-P0-03 | **NO-GO** |

---

## 8. Section F — Wiring Gaps Register (Frontend ↔ Backend ↔ DB)

| # | Join Point | Gap | Remediation |
|---|---|---|---|
| F-01 | Investment Office pages → backend | All 41 pages call generic `business-api` | OPN-P1-01 (split into 3 dedicated functions) |
| F-02 | Boardroom multi-user → realtime | No `presence` channel established | OPN-P1-07 |
| F-03 | DSAR (`data-export`) edge function → UI | Function deployed, no Settings surface | Add `/settings/privacy` panel with "Export my data" + "Delete my account" buttons calling existing functions. |
| F-04 | Sentry release tagging | Code reads `VITE_SENTRY_RELEASE`; no CI step injects it | Add release-injection step (depends on OPN-P0-02). |
| F-05 | `trim_kill_switch_audit_log` → schedule | Function exists, no cron trigger | OPN-P2-06 |
| F-06 | `account_deletion_requests` → purge worker | Soft-delete writes scheduled time; no scheduled hard-purge worker | Add `account-purge` cron edge function reading rows where `scheduled_purge_at <= now()`. |
| F-07 | `data_export_requests` → storage | Export JSON returned in-band; no archive in `user-files` for audit | Persist export to `user-files/<uid>/exports/<request_id>.json`. |

---

## 9. Section G — Integration Register

| Integration | Status | Configured Secret(s) | Gap |
|---|---|---|---|
| Lovable AI Gateway | ✅ live | `LOVABLE_API_KEY` | none |
| OpenAI direct | ✅ keys set | `OPENAI_API_KEY` | gateway-only convention; no direct SDK use |
| Anthropic direct | ✅ keys set | `ANTHROPIC_API_KEY` | gateway-only convention |
| Twilio SMS | ✅ keys set | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | no E2E flow proof |
| Shopify | ✅ tokens set | `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | E2E proof missing |
| Stripe payments | ⚠️ scaffold | — | not enabled in payments tool; `payment-process` function uses generic adapter |
| Web Push (VAPID) | ✅ live | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | none |
| Apple APNs | 🔴 deferred | — | requires Apple Developer membership (OPN-P0-04) |
| Android FCM | 🔴 missing | — | requires Firebase service account (OPN-P1-05) |
| Sentry | ⚠️ wired-inert | — | DSN not set (OPN-P0-02) |
| Hosted CI | 🔴 unproven | — | no green workflow artifact (OPN-P0-03) |
| Google OAuth | ✅ available | provider config | enable in `supabase--configure_social_auth` when ready |
| Apple OAuth | ✅ available | provider config | enable in `supabase--configure_social_auth` when ready |
| GitHub OAuth | ⚠️ supported | — | not yet enabled |

---

## 10. Section H — Secret & Configuration Gaps

Required to flip **NO-GO** surfaces to **GO**.

| Secret / Config | Surface unblocked | Owner |
|---|---|---|
| `VITE_SENTRY_DSN` | Observability | OPN-P0-02 |
| `SENTRY_AUTH_TOKEN` | Observability (release tagging) | OPN-P0-02 |
| `APPLE_IDENTITY` | macOS / iOS signing | OPN-P0-04 |
| `APPLE_ID` | macOS notarization | OPN-P0-04 |
| `APPLE_PASSWORD` | macOS notarization | OPN-P0-04 |
| `APPLE_TEAM_ID` | macOS / iOS signing | OPN-P0-04 |
| `CSC_LINK` | Windows signing | OPN-P0-05 |
| `CSC_KEY_PASSWORD` | Windows signing | OPN-P0-05 |
| `FCM_SERVICE_ACCOUNT_JSON` | Android push | OPN-P1-05 |
| (workspace-level) Hosted CI runner credentials | Hosted CI | OPN-P0-03 |

Currently configured (no action needed): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `LOVABLE_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `TWILIO_*`, `SHOPIFY_*`, `VAPID_*`.

---

## 11. Section I — Evidence Index

| Claim | Evidence file |
|---|---|
| 1,040 pages · 922 components · 169 hooks · 1,835 lib modules | live filesystem scan |
| 128 edge functions | `supabase/functions/` directory listing |
| 303 tables · 652 policies · 0 RLS-no-policy | `get_db_truth_snapshot('drift')` |
| 13/13 "It's Real" verdict | `generated/its-real-gate-report.json` |
| Supabase linter: 1 WARN | `supabase--linter` |
| Mobile readiness | `generated/mobile-store-readiness-report.json` |
| Desktop signing readiness | `generated/desktop-signing-status.json` |
| Appliance readiness | `generated/deployability-report.json` |
| Edge function classification | `generated/edge-function-membership.json` |
| Push notification audit | `generated/push-notification-audit.json` |
| Component governance | `generated/component-governance-report.json` |
| Feature integration | `generated/feature-integration-index.json` |
| Release pipeline | `generated/release-pipeline-report.json` |

---

## 12. Section J — Deployment Decision

### What ships today (GO)
- **Web SPA** — Tier 1 production
- **PWA** — installable on all evergreen browsers
- **Edge Functions backend** — 128 functions, 100% RLS coverage
- **Appliance ISO** — Tier 3 deployable
- **Electron Linux** — unsigned tar.gz acceptable for Linux distribution

### What is conditional (CONDITIONAL — flip after the named secret is set)
- **Database** — flips to GO once OPN-P0-01 migration ships
- **Observability** — flips to GO once `VITE_SENTRY_DSN` is set

### What does NOT ship (NO-GO)
- **Electron macOS / Windows** — blocked on signing chains (OPN-P0-04, OPN-P0-05)
- **iOS App Store** — blocked on Apple Developer membership (OPN-P0-04 + OPN-P1-04)
- **Android Play Store** — blocked on Firebase service account (OPN-P1-05)
- **Hosted CI/CD** — blocked on first green hosted run (OPN-P0-03)

### Closing note
This document is intentionally short on history and long on truth. When an item closes, it disappears from this register. The next regeneration will reflect a smaller list — that is the goal.

— *End of register · v2.0*
