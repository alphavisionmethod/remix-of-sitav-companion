# SITA OS — Deployment Audit

> Generated: 2026-04-16T13:10:53Z
> Scope: Full repository tree, wiring integrity, and deployment readiness

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total TypeScript files | 4263 |
| Source components (.tsx) | 879 |
| Library/service files | 1547 |
| Package contract files | 448 |
| Feature module files | 34 |
| User-facing pages | 96 |
| Admin pages | 503 |
| Hooks | 158 |
| Contexts | 22 |
| Route families | 14 |
| Edge functions | 75 |
| DB migrations | 161 |
| Scripts | 223 |
| Generated artifacts | 57 |

---

## Section 1 — Root Configuration Files

| File | Purpose | Deployment Role |
|------|---------|----------------|
| `package.json` | Dependencies, scripts, metadata | Build entry |
| `vite.config.ts` | Vite build configuration | SPA bundler |
| `tailwind.config.ts` | Tailwind CSS design tokens | Styling |
| `tsconfig.json` | TypeScript root config | Compilation |
| `tsconfig.app.json` | App-specific TS config | App build |
| `tsconfig.node.json` | Node-specific TS config | Script tooling |
| `vitest.config.ts` | Vitest test runner config | Testing |
| `playwright.config.ts` | E2E test config | E2E testing |
| `eslint.config.js` | Linting rules | Code quality |
| `postcss.config.js` | PostCSS/Tailwind pipeline | CSS processing |
| `components.json` | shadcn/ui component registry | UI components |
| `index.html` | SPA entry HTML | Web deployment |
| `docker-compose.yml` | Production Docker services | Container deployment |
| `docker-compose.dev.yml` | Dev Docker services | Local development |
| `Dockerfile` (deploy/) | Container images | Container build |

---

## Section 2 — Source Tree (`src/`)

### 2.1 Web/Public Layer (Pages, Routes, Layouts)

#### Pages (`src/pages/`) — 96 user pages, 503 admin pages

**User Pages:**
```
AIEconomicsPage.tsx
AIWorkforcePage.tsx
AchievementsPage.tsx
ActivityStream.tsx
AdminCenter.tsx
AgentActivityDashboard.tsx
AppStoreCenter.tsx
ApprovalChamber.tsx
ApprovalsCenter.tsx
AutomationCenter.tsx
Boardroom.tsx
BusinessCenter.tsx
CalendarWorkspace.tsx
CalmFocusMode.tsx
CapitalAllocationPage.tsx
ClipboardHistory.tsx
CommandHistory.tsx
CommunicationInbox.tsx
CommunicationsPage.tsx
ConciergeCenter.tsx
ConnectorHub.tsx
CustomerDetail.tsx
CustomerHealthPage.tsx
DailyPulse.tsx
DesktopPage.tsx
DigitalTwinsPage.tsx
DocumentEditor.tsx
DownloadsCenter.tsx
EnterpriseMaturityDashboard.tsx
EnvironmentSwitcher.tsx
FilesCenter.tsx
FirstBootSetup.tsx
FirstWinActivation.tsx
GlobalBoardroom.tsx
GovernanceDashboard.tsx
ImportExportCenter.tsx
InboxCapture.tsx
IntegrationConcierge.tsx
LandingPage.tsx
LearnLaterPage.tsx
LifeDashboard.tsx
LifeSimulator.tsx
MediaWorkspace.tsx
MemoryCenter.tsx
MoneyCenter.tsx
MoneyOnboarding.tsx
MyActivity.tsx
NetworkUtility.tsx
NotFound.tsx
NotesWorkspace.tsx
NotificationCenter.tsx
NotificationSettingsPage.tsx
ObservabilityPage.tsx
Onboarding.tsx
OnboardingWrapper.tsx
OpportunityEngine.tsx
OutcomeEnginePage.tsx
OwnerCenter.tsx
PDFViewerWorkspace.tsx
PeopleWorkspace.tsx
PermissionsCenter.tsx
PersonalBrain.tsx
PersonalLifeWorkspace.tsx
PersonalizationStudio.tsx
PlanningCanvas.tsx
PolicyEditor.tsx
PolicySimulatorHub.tsx
PrintScanCenter.tsx
ProductivityHub.tsx
ProofCenter.tsx
RecoveredValuePage.tsx
RecoveryCenter.tsx
ReportingWorkspace.tsx
RevenueCallingPage.tsx
ScenarioLabPage.tsx
SearchPage.tsx
ServiceArchitectureDashboard.tsx
SettingsPage.tsx
SimulationEnginePage.tsx
SovereignExportPage.tsx
SpilloverDashboard.tsx
SpreadsheetWorkspace.tsx
StorageManager.tsx
SystemStatus.tsx
TasksWorkflowsCenter.tsx
TeamWorkspace.tsx
TemplateCenter.tsx
TimeMachinePage.tsx
TrustCenter.tsx
UpdateCenter.tsx
UserProfilePage.tsx
UsersAdminPage.tsx
WealthCommandCenter.tsx
WeeklyBoardroom.tsx
WorkflowReplayHub.tsx
WorkflowsCenter.tsx
```

