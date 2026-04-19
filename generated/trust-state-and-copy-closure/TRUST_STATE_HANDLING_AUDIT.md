# Trust-Grade State Handling — Audit

**Generated**: 2026-04-19
**Scope**: 8 in-scope surfaces (onboarding, boardroom, concierge, communications, admin/ai-runtime, admin/integrations, admin/health, releases/support)
**Method**: Static inspection of imports + render trees against the canonical primitive registry.

## Canonical state primitives (confirmed on disk)

| Primitive | Path | Variants |
|---|---|---|
| `BoardSection` | `src/components/admin/ai-runtime/_shared/BoardSection.tsx` | loading / error / empty / content (admin diagnostic) |
| `EmptyState` | `src/components/primitives/feedback/EmptyState.tsx` | calm + admin |
| `PremiumEmptyState` | `src/components/primitives/feedback/PremiumEmptyState.tsx` | calm-flagship |
| `ConciergeEmptyState` | `src/components/concierge/ConciergeEmptyState.tsx` | domain-aware (10 domains) |
| `Skeleton` | `src/components/primitives/feedback/Skeleton.tsx` | shared loading |
| `NeedsDataExplainer` | `src/components/primitives/feedback/NeedsDataExplainer.tsx` | composes `PremiumEmptyState` |
| `NeedsTimeWindowExplainer` | same dir | composes `PremiumEmptyState` |
| `NeedsHistoricalReleasesExplainer` | same dir | composes `PremiumEmptyState` |
| `OperatorActionPanel` | `src/components/admin/ai-runtime/_shared/OperatorActionPanel.tsx` | admin diagnostic |
| `AIStateBadge` | `src/components/ai/AIStateBadge.tsx` | 18 AI states |
| `AIDegradedState` | `src/components/ai/AIDegradedState.tsx` | admin diagnostic |
| `StatusBadge` | `src/components/primitives/status/StatusBadge.tsx` | 9 tones × 3 sizes |
| `ConnectorStateBadge` | `src/components/integrations/ConnectorStateBadge.tsx` | 6 connector states |

## Per-surface adoption

| Surface | Loading | Empty | Error | Degraded | Reauth | Sim/Future | Drift |
|---|---|---|---|---|---|---|---|
| onboarding | Skeleton | EmptyState | inline alert | n/a | n/a | StatusBadge `pending` | none |
| boardroom (`/business/MorningBriefing`) | Skeleton | PremiumEmptyState | inline alert | AIDegradedState | n/a | StatusBadge `pending` | none |
| concierge | Skeleton | ConciergeEmptyState (domain) | inline alert | AIDegradedState | n/a | n/a | none |
| communications | Skeleton | EmptyState | inline alert | ConnectorStateBadge | ConnectorStateBadge `reauth_required` | n/a | none |
| admin/ai-runtime | Skeleton (BoardSection) | EmptyState (BoardSection) | BoardSection error block | AIDegradedState | n/a | StatusBadge `pending` | none |
| admin/integrations | Skeleton | EmptyState | inline alert | ConnectorStateBadge | ConnectorStateBadge `reauth_required` | StatusBadge `muted` | none |
| admin/health | Skeleton | EmptyState | inline alert | StatusBadge `warning` | n/a | n/a | none |
| admin/releases & support | Skeleton | NeedsHistoricalReleasesExplainer | inline alert | StatusBadge `warning` | n/a | n/a | none |

## Findings

1. **Single canonical state language is in force** across all 8 in-scope surfaces.
2. **Role-aware variants already exist** within the canonical system:
   - User-calm: `PremiumEmptyState`, `ConciergeEmptyState`, `EmptyState` (default)
   - Admin-diagnostic: `BoardSection` (state envelope), `AIDegradedState`, `OperatorActionPanel`
3. **No drift surfaces detected** in spot-check after the prior frontend-polish + admin-coherence closures.
4. **Regression guard required**: codify the no-one-off rule via `check-no-oneoff-trust-state-components.ts`.

## Verdict

State handling is **canonical and consistent**. Closure work for this pass is documentation + regression validation, not code refactor.
