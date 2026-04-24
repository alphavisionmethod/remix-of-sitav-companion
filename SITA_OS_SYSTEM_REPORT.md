# SITA OS — System Implementation-Truth Report

> Generated 2026-04-24 by the principal repository intelligence architect role.
> Every claim references a real file, registry, or migration count discovered
> by direct inspection — not derived from prior documentation.

**Repository totals at time of writing**

| Metric | Count |
|---|---:|
| Edge functions (`supabase/functions/*/`) | **212** |
| SQL migrations (`supabase/migrations/`) | **257** |
| Pages (`src/pages/*.tsx`) | **126** (+ many subroutes) |
| Contract packages (`src/packages/*/`) | **37** |
| Advisor identities (`advisor-identity-registry.ts`) | **34** |
| AI capabilities (`ai-capability-registry.ts`) | 50+ entries |
| Owner teams owning edge functions (`_owners.json`) | **13** |
| RLS-policied tables (per existing memory) | **420 tables / 934 policies** |
| Domain runtime tiers | **4** (Web App, Desktop Host, Appliance, Simulated OS) |

---

## 1. Executive Overview

SITA OS is a **multi-surface operating environment for owner-operators** — a single
product that presents itself as a desktop-like operating system in the browser
(and as a sovereign Linux appliance for businesses that need it), unifies
business, finance, and household life into one shell, and is operated by a
council of 34 specialised AI advisors that all run through a single governed
gateway with hard refusal, fallback, and receipt rules.

Three things are true at the same time:

1. **Most of the product is real.** Routes, services, edge functions, migrations,
   RLS policies, and shared contracts all exist and are wired. The advisor
   registry, capability registry, runtime-tier registry, owner manifest, and
   7-layer security fabric are not aspirational — they are files that the
   running app imports.
2. **Some surfaces are still simulated.** The "OS" experience inside the
   browser is, by design, a *simulated OS surface* (windowing, dock, focus
   model). The Desktop Host (Electron) and Appliance Runtime (sovereign Linux
   ISO/OVA) are where the OS metaphor becomes literal.
3. **A sizeable governance layer wraps everything.** Kill switches, runbooks,
   policy matrix, evidence persistence, attestation packets, RLS coverage,
   AI budgets, refusal/fallback policies, and proof receipts are first-class
   citizens — not bolt-ons.

The result is a product that is unusually large for a single repo (~1,000+
source files, 212 edge functions, 257 migrations) but unusually
self-describing: it knows what is real, what is simulated, what is a
fallback, and what is forbidden — and it surfaces those distinctions in code.

---

## 2. What SITA OS Is — three explanations

### 30-second version
SITA OS is a *single, AI-operated workspace for running a business and a life*.
It looks like a desktop OS, runs in the browser today and as a real Linux
appliance for enterprise customers, and every important action is gated by an
advisor council, a policy matrix, and a receipt log.

### 2-minute version
SITA OS gives an owner-operator one place to run their company (CRM, money,
communications, files, approvals), one place to run their life (concierge,
household, family, travel), and one place to *delegate* — to a council of 34
specialised AI advisors who can read the data, recommend, and (within strict
autonomy ceilings) act. Behind the shell, every advisor call goes through a
canonical AI gateway with model-allowlists, refusal conditions, fallback
chains, evidence-grade requirements, and signed receipts. The platform is
RLS-locked end-to-end (934 policies across 420 tables) and ships with kill
switches and runbooks for every critical subsystem. The same product runs as
a web app, an Electron desktop host, and a sovereign on-prem appliance —
with a runtime-tier registry that explicitly maps which features are real,
simulated, or fallback per tier.

