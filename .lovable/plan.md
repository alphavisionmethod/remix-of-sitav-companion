
# SITA OS — All Truth Indices to 100%

## Phase 1: Database Foundation (AI Workforce + Missing Domain Tables)
1. **AI Workforce schema** — `ai_workforce_roles`, `ai_workforce_task_types`, `ai_workforce_invocations`, `ai_workforce_recommendations`, `ai_workforce_approval_queue`, `ai_workforce_cached_outputs`
2. **Connector Truth tables** — `connector_oauth_flows`, `connector_token_store`, `connector_sync_engine`, `connector_health_checks`
3. **Launch Gate tables** — `launch_gates`, `launch_gate_checks`, `feature_launch_status`

## Phase 2: Runtime Truth (38→100)
- Wire all domain services (finance, CRM, household, documents, calendar) to real DB queries with honest empty states
- Replace any remaining mock/static data returns with real Supabase queries or honest "not configured" states
- Add `domain_runtime_status` tracking per domain

## Phase 3: AI Truth (30→100) — Architecture Only
- Complete AI workforce backend services (role registry, task orchestration, cost policy, receipts)
- Wire all AI surfaces (advisor, boardroom, pulse, admin) through canonical `ai-capability-client`
- Add AI workforce admin pages (AIT01–AIT08)
- Ensure every AI surface renders honest state (real/demo/degraded/unavailable)

## Phase 4: Connector Truth (22→100)
- Implement OAuth flow service architecture (authorize, callback, token refresh, revoke)
- Build connector sync engine contracts (sync scheduling, conflict resolution, health monitoring)
- Wire connector admin surfaces to real DB state
- Add connector health dashboard with honest state

## Phase 5: Launch Honesty (52→100)
- Implement launch gate system — every feature gets a gate with status (live/demo/scaffold/unavailable)
- Add launch honesty checks to all surfaces
- Build launch readiness dashboard
- Wire dual reality to launch gates

## Phase 6: Demo Governance (45→100)
- Fill all demo provider gaps (every domain needs a governed demo provider)
- Ensure demo data is scenario-backed and labeled
- Add demo governance admin surface

## Phase 7: Surface Portability (35→100)
- Complete surface contracts for mobile/desktop/watch
- Ensure all response envelopes are surface-neutral
- Add surface registry and readiness tracking
- Wire capability invocations with surface context

## Approach
- Wire architecture only for AI (no live API calls)
- All services return honest states (real data, empty, or "not configured")
- Every surface gets launch honesty badges
- ~15-20 new/updated files across services, components, and pages