**Admin Page Domains:**

| Prefix | Domain | Count |
|--------|--------|-------|
| `AIG` | AIG series | 11 |
| `AIT` | AIT series | 13 |
| `AND` | AND series | 5 |
| `APL` | APL series | 6 |
| `AR` | AR series | 9 |
| `CAI` | CAI series | 15 |
| `CN` | CN series | 7 |
| `DRS` | DRS series | 10 |
| `DWE` | DWE series | 7 |
| `ECO` | ECO series | 1 |
| `FCC` | FCC series | 12 |
| `FL` | FL series | 3 |
| `HRS` | HRS series | 6 |
| `ISA` | ISA series | 7 |
| `LT` | LT series | 7 |
| `MSA` | MSA series | 5 |
| `NRC` | NRC series | 6 |
| `NSS` | NSS series | 4 |
| `NOT` | NOT series | 5 |
| `OS` | OS series | 1 |
| `PFA` | PFA series | 10 |
| `REX` | REX series | 5 |
| `SEC` | SEC series | 2 |
| `SERV` | SERV series | 6 |
| `SRE` | SRE series | 8 |
| `SYS` | SYS series | 1 |

#### Routes (`src/routes/`)

| File | Domain |
|------|--------|
| `AdminRoutes.tsx` | Admin |
| `MobileRoutes.tsx` | Mobile |
| `OwnerRoutes.tsx` | Owner |
| `advisor-routes.tsx` | advisor |
| `apps-routes.tsx` | apps |
| `boardroom-routes.tsx` | boardroom |
| `business-routes.tsx` | business |
| `communications-routes.tsx` | communications |
| `concierge-routes.tsx` | concierge |
| `experimental-routes.tsx` | experimental |
| `files-routes.tsx` | files |
| `money-routes.tsx` | money |
| `os-routes.tsx` | os |
| `settings-routes.tsx` | settings |

#### Layouts (`src/layouts/`)
```
PublicLayout.tsx
```

### 2.2 App/User Layer (Features, Hooks, Contexts, Components)

#### Features (`src/features/`) — 34 files

| Domain | Files |
|--------|-------|
| `advisors` | 1 |
| `ai` | 1 |
| `app-platform` | 1 |
| `apps` | 1 |
| `atlas` | 1 |
| `auth` | 1 |
| `boardroom` | 1 |
| `business` | 4 |
| `cloud` | 1 |
| `concierge` | 1 |
| `digital-presence` | 1 |
| `enterprise` | 1 |
| `files` | 1 |
| `home` | 1 |
| `integrations` | 1 |
| `intelligence` | 1 |
| `investment-office` | 1 |
| `mission-control` | 1 |
| `mission` | 1 |
| `mobile` | 1 |
| `money` | 2 |
| `notifications` | 1 |
| `onboarding` | 1 |
| `owner-mode` | 1 |
| `owner` | 1 |
| `revenue-office` | 1 |
| `settings` | 1 |
| `simulation` | 1 |
| `store` | 1 |
| `workspace` | 1 |

#### Hooks (`src/hooks/`) — 158 files

#### Contexts (`src/contexts/`) — 22 providers

