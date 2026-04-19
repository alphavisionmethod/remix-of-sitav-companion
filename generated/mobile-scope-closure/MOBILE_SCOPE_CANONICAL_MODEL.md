# Mobile Scope — Canonical Model

> Generated: 2026-04-19 · Authoritative

## Active deployment surfaces (Track A)

| Surface | Status | Notes |
|---|---|---|
| Web SPA | 🟢 GA | Primary user surface; mobile-responsive; PWA-installable |
| Ubuntu-native ISO | 🟢 GA | Sovereign OS image; signed; A/B atomic updates |
| Electron desktop shell | 🟢 GA | Desktop wrapper around the SPA on Ubuntu base |

## Not in current deployment scope

| Surface | Classification | Containment |
|---|---|---|
| Native iOS app | `ARCHIVED` / `FUTURE_VISION_ONLY` | `archive/capacitor/`, `archive/mobile/ios/` |
| Native Android app | `ARCHIVED` / `FUTURE_VISION_ONLY` | `archive/capacitor/`, `archive/mobile/android/` |
| App Store / TestFlight | `NOT_LAUNCH_SURFACE` | n/a |
| Play Store | `NOT_LAUNCH_SURFACE` | n/a |
| APNs push | `NOT_LAUNCH_SURFACE` | Web Push (VAPID) is the live transport |
| FCM push | `NOT_LAUNCH_SURFACE` | Web Push (VAPID) is the live transport |
| Capacitor wrapper | `ARCHIVED` | `archive/capacitor/capacitor.config.ts` |
| Mobile build manifest | `ARCHIVED` | `archive/infra/mobile.yaml` |

## Canonical vocabulary

| Label | Use when |
|---|---|
| `ARCHIVED` | Asset is preserved under `archive/` for traceability; excluded from active build/test/deploy. |
| `FUTURE_VISION_ONLY` | Asset describes a possible future program; must not be claimed as current. |
| `NOT_LAUNCH_SURFACE` | Surface cannot appear in launch-facing or operator-facing claims of readiness. |
| `OPTIONAL_FUTURE_PROGRAM` | Reactivation requires its own owner, signing, QA, push truth, and governance update. |

Forbidden language anywhere outside `archive/`:

- "store-ready", "App Store ready", "Play Store ready"
- "TestFlight submission ready", "AAB submission ready"
- "native mobile app available", "iOS app", "Android app" (referring to a current SITA OS native app)
- "Capacitor app live", "mobile launch surface"

Allowed language:

- "responsive web on mobile browsers"
- "installable PWA on supported browsers"
- "native mobile apps are not in current scope" (with link to `docs/MOBILE_HONESTY.md`)

## Mobile-responsive web vs native mobile

These are **not** the same thing. The repo must keep them separate:

| Concept | What it is | Status |
|---|---|---|
| Mobile-responsive web | The SPA renders well on phone-sized viewports (`src/components/mobile/*`, Tailwind breakpoints) | 🟢 Active, supported |
| PWA install | The browser may add the SPA to the home screen via `public/sw.js` + manifest | 🟢 Active, supported |
| Native mobile app | A binary distributed via App Store / Play Store and bridging to the SPA via Capacitor | ⛔ Out of scope |

## Where this model is enforced

| Concern | Enforcement |
|---|---|
| Repo file shape | `check-mobile-native-out-of-scope-truth.ts` (BLOCK) |
| Forbidden language in docs/UI | `check-no-active-native-mobile-claims.ts` (BLOCK) |
| Install surfaces link `MOBILE_HONESTY.md` | `check-install-page-mobile-honesty.ts` (BLOCK) |
| Mobile manifests stay archived | `check-mobile-manifest-archive-classification.ts` (BLOCK) |
| Generated mobile truth stays canonical | `check-generated-mobile-truth-consistency.ts` (BLOCK) |
| Operator visibility | `MobileScopeTruthPanel` tab in `/admin/ai-runtime` |
