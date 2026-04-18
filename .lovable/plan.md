
# Plan — `AI ADMIN ADVISORS.MD` (Comprehensive Status + Roadmap to 100% Auto-Maintenance)

Build one downloadable document at `/mnt/documents/AI ADMIN ADVISORS.MD` (~80–100 KB) that maps **exactly what exists today** for the AI engineering / development / security workforce that maintains SITA OS, **how they're wired**, **what's missing**, and **the sequenced build plan** to reach 100% automatic OS self-maintenance.

## What the document will cover

### Part 1 — Today's Reality (Evidence-Based Inventory)

**1.1 Two parallel AI-staff systems discovered:**
- **System A — Internal AI Workforce (design)**: 6 councils, 7 supervisors, 40-agent spec — but only 6 council definition files in `src/lib/internal-agents/agents/` (one per council, not one per agent). Status: 🟠 SPEC + PARTIAL CODE, no runtime execution loop, no admin UI.
- **System B — AI Workforce Runtime (operational)**: `ai_workforce_*` tables (12 tables), `admin-ai-workforce-run` edge function, `/admin/ai-team/*` routes (8 pages), `useAIWorkforce*` hooks (6). Status: 🟢 WIRED for invocations + recommendations + approvals; 🟡 PARTIAL for self-driven execution.

**1.2 Engineering / Developer / Security Roles defined per council** (with file paths, missions, autonomy levels, escalation chains):
- Product & Build: PM, UX Research, Design System, Frontend Eng, Backend Eng, Mobile Eng, Documentation, QA Architect (8)
- Reliability & Ops: Incident Response, Workflow Recovery, Connector Health, Fleet Health, SRE, Release Safety, Replay Operator, Capacity Planner (8)
- Security & Trust: Security Monitor, Permission Drift, Policy Review, Trust Threshold, Fraud Abuse, Audit Completeness, Privacy Boundary (7)
- Runtime & Cost: Cost Sentinel, Model Routing, Latency Watcher, Token Budget, Capacity Forecaster, Provider Failover (6)
- Architecture & Governance: Invariant Enforcer, Registry Truth, Contract Integrity, Boundary Enforcer, Change Control, Drift Detector (6)
- Knowledge & Coordination: Knowledge Curator, Release Notes, Sprint Planner, TPM, Cross-Team Drift (5)

**1.3 Self-Healing / Error-Correction surface today:**
- `src/lib/core-services/self-healing/` (service.ts, immune-controller.ts, fleet-health.ts, incident-bridge.ts, types.ts)
- `src/lib/core-services/error-patrol/` (continuous error scanning)
- Edge functions: `self-healing`, `workflow-repair`, `workflow-replay`, `workflow-stuck-detector`, `secret-rotation-orchestrator`, `error-ingest`, `health-cron`, `agent-scheduler`, `agent-executor`
- DB: `incidents`, `command_steps`, `device_attestations`, `runtime_agents`, `kill_switch_audit_log`, `kill_switch_approvals`
- Admin surfaces: `/admin/ai-runtime` hub (9 modules), `/admin/ai-team/*` (8 pages), `/admin/health/*` (incl. recovery), Backend Topology Dashboard, NoSilentFailureAlerts

**1.4 Admin AI Hub map (what's live today)** — table per page: route, what it does, data source, status (🟢/🟡/⚪).

**1.5 Wiring diagram (text):** observation → council agent → supervisor → escalation → approval queue → executor → receipt → reflection.

### Part 2 — Capability Coverage Matrix (what AI staff can/cannot do today)

For each capability, status + evidence + gap:
- ✅ Continuous error scanning (error-patrol service exists, no admin UI for triage)
- ✅ Incident detection + auto-healing trigger (self-healing service + incident-bridge)
- ✅ Workflow repair / replay / stuck detection (3 edge functions)
- ✅ Secret rotation orchestration (edge function)
- ✅ Cost monitoring + budget alerts (`ai_usage_ledger`, cost-alert function)
- ✅ Recommendation generation + approval queue + scoring (ai_workforce_recommendations + scores)
- 🟡 Security monitoring (security-trust agent defined, no runtime loop wired)
- 🟡 Permission drift detection (defined, no scheduled job)
- 🟡 Policy review (defined, no execution surface)
- ⚪ Suggestions of new implementations (no canonical generator)
- ⚪ Auto-applying low-risk fixes with rollback (only manual approve+execute today)
- ⚪ Self-learning loop (reflections exist for advisors, not for internal agents)
- ⚪ Updates / dependency upgrade proposals (no agent)
- ⚪ Adding security (only detection; no auto-policy-write)
- ⚪ Cross-council escalation engine (Chief of Staff supervisor defined, not runtime)

### Part 3 — Gap Register (Critical / High / Medium)

P0/P1 gaps with owner, evidence, fix sequence, ETA.

### Part 4 — 4-Phase Build Plan to "Put Them to Work" (100% Auto-Maintenance)

- **Phase 1 — Wire Internal Agents to Runtime (2 sprints)**: tables `internal_agent_definitions`, `internal_agent_runtime_state`, `internal_agent_actions`, `council_escalations`, `supervisor_decisions`. Edge function `internal-agent-loop` (cron-driven). Admin UI: `/admin/ai-runtime/internal-agents`.
- **Phase 2 — Self-Healing & Error Correction Loop (1 sprint)**: bind `error-patrol` → council `aw-incident-response` → auto-action gate (R1/R2 auto, R3+ approval). Pattern detection feeds suggestions.
- **Phase 3 — Self-Learning, Updates, Suggestions (2 sprints)**: `internal_agent_reflections` table, weekly digest agent, "implementation suggestions" board fed by drift detectors + KPI gaps. Approval-gated proposals create branch-equivalent draft work items.
- **Phase 4 — Security Auto-Add & Policy Hardening (1 sprint)**: security-monitor + permission-drift + policy-review wired to auto-create RLS suggestions, secret rotation tickets, kill-switch arming proposals. Dual-admin approval for KS-* class.

### Part 5 — Required New Tables / Edge Functions / Pages (concrete bill of materials)

- 6 new DB tables, 3 new edge functions, 4 new admin pages, 2 new cron schedules, 1 new constitution doc.

### Part 6 — Operating Model

- Daily, weekly, on-incident workflows
- Human-in-the-loop autonomy ladder (L0–L6)
- 9-gate Sovereign AI Gateway compliance (already enforced)
- Failure modes + kill-switches (KS-AI-WORKFORCE)

### Part 7 — Risk & Honesty

- What we can claim today vs. what is future
- Demo vs. real separation
- Evidence confidence per claim

### Part 8 — Final Verdict & Single-Sprint Highest-Leverage Move

One paragraph telling the operator what to build first.

## Output

- **File**: `/mnt/documents/AI ADMIN ADVISORS.MD` (markdown, ~80–100 KB)
- **Downloadable** via `<lov-artifact>` tag
- **No code changes** — pure planning/inventory document
- Single file, no companions

## Out of scope

- Implementing the new tables / edge functions (this doc is the plan)
- Modifying existing AI runtime code
- Touching the 5 canonical flagship loops

