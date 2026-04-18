// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo-Only Surface Registry (Canonical)
// Single source of truth for which surfaces are demo / preview / future-vision.
// Consumed by:
//   - DemoOnlyBanner (src/components/claim-safety/DemoOnlyBanner.tsx)
//   - FutureVisionBadge (src/components/claim-safety/FutureVisionBadge.tsx)
//   - DWE07DeviceLaunchHonestyBoard (live truth board)
//   - check-demo-only-surface-badging.ts (CI gate)
//   - check-future-vision-route-containment.ts
//   - check-device-surface-claim-safety.ts
// ═══════════════════════════════════════════════════════════════

export type ContainmentLevel = "demo_only" | "internal_preview" | "future_vision";

export interface DemoOnlySurface {
  /** Stable surface ID (matches admin nav code, e.g. "DWE01"). */
  surfaceId: string;
  /** Human-readable name shown in banner. */
  surfaceName: string;
  /** Containment level — drives banner copy and badge variant. */
  containment: ContainmentLevel;
  /** Page route, used by route-containment validators. */
  route: string;
  /** File path of the page component (relative to repo root). */
  componentPath: string;
  /** Why this surface is demo-only — shown to operators. */
  rationale: string;
  /** Operator-visible expected go-live posture. */
  goLivePosture: "demo-only-permanent" | "preview-pending-evidence" | "future-vision-research";
}

export const DEMO_ONLY_SURFACES: readonly DemoOnlySurface[] = [
  {
    surfaceId: "DWE01",
    surfaceName: "Connected Devices Center",
    containment: "demo_only",
    route: "/admin/dwe01-connected-devices",
    componentPath: "src/pages/admin/DWE01ConnectedDevicesCenter.tsx",
    rationale: "Wearables/device-trust enrollment is preview-only. Devices shown are seeded; pairing flows are simulated.",
    goLivePosture: "preview-pending-evidence",
  },
  {
    surfaceId: "DWE02",
    surfaceName: "Presence & Continuity Center",
    containment: "demo_only",
    route: "/admin/dwe02-presence-continuity",
    componentPath: "src/pages/admin/DWE02PresenceContinuityCenter.tsx",
    rationale: "Cross-device presence/continuity is demo-only until paired with a live wearable signal stream.",
    goLivePosture: "preview-pending-evidence",
  },
  {
    surfaceId: "DWE03",
    surfaceName: "Wearable Signals Center",
    containment: "demo_only",
    route: "/admin/dwe03-wearable-signals",
    componentPath: "src/pages/admin/DWE03WearableSignalsCenter.tsx",
    rationale: "Wearable signal ingestion (HR, motion, ambient) is demo-only. No live device pipelines.",
    goLivePosture: "preview-pending-evidence",
  },
  {
    surfaceId: "DWE04",
    surfaceName: "Notification Routing Studio",
    containment: "demo_only",
    route: "/admin/dwe04-notification-routing",
    componentPath: "src/pages/admin/DWE04NotificationRoutingStudio.tsx",
    rationale: "Cross-device notification routing is preview. Real routing requires DWE03 live signals.",
    goLivePosture: "preview-pending-evidence",
  },
  {
    surfaceId: "DWE05",
    surfaceName: "Device Trust & Approvals Center",
    containment: "demo_only",
    route: "/admin/dwe05-device-trust",
    componentPath: "src/pages/admin/DWE05DeviceTrustApprovalsCenter.tsx",
    rationale: "Device trust attestation is preview-only until TPM hardware proof gate is closed.",
    goLivePosture: "preview-pending-evidence",
  },
  {
    surfaceId: "DWE06",
    surfaceName: "Ambient Assistant Center",
    containment: "future_vision",
    route: "/admin/dwe06-ambient-assistant",
    componentPath: "src/pages/admin/DWE06AmbientAssistantCenter.tsx",
    rationale: "Ambient/spatial assistant UX is future-vision research. Not on any current launch track.",
    goLivePosture: "future-vision-research",
  },
  {
    surfaceId: "DWE07",
    surfaceName: "Device Launch Honesty Board",
    containment: "internal_preview",
    route: "/admin/dwe07-device-launch-honesty",
    componentPath: "src/pages/admin/DWE07DeviceLaunchHonestyBoard.tsx",
    rationale: "Internal operator board that displays this registry. Shows which device surfaces are demo-only.",
    goLivePosture: "demo-only-permanent",
  },
  {
    surfaceId: "UAO03",
    surfaceName: "Ambient Team Control",
    containment: "future_vision",
    route: "/admin/uao03-ambient-team-control",
    componentPath: "src/pages/admin/UAO03AmbientTeamControl.tsx",
    rationale: "Ambient team-presence orchestration is future-vision. Requires DWE03+DWE06 to be production-live first.",
    goLivePosture: "future-vision-research",
  },
  {
    surfaceId: "UAO08",
    surfaceName: "Ambient Launch Readiness",
    containment: "internal_preview",
    route: "/admin/uao08-ambient-launch-readiness",
    componentPath: "src/pages/admin/UAO08AmbientLaunchReadiness.tsx",
    rationale: "Operator readiness board for ambient surfaces. Not user-facing.",
    goLivePosture: "demo-only-permanent",
  },
] as const;

/** Lookup by surface ID. Returns undefined if not registered. */
export function getDemoOnlySurface(surfaceId: string): DemoOnlySurface | undefined {
  return DEMO_ONLY_SURFACES.find((s) => s.surfaceId === surfaceId);
}

/** Returns true if a surface is registered as demo-only / preview / future-vision. */
export function isDemoOnlySurface(surfaceId: string): boolean {
  return DEMO_ONLY_SURFACES.some((s) => s.surfaceId === surfaceId);
}

/** Group surfaces by containment level — used by DWE07 truth board. */
export function getDemoOnlySurfacesByContainment(): Record<ContainmentLevel, DemoOnlySurface[]> {
  return {
    demo_only: DEMO_ONLY_SURFACES.filter((s) => s.containment === "demo_only"),
    internal_preview: DEMO_ONLY_SURFACES.filter((s) => s.containment === "internal_preview"),
    future_vision: DEMO_ONLY_SURFACES.filter((s) => s.containment === "future_vision"),
  };
}

/** Total count — for status reporting. */
export const DEMO_ONLY_SURFACE_COUNT = DEMO_ONLY_SURFACES.length;
