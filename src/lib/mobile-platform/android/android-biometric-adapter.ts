// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Biometric Adapter (BiometricPrompt)
// ═══════════════════════════════════════════════════════════════

import type {
  BiometricContract,
  BiometricPromptRequest,
  BiometricPromptResult,
  BiometricAvailability,
  BiometricKind,
} from "../contracts/biometric-contract";

export const androidBiometricAdapter: BiometricContract = {
  async availability(): Promise<BiometricAvailability> {
    if (typeof window === "undefined") return "hardware-missing";
    if (!window.PublicKeyCredential) return "hardware-missing";
    try {
      const supported = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
      return supported ? "available" : "not-enrolled";
    } catch {
      return "hardware-missing";
    }
  },
  async enrolledKinds(): Promise<ReadonlyArray<BiometricKind>> {
    return ["fingerprint"];
  },
  async prompt(req: BiometricPromptRequest): Promise<BiometricPromptResult> {
    const ok = window.confirm(`SITA: ${req.reason}`);
    return {
      success: ok,
      kind: ok ? "fingerprint" : null,
      authToken: ok ? `android-bio-${Date.now()}` : undefined,
      failureReason: ok ? undefined : "user-cancelled",
    };
  },
};
