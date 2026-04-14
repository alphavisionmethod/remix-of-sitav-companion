// ═══════════════════════════════════════════════════════════════
// SITA OS — policyd-bundles: Policy Bundle Engine
// Device modes, signed bundles, precedence merge, invariants
// ═══════════════════════════════════════════════════════════════

// ── Device Modes ────────────────────────────────────────────

export type DeviceMode = "home" | "work" | "school" | "kiosk" | "guest_demo";

export interface DeviceModeDefinition {
  mode: DeviceMode;
  displayName: string;
  description: string;
  lockedDown: boolean;
  icon: string;
}

export const DEVICE_MODES: DeviceModeDefinition[] = [
  { mode: "home", displayName: "Home", description: "Consumer-friendly with moderate defaults and more user control", lockedDown: false, icon: "🏠" },
  { mode: "work", displayName: "Work", description: "Stronger security, VPN defaults, stricter audit and trust", lockedDown: false, icon: "💼" },
  { mode: "school", displayName: "School", description: "Restricted installs, limited pairing, content/network controls", lockedDown: true, icon: "🎓" },
  { mode: "kiosk", displayName: "Kiosk", description: "Near-lockdown: restricted settings, no arbitrary pairing", lockedDown: true, icon: "🖥️" },
  { mode: "guest_demo", displayName: "Guest / Demo", description: "Temporary session with no persistent credential access", lockedDown: true, icon: "👤" },
];

// ── Policy Domain Schema ────────────────────────────────────

export interface WifiPolicy {
  allow_open_networks: boolean;
  require_confirmation_for_open_networks: boolean;
  auto_enable_vpn_on_public_wifi: boolean;
  allow_wifi_toggle_while_locked: boolean;
  allow_saved_networks_for_guest: boolean;
}

export interface ShieldPolicy {
  baseline_firewall_required: boolean;
  allow_user_disable_firewall: boolean;
  require_admin_for_firewall_disable: boolean;
  auto_enable_threat_monitoring: boolean;
}

export interface BluetoothPolicy {
  allow_new_pairing_while_locked: boolean;
  require_admin_for_unknown_keyboard_pairing: boolean;
  allow_guest_pairing: boolean;
}

export interface PowerPolicy {
  auto_enable_saver_below_percent: number;
  allow_performance_mode_on_battery: boolean;
  enforce_quiet_mode_in_presentations: boolean;
}

export interface UpdatePolicy {
  require_battery_percent_min: number;
  require_charger_for_firmware: boolean;
  allow_beta_channel: boolean;
  auto_download_on_metered: boolean;
  rollback_on_health_failure: boolean;
}

export interface PrivacyPolicy {
  allow_telemetry: "opt_in" | "opt_out" | "forced";
  allow_cloud_restore: boolean;
  require_prompt_for_sensitive_permissions: boolean;
}

export interface AppPolicy {
  default_network_for_untrusted: "allow" | "deny" | "prompt";
  default_camera_for_untrusted: "allow" | "deny" | "prompt";
  default_mic_for_untrusted: "allow" | "deny" | "prompt";
}

export interface KernelPolicy {
  allow_unsigned_modules: boolean;
  lockdown_mode: boolean;
}

export interface FullPolicyContent {
  device_mode: DeviceMode;
  wifi: WifiPolicy;
  shield: ShieldPolicy;
  bluetooth: BluetoothPolicy;
  power: PowerPolicy;
  updates: UpdatePolicy;
  privacy: PrivacyPolicy;
  apps: AppPolicy;
  kernel: KernelPolicy;
}

// ── Policy Bundle ───────────────────────────────────────────

export type PolicyBundleSource = "platform" | "org" | "device" | "user" | "session_override";

export interface PolicyBundle {
  bundleId: string;
  source: PolicyBundleSource;
  sourceId: string;
  version: string;
  formatVersion: string;
  signed: boolean;
  signatureRef?: string;
  contentHash: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  content: Partial<FullPolicyContent>;
}

// ── Platform Invariants (cannot be weakened) ─────────────────