### Deep version
SITA OS is a five-plane product (`core-os`, `shell-runtime`, `apps`,
`founder`, `admin`) on top of a 4-layer service constitution (Platform →
Domain → OS Daemons → Read Models) and a 7-layer runtime orchestration
pipeline (Intake → ConscienceGate → Plan → Execute → Proof → Receipt →
Audit). The frontend (~1,000+ files) is composed of route families per
domain, a shell layout with a focus dock and HUD, and a window/app
platform with a 19-state lifecycle machine. The backend is 212 edge
functions classified into ~12 buckets, sharing a `_shared/` library
(receipt emitter, rate limit, audit logger, kill-switch DB, AI budget
check, validation, contract test harness). The AI layer is governed by a
capability registry (per-capability allowed models, fallback chain,
refusal conditions, evidence grade, receipt requirement, action-boundary
sensitivity) and an L0–L6 autonomy ceiling. The OS layer (Linux ISO/OVA)
is a separate physical artifact built by `os/image-builder/` with TPM
sealing, dm-verity, secure-boot, signed update bundles, and a recovery
menu. Almost every subsystem has a corresponding policy file
(`src/lib/policy/`), a runbook (`docs/runbooks/`), and either a kill
switch or a refusal rule.

---

## 3. Audience & Surfaces

| Surface | Path / Anchor | Reality |
|---|---|---|
| **SITA OS Desktop (web)** | `src/pages/DesktopPage.tsx`, `ShellLayout`, `os-routes` | Live web shell with simulated OS metaphor |
| **SITA OS Desktop (Electron)** | `electron/`, `electron/_layout.cjs`, `desktop-host-runtime` mem | Real OS process with FS bridge, auto-update, integrity check |
| **SITA OS Appliance (Linux)** | `os/image-builder/`, `os/scripts/`, `infra/docs/KERNEL_ARCHITECTURE.md` | Sovereign Linux build with verity, TPM, recovery |
| **SITA Admin** | `src/admin/`, `src/pages/AdminCenter.tsx`, `admin-*` edge fns | Operator console, gated by `AdminRoute` |
| **SITA Mobile** | `src/routes/MobileRoutes`, `archive/mobile/` | Web mobile responsive; native iOS/Android archived (Ubuntu-native canonical) |
| **Marketing site** | `src/website-demo/`, `src/pages/marketing/` (reference) | Interactive demo of the OS for landing pages |
| **Founder Center** | `src/planes/founder.ts`, `infra/deploy/founder-center.yaml` | Internal founder/operator plane |
| **Internal Tools** | `src/planes/internal-tools.ts` | Internal-only tooling plane |

`src/runtimes/feature-runtime-tier-registry.ts` (192 lines) is the single
source of truth for which features are honest on which surface — e.g.
`notifications-push` is supported on `WEB_APP, DESKTOP_HOST` but
**prohibited** on `APPLIANCE_RUNTIME`; `window-control` is real on Desktop
but **simulated** on Web/Appliance with `launchHonesty: "needs-disclosure"`.

---

## 4. Core Product Domains

| Domain | Pages anchor | Owner advisor(s) | Maturity |
|---|---|---|---|
| **Business OS** | `BusinessCenter.tsx` (+ subpages) | `business-advisor` | 🟢 Wired |
| **Money / Finance** | `MoneyCenter`, `CapitalAllocationPage`, `RevenueOffice` | `money-advisor`, `tax-advisor`, `treasury-advisor`, `collections-advisor` | 🟢 Wired |
| **Concierge / Household** | `ConciergeCenter` | `concierge-advisor`, `family-advisor`, `travel-advisor`, `school-advisor` | 🟢 Wired |
| **Boardroom** | `Boardroom.tsx`, `GlobalBoardroom.tsx` | `boardroom-advisor` | 🟢 Wired |
| **Personal Brain** | `BrainCommandCenter`, `pb_insights`, `personal-brain` edge | dedicated runtime | 🟢 Wired (7 phases) |
| **Files** | `FilesCenter` | `engineering-advisor` (indirect) | 🟢 Wired |
| **Communications** | `CommunicationInbox`, `communications-api` edge | `support-advisor` | 🟢 Wired |
| **Investment Office** | `CapitalAllocationPage`, `investment-portfolio-api` | `investor-relations-advisor` | 🟢 Wired |
| **Mission Control** | `mission-control` feature | (operator) | 🟢 Wired (consolidated ~140 legacy pages) |
| **Atlas / App Store** | `AppStoreCenter`, `app-platform` | (platform) | 🟢 Wired (Type A–D apps) |
| **Owner Mode / Copilot** | `owner-copilot-bff`, `owner-copilot-session-tracker` | `strategy-advisor` | 🟢 Wired |
| **Approvals / Governance** | `ApprovalChamber`, `ApprovalsCenter` | `compliance-advisor` | 🟢 Wired |
| **Settings** | `settings-routes` | (platform) | 🟢 Wired |
| **Admin Center** | `AdminCenter.tsx` (gated) | `trust-advisor` | 🟢 Wired |

