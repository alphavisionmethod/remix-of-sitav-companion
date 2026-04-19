# Future-Surface Audit

**Generated:** 2026-04-19

## Registry: `src/lib/registries/demo-only-surface-registry.ts`

| Classification | Count | Behavior |
|---|---|---|
| `demo_only` | tracked | Renders `DemoOnlyBanner` at runtime |
| `future_vision` | tracked | Renders `FutureVisionBadge` at runtime |
| `archived` | tracked | Excluded from launcher + nav |
| `excludedFromLaunchScoring` | all of above | Not counted in readiness math |

## Categories of future surfaces

- Mobile-native (iOS/Android shells) — archived; web is canonical
- Wearable (Watch/Glass) — future_vision
- Ambient (voice-first kiosks) — future_vision
- Continuity (handoff between devices) — future_vision

## Validators

- `check-future-surfaces-registered.ts` — BLOCK if a surface in these categories is missing from registry
- `check-demo-only-surface-banners.ts` (pre-existing) — BLOCK if a `demo_only` surface renders without banner

## Truth panel

`EconomicTrustFutureTruthPanel` displays the registry as a tabular view with classification badges.

## Honest limits

- Some discovery routes (e.g. `/explore/future`) are intentionally browsable — banner is the safety, not navigation block
- Search results may surface future entries; banner ensures expectation alignment
