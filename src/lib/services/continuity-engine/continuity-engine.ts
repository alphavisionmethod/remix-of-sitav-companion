// ═══════════════════════════════════════════════════════════════
// SITA OS — Ambient Continuity / Handoff Engine
// Active intelligence for cross-surface workspace continuity
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type HandoffTrigger = "surface_change" | "inactivity" | "user_initiated" | "urgency_escalation" | "auto_detected" | "schedule_based";

export interface ContinuityThread {
  id: string;
  topic: string;
  domain: DomainId;
  surfaces: string[];
  state: Record<string, unknown>;       // serialized context: scroll position, form data, task progress
  unresolvedItems: string[];
  priority: "high" | "medium" | "low";
  lastActivity: string;
  createdAt: string;
  ttlMinutes: number;
}

export interface HandoffRequest {
  threadId: string;
  fromSurface: string;
  toSurface: string;
  trigger: HandoffTrigger;
  preserveState: boolean;
  context: Record<string, unknown>;
}

export interface HandoffResult {
  success: boolean;
  threadId: string;
  fromSurface: string;
  toSurface: string;
  stateTransferred: boolean;
  resumeUrl?: string;
  fallbackAction?: string;
}

export interface SurfacePresence {
  surfaceId: string;
  deviceId: string;
  type: string;
  lastSeen: string;
  active: boolean;
  capabilities: string[];       // "biometric" | "keyboard" | "touch" | "voice"
}

export interface ContinuityScore {
  score: number;                // 0–100
  activeThreads: number;
  unresolvedItems: number;
  staleSurfaces: number;
  avgHandoffLatency: number;
}

// ── Service ──────────────────────────────────────────────────────

export class ContinuityEngineService {
  private threads: Map<string, ContinuityThread> = new Map();
  private surfaces: Map<string, SurfacePresence> = new Map();
  private handoffLog: HandoffResult[] = [];
  private counter = 0;

  // ── Thread Management ──────────────────────────────────────

  createThread(topic: string, domain: DomainId, surface: string, state: Record<string, unknown> = {}, priority: "high" | "medium" | "low" = "medium"): ContinuityThread {
    const id = `thread-${++this.counter}-${Date.now()}`;
    const thread: ContinuityThread = {
      id, topic, domain, surfaces: [surface], state,
      unresolvedItems: [], priority,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ttlMinutes: 120,
    };
    this.threads.set(id, thread);
    this._persist();
    return thread;
  }

  updateThreadState(threadId: string, state: Record<string, unknown>): void {
    const thread = this.threads.get(threadId);
    if (thread) {
      thread.state = { ...thread.state, ...state };
      thread.lastActivity = new Date().toISOString();
      this._persist();
    }
  }

  addUnresolved(threadId: string, item: string): void {
    const thread = this.threads.get(threadId);
    if (thread) { thread.unresolvedItems.push(item); this._persist(); }
  }

  resolveItem(threadId: string, item: string): void {
    const thread = this.threads.get(threadId);
    if (thread) { thread.unresolvedItems = thread.unresolvedItems.filter(i => i !== item); this._persist(); }
  }

  // ── Handoff Operations ─────────────────────────────────────

  initiateHandoff(request: HandoffRequest): HandoffResult {
    const thread = this.threads.get(request.threadId);
    if (!thread) return { success: false, threadId: request.threadId, fromSurface: request.fromSurface, toSurface: request.toSurface, stateTransferred: false, fallbackAction: "Thread not found" };

    const targetSurface = this.surfaces.get(request.toSurface);
    if (!targetSurface?.active) {
      return { success: false, threadId: request.threadId, fromSurface: request.fromSurface, toSurface: request.toSurface, stateTransferred: false, fallbackAction: "Target surface not active — queued for resume" };
    }

    // Transfer state
    if (request.preserveState) {
      thread.state = { ...thread.state, ...request.context, handoffFrom: request.fromSurface, handoffAt: new Date().toISOString() };
    }

    // Add target surface to thread
    if (!thread.surfaces.includes(request.toSurface)) {
      thread.surfaces.push(request.toSurface);
    }

    thread.lastActivity = new Date().toISOString();

    const result: HandoffResult = {
      success: true, threadId: request.threadId,
      fromSurface: request.fromSurface, toSurface: request.toSurface,
      stateTransferred: request.preserveState,
      resumeUrl: `/resume/${request.threadId}`,
    };

    this.handoffLog.push(result);
    if (this.handoffLog.length > 200) this.handoffLog.shift();
    this._persist();
    return result;
  }