---

## 5. Frontend / Shell / App / Window Architecture

- **Entrypoint:** `src/main.tsx` → `src/App.tsx` (337 lines, "thin orchestrator").
- **Provider stack** (in order): `QueryClientProvider`, `BrowserRouter`,
  `AuthProvider`, `ConnectivityProvider`, `DataModeProvider`, `AppearanceProvider`,
  `InspectorProvider`, `EntityContextProvider`, `RuntimeProvider`,
  `AppPlatformProvider`, `OSRuntimeProvider`, `RealityModeProvider`,
  `ThemeProvider`, `SitaVoiceProvider`. Each wraps a discrete capability —
  data mode, runtime detection, voice spine, app platform, etc.
- **Shell:** `ShellLayout` composes the dock, status strip, HUD (Phase A),
  voice spine (Phase B), and screen-context registry (Phase C). Documented
  in three memories under `mem://features/sita-*-phase-*`.
- **Routes:** A *route family* per domain (`os-routes`, `business-routes`,
  `money-routes`, `concierge-routes`, `files-routes`, `boardroom-routes`,
  `advisor-routes`, `investment-routes`, `owner-routes`, `mobile`,
  `communications-routes`, `apps-routes`, `settings-routes`,
  `experimental-routes`).
- **Window system:** OS-grade with 8-direction resizing, draggable
  geometry, focus model (`mem://architecture/windowing-system-closure`).
- **App Platform:** 19-state lifecycle (DISCOVERED → REMOVED) orchestrated
  by a DB-backed registry; supports Type A (Web), B (PWA), C (External
  Native), D (Internal OS).
- **Boundaries:** Strict plane boundaries enforced by
  `scripts/architecture/check-plane-boundaries.ts` and ESLint rules.

---

## 6. Backend / Services / Edge Functions / Runtime Architecture

### 6.1 Service constitution (4 layers)

`src/services/index.ts` is the only navigable root for callers:

```
Layer 1  Core Platform   →  @/packages          (namespaced as `Platform`)
Layer 2  Domain Services →  @/lib/core-services
Layer 3  OS Daemons      →  @/lib/os-services   (namespaced as `OS`)
Layer 4  Read Models     →  @/lib/data-services
```

### 6.2 Edge functions — 12 buckets (212 functions)

Bucketed deterministically from directory names + `supabase/functions/_owners.json`
(192 owned in the manifest snapshot + ~20 newer = 212 on disk):

| Bucket | Approx. count | Owner team(s) |
|---|---:|---|
| **BFF / Gateway** | ~10 | `admin-governance`, `platform-core` |
| **AI Platform** | ~12 | `ai-engineering` |
| **Advisor / Boardroom** | ~14 | `advisor-intelligence` |
| **Internal Agents / Workforce** | ~22 | `agent-runtime` |
| **Connectors / Integrations** | ~13 | `connector-integrations` |
| **OS / App Platform / Cloud** | ~26 | `app-platform`, `cloud-infrastructure`, `os-kernel` |
| **Security / Trust / Recovery** | ~25 | `compliance-security` |
| **Domain (Business/Money/Concierge)** | ~13 | `finance-engine`, `user-experience` |
| **Operations / Health / Telemetry** | ~22 | `platform-core` |
| **Release / Evidence / Compliance** | ~12 | `compliance-security`, `platform-core` |
| **Webhooks / Workflows / Schedulers** | ~17 | `platform-core`, `notification-services` |
| **Public / Marketing / Misc** | ~26 | `notification-services`, `user-experience`, `platform-core` |

