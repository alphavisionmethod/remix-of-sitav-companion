# State Handling Audit

Canonical pattern adopted (see `BoardSection.tsx`):

| State | Rendering |
|---|---|
| Loading | 3-row Skeleton with `aria-busy` + `aria-live="polite"` |
| Error | Inline destructive card + Retry button calling the real refresh function |
| Empty | Canonical `EmptyState` primitive with trust-grade title + description |
| Success | Children content |

All 18 boards have explicit error handling. The 3 hardened boards use `BoardSection` end-to-end.
