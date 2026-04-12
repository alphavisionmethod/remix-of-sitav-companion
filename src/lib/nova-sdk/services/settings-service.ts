// ═══════════════════════════════════════════════════════════════
// Nova SDK — Settings Service
// Typed, observable, layered system configuration
// ═══════════════════════════════════════════════════════════════

import type { SystemService, ServiceStatus } from "./service-manager";
import { NovaEvents } from "../input/events";

export type SettingsLayer = "default" | "system" | "user" | "runtime";

export interface SettingsSchema {
  // Appearance
  "appearance.theme": "light" | "dark" | "auto";
  "appearance.accentColor": string;
  "appearance.reduceMotion": boolean;
  "appearance.reduceTransparency": boolean;
  "appearance.fontSize": "small" | "medium" | "large";
  "appearance.wallpaper": string;

  // Display
  "display.resolution": string;
  "display.scaling": number;
  "display.nightShift": boolean;
  "display.nightShiftIntensity": number;
  "display.brightness": number;

  // Sound
  "sound.volume": number;
  "sound.mute": boolean;
  "sound.alertVolume": number;
  "sound.alertSound": string;
  "sound.uiSounds": boolean;

  // Input
  "input.keyRepeatDelay": number;
  "input.keyRepeatRate": number;
  "input.trackpadSpeed": number;
  "input.naturalScrolling": boolean;
  "input.tapToClick": boolean;

  // Privacy
  "privacy.analytics": boolean;
  "privacy.crashReports": boolean;
  "privacy.locationServices": boolean;

  // Network
  "network.wifi.autoJoin": boolean;
  "network.dns": string;
  "network.proxy": string;

  // Notifications
  "notifications.doNotDisturb": boolean;
  "notifications.showPreviews": boolean;
  "notifications.badges": boolean;

  // Bluetooth
  "bluetooth.enabled": boolean;

  // Input (extra)
  "input.autocorrect": boolean;

  // Accessibility
  "accessibility.voiceOver": boolean;
  "accessibility.zoom": boolean;
  "accessibility.zoomLevel": number;
  "accessibility.stickyKeys": boolean;
  "accessibility.highContrast": boolean;
  "accessibility.cursorSize": "normal" | "large" | "xlarge";
  "accessibility.boldText": boolean;
  "accessibility.reduceAutoPlayEffects": boolean;
  "accessibility.fullKeyboardNav": boolean;
  "accessibility.focusIndicators": boolean;
  "accessibility.screenReaderOptimized": boolean;
  "accessibility.announcementVerbosity": "minimal" | "standard" | "verbose";
  "accessibility.textSize": number;

  // Dynamic app keys
  [key: `apps.${string}`]: unknown;
}

type SettingsKey = keyof SettingsSchema | `apps.${string}`;
type SettingsCallback = (key: string, value: unknown, layer: SettingsLayer) => void;

interface SettingsConstraint {
  min?: number;
  max?: number;
  enum?: unknown[];
  dependsOn?: { key: string; value: unknown; effect: Partial<Record<string, unknown>> };
}

const DB_NAME = "nova-settings";
const STORE_NAME = "user-settings";
const SCHEMA_VERSION = 1;

class SettingsServiceClass implements SystemService {
  id = "SettingsService";
  status: ServiceStatus = "stopped";

  private layers: Record<SettingsLayer, Map<string, unknown>> = {
    default: new Map(),
    system: new Map(),
    user: new Map(),
    runtime: new Map(),
  };

  private subscribers = new Map<string, Set<SettingsCallback>>();
  private globalSubscribers = new Set<SettingsCallback>();
  private constraints = new Map<string, SettingsConstraint>();
  private schemaVersion = SCHEMA_VERSION;

  boot(): void {
    this.status = "starting";
    this.initDefaults();
    this.initConstraints();
    this.loadFromStorage();
    this.status = "running";
  }

  shutdown(): void {
    this.persistToStorage();
    this.status = "stopped";
  }

  // ── Get / Set ──

