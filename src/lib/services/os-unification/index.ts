// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Unification Service
// Cross-surface context sync, shared context handoff, unresolved queues
// Canonical contract: contracts/runtime/os-unification-runtime
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
// @persistence: os_service_state — state survives refresh via universal adapter
import type {
  OSUnificationRuntime,
  ActiveSurface,
  SurfaceType,
} from "@/packages/contracts";

// ── Service ─────────────────────────────────────────────────────

export class OSUnificationService {
  private surfaces = new Map<string, ActiveSurface>();
  private sharedContext: Record<string, unknown> = {};
  private unresolvedQueues: OSUnificationRuntime["unresolvedQueues"] = [];
  private lastSyncAt: string = new Date().toISOString();

  connectSurface(surface: ActiveSurface): void {
    this.surfaces.set(surface.surfaceId, surface);
  }

  disconnectSurface(surfaceId: string): void {
    this.surfaces.delete(surfaceId);
  }

  updateActivity(surfaceId: string): void {
    const s = this.surfaces.get(surfaceId);
    if (s) s.lastActiveAt = new Date().toISOString();
  }

  getSurface(surfaceId: string): ActiveSurface | undefined {
    return this.surfaces.get(surfaceId);
  }

  getSurfacesByType(type: SurfaceType): ActiveSurface[] {
    return Array.from(this.surfaces.values()).filter(s => s.type === type);
  }

  getSurfacesByUser(userId: string): ActiveSurface[] {
    return Array.from(this.surfaces.values()).filter(s => s.userId === userId);
  }

  setSharedContext(key: string, value: unknown): void {
    this.sharedContext[key] = value;
  }

  getSharedContext(key: string): unknown {
    return this.sharedContext[key];
  }

  pushToSurface(surfaceId: string, key: string, value: unknown): void {
    const s = this.surfaces.get(surfaceId);
    if (s) s.currentContext[key] = value;
  }

  addUnresolvedItem(item: OSUnificationRuntime["unresolvedQueues"][0]): void {
    this.unresolvedQueues.push(item);
  }

  resolveItem(id: string): void {
    this.unresolvedQueues = this.unresolvedQueues.filter(q => q.id !== id);
  }

  syncContextAcrossSurfaces(userId: string): void {
    const userSurfaces = this.getSurfacesByUser(userId);
    for (const surface of userSurfaces) {
      surface.currentContext = { ...surface.currentContext, ...this.sharedContext };
    }
    this.lastSyncAt = new Date().toISOString();
  }

  computeContinuityScore(): number {
    const total = this.surfaces.size;
    if (total === 0) return 100;
    const now = Date.now();
    let freshCount = 0;
    for (const s of this.surfaces.values()) {
      const age = now - new Date(s.lastActiveAt).getTime();
      if (age < 5 * 60 * 1000) freshCount++; // active within 5 minutes
    }
    return Math.round((freshCount / total) * 100);
  }

  evaluate(): OSUnificationRuntime {
    return {
      activeSurfaces: Array.from(this.surfaces.values()),
      sharedContext: { ...this.sharedContext },
      unresolvedQueues: [...this.unresolvedQueues],
      continuityScore: this.computeContinuityScore(),
      lastSyncAt: this.lastSyncAt,
    };
  }

  // ── Persistence ──────────────────────────────────────────
  private _persist = () => debouncedSaveServiceState("os-unification", this.serialize());

  serialize(): Record<string, unknown> {
    return {
      surfaces: Array.from(this.surfaces.entries()),
      unresolvedQueues: this.unresolvedQueues,
    };
  }

  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.surfaces) this.surfaces = new Map(state.surfaces as any);
    if (state.unresolvedQueues) this.unresolvedQueues = state.unresolvedQueues as any;
  }

  async loadPersistedState(): Promise<void> {
    const state = await loadServiceState("os-unification");
    if (state) this.hydrate(state as Record<string, unknown>);
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createOSUnificationService(): OSUnificationService {
  return new OSUnificationService();
}
