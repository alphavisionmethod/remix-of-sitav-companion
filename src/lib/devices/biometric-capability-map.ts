// ═══════════════════════════════════════════════════════════════
// SITA OS — Biometric Capability Map
// Per-device-class biometric truth
// References: BiometricCapability from desktop-host-runtime.ts
// ═══════════════════════════════════════════════════════════════

import type { DeviceFormFactor } from "./device-identity-registry";

// ── Types ────────────────────────────────────────────────────

export type BiometricMethod = "fingerprint" | "face" | "iris" | "pin" | "voice" | "pattern";
export type BiometricAvailability = "native" | "webauthn" | "unavailable";

export interface BiometricMethodEntry {
  method: BiometricMethod;
  availability: BiometricAvailability;
  enrollmentDetectable: boolean;
  fallbackChain: BiometricMethod[];
  stepUpAuthTriggers: string[];
  description: string;
}

export interface DeviceBiometricProfile {
  formFactor: DeviceFormFactor;
  methods: BiometricMethodEntry[];
  supportsPasskeys: boolean;
  supportsWebAuthn: boolean;
  primaryMethod: BiometricMethod | null;
  fallbackToPassword: boolean;
}

// ── Map ──────────────────────────────────────────────────────

export const BIOMETRIC_CAPABILITY_MAP: Record<DeviceFormFactor, DeviceBiometricProfile> = {
  "desktop-workstation": {
    formFactor: "desktop-workstation",
    methods: [
      { method: "fingerprint", availability: "native", enrollmentDetectable: true, fallbackChain: ["pin"], stepUpAuthTriggers: ["financial-op", "admin-action", "key-export"], description: "Windows Hello fingerprint" },
      { method: "face", availability: "native", enrollmentDetectable: true, fallbackChain: ["fingerprint", "pin"], stepUpAuthTriggers: ["financial-op", "admin-action"], description: "Windows Hello IR camera" },
      { method: "pin", availability: "native", enrollmentDetectable: true, fallbackChain: [], stepUpAuthTriggers: [], description: "Windows Hello PIN" },
    ],
    supportsPasskeys: true,
    supportsWebAuthn: true,
    primaryMethod: "fingerprint",
    fallbackToPassword: true,
  },
  laptop: {
    formFactor: "laptop",
    methods: [
      { method: "fingerprint", availability: "native", enrollmentDetectable: true, fallbackChain: ["pin"], stepUpAuthTriggers: ["financial-op", "admin-action", "key-export"], description: "Touch ID / Windows Hello fingerprint" },
      { method: "face", availability: "native", enrollmentDetectable: true, fallbackChain: ["fingerprint", "pin"], stepUpAuthTriggers: ["financial-op", "admin-action"], description: "Face ID / Windows Hello IR" },
      { method: "pin", availability: "native", enrollmentDetectable: true, fallbackChain: [], stepUpAuthTriggers: [], description: "System PIN" },
    ],
    supportsPasskeys: true,
    supportsWebAuthn: true,
    primaryMethod: "fingerprint",
    fallbackToPassword: true,
  },
  smartphone: {
    formFactor: "smartphone",
    methods: [
      { method: "face", availability: "native", enrollmentDetectable: true, fallbackChain: ["fingerprint", "pin"], stepUpAuthTriggers: ["financial-op", "approval", "delete-data"], description: "Face ID (iOS) / Face Unlock (Android)" },
      { method: "fingerprint", availability: "native", enrollmentDetectable: true, fallbackChain: ["pin"], stepUpAuthTriggers: ["financial-op", "approval"], description: "Touch ID / In-display fingerprint" },
      { method: "pin", availability: "native", enrollmentDetectable: true, fallbackChain: [], stepUpAuthTriggers: [], description: "Device PIN/passcode" },
      { method: "pattern", availability: "native", enrollmentDetectable: false, fallbackChain: ["pin"], stepUpAuthTriggers: [], description: "Android pattern lock" },
    ],
    supportsPasskeys: true,
    supportsWebAuthn: true,
    primaryMethod: "face",
    fallbackToPassword: true,
  },
  tablet: {
    formFactor: "tablet",
    methods: [
      { method: "face", availability: "native", enrollmentDetectable: true, fallbackChain: ["fingerprint", "pin"], stepUpAuthTriggers: ["financial-op", "approval"], description: "Face ID (iPad)" },
      { method: "fingerprint", availability: "native", enrollmentDetectable: true, fallbackChain: ["pin"], stepUpAuthTriggers: ["financial-op"], description: "Touch ID" },
      { method: "pin", availability: "native", enrollmentDetectable: true, fallbackChain: [], stepUpAuthTriggers: [], description: "Device PIN" },
    ],
    supportsPasskeys: true,
    supportsWebAuthn: true,
    primaryMethod: "face",
    fallbackToPassword: true,
  },
  "server-appliance": {
    formFactor: "server-appliance",
    methods: [],
    supportsPasskeys: false,
    supportsWebAuthn: false,
    primaryMethod: null,
    fallbackToPassword: false,
  },
  kiosk: {
    formFactor: "kiosk",
    methods: [
      { method: "pin", availability: "native", enrollmentDetectable: false, fallbackChain: [], stepUpAuthTriggers: [], description: "Kiosk PIN entry" },
    ],
    supportsPasskeys: false,
    supportsWebAuthn: false,
    primaryMethod: "pin",
    fallbackToPassword: true,
  },
  embedded: {
    formFactor: "embedded",
    methods: [],
    supportsPasskeys: false,
    supportsWebAuthn: false,
    primaryMethod: null,
    fallbackToPassword: false,
  },
  unknown: {
    formFactor: "unknown",
    methods: [
      { method: "pin", availability: "webauthn", enrollmentDetectable: false, fallbackChain: [], stepUpAuthTriggers: [], description: "Generic PIN" },
    ],
    supportsPasskeys: false,
    supportsWebAuthn: true,
    primaryMethod: "pin",
    fallbackToPassword: true,
  },
};

// ── Queries ──────────────────────────────────────────────────

export function getBiometricProfile(formFactor: DeviceFormFactor): DeviceBiometricProfile {
  return BIOMETRIC_CAPABILITY_MAP[formFactor];
}

export function getPrimaryBiometric(formFactor: DeviceFormFactor): BiometricMethod | null {
  return BIOMETRIC_CAPABILITY_MAP[formFactor].primaryMethod;
}

export function getAvailableBiometrics(formFactor: DeviceFormFactor): BiometricMethodEntry[] {
  return BIOMETRIC_CAPABILITY_MAP[formFactor].methods.filter(m => m.availability !== "unavailable");
}

export function supportsBiometric(formFactor: DeviceFormFactor, method: BiometricMethod): boolean {
  return BIOMETRIC_CAPABILITY_MAP[formFactor].methods.some(m => m.method === method && m.availability !== "unavailable");
}