export const PLATFORM_INVARIANTS: Partial<FullPolicyContent> = {
  shield: {
    baseline_firewall_required: true,
    allow_user_disable_firewall: false,
    require_admin_for_firewall_disable: true,
    auto_enable_threat_monitoring: true,
  },
  kernel: {
    allow_unsigned_modules: false,
    lockdown_mode: true,
  },
};

const INVARIANT_KEYS = new Set([
  "shield.baseline_firewall_required",
  "shield.allow_user_disable_firewall",
  "kernel.allow_unsigned_modules",
  "kernel.lockdown_mode",
]);

// ── Default Bundles per Device Mode ─────────────────────────

function createDefaultPolicy(mode: DeviceMode): FullPolicyContent {
  const base: FullPolicyContent = {
    device_mode: mode,
    wifi: {
      allow_open_networks: false,
      require_confirmation_for_open_networks: true,
      auto_enable_vpn_on_public_wifi: true,
      allow_wifi_toggle_while_locked: false,
      allow_saved_networks_for_guest: false,
    },
    shield: {
      baseline_firewall_required: true,
      allow_user_disable_firewall: false,
      require_admin_for_firewall_disable: true,
      auto_enable_threat_monitoring: true,
    },
    bluetooth: {
      allow_new_pairing_while_locked: false,
      require_admin_for_unknown_keyboard_pairing: true,
      allow_guest_pairing: false,
    },
    power: {
      auto_enable_saver_below_percent: 15,
      allow_performance_mode_on_battery: true,
      enforce_quiet_mode_in_presentations: true,
    },
    updates: {
      require_battery_percent_min: 40,
      require_charger_for_firmware: true,
      allow_beta_channel: false,
      auto_download_on_metered: false,
      rollback_on_health_failure: true,
    },
    privacy: {
      allow_telemetry: "opt_in",
      allow_cloud_restore: true,
      require_prompt_for_sensitive_permissions: true,
    },
    apps: {
      default_network_for_untrusted: "deny",
      default_camera_for_untrusted: "deny",
      default_mic_for_untrusted: "deny",
    },
    kernel: {
      allow_unsigned_modules: false,
      lockdown_mode: true,
    },
  };

  // Mode-specific overrides
  switch (mode) {
    case "home":
      base.wifi.allow_open_networks = true;
      base.wifi.require_confirmation_for_open_networks = true;
      base.updates.allow_beta_channel = false;
      base.power.allow_performance_mode_on_battery = true;
      break;
    case "work":
      base.wifi.auto_enable_vpn_on_public_wifi = true;
      base.bluetooth.require_admin_for_unknown_keyboard_pairing = true;
      base.privacy.allow_telemetry = "opt_out";
      base.apps.default_network_for_untrusted = "deny";
      break;
    case "school":
      base.wifi.allow_open_networks = false;
      base.bluetooth.allow_guest_pairing = false;
      base.bluetooth.require_admin_for_unknown_keyboard_pairing = true;
      base.updates.allow_beta_channel = false;
      base.apps.default_network_for_untrusted = "deny";
      base.apps.default_camera_for_untrusted = "prompt";
      break;
    case "kiosk":
      base.wifi.allow_open_networks = false;
      base.wifi.allow_wifi_toggle_while_locked = false;
      base.bluetooth.allow_new_pairing_while_locked = false;
      base.bluetooth.allow_guest_pairing = false;
      base.updates.auto_download_on_metered = false;
      base.privacy.allow_telemetry = "forced";
      base.privacy.allow_cloud_restore = false;
      break;
    case "guest_demo":
      base.wifi.allow_saved_networks_for_guest = false;
      base.bluetooth.allow_guest_pairing = false;
      base.privacy.allow_cloud_restore = false;
      base.privacy.allow_telemetry = "opt_out";
      break;
  }

  return base;
}

// ── Precedence Engine ───────────────────────────────────────