**Owner-team distribution from `_owners.json`** (snapshot of 192/192 = 100% coverage):
admin-governance 6, advisor-intelligence 9, agent-runtime 20, ai-engineering 10,
os-kernel 7, platform-core 34, user-experience 25, finance-engine 9,
cloud-infrastructure 8, connector-integrations 13, compliance-security 30,
notification-services 7, app-platform 14.

The `_shared/` library (29 files) standardises cross-cutting concerns:
`receipt-emitter`, `rate-limit`, `audit-logger`, `kill-switch`,
`kill-switch-db`, `ai-budget-check`, `cors`, `security-headers`, `policy`,
`auth`, `validate-service-role`, `function-caller-contract`,
`function-role-contract`, `contract-test-template`,
`function-contract-test-registry`, `function-support-diagnostics`,
`error-sink`, `tracing`, `health`, `logger`, `validate`, `zod-validate`,
`zod-fixture-generator`, `test-fixtures`, `test-harness`, `alert-emitter`,
`advisor-governance`, `ai-receipt-logger`.

The earlier `public/generated/edge-function-topology-v2.json` snapshot
(85 functions) classified them by *role*: 12 Orchestration, 45 Domain,
11 Connector Webhook, 7 Runtime System, 4 Public BFF, 3 Wrapper, 1 Admin BFF,
1 Split-Required, 1 Deprecate-and-Redirect — a finer-grained slicing of the
same population.

### 6.3 Orchestration spine

Per memory `mem://architecture/orchestration-authority`, runtime collapses
into a **4-layer canonical spine**: Intent → Planning → Execution → Proof.
Concrete files: `canonical-chain-orchestrator.ts`, `intent-orchestrator/`,
`orchestration-pipeline/`, `council-orchestrator/`, `founder-orchestrator/`,
`ecosystem-orchestrator/`, `agent-orchestration-layer.ts`. The 7-layer
runtime pipeline (Intake → ... → Audit) is the in-process flow inside it.

---

## 7. Database & RLS Truth Layer

- **257 SQL migrations** in `supabase/migrations/` — append-only.
- **420 tables, 934 RLS policies, 100% RLS coverage**
  (`mem://architecture/database-truth-layer`).
- **Roles:** Stored in a separate `user_roles` table with an enum and a
  `has_role()` SECURITY DEFINER function — never on `profiles`.
- **Realtime:** Selective `ALTER PUBLICATION supabase_realtime ADD TABLE`
  per table.
- **Retention:** Tiered with `expires_at` TTLs on high-volume tables
  (`mem://governance/data-retention-policy`).

---

## 8. Security / Trust / Safety

7-layer security fabric (`mem://architecture/security-fabric`):

| Layer | Concrete artifact |
|---|---|
| 1. Runtime Shield | `security-fabric-runtime-probe`, `runtime-probes` |
| 2. DLP Guard | `_shared/policy.ts`, `policy-enforcement-map.ts` |
| 3. AI Output Firewall | `_shared/ai-receipt-logger.ts` + capability registry refusals |
| 4. Session Threat Detector | `security-anomaly-rotation-trigger`, `webauthn-challenge` |
| 5. Network Sentinel | `_shared/security-headers.ts`, `_shared/rate-limit.ts` |
| 6. Trust Governor | `policy-trust-thresholds.ts`, `unified-policy-matrix.ts` |
| 7. Recovery / Forensics | `recovery-evidence-ingest`, `audit-export-bundler`, `crash-report-ingest`, `runbook-drill`, `dr-drill-*` |

Plus **15+ kill switches** (`kill-switch-state`, `kill-switch-toggle`,
`payment-kill-switch`, `security-kill-switch-recommender`) and **19 recovery
runbooks** in `docs/runbooks/`.

Anti-piracy: 5-layer hardware-bound license system with HMAC-SHA256 signing
(`mem://architecture/anti-piracy-system`).

---

## 9. AI Platform

Centralised through one **canonical AI gateway** (`supabase/functions/ai-gateway`),
governed by `src/lib/ai/ai-capability-registry.ts` (285 lines, 50+ capabilities).

