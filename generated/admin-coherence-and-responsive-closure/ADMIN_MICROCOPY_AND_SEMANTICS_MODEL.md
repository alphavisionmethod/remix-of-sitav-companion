# Admin Microcopy and Semantics Model

_Canonical tone, label, and color-semantics rules for the SITA OS admin control plane._

## Tone

The admin plane addresses **operators**, not consumers. Microcopy must be:

- **calm** — no exclamation, no urgency theater
- **precise** — say exactly what is true, not what sounds reassuring
- **non-decorative** — no emoji, no marketing voice
- **trust-building** — name the data source, the freshness window, and the next action
- **concise but informative** — never sacrifice meaning for brevity

## Forbidden phrases

The following phrases are banned anywhere under `src/pages/admin/**` and enforced by `check-admin-microcopy-rules`:

| Phrase                | Why forbidden                                    |
|-----------------------|--------------------------------------------------|
| "Coming soon"         | Implies a roadmap commitment without evidence    |
| "Check back later"    | Pushes responsibility to the operator            |
| "Nothing here yet"    | Generic; no actionable signal                    |
| "Stay tuned"          | Marketing voice                                  |
| "Whoops" / "Oops"     | Casual; undermines trust                         |
| "Working on it"       | Vague; no honest status                          |

## Required empty-state copy structure

Every empty state must answer three questions:

1. **What is this board for?** (one sentence)
2. **Why is it empty right now?** (specific, truthful — e.g. "No signals fired in the last 24h")
3. **What populates it?** (concrete trigger condition)

Plus 1-2 actionable next destinations, and an optional one-line operator tip.

This is exactly the shape of `PremiumEmptyState` (title + description + actions[] + tip) — the canonical primitive.

## Status semantics

`StatusBadge` is the **single source of truth** for status color. Tones map to fixed meanings:

| Tone      | Meaning                                                           |
|-----------|-------------------------------------------------------------------|
| neutral   | informational / no judgement                                       |
| info      | informational signal worth attention                              |
| success   | healthy / passing / verified                                      |
| warning   | degraded / pending intervention / reauth required                 |
| danger    | failing / critical / blocked                                      |
| muted     | archived / out-of-scope / honest-warn deferred                    |
| verified  | proof-bound (receipt / signature / attestation present)           |
| pending   | awaiting confirmation / dual-approval / cooldown                  |
| failed    | terminal failure with operator action required                    |

Any admin component using `bg-yellow-*`, `bg-red-*`, `bg-green-*`, `text-red-*`, `text-yellow-*`, `text-green-*` outside `StatusBadge` is **flagged** by `check-admin-status-semantics` because it bypasses the canonical model.

## Action-panel hierarchy

Operator action panels render in the canonical order:

1. **primary** — the principal next operator action (1, occasionally 2)
2. **remediation** — only when board is in degraded / failing state
3. **next** — suggested onward navigation
4. **related** — sibling / lateral inspection
5. **evidence** — drilldown to receipts / proof bundles

The `OperatorActionPanel` primitive enforces this ordering at the type level.

## Preview / non-live disclosure

Any admin surface displaying sample, simulated, or accumulating data must include the literal token `Preview · Non-live` (or `non-live` / `preview ·` / `sample ·`) somewhere on the rendered surface. The cost-spotlight pattern is the reference implementation.
