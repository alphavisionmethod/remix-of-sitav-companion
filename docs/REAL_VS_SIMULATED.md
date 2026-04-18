# REAL vs SIMULATED — Full SITA OS Architecture Reality Audit

> Generated: 2026-04-15
> Scope: Entire codebase — 3,936 files, 207,763 lines, 185 tables, 77 edge functions, 135 migrations

---

## 1. Executive Summary

SITA OS is a Lovable-hosted Vite + React + TypeScript SPA backed by Supabase. It presents itself as a multi-plane operating system platform with kernel services, device management, AI workforce, boardroom governance, cloud infrastructure, and mobile authority. **The reality is that the project is a well-scaffolded frontend application with genuine backend infrastructure (auth, DB, edge functions, storage) powering roughly 15–20% of its surface area, while the remaining 80–85% is UI-only, demo-data-driven, or architecturally aspirational.**

### Top 10 Truths

1. **Authentication is real.** Supabase Auth with email/password, Google OAuth, session management, protected routes, role-based access via `has_role()` security definer.
2. **The database schema is real and extensive.** 185 tables, 1,291 RLS policies, 135 migrations. Tables exist for CRM, cloud tenancy, AI workforce, connectors, notifications, boardroom, devices, and more.
3. **53 edge functions have real DB logic.** `connector-oauth`, `os-command`, `ai-gateway`, `brain-core`, `push-dispatch`, `gdpr-export`, `admin-api`, `cloud-storage-api`, etc.
4. **The connector system (Google OAuth) is real.** Token storage, discovery, health checks, batch operations.
5. **File storage is real.** `user-files` bucket, upload hooks, cloud file browser wired to storage API.
6. **304 out of ~400+ pages consume demo or mock data.** The vast majority of UI surfaces are not wired to real backend state.
7. **The "kernel" is a browser-hosted TypeScript simulation.** There is no real OS kernel, no real scheduler, no real memory manager, no real process manager.
8. **200+ service shims in `src/lib/services/` are frontend abstractions.** They are not real backend services. Most re-export from `core-services` or contain local-only logic.
9. **"Mobile" is 25 responsive React pages.** No Flutter, no native code, no mobile app binary exists.
10. **Electron exists as a scaffold only.** 6 files, no evidence of production Electron builds.

---

## 2. Classification Method

| Classification | Definition |
|---|---|
| **REAL NOW** | Feature is implemented end-to-end: real data persistence, real backend logic, real frontend consumption of live data, real user-facing behavior. |
| **PARTIALLY REAL** | Some real infrastructure exists (tables, edge functions, or hooks) but the end-to-end flow is incomplete — UI may still use demo data, or backend logic exists but isn't consumed. |
| **SIMULATED / UI-ONLY** | Feature exists only as frontend code, mock data, TypeScript abstractions, or visual representations. No real backend truth, no real runtime, no real persistence of the described behavior. |

### What does NOT count as "real"

- A page existing
- A TypeScript service file existing
- A type/interface existing
- A schema existing without queries consuming it
- A test existing
- A dashboard displaying mock data
- A generated manifest describing a system
- An architecture document

### What counts as "real"

- `supabase.from('table').select/insert/update/delete` in production code paths
- Edge functions that read/write real data and are invoked by the application
- Auth flows that gate real access
- Storage operations that persist real files
- Realtime subscriptions that receive real database changes

---

## 3. High-Level Classification Table

