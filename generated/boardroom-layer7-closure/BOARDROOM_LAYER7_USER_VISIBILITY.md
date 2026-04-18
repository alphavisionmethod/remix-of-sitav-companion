# Boardroom Layer 7 — User Visibility

## Surface

A new module `Follow-through` (icon: `Workflow`) is added to `BoardroomAppShell`'s canonical `MODULES` list. It renders `BoardroomFollowthroughView`, which lists every Boardroom item past `approved` and lets the user drill into the canonical `BoardroomFollowthroughPanel`.

## What the user sees

For every item:

- Title + domain
- Current state badge (calm tone — never alarming unless `failed`)
- Time-since-last-event ("3m ago", "2h ago")
- Inline failure reason if applicable

In the detail panel:

- **Stage rail** — 8-stop progress bar (Approved → Dispatched → Executing → Executed → Receipt → Outcome → Reflected → Closed) with the current stage glowing.
- **Dispatch button** — visible only if state is `none` or `approved` and the user has approval rights.
- **Reflection prompt** — surfaces only after `outcome_tracked`, captures usefulness + lesson.
- **Failure CTA** — visible only on `failed`, shows reason + "Notify operator" button.

## Filters

- All / Active / Attention / Closed (toggle pills, top-right)

## Calm aesthetic

- No red anywhere unless `failed`
- Success states use teal/green at low saturation
- Pending/in-flight uses warm amber, never aggressive
- No notifications fire for routine progression — only for `failed` and `attention-needed`

## What the user does NOT see

- Internal `correlation_id`, `command_step_id`, raw payload (operator-only)
- Cost metrics (operator-only)
- Other users' chains (RLS-enforced)

## Trust signals

- Every state badge maps 1:1 to a database column — there is no UI-only state.
- Every "Dispatched"/"Executed" claim is backed by a row in `command_steps` + `agent_action_receipts`.
- Reflection success persists immediately and the chain visibly closes.

## Mobile

- Same module appears in the bottom nav's "More" overlay (it's the 7th of 11 modules).
- Detail panel collapses to a vertical timeline on small viewports.
