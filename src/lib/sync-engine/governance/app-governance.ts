// ═══════════════════════════════════════════════════════════════
// SITA OS — App-Level Sync Governance
// Per-app quotas, namespace limits, allowlists, policy matrix
// ═══════════════════════════════════════════════════════════════

import type { EncryptionClass } from "../sync-object-model";
import type { ConflictStrategy } from "../sync-namespaces";

// ─── Types ────────────────────────────────────────────────────

export interface AppSyncPolicy {
  appId: string;
  displayName: string;
  maxStorageBytes: number;
  usedStorageBytes: number;
  maxNamespaces: number;
  maxObjectsPerNamespace: number;
  backgroundSyncBudgetMs: number;
  backgroundSyncUsedMs: number;
  requiredEncryptionClass: EncryptionClass;
  mergeStrategy: ConflictStrategy;
  allowedNamespaceSuffixes: string[];
  status: "active" | "suspended" | "blocked" | "review";
  createdAt: string;
  updatedAt: string;
}

export interface SelectiveSyncRule {
  id: string;
  namespace: string;
  deviceClass: "phone" | "tablet" | "desktop" | "web" | "all";
  networkType: "any" | "wifi-only" | "unmetered-only";
  batteryMin: number; // 0-100
  trustLevel: "any" | "trusted" | "managed";
  accountType: "any" | "personal" | "work" | "guest";
  enabled: boolean;
  description: string;
}

export interface AppAllowlist {
  mode: "allowlist" | "blocklist" | "open";
  apps: Array<{ appId: string; status: "allowed" | "blocked" | "review"; reason?: string }>;
  defaultAction: "allow" | "block" | "review";
}

export interface SettingSyncCategory {
  key: string;
  label: string;
  syncMode: "always-sync" | "ask-user" | "device-specific" | "work-only" | "non-syncable" | "encrypted-only";
  examples: string[];
}

export interface GovernanceReport {
  totalApps: number;
  activeApps: number;
  suspendedApps: number;
  totalStorageUsed: number;
  totalStorageAllocated: number;
  overBudgetApps: string[];
  selectiveRules: number;
  allowlistMode: string;
}

// ─── App Governance Engine ────────────────────────────────────

class AppGovernanceEngine {
  private policies = new Map<string, AppSyncPolicy>();
  private selectiveRules: SelectiveSyncRule[] = [];
  private allowlist: AppAllowlist = { mode: "open", apps: [], defaultAction: "allow" };
  private settingCategories: SettingSyncCategory[] = [];

  constructor() {
    this.initDefaultSettingCategories();
    this.initDefaultSelectiveRules();
  }

  // ─── App Policies ──────────────────────────────────