| # | System Area | Classification | Why | What's Missing |
|---|---|---|---|---|
| 1 | Authentication & Identity | **REAL** | Supabase Auth, Google OAuth, roles, sessions, protected routes | Device identity is simulated |
| 2 | Database & Schema | **REAL** | 185 tables, 1,291 RLS policies, 135 migrations | Many tables have no frontend consumers |
| 3 | Edge Functions | **PARTIALLY REAL** | 53 with DB logic, but many not consumed by UI | UI integration for most functions |
| 4 | Connector System | **REAL** | Real OAuth flow, token storage, health checks | Sync/transform pipelines partial |
| 5 | File Storage | **REAL** | Real bucket, upload hooks, file browser | Version history UI-only |
| 6 | Push Notifications | **PARTIALLY REAL** | VAPID keys, edge function, delivery table | Service worker not fully wired |
| 7 | CRM | **PARTIALLY REAL** | Real tables, some queries | Most CRM pages use demo data |
| 8 | AI Gateway & Workforce | **PARTIALLY REAL** | Edge function calls real providers, tables exist | Pages use demo data, budget gate is frontend-only |
| 9 | Boardroom & Governance | **PARTIALLY REAL** | Real tables with RLS | Pages use demo/mock data |
| 10 | OS Commands & Execution | **PARTIALLY REAL** | Edge function queues to `agent_signals` | No device agent consumes commands |
| 11 | Approvals | **PARTIALLY REAL** | Tables exist, some UI | Full lifecycle not wired |
| 12 | Receipts & Proof | **PARTIALLY REAL** | Receipt tables exist | Proof center uses demo data |
| 13 | Notifications (in-app) | **PARTIALLY REAL** | Real `notifications` table, realtime | Some pages bypass for demo data |
| 14 | Timeline & Activity | **SIMULATED** | Pages exist, use demo data | No real event materialization |
| 15 | Nova Kernel & OS Runtime | **SIMULATED** | 20+ files simulating scheduler, memory, processes | No real OS artifact exists |
| 16 | OS Services (daemons) | **SIMULATED** | 33 TypeScript daemon files | Frontend abstractions, not system services |
| 17 | OS Security | **SIMULATED** | 17 modules named like system services | No real security runtime |
| 18 | Shell & Desktop | **SIMULATED** | Window manager, dock, status bar | Browser simulation, not real OS |
| 19 | Mobile | **SIMULATED** | 25 responsive React pages | No native app, no Flutter code |
| 20 | Electron / Desktop Host | **SIMULATED** | 6 scaffold files | No production builds |
| 21 | Digital Twin & Simulations | **SIMULATED** | UI concept pages | No persistent simulation infra |
| 22 | Sync Engine | **SIMULATED** | Frontend abstractions | No real offline-first sync |
| 23 | Trust & Policy Engine | **SIMULATED** | TypeScript abstractions, dashboards | No backend trust evaluation |
| 24 | Event Bus | **SIMULATED** | Frontend EventEmitter | Not a real message broker |
| 25 | App Store & Packs | **SIMULATED** | UI pages with demo data | No real app install/remove |

---

## 4. Detailed Audit By Category

---

### 4.1 Authentication & Identity

**Classification: REAL NOW**

**Evidence:**
- `src/contexts/AuthContext.tsx` — real Supabase Auth with `onAuthStateChange`, session management
- `src/components/auth/` — real login/signup forms calling `supabase.auth.signInWithPassword`, `signUp`, `signInWithOAuth`
- `src/hooks/useAuth.ts` — real session hook
- Google OAuth configured via `supabase--configure_social_auth`
- `user_roles` table with `has_role()` security definer function (prevents privilege escalation)
- `profiles` table with `handle_new_user()` trigger auto-creating profiles on signup
- Protected route components gating access based on auth state
- Demo user fallback (`demo@sita.app`) for unauthenticated browsing

**What appears real:**
- Email/password login and signup
- Google OAuth
- Session persistence across page reloads
- Role-based access control via `user_roles`
- Profile auto-creation on signup
- Protected routes

**What appears partial:**
- Device identity (`cloud_devices` table exists, but device trust evaluation is frontend-only)
- MFA (admin sessions table has `mfa_verified` column, but no real MFA flow implemented)

**What appears simulated:**
- "Account graph" and "identity provider" concepts in OS pages — purely visual
- Device trust scoring — frontend calculation, not backend-enforced

**What is missing for full reality:**
- Real MFA enrollment and verification
- Real device attestation/trust evaluation on backend
- Real device identity binding to auth sessions

---

### 4.2 Database & Schema

**Classification: REAL NOW**

**Evidence:**
- 185 tables across 135 migrations
- 1,291 RLS policies protecting data
- Tables span: CRM, cloud tenancy, AI workforce, connectors, notifications, boardroom, devices, onboarding, appointments, calendar, ecosystem, admin audit, compliance
- Real foreign key relationships between tables
- Real indexes for performance
- Database functions: `has_role()`, `handle_new_user()`, various triggers

