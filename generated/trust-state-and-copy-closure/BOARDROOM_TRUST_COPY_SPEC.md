# Boardroom — Trust Copy Spec

**Surface**: `/business/MorningBriefing`, `/boardroom/briefing`
**Owner**: Boardroom domain

## Distinction: live recommendation loop vs future learning loop

| Layer | Status | Allowed copy | Forbidden copy |
|---|---|---|---|
| Recommendation engine | LIVE | "Live recommendations from advisor council" / "Recommendation generated · receipt attached" | "self-improving", "continuously learning", "fully autonomous council" |
| Reflection / outcome capture | LIVE | "Outcome captured for review" | "AI is learning from this outcome" |
| Continuous learning loop (v2) | FUTURE | "Continuous learning loop — v2 future" / `StatusBadge tone="pending"` | "Council learns from every decision" / "AI improves itself" |

## Required state coverage

- Loading: `Skeleton` rows (3 lines)
- Empty (no recs today): `PremiumEmptyState` with reason + "Generate briefing" CTA
- Degraded (budget exhausted): `AIDegradedState` with budget reason + reset time
- Error: inline alert + retry

## Approved hero phrases

- "Today's briefing — generated from live council recommendations"
- "Each recommendation carries a receipt"
- "Outcome capture is live; continuous-learning v2 is on the roadmap"

## Validation

`check-flagship-surface-trust-copy.ts` (existing) scans the boardroom surface tree for forbidden phrases.
