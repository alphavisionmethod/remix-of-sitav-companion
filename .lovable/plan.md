

The user wants Product Reality Tiering enforcement. Let me audit existing runtime infrastructure first to understand what's already there before planning.

Key findings from prior audits:
- `src/lib/runtime/product-reality-tiers.ts` already exists (per check-runtime-tier-coverage.ts)
- `src/lib/runtime/runtime-capability-matrix.ts` already exists
- `src/lib/runtime/desktop/` exists with DesktopHostContract, ElectronBridgeContract per memory
- `electron/` exists with main.cjs, preload.cjs, fs-bridge.cjs
- 4-Plane model already in place via plane-registry.ts
- Service governance pattern established (5-layer) — mirror it for runtime tiers
- Appliance scripts: `scripts/release/appliance/` exists
- Generators exist: `generate-runtime-capability-matrix.ts`, `generate-runtime-reality-map.ts`

Strategy: Mirror the proven governance pattern (authority map + duplicate map + checks + report) used for Components/Services/Edge Functions. Classification-in-place, zero behavioral changes, additive contracts + enforcement.

# SITA OS — Product Reality Tier Governance & Runtime Truth Enforcement

## Current State (Audited)

| Asset | Status |
|---|---|
| `src/lib/runtime/product-reality-tiers.ts` | Exists (5 reality tiers) |
| `src/lib/runtime/runtime-capability-matrix.ts` | Exists (web/desktop/mobile/appliance) |
| `src/lib/runtime/desktop/` | DesktopHostContract + ElectronBridgeContract exist |
| `electron/` (main/preload/fs-bridge) | Exists, hardened with 7-layer security |
| `scripts/release/appliance/` | ISO/OVA build probes exist |
| Generated artifacts | `runtime-capability-matrix.json`, `runtime-reality-map.json` exist |
| **Missing** | Tier contract per Tier 1-4 model, feature→tier registry, runtime guards in UI, enforcement checks |

The infrastructure is partially present but lacks the **canonical 4-Tier model** (Web/Desktop/Appliance/Simulated-OS), per-feature classification, runtime-honest UI gating, and CI enforcement.

## Phased Plan (8 phases, all deployment-ready)

### Phase 1 — Canonical 4-Tier Contract & Folder Scaffold
Create the canonical runtime contract aligned with the Tier 1-4 spec:
- `src/lib/runtime/product-reality-tiers.ts` — extend with `WEB_APP | DESKTOP_HOST | APPLIANCE_RUNTIME | SIMULATED_OS_EXPERIENCE` (preserve existing 5-tier reality classification as a parallel concern)
- `src/lib/runtime/web/` — `web-runtime-contract.ts`, `web-capability-map.ts`, `web-fallbacks.ts`
- `src/lib/runtime/appliance/` — `appliance-runtime-contract.ts`, `appliance-capabilities.ts`, `first-boot-contract.ts`, `recovery-contract.ts`, `appliance-fallbacks.ts`
- `src/lib/runtime/simulation/` — `simulated-os-contract.ts`, `shell-simulation-capabilities.ts`, `surface-simulation-rules.ts`
- `src/lib/runtime/desktop/` — augment with `desktop-fallbacks.ts` (existing contracts preserved)
- `src/lib/runtime/launch-honesty-rules.ts`, `runtime-assertions.ts`, `runtime-detection.ts`, `runtime-flags.ts`, `portability-rules.ts`
- `docs/architecture/PRODUCT_REALITY_TIERS.md` — canonical doc

### Phase 2 — Runtime Detection & Context Provider
- `src/lib/runtime/runtime-detection.ts` — detects current tier (web vs Electron via `window.electron`, vs appliance via env probe)
- `src/lib/runtime/runtime-context.ts` + `RuntimeTierProvider` React context — exposes `useRuntimeTier()`, `useCapability(id)`, `useTierFallback(featureId)`
- Wire provider in `RuntimeProvider.tsx`

