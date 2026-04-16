// ═══════════════════════════════════════════════════════════════
// SITA OS — useKillSwitchGate
// Runtime hook + plain helper used by edge functions, services,
// and UI components to honor a kill switch in a uniform way.
//
// Resolution order:
//   1. Optional injected resolver (test/edge-function override)
//   2. Window event-bus snapshot maintained by the admin UI
//   3. Default state declared in the registry
//
// The hook intentionally avoids any direct Supabase coupling so
// the same module is safe to import from edge runtimes (Deno) and
// the browser bundle.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  getKillSwitch,
  KILL_SWITCH_REGISTRY,
} from "./kill-switch-registry";
import { getConsequence } from "./kill-switch-runtime-consequence";
import type { KillSwitchGateResult, KillSwitchState } from "./kill-switch-types";

export type KillSwitchStateResolver = (
  switchId: string,
) => KillSwitchState | Promise<KillSwitchState>;

let injectedResolver: KillSwitchStateResolver | null = null;

/** Inject a resolver (used by edge functions and tests). */
export function setKillSwitchStateResolver(resolver: KillSwitchStateResolver | null): void {
  injectedResolver = resolver;
}

interface KillSwitchSnapshot {
  [switchId: string]: KillSwitchState;
}

const SNAPSHOT_EVENT = "sita:kill-switch-snapshot";

function readSnapshot(): KillSwitchSnapshot {
  if (typeof window === "undefined") return {};
  const raw = (window as unknown as Record<string, unknown>).__SITA_KILL_SWITCHES;
  return (raw && typeof raw === "object" ? raw : {}) as KillSwitchSnapshot;
}

/** Push a fresh snapshot from the admin UI / realtime channel. */
export function publishKillSwitchSnapshot(snapshot: KillSwitchSnapshot): void {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>).__SITA_KILL_SWITCHES = { ...snapshot };
  window.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail: snapshot }));
}

function resolveStateSync(switchId: string): KillSwitchState {
  const snapshot = readSnapshot();
  if (snapshot[switchId]) return snapshot[switchId];
  const entry = getKillSwitch(switchId);
  return entry?.defaultState ?? "disarmed";
}

/** Plain (non-React) gate check usable from edge runtimes. */
export async function checkKillSwitch(
  switchId: string,
): Promise<KillSwitchGateResult> {
  const entry = getKillSwitch(switchId);
  if (!entry) {
    return {
      switchId,
      allowed: true,
      state: "disarmed",
      reason: `Unknown kill switch ${switchId}`,
      consequence: null,
      checkedAt: new Date().toISOString(),
    };
  }
  let state: KillSwitchState;
  if (injectedResolver) {
    state = await injectedResolver(switchId);
  } else {
    state = resolveStateSync(switchId);
  }
  const allowed = state !== "active";
  return {
    switchId,
    allowed,
    state,
    reason: allowed
      ? `Switch ${switchId} is ${state} — proceed`
      : `Switch ${switchId} is active — request refused`,
    consequence: allowed ? null : getConsequence(switchId),
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Edge-function helper: throws a structured error so the function
 * can return a 503 with a negative receipt payload.
 */
export async function checkKillSwitchOrReject(switchId: string): Promise<void> {
  const result = await checkKillSwitch(switchId);
  if (result.allowed) return;
  const err: Error & {
    code?: string;
    switchId?: string;
    consequence?: unknown;
  } = new Error(result.reason);
  err.code = "KILL_SWITCH_ACTIVE";
  err.switchId = switchId;
  err.consequence = result.consequence;
  throw err;
}

/** React hook variant for UI gating. */
export function useKillSwitchGate(switchId: string): KillSwitchGateResult {
  const [result, setResult] = useState<KillSwitchGateResult>(() => ({
    switchId,
    allowed: resolveStateSync(switchId) !== "active",
    state: resolveStateSync(switchId),
    reason: "initial",
    consequence:
      resolveStateSync(switchId) === "active" ? getConsequence(switchId) : null,
    checkedAt: new Date().toISOString(),
  }));

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const next = await checkKillSwitch(switchId);
      if (!cancelled) setResult(next);
    }

    refresh();

    if (typeof window !== "undefined") {
      const handler = () => {
        void refresh();
      };
      window.addEventListener(SNAPSHOT_EVENT, handler);
      return () => {
        cancelled = true;
        window.removeEventListener(SNAPSHOT_EVENT, handler);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [switchId]);

  return result;
}

/** Snapshot helper for diagnostics / admin pages. */
export function snapshotAllKillSwitches(): Record<string, KillSwitchState> {
  const snapshot = readSnapshot();
  const out: Record<string, KillSwitchState> = {};
  for (const ks of KILL_SWITCH_REGISTRY) {
    out[ks.switchId] = snapshot[ks.switchId] ?? ks.defaultState;
  }
  return out;
}
