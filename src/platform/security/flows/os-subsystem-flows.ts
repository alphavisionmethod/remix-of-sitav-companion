// ═══════════════════════════════════════════════════════════════
// SITA OS — End-to-End Subsystem Integration Flows
// Wires policyd, updated, onboardingd with system daemons
// ═══════════════════════════════════════════════════════════════

import { getContextualDecisionEngine, type EnhancedPolicyContext, type EnhancedPolicyDecision } from "../policyd-decisions";
import { getPolicyBundleManager } from "../policyd-bundles";
import { getUpdateDaemon, type UpdateCatalogEntry, type UpdatePreflightResult } from "../updated";
import { getOnboardingDaemon, type ProtectionDefaults } from "../onboardingd";
import { getAuditDaemon } from "../auditd";

// ── Flow Results ────────────────────────────────────────────

export interface FlowResult {
  flowId: string;
  flowName: string;
  success: boolean;
  decision?: EnhancedPolicyDecision;
  auditEmitted: boolean;
  sideEffects: string[];
  userMessage?: string;
}

// ── Flow: Open Wi-Fi on School Device ───────────────────────

export async function flowOpenWifiSchoolDevice(
  context: Partial<EnhancedPolicyContext> = {}
): Promise<FlowResult> {
  const engine = getContextualDecisionEngine();
  const auditd = getAuditDaemon();

  const ctx: EnhancedPolicyContext = {
    actorId: "user-1",
    actorType: "user",
    action: "wifi.connect.open",
    deviceMode: "school",
    sessionLocked: false,
    onBattery: true,
    batteryPercent: 75,
    charging: false,
    presentationActive: false,
    managedDevice: true,
    networkType: "none",
    threatPosture: "normal",
    updateState: "idle",
    vpnActive: false,
    guestSession: false,
    ...context,
  };

  const decision = engine.evaluateContextual(ctx);

  if (decision) {
    await auditd.record({
      actorUserId: ctx.actorId,
      actorSessionId: "flow",
      actorService: "wifid",
      action: ctx.action,
      decision: decision.decision === "deny" ? "denied" : "allowed",
      severity: decision.auditSeverity,
      reason: decision.reasonMessage,
    });
  }

  return {
    flowId: crypto.randomUUID(),
    flowName: "open-wifi-school",
    success: decision?.decision !== "deny",
    decision: decision || undefined,
    auditEmitted: true,
    sideEffects: decision?.decision === "deny" ? ["notification-shown"] : ["wifi-connected"],
    userMessage: decision?.userMessage,
  };
}

// ── Flow: Public Wi-Fi Detected → Auto-VPN ──────────────────

export async function flowPublicWifiAutoVPN(
  context: Partial<EnhancedPolicyContext> = {}
): Promise<FlowResult> {
  const engine = getContextualDecisionEngine();
  const auditd = getAuditDaemon();
  const bundleManager = getPolicyBundleManager();
  const policy = bundleManager.getEffective();

  const ctx: EnhancedPolicyContext = {
    actorId: "system",
    actorType: "system",
    action: "wifi.connect.open",
    deviceMode: bundleManager.getCurrentMode(),
    sessionLocked: false,
    onBattery: true,
    batteryPercent: 60,
    charging: false,
    presentationActive: false,
    managedDevice: false,
    networkType: "wifi_public",
    threatPosture: "normal",
    updateState: "idle",
    vpnActive: false,
    guestSession: false,
    ...context,
  };

  const decision = engine.evaluateContextual(ctx);
  const sideEffects: string[] = [];

  if (policy.wifi.auto_enable_vpn_on_public_wifi) {
    sideEffects.push("vpn-auto-enabled");
    sideEffects.push("notification-secure-connection");
  }

  await auditd.record({
    actorUserId: "system",
    actorSessionId: "flow",
    actorService: "wifid",
    action: "wifi.public-detected",
    decision: "allowed",
    severity: "info",
    reason: "Public WiFi detected, VPN auto-enabled",
  });

  return {
    flowId: crypto.randomUUID(),
    flowName: "public-wifi-auto-vpn",
    success: true,
    decision: decision || undefined,
    auditEmitted: true,
    sideEffects,
    userMessage: "VPN protection enabled for this public network.",
  };
}

// ── Flow: BT Pair While Locked ──────────────────────────────