| Context | Purpose |
|---------|---------|
| `AppPlatformContext` | AppPlatformContext provider |
| `AppearanceContext` | AppearanceContext provider |
| `AuthContext` | AuthContext provider |
| `BusinessNavigationContext` | BusinessNavigationContext provider |
| `BusinessProfileContext` | BusinessProfileContext provider |
| `CalmEngineContext` | CalmEngineContext provider |
| `ConciergeDataContext` | ConciergeDataContext provider |
| `ConciergeNavigationContext` | ConciergeNavigationContext provider |
| `ConnectivityContext` | ConnectivityContext provider |
| `DataModeContext` | DataModeContext provider |
| `DemoModeProvider` | DemoModeProvider provider |
| `DisplayModeContext` | DisplayModeContext provider |
| `EntityContext` | EntityContext provider |
| `FinanceNavigationContext` | FinanceNavigationContext provider |
| `InspectorContext` | InspectorContext provider |
| `NovaSDKContext` | NovaSDKContext provider |
| `RevenueOfficeModeContext` | RevenueOfficeModeContext provider |
| `RuntimeProvider` | RuntimeProvider provider |
| `SitaKernelContext` | SitaKernelContext provider |
| `SitaOSContext` | SitaOSContext provider |
| `ThemeContext` | ThemeContext provider |
| `WindowManagerContext` | WindowManagerContext provider |

#### Components (`src/components/`) — 879 files

| Directory | Files |
|-----------|-------|
| `__tests__` | 2 |
| `admin-ai` | 11 |
| `admin-os` | 4 |
| `admin` | 86 |
| `advisors` | 10 |
| `ai` | 6 |
| `auth` | 5 |
| `autopilot` | 3 |
| `business` | 138 |
| `cards` | 0 |
| `cloud` | 11 |
| `concierge` | 29 |
| `files` | 8 |
| `finance` | 5 |
| `governance` | 5 |
| `intelligence` | 2 |
| `investment` | 4 |
| `mobile` | 6 |
| `money` | 3 |
| `navigation` | 0 |
| `notifications` | 1 |
| `platform` | 1 |
| `reality` | 5 |
| `revenue-office` | 1 |
| `shared` | 1 |
| `simulation` | 7 |
| `sita` | 475 |
| `ui` | 48 |
| `user-app` | 1 |

### 2.3 OS/Services Layer

| Module | Path | Files |
|--------|------|-------|
| `nova-sdk` | `src/lib/nova-sdk/` | 55 |
| `os-services` | `src/lib/os-services/` | 33 |
| `os-security` | `src/lib/os-security/` | 18 |
| `sync-engine` | `src/lib/sync-engine/` | 38 |
| `engine` | `src/lib/engine/` | 3 |
| `engines` | `src/lib/engines/` | 60 |
| `orchestration` | `src/lib/orchestration/` | 45 |
| `persistence` | `src/lib/persistence/` | 20 |

### 2.4 Admin/Operator Layer

| Directory | Files |
|-----------|-------|
| `admin/components` | 1 |
| `admin/hooks` | 1 |
| `admin/modules` | 8 |
| `admin/navigation` | 1 |
| `admin/pages` | 16 |
| `admin/routes` | 1 |
| `admin/shell` | 1 |
| `admin/state` | 1 |

### 2.5 Kernel/Core Layer

| Module | Path | Files |
|--------|------|-------|
| `core-services` | `src/lib/core-services/` | 217 |
| `domain-engines` | `src/lib/domain-engines/` | 9 |
| `capabilities` | `src/lib/capabilities/` | 22 |
| `domain-system` | `src/lib/domain-system/` | 10 |

### 2.6 Runtime Truth Layer

| Registry | Path | Files |
|----------|------|-------|
| `runtime` | `src/lib/runtime/` | 22 |
| `devices` | `src/lib/devices/` | 10 |
| `surfaces` | `src/lib/surfaces/` | 8 |
| `deployment` | `src/lib/deployment/` | 12 |
| `db` | `src/lib/db/` | 11 |
| `backend-topology` | `src/lib/backend-topology/` | 10 |

### 2.7 Platform/Governance Layer

| Module | Path | Files |
|--------|------|-------|
| `platform-plane` | `src/lib/platform-plane/` | 10 |
| `platform-law` | `src/lib/platform-law/` | 2 |
| `control-plane` | `src/lib/control-plane/` | 2 |
| `policy` | `src/lib/policy/` | 2 |
| `verification` | `src/lib/verification/` | 3 |
| `truth-manifests` | `src/lib/truth-manifests/` | 11 |

### 2.8 Intelligence Layer

