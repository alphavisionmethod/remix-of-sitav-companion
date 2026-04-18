# Admin AI Runtime — Closure Spec

**Scope**: `/admin/ai-runtime` hub. Production-grade.

## Wired
- `InternalAgentsBoard` and `CouncilsBoard` mounted as canonical hub modules in `AIRuntimeHome.tsx`.
- `AIRuntimeDrilldownPanel` (Actions / Budget / Health) mounted in the agent drawer — replaces the inline "recent actions" list.
- `NightlyProofBadge` shown in the board header; reads real `/generated/os-release-readiness-report.json` (verdict + timestamp or "never run").

## Real data sources
| Tab | Tables |
|---|---|
| Actions | `internal_agent_actions` ⨝ `ai_workforce_invocations` (cost/tokens/model) |
| Budget  | `ai_usage_ledger` (24h) + `ai_workforce_budget_classes` (active class) |
| Health  | `ai_fallback_events` + `ai_provider_health` snapshot |

## Drilldown deep-links
- Actions row → `/admin/ai-gateway/receipts?invocation=:id` (existing route, no new routes)
- Reauth chip → `/admin/integrations/oauth-refresh-health`

## Validators (BLOCK)
- `check-admin-ai-runtime-drilldowns` — asserts panel + nightly proof badge mounted; data loader queries all 6 canonical tables.
- 6 internal-agent gates (registry, runtime-coverage, admin-pages, escalation-runtime, seed-integrity, runtime-loop).

## No duplicates
Single fetch surface = `lib/internal-agents/runtime/agent-drilldown-data.ts`. Reused by board, councils, and team overview.
