# Admin Empty-State System Spec

## Canonical primitive

`src/components/sita/PremiumEmptyState.tsx` is the **single canonical empty-state primitive** for the admin control plane. It supports 9 variants:

- `first-use`
- `no-data`
- `disconnected`
- `degraded`
- `blocked`
- `no-results`
- `no-permission`
- `demo-preview`
- `connect-to-activate`

Plus an optional `domain` prop for accent theming and an optional `tip` slot for operator guidance.

## Convenience explainers

Three thin convenience wrappers compose `PremiumEmptyState` for the three highest-frequency admin states. They live under `src/components/primitives/feedback/` and are exported from the canonical primitives barrel:

| Component                         | Variant            | Use when                                                         |
|-----------------------------------|--------------------|------------------------------------------------------------------|
| `NeedsDataExplainer`              | `no-data`          | A board is empty because no events have fired in its window      |
| `NeedsTimeWindowExplainer`        | `demo-preview`     | A rolling-window board is still accumulating evidence            |
| `NeedsHistoricalReleasesExplainer`| `first-use`        | A historical-comparison board has only one release on file       |

These are **convenience wrappers, not duplicate primitives**. They forward all props to `PremiumEmptyState` and exist purely to make adoption ergonomic.

## Adoption rule

Inside `src/pages/admin/**` and `src/components/admin/**`, any zero-data state **must** render via:

- `PremiumEmptyState` directly, or
- `EmptyState` (legacy primitive — still canonical for ultra-compact contexts), or
- one of the three explainers above, or
- `BoardSection` (which renders `EmptyState` internally)

Raw inline empty-state text (e.g. `<p>No data</p>`) is forbidden and enforced by `check-empty-state-coverage` + `check-admin-empty-state-consistency`.

## No new component families

This pass introduces **zero** new empty-state component families. The three explainers are pure compositions of the existing canonical primitive.