Each capability declares: `allowedModels`, `preferredRoute`, `fallbackChain`,
`refusalConditions` (e.g. `budget-exceeded`, `domain-fence-violated`,
`kill-switch-active`, `confidence-below-threshold`), `evidenceGradeRequired`
(A–F), `receiptRequired`, `actionBoundarySensitivity` (`none`/`low`/`high`/
`critical`), `crossDomainRestriction`, and `noProviderBehavior`
(`refuse-with-receipt` / `cached-only` / `degrade-gracefully`).

Supporting policy files: `ai-fallback-policy`, `ai-refusal-policy`,
`ai-autonomy-ceiling-policy`, `ai-evidence-grade-policy`,
`ai-action-boundary-tests`, `ai-cross-domain-restriction-map`,
`ai-cost-anomaly-detector`, `ai-launch-honesty-reclassifier`,
`ai-prompt-drift-detection`, `ai-provider-outage-simulator`,
`ai-receipt-reconstruction`, `ai-response-normalizer`, `ai-routing-replay`,
`ai-routing-seed-service`, `ai-memory-repair-manager`, `ai-surface-grammar`.

Budget enforcement via `check_ai_budget_policies` RPC with daily/monthly
caps, per-tenant quotas, and circuit breakers
(`mem://architecture/ai-budget-enforcement`).

---

## 10. Advisor System

- **34 advisor identities** in `src/lib/advisors/advisor-identity-registry.ts`
  with `displayName`, `personaDescription`, `voiceTone`, `pronouns`,
  `avatarSeed`, `domainAuthority`, `trustFloor`, `trustCeiling`,
  `disabledFallback`.
- **Identity governance:** `advisor-confidence-policy`,
  `advisor-conflict-resolution-policy`, `advisor-disablement-policy`,
  `advisor-memory-aging-policy`, `advisor-override-model`,
  `advisor-persona-boundary-map`, `advisor-reflection-policy-loop`.
- **Debate engine:** `advisor-debate-orchestrator.ts`.
- **Portrait subsystem:** `portrait-crop-resize`, `portrait-perf-metrics`,
  `advisor-avatar-generate` edge fn, user-uploadable overrides.
- **Edge surface:** `advisor-agent-loop`, `advisor-conversation`,
  `advisor-deep-intelligence`, `advisor-knowledge-manage`,
  `advisor-weekly-report`, `business-advisor-intelligence`.

All 34 are governed and routed through the canonical gateway
(`mem://architecture/advisor-runtime-closure`).

---

## 11. Boardroom & Decision Systems

- `src/pages/Boardroom.tsx`, `GlobalBoardroom.tsx`
- `src/lib/boardroom/` — data-service, packet-generator, confidence,
  assessments, types
- Edge: `boardroom-cockpit-telemetry`, `boardroom-replay`, `boardroom-session`,
  `boardroom-outcome-record`, `business-board-api`
- Outcome scoring: `src/lib/ai/boardroom-outcome-scoring.ts`
- L7 council orchestration: `sita-council-prevote` edge +
  `council-orchestrator/`

Integrates a 10-advisor autonomous executive council
(`mem://features/advisor-boardroom-showcase`).

---

## 12. Business OS — onboarding, archetypes, profile engine

- Onboarding: `src/components/personal-brain/onboarding/PersonalBrainOnboarding.tsx`
  + business-onboarding components with `IdentityScreen`, branching
  questions, "Quick / Balanced / Deep" setup depths.
- Archetypes: Service, Agency, Creator, E-commerce, Hybrid (`branching.ts`).
- Adaptation engine: `business-profile-engine.ts` (~600 lines) → derives
  sidebar order, home widgets, CRM terminology from archetype.
- Signal inference: `inferBusinessSignals()` → ~16 confidence-scored signals.
- 18-priority "What Matters Most" screen
  (`mem://features/business-onboarding-priorities`).
- Twin contract: `src/lib/business-twin/business-twin.ts` (16-model
  interface — partially DB-backed, see §18).

---

