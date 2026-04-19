# Cost Ceiling Load Proof — Model

## Goal

Prove behaviorally that AI cost ceilings ARE enforced under load — without
burning meaningful spend.

## Approach: organic-load proof, not synthetic burst

A synthetic burst test would cost real money to prove what production
traffic already proves continuously. We instead use the following layered
verification model:

### Layer 1 — Ledger accumulation proof (nightly)

Sub-check 5 of the nightly verifier reads `ai_usage_ledger` for the
preceding 24 hours and asserts non-zero accumulation. If real traffic is
landing, the enforcement path IS hot.

### Layer 2 — Alert path queryability (nightly)

The verifier reads `ai_budget_alerts` to prove the table is queryable and
the alert path is wired. Production users exceeding 80% of their daily
envelope produce real rows here.

### Layer 3 — Class table presence (nightly)

The verifier reads `ai_workforce_budget_classes` to prove at least one
class is configured. Without classes, there is nothing to enforce.

### Layer 4 — Production audit trail (continuous)

Every invocation writes to `ai_invocations` AND `ai_usage_ledger`. Cost
attribution is reconstructible at any time by reading these tables. The
`check_ai_budget_policies` RPC is fail-closed: if it cannot run, AI is
denied.

## When to escalate to a true load probe

If the `ai-runtime-streak-health` gate detects 3+ consecutive nights
where `budget_enforced=false` AND `ledger_24h=0`, the on-call engineer
SHOULD manually run a budget-burst probe in a sandboxed test tenant
to prove enforcement in isolation. This is a documented runbook step,
not an automated nightly cost.