| Module | Path | Files |
|--------|------|-------|
| `advisor-intelligence` | `src/lib/advisor-intelligence/` | 11 |
| `strategic-intelligence` | `src/lib/strategic-intelligence/` | 13 |
| `intelligence-architecture` | `src/lib/intelligence-architecture/` | 12 |
| `boardroom` | `src/lib/boardroom/` | 6 |
| `no-hallucination` | `src/lib/no-hallucination/` | 15 |
| `internal-agents` | `src/lib/internal-agents/` | 13 |
| `ai` | `src/lib/ai/` | 16 |
| `ai-engineering` | `src/lib/ai-engineering/` | 12 |
| `ai-gateway` | `src/lib/ai-gateway/` | 1 |
| `sovereign-ai-gateway` | `src/lib/sovereign-ai-gateway/` | 2 |

### 2.9 Packages / Contracts

| Package | Files |
|---------|-------|
| `advisor-config` | 3 |
| `ai-contracts` | 9 |
| `audit-contracts` | 1 |
| `auth` | 1 |
| `boardroom-contracts` | 1 |
| `business-contracts` | 82 |
| `client-sdk` | 1 |
| `concierge-contracts` | 41 |
| `contracts` | 174 |
| `database-schemas` | 1 |
| `design-tokens` | 1 |
| `enterprise-contracts` | 2 |
| `entitlements` | 1 |
| `event-types` | 1 |
| `feature-flags` | 1 |
| `feature-governance` | 7 |
| `finance-contracts` | 14 |
| `graph-contracts` | 7 |
| `internal-agent-config` | 12 |
| `microinteraction-engine` | 1 |
| `moat-contracts` | 2 |
| `pack-manifests` | 1 |
| `policy-contracts` | 7 |
| `proof-model` | 7 |
| `protocols` | 13 |
| `reality-contracts` | 37 |
| `release-contracts` | 7 |
| `shell-grammar` | 1 |
| `simulation-contracts` | 7 |
| `store-metadata` | 1 |
| `telemetry` | 1 |
| `template-registry` | 1 |
| `workflow-primitives` | 1 |


---

## Section 3 — Backend (`supabase/`)

### 3.1 Edge Functions

| # | Function | Category |
|---|----------|----------|
| 1 | `admin-ai-workforce-run` | admin |
| 2 | `admin-api` | admin |
| 3 | `admin-bff-gateway` | admin |
| 4 | `admin-gateway` | admin |
| 5 | `admin-intelligence` | admin |
| 6 | `admin-users` | admin |
| 7 | `advisor-agent-loop` | advisor |
| 8 | `advisor-avatar-generate` | advisor |
| 9 | `advisor-conversation` | advisor |
| 10 | `advisor-deep-intelligence` | advisor |
| 11 | `advisor-knowledge-manage` | advisor |
| 12 | `advisor-weekly-report` | advisor |
| 13 | `agent-executor` | agent |
| 14 | `agent-heartbeat` | agent |
| 15 | `agent-intelligence` | agent |
| 16 | `agent-scheduler` | agent |
| 17 | `agent-signal` | agent |
| 18 | `ai-gateway` | ai |
| 19 | `ai-health` | ai |
| 20 | `ambient-os-operations` | platform |
| 21 | `api-gateway` | platform |
| 22 | `booking-manage` | business |
| 23 | `brain-core` | intelligence |
| 24 | `business-advisor-intelligence` | intelligence |
| 25 | `business-board-api` | intelligence |
| 26 | `cashflow-calculate` | finance |
| 27 | `chat-advisor` | advisor |
| 28 | `check-ai-budget` | ai |
| 29 | `cloud-admin-api` | cloud |
| 30 | `cloud-device-api` | cloud |
| 31 | `cloud-lifecycle-api` | cloud |
| 32 | `cloud-storage-api` | cloud |
| 33 | `cloud-sync-api` | cloud |
| 34 | `cloud-tenant-api` | cloud |
| 35 | `cloud-worker-api` | cloud |
| 36 | `connector-batch` | connector |
| 37 | `connector-discover` | connector |
| 38 | `connector-health` | connector |
| 39 | `connector-oauth` | connector |
| 40 | `connector-operations` | connector |
| 41 | `connector-proxy` | connector |
| 42 | `connector-transform` | connector |
| 43 | `cost-alert` | utility |
| 44 | `crm-sync` | business |
| 45 | `device-telemetry` | runtime |
| 46 | `ecosystem-operations` | platform |
| 47 | `event-processor` | utility |
| 48 | `file-ingestion` | files |
| 49 | `gdpr-delete` | compliance |
| 50 | `gdpr-export` | compliance |
| 51 | `get-weather` | utility |
| 52 | `intelligence-api` | intelligence |
| 53 | `invoice-generate` | finance |
| 54 | `main` | utility |
| 55 | `msa-operations` | platform |
| 56 | `os-agent-channel` | os-runtime |
| 57 | `os-command` | os-runtime |
| 58 | `os-status` | os-runtime |
| 59 | `payment-process` | finance |
| 60 | `personal-brain` | utility |
| 61 | `provider-family-operations` | platform |
| 62 | `push-dispatch` | push |
| 63 | `push-track` | push |
| 64 | `revenue-caller` | finance |
| 65 | `runtime-probes` | runtime |
| 66 | `scheduler-dispatch` | utility |
| 67 | `seed-user-data` | utility |
| 68 | `self-healing` | runtime |
| 69 | `support-gateway` | support |
| 70 | `system-updates` | runtime |
| 71 | `tax-estimate` | finance |
| 72 | `user-bff-gateway` | platform |
| 73 | `vapid-public-key` | push |
| 74 | `verification-recorder` | platform |