  get<K extends SettingsKey>(key: K): SettingsSchema[K] | undefined {
    // Runtime overrides user overrides system overrides default
    for (const layer of ["runtime", "user", "system", "default"] as SettingsLayer[]) {
      if (this.layers[layer].has(key)) return this.layers[layer].get(key) as SettingsSchema[K];
    }
    return undefined;
  }

  set<K extends SettingsKey>(key: K, value: SettingsSchema[K], layer: SettingsLayer = "user"): boolean {
    // Validate
    const constraint = this.constraints.get(key);
    if (constraint) {
      if (constraint.enum && !constraint.enum.includes(value)) return false;
      if (typeof value === "number") {
        if (constraint.min !== undefined && value < constraint.min) return false;
        if (constraint.max !== undefined && value > constraint.max) return false;
      }
    }

    this.layers[layer].set(key, value);
    this.notifySubscribers(key, value, layer);

    // Apply dependency effects
    if (constraint?.dependsOn) {
      const depValue = this.get(constraint.dependsOn.key as SettingsKey);
      if (depValue === constraint.dependsOn.value) {
        for (const [k, v] of Object.entries(constraint.dependsOn.effect)) {
          this.set(k as SettingsKey, v as any, layer);
        }
      }
    }

    // Persist user layer
    if (layer === "user") this.persistToStorage();

    NovaEvents.emit("app:state-change", { event: "settings:changed", key, value, layer });
    return true;
  }

  delete(key: SettingsKey, layer: SettingsLayer = "user"): void {
    this.layers[layer].delete(key);
    const newValue = this.get(key);
    this.notifySubscribers(key, newValue, layer);
    if (layer === "user") this.persistToStorage();
  }

  // ── Subscribe ──

  subscribe(key: SettingsKey, callback: SettingsCallback): () => void {
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(callback);
    return () => this.subscribers.get(key)?.delete(callback);
  }

  subscribeAll(callback: SettingsCallback): () => void {
    this.globalSubscribers.add(callback);
    return () => this.globalSubscribers.delete(callback);
  }

  // ── Namespace ──

