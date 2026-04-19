# Concierge — Trust Copy Spec

**Surface**: `/concierge/*`, `ConciergeChat`, `ConciergeEmptyState` (10 domain variants)
**Owner**: Concierge domain

## Distinction: gateway-governed live AI

| Aspect | Reality | Allowed copy | Forbidden copy |
|---|---|---|---|
| Inference | Lovable AI Gateway, per-user budget, fallback chain | "Live AI · gateway-governed" | "Always-on AI", "fully autonomous concierge" |
| Action-taking | Suggestions only; user confirms | "Concierge suggests; you confirm" | "Concierge handles your tasks", "AI does it for you" |
| Memory | Session + curated long-term | "Remembers what you've shared in this account" | "Knows everything about you" |
| Degraded | Fallback model or budget exhaustion → `AIDegradedState` | "Running on backup model" / "Budget reset at midnight" | silent fallback, "always available" |

## Required state coverage

- Loading: shimmer (`Skeleton`) on message stream
- Empty: `ConciergeEmptyState` with domain-specific calm copy (already shipped, 10 domains)
- Degraded: `AIStateBadge state="success_partial"` + degraded message from `ai-surface-grammar`
- Rate-limited: `AIStateBadge state="rate_limited"` with retry-after copy
- Error: inline alert + retry button

## Approved hero phrases

- "Live AI · gateway-governed · receipts on every reply"
- "Suggestions you can act on — never silent action"
- "When AI is unavailable, you'll see exactly why"

## Validation

`check-concierge-ai-state-handling.ts` (existing) verifies state-badge usage and forbidden-phrase absence.
