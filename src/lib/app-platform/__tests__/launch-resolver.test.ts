import { describe, it, expect } from "vitest";
import { resolveLaunch } from "@/lib/app-platform/launch-resolver";
import type { AppManifest } from "@/lib/app-platform/manifest-schema";
import type { RuntimeCapabilities } from "@/lib/app-platform/runtime";

const baseRuntime: RuntimeCapabilities = {
  isElectron: false,
  isPwa: false,
  isMobile: false,
  isOnline: true,
  hasServiceWorker: true,
  hasNotifications: true,
  hasNativeAppsBridge: false,
  platform: "web",
  surface: "desktop",
};

const baseManifest: AppManifest = {
  app_id: "test-app", slug: "test-app", name: "Test",
  app_type: "internal", launch_strategy: "internal_route",
  launch_target: { route: "/test" },
  tags: [], screenshots: [], permissions_required: [],
  supported_surfaces: ["desktop"], installability: "preinstalled",
  verification_status: "verified", trust_level: "first_party",
  version: "1.0.0", latest_version: "1.0.0", update_channel: "stable",
  enabled: true, featured: false, pinned_default: false, sort_order: 0,
  requires_auth: true, requires_shell: true, offline_support: "none",
  window_defaults: {}, manifest_json: {},
};

describe("launch-resolver", () => {
  it("blocks internal app when not authenticated", () => {
    const r = resolveLaunch(baseManifest, { runtime: baseRuntime, isAuthenticated: false });
    expect(r.kind).toBe("blocked");
  });

  it("resolves internal route when authenticated", () => {
    const r = resolveLaunch(baseManifest, { runtime: baseRuntime, isAuthenticated: true });
    expect(r.kind).toBe("internal_route");
    expect(r.route).toBe("/test");
  });

  it("degrades native_binary in browser with fallback url", () => {
    const m: AppManifest = {
      ...baseManifest,
      app_type: "external_desktop", launch_strategy: "native_binary",
      installability: "preinstalled",
      launch_target: { darwin: "/Applications/X.app", fallback_url: "https://x.com" },
    };
    const r = resolveLaunch(m, { runtime: baseRuntime, isAuthenticated: true });
    expect(r.kind).toBe("blocked");
    expect(r.suggestedAction?.url).toBe("https://x.com");
    expect(r.requiresDesktop).toBe(true);
  });

  it("launches native binary in electron with bridge", () => {
    const m: AppManifest = {
      ...baseManifest,
      app_type: "external_desktop", launch_strategy: "native_binary",
      installability: "preinstalled",
      launch_target: { darwin: "/Applications/X.app" },
    };
    const r = resolveLaunch(m, {
      runtime: { ...baseRuntime, isElectron: true, hasNativeAppsBridge: true, surface: "electron" },
      isAuthenticated: true,
    });
    expect(r.kind).toBe("native_binary");
  });

  it("falls back PWA to embedded webview in browser", () => {
    const m: AppManifest = {
      ...baseManifest,
      app_type: "pwa", launch_strategy: "pwa_window",
      installability: "installable",
      launch_target: { url: "https://linear.app" },
    };
    const r = resolveLaunch(m, {
      runtime: baseRuntime, isAuthenticated: true,
      installed: { app_id: "test", install_status: "installed", enabled: true, pinned: false, favorite: false, pinned_order: 0, launch_count: 0, last_launched_at: null, version_installed: "1.0.0" },
    });
    expect(r.kind).toBe("embedded_webview");
    expect(r.url).toBe("https://linear.app");
  });
});
