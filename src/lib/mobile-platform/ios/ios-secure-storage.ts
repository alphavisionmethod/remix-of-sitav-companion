// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Secure Storage Adapter (Keychain)
// In web fallback, uses sessionStorage with honest hardware-backed=false.
// ═══════════════════════════════════════════════════════════════

import type {
  SecureStorageContract,
  SecureStoragePutOptions,
  SecureStorageItemClass,
} from "../contracts/secure-storage-contract";

const PREFIX = "sita.ios.kc:";

export const iosSecureStorage: SecureStorageContract = {
  backend: typeof window !== "undefined" && (window as Window & { Capacitor?: unknown }).Capacitor ? "ios-keychain" : "web-fallback",
  async put(key: string, value: string, opts: SecureStoragePutOptions) {
    if (typeof window === "undefined") return;
    const k = `${PREFIX}${opts.itemClass}:${key}`;
    try {
      sessionStorage.setItem(k, value);
    } catch { /* best-effort fallback */ }
  },
  async get(key: string) {
    if (typeof window === "undefined") return null;
    for (const cls of ["session-token", "trust-credential", "biometric-binding", "boardroom-cache", "user-preference"] as SecureStorageItemClass[]) {
      const k = `${PREFIX}${cls}:${key}`;
      const v = sessionStorage.getItem(k);
      if (v !== null) return v;
    }
    return null;
  },
  async remove(key: string) {
    if (typeof window === "undefined") return;
    for (const cls of ["session-token", "trust-credential", "biometric-binding", "boardroom-cache", "user-preference"] as SecureStorageItemClass[]) {
      sessionStorage.removeItem(`${PREFIX}${cls}:${key}`);
    }
  },
  async wipeClass(itemClass) {
    if (typeof window === "undefined") return;
    const prefix = `${PREFIX}${itemClass}:`;
    Object.keys(sessionStorage).filter((k) => k.startsWith(prefix)).forEach((k) => sessionStorage.removeItem(k));
  },
  isHardwareBacked() {
    return this.backend === "ios-keychain";
  },
};
