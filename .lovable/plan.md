

# REAL_VS_SIMULATED.md — Full Project Audit Plan

## What This Produces

A single, brutally honest document (`docs/REAL_VS_SIMULATED.md`) classifying every major system in SITA OS as **Real Now**, **Partially Real**, or **Simulated/UI-Only**, based on evidence gathered from the actual codebase.

## Evidence Summary (from audit)

| Metric | Value |
|--------|-------|
| TypeScript/TSX files | 3,936 |
| Total lines of code | 207,763 |
| Real database tables | ~185 |
| RLS policies | ~1,291 |
| Edge functions | 77 |
| Edge functions with real DB logic | 53 |
| Realtime-enabled tables | 14 |
| Pages using demo/mock data | 304 |
| Pages with direct Supabase queries | 10 |
| Hooks with real DB queries | 7 |
| Data services with real DB queries | 28 |
| Admin pages | 292 |
| Mobile pages | 25 |
| Migrations | 135 |
| Storage buckets | 1 (user-files) |
| Nova kernel simulation files | 20+ |
| `src/lib/services/` subdirectories | 200+ |
| `src/lib/core-services/` subdirectories | 43 |
| `src/lib/os-services/` daemon files | 33 |
| `src/lib/os-security/` modules | 17 |

## Key Findings (to be documented)

### REAL NOW
- **Authentication**: Supabase Auth with email/password, session management, protected routes, demo user fallback, auto-seed on login. Google OAuth configured. Real `user_roles` table with `has_role()` security definer function.
- **Database schema**: 185 real tables with 1,291 RLS policies across 135 migrations. Tables cover CRM, cloud storage, AI workforce, connectors, OS commands, boardroom, notifications, onboarding, devices, ecosystem.
- **Edge functions (53 with DB access)**: `connector-oauth` (real Google OAuth flow), `os-command` (real command queue with audit), `ai-gateway`, `brain-core`, `push-dispatch`, `gdpr-export/delete`, `admin-api`, `intelligence-api`, `personal-brain`, `revenue-caller`, `seed-user-data`, `cloud-storage-api`, etc.
- **Connector system**: Real OAuth initiate/callback/disconnect with token storage, connector discovery, batch operations, health checks.
- **File storage**: Real `user-files` bucket, upload hooks, cloud file browser wired to storage API.
- **Push notifications**: Real VAPID keys configured, `push-dispatch` edge function, `push-track` for delivery tracking.
- **Profiles & onboarding**: Real `profiles` table with `handle_new_user()` trigger, onboarding session/step tables.
- **Realtime**: 14 tables with realtime subscriptions (notifications, commands, workflows, agents, etc.).
- **Admin operations**: `admin-users`, `admin-api`, `admin-gateway` edge functions with real user management.
- **CRM**: Real tables for contacts, companies, opportunities, pipelines, tags, segments, communications.
- **Cloud multi-tenancy**: Real tables for tenants, memberships, policies, quotas, plans, admin roles.

### PARTIALLY REAL
- **AI Gateway**: Edge function exists and calls real providers (OpenAI/Anthropic keys configured), but most pages consuming AI use demo data rather than live invocations. Budget gate exists as frontend abstraction.
- **Boardroom**: Real tables (sessions, items, evidence, recommendations, receipts) exist with RLS. UI exists. But most page data comes from demo/mock rather than live DB queries.
- **OS Commands**: Edge function queues commands to `agent_signals` table with audit logging. But no real device agent polls these commands — they're stored but not consumed by a real runtime.
- **Notifications**: Real `notifications` table, `push-dispatch` function, VAPID config. Delivery receipts table exists. But end-to-end push to a real browser service worker is only partially wired.
- **Approvals**: Real `ai_workforce_approval_queue` and approval tables exist. Some UI for approval flows. But full lifecycle (request → approve/deny → execute → receipt) is not end-to-end wired from most surfaces.
- **Receipts/Proof**: `boardroom_decision_receipts`, `ai_inference_receipts`, `notification_delivery_receipts` tables exist. Receipt service exists in core-services. But proof center page uses mostly demo data.
- **Connector orchestration**: OAuth is real, but sync/transform/batch operations are edge functions that exist but aren't fully consumed by UI in production mode.
- **Data services (28 with real queries)**: These query real tables but many pages bypass them and use demo data directly.

### SIMULATED / UI-ONLY
- **Nova Kernel**: 20+ files simulating scheduler, memory manager, process manager, syscalls, crash resilience, power management, transactional filesystem. Pure browser-hosted simulation with no real OS artifact.
- **OS Services (33 daemons)**: `healthd`, `powerd`, `crashd`, `audiod`, `wifid`, `btd`, etc. — TypeScript files simulating Unix-style daemons. No real system service exists.
- **OS Security (17 modules)**: `authd`, `policyd`, `sessiond`, `secretsd`, `auditd` — frontend abstractions named like system services. No real OS security runtime.
- **Shell/Desktop**: Window manager, dock, status bar, compositor, app shells — browser simulation of a desktop OS. Functional in-browser but not a real OS.
- **304 pages using demo/mock data**: The vast majority of pages (304 out of ~400+) consume demo or mock data rather than real DB queries.
- **200+ service shims in `src/lib/services/`**: Most are frontend TypeScript abstractions that re-export core-services or contain local-only logic. Not real backend services.
- **Digital Twins / Life Simulator / Scenario Lab**: Pure UI concept pages with demo data.
- **Mobile**: 25 responsive React pages, not a real mobile app (no Flutter/native code exists despite architecture docs describing Flutter).
- **Electron**: Scaffold exists (6 files) but not production-active. Auto-updater, crash reporter present but no evidence of real Electron builds shipping.
- **Simulation engines**: Frontend-only calculations, no persistent simulation infrastructure.
- **Most admin pages (292)**: Vast majority are architecture/concept dashboards backed by demo data, not operational views of real backend state.
- **Event bus**: Frontend-only `EventEmitter` pattern, not a real message broker or Supabase realtime event pipeline.
- **Sync engine**: Frontend abstractions describing sync concepts. No real offline-first sync mechanism.
- **Trust/Policy engine**: TypeScript abstractions and UI dashboards. No real trust evaluation running on backend.

## Document Structure

```
docs/REAL_VS_SIMULATED.md

1. Executive Summary
2. Classification Method  
3. High-Level Classification Table (20 categories)
4. Detailed Audit By Category (20 sections, each with:
   - Classification
   - Evidence
   - What appears real
   - What appears partial
   - What appears simulated
   - What is missing)
5. Cross-Cutting Findings
6. Final Reality Map
```

## Implementation

Single file creation: `docs/REAL_VS_SIMULATED.md` (~2,000 lines of precise, evidence-based audit documentation).

No code changes. No migrations. Pure documentation artifact.

