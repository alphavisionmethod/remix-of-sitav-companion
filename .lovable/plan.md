

# Self-Operating Admin Control Plane — Implementation Plan

## Current State Assessment

The admin OS already has **massive coverage** (~200+ admin pages). Here's what exists and what's missing:

### Already Implemented
| System | Existing Pages |
|--------|---------------|
| Mission Control Home | `MissionControlHome.tsx` — platform health, KPIs, quick links |
| AI Agent Workforce | AIT01-AIT08 — team overview, roles, invocations, cost, recommendations, approvals |
| Self-Healing | `AISelfHealing.tsx`, `AR03SelfHealingBoard.tsx` — rules, execution history |
| Incident Response | `IncidentCommandCenter.tsx` — severity, timeline, anomalies, mitigation |
| Release & Rollout | `ReleaseRingCommandBoard.tsx` — 3-ring model, blockers, evidence gates |
| Deployment Rings | `AdminDeploymentRings.tsx` — environments, promotion gates |
| Feature Flags | `CloudFeatureFlagsAdmin.tsx` — flag registry, scoping, kill switches |
| Operations Hub | `AdminOperationsHub.tsx` — services, queues, incidents, SLOs |
| Founder Council | `FounderCouncilBoard.tsx` — strategic proposals, votes, precedents |
| Policy Simulator | `PolicySimulator.tsx` — draft, simulate, approve policies |
| Audit & Governance | `AuditComplianceWorkspace.tsx`, `PolicyDecisionLedger.tsx`, `AdminMutationAudit.tsx` |
| Security | `SEC01SessionSecrets.tsx`, `SEC02SecurityFoundation.tsx`, `SecurityPostureBoard.tsx` |
| Knowledge Base | `BuilderKnowledgeBase.tsx` — archetypes, domain packs |
| Agent Boundaries | `AIHumanBoundaryControls.tsx` — agent scopes, autonomy levels |
| Observability | `SystemHealthDashboard.tsx`, `FleetHealthPage.tsx`, `AlertTriageBoard.tsx` |
| Engineering Board | `AIEngineeringBoard.tsx` — missions, fixes, self-healing, releases |

### What's Missing (implementation targets)

1. **Founder Command Interface** — No natural-language command console for issuing strategic directives ("Make sync reliable", "Reduce crash rate by 25%")
2. **AI Orchestrator / AI CTO Layer** — No command interpreter that decomposes founder directives into execution plans with task graphs
3. **Task Decomposition Engine** — No visual task graph showing objective → milestones → tasks with dependencies, risk, confidence
4. **Specialized Agent Classes** — Agent workforce exists but no typed specialization (Dev/QA/Ops/Security/Performance/Support/Product agents with distinct scopes)
5. **CI/CD Pipeline Orchestrator** — Deployment rings exist but no pipeline stage visualization (build → test → scan → sign → stage → canary → prod)
6. **Knowledge & Runbook System** — Builder KB exists but no runbook execution, incident pattern memory, or repair playbook library
7. **Program Management Board** — No objectives → milestones → task graph → blockers → owners view with cross-cutting progress
8. **Platform Cost & Capacity Board** — No unified cost/capacity/efficiency view across compute, AI, storage, bandwidth

---

## Implementation Plan — 4 Batches

### Batch 1: Database — 2 new tables + seeds

| Table | Purpose |
|-------|---------|
| `founder_directives` | Strategic commands from founder: intent text, status, decomposed plan, execution graph, outcome |
| `platform_runbooks` | Runbook library: trigger conditions, steps, agent assignments, execution history, auto-heal linkage |

RLS: authenticated + admin role check. Seeds: 6 sample directives, 8 runbooks.

### Batch 2: Core Service — 1 new service

**`src/lib/services/founder-orchestrator/index.ts`** (~350 lines)
- `parseDirective(text)` — Classify intent (reliability, performance, security, rollout, UX, cost)
- `decomposeToTaskGraph(directive)` — Generate structured task graph with dependencies
- `classifyAgentAssignment(task)` — Route to Dev/QA/Ops/Security/Performance/Support/Product agent class
- `getExecutionPlan(directiveId)` — Full plan with risk, confidence, blast radius per task
- `getDirectiveStatus(directiveId)` — Aggregated progress across all child tasks
- `getPlatformCostSnapshot()` — Unified cost/capacity view

### Batch 3: Admin UI Pages — 4 new pages

1. **`FCC01FounderCommandConsole.tsx`** — The crown jewel
   - Natural language input field with suggested commands
   - Directive history with status timeline
   - Active execution plans with live progress
   - "What should we do next?" AI recommendations
   - Approvals waiting on founder
   - Strategic risk summary

2. **`FCC02TaskDecompositionGraph.tsx`** — Execution plan viewer
   - Visual task tree: objective → milestones → tasks
   - Per-task: agent class, risk, confidence, status, dependencies
   - Blocker highlights and critical path indicators
   - Agent assignment badges (Dev/QA/Ops/Security icons)

3. **`FCC03CICDPipelineBoard.tsx`** — Pipeline orchestration
   - Pipeline stages: Code → Build → Test → Scan → Sign → Stage → Canary → Prod
   - Per-stage: status, duration, evidence, gate result
   - Active builds with live progression
   - Rollback controls and artifact signing status

4. **`FCC04RunbookCenter.tsx`** — Knowledge & repair playbooks
   - Runbook library with search and domain filtering
   - Execution history per runbook
   - Auto-heal linkage and incident pattern matching
   - "Launch runbook" with parameter inputs
   - Memory: past incidents, common repairs, architecture decisions

### Batch 4: Routing + Wiring

- Register all 4 pages in `AdminRoutes.tsx` under `/admin/founder/*`
- Add "Founder Control" section to admin command palette
- Wire `founder-orchestrator` service into `SitaOSContext.tsx`
- Add domain color for `/admin/founder` in sidebar

---

## File Summary

| Batch | Type | Count |
|-------|------|-------|
| 1 | Migration | 1 (2 tables + seeds) |
| 2 | Service | 1 new |
| 3 | Pages | 4 new |
| 4 | Wiring | ~4 file edits |

**Total: 1 migration, 1 service, 4 pages, 4 wiring updates**

All pages follow the existing glassmorphic dark-first admin design system with `PageTruthBanner`, `AdminPageHeader`, motion animations, and the established card/tab patterns visible across all 200+ existing admin pages.

