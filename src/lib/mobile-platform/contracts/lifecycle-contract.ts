// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Lifecycle Contract
// App phase transitions + restore semantics. OS-agnostic surface.
// ═══════════════════════════════════════════════════════════════

import type { MobileLifecyclePhase } from "./mobile-platform-contract";

export interface LifecycleTransition {
  from: MobileLifecyclePhase;
  to: MobileLifecyclePhase;
  timestamp: string;
  reason?: string;
}

export interface LifecycleSnapshot {
  phase: MobileLifecyclePhase;
  enteredAt: string;
  /** Wall-clock seconds since cold-start. */
  uptimeSeconds: number;
  /** Whether the OS has indicated low memory / process pressure. */
  underMemoryPressure: boolean;
  /** Whether the OS has indicated low battery. */
  lowPower: boolean;
}

export type LifecycleListener = (transition: LifecycleTransition) => void;