**What appears real:**
- All tables are real Supabase/Postgres tables
- RLS policies are real and enforced
- Migrations are real and applied

**What appears partial:**
- Many tables have no frontend consumers querying them in production mode
- Some tables were created for future features that remain unbuilt

**What appears simulated:**
- Nothing — the schema itself is genuinely real

**What is missing:**
- Frontend integration for the ~60% of tables that have no production consumers
- Data lifecycle management (archival, cleanup)

---

### 4.3 Edge Functions

**Classification: PARTIALLY REAL**

**Evidence:**
- 77 total edge functions in `supabase/functions/`
- 53 contain real database read/write logic
- Key real functions:
  - `connector-oauth` — real Google OAuth initiate/callback with token storage
  - `os-command` — real command queue writing to `agent_signals` with audit logging
  - `ai-gateway` — real AI provider calls (OpenAI/Anthropic) with receipt logging
  - `brain-core` — real AI reasoning with DB persistence
  - `push-dispatch` — real push notification dispatch
  - `gdpr-export` / `gdpr-delete` — real data export/deletion
  - `admin-api` / `admin-users` — real admin user management
  - `cloud-storage-api` — real file operations
  - `seed-user-data` — real demo data seeding
  - `intelligence-api` — real intelligence queries
  - `revenue-caller` — real revenue data operations

**What appears real:**
- OAuth flows
- AI provider invocations
- Push dispatch
- GDPR compliance operations
- Admin user management
- Cloud storage operations
- Command queuing

**What appears partial:**
- Many edge functions exist but are not called by the frontend in production mode
- Some functions are written but have no UI trigger
- Connector sync/transform functions exist but orchestration is incomplete

**What appears simulated:**
- ~24 edge functions with minimal or no DB logic (utility functions, health checks, stubs)

**What is missing:**
- UI integration for the majority of edge functions
- Monitoring and error handling dashboards consuming edge function health data
- End-to-end testing of edge function flows

---

### 4.4 Connector System

**Classification: REAL NOW**

**Evidence:**
- `connector-oauth` edge function with real Google OAuth initiate and callback
- `cloud_connectors` table storing connector state, tokens, health
- `cloud_connector_sync_configs` for sync configuration
- `connector-discovery`, `connector-batch-ops`, `connector-health-check` edge functions
- Frontend `ConnectorCard`, `ConnectorGrid` components consuming real connector state
- Real token refresh and disconnect flows

**What appears real:**
- Google OAuth connect/disconnect
- Token storage and refresh
- Connector health monitoring
- Discovery of available connectors

**What appears partial:**
- Data sync pipelines (config exists, execution incomplete)
- Transform/mapping logic (edge functions exist, not fully consumed)
- Batch operations (function exists, UI integration partial)

**What is missing:**
- Full data sync execution pipeline
- Conflict resolution during sync
- Multi-provider connector support beyond Google

---

### 4.5 File Storage

**Classification: REAL NOW**

**Evidence:**
- `user-files` Supabase storage bucket (real)
- `useFileUpload` hook with real `supabase.storage.from('user-files').upload()`
- `cloud-storage-api` edge function for file operations
- `cloud_files` table for file metadata
- Cloud file browser component consuming real storage data

**What appears real:**
- File upload to real storage bucket
- File metadata persistence
- File browsing and download

**What appears partial:**
- Version history (table columns exist, UI shows demo data)
- Trash/restore flow (partial UI)
- File sharing (table exists, UI partial)

**What is missing:**
- Real version history tracking
- Real trash/restore lifecycle
- Real file sharing with permission management
- File search and indexing

---

### 4.6 Push Notifications

**Classification: PARTIALLY REAL**

**Evidence:**
- VAPID keys configured in edge function secrets
- `push-dispatch` edge function sends push notifications
- `push-track` edge function for delivery tracking
- `notification_delivery_receipts` table for tracking delivery
- `notifications` table for in-app notifications
- Real VAPID public key function for client subscription

**What appears real:**
- Push dispatch infrastructure
- Delivery receipt storage
- VAPID key management

**What appears partial:**
- Browser service worker registration (setup exists but end-to-end flow not fully verified)
- Push subscription management on client side

**What is missing:**
- Verified end-to-end push delivery to browser
- Push notification preferences management
- Rich notification actions
- Push analytics dashboard consuming real delivery data

