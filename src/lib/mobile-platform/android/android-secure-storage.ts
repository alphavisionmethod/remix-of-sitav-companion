// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Secure Storage Adapter (Keystore)
// ═══════════════════════════════════════════════════════════════

import type {
  SecureStorageContract,
  SecureStoragePutOptions,
  SecureStorageItemClass,
} from "../contracts/secure-storage-contract";

const PREFIX = "sita.android.ks:";

export const androidSecureStorage: SecureStorageContract = {
  backend: typeof window !== "undefined" && (window as Window & { Capacitor?: unknown }).Capacitor ? "android-keystore" : "web-fallback",
  async put(key: string, value: string, opts: SecureStoragePutOptions) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(`${PREFIX}${opts.itemClass}:${key}`, value);
    } catch { /* best-effort */ }
  },
  async get(key: string) {
    if (typeof window === "undefined") return null;
    for (const cls of ["session-token", "trust-credential", "biometric-binding", "boardroom-cache", "user-preference"] as SecureStorageItemClass[]) {
      const v = sessionStorage.getItem(`${PREFIX}${cls}:${key}`);
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
    return this.backend === "android-keystore";
  },
};
