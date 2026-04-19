# Trust-Copy Guidance Model

**Status**: Canonical. Applies to all trust-sensitive surfaces.

## Allowed patterns

### AI capability
- "Live AI via Lovable AI Gateway"
- "Governed by per-user budget and fallback policy"
- "Returns a receipt for every invocation"
- "Recommendation engine — live"
- "Continuous learning — future (v2)"

### Provider / connector
- "Live OAuth refresh — Google / Microsoft / Slack"
- "Manual long-tail provider — operator-supplied credentials"
- "Reauth required — last refresh failed"
- "Connector wired — runtime proof pending"

### Simulation / demo / future
- Always paired with a canonical badge:
  - `Demo · governed` (`AIStateBadge` state=`success_demo_governed`)
  - `Coming soon` (`StatusBadge` tone=`pending`)
  - `Archived` / `Future` (`StatusBadge` tone=`muted`)

### Admin AI runtime proof tier
- "Structurally wired" — code path exists, no behavioral proof yet
- "Behaviorally proven" — tested with real provider invocation
- "Nightly verified" — covered by `ai-runtime-nightly-verify` streak
- "Degraded" — fallback or budget gate active

## Forbidden patterns

| Phrase | Why forbidden | Use instead |
|---|---|---|
| "fully autonomous" | overclaims agency | "governed by policy" / "operator-approved" |
| "self-acting" | overclaims autonomy | "approval-gated" / "policy-routed" |
| "guaranteed to" / "guaranteed reliability" | overclaims runtime proof | "covered by nightly verification" |
| "always works" / "never fails" | overclaims reliability | "monitored by streak verifier" |
| "100% reliable" / "100% accurate" | overclaims | "nightly-verified streak: N days" |
| "AI handles everything" | overclaims scope | "AI proposes; operator approves" |
| "Connected" (without OAuth backing) | blurs live vs manual | "Wired (manual)" + `ConnectorStateBadge` |
| "Coming Soon" (naked text) | blurs future vs live | pair with `StatusBadge` tone=`pending` |
| "Demo data" (without badge) | blurs sim vs real | use `AIStateBadge success_demo_governed` |

## State / copy alignment rules

1. Every degraded panel has both a `StatusBadge`/`AIStateBadge` AND human-readable explanation.
2. Every "future" or "v2" callout names the gap explicitly ("Continuous learning loop — v2 future").
3. Every empty state names the reason and the next action.
4. Every connector with no OAuth refresh proof renders `ConnectorStateBadge` (never bare "Connected").
5. Every simulated persona / demo dataset surface badge: `Demo · governed`.

## Tone

- Calm (user-facing): warm, non-technical, action-oriented
- Diagnostic (admin-facing): precise, operator-grade, includes next-step + remediation link