  resumeOnSurface(threadId: string, surfaceId: string): ContinuityThread | null {
    const thread = this.threads.get(threadId);
    if (!thread) return null;
    if (!thread.surfaces.includes(surfaceId)) thread.surfaces.push(surfaceId);
    thread.lastActivity = new Date().toISOString();
    this._persist();
    return thread;
  }

  // ── Auto-Detection ─────────────────────────────────────────

  detectBestHandoffTarget(threadId: string): SurfacePresence | null {
    const thread = this.threads.get(threadId);
    if (!thread) return null;

    const activeSurfaces = [...this.surfaces.values()]
      .filter(s => s.active && !thread.surfaces.includes(s.surfaceId))
      .sort((a, b) => {
        // Prefer surfaces with more capabilities
        return b.capabilities.length - a.capabilities.length;
      });

    return activeSurfaces[0] ?? null;
  }

  autoHandoff(threadId: string, trigger: HandoffTrigger): HandoffResult | null {
    const target = this.detectBestHandoffTarget(threadId);
    if (!target) return null;

    const thread = this.threads.get(threadId);
    if (!thread) return null;

    return this.initiateHandoff({
      threadId,
      fromSurface: thread.surfaces[thread.surfaces.length - 1],
      toSurface: target.surfaceId,
      trigger,
      preserveState: true,
      context: {},
    });
  }

  // ── Surface Presence ───────────────────────────────────────

  registerSurface(presence: SurfacePresence): void {
    this.surfaces.set(presence.surfaceId, presence);
    this._persist();
  }

  updateSurfaceActivity(surfaceId: string, active: boolean): void {
    const surface = this.surfaces.get(surfaceId);
    if (surface) { surface.active = active; surface.lastSeen = new Date().toISOString(); this._persist(); }
  }

  getActiveSurfaces(): SurfacePresence[] {
    return [...this.surfaces.values()].filter(s => s.active);
  }

  // ── Queries ────────────────────────────────────────────────

  getActiveThreads(): ContinuityThread[] {
    const now = Date.now();
    return [...this.threads.values()].filter(t => {
      const age = now - new Date(t.lastActivity).getTime();
      return age < t.ttlMinutes * 60_000;
    }).sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  getThreadsForSurface(surfaceId: string): ContinuityThread[] {
    return [...this.threads.values()].filter(t => t.surfaces.includes(surfaceId));
  }

  getContinuityScore(): ContinuityScore {
    const threads = this.getActiveThreads();
    const totalUnresolved = threads.reduce((s, t) => s + t.unresolvedItems.length, 0);
    const staleSurfaces = [...this.surfaces.values()].filter(s => Date.now() - new Date(s.lastSeen).getTime() > 300_000).length;
    const recentHandoffs = this.handoffLog.slice(-20);
    const avgLatency = recentHandoffs.length > 0 ? 250 : 0; // simplified

    const score = Math.max(0, 100 - totalUnresolved * 5 - staleSurfaces * 10);
    return { score, activeThreads: threads.length, unresolvedItems: totalUnresolved, staleSurfaces, avgHandoffLatency: avgLatency };
  }

  // ── Cleanup ────────────────────────────────────────────────

  pruneExpiredThreads(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [id, thread] of this.threads) {
      if (now - new Date(thread.lastActivity).getTime() > thread.ttlMinutes * 60_000) {
        this.threads.delete(id);
        pruned++;
      }
    }
    if (pruned > 0) this._persist();
    return pruned;
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("continuity-engine", this.serialize());
  serialize(): Record<string, unknown> { return { threads: Array.from(this.threads.entries()), surfaces: Array.from(this.surfaces.entries()), handoffLog: this.handoffLog.slice(-100), counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.threads) this.threads = new Map(state.threads as [string, ContinuityThread][]);
    if (state.surfaces) this.surfaces = new Map(state.surfaces as [string, SurfacePresence][]);
    if (state.handoffLog) this.handoffLog = state.handoffLog as HandoffResult[];
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("continuity-engine"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createContinuityEngine = () => new ContinuityEngineService();
