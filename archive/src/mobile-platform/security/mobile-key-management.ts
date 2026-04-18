// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Key Management
// Stable handle layer above the secure storage adapter.
// ═══════════════════════════════════════════════════════════════

export interface MobileKeyHandle {
  keyId: string;
  itemClass: "trust-credential" | "biometric-binding" | "session-token";
  createdAt: string;
  rotatedAt: string | null;
  /** Whether the key requires biometric unlock to use. */
  biometricGated: boolean;
}

export interface KeyRotationEvent {
  keyId: string;
  reason: "scheduled" | "compromise" | "user-requested";
  rotatedAt: string;
}

const KEYS = new Map<string, MobileKeyHandle>();

export function registerKey(handle: Omit<MobileKeyHandle, "createdAt" | "rotatedAt">): MobileKeyHandle {
  const full: MobileKeyHandle = { ...handle, createdAt: new Date().toISOString(), rotatedAt: null };
  KEYS.set(full.keyId, full);
  return full;
}

export function listKeys(): ReadonlyArray<MobileKeyHandle> {
  return Array.from(KEYS.values());
}

export function rotateKey(keyId: string, reason: KeyRotationEvent["reason"]): KeyRotationEvent {
  const k = KEYS.get(keyId);
  if (!k) throw new Error(`Unknown key: ${keyId}`);
  k.rotatedAt = new Date().toISOString();
  return { keyId, reason, rotatedAt: k.rotatedAt };
}