### 3.2 Migrations — 161 total

All migrations in `supabase/migrations/` are applied chronologically via Lovable Cloud.


---

## Section 4 — Scripts (`scripts/`)

| Domain | Path | Files | Purpose |
|--------|------|-------|---------|
| `architecture` | `scripts/architecture/` | 90 | Architecture boundary enforcement & compliance checks |
| `bootstrap` | `scripts/bootstrap/` | 3 | Project bootstrap/init |
| `codemods` | `scripts/codemods/` | 2 | Automated code transformations |
| `contracts` | `scripts/contracts/` | 23 | Contract/import boundary checks |
| `db` | `scripts/db/` | 17 | Database checks, migrations, schema validation |
| `deployment` | `scripts/deployment/` | 19 | Deployment checks, local dev, deploy scripts |
| `docs` | `scripts/docs/` | 2 | Documentation generators |
| `legacy` | `scripts/legacy/` | 6 | Deprecated/archived scripts |
| `manifests` | `scripts/manifests/` | 48 | Manifest generation, validation, and registry |
| `migrate` | `scripts/migrate/` | 3 | Migration helper scripts |
| `registry` | `scripts/registry/` | 8 | Script system registries (8 canonical files) |
| `release` | `scripts/release/` | 41 | Release engineering, VMware, rings, bundles |
| `runtime` | `scripts/runtime/` | 22 | Runtime checks, edge function validation, generation |
| `security` | `scripts/security/` | 5 | Security attestations, checks |
| `support` | `scripts/support/` | 10 | Diagnostics, recovery, support tools |
| `testing` | `scripts/testing/` | 2 | Test scaffold/helpers |


---

## Section 5 — Generated Artifacts (`generated/`)

| Artifact | Class |
|----------|-------|
| `accessibility-summary.json` | data |
| `admin-support-visibility-manifest.json` | structural |
| `advisor-registry.json` | structural |
| `architecture-compliance-report.json` | compliance |
| `base-os-manifest.json` | structural |
| `boardroom-template-index.json` | structural |
| `boot-chain-manifest.json` | structural |
| `capability-event-matrix.json` | structural |
| `capability-family-index.json` | structural |
| `capability-index.json` | structural |
| `capability-owner-map.json` | structural |
| `capability-policy-matrix.json` | structural |
| `capability-quality-metric.json` | operational |
| `capability-receipt-matrix.json` | structural |
| `capability-surface-matrix.json` | structural |
| `connector-catalog.json` | data |
| `contract-manifest.json` | structural |
| `feature-integration-index.json` | structural |
| `first-boot-contract-manifest.json` | structural |
| `first-boot-proof-receipts.json` | data |
| `formula-registry.json` | structural |
| `integration-map.json` | structural |
| `internal-agent-registry.json` | structural |
| `kernel-architecture-manifest.json` | structural |
| `launch-tier-index.json` | structural |
| `lifecycle-authority-manifest.json` | structural |
| `maturity-thresholds.json` | data |
| `operational-metrics-snapshot.json` | operational |
| `operational-scorecards.json` | operational |
| `outcome-index.json` | structural |
| `ownership-manifest.json` | structural |
| `plane-ownership.json` | data |
| `prompt-index.json` | structural |
| `recovery-outcome-manifest.json` | structural |
| `release-gate-thresholds.json` | compliance |
| `rendering-pipeline-manifest.json` | structural |
| `route-manifest.json` | structural |
| `route-tier-manifest.json` | structural |
| `runtime-conformance-manifest.json` | structural |
| `runtime-ports.json` | data |
| `security-model-manifest.json` | structural |
| `security-review-manifest.json` | structural |
| `service-consolidation-manifest.json` | structural |
| `service-manifest.json` | structural |
| `shell-space-registry.json` | structural |
| `startup-order.json` | data |
| `subject-manifest.json` | structural |
| `subscription-replacement-matrix.json` | structural |
| `surface-performance-budget.json` | contract |
| `syscall-manifest.json` | structural |
| `userspace-services-manifest.json` | structural |
| `validation-summary.json` | data |
| `visual-regression-baseline.json` | contract |
| `DEPLOYMENT_AUDIT.md` | report |
| `FULL_ISSUES_AND_FIXES.md` | report |
| `FULL_MASTER_AUDIT.md` | report |
| `drift-report.md` | report |
| `production-truth-dashboard.md` | report |


