// ═══════════════════════════════════════════════════════════════
// SITA OS — App Lifecycle Manager
// Canonical orchestrator for all app state transitions.
// Validates transitions via the state machine, delegates to
// existing services, and emits lifecycle receipts.
// ═══════════════════════════════════════════════════════════════

import { validateTransition, getNextStates, type AppLifecycleState, type LifecycleTransitionDef } from "./app-lifecycle-state-machine";
import { recordAppCrash, getRecoveryOffer, acceptAppRecovery, declineAppRecovery } from "./app-recovery-manager";
import { installService } from "@/lib/services/app-store/install.service";
import { catalogService } from "@/lib/services/app-store/catalog.service";
import { updateService } from "@/lib/services/app-store/update.service";
import { performFullCleanup } from "./app-uninstall-cleanup";
import { badgeToTier, type TrustTier } from "./app-trust-tier-policy";
import type { TrustBadge } from "./trust";

// ── Lifecycle receipt ─────────────────────────────────────────

export interface LifecycleReceipt {
  id: string;
  appId: string;
  from: AppLifecycleState;
  to: AppLifecycleState;
  timestamp: string;
  actor: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

const RECEIPT_KEY = "sita-lifecycle-receipts";
const MAX_RECEIPTS = 500;

function loadReceipts(): LifecycleReceipt[] {
  try {
    const raw = localStorage.getItem(RECEIPT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveReceipt(receipt: LifecycleReceipt): void {
  try {
    const receipts = loadReceipts();
    receipts.push(receipt);
    // Keep only the most recent MAX_RECEIPTS
    const trimmed = receipts.length > MAX_RECEIPTS ? receipts.slice(-MAX_RECEIPTS) : receipts;
    localStorage.setItem(RECEIPT_KEY, JSON.stringify(trimmed));
  } catch { /* quota exceeded */ }
}

// ── In-memory runtime state ───────────────────────────────────

const _runtimeStates = new Map<string, AppLifecycleState>();

function getRuntimeState(appId: string): AppLifecycleState {
  return _runtimeStates.get(appId) ?? "DISCOVERED";
}

function setRuntimeState(appId: string, state: AppLifecycleState): void {
  _runtimeStates.set(appId, state);
}

// ── Receipt emission ──────────────────────────────────────────

function emitReceipt(
  appId: string,
  from: AppLifecycleState,
  to: AppLifecycleState,
  actor: string,
  success: boolean,
  error?: string,
  metadata?: Record<string, unknown>,
): LifecycleReceipt {
  const receipt: LifecycleReceipt = {
    id: `lcr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appId,
    from,
    to,
    timestamp: new Date().toISOString(),
    actor,
    success,
    error,
    metadata,
  };
  saveReceipt(receipt);
  return receipt;
}

// ── Transition executor ───────────────────────────────────────

function executeTransition(
  appId: string,
  to: AppLifecycleState,
  actor: string,
  metadata?: Record<string, unknown>,
): { transition: LifecycleTransitionDef; receipt: LifecycleReceipt } {
  const from = getRuntimeState(appId);
  const transition = validateTransition(from, to);
  setRuntimeState(appId, to);
  const receipt = transition.receiptRequired
    ? emitReceipt(appId, from, to, actor, true, undefined, metadata)
    : emitReceipt(appId, from, to, actor, true, undefined, metadata);
  return { transition, receipt };
}

// ── Public API ────────────────────────────────────────────────

export const appLifecycleManager = {
  /** Discover an app from the catalog. */
  async discoverApp(appId: string) {
    const apps = await catalogService.list({ search: appId, limit: 10 });
    const app = apps.find(a => a.app_id === appId);
    if (!app) throw new Error(`App not found in catalog: ${appId}`);
    setRuntimeState(appId, "AVAILABLE");
    return app;
  },

  /** Install an app — delegates to installService. */
  async installApp(appId: string, actor: string, sourceChannel = "store") {
    executeTransition(appId, "INSTALL_PENDING", actor);
    executeTransition(appId, "INSTALLING", actor);
    try {
      const result = await installService.install(appId, sourceChannel);
      executeTransition(appId, "INSTALLED", actor, { sourceChannel });
      return result;
    } catch (err) {
      const from = getRuntimeState(appId);
      setRuntimeState(appId, "ERROR");
      emitReceipt(appId, from, "ERROR", actor, false, String(err));
      throw err;
    }
  },

  /** Launch an app. */
  launchApp(appId: string, actor: string) {
    executeTransition(appId, "LAUNCH_PENDING", actor);
    executeTransition(appId, "RUNNING", actor);
  },

  /** Focus a running app. */
  focusApp(appId: string) {
    const state = getRuntimeState(appId);
    if (state === "RUNNING" || state === "BACKGROUNDED") {
      setRuntimeState(appId, "FOCUSED");
    }
  },

  /** Background a running/focused app. */
  backgroundApp(appId: string) {
    const state = getRuntimeState(appId);
    if (state === "RUNNING" || state === "FOCUSED") {
      setRuntimeState(appId, "BACKGROUNDED");
    }
  },

  /** Suspend an app — saves state snapshot. */
  suspendApp(appId: string) {
    const state = getRuntimeState(appId);
    if (state === "RUNNING" || state === "FOCUSED" || state === "BACKGROUNDED") {
      setRuntimeState(appId, "SUSPENDED");
    }
  },

  /** Resume a suspended app. */
  resumeApp(appId: string) {
    if (getRuntimeState(appId) === "SUSPENDED") {
      setRuntimeState(appId, "RUNNING");
    }
  },

  /** Record a crash and transition to CRASHED state. */
  detectCrash(appId: string, error?: string, stateSnapshot?: Record<string, unknown>) {
    const prev = getRuntimeState(appId);
    setRuntimeState(appId, "CRASHED");
    recordAppCrash(appId, error, stateSnapshot);
    emitReceipt(appId, prev, "CRASHED", "system", true, error);
  },

  /** Attempt crash recovery. */
  recoverApp(appId: string, actor: string) {
    const offer = getRecoveryOffer(appId);
    if (!offer || !offer.canRestore) {
      setRuntimeState(appId, "ERROR");
      emitReceipt(appId, "CRASHED", "ERROR", actor, false, "Recovery not available or max restarts exceeded");
      return null;
    }
    setRuntimeState(appId, "RECOVERING");
    const snapshot = acceptAppRecovery(appId);
    setRuntimeState(appId, "RUNNING");
    emitReceipt(appId, "RECOVERING", "RUNNING", actor, true, undefined, { restored: !!snapshot });
    return snapshot;
  },

  /** Check for available updates. */
  async checkForUpdate(appId: string) {
    const updates = await updateService.check();
    const update = updates.find(u => u.app_id === appId);
    if (update && getRuntimeState(appId) === "INSTALLED") {
      setRuntimeState(appId, "UPDATE_AVAILABLE");
    }
    return update ?? null;
  },

  /** Remove an app — delegates to installService + cleanup. */
  async removeApp(appId: string, actor: string, trustBadge: TrustBadge = "unverified") {
    executeTransition(appId, "REMOVAL_PENDING", actor);
    executeTransition(appId, "REMOVING", actor);
    try {
      await installService.uninstall(appId);
      const tier = badgeToTier(trustBadge);
      const cleanup = performFullCleanup(appId, tier);
      setRuntimeState(appId, "REMOVED");
      emitReceipt(appId, "REMOVING", "REMOVED", actor, true, undefined, { cleanup });
      return cleanup;
    } catch (err) {
      setRuntimeState(appId, "ERROR");
      emitReceipt(appId, "REMOVING", "ERROR", actor, false, String(err));
      throw err;
    }
  },

  /** Get lifecycle status for an app. */
  getLifecycleStatus(appId: string): { state: AppLifecycleState; nextStates: AppLifecycleState[] } {
    const state = getRuntimeState(appId);
    return { state, nextStates: getNextStates(state) };
  },

  /** Get all lifecycle receipts for an app. */
  getReceipts(appId?: string): LifecycleReceipt[] {
    const all = loadReceipts();
    return appId ? all.filter(r => r.appId === appId) : all;
  },

  /** Initialize runtime state from persisted install records. */
  initializeFromInstalled(appId: string, installStatus: string) {
    const stateMap: Record<string, AppLifecycleState> = {
      installed: "INSTALLED",
      installing: "INSTALLING",
      updating: "UPDATING",
      update_available: "UPDATE_AVAILABLE",
      uninstalling: "REMOVING",
      blocked: "ERROR",
      crashed: "CRASHED",
      recovering: "RECOVERING",
      not_installed: "DISCOVERED",
    };
    setRuntimeState(appId, stateMap[installStatus] ?? "DISCOVERED");
  },
};