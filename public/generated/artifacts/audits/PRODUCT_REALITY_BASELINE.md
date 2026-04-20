# SITA OS — Product Reality Baseline (Phase 9)

> Authoritative answer to **"is the app real?"** for every (feature × surface) cell.

## Surfaces (7 canonical)

| ID | Tier | Host Authority |
|---|---|---|
| `web` | WEB_APP | browser-sandbox |
| `electron` | DESKTOP_HOST | host-bridge |
| `appliance` | APPLIANCE_RUNTIME | appliance-runtime |
| `ios` | WEB_APP via Capacitor | mobile-sandbox |
| `android` | WEB_APP via Capacitor | mobile-sandbox |
| `mobile-pwa` | WEB_APP (PWA shell) | browser-sandbox |
| `admin` | WEB_APP (operator console) | browser-sandbox |

## Reality States (5)

| State | Meaning | UI Treatment |
|---|---|---|
| `real` | Production implementation, real data | Normal |
| `simulated` | Visible UX backed by mock | **Must** show simulation banner |
| `degraded` | Available with reduced functionality | Show degraded state notice |
| `unsupported` | Surface cannot host this feature | **Must not** appear in UI |
| `roadmap` | Planned, not yet implemented | Show "Coming soon" if exposed |

## Hard Rules

1. Every feature **must** classify all 7 surfaces.
2. No production page may import demo / mock providers.
3. UI must not claim a state higher than the registry says.
4. `simulated` and `degraded` features must surface honest banners (`DemoStateBanner`, `DegradedStatePanel`).
5. Marketing claims must pass `surface-claim-map.ts` validation.
6. Apple APNs and App Store distribution **must remain `roadmap`** until Apple Developer Program is active.

## Source of Truth

| Concern | File |
|---|---|
| Feature × surface matrix | `src/lib/reality/feature-reality-registry.ts` |
| Per-surface allowed claims | `src/lib/reality/surface-claim-map.ts` |
| Page state contract | `src/lib/reality/page-state-contract.ts` |
| Page state registry | `src/lib/reality/page-state-registry.ts` |
| Mobile capabilities | `src/lib/runtime/mobile-runtime-contract.ts` |
| Appliance capabilities | `src/lib/runtime/appliance-runtime-contract.ts` |
| Admin capabilities | `src/lib/runtime/admin-runtime-contract.ts` |
| Deployability score | `src/lib/deploy/deployability-registry.ts` |

## CI Gates

| Gate | Script | Severity |
|---|---|---|
| Feature reality coverage | `scripts/architecture/checks/check-feature-reality-coverage.ts` | blocker |
| Context membership | `scripts/architecture/checks/check-context-membership.ts` | blocker |
| Page state coverage | `scripts/architecture/checks/check-page-state-coverage.ts` | blocker |
| CTA wiring | `scripts/architecture/checks/check-cta-wiring.ts` | warning |
| Mock provider leak | `scripts/architecture/checks/check-mock-leak.ts` | blocker |
| Deployability coverage | `scripts/architecture/checks/check-deployability-coverage.ts` | blocker |

## Generated Artifacts

- `generated/feature-reality-report.json`
- `generated/context-membership-manifest.json`
- `generated/deployability-report.json`

## Admin Surfaces

- `/admin/meta/reality` — `META04ProductReality` — live reality + deployability matrix
- `/admin/ci/umbrella` — `CI01CIUmbrellaCenter` — CI gate registry health

## Run Locally

```bash
bun run scripts/architecture/checks/check-feature-reality-coverage.ts
bun run scripts/architecture/checks/check-context-membership.ts
bun run scripts/architecture/checks/check-page-state-coverage.ts
bun run scripts/architecture/checks/check-cta-wiring.ts
bun run scripts/architecture/checks/check-mock-leak.ts
bun run scripts/architecture/checks/check-deployability-coverage.ts
bun run scripts/architecture/checks/check-ci-umbrella-integrity.ts
```
