

## Re-Audit: Checklist 14 — AI / Advisor Reality (Disk Truth)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Advisor registry exists | ⚠️ **fake** | `generated/advisor-registry.json` has `total: 1` and a single placeholder `{name:"ADVISOR_CONFIGS"}`. Generator just regex-greps `export const`. Real `registry.ts` (429 LOC) is never parsed. No DB table. |
| 2 | Prompt versions tracked | ❌ | No `ai_prompt_families` / `ai_prompts` / `prompt_versions` table. Inline prompt strings. Constraint #9 of sovereign-ai-gateway memory is **violated**. |
| 3 | Model routing explicit | ❌ | `routing.service.ts` queries `ai_routing_policies` + `ai_capability_routing` — **neither table exists**. `ai-gateway/index.ts` line 152 also queries the missing table → silent fallback. |
| 4 | AI provider health visible | ❌ | `provider-registry.service.ts` queries `ai_provider_registry`, `ai_model_registry`, `ai_provider_health` — **none exist**. `AIG01ProviderRegistry`, `AIG02ModelRegistry` render empty tables. |
| 5 | Cost/budget controls | ✅ | `ai_workforce_budget_classes` + `ai_workforce_invocations` exist + `budget.service.ts` wired. |
| 6 | Recommendation quality inspectable | ✅ | `ai_workforce_recommendations` + `_scores` + `AdvisorRecommendationMonitor` wired to BoardAPI. |
| 7 | AI runtime failures triageable | ✅ | `ai_workforce_role_health` + `error_events` + Phase 20 alerts. |
| 8 | Advisor actions go through policy/approval/proof | ✅ | `ai_workforce_approval_queue` + `ai_inference_receipts` + `advisor_action_queue`. |
| 9 | Memory bounded + persisted | ✅ | `advisor_memories`, `advisor_board_memory`, `AdvisorMemoryInspector` wired. |
| 10 | Hallucination/truth protections + tested | ✅ | 6 test files, **61/61 passing** (grounding, contradiction, staleness, refusal, confidence, truth-boundaries) + epistemic firewall services. |
| 11 | Simulated features marked | ⚠️ partial | `ai_workforce_launch_honesty` table exists; `launch-honesty.service.ts` exists; needs UI surfacing on advisor cards. |

**Verdict: 4 hard failures (1, 2, 3, 4), 1 partial (11). Currently 6/11 truthful.**

---

## Phase 21 — AI/Advisor Reality Closure

### 21.A — Real DB-backed AI registries (fixes 2, 3, 4)
**DB migration** — create the 5 missing tables that `provider-registry.service.ts` + `routing.service.ts` + gateway already reference:
- `ai_provider_registry` (provider_key PK, display_name, base_url, auth_kind, is_active, region, sla_tier, deprecated_at)
- `ai_model_registry` (model_id PK, provider FK→ai_provider_registry, model_class, quality_tier, cost_tier, latency_tier, context_length, tool_calling_support, structured_output_support, recommended_use_cases jsonb, deprecated bool, max_tokens_in/out, cost_per_1k_in/out)
- `ai_provider_health` (provider FK, status, last_probed_at, latency_ms_p50/p95, error_rate_pct, success_count, failure_count, window_start, window_end)
- `ai_routing_policies` (id, capability_id, primary_model, fallback_models text[], risk_tier, max_cost_cents, enabled, rationale)
- `ai_capability_routing` (capability_key PK, primary_model, fallback_chain jsonb, task_class, risk_tier, budget_class, is_active)
- `ai_prompt_families` (family_id PK, owner_domain, current_version_id, description, capability_keys text[]) + `ai_prompt_versions` (id PK, family_id FK, version semver, system_prompt, template, variables jsonb, status: draft|active|deprecated, created_by, activated_at, hash) + `ai_prompt_invocations` (invocation_id, family_id, version_id, capability_key, advisor_id, user_id, ts)
- All admin-RW + service-role-write RLS, indexed on (provider, model_id, capability_key, family_id).

**Seed data** — populate `ai_provider_registry` (lovable-ai, openai, google, anthropic), `ai_model_registry` (the 11 models from constraints), `ai_capability_routing` (one row per capability used by gateway), `ai_prompt_families` (one per `prompts.yaml` entry from registry).

### 21.B — Real advisor registry generator (fixes 1)
- **REWRITE** `scripts/manifests/generate/generate-advisor-registry.ts` — actually parse `src/packages/advisor-config/registry.ts` AST to extract every advisor entry (id, name, domain, system prompt, tools, autonomy level, model preference, escalation threshold). Emit `total: <real>`, `advisors: [{id, name, domain, capabilities, defaultModel, promptFamilyId, autonomyLevel, riskTier, ...}]`.
- **NEW DB** `advisor_registry` table mirroring the JSON; populated by a `seed-advisor-registry` edge fn run once at deploy from the generated JSON. Admin page `AdvisorBoardCatalog` switches to query this table.
- **EDIT** `scripts/architecture/checks/check-advisor-registry.ts` — assert `total >= 6` (the 6 real domain advisors), assert each entry has `promptFamilyId` resolving in `ai_prompt_families`, assert `defaultModel` resolves in `ai_model_registry`.

