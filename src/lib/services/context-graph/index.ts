// ═══════════════════════════════════════════════════════════════
// SITA OS — Context Graph Aggregator
// Real-time unified context from all OS subsystems
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_KEY = "context-graph";

// ── Types ────────────────────────────────────────────────────────

export type SignalSource =
  | "time" | "device" | "workspace" | "mode" | "attention"
  | "trust" | "battery" | "network" | "location" | "schedule"
  | "cognitive_load" | "activity" | "relationships" | "boundary";

export interface ContextSignal {
  id: string;
  source: SignalSource;
  key: string;
  value: unknown;
  confidence: number;
  freshness: number;       // 0-1, decays over time
  updatedAt: number;
  expiresAt?: number;
}

export interface UnifiedContext {
  // Identity
  userId: string;
  deviceId: string;
  sessionId: string;

  // State
  activeWorkspace: string;
  activeMode: string;
  cognitiveLoad: number;
  trustPosture: string;

  // Environment
  timeOfDay: number;
  dayOfWeek: number;
  batteryLevel: number | null;
  networkType: string;
  isOnline: boolean;

  // Activity
  currentFocus: string;
  activeApps: string[];
  recentActions: string[];
  focusDurationMinutes: number;

  // Signals
  signals: ContextSignal[];
  signalCount: number;
  freshnessScore: number;
  snapshotAt: string;
}

export type ContextSubscriber = (ctx: UnifiedContext) => void;

export interface ContextGraphService {
  getCurrentContext(): UnifiedContext;
  getContextSignals(): ContextSignal[];
  getSignal(source: SignalSource, key: string): ContextSignal | null;
  updateSignal(source: SignalSource, key: string, value: unknown, confidence?: number): void;
  batchUpdateSignals(updates: Array<{ source: SignalSource; key: string; value: unknown; confidence?: number }>): void;
  subscribeToContext(callback: ContextSubscriber): () => void;
  takeSnapshot(): Promise<void>;
  getFreshnessScore(): number;
  loadPersistedState(): Promise<void>;
}

// ── Implementation ───────────────────────────────────────────────

export function createContextGraph(): ContextGraphService {
  const signals = new Map<string, ContextSignal>();
  const subscribers = new Set<ContextSubscriber>();
  let snapshotCounter = 0;

  function signalKey(source: SignalSource, key: string): string {
    return `${source}::${key}`;
  }

  function decayFreshness(signal: ContextSignal): number {
    const ageMs = Date.now() - signal.updatedAt;
    const halfLifeMs = 5 * 60 * 1000; // 5 minutes
    return Math.max(0, Math.exp(-ageMs / halfLifeMs));
  }

  function updateSignal(source: SignalSource, key: string, value: unknown, confidence = 0.8) {
    const sk = signalKey(source, key);
    const existing = signals.get(sk);
    const signal: ContextSignal = {
      id: sk,
      source,
      key,
      value,
      confidence,
      freshness: 1.0,
      updatedAt: Date.now(),
      expiresAt: existing?.expiresAt,
    };
    signals.set(sk, signal);
    notifySubscribers();
  }

  function batchUpdateSignals(updates: Array<{ source: SignalSource; key: string; value: unknown; confidence?: number }>) {
    for (const u of updates) {
      const sk = signalKey(u.source, u.key);
      signals.set(sk, {
        id: sk,
        source: u.source,
        key: u.key,
        value: u.value,
        confidence: u.confidence ?? 0.8,
        freshness: 1.0,
        updatedAt: Date.now(),
      });
    }
    notifySubscribers();
  }

  function getSignal(source: SignalSource, key: string): ContextSignal | null {
    const s = signals.get(signalKey(source, key));
    if (!s) return null;
    return { ...s, freshness: decayFreshness(s) };
  }

  function getContextSignals(): ContextSignal[] {
    return Array.from(signals.values()).map(s => ({ ...s, freshness: decayFreshness(s) }));
  }

  function getFreshnessScore(): number {
    const all = getContextSignals();
    if (all.length === 0) return 0;
    return all.reduce((sum, s) => sum + s.freshness, 0) / all.length;
  }

  function getCurrentContext(): UnifiedContext {
    const now = new Date();
    const allSignals = getContextSignals();

    const getVal = <T>(source: SignalSource, key: string, fallback: T): T => {
      const s = signals.get(signalKey(source, key));
      return s ? (s.value as T) : fallback;
    };

    return {
      userId: getVal("device", "userId", "anonymous"),
      deviceId: getVal("device", "deviceId", "unknown"),
      sessionId: getVal("device", "sessionId", `session_${Date.now()}`),
      activeWorkspace: getVal("workspace", "active", "default"),
      activeMode: getVal("mode", "current", "standard"),
      cognitiveLoad: getVal("cognitive_load", "score", 0),
      trustPosture: getVal("trust", "posture", "normal"),
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      batteryLevel: getVal("battery", "level", null),
      networkType: getVal("network", "type", "unknown"),
      isOnline: getVal("network", "online", true),
      currentFocus: getVal("activity", "currentFocus", "none"),
      activeApps: getVal("activity", "activeApps", []),
      recentActions: getVal("activity", "recentActions", []),
      focusDurationMinutes: getVal("activity", "focusDuration", 0),
      signals: allSignals,
      signalCount: allSignals.length,
      freshnessScore: getFreshnessScore(),
      snapshotAt: now.toISOString(),
    };
  }

  function subscribeToContext(callback: ContextSubscriber): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  function notifySubscribers() {
    if (subscribers.size === 0) return;
    const ctx = getCurrentContext();
    for (const cb of subscribers) {
      try { cb(ctx); } catch { /* subscriber error */ }
    }
  }

  async function takeSnapshot() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ctx = getCurrentContext();
    snapshotCounter++;

    await fromDynamicTable("context_graph_snapshots").insert({
      user_id: user.id,
      snapshot_type: snapshotCounter % 10 === 0 ? "periodic" : "event",
      context_data: {
        workspace: ctx.activeWorkspace,
        mode: ctx.activeMode,
        cognitiveLoad: ctx.cognitiveLoad,
        focus: ctx.currentFocus,
        apps: ctx.activeApps,
        trust: ctx.trustPosture,
      },
      active_signals: ctx.signals.map(s => s.id),
      freshness_score: ctx.freshnessScore,
      workspace_id: ctx.activeWorkspace,
      device_id: ctx.deviceId,
      cognitive_load: ctx.cognitiveLoad,
      active_mode: ctx.activeMode,
      signal_count: ctx.signalCount,
    });

    debouncedSaveServiceState(SERVICE_KEY, {
      signalCache: Object.fromEntries(signals),
      snapshotCounter,
    });
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.signalCache) {
      for (const [k, v] of Object.entries(saved.signalCache)) {
        signals.set(k, v as ContextSignal);
      }
      snapshotCounter = Number(saved.snapshotCounter ?? 0);
    }

    // Seed time signals
    const now = new Date();
    updateSignal("time", "hour", now.getHours());
    updateSignal("time", "dayOfWeek", now.getDay());
    updateSignal("time", "period", now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening");
    updateSignal("network", "online", navigator.onLine);
  }

  return {
    getCurrentContext, getContextSignals, getSignal, updateSignal,
    batchUpdateSignals, subscribeToContext, takeSnapshot,
    getFreshnessScore, loadPersistedState,
  };
}
