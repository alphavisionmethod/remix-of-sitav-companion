

# Autonomous Advisor Agents — Secure, Self-Operating AI Workforce

## What You Have Today

Your system already has strong foundations:
- **20 internal agents** with scheduled execution (agent-scheduler → agent-executor), AI-powered diagnostics, receipt chains, signal routing, and escalation
- **Brain-core** that routes user intents to domain advisors (money, business, concierge) and calls AI for recommendations
- **Rights model** (L0-L6 autonomy tiers) with promotion rules, demotion triggers, and never-allowed actions
- **Security infrastructure**: budget gates, rate limiting, auth, receipt hashing, telemetry logging

## What's Missing to Make Advisors Truly Autonomous

The current advisors are **request-response** — a user asks, brain-core responds. They don't proactively observe, decide, and act on their own like the internal agents do. Here's what we need:

---

## Plan

### 1. Create the Advisor Agent Runtime (Edge Function)

**New edge function: `advisor-agent-loop`**

Each domain advisor (money, business, concierge) becomes a persistent autonomous agent that:
- **Observes**: Periodically scans its domain tables (bills, invoices, leads, errands, calendar events)
- **Diagnoses**: Uses AI to identify issues (overdue bill, stale lead, missed errand)
- **Recommends/Acts**: Based on its autonomy level, either creates a recommendation record (L2) or executes a prepared action (L3+)
- **Self-limits**: Every action goes through budget check, policy check, and confidence threshold before execution

Each advisor gets a system prompt defining its personality, domain scope, and behavioral boundaries — like individual "Clawbots" specialized per domain.

### 2. Advisor Agent Registry Table (Migration)

New `advisor_agents` table storing per-user advisor configuration:

| Column | Purpose |
|--------|---------|
| user_id | Owner |
| advisor_id | e.g. `money-guardian`, `business-scout`, `concierge-pilot` |
| autonomy_level | 0-6 (starts at L2 — recommend only) |
| is_active | Kill switch |
| personality | Custom name/tone preferences |
| scope_config | What data areas this agent watches |
| confidence_threshold | Min confidence to act (default 0.8) |
| budget_daily_tokens | Token budget per day |
| last_observation_at | When it last scanned |
| last_action_at | When it last took action |
| escalation_target | Where to escalate (supervisor or human) |

### 3. Advisor Action Queue Table (Migration)

New `advisor_action_queue` table — the approval pipeline:

| Column | Purpose |
|--------|---------|
| action_id | UUID |
| advisor_id | Which advisor proposed this |
| user_id | Owner |
| action_type | `recommend`, `draft`, `execute` |
| domain | money/business/concierge |
| summary | Human-readable description |
| payload | The actual action data (JSON) |
| confidence | AI confidence score |
| status | `proposed` → `approved` → `executed` → `verified` / `rejected` |
| requires_approval | Boolean — based on autonomy level |
| approved_by | null until human/supervisor approves |
| receipt_hash | Proof chain link |
| rollback_payload | How to undo this action |

### 4. Security Enforcement Layer

Every advisor agent action passes through:

1. **Identity gate** — Agent acts only on behalf of authenticated user, never cross-tenant
2. **Scope gate** — Agent can only read/write tables declared in its `scope_config`
3. **Budget gate** — `checkAIBudget()` before every AI call; hard daily cap per advisor
4. **Policy gate** — Check against `NEVER_ALLOWED` and `MUST_REQUIRE_HUMAN_APPROVAL` lists
5. **Confidence gate** — Below threshold → observe only, no action
6. **Simulation gate** — Actions in `MUST_SIMULATE_FIRST` categories run as dry-run first
7. **Receipt chain** — Every observation, recommendation, and action produces a hash-linked receipt
8. **Rate limiting** — Max invocations per hour per advisor
9. **Kill switch** — `is_active = false` immediately stops all agent activity

### 5. The 6 Domain Advisor Agents

| Agent ID | Domain | Watches | Example Actions |
|----------|--------|---------|-----------------|
| `money-guardian` | Finance | Bills, receivables, cash flow, subscriptions | Flag overdue bills, detect waste, draft payment plan |
| `money-sentinel` | Finance | Transactions, anomalies, fraud patterns | Alert unusual spending, flag duplicate charges |
| `business-scout` | Business | Leads, pipeline, quotes, follow-ups | Nudge stale leads, draft follow-up emails, score pipeline |
| `business-strategist` | Business | Revenue, customer health, forecasts | Weekly revenue digest, churn risk alerts |
| `concierge-pilot` | Concierge | Errands, calendar, groceries, recurring tasks | Remind upcoming obligations, suggest grocery list, prep travel |
| `concierge-coordinator` | Concierge | Family calendar, school activities, events | Coordinate schedules, gift reminders, event prep |

### 6. Advisor Agent Dashboard (Admin UI)

New admin page `/admin/advisor-agents` showing:
- Per-advisor status cards (active/paused, autonomy level, last action, confidence average)
- Action queue with approve/reject buttons
- Token spend chart per advisor
- Autonomy level upgrade/downgrade controls
- Kill switch toggles
- Receipt chain viewer

### 7. User-Facing Notification Integration

When an advisor agent takes action or needs approval:
- Push notification via existing VAPID infrastructure
- In-app notification badge in the domain room header
- "What Changed" feed entry with advisor attribution

---

## Technical Details

### Edge Function Architecture

```text
advisor-agent-loop (edge function)
  ├── Auth check (JWT required)
  ├── Load advisor_agents config for user
  ├── For each active advisor:
  │   ├── Check schedule (is it time to observe?)
  │   ├── Gather domain data (scoped DB reads)
  │   ├── Budget gate check
  │   ├── AI analysis (domain-specific system prompt)
  │   ├── Confidence check
  │   ├── Policy check (NEVER_ALLOWED / MUST_SIMULATE)
  │   ├── If L0-L2: insert recommendation into action_queue
  │   ├── If L3+: simulate → insert for approval or auto-execute
  │   ├── Write receipt (hash-chained)
  │   ├── Emit signals to other agents if needed
  │   └── Record telemetry
  └── Return execution summary
```

### Invocation

The existing `agent-scheduler` will be extended to also schedule advisor agents alongside internal agents. The scheduler calls `advisor-agent-loop` on the configured interval (default: hourly for most, continuous for money-sentinel and concierge-pilot).

### Files Changed/Created

- **New edge function**: `supabase/functions/advisor-agent-loop/index.ts`
- **2 DB migrations**: `advisor_agents` table + `advisor_action_queue` table (with RLS)
- **New admin page**: `src/pages/admin/AdvisorAgentDashboard.tsx`
- **New components**: `AdvisorAgentCard.tsx`, `AdvisorActionQueue.tsx`, `AdvisorAutonomyControl.tsx`
- **Updated**: `agent-scheduler/index.ts` to include advisor agent scheduling
- **New hook**: `src/hooks/use-advisor-agents.ts` for frontend data fetching
- **Updated**: Domain room headers to show advisor notification badges

