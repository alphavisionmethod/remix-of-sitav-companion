// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Biometric Adapter (BiometricPrompt)
// Uses Capacitor BiometricAuth plugin when present; WebAuthn probe
// in web fallback; honest "not available" otherwise.
// ═══════════════════════════════════════════════════════════════

import type {
  BiometricContract,
  BiometricPromptRequest,
  BiometricPromptResult,
  BiometricAvailability,
  BiometricKind,
} from "../contracts/biometric-contract";
import { nativeBiometric } from "../native/native-biometric";

export const androidBiometricAdapter: BiometricContract = {
  async availability(): Promise<BiometricAvailability> {
    if (nativeBiometric.isAvailable()) {
      return nativeBiometric.checkAvailability();
    }
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
    if (nativeBiometric.isAvailable()) {
      return nativeBiometric.enrolledKinds();
    }
    return ["fingerprint"];
  },

  async prompt(req: BiometricPromptRequest): Promise<BiometricPromptResult> {
    if (nativeBiometric.isAvailable()) {
      return nativeBiometric.prompt(req);
    }
    return { success: false, kind: null, failureReason: "native-unavailable" };
  },
};