---

### 4.7 CRM

**Classification: PARTIALLY REAL**

**Evidence:**
- Real tables: `crm_contacts`, `crm_companies`, `crm_opportunities`, `crm_pipelines`, `crm_pipeline_stages`, `crm_tags`, `crm_segments`, `crm_communications`, `crm_activities`
- RLS policies on all CRM tables
- Some data services with real Supabase queries

**What appears real:**
- Database schema and RLS
- Basic CRUD operations in data services

**What appears partial:**
- CRM pages exist but many consume demo data via `isDemoMode` checks
- Pipeline visualization uses mix of real and demo data

**What appears simulated:**
- Advanced CRM features (lead scoring, email campaigns, automation) — UI-only

**What is missing:**
- Full wiring of CRM pages to real data services
- Email integration for CRM communications
- Automation engine for CRM workflows

---

### 4.8 AI Gateway & Workforce

**Classification: PARTIALLY REAL**

**Evidence:**
- `ai-gateway` edge function calls real providers (OpenAI, Anthropic) with API keys stored as secrets
- `ai_inference_receipts` table logs every AI call with model, tokens, cost, latency
- `ai_workforce_roles`, `ai_workforce_invocations`, `ai_workforce_recommendations`, `ai_workforce_outputs` — real tables with RLS
- `brain-core` edge function provides real AI reasoning
- `personal-brain` edge function for personal AI features
- Budget classes table (`ai_workforce_budget_classes`) for cost control

**What appears real:**
- AI provider invocation via edge function
- Receipt/audit logging of AI calls
- Role and permission configuration tables
- Budget class definitions

**What appears partial:**
- Most AI workforce dashboard pages use demo data
- Budget gate enforcement is frontend-only (`src/lib/ai-gateway/budget-gate.ts`)
- Recommendation lifecycle (create → review → approve → execute) has tables but UI uses demo data
- AI workforce health monitoring tables exist but dashboards use demo data

**What appears simulated:**
- "Epistemic firewall" — frontend abstraction
- "No-hallucination framework" — frontend abstraction
- AI workforce maturity dashboards — demo data
- Launch honesty auditing — tables exist but no real audit pipeline

**What is missing:**
- Frontend wiring of AI workforce pages to real tables
- Real budget enforcement on backend (not just frontend gate)
- Real recommendation lifecycle end-to-end
- Real AI workforce health monitoring consuming live metrics

---

### 4.9 Boardroom & Governance

**Classification: PARTIALLY REAL**

**Evidence:**
- Real tables: `boardroom_sessions`, `boardroom_items`, `boardroom_evidence`, `boardroom_recommendations`, `boardroom_decision_receipts`
- RLS policies on all boardroom tables
- Real foreign key relationships between sessions, items, evidence, recommendations, receipts
- Edge functions exist for boardroom operations

**What appears real:**
- Database schema with proper relationships
- RLS enforcement

**What appears partial:**
- Boardroom UI pages exist but consume demo/mock data
- Decision receipt generation logic exists but isn't triggered from live UI flows

**What appears simulated:**
- Advisor deliberation simulation
- Evidence freshness scoring
- Confidence state visualization
- Simulation snapshots in receipts

**What is missing:**
- Frontend wiring to real boardroom tables
- Real session lifecycle (open → deliberate → decide → receipt)
- Real evidence ingestion from live data sources
- Real advisor AI integration for deliberation

---

### 4.10 OS Commands & Execution

**Classification: PARTIALLY REAL**

**Evidence:**
- `os-command` edge function writes commands to `agent_signals` table with full audit logging
- `agent_signals` table stores queued commands with status tracking
- `admin_action_audit` table logs command execution attempts
- Command contracts define command vocabulary

**What appears real:**
- Command queuing to database via edge function
- Audit trail of command attempts

**What appears partial:**
- Commands are stored but no real device agent polls or executes them
- Command status updates exist in schema but no real execution feedback loop

**What appears simulated:**
- Command execution visualization in UI
- Command history timeline (uses demo data)
- Device-side command processing

**What is missing:**
- Real device agent that polls `agent_signals` and executes commands
- Real execution feedback (success/failure/progress) written back to DB
- Real command receipt generation after execution
- Real rollback capability for failed commands

