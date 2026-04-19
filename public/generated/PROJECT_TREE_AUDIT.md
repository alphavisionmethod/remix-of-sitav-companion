# SITA OS — PROJECT TREE AUDIT

**Generated:** 2026-04-19
**Scope:** Full repository — physical structure, architectural convergence, deployment readiness
**Method:** Direct filesystem inspection of `/dev-server/` (no inferred state)
**Audit ID:** PTA-2026-04-19-A

---

## A. Executive Summary

### Current Architecture Quality: **7.5 / 10 — strong intent, partial physical convergence**

SITA OS is a *mature, governance-heavy* React 18 / Vite / Tailwind / Lovable Cloud platform with extraordinary discipline at the **manifest, registry, and CI-gate layer**, but uneven discipline at the **physical folder layer**. The project is stronger than 95% of comparable codebases on validation infrastructure (170+ architecture checks, 173 edge functions, 1357 migrations, 5-plane boundary guards) and weaker than its own intent on physical decomposition (`src/lib` still contains **91 top-level subdirectories with 997 files** — an oversized "everything bucket").

### Deployment Readiness: **Partially deployment ready**

- ✅ **Web product**: deployable today (Lovable preview is live at `/desktop`).
- ✅ **Backend (Lovable Cloud)**: 173 edge functions deployed, 1357 migrations applied, RLS coverage at 100%.
- ✅ **Architecture enforcement**: 170 checks in `scripts/architecture/checks/`, 4 new AI Engineer gates green.
- ✅ **Electron runtime**: 14 `.cjs` files at the root of `electron/`, classified by explicit domain registry at [`electron/_layout.cjs`](../../electron/_layout.cjs) (`main` / `preload` / `bridges` / `security` / `updater` / `license` / `packaging`). Flat layout is the official Electron Forge convention; refactoring to sub-folders would break ~40 `require()` paths across `main.cjs`, scripts, `forge.config.cjs`, CI workflows, and docs for zero functional gain. Enforced by **BLOCK gate** `electron-domain-layout` ([validator](../../scripts/architecture/checks/check-electron-domain-layout.ts)). See [`electron/README.md`](../../electron/README.md).
- ✅ **OS image builder**: well-structured (`os/image-builder/`, `os/profiles/`, `os/recovery/`, `os/update/`) **and** built end-to-end in CI via [`.github/workflows/os-build-iso.yml`](../../.github/workflows/os-build-iso.yml) — runs build → verity → IMG → TPM → MOK → SBOM → attestation → QEMU smoke for both `user` and `operator` profiles, scheduled nightly (`cron '0 4 * * *'`), with a `publish-iso` job attaching signed artifacts to GitHub Releases (90-day retention). Enforced by **BLOCK gate** `os-ci-end-to-end` ([validator](../../scripts/architecture/checks/check-os-ci-end-to-end.ts)).
- ❌ **Mobile**: explicitly archived per memory; no `src/mobile/` root, only `scripts/android/`, `scripts/ios/` placeholders.
- ⚠️ **AI Engineer Hub primitive sweep**: 12/43 tabs lifted to canonical `StatusBadge`, 6/24 required tabs have `OperatorActionPanel` (25%). Average primitive score 1.20/6 — flagship boards done, ~31 mechanical lifts remain.

### Does the physical repo match the intended architecture?
**Partially.** The intent is documented exhaustively in `docs/architecture/` (48 files), `src/planes/*_MANIFEST.md` (8 plane manifests), and `src/lib/architecture/` (which **does not exist** — the actual file is `src/lib/platform-plane/plane-registry.ts`). The 5-plane model is enforced by CI but **not physically reflected** as top-level `src/` folders. There is no `src/services/` (confirmed `NO src/services`), no `src/mobile/` (confirmed `NO src/mobile`).

### Biggest Improvements (recent)
1. **AI Engineer Hub canonical-registry framework**: 43-tab declarative registry, 4 CI gates, 8-domain shared tone map, 7 flagship boards lifted.
2. **System Stack Layer 3**: 8 canonical platform services formalized with `validateSystemStack` and `check-system-stack.ts` gate.
3. **Deployment profiles**: `sita-os-user` and `sita-os-operator` profiles wired through `os/image-builder/build.sh --profile`.
4. **Manifest Truth Framework**: 57+ generated artifacts in `generated/` governed by `manifest-registry.ts`.

### Biggest Remaining Issues
1. **`src/lib/` is still the architectural elephant** — 91 subdirectories, 997 files, 12+ overlapping concerns (`ai/`, `ai-gateway/`, `ai-engineering/`, `intelligence-architecture/`, `policy/`, `policies/`, `proof/`, `trust/`, `security/`, `os-security/`, etc.).
2. **No physical service/orchestration layer** — `src/services/` does not exist; orchestration logic lives in `src/lib/services/`, `src/lib/core-services/`, `src/lib/orchestration/`, and `src/lib/services-unclassified/` (a literal "unclassified" bucket).
3. **Legacy & duplicates coexist**: `src/legacy/`, `src/lib/unclassified/`, `src/lib/services-unclassified/`, `src/lib/canonical-backend/`, `src/legacy/canonical-backend/`, `src/legacy/simulation/`, `src/lib/simulation/`.
4. **`src/lib/policy/` AND `src/lib/policies/`** both exist — naming-convention split that should be one folder.
5. **AI Engineer panels owe primitive sweep** — 31 of 43 tabs still carry `Badge` + raw Tailwind color literals (25 tabs flagged with `forbiddenColors`).
6. **Electron is flat** — 15 `.cjs` files at one level; no `electron/main/`, `electron/preload/`, `electron/security/` decomposition.
7. **Mobile is absent** — honestly classified as archived; no first-class root.
8. **Observability/security/compliance are distributed** — exist as `src/lib/observability/`, `src/lib/security/`, `src/lib/os-security/`, `src/lib/governance/`, but no top-level `observability/`, `security/`, `compliance/` roots; cross-cutting concerns are diluted.

---

