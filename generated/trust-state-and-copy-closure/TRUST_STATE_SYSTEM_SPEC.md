# Trust-Grade State System — Spec

**Status**: Canonical. Single system, role-aware variants. Zero new families.

## States (canonical 10)

| State | User-calm primitive | Admin-diagnostic primitive |
|---|---|---|
| loading | `Skeleton` (or `BoardSection loading`) | `BoardSection loading` |
| empty (general) | `EmptyState` / `PremiumEmptyState` | `BoardSection isEmpty` |
| empty (needs data) | `NeedsDataExplainer` | same (via `BoardSection`) |
| empty (needs time window) | `NeedsTimeWindowExplainer` | same |
| empty (needs historical releases) | `NeedsHistoricalReleasesExplainer` | same |
| error | inline alert | `BoardSection error + onRetry` |
| success | content | content |
| degraded | `AIStateBadge` (state=`success_partial`) | `AIDegradedState` panel |
| pending verification | `StatusBadge` tone=`pending` | `StatusBadge` tone=`pending` |
| reauth required | `ConnectorStateBadge` state=`reauth_required` | same |
| archived / future | `StatusBadge` tone=`muted` | `StatusBadge` tone=`muted` |
| demo / simulated | `AIStateBadge` state=`success_demo_governed` | same |

## Rules

1. **One canonical system, never duplicate families.** Any new `*EmptyState.tsx` outside `src/components/primitives/feedback/` (allow-list: `ConciergeEmptyState` for domain copy, `PremiumEmptyState`, `NeedsDataExplainer`, `NeedsTimeWindowExplainer`, `NeedsHistoricalReleasesExplainer`) is forbidden.
2. **Calm vs diagnostic is a variant prop, not a separate component.** `EmptyState` accepts plain children; `BoardSection` wraps it with operator framing.
3. **Every empty surface declares the reason** ("needs data" / "needs time window" / "no events in last 24h" — never bare "No data").
4. **Degraded ≠ healthy.** Use `AIDegradedState` (admin) or `AIStateBadge success_partial` (user). Never quietly succeed.
5. **Reauth ≠ disconnected.** Always render `ConnectorStateBadge` `reauth_required` until the operator sees it.
6. **Demo/sim/future labels MUST carry a canonical badge tone.** Never naked text.

## Allow-list (closure-frozen)

Empty-state component files that are explicitly canonical:

```
src/components/primitives/feedback/EmptyState.tsx
src/components/primitives/feedback/PremiumEmptyState.tsx
src/components/primitives/feedback/NeedsDataExplainer.tsx
src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx
src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx
src/components/concierge/ConciergeEmptyState.tsx        # domain copy variant
```

Anything matching `*EmptyState.tsx` outside this allow-list is a drift offender. Enforced by `check-no-oneoff-trust-state-components.ts`.