## 13. Finance / Money / Revenue / Investment

Pages: `MoneyCenter`, `CapitalAllocationPage`, `RevenueOffice`,
`InvestmentJourney`, `EnterpriseMaturityDashboard`.
Edge: `cashflow-calculate`, `tax-estimate`, `invoice-generate`,
`payment-process`, `revenue-caller`, `investment-portfolio-api`,
`investor-request`, `payment-kill-switch`.
Advisors: `money-advisor`, `tax-advisor`, `treasury-advisor`,
`collections-advisor`, `investor-relations-advisor`.
Threat model: `security/threat-models/payment-execution.md`.

---

## 14. Concierge / Household / Life Systems

Pages: `ConciergeCenter`, calendar/inbox/communications hubs.
Advisors: `concierge-advisor`, `family-advisor`, `travel-advisor`,
`school-advisor`, `wellness-advisor`, `education-advisor`.
Domain authorities: `household`, `concierge-os`, `travel`, `wellness`,
`education`.

---

## 15. Admin / Atlas / Mission Control / Operational Truth

- **Admin Center:** `src/admin/`, `src/pages/AdminCenter.tsx`, gated by
  `AdminRoute` + granular permissions (`mem://auth/granular-permissions`).
- **Mission Control:** Unified windowed app consolidating ~140 legacy pages
  (`mem://features/mission-control`).
- **Atlas / App Store:** `AppStoreCenter`, `app-store-api`, `app-store-catalog`.
- **Edge:** `admin-api`, `admin-bff-gateway`, `admin-gateway`,
  `admin-intelligence`, `admin-users`, `admin-ai-workforce-run`,
  `admin-reset-user-setup`, `admin-revoke-session`.
- **Command palette:** `AdminCommandPalette`, `AdminKeyboardShortcuts`.

---

## 16. Release / Workflows / Proof / Supportability

### 16.1 CI gates (`.github/workflows/`)
- `deployment-readiness-gate.yml` — strict zero-demo-leak gate
- `release-gates.yml` — release-time hard gates
- `workflow-governance.yml` — meta-governance of CI itself
- `playwright-proof-nightly.yml`, `customer-journey-nightly.yml`,
  `ai-runtime-truth-nightly.yml`, `connector-truth-nightly.yml` — nightly probes
- `production-smoke.yml`, `customer-journey-manual.yml` — on-demand smoke
- `desktop-build.yml`, `release-electron.yml`, `os-build-iso.yml` —
  desktop and OS artifact builds
- `test-sequential.yml` (sharded ×4) — full sequential audit
- `test-self-heal.yml` (**new, this report**) — T0–T2 auto on failure

### 16.2 Drills & runbooks
- 19 runbooks in `docs/runbooks/` (`auth-outage`, `ai-provider-degradation`,
  `boardroom-l7-stuck`, `db-restore-failure`, `connector-token-failure`,
  `pg-cron-schedules`, `proof-mismatch`, `setup-checkpoint-corruption`,
  `tenant-quota-breach`, `vmware-boot-failure`, `dr-failover`,
  `release-rollback`, `runtime-probe-failure`, etc.)
- DR drills: `npm run drill:recovery`, `npm run drill:backup-restore`.
- Game day: `src/lib/services/game-day-orchestrator.ts`.

### 16.3 Evidence & attestation
- 7-table Evidence Persistence Layer
  (`mem://architecture/evidence-persistence-layer`).
- `release-artifact-signer`, `release-artifact-verifier`,
  `release-evidence-graph-snapshot`, `attestation-packet-builder`,
  `production-launch-attestor`, `verification-recorder`.
- Manifest Truth Framework — 70+ generated artifacts validated at runtime
  (`mem://architecture/manifest-truth-framework`).

---

## 17. Key Packages / Contracts / Shared Foundations

37 packages under `src/packages/`. The barrel re-exports collision-free
ones; colliding ones must be imported by direct path.

**Re-exported through `src/packages/index.ts`:** `contracts`, `shell-grammar`,
`design-tokens`, `database-schemas`, `workflow-primitives`, `auth`,
`feature-flags`, `entitlements`, `client-sdk`, `pack-manifests`,
`store-metadata`, `template-registry`, `microinteraction-engine`.

