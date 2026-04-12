// ═══════════════════════════════════════════════════════════════
// Nova SDK — App Registry
// Central singleton where apps self-register
// ═══════════════════════════════════════════════════════════════

import type { ComponentType } from "react";
import type { AppManifest } from "./manifest";
import { validateManifest } from "./manifest";

export type AppRuntimeState = "registered" | "launching" | "permission-check" | "running" | "focused" | "blurred" | "suspending" | "terminated";

export interface RegisteredApp {
  manifest: AppManifest;
  component: ComponentType<any>;
  state: AppRuntimeState;
  launchedAt?: number;
  focusedAt?: number;
}

class AppRegistryClass {
  private apps = new Map<string, RegisteredApp>();
  private listeners = new Set<() => void>();

  register(manifest: AppManifest, component: ComponentType<any>): void {
    const errors = validateManifest(manifest);
    if (errors.length > 0) {
      console.error(`[NovaSDK] Manifest validation failed for "${manifest.id}":`, errors);
      return;
    }
    this.apps.set(manifest.id, { manifest, component, state: "registered" });
    this.notify();
  }

  unregister(id: string): void {
    this.apps.delete(id);
    this.notify();
  }

  getApp(id: string): RegisteredApp | undefined {
    return this.apps.get(id);
  }

  listApps(): RegisteredApp[] {
    return Array.from(this.apps.values());
  }

  isRegistered(id: string): boolean {
    return this.apps.has(id);
  }

  isRunning(id: string): boolean {
    const app = this.apps.get(id);
    return app?.state === "running" || app?.state === "focused" || app?.state === "blurred";
  }

  setState(id: string, state: AppRuntimeState): void {
    const app = this.apps.get(id);
    if (!app) return;
    app.state = state;
    if (state === "running" || state === "launching") app.launchedAt = Date.now();
    if (state === "focused") app.focusedAt = Date.now();
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }
}

export const AppRegistry = new AppRegistryClass();