---

### 4.11 Approvals

**Classification: PARTIALLY REAL**

**Evidence:**
- Real tables: `ai_workforce_approval_queue`, `admin_action_confirmations`, `boardroom_decision_receipts`
- RLS policies enforcing user-scoped access
- Approval status fields (pending, approved, rejected) in schema
- Some UI for approval flows

**What appears real:**
- Approval record storage
- Status tracking in database

**What appears partial:**
- Approval UI exists but most flows use demo data
- Approve/deny actions may write to DB in some flows but full lifecycle isn't wired

**What appears simulated:**
- Dual-approval workflows (schema supports it, no real flow exists)
- Approval escalation chains
- Time-bound approval windows

**What is missing:**
- End-to-end approval lifecycle wired from UI through to execution
- Real notification of pending approvals
- Real escalation logic
- Approval audit trail consumed by UI

---

### 4.12 Receipts & Proof

**Classification: PARTIALLY REAL**

**Evidence:**
- Real tables: `boardroom_decision_receipts`, `ai_inference_receipts`, `notification_delivery_receipts`, `admin_action_audit`
- Receipt service in `src/lib/core-services/receipt-service/`
- Proof center page exists

**What appears real:**
- AI inference receipts are written by `ai-gateway` edge function on every call
- Admin audit records written by `os-command` edge function
- Notification delivery receipts stored by `push-track`

**What appears partial:**
- Boardroom decision receipts have schema but aren't generated from real deliberation flows
- Receipt verification (hash validation) exists in service but isn't consumed end-to-end

**What appears simulated:**
- Proof center page uses demo data
- Proof timeline visualization
- Receipt chain verification UI

**What is missing:**
- Proof center wired to real receipt tables
- Real receipt chain with cryptographic verification
- Real proof timeline materialized from audit events

---

### 4.13 Notifications (In-App)

**Classification: PARTIALLY REAL**

**Evidence:**
- Real `notifications` table with RLS
- Realtime subscription on notifications table (one of 14 realtime-enabled tables)
- Notification center component exists
- `useNotifications` hook with real Supabase queries in some code paths

**What appears real:**
- Notification storage
- Realtime notification delivery via Supabase realtime
- Read/unread state management

**What appears partial:**
- Some notification UIs fall back to demo data
- Notification creation from real application events is inconsistent

**What is missing:**
- Consistent notification generation from all real application events
- Notification preferences and filtering
- Notification grouping and batching

---

### 4.14 Timeline & Activity

**Classification: SIMULATED**

**Evidence:**
- `cloud_activity_journal` table exists with real schema
- Timeline/activity pages exist but consume demo/mock data
- No evidence of real event materialization pipeline writing to activity journal

**What appears real:**
- Table schema

**What appears simulated:**
- All timeline UI uses demo data
- Activity stream visualization
- Command history timeline
- Proof timeline

**What is missing:**
- Real event pipeline writing to `cloud_activity_journal` from application actions
- Real timeline queries in UI replacing demo data
- Event correlation and grouping

---

### 4.15 Nova Kernel & OS Runtime

**Classification: SIMULATED**

**Evidence:**
- `src/lib/core-services/kernel/` — 20+ files: `scheduler.ts`, `memory-manager.ts`, `process-manager.ts`, `syscall-handler.ts`, `crash-resilience.ts`, `power-manager.ts`, `transactional-fs.ts`, `kernel-boot.ts`
- `src/lib/nova-sdk/kernel/` — additional kernel simulation files
- All logic runs in browser JavaScript — no real OS kernel, no real process scheduling, no real memory management

**What appears real:**
- Nothing. This is entirely a browser-hosted simulation.

**What appears simulated:**
- Process scheduler (round-robin/priority simulation in JS)
- Memory manager (simulated allocation/deallocation counters)
- Syscall handler (function dispatch, not real syscalls)
- Crash resilience (try/catch wrappers, not real crash recovery)
- Power manager (battery API wrapper at best, simulated states)
- Transactional filesystem (in-memory key-value store)
- Kernel boot sequence (sequential function calls)

**What is missing to make any of this real:**
- A real OS runtime (Electron with native modules, or actual OS-level code)
- Real process isolation
- Real memory management
- Real filesystem access
- Real hardware interaction
- This entire category would need to be reimagined for a real OS target