  getNamespace(prefix: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const layer of ["default", "system", "user", "runtime"] as SettingsLayer[]) {
      for (const [key, value] of this.layers[layer]) {
        if (key.startsWith(prefix)) result[key] = value;
      }
    }
    return result;
  }

  // ── Import / Export ──

  exportSettings(): string {
    const data: Record<string, unknown> = {};
    for (const [key, value] of this.layers.user) data[key] = value;
    return JSON.stringify({ version: this.schemaVersion, settings: data }, null, 2);
  }

  importSettings(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.settings) return false;
      for (const [key, value] of Object.entries(parsed.settings)) {
        this.set(key as SettingsKey, value as any, "user");
      }
      return true;
    } catch {
      return false;
    }
  }

  // ── Stats ──

  getStats() {
    return {
      defaultCount: this.layers.default.size,
      systemCount: this.layers.system.size,
      userCount: this.layers.user.size,
      runtimeCount: this.layers.runtime.size,
      subscriberCount: this.subscribers.size + this.globalSubscribers.size,
      constraintCount: this.constraints.size,
      schemaVersion: this.schemaVersion,
    };
  }

  getDiagnostics() {
    return {
      ...this.getStats(),
      userOverrides: Object.fromEntries(this.layers.user),
      runtimeOverrides: Object.fromEntries(this.layers.runtime),
    };
  }

  reset(): void {
    for (const layer of Object.values(this.layers)) layer.clear();
    this.subscribers.clear();
    this.globalSubscribers.clear();
    this.constraints.clear();
    this.status = "stopped";
  }

  // ── Private ──

  private initDefaults(): void {
    const d = this.layers.default;
    // Appearance
    d.set("appearance.theme", "dark");
    d.set("appearance.accentColor", "hsl(265, 55%, 58%)");
    d.set("appearance.reduceMotion", false);
    d.set("appearance.reduceTransparency", false);
    d.set("appearance.fontSize", "medium");
    d.set("appearance.wallpaper", "default");
    // Display
    d.set("display.resolution", "1440x900");
    d.set("display.scaling", 1);
    d.set("display.nightShift", false);
    d.set("display.nightShiftIntensity", 0.5);
    d.set("display.brightness", 0.8);
    // Sound
    d.set("sound.volume", 0.7);
    d.set("sound.mute", false);
    d.set("sound.alertVolume", 0.8);
    d.set("sound.alertSound", "default");
    d.set("sound.uiSounds", true);
    // Input
    d.set("input.keyRepeatDelay", 250);
    d.set("input.keyRepeatRate", 30);
    d.set("input.trackpadSpeed", 1);
    d.set("input.naturalScrolling", true);
    d.set("input.tapToClick", true);
    // Privacy
    d.set("privacy.analytics", false);
    d.set("privacy.crashReports", true);
    d.set("privacy.locationServices", false);
    // Network
    d.set("network.wifi.autoJoin", true);
    d.set("network.dns", "auto");
    d.set("network.proxy", "none");
    // Notifications
    d.set("notifications.doNotDisturb", false);
    d.set("notifications.showPreviews", true);
    d.set("notifications.badges", true);
    // Bluetooth
    d.set("bluetooth.enabled", true);
    // Input (extra)
    d.set("input.autocorrect", true);
    // Accessibility
    d.set("accessibility.voiceOver", false);
    d.set("accessibility.zoom", false);
    d.set("accessibility.zoomLevel", 1);
    d.set("accessibility.stickyKeys", false);
    d.set("accessibility.highContrast", false);
    d.set("accessibility.cursorSize", "normal");
    d.set("accessibility.boldText", false);
    d.set("accessibility.reduceAutoPlayEffects", false);
    d.set("accessibility.fullKeyboardNav", true);
    d.set("accessibility.focusIndicators", true);
    d.set("accessibility.screenReaderOptimized", false);
    d.set("accessibility.announcementVerbosity", "standard");
    d.set("accessibility.textSize", 100);
  }

  private initConstraints(): void {
    this.constraints.set("sound.volume", { min: 0, max: 1 });
    this.constraints.set("sound.alertVolume", { min: 0, max: 1 });
    this.constraints.set("display.brightness", { min: 0, max: 1 });
    this.constraints.set("display.scaling", { min: 0.5, max: 3 });
    this.constraints.set("display.nightShiftIntensity", { min: 0, max: 1 });
    this.constraints.set("input.keyRepeatDelay", { min: 50, max: 1000 });
    this.constraints.set("input.keyRepeatRate", { min: 1, max: 120 });
    this.constraints.set("input.trackpadSpeed", { min: 0.1, max: 3 });
    this.constraints.set("accessibility.zoomLevel", { min: 1, max: 10 });
    this.constraints.set("appearance.theme", { enum: ["light", "dark", "auto"] });
    this.constraints.set("appearance.fontSize", { enum: ["small", "medium", "large"] });
    this.constraints.set("accessibility.cursorSize", { enum: ["normal", "large", "xlarge"] });
    this.constraints.set("accessibility.textSize", { min: 75, max: 200 });
    this.constraints.set("accessibility.announcementVerbosity", { enum: ["minimal", "standard", "verbose"] });
    // Dependency: reduce motion → disable spring animations
    this.constraints.set("appearance.reduceMotion", {
      dependsOn: { key: "appearance.reduceMotion", value: true, effect: {} },
    });
  }

  private notifySubscribers(key: string, value: unknown, layer: SettingsLayer): void {
    this.subscribers.get(key)?.forEach(cb => { try { cb(key, value, layer); } catch {} });
    this.globalSubscribers.forEach(cb => { try { cb(key, value, layer); } catch {} });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("nova-settings-user");
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, value] of Object.entries(parsed)) {
          this.layers.user.set(key, value);
        }
      }
    } catch {}
  }

  private persistToStorage(): void {
    try {
      const data = Object.fromEntries(this.layers.user);
      localStorage.setItem("nova-settings-user", JSON.stringify(data));
    } catch {}
  }
}

export const SettingsService = new SettingsServiceClass();
