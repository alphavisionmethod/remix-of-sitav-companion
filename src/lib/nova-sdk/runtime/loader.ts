// ═══════════════════════════════════════════════════════════════
// Nova SDK — App Loader
// Validates manifests, checks permissions, registers, launches
// ═══════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import type { AppManifest } from "../core/manifest";
import { validateManifest } from "../core/manifest";
import { AppRegistry } from "../core/registry";
import { lifecycleManager } from "./lifecycle";
import type { NovaAppLifecycle } from "./lifecycle";

export interface AppBundle {
  manifest: AppManifest;
  component: ComponentType<any>;
  lifecycle?: NovaAppLifecycle;
}

export interface LoadResult {
  success: boolean;
  appId: string;
  errors?: string[];
}

export class AppLoader {
  static load(bundle: AppBundle): LoadResult {
    const { manifest, component, lifecycle } = bundle;

    // Step 1: Validate manifest
    const errors = validateManifest(manifest);
    if (errors.length > 0) {
      return {
        success: false,
        appId: manifest.id ?? "unknown",
        errors: errors.map(e => `${e.field}: ${e.message}`),
      };
    }

    // Step 2: Check if already registered
    if (AppRegistry.isRegistered(manifest.id)) {
      // Already loaded — just return success
      return { success: true, appId: manifest.id };
    }

    // Step 3: Register
    AppRegistry.register(manifest, component);

    // Step 4: Register lifecycle hooks
    if (lifecycle) {
      lifecycleManager.registerHooks(manifest.id, lifecycle);
    }

    console.log(`[AppLoader] Loaded "${manifest.name}" (${manifest.id}) v${manifest.version}`);
    return { success: true, appId: manifest.id };
  }

  static unload(appId: string): void {
    lifecycleManager.transition(appId, "terminated");
    lifecycleManager.unregisterHooks(appId);
    AppRegistry.unregister(appId);
    console.log(`[AppLoader] Unloaded "${appId}"`);
  }
}