---

## Section 6 — Infrastructure

### 6.1 Electron / Desktop

| File | Purpose |
|------|---------|
| `electron/main.cjs` | Electron main process |
| `electron/preload.cjs` | Context bridge / preload |
| `electron/fs-bridge.cjs` | Filesystem access bridge |
| `electron/auto-updater.cjs` | OTA update support |
| `electron/crash-reporter.cjs` | Crash reporting |
| `electron/forge.config.cjs` | Electron Forge build config |

### 6.2 Deploy Artifacts

| File | Purpose |
|------|---------|
| `deploy/nginx.conf` | Nginx reverse proxy config |
| `deploy/kong.yml` | Kong API gateway config |
| `deploy/traefik/` | Traefik ingress config |
| `deploy/Dockerfile.api` | API container image |
| `deploy/Dockerfile.brain` | Brain-core container image |
| `deploy/db-init/` | Database initialization |
| `deploy/backup.sh` | Backup automation |
| `deploy/first-boot.sh` | First-boot appliance setup |
| `deploy/ota-agent.sh` | OTA update agent |
| `deploy/metrics-agent.sh` | Metrics collection agent |
| `deploy/sita-eula.sh` | EULA acceptance flow |
| `deploy/auditd/` | Audit daemon config |
| `deploy/logrotate-sita.conf` | Log rotation |

### 6.3 CI Workflows

| Workflow | Purpose |
|----------|---------|
| `ci.yml` | Main CI pipeline |
| `deploy.yml` | Deployment orchestration |
| `deploy-frontend.yml` | Frontend deployment |
| `deploy-backend.yml` | Backend deployment |
| `build-planes.yml` | Multi-plane build |
| `check-boundaries.yml` | Architecture boundary enforcement |
| `customer-journey-manual.yml` | Manual journey testing |
| `customer-journey-nightly.yml` | Nightly journey tests |
| `playwright-proof-nightly.yml` | Nightly E2E proof tests |

---

## Section 7 — Deployment Readiness Matrix

| Plane | Build Target | Status | Notes |
|-------|-------------|--------|-------|
| **Web SPA** | Vite bundle → CDN | ✅ READY | Primary deployment target |
| **Admin** | Vite bundle (admin routes) | ✅ READY | Shared SPA with route guards |
| **Mobile** | Responsive PWA | ✅ READY | PWA-based, native bridges deferred |
| **Desktop/Electron** | Electron Forge | ⚠️ PROTOTYPE | Electron files exist, no green CI artifact |
| **Appliance/VMware** | OVA/ISO | ⚠️ DOCS-ONLY | Scripts exist, no verified build |
| **Backend** | Edge Functions (Deno) | ✅ READY | 74 functions deployed via Lovable Cloud |
| **Database** | PostgreSQL + RLS | ✅ READY | 161 migrations, 198 tables |

---

## Section 8 — Frontend ↔ Backend Alignment Matrix

