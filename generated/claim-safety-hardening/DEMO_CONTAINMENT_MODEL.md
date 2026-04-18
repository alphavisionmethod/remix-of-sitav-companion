# Demo Containment Model

**Status**: Canonical — enforced by Phase-5 CI gates
**Owner**: Platform Truth Council

## Three Containment Levels

| Level | Visual Treatment | Operator Visibility | Profile Gating Policy |
|---|---|---|---|
| `demo_only` | **Blue banner** — "Demo preview — not launch-live" | Visible on `DWE07` truth board, "Demo" badge | Visible to operator profile; user profile **must not** treat as live |
| `internal_preview` | **Purple banner** — "Internal operator surface" | Visible on `DWE07`, "Internal" badge | **Operator-only**; never shown in user navigation |
| `future_vision` | **Amber banner** — "Future-vision research" | Visible on `DWE07`, "Future Vision" badge | Operator-visible; never claimed as on any launch track |

## Required Treatment per Surface

Every surface registered in `demo-only-surface-registry.ts` MUST have:

1. **Page-top banner** (`<DemoOnlyBanner surfaceId="..." />`) rendered before the page header.
2. **Inline badge** (`<FutureVisionBadge containment="..." />`) in the page H1 header.
3. **Registry entry** with rationale + go-live posture + componentPath.
4. **Admin-truth row** on `DWE07DeviceLaunchHonestyBoard`.

## Banner Copy (canonical)

| Containment | Label | Primary Copy |
|---|---|---|
| `demo_only` | Demo Preview | "Demo preview — not launch-live. Data shown is seeded or simulated." |
| `internal_preview` | Internal Preview | "Internal operator surface — not user-facing. Used for readiness review." |
| `future_vision` | Future Vision | "Future-vision research — not on any current launch track. Behaviors are exploratory." |

## Profile Gating Policy

- **`sita-os-user` profile** — `internal_preview` surfaces hidden from navigation. `demo_only` surfaces shown only when explicitly opted-into demo mode.
- **`sita-os-operator` profile** — all three levels visible with banners.
- **Public/marketing surfaces** — none of these appear; if any do, they are bugs.

## Admin Truth Surfacing

`DWE07DeviceLaunchHonestyBoard` reads `getDemoOnlySurfacesByContainment()` and renders three columns. This is the **operator's single source of truth** for "which device/ambient surfaces are demo and why."

## Promotion / Demotion

To **promote** a surface to live (remove from registry):
1. Provide evidence: real data pipeline, hardware test harness, validation gates passing.
2. Open PR removing the entry from `demo-only-surface-registry.ts`.
3. Remove `<DemoOnlyBanner>` and `<FutureVisionBadge>` from the page.
4. Update `DEMO_ONLY_SURFACE_AUDIT.md` and `demo-containment-status.json`.
5. Get Platform Truth Council sign-off.

To **demote** a previously-live surface to demo:
1. Add to registry with rationale.
2. Wire banner + badge.
3. Update audit + status JSON.

## CI Enforcement (Phase 5)

| Gate | What it checks |
|---|---|
| `check-demo-only-surface-badging.ts` | Every component listed in registry imports `DemoOnlyBanner` |
| `check-future-vision-route-containment.ts` | Every registered route is reachable only on operator profile (or behind demo opt-in) |
| `check-device-surface-claim-safety.ts` | No DWE/UAO/Ambient page exists outside the registry without explicit exemption |

All three gates are BLOCK-level.