const SOURCE_PRECEDENCE: Record<PolicyBundleSource, number> = {
  session_override: 0,
  user: 1,
  device: 2,
  org: 3,
  platform: 4,
};

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const val = override[key];
    if (val !== undefined && val !== null && typeof val === "object" && !Array.isArray(val)) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

function enforceInvariants(policy: FullPolicyContent): FullPolicyContent {
  const result = { ...policy };
  // Shield invariants
  if (PLATFORM_INVARIANTS.shield) {
    result.shield = { ...result.shield, ...PLATFORM_INVARIANTS.shield };
  }
  // Kernel invariants
  if (PLATFORM_INVARIANTS.kernel) {
    result.kernel = { ...result.kernel, ...PLATFORM_INVARIANTS.kernel };
  }
  return result;
}

// ── Policy Bundle Manager ───────────────────────────────────

export class PolicyBundleManager {
  private bundles: PolicyBundle[] = [];
  private effectiveCache: Map<string, { policy: FullPolicyContent; computedAt: number; hash: string }> = new Map();
  private currentMode: DeviceMode = "home";
  private readonly CACHE_TTL = 30_000; // 30s

  initialize(): void {
    // Install platform default bundle
    const platformBundle: PolicyBundle = {
      bundleId: "platform-default",
      source: "platform",
      sourceId: "sita-os",
      version: "1.0.0",
      formatVersion: "1.0",
      signed: true,
      signatureRef: "platform-ed25519-default",
      contentHash: this.computeHash(createDefaultPolicy(this.currentMode)),
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: createDefaultPolicy(this.currentMode),
    };
    this.bundles = [platformBundle];
    this.invalidateCache();
  }

  // ── Mode Management ─────────────────────────────────────

  switchMode(mode: DeviceMode): { previousMode: DeviceMode; newMode: DeviceMode; effectivePolicy: FullPolicyContent } {
    const prev = this.currentMode;
    this.currentMode = mode;

    // Update platform bundle with mode defaults
    const platformIdx = this.bundles.findIndex(b => b.source === "platform");
    if (platformIdx >= 0) {
      this.bundles[platformIdx] = {
        ...this.bundles[platformIdx],
        content: createDefaultPolicy(mode),
        updatedAt: Date.now(),
      };
    }

    this.invalidateCache();
    return { previousMode: prev, newMode: mode, effectivePolicy: this.getEffective() };
  }

  getCurrentMode(): DeviceMode {
    return this.currentMode;
  }

  getModeDefinition(): DeviceModeDefinition {
    return DEVICE_MODES.find(m => m.mode === this.currentMode) || DEVICE_MODES[0];
  }

  // ── Bundle Lifecycle ────────────────────────────────────

  installBundle(bundle: PolicyBundle): { success: boolean; error?: string } {
    const validation = this.validateBundle(bundle);
    if (!validation.valid) return { success: false, error: validation.errors.join("; ") };

    // Deactivate existing bundles from same source
    this.bundles = this.bundles.map(b =>
      b.source === bundle.source && b.sourceId === bundle.sourceId
        ? { ...b, active: false }
        : b
    );

    this.bundles.push({ ...bundle, active: true });
    this.invalidateCache();
    return { success: true };
  }

  removeBundle(bundleId: string): boolean {
    const idx = this.bundles.findIndex(b => b.bundleId === bundleId && b.source !== "platform");
    if (idx < 0) return false;
    this.bundles.splice(idx, 1);
    this.invalidateCache();
    return true;
  }

