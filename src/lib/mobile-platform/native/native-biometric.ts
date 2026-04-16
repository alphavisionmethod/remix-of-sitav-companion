// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Biometric Bridge (Capacitor)
// Targets the @capacitor-community/biometric-auth-native or
// @aparajita/capacitor-biometric-auth plugin when present. Honest
// fallback when no native plugin is installed.
// ═══════════════════════════════════════════════════════════════

import type {
  BiometricAvailability,
  BiometricKind,
  BiometricPromptRequest,
  BiometricPromptResult,
} from "../contracts/biometric-contract";
import { invokeCapacitorPlugin, isCapacitorAvailable } from "./capacitor-bridge";

const PLUGIN = "BiometricAuth";

export const nativeBiometric = {
  isAvailable: () => isCapacitorAvailable(),

  async checkAvailability(): Promise<BiometricAvailability> {
    if (!isCapacitorAvailable()) return "hardware-missing";
    const res = await invokeCapacitorPlugin<{
      isAvailable?: boolean;
      reason?: string;
      biometryType?: number | string;
    }>({ pluginId: PLUGIN, method: "checkBiometry" });
    if (!res) return "hardware-missing";
    if (res.isAvailable) return "available";
    if (res.reason === "biometryNotEnrolled") return "not-enrolled";
    if (res.reason === "biometryLockout") return "lockout";
    return "hardware-missing";
  },

  async enrolledKinds(): Promise<ReadonlyArray<BiometricKind>> {
    if (!isCapacitorAvailable()) return [];
    const res = await invokeCapacitorPlugin<{ biometryType?: string }>({
      pluginId: PLUGIN,
      method: "checkBiometry",
    });
    const t = res?.biometryType;
    if (typeof t !== "string") return ["fingerprint"];
    if (t.toLowerCase().includes("face")) return ["face"];
    if (t.toLowerCase().includes("touch") || t.toLowerCase().includes("finger")) return ["fingerprint"];
    if (t.toLowerCase().includes("iris")) return ["iris"];
    return ["fingerprint"];
  },

  async prompt(req: BiometricPromptRequest): Promise<BiometricPromptResult> {
    if (!isCapacitorAvailable()) {
      return { success: false, kind: null, failureReason: "native-unavailable" };
    }
    const res = await invokeCapacitorPlugin<{ verified?: boolean; error?: string }>({
      pluginId: PLUGIN,
      method: "authenticate",
      options: {
        reason: req.reason,
        allowDeviceCredential: req.allowDevicePasscode ?? false,
        cancelTitle: "Cancel",
      },
    });
    if (!res) {
      return { success: false, kind: null, failureReason: "plugin-missing" };
    }
    if (res.verified) {
      return {
        success: true,
        kind: "face",
        authToken: `bio-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      };
    }
    return { success: false, kind: null, failureReason: res.error ?? "user-cancelled" };
  },
};