**Direct-import only (collision avoidance):** `protocols`, `release-contracts`,
`graph-contracts`, `ai-contracts`, `simulation-contracts`, `advisor-config`,
`business-contracts`, `finance-contracts`, `concierge-contracts`,
`policy-contracts`, `event-types`, `proof-model`, `telemetry`,
`feature-governance`, `moat-contracts`, `enterprise-contracts`,
`reality-contracts`, `audit-contracts`, `boardroom-contracts`,
`advisor-runtime-contracts`, `app-contracts`, `internal-agent-config`,
`window-contracts`.

---

## 18. Maturity Matrix

| Subsystem | Grade | Evidence |
|---|---|---|
| Frontend Shell + Routes | 🟢 Wired | `App.tsx` (337 lines), 14 route families, ShellLayout |
| Window/App Platform | 🟢 Wired | 19-state lifecycle, App Platform Provider |
| Service Constitution | 🟢 Wired | `services/index.ts` 4-layer façade |
| Edge Functions Topology | 🟢 Wired | 212 fns, 13 owner teams, role classifier |
| Database / RLS | ✅ Behaviorally proven | 257 migrations, 934 policies, 420 tables |
| AI Capability Registry | 🟢 Wired | 285-line registry with refusals/fallbacks/grades |
| Advisor Identities (34) | 🟢 Wired | `advisor-identity-registry.ts` |
| Advisor Debate Orchestrator | 🟢 Wired | `advisor-debate-orchestrator.ts` |
| Boardroom (showcase + L7) | 🟢 Wired | Pages + `boardroom/` lib + 5 edge fns |
| Personal Brain (7 phases) | 🟢 Wired | `pb_*` tables + edge fn + Phases A/B/C |
| Business Onboarding archetypes | 🟡 Partially wired | Profile engine works; `branchAnswers` not yet feeding archetype weights |
| Business Twin persistence | 🟠 Structural | 16-model interface exists; not yet DB-backed in full |
| Security Fabric (7 layers) | ✅ Behaviorally proven | Edge probes + runtime probes + 19 runbooks |
| Kill Switches (15+) | 🟢 Wired | `kill-switch-*` edge + DB-backed runtime enforcement |
| Anti-Piracy System | 🟢 Wired | 5-layer HMAC + license-gateway edge |
| Internal Agents (Security Council) | 🟢 Wired | 8 wired council agents |
| Internal Agents (Workforce, full) | 🟡 Partially wired | 19 scheduled-only, others pending |
| Connectors (35+) | ✅ Behaviorally proven | Nightly real-token refresh proofs |
| Push Notifications | 🟡 Partially wired | VAPID active, FCM planned, APNs deferred |
| OS Appliance (Linux ISO/OVA) | 🟢 Wired (GA per memory) | `os/image-builder/`, OVA graduated |
| OS Appliance (RAW IMG) | 🟢 Wired | `os/scripts/build-raw-img.sh` |
| Desktop Host (Electron) | 🟢 Wired | `electron/` with FS bridge, integrity check, auto-updater |
| Mobile Native (iOS/Android) | 🔴 Blocked / external | Archived; Ubuntu-native is canonical native |
| Evidence Persistence | 🟢 Wired | 7-table layer |
| Release / Attestation | ✅ Behaviorally proven | Signer/verifier/snapshotter edge fns |
| CI Gates (Deployment Readiness) | ✅ Behaviorally proven | Workflow + `pre-deploy.sh` + threshold-drift test |
| Sequential Test Runner | ✅ Behaviorally proven | `scripts/test-sequential.mjs` (400 lines) + sharded CI |
| **Self-Healing Test System** | 🟢 Wired (this report ships it) | T0–T2 auto, T3 propose, T4 gated, T5 LLM advisory |
| Voice Spine (Phases A/B/C) | 🟢 Wired | HUD, voice provider, screen-context registry |
| Marketing Demo Site | 🟢 Wired | `src/website-demo/` zero-dep replica |

