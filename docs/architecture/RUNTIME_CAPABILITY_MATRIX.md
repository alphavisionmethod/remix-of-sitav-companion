# Runtime Capability Matrix

> Phase 2 of the Meta-Architecture initiative. Authoritative answer for **what works on which surface**, with explicit launch-honesty bindings.

## Canonical Surfaces (8)

| Surface | Category | Underlying Tier | Host Authority |
|---|---|---|---|
| `web` | platform | WEB_APP | browser-sandbox |
| `electron` | platform | DESKTOP_HOST | host-bridge |
| `appliance` | platform | APPLIANCE_RUNTIME | appliance-runtime |
| `ios` | platform | WEB_APP | mobile-sandbox |
| `android` | platform | WEB_APP | mobile-sandbox |
| `offline` | mode | (overlay) | mode-overlay |
| `demo` | mode | (overlay) | mode-overlay |
| `real` | mode | (overlay) | mode-overlay |

Defined in `src/lib/runtime/surface-types.ts`.

## Two Layers of Capability Truth

### 1. Hardware Capability Matrix
File: `src/lib/runtime/runtime-capability-matrix.ts` (existing, extended in Phase 2)

Maps **17 raw OS capabilities** (auth, push, biometrics, tray, deep linking, …) across the 4 hardware surfaces, with `projectToCanonicalSurface()` projecting them to the 8-surface model.

### 2. Feature Capability Registry **(NEW in Phase 2)**
File: `src/lib/runtime/feature-capability-registry.ts`

Maps **app-level features** (CRM lead capture, payment execution, boardroom voting, …) directly to the 8 canonical surfaces with one of seven states:

| State | Meaning |
|---|---|
| `supported` | Real, production implementation |
| `simulated` | Visible but backed by simulation/mock |
| `degraded` | Available with reduced functionality |
| `fallback` | Works through declared fallback strategy |
| `prohibited` | MUST NOT be exposed on this surface |
| `roadmap` | Planned, not yet implemented |
| `unsupported` | Surface cannot host this feature |

Every entry references a **bounded context** (Phase 1 foreign key) so context owners are immediately accountable.

## Fallback Registry
File: `src/lib/runtime/capability-fallbacks.ts`

Declarative `(featureId, surface) → strategy` map. Strategies:

- `use-cache` — last-known-good from local cache
- `queue-and-flush` — offline mutation queue
- `downgrade-ui` — render simplified UI
- `delegate-to-host` — Electron/native bridge
- `delegate-to-server` — server-side compute
- `simulate-only` — explicit simulated banner
- `refuse-with-receipt` — block + emit refusal receipt
- `none` — no fallback exists

`validateFallbackCoverage()` asserts every `degraded`/`fallback` cell has an explicit strategy.

## Launch Honesty Bridge
File: `src/lib/runtime/capability-launch-honesty-map.ts`

Binds the feature registry to `launch-honesty-rules.ts`:

- `auditClaim(surface, claim, featureId?)` — flag forbidden marketing phrases
- `auditSurface(surface)` — list every non-supported feature on a surface
- `surfaceHonestyScore(surface)` — honesty % for launch readiness

## Validation

CI gate: `scripts/runtime/checks/check-runtime-capability-completeness.ts`

Asserts:
1. Every feature has all 8 surfaces classified
2. Every `degraded`/`fallback` cell has a fallback strategy
3. Every feature points to a real bounded context (Phase 1 cross-link)
4. No `unsupported` feature is incorrectly claimed in marketing surfaces

Run: `npx tsx scripts/runtime/checks/check-runtime-capability-completeness.ts`

## Generated Manifest

`generated/runtime-capability-matrix.json` — produced by `scripts/runtime/generate/generate-runtime-capability-matrix.ts`. Includes both the hardware matrix and the feature registry projection.

## Wiring Map

| Consumer | Reads |
|---|---|
| Runtime guards (`useFeatureGate`) | `feature-capability-registry` |
| App shell capability checks | `runtime-capability-matrix.projectToCanonicalSurface` |
| Admin Capability Explorer (`META02RuntimeCapabilityExplorer`) | both registries + honesty map |
| Mobile parity dashboard (`MSA03CapabilityPortability`) | feature registry filtered to ios/android |
| Launch readiness CI | `surfaceHonestyScore` per surface |
| Support diagnostics bundle | `auditSurface(detectedSurface)` |