  registerApp(appId: string, displayName: string, opts: Partial<AppSyncPolicy> = {}): AppSyncPolicy {
    // Check allowlist
    if (!this.isAppAllowed(appId)) {
      const policy: AppSyncPolicy = {
        appId, displayName,
        maxStorageBytes: 0, usedStorageBytes: 0,
        maxNamespaces: 0, maxObjectsPerNamespace: 0,
        backgroundSyncBudgetMs: 0, backgroundSyncUsedMs: 0,
        requiredEncryptionClass: "standard",
        mergeStrategy: "last-write-wins",
        allowedNamespaceSuffixes: [],
        status: "blocked",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.policies.set(appId, policy);
      return policy;
    }

    const policy: AppSyncPolicy = {
      appId, displayName,
      maxStorageBytes: opts.maxStorageBytes ?? 52428800, // 50MB default
      usedStorageBytes: opts.usedStorageBytes ?? 0,
      maxNamespaces: opts.maxNamespaces ?? 5,
      maxObjectsPerNamespace: opts.maxObjectsPerNamespace ?? 1000,
      backgroundSyncBudgetMs: opts.backgroundSyncBudgetMs ?? 30000,
      backgroundSyncUsedMs: opts.backgroundSyncUsedMs ?? 0,
      requiredEncryptionClass: opts.requiredEncryptionClass ?? "encrypted-at-rest",
      mergeStrategy: opts.mergeStrategy ?? "last-write-wins",
      allowedNamespaceSuffixes: opts.allowedNamespaceSuffixes ?? ["state", "settings", "data"],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.policies.set(appId, policy);
    return policy;
  }

  getAppPolicy(appId: string): AppSyncPolicy | null {
    return this.policies.get(appId) ?? null;
  }

  getAllPolicies(): AppSyncPolicy[] {
    return Array.from(this.policies.values());
  }

  suspendApp(appId: string, reason?: string): void {
    const policy = this.policies.get(appId);
    if (policy) {
      policy.status = "suspended";
      policy.updatedAt = new Date().toISOString();
    }
  }

  reinstateApp(appId: string): void {
    const policy = this.policies.get(appId);
    if (policy && policy.status === "suspended") {
      policy.status = "active";
      policy.updatedAt = new Date().toISOString();
    }
  }

  checkAppBudget(appId: string, deltaBytes: number): { allowed: boolean; reason?: string } {
    const policy = this.policies.get(appId);
    if (!policy) return { allowed: false, reason: "App not registered" };
    if (policy.status !== "active") return { allowed: false, reason: `App is ${policy.status}` };
    if (policy.usedStorageBytes + deltaBytes > policy.maxStorageBytes) {
      return { allowed: false, reason: `Would exceed app quota (${Math.round(policy.usedStorageBytes / policy.maxStorageBytes * 100)}% used)` };
    }
    return { allowed: true };
  }

  recordAppUsage(appId: string, deltaBytes: number, syncTimeMs = 0): void {
    const policy = this.policies.get(appId);
    if (policy) {
      policy.usedStorageBytes = Math.max(0, policy.usedStorageBytes + deltaBytes);
      policy.backgroundSyncUsedMs += syncTimeMs;
      policy.updatedAt = new Date().toISOString();
    }
  }

  // ─── Selective Sync Rules ─────────────────────────

  addSelectiveRule(rule: Omit<SelectiveSyncRule, "id">): SelectiveSyncRule {
    const full: SelectiveSyncRule = { ...rule, id: `ssr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this.selectiveRules.push(full);
    return full;
  }

  removeSelectiveRule(ruleId: string): void {
    this.selectiveRules = this.selectiveRules.filter(r => r.id !== ruleId);
  }

  getSelectiveRules(): SelectiveSyncRule[] {
    return [...this.selectiveRules];
  }

  evaluateSync(namespace: string, deviceClass: string, networkType: string, batteryLevel: number, trustLevel: string, accountType: string): { allowed: boolean; reason?: string } {
    for (const rule of this.selectiveRules) {
      if (!rule.enabled) continue;
      if (rule.namespace !== namespace && rule.namespace !== "*") continue;
      if (rule.deviceClass !== "all" && rule.deviceClass !== deviceClass) continue;

      // Check conditions
      if (rule.networkType === "wifi-only" && networkType !== "wifi") {
        return { allowed: false, reason: `${namespace} requires WiFi` };
      }
      if (rule.networkType === "unmetered-only" && networkType === "cellular") {
        return { allowed: false, reason: `${namespace} blocked on metered network` };
      }
      if (batteryLevel < rule.batteryMin) {
        return { allowed: false, reason: `Battery too low for ${namespace} sync (${batteryLevel}% < ${rule.batteryMin}%)` };
      }
      if (rule.trustLevel !== "any" && trustLevel !== rule.trustLevel) {
        return { allowed: false, reason: `Device trust level insufficient for ${namespace}` };
      }
    }
    return { allowed: true };
  }

  // ─── Allowlist ─────────────────────────────────────

  setAllowlistMode(mode: AppAllowlist["mode"]): void {
    this.allowlist.mode = mode;
  }

  addToAllowlist(appId: string, status: "allowed" | "blocked" | "review", reason?: string): void {
    const existing = this.allowlist.apps.find(a => a.appId === appId);
    if (existing) {
      existing.status = status;
      existing.reason = reason;
    } else {
      this.allowlist.apps.push({ appId, status, reason });
    }
  }

  isAppAllowed(appId: string): boolean {
    if (this.allowlist.mode === "open") return true;
    const entry = this.allowlist.apps.find(a => a.appId === appId);
    if (this.allowlist.mode === "allowlist") return entry?.status === "allowed";
    if (this.allowlist.mode === "blocklist") return entry?.status !== "blocked";
    return this.allowlist.defaultAction === "allow";
  }

  getAllowlist(): AppAllowlist {
    return { ...this.allowlist, apps: [...this.allowlist.apps] };
  }

  // ─── Setting Categories ────────────────────────────

  getSettingCategories(): SettingSyncCategory[] {
    return [...this.settingCategories];
  }

  updateSettingCategory(key: string, syncMode: SettingSyncCategory["syncMode"]): void {
    const cat = this.settingCategories.find(c => c.key === key);
    if (cat) cat.syncMode = syncMode;
  }

  // ─── Reports ───────────────────────────────────────

  getGovernanceReport(): GovernanceReport {
    const all = this.getAllPolicies();
    return {
      totalApps: all.length,
      activeApps: all.filter(p => p.status === "active").length,
      suspendedApps: all.filter(p => p.status === "suspended").length,
      totalStorageUsed: all.reduce((s, p) => s + p.usedStorageBytes, 0),
      totalStorageAllocated: all.reduce((s, p) => s + p.maxStorageBytes, 0),
      overBudgetApps: all.filter(p => p.usedStorageBytes > p.maxStorageBytes * 0.9).map(p => p.appId),
      selectiveRules: this.selectiveRules.length,
      allowlistMode: this.allowlist.mode,
    };
  }

  // ─── Internal ──────────────────────────────────────

  private initDefaultSettingCategories(): void {
    this.settingCategories = [
      { key: "theme", label: "Theme & Appearance", syncMode: "always-sync", examples: ["Dark mode", "Accent color", "Font size"] },
      { key: "display", label: "Display Resolution", syncMode: "device-specific", examples: ["Screen resolution", "Scale factor", "Refresh rate"] },
      { key: "wifi", label: "Wi-Fi Passwords", syncMode: "encrypted-only", examples: ["Saved networks", "WPA keys"] },
      { key: "bluetooth", label: "Bluetooth Pairings", syncMode: "device-specific", examples: ["Paired devices", "Audio profiles"] },
      { key: "notifications", label: "Notification Volume", syncMode: "device-specific", examples: ["Ring volume", "Vibration pattern", "DND schedule"] },
      { key: "accessibility", label: "Accessibility", syncMode: "always-sync", examples: ["Screen reader", "High contrast", "Reduced motion"] },
      { key: "keyboard", label: "Keyboard & Input", syncMode: "always-sync", examples: ["Shortcuts", "Text replacement", "Dictionary"] },
      { key: "privacy", label: "Privacy Settings", syncMode: "ask-user", examples: ["Location services", "Camera permissions", "Tracking"] },
      { key: "work-profile", label: "Work Profile", syncMode: "work-only", examples: ["VPN config", "Email accounts", "Managed apps"] },
    ];
  }

  private initDefaultSelectiveRules(): void {
    this.selectiveRules = [
      { id: "r1", namespace: "files.photos", deviceClass: "phone", networkType: "wifi-only", batteryMin: 20, trustLevel: "any", accountType: "any", enabled: true, description: "Photos sync only on WiFi for phones" },
      { id: "r2", namespace: "files.videos", deviceClass: "all", networkType: "wifi-only", batteryMin: 30, trustLevel: "any", accountType: "any", enabled: true, description: "Videos sync only on WiFi" },
      { id: "r3", namespace: "session.desktop", deviceClass: "phone", networkType: "any", batteryMin: 0, trustLevel: "trusted", accountType: "any", enabled: true, description: "Session sync requires trusted device" },
      { id: "r4", namespace: "files.documents", deviceClass: "web", networkType: "any", batteryMin: 0, trustLevel: "any", accountType: "any", enabled: false, description: "Work files not on personal web" },
    ];
  }
}

export const appGovernance = new AppGovernanceEngine();