| Journey | Pages | Hooks | Edge Functions | DB Tables | Status |
|---------|-------|-------|----------------|-----------|--------|
| Auth/Login | LandingPage, Onboarding | useAuth | seed-user-data | profiles, user_roles | ✅ WIRED |
| Business Center | BusinessCenter | useBusinessProfile | business-board-api | advisor_*, business_* | ✅ WIRED |
| Money/Finance | MoneyCenter | useFinanceNavigation | cashflow-calculate, tax-estimate, invoice-generate | financial_*, tax_* | ✅ WIRED |
| Concierge | ConciergeCenter | useConciergeData | booking-manage | appointments, concierge_* | ✅ WIRED |
| Files | FilesCenter | useFiles | file-ingestion | file_*, knowledge_* | ✅ WIRED |
| Boardroom | Boardroom | useBoardroom | business-board-api | boardroom_* | ✅ WIRED |
| Advisors | Advisor pages | useAdvisor* | advisor-*, chat-advisor | advisor_* | ✅ WIRED |
| Connectors | ConnectorHub | useConnectors | connector-* | connector_* | ✅ WIRED |
| AI Workforce | AIWorkforcePage | useAIWorkforce | admin-ai-workforce-run | ai_workforce_* | ✅ WIRED |
| Admin Dashboard | AdminDashboard | useAdmin* | admin-gateway, admin-api | admin_* | ✅ WIRED |
| Push Notifications | NotificationCenter | usePushNotifications | push-dispatch, push-track, vapid-public-key | push_* | ✅ WIRED |
| Payments | MoneyCenter | usePayments | payment-process | payment_*, invoice_* | ✅ WIRED |
| GDPR | SettingsPage | useGDPR | gdpr-export, gdpr-delete | — (cross-table) | ✅ WIRED |
| Desktop Shell | DesktopPage | useElectronBridge | os-command, os-status | — | ⚠️ SIMULATED |
| VMware Appliance | — | — | — | — | 📄 DOCS-ONLY |

---

## Section 9 — Reality Classification Summary

| Feature Domain | Classification | Evidence |
|----------------|---------------|----------|
| Web SPA | **REAL** | Vite build, live preview, CDN deploy |
| Admin Control Plane | **REAL** | 503 admin pages, route guards, RLS |
| AI Advisors | **REAL** | Edge functions, DB persistence, live AI |
| Boardroom | **REAL** | 5-model structure, decision receipts |
| Connectors | **REAL** | OAuth, sync, health checks via edge functions |
| Push Notifications | **REAL** | VAPID keys, service worker, edge functions |
| Files/Knowledge | **REAL** | File ingestion edge function, storage |
| Finance/Money | **REAL** | Cashflow, tax, invoice edge functions |
| Desktop OS Shell | **SIMULATED** | Compositor/window manager in browser, no real OS |
| Electron Desktop | **PROTOTYPE** | Files exist, no CI build artifact |
| Mobile Native | **DEFERRED** | PWA only, no native bridges |
| VMware/Appliance | **DOCS-ONLY** | Deploy scripts exist, never built/tested |
| IoT/Wearable | **DOCS-ONLY** | Admin pages exist, no runtime |

---

## Section 10 — Outstanding Issues & Recommendations

### P0 — Launch Blockers

| Issue | Impact | Remediation |
|-------|--------|-------------|
| No Sentry/error monitoring | Blind to production errors | Add error boundary + Sentry SDK |
| No green CI artifact for Electron | Desktop not shippable | Wire Electron Forge to CI |
| Missing native mobile bridges | iOS/Android not native | Remain PWA or add Capacitor |
| No emergency payment kill switch | Financial risk | Add kill-switch edge function |

### P1 — Important

| Issue | Impact | Remediation |
|-------|--------|-------------|
| Service sprawl (~218 services) | Maintenance burden | Consolidate to ~45 canonical |
| Some admin pages are UI shells | Operator confusion | Add real data backing or mark simulated |
| Desktop shell is browser-simulated | User expectations | Honest classification in UI |

### P2 — Housekeeping

| Issue | Impact | Remediation |
|-------|--------|-------------|
| Legacy paths in barrel re-exports | Technical debt | Incremental physical migration |
| Some generated artifacts lack validators | Drift risk | Add validators per manifest-registry |

---

## Section 11 — Refactor Verification

### Stale Reference Audit

| Check | Status |
|-------|--------|
| `scripts/validation/` references in registries | ✅ ZERO |
| Old `scripts/architecture/boundary-check.ts` paths | ✅ FIXED → `checks/` |
| Old `scripts/generate-*` root paths | ✅ FIXED → `manifests/generate/` |
| Admin page script references | ✅ FIXED |
| Doc script references | ✅ FIXED |
| Platform-law-registry canonical paths | ✅ ALL UPDATED |
| Manifest-registry consumer paths | ✅ CLEAN |

### Build Status

- TypeScript compilation: Verified via prior `npx tsc --noEmit` (0 errors)
- Import integrity: All barrel exports resolve
- Route integrity: All route targets exist

---

