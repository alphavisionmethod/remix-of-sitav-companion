// ═══════════════════════════════════════════════════════════════
// launch.service — resolve + execute app launch
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { resolveLaunch, type LaunchInstruction } from "@/lib/app-platform/launch-resolver";
import { probeRuntime } from "@/lib/app-platform/runtime";
import type { CatalogApp } from "./catalog.service";
import type { InstalledAppRow } from "./install.service";
import type { AppManifest } from "@/lib/app-platform/manifest-schema";

const sb = () => supabase as unknown as { functions: any };

function catalogToManifest(app: CatalogApp): AppManifest {
  return {
    app_id: app.app_id,
    slug: app.slug,
    name: app.name,
    short_name: app.short_name ?? undefined,
    description: app.description ?? undefined,
    publisher: app.publisher ?? undefined,
    app_type: app.app_type,
    launch_strategy: app.launch_strategy as AppManifest["launch_strategy"],
    launch_target: app.launch_target as AppManifest["launch_target"],
    category: app.category ?? undefined,
    tags: app.tags,
    icon_url: app.icon_url ?? undefined,
    banner_url: app.banner_url ?? undefined,
    screenshots: app.screenshots,
    permissions_required: app.permissions_required as AppManifest["permissions_required"],
    supported_surfaces: app.supported_surfaces as AppManifest["supported_surfaces"],
    installability: app.installability,
    verification_status: app.verification_status,
    trust_level: app.trust_level,
    version: app.version,
    latest_version: app.latest_version,
    update_channel: app.update_channel,
    enabled: app.enabled,
    featured: app.featured,
    pinned_default: app.pinned_default,
    sort_order: app.sort_order,
    requires_auth: app.requires_auth,
    requires_shell: app.requires_shell,
    offline_support: app.offline_support,
    window_defaults: app.window_defaults,
    manifest_json: app.manifest_json,
  };
}

export const launchService = {
  resolveClient(
    app: CatalogApp,
    isAuthenticated: boolean,
    installed?: InstalledAppRow,
  ): LaunchInstruction {
    return resolveLaunch(catalogToManifest(app), {
      runtime: probeRuntime(),
      isAuthenticated,
      installed: installed
        ? {
            app_id: installed.app_id,
            install_status: installed.install_status,
            enabled: installed.enabled,
            pinned: installed.pinned,
            favorite: installed.favorite,
            pinned_order: installed.pinned_order,
            launch_count: installed.launch_count,
            last_launched_at: installed.last_launched_at,
            version_installed: installed.version_installed,
          }
        : undefined,
    });
  },

  /** Logs a launch event server-side and returns latest authoritative state. */
  async recordLaunch(opts: {
    appId: string;
    surface?: string;
    launchResult?: "success" | "degraded" | "failed" | "cancelled";
    context?: Record<string, unknown>;
  }) {
    const { data, error } = await sb().functions.invoke("app-launch-resolve", {
      body: {
        app_id: opts.appId,
        surface: opts.surface ?? "desktop",
        launch_result: opts.launchResult ?? "success",
        launch_context: opts.context ?? {},
      },
    });
    if (error) throw error;
    return data;
  },

  /** Execute the resolved launch instruction in the browser. */
  async execute(instruction: LaunchInstruction): Promise<{ ok: boolean; reason?: string }> {
    if (instruction.kind === "blocked") {
      return { ok: false, reason: instruction.degradedReason };
    }

    if (instruction.kind === "internal_route") {
      if (instruction.route) {
        window.dispatchEvent(
          new CustomEvent("sita-navigate", { detail: { route: instruction.route } }),
        );
      }
      return { ok: true };
    }

    if (instruction.kind === "external_browser" && instruction.url) {
      window.open(instruction.url, "_blank", "noopener,noreferrer");
      return { ok: true };
    }

    if (instruction.kind === "embedded_webview" && instruction.url) {
      window.dispatchEvent(
        new CustomEvent("sita-open-webview", {
          detail: {
            appId: instruction.appId,
            url: instruction.url,
            window: instruction.window,
          },
        }),
      );
      return { ok: true };
    }

    if (instruction.kind === "pwa_window" && instruction.url) {
      const features = instruction.window
        ? `width=${instruction.window.width ?? 1100},height=${instruction.window.height ?? 760},menubar=no,toolbar=no`
        : "menubar=no,toolbar=no";
      window.open(instruction.url, instruction.appId, features);
      return { ok: true };
    }

    if (instruction.kind === "native_binary") {
      const bridge = window.sitaApps;
      if (!bridge?.launchNativeApp) {
        return { ok: false, reason: "Native launch unavailable in this host." };
      }
      const r = await bridge.launchNativeApp(instruction.appId);
      return { ok: !!r?.ok, reason: r?.reason };
    }

    if (instruction.kind === "deep_link" && instruction.url) {
      window.location.href = instruction.url;
      return { ok: true };
    }

    return { ok: false, reason: "Unknown launch kind." };
  },
};
