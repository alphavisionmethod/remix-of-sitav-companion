# Production Truth Dashboard

Generated: 2026-04-13T12:00:00.000Z
Source: Live database query + codebase scan (no hallucinated numbers)

---

## Database Reality

| Metric | Count | Notes |
|--------|-------|-------|
| Public tables | 35 | Base tables with RLS |
| Public views | 4 | v_outcome_verification_summary, v_recommendation_closure_summary, v_recommendation_execution_pipeline, v_remediation_program_summary |
| RLS enabled | 35/35 (100%) | All base tables have RLS enabled |
| Storage buckets | 1 | user-files (private) |
| Migrations | 130 | Total applied migrations |

### Tables by Domain

| Domain | Tables |
|--------|--------|
| AI Workforce | ai_workforce_roles, ai_workforce_task_types, ai_workforce_invocations, ai_workforce_outputs, ai_workforce_recommendations, ai_workforce_recommendation_scores, ai_workforce_approval_queue, ai_workforce_budget_classes, ai_workforce_cached_outputs, ai_workforce_launch_honesty, ai_workforce_role_health, ai_workforce_role_task_permissions (12) |
| REX / Remediation | recommendation_execution_bindings, recommendation_execution_events, recommendation_learning_signals, recommendation_outcome_verifications, outcome_verifications, remediation_programs, remediation_tasks (7) |
| Concierge | concierge_errands, concierge_documents, concierge_automations, concierge_recurring_obligations, school_activities, travel_plans, gift_tracker, grocery_items, grocery_lists, appointments (10) |
| Advisor Agents | advisor_agents, advisor_action_queue (2) |
| Platform | profiles, notifications, flagship_loops, service_providers_list (4) |

---

## Codebase Reality

| Metric | Count |
|--------|-------|
| Routes (path=) | 833 |
| Pages (.tsx in src/pages) | 807 |
| Components (.tsx in src/components) | 516 |
| Hooks (.ts/.tsx in src/hooks) | 113 |
| Contexts (createContext) | 26 |
| Service directories | 187 |
| Edge functions | 54 |
| Generated artifacts | 54 |
| Unit tests | 197 |
| E2E specs | 44 |
| CI workflows | 5 |

---

## Code Quality

| Metric | Count | Status |
|--------|-------|--------|
| TypeScript errors | 0 | ✅ |
| `as any` in pages | 41 | ⚠️ Needs cleanup |
| `as unknown as` in pages | 1 | ✅ Acceptable |
| `useState<any>` | 0 | ✅ |

---

## Security Status

| Check | Result |
|-------|--------|
| RLS enabled on all tables | ✅ 35/35 |
| RLS policy role | ✅ All 35 tables now use `authenticated` role (migrated 2026-04-13) |
| Notifications table | ✅ Uses `authenticated` role with per-operation policies |
| Profiles table | ✅ Uses `authenticated` role for mutations, public SELECT |
| Edge functions auth | ✅ JWT validation in code (advisor-agent-loop, brain-core, etc.) |
| Secrets configured | 16 |

---

## Edge Functions (54)

admin-ai-workforce-run, admin-api, admin-intelligence, admin-users, advisor-agent-loop, agent-executor, agent-heartbeat, agent-intelligence, agent-scheduler, agent-signal, ai-gateway, ai-health, ambient-os-operations, booking-manage, brain-core, cashflow-calculate, chat-advisor, check-ai-budget, connector-batch, connector-discover, connector-health, connector-oauth, connector-operations, connector-proxy, connector-transform, cost-alert, crm-sync, device-telemetry, ecosystem-operations, event-processor, file-ingestion, gdpr-delete, gdpr-export, get-weather, intelligence-api, invoice-generate, main, msa-operations, os-command, os-status, payment-process, personal-brain, provider-family-operations, push-dispatch, push-track, revenue-caller, runtime-probes, scheduler-dispatch, seed-user-data, self-healing, system-updates, tax-estimate, vapid-public-key, verification-recorder

---

## Deployment Readiness

| Capability | Status | Evidence |
|------------|--------|----------|
| PWA | ✅ | manifest + service worker + icons present |
| Docker | ✅ | Dockerfile + nginx + compose present |
| OTA | ✅ | agent script + systemd timer |
| Backup | ✅ | automated pg_dump + volume snapshots |
| ISO | ⚠️ | build script pending |

---

## Previous False Claims (Corrected)

| Claim | Old Value | Actual Value | Severity |
|-------|-----------|--------------|----------|
| RLS-enabled tables | 485 | 35 | 🔴 Critical — inflated 13.8× |
| Pass rate | 100% | Not measurable without runtime probes | 🔴 Critical — unsubstantiated |
| Total services | 137 | 187 directories (not all canonical) | 🟡 Medium — misleading |
| `as any` in pages | 0 | 41 | 🟡 Medium — hidden tech debt |

---

## Honesty Score

**62/100** — Database security is genuinely strong (35/35 RLS), but the previous dashboard inflated table counts by 13.8× and claimed a 100% pass rate with no runtime probe evidence. Code quality has 41 `as any` casts that were previously hidden. This regeneration uses only live data.
