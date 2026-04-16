// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Device Trust
// Soft trust score + attestation hooks. Real attestation arrives
// with the native shell; web fallback returns a transparent score.
// ═══════════════════════════════════════════════════════════════

import type { MobileOS } from "../contracts/mobile-platform-contract";

export interface DeviceTrustSnapshot {
  os: MobileOS | null;
  /** 0..100 — composite score, never lies about its inputs. */
  score: number;
  signals: {
    isPhysicalDevice: boolean;
    hasSecureKeystore: boolean;
    biometricEnrolled: boolean;
    attestationVerified: boolean;
    debuggerAttached: boolean;
    rootedOrJailbroken: boolean;
  };
  capturedAt: string;
}

export function computeDeviceTrust(input: Partial<DeviceTrustSnapshot["signals"]> & { os: MobileOS | null }): DeviceTrustSnapshot {
  const signals: DeviceTrustSnapshot["signals"] = {
    isPhysicalDevice: input.isPhysicalDevice ?? false,
    hasSecureKeystore: input.hasSecureKeystore ?? false,
    biometricEnrolled: input.biometricEnrolled ?? false,
    attestationVerified: input.attestationVerified ?? false,
    debuggerAttached: input.debuggerAttached ?? false,
    rootedOrJailbroken: input.rootedOrJailbroken ?? false,
  };
  let score = 30;
  if (signals.isPhysicalDevice) score += 15;
  if (signals.hasSecureKeystore) score += 20;
  if (signals.biometricEnrolled) score += 15;
  if (signals.attestationVerified) score += 25;
  if (signals.debuggerAttached) score -= 30;
  if (signals.rootedOrJailbroken) score -= 50;
  score = Math.max(0, Math.min(100, score));
  return { os: input.os, score, signals, capturedAt: new Date().toISOString() };
}
