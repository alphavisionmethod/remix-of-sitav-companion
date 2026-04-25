# Phase 7 — Production Hardening, Owner Copilots, Multi-Tenant Federation
**Closure audit · L3 hard ceiling on tenant-facing actions**

## Scope delivered
1. **7A — Production hardening + observability**
   - Tables: `internal_agent_slo_snapshots`, `internal_agent_anomaly_signals`, `internal_agent_drift_findings`, `internal_agent_canary_runs`
   - Edge function: `internal-agent-slo-evaluator` (computes p50/p95 latency, success rate, escalation rate, raises anomalies on breach)
   - Admin surface: `/admin/ai-runtime/observatory` (`SLOObservabilityBoard.tsx`)

2. **7B — Owner-facing copilot BFF**
   - Tables: `owner_copilot_briefings`, `owner_copilot_handoffs`
   - SECURITY DEFINER RPC: `record_owner_copilot_handoff` (only the briefing owner can record, validates `auth.uid()` matches tenant owner)
   - Edge function: `owner-copilot-bff` (read-only `list` + `handoff` ops, never writes directly to handoff/briefing tables)
   - Admin surface: `/admin/ai-runtime/owner-copilot` (`OwnerCopilotBriefings.tsx`)

3. **7C — Multi-tenant federation**
   - Tables: `internal_agent_tenant_scopes` (per-tenant agent enable + trust rung), `internal_agent_tenant_quotas` (daily/weekly cents + actions/hour), `internal_agent_tenant_kill_switches` (20-char justification CHECK + admin-only writes)
   - SECURITY DEFINER RPC: `clamp_tenant_action_autonomy` — `LEAST(GREATEST(COALESCE(p_requested_level,0),0),3)`
   - Edge function: `internal-agent-tenant-federation` (set_scope, set_quota, toggle_kill_switch — all server-side clamp)
   - Admin surface: `/admin/ai-runtime/tenant-federation` (`TenantFederationBoard.tsx`)

## Safety invariants (enforced by 6 BLOCK validators)
| Gate | What it asserts |
|------|----------------|
| `internal-agent-phase7-tables` | All 9 phase-7 tables exist with RLS enabled |
| `tenant-l3-ceiling` | `clamp_tenant_action_autonomy` exists, caps at 3, BFF calls it on every scope write |
| `owner-copilot-bff-readonly` | BFF performs no direct writes to copilot tables — only via `record_owner_copilot_handoff` |
| `tenant-kill-switch-justification` | DB CHECK enforces ≥20-char justification, BFF mirrors the rule |
| `slo-evaluator-function` | Evaluator writes snapshots, raises anomalies, computes p95 |
| `phase7-admin-pages` | All 3 admin pages exist and are routed |

## Release-readiness wiring
- `package.json` → `phase7:run-all` script added
- `release:readiness:full` chain now includes `phase7:run-all`
- `check-os-release-readiness.ts` aggregator extended with **6 new BLOCK gates** (total master gate count: **140+**, all phases combined)

## Autonomy ceiling
- Tenant-facing actions are **hard-clamped to L3** (consistent with Phase 6 cross-council ceiling), enforced at the database layer via `clamp_tenant_action_autonomy` and at the schema layer via `CHECK (trust_rung BETWEEN 0 AND 3)`.

## Status
- 6 / 6 Phase 7 BLOCK validators GREEN
- 0 errors, 0 warnings on the 6 phase-7 reports in `generated/`
- Migration applied; types regenerated; routes mounted; edge functions deployed
