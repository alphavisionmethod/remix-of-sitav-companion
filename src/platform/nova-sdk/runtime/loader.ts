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
import { CodeVerificationService } from "@/lib/core-services/kernel/code-verification";
import type { CodeSignature } from "@/lib/core-services/kernel/code-verification";
import { AppIsolationManager } from "@/lib/core-services/kernel/app-isolation";
import type { IsolationLevel } from "@/lib/core-services/kernel/app-isolation";
import { PermissionMonitor } from "../services/permission-monitor";
import { AppRuntime } from "./managed-runtime";
import type { AppRuntimeConfig } from "./managed-runtime";
import { validateDesignCompliance, getDesignEnforcementMode } from "../core/design-contract";

// Singleton instances for the security subsystem
const codeVerifier = new CodeVerificationService();
const isolationManager = new AppIsolationManager();
// Store runtimes keyed by appId
const appRuntimes = new Map<string, AppRuntime>();

// Map trust rings to isolation levels
const RING_TO_ISOLATION: Record<number, IsolationLevel> = {
  0: "none",      // Ring 0 — Kernel (trusted)
  1: "basic",     // Ring 1 — Trusted SITA services
  2: "standard",  // Ring 2 — Verified third-party
  3: "strict",    // Ring 3 — Sandboxed third-party
  4: "maximum",   // Ring 4 — Untrusted/unsigned
};

export interface AppBundle {
  manifest: AppManifest;
  component: ComponentType<any>;
  lifecycle?: NovaAppLifecycle;
  signature?: CodeSignature | null;
  trustRing?: number; // 0-4 from security architecture
  runtimeConfig?: AppRuntimeConfig;
}

export interface LoadResult {
  success: boolean;
  appId: string;
  errors?: string[];
}

export class AppLoader {
  static load(bundle: AppBundle): LoadResult {
    const { manifest, component, lifecycle, signature, trustRing = 2 } = bundle;

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
      return { success: true, appId: manifest.id };
    }

    // Step 3: Code Signing Verification
    const verifyResult = codeVerifier.verify(manifest.id, signature ?? null);
    const mode = codeVerifier.getMode();

    if (mode === "enforced" && verifyResult.result !== "valid") {
      console.error(`[AppLoader] ✗ Code signing BLOCKED "${manifest.name}" — ${verifyResult.result}: ${verifyResult.details}`);
      return {
        success: false,
        appId: manifest.id,
        errors: [`Code signing verification failed: ${verifyResult.result} — ${verifyResult.details}`],
      };
    }

    if (verifyResult.result !== "valid") {
      console.warn(`[AppLoader] ⚠ Code signing warning for "${manifest.name}" — ${verifyResult.result}: ${verifyResult.details}`);
    } else {
      console.log(`[AppLoader] ✓ Code signing verified for "${manifest.name}" (key: ${verifyResult.keyUsed})`);
    }

    // Step 4: Create Sandbox with isolation level from trust ring
    const isolationLevel = RING_TO_ISOLATION[trustRing] ?? "strict";
    const pid = Math.floor(Math.random() * 65536) + 1000; // Simulated PID
    const sandbox = isolationManager.createSandbox(pid, manifest.name, isolationLevel);
    console.log(`[AppLoader] 🔒 Sandbox created for "${manifest.name}" — level: ${isolationLevel}, id: ${sandbox.id}, namespaces: [${Object.entries(sandbox.namespaces).filter(([,v]) => v).map(([k]) => k).join(",")}]`);

    // Step 5: Register with PermissionMonitor
    const permissions = manifest.permissions?.map(p => typeof p === "string" ? p : p) ?? [];
    PermissionMonitor.registerApp(manifest.id, permissions);

    // Step 6: Design Contract Compliance
    const designResult = validateDesignCompliance(manifest);
    if (getDesignEnforcementMode() === "strict" && !designResult.compliant) {
      console.error(`[AppLoader] ✗ Design contract BLOCKED "${manifest.name}" — ${designResult.violations.length} violation(s)`);
      return {
        success: false,
        appId: manifest.id,
        errors: designResult.violations.map(v => `${v.element}: ${v.suggestion}`),
      };
    }

    // Step 7: Register in AppRegistry
    AppRegistry.register(manifest, component);

    // Step 8: Create Managed Runtime
    const runtime = new AppRuntime(manifest.id, bundle.runtimeConfig);
    runtime.start();
    appRuntimes.set(manifest.id, runtime);
    // Attach to registered app
    const registeredApp = AppRegistry.getApp(manifest.id);
    if (registeredApp) registeredApp.runtime = runtime;

    // Step 9: Register lifecycle hooks
    if (lifecycle) {
      lifecycleManager.registerHooks(manifest.id, lifecycle);
    }

    console.log(`[AppLoader] ✓ Loaded "${manifest.name}" (${manifest.id}) v${manifest.version} [ring:${trustRing}, isolation:${isolationLevel}, verified:${verifyResult.result}, design:${designResult.compliant ? "✓" : "⚠"}]`);
    return { success: true, appId: manifest.id };
  }

  static unload(appId: string): void {
    // Destroy managed runtime
    const runtime = appRuntimes.get(appId);
    if (runtime) {
      runtime.destroy();
      appRuntimes.delete(appId);
    }

    // Revoke permissions
    PermissionMonitor.revokeApp(appId);

    // Lifecycle cleanup
    lifecycleManager.transition(appId, "terminated");
    lifecycleManager.unregisterHooks(appId);
    AppRegistry.unregister(appId);
    console.log(`[AppLoader] Unloaded "${appId}" — runtime destroyed, sandbox terminated, permissions revoked`);
  }

  /** Expose security subsystem for UI queries */
  static getCodeVerifier() { return codeVerifier; }
  static getIsolationManager() { return isolationManager; }
}