## Appendix A — Full `src/lib/` Directory Map

| Directory | Files | Purpose |
|-----------|-------|---------|
| `__tests__` | 22 | __tests__ layer |
| `admin-ai` | 9 | admin-ai layer |
| `advisor-intelligence` | 11 | advisor-intelligence layer |
| `advisor-protocol` | 4 | advisor-protocol layer |
| `ai-engineering` | 12 | ai-engineering layer |
| `ai-gateway` | 1 | ai-gateway layer |
| `ai` | 16 | ai layer |
| `api` | 5 | api layer |
| `app-platform` | 3 | app-platform layer |
| `architecture` | 31 | architecture layer |
| `backend-topology` | 10 | backend-topology layer |
| `boardroom` | 6 | boardroom layer |
| `capabilities` | 22 | capabilities layer |
| `cloud-backbone` | 11 | cloud-backbone layer |
| `compute-governance` | 7 | compute-governance layer |
| `constants` | 2 | constants layer |
| `contracts` | 2 | contracts layer |
| `control-plane` | 2 | control-plane layer |
| `core-services` | 217 | core-services layer |
| `customer-journey` | 9 | customer-journey layer |
| `data-services` | 33 | data-services layer |
| `db` | 11 | db layer |
| `delivery-methodology` | 8 | delivery-methodology layer |
| `demo-data` | 31 | demo-data layer |
| `demo-scenarios` | 5 | demo-scenarios layer |
| `deployment` | 12 | deployment layer |
| `design-system` | 5 | design-system layer |
| `detection` | 3 | detection layer |
| `devices` | 10 | devices layer |
| `domain-engines` | 9 | domain-engines layer |
| `domain-system` | 10 | domain-system layer |
| `dual-reality` | 23 | dual-reality layer |
| `engine` | 3 | engine layer |
| `engines` | 60 | engines layer |
| `fip` | 2 | fip layer |
| `hooks` | 10 | hooks layer |
| `integrations` | 1 | integrations layer |
| `intelligence-architecture` | 12 | intelligence-architecture layer |
| `internal-agents` | 13 | internal-agents layer |
| `investment-office` | 2 | investment-office layer |
| `journeys` | 2 | journeys layer |
| `mock-data` | 27 | mock-data layer |
| `no-hallucination` | 15 | no-hallucination layer |
| `nova-sdk` | 55 | nova-sdk layer |
| `observability` | 11 | observability layer |
| `orchestration` | 45 | orchestration layer |
| `os-security` | 18 | os-security layer |
| `os-services` | 33 | os-services layer |
| `pack-store` | 1 | pack-store layer |
| `persistence` | 20 | persistence layer |
| `platform-law` | 2 | platform-law layer |
| `platform-plane` | 10 | platform-plane layer |
| `policy` | 2 | policy layer |
| `reality-audit` | 1 | reality-audit layer |
| `reality-records` | 2 | reality-records layer |
| `runtime` | 22 | runtime layer |
| `security` | 2 | security layer |
| `seed` | 4 | seed layer |
| `services` | 478 | services layer |
| `setup` | 3 | setup layer |
| `shopify` | 2 | shopify layer |
| `simulation` | 3 | simulation layer |
| `sovereign-ai-gateway` | 2 | sovereign-ai-gateway layer |
| `storage` | 2 | storage layer |
| `strategic-intelligence` | 13 | strategic-intelligence layer |
| `support` | 2 | support layer |
| `surfaces` | 8 | surfaces layer |
| `sync-engine` | 38 | sync-engine layer |
| `truth-manifests` | 11 | truth-manifests layer |
| `types` | 19 | types layer |
| `utils` | 3 | utils layer |
| `ux-trust` | 7 | ux-trust layer |
| `verification` | 3 | verification layer |


---

## Appendix B — Planes Architecture

| Plane | Manifest | Entry |
|-------|----------|-------|
| Product | `planes/product.ts` | User-facing SPA |
| Admin | `planes/admin.ts` | Admin control plane |
| Backend | `planes/backend.ts` | Edge functions + DB |
| OS | `planes/os.ts` | Shell/kernel simulation |
| Shared | `planes/shared.ts` | Cross-plane contracts |
| Founder | `planes/founder.ts` | Founder/engineering |
| Mobile | `planes/mobile.ts` | Mobile PWA surface |
| Internal Tools | `planes/internal-tools.ts` | Internal tooling |

---

*End of Deployment Audit — SITA OS*
