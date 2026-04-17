import { describe, it, expect } from "vitest";
import { resolveLaunch } from "@/lib/app-platform/launch-resolver";
import type { AppManifest } from "@/lib/app-platform/manifest-schema";

const baseManifest: AppManifest = {
  app_id: "chrome-desktop",
  slug: "chrome-desktop",
  name: "Google Chrome",
  app_type: "external_desktop",
  launch_strategy: "native_binary",
  launch_target: { darwin: "/Applications/Google Chrome.app", fallback_url: "https://www.google.com/chrome/" },
  tags: [],
  screenshots: [],
  permissions_required: [],
  supported_surfaces: ["desktop", "electron"],
  installability: "preinstalled",
  verification_status: "verified",
  trust_level: "trusted",
  version: "1.0.0",
  latest_version: "1.0.0",
  update_channel: "stable",
  enabled: true,
  featured: false,
  pinned_default: false,
  sort_order: 0,
  requires_auth: false,
  requires_shell: true,
  offline_support: "none",
  window_defaults: {},
  manifest_json: {},
};

describe("native apps degraded behavior in browser-only mode", () => {
  it("blocks native_binary when no Electron bridge and offers web fallback", () => {
    const result = resolveLaunch(baseManifest, {
      runtime: {
        isElectron: false, isPwa: false, isMobile: false, isOnline: true,
        hasServiceWorker: false, hasNotifications: false, hasNativeAppsBridge: false,
        platform: "web", surface: "desktop",
      },
      isAuthenticated: true,
    });
    expect(result.kind).toBe("blocked");
    expect(result.requiresDesktop).toBe(true);
    expect(result.suggestedAction?.kind).toBe("external_browser");
    expect(result.suggestedAction?.url).toContain("google.com/chrome");
  });

  it("succeeds with native_binary when Electron bridge present", () => {
    const result = resolveLaunch(baseManifest, {
      runtime: {
        isElectron: true, isPwa: false, isMobile: false, isOnline: true,
        hasServiceWorker: false, hasNotifications: false, hasNativeAppsBridge: true,
        platform: "darwin", surface: "electron",
      },
      isAuthenticated: true,
    });
    expect(result.kind).toBe("native_binary");
    expect(result.appliedStrategy).toBe("native_binary");
  });
});