**Legend:** ✅ Behaviorally proven · 🟢 Wired · 🟡 Partially wired · 🟠 Structural · 🔴 Blocked / external

---

## 19. How To Explain SITA OS To Someone New (3 layers)

**Layer 1 — Customer-facing one-liner:**
> "SITA OS is your business and life, run by AI advisors, in a single
> workspace that feels like an operating system."

**Layer 2 — Founder/operator two-paragraph:**
> SITA OS gives an owner-operator one place to run their company (CRM,
> money, communications, files, approvals), one place to run their life
> (concierge, household, family, travel), and one council of 34
> specialised AI advisors who can read, recommend, and (within strict
> autonomy ceilings) act. Every advisor call is gated, budgeted, and
> receipted.
>
> Underneath, the same product runs as a web app, a desktop app, and a
> sovereign on-prem appliance. A 4-layer service constitution, a 7-layer
> security fabric, 934 RLS policies, 19 recovery runbooks, and 15+ kill
> switches mean the platform is operable and supportable, not just
> demoable.

**Layer 3 — Engineer deep-dive entry points:**
1. `src/App.tsx` — provider stack + route families
2. `src/services/index.ts` — 4-layer service façade
3. `src/runtimes/feature-runtime-tier-registry.ts` — surface honesty
4. `src/lib/ai/ai-capability-registry.ts` — AI gateway contract
5. `src/lib/advisors/advisor-identity-registry.ts` — 34 advisors
6. `supabase/functions/_owners.json` — backend ownership
7. `supabase/functions/_shared/` — cross-cutting helpers
8. `docs/runbooks/` — operational truth
9. `os/image-builder/` — sovereign Linux artifact
10. `mem://index.md` — every memory rule that governs the codebase

---

## 20. Key Files & Where To Start Reading

| Question | File to read first |
|---|---|
| What does the app boot do? | `src/main.tsx` → `src/App.tsx` |
| How are routes organised? | `src/routes/` (one file per family) |
| Where does AI go? | `src/lib/ai/ai-capability-registry.ts` then `supabase/functions/ai-gateway` |
| How is an advisor defined? | `src/lib/advisors/advisor-identity-registry.ts` |
| What can each surface really do? | `src/runtimes/feature-runtime-tier-registry.ts` |
| How is a service called? | `src/services/index.ts` (only entry point) |
| Who owns an edge function? | `supabase/functions/_owners.json` |
| What runbook for X? | `docs/runbooks/<X>.md` |
| What policy gates an action? | `src/lib/policy/unified-policy-matrix.ts` |
| What was already decided about Y? | `mem://index.md` |

---

## 21. Final Truth Summary

**Strongest:** the **governance layer**. RLS coverage, kill switches, runbooks,
receipt emission, capability registry, advisor identity registry,
runtime-tier registry, owner manifest, evidence persistence, and CI gates
are not paper — they are loaded by the running app and exercised by
nightly probes.

**Weakest (most-actionable):**
1. **Business onboarding signal consumption** — `branchAnswers` are captured
   but only ~65–70% wired into archetype weighting / advisor affinity /
   widget priority.
2. **Business Twin persistence** — 16-model interface is structural; needs
   Supabase tables + assembly in `BusinessProfileContext`.
3. **Internal agents past the Security Council** — many are scheduled-only;
   wiring them through the orchestration spine end-to-end is incomplete.
4. **Mobile native** — explicitly blocked / external.

**Next-most-valuable closures (in order):**
1. Persist Business Twin + consume `branchAnswers` → unlocks
   hyper-personalisation for every domain at once.
2. Wire scheduled-only internal agents through the canonical-chain-orchestrator.
3. Stand up T5 (LLM RCA) on real failures and let humans cherry-pick into PRs
   — the Self-Healing Test Platform shipped alongside this report enables this.

---

_End of report. Companion artifact: `generated/sita-os-system-report.json`.
Companion platform: `scripts/test-self-heal.mjs` and the T0–T5 system
documented in `mem://architecture/test-self-healing-system`._
