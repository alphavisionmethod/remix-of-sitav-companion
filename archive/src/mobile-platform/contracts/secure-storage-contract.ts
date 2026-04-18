// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Secure Storage Contract
// Encrypted, biometric-gated key-value store. Web fallback is honest.
// ═══════════════════════════════════════════════════════════════

export type SecureStorageBackend = "ios-keychain" | "android-keystore" | "web-fallback";

export type SecureStorageItemClass =
  | "session-token"        // refresh-token, opaque server session
  | "trust-credential"     // device-trust private key handle
  | "biometric-binding"    // biometric-unlocked secret
  | "boardroom-cache"      // sensitive boardroom snapshot
  | "user-preference";     // non-sensitive but partitioned

export interface SecureStoragePutOptions {
  itemClass: SecureStorageItemClass;
  /** When true, OS unlocks the item only via biometric prompt. */
  requireBiometric?: boolean;
  /** When true, item is wiped on app uninstall (default). */
  invalidateOnUninstall?: boolean;
  /** When true, item is shareable across an app group / shared user id. */
  shareAcrossDevices?: boolean;
}

export interface SecureStorageContract {
  backend: SecureStorageBackend;
  put(key: string, value: string, opts: SecureStoragePutOptions): Promise<void>;
  get(key: string): Promise<string | null>;
  remove(key: string): Promise<void>;
  /** Wipe all items in a given itemClass (e.g. on logout). */
  wipeClass(itemClass: SecureStorageItemClass): Promise<void>;
  /** True only when the backend can prove hardware-backed isolation. */
  isHardwareBacked(): boolean;
}