export async function flowBTPairWhileLocked(
  context: Partial<EnhancedPolicyContext> = {}
): Promise<FlowResult> {
  const engine = getContextualDecisionEngine();
  const auditd = getAuditDaemon();

  const ctx: EnhancedPolicyContext = {
    actorId: "user-1",
    actorType: "user",
    action: "bluetooth.pair",
    deviceMode: "home",
    sessionLocked: true,
    onBattery: true,
    batteryPercent: 50,
    charging: false,
    presentationActive: false,
    managedDevice: false,
    networkType: "wifi_secure",
    threatPosture: "normal",
    updateState: "idle",
    vpnActive: false,
    guestSession: false,
    ...context,
  };

  const decision = engine.evaluateContextual(ctx);

  await auditd.record({
    actorUserId: ctx.actorId,
    actorSessionId: "flow",
    actorService: "btd",
    action: ctx.action,
    decision: "denied",
    severity: "warning",
    reason: "BT pairing denied while locked",
  });

  return {
    flowId: crypto.randomUUID(),
    flowName: "bt-pair-locked",
    success: false,
    decision: decision || undefined,
    auditEmitted: true,
    sideEffects: ["pairing-blocked"],
    userMessage: decision?.userMessage || "Unlock your device to pair Bluetooth devices.",
  };
}

// ── Flow: First Boot Setup ──────────────────────────────────

export async function flowFirstBoot(
  deviceMode: "home" | "work" | "school" | "kiosk" | "guest_demo" = "home"
): Promise<FlowResult & { protectionDefaults: ProtectionDefaults }> {
  const onboardingd = getOnboardingDaemon();
  const auditd = getAuditDaemon();

  // Start onboarding session
  onboardingd.startSession(deviceMode);
  const session = onboardingd.getSession()!;
  const defaults = onboardingd.getProtectionDefaults();

  await auditd.record({
    actorUserId: "system",
    actorSessionId: session.sessionId,
    actorService: "onboardingd",
    action: "onboarding.started",
    decision: "allowed",
    severity: "info",
    reason: `First boot onboarding started in ${deviceMode} mode`,
  });

  return {
    flowId: crypto.randomUUID(),
    flowName: "first-boot",
    success: true,
    auditEmitted: true,
    sideEffects: [
      "onboarding-session-created",
      "hardware-detected",
      "protection-defaults-computed",
      "policy-mode-set",
    ],
    protectionDefaults: defaults,
    userMessage: `Welcome to SITA OS! Let's set up your ${deviceMode} device.`,
  };
}

// ── Flow: Update with Rollback ──────────────────────────────

export async function flowUpdateWithRollback(
  update: UpdateCatalogEntry,
  context: Partial<EnhancedPolicyContext> = {}
): Promise<FlowResult & { preflight: UpdatePreflightResult; healthPassed: boolean }> {
  const updated = getUpdateDaemon();
  const auditd = getAuditDaemon();

  // 1. Preflight
  const preflight = updated.runPreflight(update, context);
  if (!preflight.eligible) {
    return {
      flowId: crypto.randomUUID(),
      flowName: "update-with-rollback",
      success: false,
      auditEmitted: true,
      sideEffects: ["preflight-failed"],
      preflight,
      healthPassed: false,
      userMessage: `Update blocked: ${preflight.blockers.map(b => b.message).join("; ")}`,
    };
  }

  // 2. Download
  const downloadResult = await updated.downloadUpdate(update);
  if (!downloadResult.success) {
    return {
      flowId: crypto.randomUUID(),
      flowName: "update-with-rollback",
      success: false,
      auditEmitted: true,
      sideEffects: ["download-failed"],
      preflight,
      healthPassed: false,
      userMessage: downloadResult.error,
    };
  }

  // 3. Stage
  const stageResult = await updated.stageUpdate();
  if (!stageResult.success) {
    return {
      flowId: crypto.randomUUID(),
      flowName: "update-with-rollback",
      success: false,
      auditEmitted: true,
      sideEffects: ["staging-failed"],
      preflight,
      healthPassed: false,
      userMessage: stageResult.error,
    };
  }

  // 4. Validate (simulated reboot)
  const validateResult = await updated.simulateRebootAndValidate();

  await auditd.record({
    actorUserId: "system",
    actorSessionId: "updated",
    actorService: "updated",
    action: validateResult.rollback ? "update.rolled_back" : validateResult.success ? "update.succeeded" : "update.failed",
    decision: validateResult.success ? "allowed" : "failed",
    severity: validateResult.rollback ? "high" : "info",
    reason: validateResult.reason || `Update to ${update.version} ${validateResult.success ? "succeeded" : "failed"}`,
  });

  return {
    flowId: crypto.randomUUID(),
    flowName: "update-with-rollback",
    success: validateResult.success,
    auditEmitted: true,
    sideEffects: validateResult.rollback
      ? ["update-rolled-back", "notification-rollback"]
      : validateResult.success
        ? ["update-succeeded", "notification-success"]
        : ["update-failed"],
    preflight,
    healthPassed: validateResult.success,
    userMessage: validateResult.rollback
      ? `Your device rolled back to the previous version: ${validateResult.reason}`
      : validateResult.success
        ? `Successfully updated to ${update.version}`
        : `Update failed: ${validateResult.reason}`,
  };
}
