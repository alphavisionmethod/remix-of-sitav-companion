// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime: OS Unification Runtime
// Cross-surface continuity and shared context handoff
// ═══════════════════════════════════════════════════════════════

export type SurfaceType = "web" | "mobile" | "admin" | "api" | "voice" | "notification";

export interface ActiveSurface {
  surfaceId: string;
  type: SurfaceType;
  userId: string;
  deviceId: string;
  connectedAt: string;
  lastActiveAt: string;
  currentContext: Record<string, unknown>;
}

export interface OSUnificationRuntime {
  activeSurfaces: ActiveSurface[];
  sharedContext: Record<string, unknown>;
  unresolvedQueues: Array<{
    id: string;
    domain: string;
    priority: "high" | "medium" | "low";
    age: string;
  }>;
  continuityScore: number; // 0-100
  lastSyncAt: string;
}