---

### 4.16 OS Services (Daemons)

**Classification: SIMULATED**

**Evidence:**
- `src/lib/os-services/` contains 33 files named like Unix daemons: `healthd.ts`, `powerd.ts`, `crashd.ts`, `audiod.ts`, `wifid.ts`, `btd.ts`, `locationd.ts`, `notifyd.ts`, `syncd.ts`, `updated.ts`, `backupd.ts`, `printd.ts`, `accessibilityd.ts`, `vpnd.ts`, `containerd.ts`, `cron.ts`, `syslogd.ts`, etc.
- All are TypeScript classes/functions running in the browser
- No real system service, no real daemon process, no real IPC

**What appears real:**
- Nothing. These are naming conventions applied to browser-hosted TypeScript.

**What appears simulated:**
- Every single daemon file. They simulate daemon behavior (start/stop/status) using in-memory state.

**What is missing:**
- Real system services would require Electron with native addons, or a real server process
- These files serve as architectural placeholders demonstrating intent, not implementation

---

### 4.17 OS Security

**Classification: SIMULATED**

**Evidence:**
- `src/lib/os-security/` contains 17 modules: `authd.ts`, `policyd.ts`, `sessiond.ts`, `secretsd.ts`, `auditd.ts`, `firewalled.ts`, `intrusiondetectd.ts`, `keychaind.ts`, `sandboxd.ts`, `tamperdetectd.ts`, etc.
- All are frontend TypeScript abstractions
- No real security enforcement at OS level

