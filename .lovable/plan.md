

# Phase E — Sita Agentic Execution (Full Autonomy across Business, Finance, Concierge)

Goal: Turn Sita from a voice/HUD assistant into a **fully autonomous operator** that can plan, execute, and verify multi-step work across the Business, Finance, and Concierge domains — safely, transparently, and reversibly.

## What you'll get

1. **Sita Agent Core** — a planner-executor loop that turns any voice/text intent into a typed Action Plan, runs it through the canonical 12-stage kernel pipeline, and reports results back via the HUD + voice.
2. **Domain Skill Packs** — curated capability sets per domain so Sita knows *exactly* what she's allowed to do:
   - **Business**: create/update tasks, draft proposals, schedule meetings, generate reports, manage contacts, trigger workflows.
   - **Finance**: create bills/invoices, run cash-flow projections, categorize transactions, simulate scenarios, prepare payments (approval-gated).
   - **Concierge**: book/reschedule, create reminders, manage travel & lifestyle requests, coordinate with external connectors.
3. **Action Plan UI** — a glassy "Sita is about to do X" confirmation card with step list, risk badge, reversibility, and one-tap Approve / Modify / Cancel.
4. **Autonomy Tiers (L0–L4)** — per-domain ceiling slider in Control Center. L0 = ask every step, L4 = fully autonomous within policy. Defaults respect the existing AI Autonomy Ceiling Policy.
5. **Continuous Memory & Learning** — every plan + outcome is written to `ai_action_receipts` and the Personal Brain memory so Sita gets better over time.
6. **Proactive Autonomy** — Phase D nudges can now offer "Do it for me" that runs the full plan automatically (within tier).

## User experience

- Say *"Sita, send the Q2 invoices and chase overdue ones"* → HUD shows Action Plan: `1. Generate 14 invoices · 2. Send via email · 3. Flag 3 overdue for follow-up`. Approve once → all three execute, receipts logged, voice confirms.
- Say *"Plan my Friday"* → Sita reads calendar, traffic, priorities, books focus blocks, drafts replies, schedules a dinner reservation through the Concierge connector.
- At L4 in Finance: Sita auto-categorizes new transactions and posts month-end reports while you sleep — every action reversible from the receipts panel.

## Technical implementation

**New files**
- `src/lib/sita-agent/agent-core.ts` — planner + executor loop
- `src/lib/sita-agent/skill-registry.ts` — typed registry mapping intents → kernel capabilities (`domain`, `capabilityId`, `risk`, `reversible`, `requiresApproval`)
- `src/lib/sita-agent/skills/business-skills.ts`
- `src/lib/sita-agent/skills/finance-skills.ts`
- `src/lib/sita-agent/skills/concierge-skills.ts`
- `src/lib/sita-agent/autonomy-tier.ts` — per-domain L0–L4 reader/writer (localStorage + DB-backed override)
- `src/lib/sita-agent/plan-types.ts` — `ActionPlan`, `ActionStep`, `PlanResult`
- `src/lib/sita-agent/useSitaAgent.ts` — React hook bridging voice → planner → kernel via `useAction`
- `src/components/sita/shell/sita-agent/SitaActionPlanCard.tsx` — approval modal in HUD
- `src/components/sita/shell/sita-agent/SitaAutonomyControls.tsx` — Control Center row (3 sliders)
- `supabase/functions/sita-agent-planner/index.ts` — server-side planner (Lovable AI gateway, `google/gemini-2.5-pro`) returning typed JSON plans
- `mem://features/sita-agent-phase-e.md`

**Edited files**
- `src/lib/sita-voice/voice-intent-router.ts` — new `kind: "agent_plan"` route for complex/multi-step utterances
- `src/lib/sita-voice/useSitaBrainBridge.ts` — delegate agent intents to `useSitaAgent`
- `src/components/sita/shell/ShellLiveLayer.tsx` — mount `SitaActionPlanCard`
- `src/components/sita/shell/ControlCenter.tsx` — mount `SitaAutonomyControls`
- `src/components/sita/shell/sita-hud/SitaWhisper.tsx` — add "Do it for me" action when plan is reversible

**Pipeline & safety**
- All execution flows through `useAction` → `useCanonicalAction` → 12-stage kernel (trust, approval, budget, receipts) — no bypasses.
- Planner output is Zod-validated; unknown capability IDs are rejected before execution.
- `AUTONOMY_CEILING_MAP` is enforced server-side in the planner edge function (irreversible/blocked actions are downgraded to "requires approval" regardless of tier).
- Every plan emits a receipt; failures auto-create a runbook entry via the existing recovery platform.

**Data**
- New table `sita_agent_plans` (id, user_id, org_id, intent, plan jsonb, status, autonomy_tier, created_at, completed_at) with RLS via `is_org_member`.
- Add `sita_autonomy_tier` column to `personal_brain_preferences` (jsonb: `{business, finance, concierge}` each `0..4`, default `1`).

**Memory rule added**
- New `mem://features/sita-agent-phase-e` describing planner contract, skill registry shape, autonomy tier semantics, and receipt/runbook hooks. Index updated.

## Out of scope (saved for Phase F)
- Multi-device handoff, gesture/gaze input, holographic boardroom, spatial workspace.