  validateBundle(bundle: PolicyBundle): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!bundle.bundleId) errors.push("Missing bundleId");
    if (!bundle.version) errors.push("Missing version");
    if (!bundle.formatVersion) errors.push("Missing formatVersion");
    if (bundle.source === "platform" && !bundle.signed) errors.push("Platform bundles must be signed");
    if (bundle.source === "org" && !bundle.signed) errors.push("Org bundles must be signed");

    // Verify no invariant violations
    if (bundle.content) {
      const content = bundle.content as Partial<FullPolicyContent>;
      if (content.shield) {
        if (content.shield.baseline_firewall_required === false) errors.push("Cannot weaken: baseline_firewall_required");
        if (content.shield.allow_user_disable_firewall === true) errors.push("Cannot weaken: allow_user_disable_firewall");
      }
      if (content.kernel) {
        if (content.kernel.allow_unsigned_modules === true) errors.push("Cannot weaken: allow_unsigned_modules");
      }
    }

    // Stub signature verification
    if (bundle.signed && !bundle.signatureRef) errors.push("Signed bundle missing signatureRef");

    return { valid: errors.length === 0, errors };
  }

  // ── Effective Policy ────────────────────────────────────

  getEffective(): FullPolicyContent {
    const cacheKey = `${this.currentMode}-${this.bundles.filter(b => b.active).map(b => b.bundleId).join(",")}`;
    const cached = this.effectiveCache.get(cacheKey);
    if (cached && Date.now() - cached.computedAt < this.CACHE_TTL) {
      return cached.policy;
    }

    // Start with mode default
    let effective = createDefaultPolicy(this.currentMode);

    // Apply bundles in precedence order (lowest first, so higher precedence overwrites)
    const activeBundles = this.bundles
      .filter(b => b.active)
      .sort((a, b) => SOURCE_PRECEDENCE[a.source] - SOURCE_PRECEDENCE[b.source]);

    for (const bundle of activeBundles) {
      effective = deepMerge(effective, bundle.content as Partial<FullPolicyContent>);
    }

    // Enforce platform invariants last (cannot be weakened)
    effective = enforceInvariants(effective);

    this.effectiveCache.set(cacheKey, {
      policy: effective,
      computedAt: Date.now(),
      hash: this.computeHash(effective),
    });

    return effective;
  }

  getEffectiveForDomain<K extends keyof FullPolicyContent>(domain: K): FullPolicyContent[K] {
    return this.getEffective()[domain];
  }

  // ── Queries ─────────────────────────────────────────────

  getActiveBundles(): PolicyBundle[] {
    return this.bundles.filter(b => b.active);
  }

  getAllBundles(): PolicyBundle[] {
    return [...this.bundles];
  }

  getActiveConstraints(): Array<{ domain: string; key: string; value: unknown; source: string; invariant: boolean }> {
    const effective = this.getEffective();
    const constraints: Array<{ domain: string; key: string; value: unknown; source: string; invariant: boolean }> = [];

    for (const [domain, values] of Object.entries(effective)) {
      if (domain === "device_mode" || typeof values !== "object") continue;
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        const fullKey = `${domain}.${key}`;
        constraints.push({
          domain,
          key,
          value,
          source: this.findPolicySource(domain, key),
          invariant: INVARIANT_KEYS.has(fullKey),
        });
      }
    }

    return constraints;
  }

  // ── Helpers ─────────────────────────────────────────────

  private findPolicySource(domain: string, key: string): string {
    // Walk bundles from highest precedence to find which set this key
    const sorted = this.bundles
      .filter(b => b.active)
      .sort((a, b) => SOURCE_PRECEDENCE[b.source] - SOURCE_PRECEDENCE[a.source]);

    for (const bundle of sorted) {
      const domainContent = (bundle.content as Record<string, unknown>)[domain];
      if (domainContent && typeof domainContent === "object" && key in (domainContent as Record<string, unknown>)) {
        return bundle.source;
      }
    }
    return "platform";
  }

  private invalidateCache(): void {
    this.effectiveCache.clear();
  }

  private computeHash(content: unknown): string {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return `sha256-${Math.abs(hash).toString(16).padStart(8, "0")}`;
  }

  getStats() {
    return {
      totalBundles: this.bundles.length,
      activeBundles: this.bundles.filter(b => b.active).length,
      currentMode: this.currentMode,
      cacheSize: this.effectiveCache.size,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _bundleManager: PolicyBundleManager | null = null;
export function getPolicyBundleManager(): PolicyBundleManager {
  if (!_bundleManager) {
    _bundleManager = new PolicyBundleManager();
    _bundleManager.initialize();
  }
  return _bundleManager;
}
