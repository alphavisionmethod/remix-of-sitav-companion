// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Deep-Link Adapter (Universal Links + sita://)
// ═══════════════════════════════════════════════════════════════

import type { DeepLinkResolution } from "../contracts/deep-link-contract";
import { resolveDeepLink } from "../navigation/mobile-deep-link-map";

export interface IOSDeepLinkAdapter {
  parse(url: string): DeepLinkResolution | null;
  install(handler: (res: DeepLinkResolution) => void): () => void;
}

export const iosDeepLinkAdapter: IOSDeepLinkAdapter = {
  parse(url: string) {
    return resolveDeepLink(url);
  },
  install(handler) {
    if (typeof window === "undefined") return () => {};
    const onOpen = (e: Event) => {
      const url = (e as CustomEvent<{ url?: string }>).detail?.url;
      if (!url) return;
      const res = resolveDeepLink(url);
      if (res) handler(res);
    };
    window.addEventListener("appUrlOpen", onOpen as EventListener);
    return () => window.removeEventListener("appUrlOpen", onOpen as EventListener);
  },
};
