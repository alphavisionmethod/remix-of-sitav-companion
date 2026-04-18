// ═══════════════════════════════════════════════════════════════
// Nova SDK — Plugin Registry
// Runtime extension system for apps and the OS shell
// ═══════════════════════════════════════════════════════════════

import type { NovaPermissionId } from "../core/manifest";

export type TrustLevel = "system" | "verified" | "community" | "unknown";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  targetApp: string | "system";
  extensionPoints: string[];
  permissions: NovaPermissionId[];
  trustLevel: TrustLevel;
  icon?: string;
}

export interface ExtensionPoint {
  id: string;
  description: string;
  schema?: Record<string, unknown>;
  ownerApp: string;
}

export interface PluginLifecycle {
  onInstall?: () => void | Promise<void>;
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}

export type ExtensionHandler = (context: Record<string, unknown>) => unknown;

export interface InstalledPlugin {
  manifest: PluginManifest;
  enabled: boolean;
  lifecycle: PluginLifecycle;
  handlers: Map<string, ExtensionHandler>;
  installedAt: number;
}

class PluginRegistryClass {
  private plugins = new Map<string, InstalledPlugin>();
  private extensionPoints = new Map<string, ExtensionPoint>();

  registerExtensionPoint(point: ExtensionPoint): void {
    this.extensionPoints.set(point.id, point);
  }

  getExtensionPoint(id: string): ExtensionPoint | undefined {
    return this.extensionPoints.get(id);
  }

  getAllExtensionPoints(): ExtensionPoint[] {
    return Array.from(this.extensionPoints.values());
  }

  async registerPlugin(
    manifest: PluginManifest,
    handlers: Record<string, ExtensionHandler>,
    lifecycle: PluginLifecycle = {},
  ): Promise<void> {
    // Validate extension points exist
    for (const ep of manifest.extensionPoints) {
      if (!this.extensionPoints.has(ep)) {
        console.warn(`[PluginRegistry] Extension point "${ep}" not registered — plugin "${manifest.id}" may not fully activate`);
      }
    }

    const handlerMap = new Map(Object.entries(handlers));
    const plugin: InstalledPlugin = {
      manifest,
      enabled: false,
      lifecycle,
      handlers: handlerMap,
      installedAt: Date.now(),
    };

    this.plugins.set(manifest.id, plugin);
    await lifecycle.onInstall?.();
  }

  async enablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin || plugin.enabled) return false;
    plugin.enabled = true;
    await plugin.lifecycle.onActivate?.();
    return true;
  }

  async disablePlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin || !plugin.enabled) return false;
    plugin.enabled = false;
    await plugin.lifecycle.onDeactivate?.();
    return true;
  }

  async uninstallPlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    if (plugin.enabled) await this.disablePlugin(id);
    await plugin.lifecycle.onUninstall?.();
    this.plugins.delete(id);
    return true;
  }

  getExtensions(pointId: string): { pluginId: string; handler: ExtensionHandler }[] {
    const results: { pluginId: string; handler: ExtensionHandler }[] = [];
    for (const [, plugin] of this.plugins) {
      if (!plugin.enabled) continue;
      if (!plugin.manifest.extensionPoints.includes(pointId)) continue;
      const handler = plugin.handlers.get(pointId);
      if (handler) results.push({ pluginId: plugin.manifest.id, handler });
    }
    return results;
  }

  getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(id: string): InstalledPlugin | undefined {
    return this.plugins.get(id);
  }

  reset(): void {
    this.plugins.clear();
    this.extensionPoints.clear();
  }

  getStats() {
    const all = this.getInstalledPlugins();
    return {
      total: all.length,
      enabled: all.filter(p => p.enabled).length,
      disabled: all.filter(p => !p.enabled).length,
      extensionPoints: this.extensionPoints.size,
      byTrust: {
        system: all.filter(p => p.manifest.trustLevel === "system").length,
        verified: all.filter(p => p.manifest.trustLevel === "verified").length,
        community: all.filter(p => p.manifest.trustLevel === "community").length,
        unknown: all.filter(p => p.manifest.trustLevel === "unknown").length,
      },
    };
  }
}

export const PluginRegistry = new PluginRegistryClass();
