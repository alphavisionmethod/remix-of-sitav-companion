// ═══════════════════════════════════════════════════════════════
// SITA OS — policyd-decisions: Contextual Decision Engine
// Environmental-aware policy evaluation with explainable results
// ═══════════════════════════════════════════════════════════════

import type { OSSession, AuditSeverity } from "./types";
import { getPolicyBundleManager, type DeviceMode, type FullPolicyContent } from "./policyd-bundles";

// ── Enhanced Policy Context ─────────────────────────────────

export interface EnhancedPolicyContext {
  actorId: string;
  actorType: "user" | "service" | "system";
  action: string;
  resource?: string;
  deviceMode: DeviceMode;
  sessionLocked: boolean;
  onBattery: boolean;
  batteryPercent: number;
  charging: boolean;
  presentationActive: boolean;
  managedDevice: boolean;
  networkType: "ethernet" | "wifi_secure" | "wifi_open" | "wifi_public" | "metered" | "none";
  threatPosture: "normal" | "elevated" | "critical";
  updateState: "idle" | "downloading" | "staging" | "validating";
  vpnActive: boolean;
  guestSession: boolean;
}

// ── Enhanced Decision Output ────────────────────────────────

export type EnhancedDecisionType = "allow" | "deny" | "allow_with_prompt" | "allow_with_elevation" | "allow_forced";

export interface EnhancedPolicyDecision {
  decision: EnhancedDecisionType;
  reasonCode: string;
  reasonMessage: string;
  userMessage: string;
  policySource: string;
  policyDomain: string;
  canOverride: boolean;
  auditSeverity: AuditSeverity;
  environmentalFactors: string[];
  decisionChain: DecisionChainStep[];
}

export interface DecisionChainStep {
  step: number;
  check: string;
  result: "pass" | "fail" | "warn";
  detail: string;
  source: string;
}

// ── Contextual Decision Rules ───────────────────────────────

interface DecisionRule {
  id: string;
  actionPattern: string;
  evaluate: (ctx: EnhancedPolicyContext, policy: FullPolicyContent) => EnhancedPolicyDecision | null;
}

