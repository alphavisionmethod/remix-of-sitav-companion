// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Lifecycle Adapter
// Mirrors iOS adapter shape — process lifecycle observers.
// ═══════════════════════════════════════════════════════════════

import type { LifecycleListener, LifecycleSnapshot } from "../contracts/lifecycle-contract";
import type { MobileLifecyclePhase } from "../contracts/mobile-platform-contract";

const COLD_START_AT = typeof performance !== "undefined" ? performance.now() : Date.now();
let currentPhase: MobileLifecyclePhase = "cold-start";
const listeners = new Set<LifecycleListener>();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const to: MobileLifecyclePhase = document.hidden ? "background" : "foreground";
    const transition = { from: currentPhase, to, timestamp: new Date().toISOString(), reason: "visibilitychange" };
    currentPhase = to;
    listeners.forEach((l) => l(transition));
  });
}

export const androidLifecycleAdapter = {
  subscribe(listener: LifecycleListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  snapshot(): LifecycleSnapshot {
    return {
      phase: currentPhase,
      enteredAt: new Date().toISOString(),
      uptimeSeconds: Math.floor(((typeof performance !== "undefined" ? performance.now() : Date.now()) - COLD_START_AT) / 1000),
      underMemoryPressure: false,
      lowPower: false,
    };
  },
};