### 21.C — Wire prompts through registry (fixes 2, real)
- **EDIT** `supabase/functions/ai-gateway/index.ts` — accept `promptFamilyId` in request, resolve `ai_prompt_versions` where `status='active'`, log `prompt_version_id` into `ai_workforce_invocations` and `ai_inference_receipts`. Reject calls with raw `system` strings unless `allowAdHoc:true` (R0/R1 only).
- **EDIT** `src/lib/services/ai-gateway/invoke.ts` — `invokeAICapability({ capabilityKey, promptFamilyId, vars })` — block inline prompts at type level for R3+.
- **NEW** admin page `/admin/ai/prompts` — `AIPromptFamiliesExplorer.tsx`: list families, current version, diff between versions, activate/rollback (writes new version row with `status='active'` + sets prior to `deprecated`).
- **NEW** edge fn `prompt-versioning` — actions: `create-version`, `activate-version`, `rollback`, `compute-hash`. Hash = sha256(system + template). Persists to `ai_prompt_versions`.

### 21.D — Real provider health probes (fixes 4)
- **EDIT** `supabase/functions/ai-health/index.ts` — for each row in `ai_provider_registry`, run a 1-token ping; write `ai_provider_health` with latency + status + window. Already raises Phase 20 alerts on failure burst.
- **DB cron** — `cron.schedule('sita-ai-health-2m', '*/2 * * * *', ai-health)` joining the existing health-cron family.
- **EDIT** `AIG01ProviderRegistry.tsx` — already wired to the now-existing tables. Add live status pill from `ai_provider_health.status`.

### 21.E — Routing matrix proof (fixes 3)
- **EDIT** `AIG03RoutingMatrix.tsx` — query both `ai_routing_policies` and `ai_capability_routing`; show: capability → primary model → fallback chain → budget cap → R-tier; allow admin to edit primary/fallback (writes via `routing-policy-update` edge fn with proof receipt).
- **NEW** edge fn `routing-policy-update` — admin-gated, writes routing row + emits `proof_records` entry.
- **CI Gate 32** verifies every `capability_key` referenced in code exists in `ai_capability_routing`.

### 21.F — Launch honesty markers (fixes 11)
- **EDIT** `AdvisorBoardCatalog.tsx`, `AdvisorAgentDashboard.tsx` — render badge from `ai_workforce_launch_honesty.actual_status` (e.g. "Simulated", "Beta", "Production"); pull via `getLaunchHonesty(role_key)`.
- **EDIT** `launch-honesty.service.ts` — already exists; surface in cards.
- **CI Gate 32** also asserts every advisor in `advisor_registry` has a `launch_honesty` row.

### 21.G — CI Gate 32 + report
- **NEW** `scripts/architecture/checks/check-ai-advisor-reality.ts` (Gate 32):
  - Assert all 8 new tables exist + RLS on
  - Assert `advisor_registry.count >= 6`
  - Assert ≥1 `ai_prompt_versions.status='active'` per family
  - Assert `ai_provider_health` has rows < 10min old (cron live)
  - Assert no `invokeAICapability` call site uses raw `system:` string for R3+ capabilities
  - Emit `generated/ai-advisor-reality-report.json`
- **EDIT** `src/lib/ci/ci-gate-registry.ts` + `generated/ci-umbrella-manifest.json` → `gateCount: 32`
- **EDIT** `src/lib/db/non-edge-table-io-sources.ts` — register the 8 new tables.

---

### Files

| Layer | Change |
|---|---|
| DB migration | 8 new tables + RLS + indexes + cron schedule |
| Seed | provider/model/capability/prompt-family seed SQL |
| `scripts/manifests/generate/generate-advisor-registry.ts` | Real AST parse of registry.ts |
| `supabase/functions/ai-gateway/index.ts` | promptFamilyId resolution + receipt logging |
| `supabase/functions/ai-health/index.ts` | Real provider probes → ai_provider_health |
| `supabase/functions/prompt-versioning/index.ts` | NEW — version CRUD + activate/rollback |
| `supabase/functions/routing-policy-update/index.ts` | NEW — admin routing edits with proof |
| `supabase/functions/seed-advisor-registry/index.ts` | NEW — one-shot DB sync from JSON |
| `src/lib/services/ai-gateway/invoke.ts` | Block raw prompts for R3+ |
| `src/pages/admin/AIPromptFamiliesExplorer.tsx` | NEW |
| `src/pages/admin/AIG01ProviderRegistry.tsx` | Live health pill |
| `src/pages/admin/AIG03RoutingMatrix.tsx` | Editable routing |
| `src/pages/admin/AdvisorBoardCatalog.tsx` | Launch honesty badge |
| `scripts/architecture/checks/check-ai-advisor-reality.ts` | NEW Gate 32 |
| `src/lib/ci/ci-gate-registry.ts`, `generated/ci-umbrella-manifest.json` | gateCount 32 |
| `generated/ai-advisor-reality-report.json` | NEW |

### Acceptance

- All 8 new tables exist with RLS; `ai_provider_registry` has ≥4 rows, `ai_model_registry` ≥11, `ai_capability_routing` ≥6, `ai_prompt_families` ≥6
- `AIG01/AIG02/AIG03` admin pages render real rows (no longer empty)
- `generated/advisor-registry.json` `total >= 6` with full per-advisor metadata
- `cron.job` contains `sita-ai-health-2m`; `ai_provider_health` accrues rows
- `invokeAICapability("any-r3-capability", {system:"..."})` is **rejected** at compile-time and runtime
- `AdvisorBoardCatalog` shows "Simulated"/"Beta"/"Production" pills sourced from `ai_workforce_launch_honesty`
- CI Gate 32 green; CI Umbrella `gateCount: 32`; `ai-advisor-reality-report.json` `ok:true`
- Checklist 14 truthfully **11/11**

