// ═══════════════════════════════════════════════════════════════
// SITA OS — Priority Stack / Attention OS
// Attention governance: what matters now, routing, suppression
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Types ────────────────────────────────────────────────────────

export type AttentionPriority = "critical" | "high" | "medium" | "low" | "background";
export type AttentionAction = "surface_now" | "queue" | "bundle" | "escalate" | "suppress" | "defer";
export type TargetSurface = "desktop" | "mobile" | "watch" | "boardroom" | "notification_center" | "email_digest" | "suppress";

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  domain: DomainId;
  priority: AttentionPriority;
  urgency: number;           // 0–10
  importance: number;        // 0–10
  source: string;
  targetSurface: TargetSurface;
  action: AttentionAction;
  createdAt: string;
  expiresAt?: string;
  bundleKey?: string;        // items with same key get bundled
  suppressedUntil?: string;
  ignoredCount: number;
  acknowledged: boolean;
  metadata: Record<string, unknown>;
}

export interface AttentionStack {
  critical: AttentionItem[];
  active: AttentionItem[];
  queued: AttentionItem[];
  bundled: AttentionBundle[];
  suppressed: AttentionItem[];
  cognitiveLoad: CognitiveLoadState;
}

export interface AttentionBundle {
  key: string;
  label: string;
  items: AttentionItem[];
  combinedUrgency: number;
  suggestedSurface: TargetSurface;
}

export interface CognitiveLoadState {
  level: "calm" | "moderate" | "heavy" | "overloaded";
  score: number;             // 0–100
  activeItems: number;
  pendingDecisions: number;
  lastReset: string;
  throttleActive: boolean;
  maxItemsPerHour: number;
  itemsThisHour: number;
}

export interface SurfaceRoutingDecision {
  itemId: string;
  surface: TargetSurface;
  reason: string;
  alternativeSurfaces: TargetSurface[];
  timing: "immediate" | "next_idle" | "scheduled";
  scheduledFor?: string;
}

// ── Surface Routing Logic ────────────────────────────────────────

function routeToSurface(item: AttentionItem, cogLoad: CognitiveLoadState, activeSurface: string): SurfaceRoutingDecision {
  // Critical → always immediate on current surface
  if (item.priority === "critical") {
    return { itemId: item.id, surface: activeSurface as TargetSurface, reason: "Critical priority", alternativeSurfaces: ["mobile", "watch"], timing: "immediate" };
  }

  // Overloaded → suppress non-high items
  if (cogLoad.level === "overloaded" && item.priority !== "high") {
    return { itemId: item.id, surface: "notification_center", reason: "Cognitive overload — queued", alternativeSurfaces: [], timing: "next_idle" };
  }

  // High urgency financial → desktop or mobile
  if (item.domain === "finance" && item.urgency >= 8) {
    return { itemId: item.id, surface: "desktop", reason: "Financial high-urgency", alternativeSurfaces: ["mobile"], timing: "immediate" };
  }

  // Low priority → bundle to digest
  if (item.priority === "low" || item.priority === "background") {
    return { itemId: item.id, surface: "email_digest", reason: "Low priority — bundled", alternativeSurfaces: ["notification_center"], timing: "scheduled" };
  }

  // Default: notification center, next idle
  return { itemId: item.id, surface: "notification_center", reason: "Default routing", alternativeSurfaces: [activeSurface as TargetSurface], timing: "next_idle" };
}

// ── Service ──────────────────────────────────────────────────────

export class AttentionOSService {
  private items: Map<string, AttentionItem> = new Map();
  private cognitiveLoad: CognitiveLoadState = {
    level: "calm", score: 0, activeItems: 0, pendingDecisions: 0,
    lastReset: new Date().toISOString(), throttleActive: false,
    maxItemsPerHour: 20, itemsThisHour: 0,
  };
  private counter = 0;
  private activeSurface = "desktop";

  // ── Ingestion ──────────────────────────────────────────────

  addItem(input: Omit<AttentionItem, "id" | "createdAt" | "ignoredCount" | "acknowledged" | "action" | "targetSurface">): AttentionItem {
    const id = `attn-${++this.counter}-${Date.now()}`;
    const priority = this.computePriority(input.urgency, input.importance);
    const action = this.computeAction(priority, this.cognitiveLoad);

    const routing = routeToSurface(
      { ...input, id, priority, action, targetSurface: "desktop", createdAt: "", ignoredCount: 0, acknowledged: false } as AttentionItem,
      this.cognitiveLoad,
      this.activeSurface
    );

    const item: AttentionItem = {
      ...input, id, priority, action,
      targetSurface: routing.surface,
      createdAt: new Date().toISOString(),
      ignoredCount: 0, acknowledged: false,
    };

    this.items.set(id, item);
    this.cognitiveLoad.itemsThisHour++;
    this.cognitiveLoad.activeItems = [...this.items.values()].filter(i => !i.acknowledged && i.action !== "suppress").length;
    this.recalculateCognitiveLoad();
    this._persist();
    return item;
  }

  // ── Stack Queries ──────────────────────────────────────────

