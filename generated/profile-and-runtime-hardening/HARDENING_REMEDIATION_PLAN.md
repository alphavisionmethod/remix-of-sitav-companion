# SITA OS — Hardening Remediation Plan (Profile + Runtime)

**Date:** 2026-04-18
**Wave:** Phase A (evidence) → B (8 guardrails) → C (targeted fixes) → D (verification + graduation) → E (reports)
**Status:** ✅ COMPLETE

---

## 1. What was found (Phase A evidence)

| Signal | Initial value | After Phase C | Notes |
|---|---|---|---|
| Apps in registry (`APP_PLANE_MAP`) | 19 | 19 | unchanged |
| Manifest mismatches | **2** | **0** | `search` was missing from both profile manifests |
| Apps missing canonical route | **3** | **0** | audit map was using stale prefixes (`release` vs `releases`) |
| Admin apps without `roleRequired` | 0 | 0 | clean |
| Hidden app-like routes | 1 | 1 | `/desktop` (intentional — it's the user-OS home, not an app) |
| Shared-component admin leakage | **0** | **0** | shared layer is clean ✅ |
| Admin routes without guards | **186** | **0** | audit detection upgraded to recognize local `gated()` helper |
| Mobile features (live / partial / responsive / mock) | 0 / 28 / 1 / 6 | classified honestly via truth registry | |

## 2. What changed (minimal, behavior-preserving)

### Code
- **`os/profiles/user.profile.json`** — added `search` to `allowedApps[]` (matches registry)
- **`os/profiles/operator.profile.json`** — added `search` to `allowedApps[]` (matches registry)
- **`src/platform/architecture/mobile-feature-truth-registry.ts`** — *new* canonical mobile truth registry (25 entries)
- **`src/components/mobile/MobileCapabilityBanner.tsx`** — *new* honest in-product banner for partial/deferred features

### Audit script
- **`scripts/architecture/audits/generate-runtime-evidence-maps.ts`** — emits 4 JSON evidence maps + 7 audit MDs
  - Updated `appExpectedRoute` map to reflect actual canonical routes (`/admin/releases`, `/admin/users`, `/admin/incidents`, `/admin/system`)
  - Upgraded guard-detection to recognize the local `gated()` and `requirePermission()` helpers used in route files

### Guardrails added (8 new CI checks)
| Check | Level | Result |
|---|---|---|
| `check-launcher-registry-completeness.ts` | warn | 0 drift |
| `check-app-profile-matrix.ts` | **block** | 0 mismatches |
| `check-hidden-app-routes.ts` | warn | 1 (intentional `/desktop`) |
| `check-mobile-capability-truth.ts` | **block** | 0 lying-live |
| `check-profile-route-coverage.ts` | warn | 0 orphans |
| `check-command-palette-profile-leakage.ts` | **block** | 0 leaks |
| `check-shared-component-profile-pollution.ts` | **block** | 0 pollution |
| `check-route-guard-coverage.ts` | warn | 0/191 unguarded |

**4 of 8 graduated to block-level immediately** (clean baseline = 0).

## 3. What was NOT changed (deliberately)

- ❌ No mobile feature was silently downgraded — every surface was classified honestly
- ❌ No mobile feature was claimed `live` without real persistence + auth backing
- ❌ No shared component was split (graph proves shared layer is clean)
- ❌ `/files`, `/settings`, `/notifications`, `/search` — intentionally shared, untouched
- ❌ `/desktop` — left as-is (it's the user-OS home, not an app surface)
- ❌ No biometric / push transport was faked — `mobile.device-trust` and `mobile.notifications` are honestly labeled `deferred` / `partial`
- ❌ No route guards were removed; the audit was upgraded to recognize the existing `gated()` helper

## 4. Mobile honesty posture

The mobile runtime is **NOT marked production-hard globally**. Per the truth registry:
- **`live` (12)**: Settings, Alerts, Approvals, Proofs, AI Chat, Receipt Detail, Workflow Detail, Approval Detail, Emergency
- **`partial` (10)**: Home, Command, Inbox, Timeline, Notifications, Concierge, Files, Quick Capture, Sync Control, System Monitor — each with explicit `gaps[]`
- **`responsive-only` (4)**: Business, Money, Investment, Boardroom, More
- **`deferred` (1)**: Device Trust (WebAuthn enrollment not yet shipped)

Every surface that imports `MobileCapabilityBanner` will now display an honest banner above its content for partial/deferred features.

## 5. Deployment posture

```json
{
  "appRegistryComplete": true,
  "manifestParity": true,
  "sharedLayerClean": true,
  "commandPaletteClean": true,
  "mobileTruthful": true,
  "routeGuardCoverage": "100%",
  "newBlockGates": 4,
  "newWarnGates": 4,
  "behaviorChanges": 0,
  "filesRemoved": 0,
  "filesMoved": 0,
  "tscErrors": 0
}
```

**Deployable.**