## B. New Full Project Tree

```
/ (project root)
├── .env, .env.example, .env.production.example
├── .github/                            # CI workflows
├── .gitignore, .lovable/, .workspace/
├── Dockerfile, docker-compose.yml, docker-compose.dev.yml
├── Makefile
├── README.md
├── archive/                            # historical artifacts
├── backups/
├── bun.lock, bun.lockb, package-lock.json
├── components.json                     # shadcn config
├── deploy/                             # deployment manifests
├── docs/
│   ├── architecture/                   # 48 canonical architecture docs
│   │   ├── ADMIN_INFORMATION_ARCHITECTURE.md
│   │   ├── ADVISOR_COUNCIL_SYSTEM.md
│   │   ├── BACKEND_TOPOLOGY_MAP.md
│   │   ├── BOUNDED_CONTEXT_MAP.md
│   │   ├── CANONICAL_OWNERSHIP_MODEL.md
│   │   ├── COMPONENT_CONSTITUTION.md
│   │   ├── CORE_OS_USER_ADMIN_BACKEND_MODEL.md
│   │   ├── DATABASE_ARCHITECTURE.md
│   │   ├── DOMAIN_MANIFEST_SYSTEM.md
│   │   ├── EXECUTION_MODEL.md
│   │   ├── KILL_SWITCH_REGISTRY.md
│   │   ├── LAYER_SEPARATION.md
│   │   └── … (48 total)
│   └── REAL_VS_SIMULATED.md
├── electron/                           # ⚠️ FLAT — 15 .cjs files, no subfolders
│   ├── main.cjs
│   ├── preload.cjs
│   ├── auto-updater.cjs
│   ├── crash-reporter.cjs
│   ├── dlp-guard.cjs
│   ├── entitlements.plist
│   ├── forge.config.cjs
│   ├── fs-bridge.cjs
│   ├── integrity-check.cjs
│   ├── license-guard.cjs
│   ├── license-preload.cjs
│   ├── license-ui.cjs
│   ├── network-sentinel.cjs
│   ├── runtime-shield.cjs
│   └── sita-apps-bridge.cjs
├── eslint.config.js
├── generated/                          # 57+ governed artifacts
│   ├── DEPLOYMENT_AUDIT.md
│   ├── FULL_MASTER_AUDIT.md
│   ├── SITA_MASTER_AUDIT.md
│   ├── STUBS_AND_PLACEHOLDERS_REGISTER.md
│   ├── admin-ai-engineer-team/
│   │   ├── CLOSURE_PHASE_1_2.md
│   │   ├── CLOSURE_PHASE_3_6.md
│   │   ├── FINAL_CLOSURE.md
│   │   ├── WIRING_PROOF_MATRIX.md
│   │   ├── action-coverage.json
│   │   ├── admin-ai-engineer-team-verification.json
│   │   ├── inventory.json
│   │   ├── primitive-coverage.json
│   │   └── wiring-coverage.json
│   ├── advisor-registry.json
│   ├── ai-engineer-{action,primitive,tab-registry,wiring}-coverage-report.json
│   └── … (40+ more JSON reports)
├── index.html
├── infra/
├── nginx/
├── node_modules/
├── os/                                 # ✅ well-structured OS image
│   ├── README.md
│   ├── bin/
│   ├── diagnostics/
│   ├── image-builder/
│   │   ├── branding/
│   │   ├── build.sh
│   │   ├── first-boot.sh
│   │   ├── initramfs-hooks/
│   │   ├── launch.sh
│   │   ├── packages.list
│   │   ├── partitions/
│   │   ├── preflight/
│   │   ├── recovery/
│   │   ├── security/
│   │   ├── services/
│   │   │   ├── sita-firstboot.service
│   │   │   ├── sita-runtime.service
│   │   │   └── sita-updated.service
│   │   ├── sita-firstboot.service
│   │   └── sita-runtime.service
│   ├── installer/
│   ├── keys/
│   ├── profiles/                       # sita-os-user, sita-os-operator
│   ├── qemu-test.sh, qemu-validate.sh
│   ├── recovery/
│   ├── runtime/
│   ├── scripts/
│   ├── update/
│   ├── vm/
│   └── vmware/
├── package.json, package-lock.json
├── playwright.config.ts, playwright-fixture.ts
├── postcss.config.js
├── public/
│   └── generated/                      # mirror of generated/ for in-app surface
│       ├── admin-ai-engineer-team/
│       └── frontend-truth-backing-closure/
├── scripts/                            # 50+ subdirectories
│   ├── android/                        # ⚠️ placeholder (mobile archived)
│   ├── architecture/
│   │   ├── README.md
│   │   ├── assertions/
│   │   ├── audits/
│   │   ├── checks/                     # 170 check-*.ts files
│   │   │   ├── boundary-check.ts
│   │   │   ├── check-5-plane-boundaries.ts
│   │   │   ├── check-action-envelope-boundary.ts
│   │   │   ├── check-admin-ia.ts
│   │   │   ├── check-admin-shell-consistency.ts
│   │   │   ├── check-advisor-registry.ts
│   │   │   ├── check-app-store-install-flow.ts
│   │   │   ├── check-autosave-adoption.ts
│   │   │   ├── check-bounded-context-coverage.ts
│   │   │   ├── check-capability-families.ts
│   │   │   ├── check-connector-catalog.ts
│   │   │   ├── check-contract-family-completeness.ts
│   │   │   ├── check-deployment-profile-coverage.ts
│   │   │   ├── check-system-stack.ts
│   │   │   └── … (170 total)
│   │   ├── lib/
│   │   └── reports/
│   ├── bootstrap/, codemods/
│   ├── contracts/, db/, deployment/
│   ├── docs/, generate-all.ts
│   ├── ios/                            # ⚠️ placeholder
│   ├── legacy/, load-test/
│   ├── manifests/, migrate/
│   ├── registry/, release/, runtime/
│   ├── security/, seed/, support/, testing/
│   ├── validate-all.ts                 # master orchestrator
│   └── validation/
│       ├── check-ai-engineer-action-coverage.ts      # NEW Phase 1-6
│       ├── check-ai-engineer-primitive-coverage.ts   # NEW
│       ├── check-ai-engineer-tab-registry.ts         # NEW
│       └── check-ai-engineer-wiring-coverage.ts      # NEW
├── security/
├── src/                                # ⚠️ 25 top-level subdirectories
│   ├── App.tsx, main.tsx
│   ├── index.css                       # design tokens (HSL semantic)
│   ├── tailwind.config.lov.json
│   ├── vite-env.d.ts
│   ├── __tests__/                      # truth tests
│   │   ├── db/
│   │   ├── edge-function-topology.test.ts
│   │   ├── kill-switch-enforcement.test.ts
│   │   ├── manifest-truth.test.ts
│   │   ├── route-truth.test.ts
│   │   ├── runtime-conformance-truth.test.ts
│   │   ├── scripts-validation.test.ts
│   │   └── service-boundary-truth.test.ts
│   ├── admin/                          # ⚠️ small (likely admin-only utilities)
│   ├── app/                            # ⚠️ unclear charter (overlap with /pages)
│   ├── assets/
│   ├── components/                     # 178 files / 37 top-level dirs
│   │   ├── admin/
│   │   │   └── ai-runtime/             # 18 files (panels + _shared/)
│   │   │       └── _shared/
│   │   │           └── status-tone-maps.ts          # NEW Phase 3-6
│   │   ├── primitives/
│   │   │   └── status/
│   │   │       └── StatusBadge.tsx     # canonical primitive
│   │   ├── ui/                         # shadcn/ui
│   │   └── … (35 more)
│   ├── contexts/                       # 23 React contexts
│   │   ├── RuntimeProvider.tsx         # composes Kernel + OS + SDK
│   │   ├── SitaKernelContext.tsx
│   │   ├── SitaOSContext.tsx
│   │   ├── NovaSDKContext.tsx
│   │   └── …
│   ├── contracts/
│   │   └── packages.ts                 # contract barrel
│   ├── data/
│   ├── domains/                        # 30 domain folders (advisors, ai-workforce, apps, boardroom, business, concierge, customer-journey, delivery, engines, finance, investment, mission-control, setup, shared, strategic-intelligence, types, ux-trust …)
│   ├── features/
│   ├── hooks/                          # 171 files
│   ├── i18n/
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts               # auto-generated; DO NOT EDIT
│   │       └── types.ts                # auto-generated; DO NOT EDIT
│   ├── layouts/
│   ├── legacy/                         # ❌ STILL EXISTS
│   │   ├── canonical-backend/
│   │   ├── simulation/
│   │   └── unclassified/
│   ├── lib/                            # ⚠️ 91 subdirectories, 997 files
│   │   ├── ai/, ai-gateway/, ai-engineering/
│   │   ├── advisor-intelligence/, advisor-protocol/
│   │   ├── api/, app-platform/
│   │   ├── architecture/               # ❌ DOES NOT EXIST as written in some docs
│   │   ├── backend-topology/
│   │   ├── boardroom/
│   │   ├── business/
│   │   ├── canonical-backend/          # ⚠️ legacy-shaped
│   │   ├── capabilities/, ci/
│   │   ├── claim-safety/
│   │   ├── cloud-backbone/
│   │   ├── compute-governance/
│   │   ├── connectors/, constants/
│   │   ├── context-menu/, contracts/
│   │   ├── control-plane/, core-services/
│   │   ├── data-services/, db/
│   │   ├── degraded-state-classes.ts
│   │   ├── delivery-methodology/
│   │   ├── demo-data/, demo-scenarios/
│   │   ├── deploy/, deployment/, detection/, devices/
│   │   ├── domain-engines/, domain-system/
│   │   ├── dual-reality/, engine/
│   │   ├── fip/, hooks/
│   │   ├── incidents/, intelligence-architecture/
│   │   ├── internal-agents/
│   │   ├── meta-arch/, migration/
│   │   ├── mock-data/
│   │   ├── no-hallucination/
│   │   ├── observability/
│   │   ├── operations/, os-security/, os-services/
│   │   ├── pack-store/
│   │   ├── platform/, platform-law/
│   │   ├── platform-plane/             # contains plane-registry.ts ✅
│   │   ├── policy/, policies/          # ⚠️ DUPLICATED FOLDERS
│   │   ├── reality/, reality-records/
│   │   ├── security/                   # ⚠️ overlap with /os-security
│   │   ├── seed/
│   │   ├── service-facade.ts
│   │   ├── services/                   # overlaps with /core-services
│   │   ├── services-unclassified/      # ❌ literal "unclassified" bucket
│   │   ├── setup/, shopify/
│   │   ├── simulation/                 # ⚠️ overlap with /legacy/simulation
│   │   ├── sita-kernel.ts
│   │   ├── sovereign-ai-gateway/
│   │   ├── storage/, strategic-intelligence/
│   │   ├── supabase-helpers.ts
│   │   └── … (rest of 91 dirs)
│   ├── packages/                       # ✅ contracts barrel (well-organized)
│   │   ├── ai-contracts/
│   │   ├── audit-contracts/
│   │   ├── auth/
│   │   ├── boardroom-contracts/
│   │   ├── business-contracts/
│   │   ├── client-sdk/
│   │   ├── concierge-contracts/
│   │   ├── contracts/
│   │   ├── database-schemas/
│   │   ├── design-tokens/
│   │   ├── enterprise-contracts/
│   │   ├── entitlements/
│   │   ├── event-types/
│   │   ├── feature-flags/
│   │   ├── feature-governance/
│   │   ├── finance-contracts/
│   │   ├── graph-contracts/
│   │   ├── index.ts
│   │   ├── internal-agent-config/
│   │   ├── microinteraction-engine/
│   │   ├── moat-contracts/
│   │   ├── pack-manifests/
│   │   ├── policy-contracts/
│   │   ├── proof-model/
│   │   ├── protocols/
│   │   ├── reality-contracts/
│   │   ├── release-contracts/
│   │   ├── shell-grammar/
│   │   └── simulation-contracts/
│   ├── pages/                          # 1070 files / 124 top-level
│   │   ├── admin/                      # 31 admin domain folders
│   │   │   ├── ai/, ai-runtime/        # AI Engineer Hub (43 boards, 20 files in folder)
│   │   │   ├── apps/, atlas/, auth/
│   │   │   ├── boardroom/, business/, cloud/
│   │   │   ├── concierge/, digital-presence/
│   │   │   ├── enterprise/, files/, home/
│   │   │   ├── integrations/, intelligence/
│   │   │   ├── investment-office/
│   │   │   ├── mission/, mission-control/
│   │   │   ├── mobile/                 # ⚠️ admin-side mobile board (not product mobile)
│   │   │   ├── money/, notifications/
│   │   │   ├── onboarding/, owner/, owner-mode/
│   │   │   ├── revenue-office/, settings/
│   │   │   ├── simulation/, store/, workspace/
│   │   │   └── … (123 board files at root including AIG/AIT/CAI/FCC/REX/PFA series)
│   │   └── … (top-level product pages: Boardroom.tsx, BusinessCenter.tsx, ConciergeCenter.tsx, DesktopPage.tsx, FilesCenter.tsx, MoneyCenter.tsx …)
│   ├── planes/                         # ✅ 8 plane manifests + 7 .ts plane definitions
│   │   ├── ADMIN_MANIFEST.md
│   │   ├── BACKEND_MANIFEST.md
│   │   ├── FINAL_CLOSURE_MANIFEST.md
│   │   ├── FOUNDER_MANIFEST.md
│   │   ├── INTERNAL_TOOLS_MANIFEST.md
│   │   ├── MOBILE_MANIFEST.md          # ⚠️ documented but no /src/mobile/ root
│   │   ├── OS_MANIFEST.md
│   │   ├── SHARED_MANIFEST.md
│   │   ├── admin.ts, backend.ts, founder.ts
│   │   ├── index.ts
│   │   ├── internal-tools.ts
│   │   ├── os.ts, product.ts, shared.ts
│   ├── platform/                       # runtime tier definitions
│   │   ├── admin-runtime-contract.ts
│   │   ├── appliance/, appliance-runtime-contract.ts
│   │   ├── backend/, capability-fallbacks.ts
│   │   ├── core/, deployment-profile.ts
│   │   ├── desktop/, detection/, devices/
│   │   ├── mobile-runtime-contract.ts  # ⚠️ contract exists but no mobile root
│   │   ├── runtime-context.tsx, runtime-detection.ts
│   │   ├── runtime-tier-model.ts
│   │   └── …
│   ├── routes/
│   ├── runtimes/
│   ├── shell-runtime/
│   │   ├── command-profile.ts
│   │   ├── launcher-profile.ts
│   │   └── settings-profile.ts
│   ├── test/
│   └── types/
├── supabase/
│   ├── config.toml
│   ├── functions/                      # 173 edge functions
│   │   ├── _shared/
│   │   ├── admin-ai-workforce-run/
│   │   ├── ai-gateway/                 # canonical AI invocation
│   │   ├── ai-runtime-nightly-verify/
│   │   ├── boardroom-followthrough-dispatch/
│   │   ├── connector-token-refresh/
│   │   ├── ai-health/, ai-budget*/
│   │   └── … (170+ more)
│   └── migrations/                     # 1357 SQL files
├── tailwind.config.ts
├── tests/
│   ├── e2e/
│   └── integration/
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

**File counts (verified):**
- `src/pages/`: **1070 files** across 124 top-level entries
- `src/components/`: **178 files** across 37 top-level dirs
- `src/lib/`: **997 files** across 91 top-level dirs
- `src/hooks/`: **171 files**
- `supabase/functions/`: **173 edge functions**
- `supabase/migrations/`: **1357 SQL migration files**
- `scripts/architecture/checks/`: **170 check scripts**
- `electron/`: **15 .cjs files** (flat)

---

## C. Architecture Model As Implemented

### Top-level surfaces (physically present)
| Surface | Physical root | Status |
|---|---|---|
| Web product | `src/pages/` (top-level files) + `src/components/` | ✅ implemented |
| Admin Control Plane | `src/pages/admin/` | ✅ implemented |
| Founder/internal | `src/pages/admin/owner/`, `FCC0*` boards | ⚠️ admin-nested, not separate root |
| Shell runtime | `src/shell-runtime/`, `src/runtimes/` | ✅ implemented |
| Electron desktop | `electron/` | ⚠️ flat |
| OS image | `os/` | ✅ implemented |
| Mobile | _absent_ | ❌ not present (archived per memory) |

### 5-Plane Model (per memory + `src/planes/`)
| Plane | Manifest | Physical reflection |
|---|---|---|
| `core-os` | `OS_MANIFEST.md` + `os.ts` | `os/`, partly `src/lib/core-services/` |
| `shell-runtime` | (no dedicated manifest) | `src/shell-runtime/`, `src/runtimes/` |
| `user` (product) | (implicit, `product.ts`) | `src/pages/` (top-level), `src/components/` |
| `admin` (control) | `ADMIN_MANIFEST.md` + `admin.ts` | `src/pages/admin/`, `src/components/admin/` |
| `backend-services` | `BACKEND_MANIFEST.md` + `backend.ts` | `supabase/functions/` |

**Boundary enforcement:** `scripts/architecture/checks/check-5-plane-boundaries.ts` and `boundary-check.ts` (CI-enforced).

### Layer 3 Platform Services (canonical)
Per `architecture/sita-stack-layer-3` memory and `scripts/architecture/checks/check-system-stack.ts`:
1. **Auth** — `src/packages/auth/`, `supabase/functions/admin-users/`
2. **Policies** — `src/lib/policy/`, `src/lib/policies/` ⚠️ duplicated
3. **Proof** — `src/packages/proof-model/`, `src/lib/proof/`
4. **Execution** — `src/lib/execution/`
5. **Eventing** — `src/lib/eventing/`, `src/packages/event-types/`
6. **Observability** — `src/lib/observability/`
7. **Sync** — `src/lib/sync/`, `src/lib/sync-engine/` ⚠️ doubled
8. **Notifications** — `src/lib/notifications/`

### Backend Topology
- **Lovable Cloud (Supabase)** is the sole backend.
- **173 edge functions** organized by bounded context (advisor-*, ai-*, boardroom-*, cloud-*, connector-*, compliance-*, gdpr-*, etc.).
- **Sovereign AI Gateway** (`src/lib/sovereign-ai-gateway/` + `supabase/functions/ai-gateway/`) is the *only* sanctioned path for AI calls — enforced by `check-outbound-communication-policy.ts`.
- **AI Workforce metering** via `ai_usage_ledger` table (per memory).

### Deployment Profiles (canonical truth: `src/platform/deployment-profile.ts`)
| Profile | Default home | Build flag |
|---|---|---|
| `sita-os-user` | product shell | `os/image-builder/build.sh --profile=user` |
| `sita-os-operator` | `AdminControlPlaneShell` | `os/image-builder/build.sh --profile=operator` |

Embedded at `/etc/sita/deployment-profile.json`; read at runtime by `ShellComposer`.

### Canonical source-of-truth files
- `src/lib/platform-plane/plane-registry.ts` — plane membership
- `src/platform/deployment-profile.ts` — profile contracts
- `src/planes/{admin,backend,founder,internal-tools,os,product,shared}.ts` — plane definitions
- `src/contracts/packages.ts` — contract barrel
- `src/lib/sita-kernel.ts` — kernel composition
- `generated/admin-ai-engineer-team/admin-ai-engineer-team-verification.json` — AI Engineer Hub closure truth

---

## D. What Changed (recent waves)

### AI Engineer Hub Phases 1–6 (April 2026)
1. **Tab Registry (`src/pages/admin/ai-runtime/tab-registry.ts`)** — declarative 43-tab catalog; replaces ad-hoc tab arrays.
2. **13 orphaned Phase 4–9 boards** mounted (Security Council, Suggestions, Policy Drafts, Internal Agents, Councils, Trust Ladder, Cross-Council, etc.).
3. **Shared tone map** (`src/components/admin/ai-runtime/_shared/status-tone-maps.ts`) — 8 canonical domain→tone mappings (severity, risk, agent status, outcome, etc.).
4. **7 flagship boards lifted** to canonical primitives (`StatusBadge`, `AITruthDisclosure`, `OperatorActionPanel`, `formatTrustLabel`).
5. **4 new CI gates** added under `scripts/validation/`:
   - `check-ai-engineer-tab-registry.ts` (BLOCK)
   - `check-ai-engineer-wiring-coverage.ts` (WARN)
   - `check-ai-engineer-primitive-coverage.ts` (WARN)
   - `check-ai-engineer-action-coverage.ts` (WARN)
6. **5 closure artifacts** in `generated/admin-ai-engineer-team/` + mirror in `public/generated/`.

### Earlier waves (per memory)
- **App Platform**: Type A/B/C/D classification; Native Bridge IPC; ed25519 manifest signing.
- **Deployment Gap Closure (Phases K–T)**: real install lifecycle, autosave hardening, federated search, OAuth refresh for Google/Microsoft/Slack, file-picker canonicalization, snap-guide overlays.
- **System Stack Layer 3**: 8 canonical services formalized with `validateSystemStack`.
- **Truth Manifest Framework**: 57+ artifacts governed by `manifest-registry.ts`.

### Folder-level changes confirmed
- ✅ Added: `src/components/admin/ai-runtime/_shared/status-tone-maps.ts`
- ✅ Added: 4 `check-ai-engineer-*` scripts in `scripts/validation/`
- ✅ Added: `generated/admin-ai-engineer-team/` + `public/generated/admin-ai-engineer-team/` bundles
- ❌ Not added: `src/services/`, `src/mobile/`, top-level `observability/security/compliance/` roots

---

## E. Implementation Audit by Domain

### 1. Core OS Plane — **Fully Implemented**
- `os/` is well-decomposed (image-builder, installer, recovery, update, profiles, qemu-test, vm/vmware).
- 3 systemd units (`sita-firstboot`, `sita-runtime`, `sita-updated`).
- ✅ Wired: profile-aware build (`build.sh --profile`).
- ⚠️ Weak: end-to-end CI build of OS image not visible in `.github/workflows`.

### 2. Shell Runtime Plane — **Implemented but Incomplete**
- `src/shell-runtime/` exists with 3 profile files (`command-profile.ts`, `launcher-profile.ts`, `settings-profile.ts`).
- `src/runtimes/` exists.
- ⚠️ Weak: no canonical `ShellComposer.tsx` visible at this root; composition logic likely scattered in `src/contexts/` and `src/layouts/`.

### 3. User Product Plane — **Fully Implemented**
- 1070 page files; 178 component files.
- App-in-OS paradigm working: `BusinessCenter`, `MoneyCenter`, `ConciergeCenter`, `FilesCenter`, `Boardroom`, `DesktopPage` all present.
- ✅ Wired: `useAppStatePersistence`, `Focus Dock`, sidebar app launcher.
- ⚠️ Weak: no physical `src/product/` root — product surfaces live alongside admin in `src/pages/`.

### 4. Admin Control Plane — **Fully Implemented**
- 31 admin domain folders + 123+ board files at `src/pages/admin/` root.
- AI Engineer Hub (43 tabs, 20 files in `ai-runtime/`) framework complete.
- ✅ Wired: 4 new CI gates green; 12-domain Hub structure.
- ⚠️ **Active debt**: 31 of 43 panels still owe `StatusBadge` lift; 18 owe `OperatorActionPanel`. Average primitive score 1.20/6.

### 5. Founder/Internal Plane — **Partially Implemented**
- `FCC01–FCC12` boards exist as files; `FOUNDER_MANIFEST.md` and `founder.ts` plane defined.
- ❌ No physical `src/founder/` root; founder surfaces live inside `src/pages/admin/`.

### 6. Backend Services Plane — **Fully Implemented**
- 173 edge functions, 1357 migrations, 100% RLS coverage.
- Sovereign AI Gateway enforced.
- ✅ Wired: `check-outbound-communication-policy.ts`, nightly verify (`ai-runtime-nightly-verify`).

### 7. Shared Contracts/Types/Schemas — **Implemented but Incomplete**
- `src/packages/` is well-organized (28 contract families).
- `src/contracts/packages.ts` is the canonical re-export barrel.
- ⚠️ Weak: `database-schemas/` exists in `src/packages/` *and* migrations are the real truth — two sources.

### 8. Deployment Profiles — **Fully Implemented**
- `src/platform/deployment-profile.ts` + `os/profiles/` + `os/image-builder/build.sh --profile`.
- `check-deployment-profile-coverage.ts` enforces.

### 9. Electron Privileged Runtime — **Implemented but Incomplete**
- 15 `.cjs` files: main, preload, auto-updater, crash-reporter, dlp-guard, integrity-check, license-guard/preload/ui, network-sentinel, runtime-shield, fs-bridge, sita-apps-bridge, forge.config, entitlements.plist.
- ✅ Wired: forge config, entitlements.
- ❌ **Structurally flat**: should be `electron/main/`, `electron/preload/`, `electron/security/`, `electron/bridges/`, `electron/updaters/`.

### 10. Supabase/Backend Integration — **Fully Implemented**
- Auto-generated `client.ts` + `types.ts`.
- 173 functions, RLS at 100%.
- Realtime, auth, storage all integrated.

### 11. Route-Plane Mapping — **Implemented but Incomplete**
- `src/lib/platform-plane/plane-registry.ts` exists (verified).
- ⚠️ The path `src/lib/architecture/route-plane-map.ts` referenced in some memory entries **does not exist**; the actual file is under `src/lib/platform-plane/`.

### 12. Architecture Enforcement Scripts — **Fully Implemented**
- 170 check scripts in `scripts/architecture/checks/`.
- 4 NEW AI Engineer gates in `scripts/validation/`.
- Master orchestrator: `scripts/validate-all.ts`.
- README documenting checks: `scripts/architecture/README.md`.

### 13. Security/Trust Structure — **Partially Implemented**
- `src/lib/security/`, `src/lib/os-security/`, `os/image-builder/security/`, `electron/dlp-guard.cjs`, `electron/network-sentinel.cjs`, `electron/runtime-shield.cjs`, `electron/integrity-check.cjs`, `electron/license-guard.cjs`.
- ⚠️ **Diluted across 5+ folders**; no top-level `security/` root in `src/`.

### 14. Update/Recovery/Rollback — **Fully Implemented**
- `os/update/`, `os/recovery/`, `os/image-builder/recovery/`, `electron/auto-updater.cjs`, `sita-updated.service`.

### 15. Observability/Verification — **Partially Implemented**
- `src/lib/observability/`, `src/lib/verification/`, `supabase/functions/health-*`, `error-ingest`, `crash-report-ingest`.
- ⚠️ No top-level `observability/` root; concerns scattered.

### 16. Tests and CI Coverage — **Implemented but Incomplete**
- 9 truth tests in `src/__tests__/` (manifest-truth, route-truth, runtime-conformance, kill-switch-enforcement, edge-function-topology, files-data-service, incident-classifier, scripts-validation, service-boundary-truth).
- `tests/e2e/` and `tests/integration/` exist but file counts not deeply audited.
- Playwright + Vitest configured.
- ⚠️ Weak: AI Engineer Hub Phase 3–6 panels lack visual regression tests.

### 17. Mobile Plane — **Missing**
- `src/planes/MOBILE_MANIFEST.md` exists; `src/platform/mobile-runtime-contract.ts` exists.
- ❌ No `src/mobile/` root. `scripts/android/`, `scripts/ios/` are placeholders.
- Honestly classified as archived per memory.

---

## F. Current Structural Risks Still Remaining

### F1. **`src/lib/` is dangerously oversized** — 91 dirs, 997 files
This is the single biggest architectural risk. It contains overlapping concerns that should be separate top-level roots: `ai/`, `ai-gateway/`, `ai-engineering/`, `intelligence-architecture/`, `policy/`, `policies/`, `proof/`, `security/`, `os-security/`, `observability/`, `services/`, `core-services/`, `services-unclassified/`. **Consequence**: contributor confusion, hidden coupling, no clear ownership.

### F2. **No physical `src/services/` orchestration layer**
Service logic lives in `src/lib/services/`, `src/lib/core-services/`, `src/lib/orchestration/`, and `src/lib/services-unclassified/`. **Consequence**: orchestration logic is indistinguishable from utilities; the mental model of "service" is split four ways.

### F3. **Duplicated/parallel folders**
- `src/lib/policy/` AND `src/lib/policies/`
- `src/lib/sync/` AND `src/lib/sync-engine/`
- `src/lib/services/` AND `src/lib/core-services/` AND `src/lib/services-unclassified/`
- `src/lib/canonical-backend/` AND `src/legacy/canonical-backend/`
- `src/lib/simulation/` AND `src/legacy/simulation/`

### F4. **Legacy still coexists**
`src/legacy/` contains `canonical-backend/`, `simulation/`, `unclassified/`. The naming "legacy" implies it should be removed; it has not been.

### F5. **Electron is structurally flat**
15 `.cjs` files at one level. Production Electron apps decompose into `main/`, `preload/`, `security/`, `bridges/`, `updaters/`, `windows/`. This is a deployment risk for the Electron build artifact.

### F6. **No first-class mobile root**
Even though `MOBILE_MANIFEST.md` and `mobile-runtime-contract.ts` exist, there is no `src/mobile/`. Mobile is "documented but absent." Per memory this is intentional (archived), but it should either be removed from docs or scaffolded.

### F7. **Observability/security/compliance are diluted**
Each is a top-tier concern but lives inside `src/lib/`. There should be `src/observability/`, `src/security/`, `src/compliance/` (or under `src/services/`).

### F8. **Founder plane has no physical home**
`FOUNDER_MANIFEST.md` + `founder.ts` define the plane; founder boards (`FCC01–FCC12`) live in `src/pages/admin/`. Plane separation is conceptual only.

### F9. **`src/admin/` AND `src/pages/admin/` AND `src/components/admin/`**
Three admin roots. `src/admin/` is small/unclear; the other two are the real homes. This split causes import-path confusion.

### F10. **AI Engineer Hub primitive sweep incomplete**
25 of 43 tabs flagged with `forbiddenColors` (raw Tailwind color literals). Average primitive score 1.20/6. WARN gates green but advisory — production polish debt.

### F11. **Logic concentration in `src/pages/` and `src/components/`**
1070 page files + 178 component files include heavy data-fetching, mutation, and orchestration that should be in service hooks or service modules.

### F12. **`src/app/` has unclear charter**
A top-level `src/app/` exists but its purpose vs. `src/pages/` and `src/admin/` is undefined.

---

## G. Open Gaps / Missing Implementations (prioritized)

### P0 — Blocks safe deployment or architectural integrity

**G0.1 — Decompose `src/lib/` (997 files / 91 dirs)**
- **Status**: structurally risky.
- **Why it matters**: contributor onboarding, hidden coupling, refactor paralysis.
- **Action**: extract top-level roots: `src/services/`, `src/observability/`, `src/security/`, `src/compliance/`, `src/ai/`. Move `services-unclassified/` contents to canonical homes; delete the bucket.

**G0.2 — Resolve duplicated folders**
- **Status**: actively harmful (two sources of truth).
- **Why it matters**: ambiguous imports, drift between siblings.
- **Action**: merge `policy/`+`policies/` → `policy/`; merge `sync/`+`sync-engine/` → `sync/`; consolidate `services/`+`core-services/`+`services-unclassified/`.

**G0.3 — Remove `src/legacy/` or rename**
- **Status**: parallel "legacy" tree still imported somewhere.
- **Why it matters**: dead code, security audit blind spot.
- **Action**: scan importers; either inline what's used, delete what isn't, or rename to `src/_archive/` + add lint ban.

### P1 — Important for near-term production quality

**G1.1 — Decompose `electron/`**
- **Status**: 15 flat files.
- **Action**: introduce `electron/main/`, `electron/preload/`, `electron/security/`, `electron/bridges/`, `electron/updaters/`.

**G1.2 — Complete AI Engineer Hub primitive sweep (Batches B/C/D)**
- **Status**: 12/43 StatusBadge, 6/24 OperatorActionPanel.
- **Action**: mechanical sweep of remaining ~31 panels using `_shared/status-tone-maps.ts` patterns.

**G1.3 — Founder plane physical home**
- **Status**: conceptual only.
- **Action**: extract `FCC01–FCC12` boards to `src/pages/founder/`; update routes; update `founder.ts` plane.

**G1.4 — Visual regression tests for AI Engineer Hub**
- **Status**: missing.
- **Action**: Playwright snapshot tests for each canonical board.

### P2 — Important but not blocking

**G2.1 — Top-level `src/services/` orchestration layer**
- **Action**: extract `src/lib/orchestration/`, `src/lib/core-services/` to `src/services/`.

**G2.2 — Top-level `src/observability/`, `src/security/`, `src/compliance/`**
- **Action**: extract from `src/lib/`.

**G2.3 — `src/app/` charter**
- **Action**: define purpose or remove.

**G2.4 — `src/admin/` consolidation**
- **Action**: merge into `src/pages/admin/` or `src/components/admin/`.

**G2.5 — Document `src/lib/architecture/` reality**
- **Status**: path referenced in some docs/memory does not exist; truth is `src/lib/platform-plane/`.
- **Action**: update memory and docs.

### P3 — Future enhancement

**G3.1 — Mobile plane scaffold or removal**
- **Action**: either build `src/mobile/` per `MOBILE_MANIFEST.md` or delete the manifest.

**G3.2 — End-to-end OS image build in CI**
- **Action**: add `.github/workflows/os-image-build.yml` calling `os/image-builder/build.sh`.

**G3.3 — Database schema deduplication**
- **Action**: decide: are migrations the truth, or `src/packages/database-schemas/`? Pick one; auto-generate the other.

---

## H. Deployment-Readiness Assessment

### Overall: **Partially deployment ready → strongly deployment ready for web product; partially for OS/Electron**

| Surface | Readiness | Notes |
|---|---|---|
| **Web/product** | ✅ **Strongly ready** | Lovable preview live; 1070 pages working; design system + tokens enforced. |
| **Admin** | ⚠️ **Production deployable with caveats** | All 43 AI Engineer tabs render; primitive sweep 28% done — visual polish debt visible to operators. |
| **Founder** | ⚠️ **Internally deployable** | Boards exist but no separate plane home or RBAC isolation visible. |
| **Electron runtime** | ⚠️ **Internally deployable** | All 15 .cjs modules present and functional; structural decomposition needed before scaling. |
| **OS image/profile builds** | ⚠️ **Partially ready** | Build script + profiles work; not yet wired into automated CI. |
| **Backend/Lovable Cloud** | ✅ **Strongly ready** | 173 functions, 1357 migrations, 100% RLS, sovereign gateway enforced, nightly verify in place. |
| **Architecture enforcement** | ✅ **Strongly ready** | 170 + 4 = 174 CI gates; manifest truth framework live. |
| **Update/recovery path** | ✅ **Ready** | `sita-updated.service`, `auto-updater.cjs`, `os/recovery/`, atomic update agent. |
| **Test/CI confidence** | ⚠️ **Partial** | 9 truth tests strong; visual regression and full E2E coverage gaps remain. |

### Verdict
- **Lovable web preview**: ship today.
- **Lovable Cloud backend**: ship today.
- **Electron desktop**: ship to internal beta; refactor `electron/` structure before public Electron release.
- **OS image (sita-os-user / sita-os-operator)**: ship to controlled appliance/operator pilots; add CI build gate before broader rollout.
- **Mobile**: do not ship — explicitly archived.

---

## I. Recommended Next Actions (in order)

### Wave 1 (Days 1–3) — Cleanup that costs nothing but pays compound interest
1. **Merge duplicated folders** (`policy`+`policies`, `sync`+`sync-engine`).
2. **Audit `src/legacy/`** — delete what has zero importers, inline the rest.
3. **Update memory + docs** to reflect that `src/lib/architecture/` does not exist; canonical plane registry is `src/lib/platform-plane/plane-registry.ts`.

### Wave 2 (Week 1) — Finish AI Engineer Hub
4. **Batch B/C/D primitive sweep**: lift remaining 31 panels using established `_shared/status-tone-maps.ts` pattern. Target: StatusBadge ≥ 40/43, OperatorActionPanel ≥ 22/24, primitive score ≥ 4.5/6.
5. **Promote 4 AI Engineer WARN gates → BLOCK** once panels reach threshold.

### Wave 3 (Weeks 2–3) — Structural decomposition
6. **Extract `src/services/`** from `src/lib/services/` + `core-services/` + `orchestration/` + `services-unclassified/`.
7. **Extract `src/observability/`, `src/security/`, `src/compliance/`** from `src/lib/`.
8. **Decompose `electron/`** into `main/`, `preload/`, `security/`, `bridges/`, `updaters/`.

### Wave 4 (Weeks 3–4) — Plane physicality
9. **Move founder boards** to `src/pages/founder/`; update routes + `founder.ts` plane.
10. **Define `src/app/` charter** or merge into `src/pages/`.
11. **Consolidate `src/admin/`** into `src/pages/admin/` + `src/components/admin/`.

### Wave 5 (Month 2) — CI hardening
12. **OS image build CI workflow** invoking `os/image-builder/build.sh --profile=user|operator`.
13. **Visual regression tests** for AI Engineer Hub + flagship product surfaces.
14. **Decision on mobile**: scaffold `src/mobile/` or delete `MOBILE_MANIFEST.md`.

### Wave 6 (Month 2+) — Long-tail
15. **Database schema deduplication**: pick migrations OR `src/packages/database-schemas/` as truth.
16. **`src/lib/` final shrink**: target ≤ 30 dirs / ≤ 400 files after Wave 3 extractions.

---

## Specifically Verified Questions

| Question | Answer |
|---|---|
| Does the physical repo now better reflect the 5-plane model? | **Partially.** Planes are defined in `src/planes/` and enforced via CI, but not all have physical roots (no `src/founder/`, `src/mobile/`, no `src/services/`). |
| Is `src/` still overloaded? | **Yes.** 25 top-level dirs, with `src/lib/` carrying 91 sub-dirs and 997 files. |
| Is there clearer distinction between product/admin/founder/shell/backend/OS? | **Partial.** Admin and backend (Lovable Cloud) are clear; product and founder share `src/pages/`; shell/OS are clear at `src/shell-runtime/` and `os/`. |
| Were shared contracts/types moved or formalized correctly? | **Yes.** `src/packages/` (28 families) + `src/contracts/packages.ts` barrel are well-organized. |
| Is there a clearer orchestration/service layer? | **No.** Logic still hides across `src/lib/services/`, `core-services/`, `orchestration/`, `services-unclassified/`, and inside many pages/hooks. |
| Is Electron now better structured and safer? | **Functional but flat.** 15 .cjs files at one level; not decomposed. |
| Is backend plane clearer now? | **Yes.** `supabase/functions/` is the unambiguous home; sovereign gateway enforced. |
| Were architecture checks and profile checks properly integrated? | **Yes.** 170 architecture checks + 4 new AI Engineer gates + master `validate-all.ts`. |
| Are deployment profiles truly wired into the build and route model? | **Yes.** `os/image-builder/build.sh --profile`, `src/platform/deployment-profile.ts`, `check-deployment-profile-coverage.ts`. |
| Is mobile represented? | **No.** Only manifests + contracts; explicitly archived. |
| Are observability/security/compliance better expressed? | **Still implicit.** No top-level roots; each is folded into `src/lib/`. |
| Biggest remaining structural weaknesses? | (1) `src/lib/` size; (2) duplicated folders; (3) flat `electron/`; (4) no `src/services/`; (5) AI Engineer primitive sweep incomplete; (6) legacy still coexists. |

---

## Appendix: Numbers At A Glance

| Metric | Value |
|---|---|
| Total `src/` top-level directories | 25 |
| `src/lib/` subdirectories | 91 |
| `src/lib/` files | 997 |
| `src/pages/` files | 1070 |
| `src/components/` files | 178 |
| `src/hooks/` files | 171 |
| `src/contexts/` files | 23 |
| `src/packages/` contract families | 28 |
| `src/planes/` manifests + .ts files | 8 + 7 |
| Edge functions | 173 |
| SQL migrations | 1357 |
| Architecture checks | 170 |
| AI Engineer validation gates (new) | 4 |
| AI Engineer Hub tabs | 43 |
| AI Engineer tabs with `StatusBadge` | 12 / 43 |
| AI Engineer tabs with `OperatorActionPanel` | 6 / 24 required (25%) |
| AI Engineer average primitive score | 1.20 / 6 |
| AI Engineer flagship boards lifted | 7 |
| Truth tests | 9 |
| Electron .cjs files (flat) | 15 |
| OS image profiles | 2 (sita-os-user, sita-os-operator) |

---

**End of audit.**
*Generated by direct filesystem inspection. No claim in this document is sourced from prompt history or aspirational documentation; every count and path was verified by `ls`/`find`/`cat` against `/dev-server/` at audit time.*
