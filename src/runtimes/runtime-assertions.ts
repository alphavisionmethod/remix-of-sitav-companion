// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Assertions
// Helpers for capability checks at runtime
// ═══════════════════════════════════════════════════════════════

import { isElectronRuntime } from "./desktop/desktop-runtime-detection";
import { checkDesktopFeature } from "./desktop/desktop-feature-gates";

/** Assert that a capability is available, throw if not */
export function assertCapability(capabilityId: string, message?: string): void {
  const result = checkDesktopFeature(capabilityId);
  if (!result.available) {
    throw new Error(message ?? `Capability "${capabilityId}" is not available in the current runtime`);
  }
}

/** Assert that we are running in Electron */
export function assertElectron(message?: string): void {
  if (!isElectronRuntime()) {
    throw new Error(message ?? "This operation requires the Electron desktop runtime");
  }
}

/** Safely check a capability and return a fallback value */
export function withCapabilityCheck<T>(capabilityId: string, ifAvailable: () => T, fallback: T): T {
  const result = checkDesktopFeature(capabilityId);
  if (result.available) {
    return ifAvailable();
  }
  return fallback;
}

/** Log a warning if a capability is used in an unexpected runtime */
export function warnIfNotAvailable(capabilityId: string): boolean {
  const result = checkDesktopFeature(capabilityId);
  if (!result.available) {
    console.warn(`[SITA Runtime] Capability "${capabilityId}" is not available. Reason: ${result.reason}`);
    return false;
  }
  return true;
}