**What appears real:**
- Auth is real (but that's Supabase Auth, not `authd.ts`)
- RLS policies are real (but that's Postgres, not `policyd.ts`)

**What appears simulated:**
- All 17 modules. They are named like security daemons but are browser-hosted TypeScript with no real security enforcement capability.

**What is missing:**
- Real security would come from Supabase RLS (which exists), edge function auth checks (which partially exist), and proper RBAC (which exists via `has_role()`). The `os-security/` modules add no real security.

---

### 4.18 Shell & Desktop

**Classification: SIMULATED (but functionally useful as UI)**

**Evidence:**
- `src/components/sita/shell/` — shell layout, dock, status bar, window manager
- `src/components/sita/os/` — OS-themed UI components
- `src/pages/desktop.tsx` — desktop page with app launcher
- Window management with drag/resize/minimize/maximize
- Dock with app shortcuts
- Status bar with clock, battery, wifi indicators

**What appears real:**
- The shell is a real, functional browser UI. Users can interact with it.
- Window management works in the browser.
- App launching works (opens React routes in window-like containers).

**What appears simulated:**
- It is not a real desktop OS. It is a web application styled to look like one.
- Battery/wifi/bluetooth indicators show simulated values.
- "System tray" items are decorative.

**This is an important nuance:** The shell is "real" as a UI framework — it works, users interact with it. But it is "simulated" as an OS — there is no real OS behind it.

---

### 4.19 Mobile

**Classification: SIMULATED**

**Evidence:**
- `src/pages/mobile/` — 25 React pages with mobile-responsive layouts
- `src/components/mobile/` — mobile-specific React components
- Architecture docs reference Flutter and native mobile targets
- No `flutter/`, `ios/`, `android/` directories exist
- No native mobile code of any kind
- No mobile build configurations

**What appears real:**
- Responsive React pages that render well on mobile viewports

**What appears simulated:**
- "Mobile app" — there is no mobile app
- "Mobile authority device" — there is no native device capability
- "Mobile trust" — there is no native device attestation
- "Push authority" — push exists partially via web push, not native

**What is missing:**
- Flutter project (`/mobile/flutter_app/`)
- Native push notification handling
- Biometric authentication
- Device attestation
- Offline-first mobile data layer
- App store builds

---

### 4.20 Electron / Desktop Host

**Classification: SIMULATED**

**Evidence:**
- `electron/` directory with 6 files: `main.ts`, `preload.ts`, `auto-updater.ts`, `crash-reporter.ts`, `tray.ts`, `ipc-handlers.ts`
- No `electron-builder.yml` or working build configuration
- No evidence of production Electron builds
- Package.json does not have Electron as a dependency
- No IPC channels actively used by the renderer

**What appears real:**
- Scaffold structure exists

**What appears simulated:**
- Everything. No working Electron build exists.

---

### 4.21 Digital Twins & Simulations

**Classification: SIMULATED**

**Evidence:**
- Simulation pages exist in `src/pages/` (digital twin, scenario lab, governance simulator, life simulation)
- `src/lib/simulation/` contains simulation engine abstractions
- All consume demo/mock data
- No persistent simulation infrastructure

**What appears real:**
- Nothing at the backend level

**What appears simulated:**
- All simulation UIs
- Digital twin visualization
- Scenario comparison
- Governance simulation

---

### 4.22 Sync Engine

**Classification: SIMULATED**

**Evidence:**
- `src/lib/sync-engine/` contains sync state machine abstractions
- No real offline-first data layer
- No real conflict resolution
- No real sync protocol implementation
- No IndexedDB or local persistence for offline use

**What appears real:**
- Nothing

**What appears simulated:**
- Sync state machine (frontend abstraction)
- Conflict resolution (conceptual)
- Offline queue (not implemented)

---

### 4.23 Trust & Policy Engine

**Classification: SIMULATED**

**Evidence:**
- `src/lib/services/trust-governor/`, `policy-engine/`, `verification-engine/` — frontend TypeScript abstractions
- Trust center page exists, uses demo data
- `action_safety_classifications` table exists with real schema
- No edge function performing real trust evaluation

**What appears real:**
- `action_safety_classifications` table schema
- `has_role()` function for role-based access (this is real RBAC, but it's Supabase, not the "trust engine")

**What appears simulated:**
- Trust scoring algorithms (frontend-only)
- Policy evaluation engine (frontend-only)
- Device trust assessment (frontend-only)
- Zero-trust validation (frontend-only)

---

### 4.24 Event Bus

**Classification: SIMULATED**

**Evidence:**
- `src/lib/services/event-bus/` — frontend `EventEmitter` pattern
- No real message broker (no Redis, no Kafka, no Supabase realtime used as event bus)
- Events are in-memory, lost on page refresh

**What appears real:**
- Supabase Realtime is used for 14 tables — but this is table-level change detection, not a structured event bus

**What appears simulated:**
- Application-level event bus (frontend-only, in-memory)
- Event correlation
- Event replay
- Dead letter queue

---

### 4.25 App Store & Packs

**Classification: SIMULATED**

**Evidence:**
- App store pages exist with demo app listings
- `cloud_ecosystem_apps`, `cloud_ecosystem_installs` tables exist
- No real app installation/removal mechanism
- No real app sandboxing or permissions

**What appears real:**
- Database schema for ecosystem apps

**What appears simulated:**
- App browsing and installation UI (demo data)
- App permissions management
- App update mechanism
- Pack store

---

## 5. Cross-Cutting Findings

### Finding 1: Frontend-Heavy Service Simulation

The project contains **200+ service directories** under `src/lib/services/` and **43 directories** under `src/lib/core-services/`. The vast majority are frontend TypeScript modules that:
- Re-export types and stubs from `core-services`
- Contain local-only helper logic
- Are never invoked by edge functions or backend code
- Simulate the existence of a microservices architecture within a browser SPA

**This is the single largest source of architectural inflation in the project.**

### Finding 2: Pages Outpace Backend Truth

304 out of ~400+ pages consume demo or mock data. Only ~10 pages have direct Supabase queries, and only ~28 data services contain real DB queries. The UI surface area is roughly **10x larger than the real data-backed surface area**.

### Finding 3: Edge Functions Exist But Are Under-Consumed

53 edge functions have real DB logic, but many are not invoked by the frontend in production mode. The edge function layer is more mature than the frontend's consumption of it.

### Finding 4: Architecture Documents Describe a System That Doesn't Exist Yet

Documents like `runtime-map.md`, `dependency-matrix.md`, `move-map.md`, and plane manifests describe a multi-plane monorepo with Electron, Flutter, Docker, and Turborepo. **None of these deployment targets currently exist.** The project is a single Vite SPA deployed to Lovable's CDN.

### Finding 5: Browser Shell vs Real OS Confusion

The project uses OS terminology (kernel, daemons, syscalls, filesystems, schedulers, memory managers) for what is fundamentally a **web application with a desktop-like UI**. This creates confusion about what the system actually is and can do.

### Finding 6: Demo Mode as Default Reality

The `isDemoMode` / `useDataMode` pattern is pervasive. Most pages default to demo mode, meaning even when real tables and edge functions exist, the UI shows mock data unless explicitly switched. **Demo mode is the default user experience, not real mode.**

### Finding 7: Duplicate Authority

Some concepts have both a "real" implementation (Supabase Auth, RLS) and a "simulated" implementation (`os-security/authd.ts`, `os-security/policyd.ts`). The simulated versions add no real security but create the impression of deeper system authority.

---

## 6. Final Reality Map

### Safe to Call REAL NOW

| System | Why |
|---|---|
| Supabase Auth (email/password, Google OAuth) | Real auth flow, real sessions, real protected routes |
| Database schema (185 tables, 1,291 RLS) | Real Postgres tables with real policies |
| User profiles & onboarding | Real tables, real triggers, real queries |
| Connector OAuth (Google) | Real OAuth flow with token storage |
| File storage (upload/browse) | Real storage bucket, real upload/download |
| AI inference receipts | Written by real edge function on every AI call |
| Admin user management | Real edge functions managing real user data |
| GDPR export/delete | Real edge functions processing real user data |
| Role-based access control | Real `has_role()` security definer, real `user_roles` table |
| Seed data system | Real edge function creating real records |
| Cloud tenancy schema | Real tables for multi-tenant architecture |

### Should Only Be Called PARTIALLY REAL

| System | Why |
|---|---|
| AI Gateway | Edge function is real, but UI uses demo data |
| Boardroom | Tables are real, but UI uses demo data |
| Push notifications | Infrastructure exists, end-to-end delivery unverified |
| CRM | Tables are real, most pages use demo data |
| OS Commands | Commands are queued, but nothing executes them |
| Approvals | Tables exist, full lifecycle not wired |
| In-app notifications | Table and realtime exist, inconsistent generation |
| Connector sync | OAuth is real, data sync pipeline incomplete |
| Data services (28) | Real queries exist but many pages bypass them |

### Must Stop Being Described as Real

| System | What It Actually Is |
|---|---|
| Nova Kernel | Browser-hosted TypeScript simulation |
| OS Services (33 daemons) | Frontend abstractions with daemon-like naming |
| OS Security (17 modules) | Frontend abstractions, not real security services |
| Sync Engine | Conceptual frontend abstraction |
| Trust/Policy Engine | Frontend-only scoring, no backend enforcement |
| Event Bus | In-memory frontend EventEmitter |
| Mobile App | 25 responsive React pages |
| Electron Desktop | 6 scaffold files, no working build |
| Digital Twins | Demo data visualization |
| App Store | Demo data UI |
| Timeline/Activity | Demo data UI |
| 200+ service shims | Frontend abstractions, not backend services |
| Shell as "OS" | Web application UI, not an operating system |

---

## 7. Recommendations for Next Phase

1. **Wire the 28 real data services to their respective pages** — Replace `isDemoMode` demo data with real queries. This is the highest-ROI change.
2. **Consume existing edge functions from UI** — Many edge functions already work but aren't called.
3. **Remove or clearly namespace simulated code** — Move kernel/daemon/OS-security code to a `/simulation` directory to prevent confusion.
4. **Build a real device agent** — To make OS commands real, something must poll `agent_signals` and report back.
5. **Wire boardroom and AI workforce pages to real tables** — The schema exists, the UI exists, they just aren't connected.
6. **Decide on mobile strategy** — Either build a real Flutter/React Native app or stop describing mobile as a separate plane.
7. **Decide on Electron strategy** — Either build a real Electron app or remove the scaffold.

---

*End of audit. This document should be updated as systems are wired to real backend truth.*


> **Canonical framing**: SITA OS is an Ubuntu-native userland AI operating system. Where this document references "operating system" or "boot sequence", it refers to the userland AI operating environment running above the signed Ubuntu 24.04 LTS substrate (kernel 6.8+) with systemd boot orchestration. See `generated/claim-safety-hardening/CANONICAL_OS_LANGUAGE_GUIDE.md`.