### Phase 3 — Feature Tier Registry (Authority Map)
- `src/lib/runtime/feature-tier-registry.ts` — every major feature declares `{ id, name, ownerDomain, supportedTiers[], simulatedTiers[], prohibitedTiers[], roadmapTiers[], fallback, launchHonesty }`
- Seed with the 50+ critical features (boardroom, business, money, files, app launcher, dock, lock screen, mission control, OTA, first-boot, native FS, push, etc.)
- `src/lib/migration/runtime-feature-classification-map.ts` — classification of runtime-sensitive files (mirrors service-authority-map pattern)
- `src/lib/migration/runtime-conflict-map.ts` — known cross-tier conflicts + resolution

### Phase 4 — Runtime Capability Matrix Hardening
- Refactor `runtime-capability-matrix.ts` to align with 4-tier model
- Add explicit per-capability rows: `{ capabilityId, web: 'supported|simulated|fallback|prohibited', desktop: ..., appliance: ..., simulated: ... }`
- Wire to feature-tier-registry as the source of truth

### Phase 5 — Runtime-Aware UI Gating
- Add `<TierGate tier="desktop" fallback={...}>` component
- Add `<RuntimeFallback featureId="..." />` honest-degradation component (explains *why* unavailable, not silent hide)
- Sweep critical surfaces (file picker, native notifications, OTA panel, system menu bar, lock screen, control center) to consume `useCapability()` instead of assuming
- Update `useElectronBridge`, `useOSAPI`, `useOSOrchestration`, `usePushNotifications`, `useSessionRestore`, `useNativeShellData` to read tier truth

### Phase 6 — Governance Checks (CI-ready)
Mirror the service governance pattern in `scripts/runtime/checks/`:
1. `check-feature-tier-classification.ts` — every registered feature must have supported/prohibited tiers declared
2. `check-runtime-capability-enforcement.ts` — runtime-sensitive APIs must have capability gates
3. `check-launch-honesty.ts` — components must not claim unsupported capabilities (regex scan for forbidden patterns)
4. `check-desktop-bridge-isolation.ts` — Electron-only imports must not appear in web-only paths
5. `check-appliance-isolation.ts` — `src/lib/runtime/appliance/**` cannot be imported from `src/pages/**` web routes
6. `check-simulated-os-truth.ts` — simulated shell components must declare simulation status
7. Aggregator: `scripts/runtime/run-runtime-tier-governance.ts` → emits `generated/runtime-tier-governance-report.json`

### Phase 7 — Deployment Artifact Separation
- Tag `scripts/release/appliance/**` as appliance-tier-only (header comments + manifest entry)
- Tag `electron/**` build scripts as desktop-tier
- Update `docs/refactor/deployment-map.md` with tier ownership
- Add `generated/runtime-tier-deployment-map.json`

### Phase 8 — Manifest Integration & Verification
- Register new manifests in `src/lib/truth-manifests/manifest-registry.ts`:
  - `manifest-runtime-tier-registry`
  - `manifest-runtime-tier-governance-report`
  - `manifest-feature-tier-classification`
- Generate `generated/RUNTIME_TIER_GOVERNANCE_REPORT.md`
- Update `generated/COMPONENT_GOVERNANCE_REPORT.md` cross-link section
- Run `tsc --noEmit` + `bun run build` + all governance checks → zero errors, all green
- Regression-verify Component + Service + Edge Function governance still pass

## What This Does NOT Do (Intentionally)

- **No file moves** for working OS/shell/electron code — classification-in-place
- **No behavioral changes** to existing surfaces (only adds honest fallbacks and gating where missing)
- **No removal** of existing 5-tier reality classification (`real-executable-substrate` etc.) — runs in parallel as a separate concern (architectural reality vs runtime tier)
- **No marketing changes** to kernel abstraction — kernel stays `simulated for experience` per memory
- **No new appliance build pipeline** — only governance over what exists

## Deliverables

- 4-Tier canonical contract + folder scaffold (web/desktop/appliance/simulation)
- Runtime detection + context provider + `useRuntimeTier`/`useCapability` hooks
- Feature Tier Registry (50+ features classified)
- Runtime conflict map + classification map
- 6 enforcement checks + aggregator + JSON/MD reports
- TierGate + RuntimeFallback honest-degradation components
- Updated truth manifests in registry
- Zero breaking changes, green build, all prior governance regressions pass