const CONTEXTUAL_RULES: DecisionRule[] = [
  // Wi-Fi rules
  {
    id: "wifi-open-school",
    actionPattern: "wifi.connect.open",
    evaluate: (ctx, policy) => {
      if (ctx.deviceMode === "school" && !policy.wifi.allow_open_networks) {
        return makeDecision("deny", "WIFI_OPEN_SCHOOL_BLOCKED", "wifi",
          "Open Wi-Fi connections are blocked on school-managed devices",
          "Open Wi-Fi is not allowed in School mode. Ask your administrator for network access.",
          "platform", false, "high", ctx, [{ step: 1, check: "Device mode check", result: "fail", detail: "School mode blocks open WiFi", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "wifi-open-confirmation",
    actionPattern: "wifi.connect.open",
    evaluate: (ctx, policy) => {
      if (policy.wifi.require_confirmation_for_open_networks) {
        return makeDecision("allow_with_prompt", "WIFI_OPEN_CONFIRM", "wifi",
          "Open network requires user confirmation",
          "This is an open network. Your data may not be encrypted. Continue?",
          "platform", true, "info", ctx, [{ step: 1, check: "Open network confirmation", result: "warn", detail: "User prompt required", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "wifi-auto-vpn",
    actionPattern: "wifi.connect.open",
    evaluate: (ctx, policy) => {
      if (policy.wifi.auto_enable_vpn_on_public_wifi && !ctx.vpnActive && ctx.networkType === "wifi_public") {
        return makeDecision("allow_forced", "WIFI_PUBLIC_VPN_AUTO", "wifi",
          "VPN will be automatically enabled on public WiFi",
          "VPN protection has been enabled for your safety on this public network.",
          "platform", false, "info", ctx, [{ step: 1, check: "Auto-VPN on public WiFi", result: "pass", detail: "VPN auto-enabled", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "wifi-locked-toggle",
    actionPattern: "wifi.toggle",
    evaluate: (ctx, policy) => {
      if (ctx.sessionLocked && !policy.wifi.allow_wifi_toggle_while_locked) {
        return makeDecision("deny", "WIFI_TOGGLE_LOCKED", "wifi",
          "Cannot toggle WiFi while session is locked",
          "Unlock your device to change WiFi settings.",
          "platform", false, "warning", ctx, [{ step: 1, check: "Lock state check", result: "fail", detail: "Session locked", source: "platform" }]);
      }
      return null;
    },
  },

  // Bluetooth rules
  {
    id: "bt-pair-locked",
    actionPattern: "bluetooth.pair",
    evaluate: (ctx, policy) => {
      if (ctx.sessionLocked && !policy.bluetooth.allow_new_pairing_while_locked) {
        return makeDecision("deny", "BT_PAIR_LOCKED", "bluetooth",
          "Bluetooth pairing blocked while device is locked",
          "Unlock your device to pair new Bluetooth devices.",
          "platform", false, "warning", ctx, [{ step: 1, check: "Lock state for BT pair", result: "fail", detail: "Cannot pair while locked", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "bt-guest-pairing",
    actionPattern: "bluetooth.pair",
    evaluate: (ctx, policy) => {
      if (ctx.guestSession && !policy.bluetooth.allow_guest_pairing) {
        return makeDecision("deny", "BT_GUEST_BLOCKED", "bluetooth",
          "Guest users cannot pair Bluetooth devices",
          "Sign in with a full account to pair Bluetooth devices.",
          "platform", false, "warning", ctx, [{ step: 1, check: "Guest BT check", result: "fail", detail: "Guest cannot pair", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "bt-unknown-keyboard",
    actionPattern: "bluetooth.pair",
    evaluate: (ctx, policy) => {
      if (policy.bluetooth.require_admin_for_unknown_keyboard_pairing) {
        return makeDecision("allow_with_elevation", "BT_KEYBOARD_ADMIN", "bluetooth",
          "Unknown keyboard pairing requires admin approval",
          "Administrator authentication is required to pair this input device.",
          "platform", true, "high", ctx, [{ step: 1, check: "Unknown keyboard policy", result: "warn", detail: "Admin elevation required", source: "platform" }]);
      }
      return null;
    },
  },

  // Shield / Firewall rules
  {
    id: "firewall-disable-invariant",
    actionPattern: "shield.firewall.disable",
    evaluate: (_ctx, policy) => {
      if (policy.shield.baseline_firewall_required) {
        return makeDecision("deny", "FIREWALL_INVARIANT", "shield",
          "System firewall cannot be fully disabled (platform invariant)",
          "The baseline firewall is required and cannot be disabled. This is a platform security requirement.",
          "invariant", false, "critical", _ctx, [{ step: 1, check: "Platform invariant", result: "fail", detail: "baseline_firewall_required=true is immutable", source: "invariant" }]);
      }
      return null;
    },
  },

  // Update rules
  {
    id: "update-battery-low",
    actionPattern: "update.install",
    evaluate: (ctx, policy) => {
      if (ctx.batteryPercent < policy.updates.require_battery_percent_min && !ctx.charging) {
        return makeDecision("deny", "UPDATE_BATTERY_LOW", "updates",
          `Battery too low for update (${ctx.batteryPercent}% < ${policy.updates.require_battery_percent_min}%)`,
          `Charge your device to at least ${policy.updates.require_battery_percent_min}% before installing updates. Current: ${ctx.batteryPercent}%.`,
          "platform", false, "warning", ctx, [{ step: 1, check: "Battery threshold", result: "fail", detail: `${ctx.batteryPercent}% < ${policy.updates.require_battery_percent_min}%`, source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "update-firmware-charger",
    actionPattern: "update.install.firmware",
    evaluate: (ctx, policy) => {
      if (policy.updates.require_charger_for_firmware && !ctx.charging) {
        return makeDecision("deny", "UPDATE_FIRMWARE_CHARGER", "updates",
          "Firmware updates require device to be charging",
          "Connect your charger before installing firmware updates to prevent corruption.",
          "platform", false, "high", ctx, [{ step: 1, check: "Charger requirement", result: "fail", detail: "Not charging", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "update-beta-channel",
    actionPattern: "update.channel.beta",
    evaluate: (ctx, policy) => {
      if (!policy.updates.allow_beta_channel) {
        return makeDecision("deny", "UPDATE_BETA_BLOCKED", "updates",
          "Beta channel is disabled by device policy",
          "Beta updates are not available on this device. Contact your administrator.",
          "platform", false, "info", ctx, [{ step: 1, check: "Beta channel policy", result: "fail", detail: "allow_beta_channel=false", source: "platform" }]);
      }
      return null;
    },
  },
  {
    id: "update-metered-download",
    actionPattern: "update.download",
    evaluate: (ctx, policy) => {
      if (ctx.networkType === "metered" && !policy.updates.auto_download_on_metered) {
        return makeDecision("allow_with_prompt", "UPDATE_METERED_PROMPT", "updates",
          "Downloads on metered connections require confirmation",
          "You're on a metered connection. Downloading this update may use mobile data. Continue?",
          "platform", true, "info", ctx, [{ step: 1, check: "Metered network check", result: "warn", detail: "Metered connection detected", source: "platform" }]);
      }
      return null;
    },
  },

  // Power rules
  {
    id: "power-quiet-presentation",
    actionPattern: "notification.*",
    evaluate: (ctx, policy) => {
      if (ctx.presentationActive && policy.power.enforce_quiet_mode_in_presentations) {
        return makeDecision("allow_forced", "QUIET_PRESENTATION", "power",
          "Quiet mode enforced during presentations",
          "Notifications are silenced during your presentation.",
          "platform", false, "info", ctx, [{ step: 1, check: "Presentation mode", result: "pass", detail: "Quiet mode active", source: "platform" }]);
      }
      return null;
    },
  },

  // Kiosk restrictions
  {
    id: "kiosk-settings-restrict",
    actionPattern: "system.settings.modify",
    evaluate: (ctx) => {
      if (ctx.deviceMode === "kiosk") {
        return makeDecision("deny", "KIOSK_SETTINGS_LOCKED", "apps",
          "Settings are restricted in Kiosk mode",
          "System settings cannot be changed in Kiosk mode.",
          "platform", false, "warning", ctx, [{ step: 1, check: "Kiosk mode restriction", result: "fail", detail: "Kiosk blocks settings changes", source: "platform" }]);
      }
      return null;
    },
  },
];

// ── Decision Factory ────────────────────────────────────────

function makeDecision(
  decision: EnhancedDecisionType,
  reasonCode: string,
  policyDomain: string,
  reasonMessage: string,
  userMessage: string,
  policySource: string,
  canOverride: boolean,
  auditSeverity: AuditSeverity,
  ctx: EnhancedPolicyContext,
  chain: DecisionChainStep[]
): EnhancedPolicyDecision {
  const factors: string[] = [];
  if (ctx.sessionLocked) factors.push("session-locked");
  if (ctx.onBattery) factors.push("on-battery");
  if (ctx.presentationActive) factors.push("presentation-active");
  if (ctx.guestSession) factors.push("guest-session");
  if (ctx.networkType === "wifi_public") factors.push("public-wifi");
  if (ctx.managedDevice) factors.push("managed-device");
  if (ctx.threatPosture !== "normal") factors.push(`threat-${ctx.threatPosture}`);

  return { decision, reasonCode, reasonMessage, userMessage, policySource, policyDomain, canOverride, auditSeverity, environmentalFactors: factors, decisionChain: chain };
}

// ── Contextual Decision Engine ──────────────────────────────

export class ContextualDecisionEngine {
  evaluateContextual(ctx: EnhancedPolicyContext): EnhancedPolicyDecision | null {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();

    for (const rule of CONTEXTUAL_RULES) {
      if (this.matchesPattern(ctx.action, rule.actionPattern)) {
        const result = rule.evaluate(ctx, policy);
        if (result) return result;
      }
    }

    return null;
  }

  simulate(ctx: EnhancedPolicyContext): { decision: EnhancedPolicyDecision | null; matchedRules: string[] } {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();
    const matchedRules: string[] = [];

    for (const rule of CONTEXTUAL_RULES) {
      if (this.matchesPattern(ctx.action, rule.actionPattern)) {
        const result = rule.evaluate(ctx, policy);
        if (result) {
          matchedRules.push(rule.id);
          return { decision: result, matchedRules };
        }
      }
    }

    return { decision: null, matchedRules };
  }

  explain(action: string, ctx: EnhancedPolicyContext): {
    applicableRules: string[];
    effectivePolicy: Partial<FullPolicyContent>;
    predictedDecision: EnhancedPolicyDecision | null;
  } {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();
    const applicableRules: string[] = [];

    for (const rule of CONTEXTUAL_RULES) {
      if (this.matchesPattern(action, rule.actionPattern)) {
        applicableRules.push(rule.id);
      }
    }

    const { decision } = this.simulate({ ...ctx, action });
    const domain = action.split(".")[0];
    const policyRecord = policy as unknown as Record<string, unknown>;
    const domainPolicy = policyRecord[domain === "shield" ? "shield" : domain] as Record<string, unknown> | undefined;

    return {
      applicableRules,
      effectivePolicy: domainPolicy ? { [domain]: domainPolicy } as Partial<FullPolicyContent> : {},
      predictedDecision: decision,
    };
  }

  // ── Update Preflight ────────────────────────────────────

  evaluateUpdatePreflight(ctx: EnhancedPolicyContext): {
    eligible: boolean;
    blockers: Array<{ code: string; message: string; severity: AuditSeverity }>;
    warnings: Array<{ code: string; message: string }>;
  } {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();
    const blockers: Array<{ code: string; message: string; severity: AuditSeverity }> = [];
    const warnings: Array<{ code: string; message: string }> = [];

    if (ctx.batteryPercent < policy.updates.require_battery_percent_min && !ctx.charging) {
      blockers.push({ code: "BATTERY_LOW", message: `Battery at ${ctx.batteryPercent}%, need ${policy.updates.require_battery_percent_min}%`, severity: "warning" });
    }

    if (policy.updates.require_charger_for_firmware && !ctx.charging) {
      warnings.push({ code: "CHARGER_RECOMMENDED", message: "Charger recommended for system updates" });
    }

    if (ctx.networkType === "none") {
      blockers.push({ code: "NO_NETWORK", message: "No network connection available", severity: "high" });
    }

    if (ctx.networkType === "metered" && !policy.updates.auto_download_on_metered) {
      warnings.push({ code: "METERED_NETWORK", message: "Metered connection — download may incur charges" });
    }

    if (ctx.updateState !== "idle") {
      blockers.push({ code: "UPDATE_IN_PROGRESS", message: "Another update operation is in progress", severity: "warning" });
    }

    if (ctx.threatPosture === "critical") {
      warnings.push({ code: "THREAT_ELEVATED", message: "Elevated threat posture detected" });
    }

    return { eligible: blockers.length === 0, blockers, warnings };
  }

  // ── Onboarding Defaults ─────────────────────────────────

  evaluateOnboardingDefaults(): {
    firewallBaseline: boolean;
    vpnOnPublicWifi: boolean;
    threatMonitoring: boolean;
    telemetryDefault: "opt_in" | "opt_out" | "forced";
    batterySaverThreshold: number;
    quietModeRecommended: boolean;
    cloudRestoreAllowed: boolean;
  } {
    const bundleManager = getPolicyBundleManager();
    const policy = bundleManager.getEffective();

    return {
      firewallBaseline: policy.shield.baseline_firewall_required,
      vpnOnPublicWifi: policy.wifi.auto_enable_vpn_on_public_wifi,
      threatMonitoring: policy.shield.auto_enable_threat_monitoring,
      telemetryDefault: policy.privacy.allow_telemetry,
      batterySaverThreshold: policy.power.auto_enable_saver_below_percent,
      quietModeRecommended: policy.power.enforce_quiet_mode_in_presentations,
      cloudRestoreAllowed: policy.privacy.allow_cloud_restore,
    };
  }

  private matchesPattern(action: string, pattern: string): boolean {
    if (pattern.endsWith("*")) {
      return action.startsWith(pattern.slice(0, -1));
    }
    return action === pattern;
  }
}

// ── Singleton ──────────────────────────────────────────────

let _engine: ContextualDecisionEngine | null = null;
export function getContextualDecisionEngine(): ContextualDecisionEngine {
  if (!_engine) _engine = new ContextualDecisionEngine();
  return _engine;
}
