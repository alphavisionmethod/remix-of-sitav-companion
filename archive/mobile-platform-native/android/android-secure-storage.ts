// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Secure Storage Adapter (Keystore)
// Uses Capacitor Preferences when running natively. Web fallback
// uses sessionStorage and reports backend honestly.
// ═══════════════════════════════════════════════════════════════

import type {
  SecureStorageContract,
  SecureStoragePutOptions,
  SecureStorageItemClass,
} from "../contracts/secure-storage-contract";
import { nativeSecureStorage } from "../native/native-secure-storage";

const PREFIX = "sita.android.ks:";
const ITEM_CLASSES: SecureStorageItemClass[] = [
  "session-token",
  "trust-credential",
  "biometric-binding",
  "boardroom-cache",
  "user-preference",
];

function nsKey(itemClass: SecureStorageItemClass, key: string) {
  return `${PREFIX}${itemClass}:${key}`;
}

export const androidSecureStorage: SecureStorageContract = {
  backend: nativeSecureStorage.isAvailable() ? "android-keystore" : "web-fallback",

  async put(key, value, opts: SecureStoragePutOptions) {
    const k = nsKey(opts.itemClass, key);
    if (nativeSecureStorage.isAvailable()) {
      await nativeSecureStorage.set(k, value);
      return;
    }
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(k, value);
    } catch {
      /* best-effort */
    }
  },

  async get(key) {
    if (nativeSecureStorage.isAvailable()) {
      for (const cls of ITEM_CLASSES) {
        const v = await nativeSecureStorage.get(nsKey(cls, key));
        if (v !== null) return v;
      }
      return null;
    }
    if (typeof window === "undefined") return null;
    for (const cls of ITEM_CLASSES) {
      const v = sessionStorage.getItem(nsKey(cls, key));
      if (v !== null) return v;
    }
    return null;
  },

  async remove(key) {
    if (nativeSecureStorage.isAvailable()) {
      for (const cls of ITEM_CLASSES) {
        await nativeSecureStorage.remove(nsKey(cls, key));
      }
      return;
    }
    if (typeof window === "undefined") return;
    for (const cls of ITEM_CLASSES) {
      sessionStorage.removeItem(nsKey(cls, key));
    }
  },

  async wipeClass(itemClass) {
    const prefix = `${PREFIX}${itemClass}:`;
    if (nativeSecureStorage.isAvailable()) return;
    if (typeof window === "undefined") return;
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => sessionStorage.removeItem(k));
  },

  isHardwareBacked() {
    return this.backend === "android-keystore";
  },
};