  getAttentionStack(): AttentionStack {
    const all = [...this.items.values()].filter(i => !i.acknowledged);
    const now = new Date().toISOString();

    const critical = all.filter(i => i.priority === "critical" && i.action !== "suppress");
    const active = all.filter(i => i.action === "surface_now" && i.priority !== "critical");
    const queued = all.filter(i => i.action === "queue" || i.action === "defer");
    const suppressed = all.filter(i => i.action === "suppress" || (i.suppressedUntil && i.suppressedUntil > now));

    // Bundle items by key
    const bundleMap = new Map<string, AttentionItem[]>();
    for (const item of all.filter(i => i.bundleKey && i.action === "bundle")) {
      const list = bundleMap.get(item.bundleKey!) ?? [];
      list.push(item);
      bundleMap.set(item.bundleKey!, list);
    }

    const bundled: AttentionBundle[] = [...bundleMap.entries()].map(([key, items]) => ({
      key, label: key.replace(/-/g, " "),
      items, combinedUrgency: Math.max(...items.map(i => i.urgency)),
      suggestedSurface: items[0].targetSurface,
    }));

    return { critical, active, queued, bundled, suppressed, cognitiveLoad: { ...this.cognitiveLoad } };
  }

  // ── Actions ────────────────────────────────────────────────

  acknowledge(itemId: string): void {
    const item = this.items.get(itemId);
    if (item) { item.acknowledged = true; this.recalculateCognitiveLoad(); this._persist(); }
  }

  suppress(itemId: string, reason: string, untilDate?: string): void {
    const item = this.items.get(itemId);
    if (item) {
      item.action = "suppress";
      item.suppressedUntil = untilDate ?? new Date(Date.now() + 3600_000).toISOString();
      item.metadata.suppressReason = reason;
      this._persist();
    }
  }

  escalate(itemId: string): void {
    const item = this.items.get(itemId);
    if (item) {
      item.priority = "critical";
      item.action = "surface_now";
      item.targetSurface = this.activeSurface as TargetSurface;
      this._persist();
    }
  }

  markIgnored(itemId: string): void {
    const item = this.items.get(itemId);
    if (item) { item.ignoredCount++; if (item.ignoredCount >= 3) { item.action = "suppress"; } this._persist(); }
  }

  setActiveSurface(surface: string): void { this.activeSurface = surface; }

  routeItem(itemId: string): SurfaceRoutingDecision | null {
    const item = this.items.get(itemId);
    if (!item) return null;
    return routeToSurface(item, this.cognitiveLoad, this.activeSurface);
  }

  // ── Cognitive Load ─────────────────────────────────────────

  private recalculateCognitiveLoad(): void {
    const active = [...this.items.values()].filter(i => !i.acknowledged && i.action !== "suppress");
    const decisions = active.filter(i => i.priority === "high" || i.priority === "critical");
    this.cognitiveLoad.activeItems = active.length;
    this.cognitiveLoad.pendingDecisions = decisions.length;

    const score = Math.min(100, active.length * 5 + decisions.length * 15);
    this.cognitiveLoad.score = score;
    this.cognitiveLoad.level = score < 25 ? "calm" : score < 50 ? "moderate" : score < 75 ? "heavy" : "overloaded";
    this.cognitiveLoad.throttleActive = score >= 75;
  }

  getCognitiveLoad(): CognitiveLoadState { return { ...this.cognitiveLoad }; }

  // ── Priority Computation ───────────────────────────────────

  private computePriority(urgency: number, importance: number): AttentionPriority {
    const score = (urgency * 0.6) + (importance * 0.4);
    if (score >= 9) return "critical";
    if (score >= 7) return "high";
    if (score >= 4) return "medium";
    if (score >= 2) return "low";
    return "background";
  }

  private computeAction(priority: AttentionPriority, cogLoad: CognitiveLoadState): AttentionAction {
    if (priority === "critical") return "surface_now";
    if (cogLoad.throttleActive && priority !== "high") return "queue";
    if (priority === "high") return "surface_now";
    if (priority === "medium") return cogLoad.level === "calm" ? "surface_now" : "queue";
    return "bundle";
  }

  // ── Stats ──────────────────────────────────────────────────

  getStats(): { total: number; byPriority: Record<string, number>; bySurface: Record<string, number>; acknowledged: number; suppressed: number } {
    const all = [...this.items.values()];
    const byP: Record<string, number> = {};
    const byS: Record<string, number> = {};
    for (const i of all) { byP[i.priority] = (byP[i.priority] ?? 0) + 1; byS[i.targetSurface] = (byS[i.targetSurface] ?? 0) + 1; }
    return { total: all.length, byPriority: byP, bySurface: byS, acknowledged: all.filter(i => i.acknowledged).length, suppressed: all.filter(i => i.action === "suppress").length };
  }

  // ── Persistence ────────────────────────────────────────────

  private _persist = () => debouncedSaveServiceState("attention-os", this.serialize());
  serialize(): Record<string, unknown> { return { items: Array.from(this.items.entries()), cognitiveLoad: this.cognitiveLoad, counter: this.counter }; }
  hydrate(state: Record<string, unknown>): void {
    if (!state) return;
    if (state.items) this.items = new Map(state.items as [string, AttentionItem][]);
    if (state.cognitiveLoad) this.cognitiveLoad = state.cognitiveLoad as CognitiveLoadState;
    if (state.counter) this.counter = state.counter as number;
  }
  async loadPersistedState(): Promise<void> { const s = await loadServiceState("attention-os"); if (s) this.hydrate(s as Record<string, unknown>); }
}

export const createAttentionOS = () => new AttentionOSService();
