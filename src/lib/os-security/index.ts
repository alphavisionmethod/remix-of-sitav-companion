// ═══════════════════════════════════════════════════════════════
// SITA OS — OS Security Subsystem: Barrel Export & Boot
// Initializes all daemons in order, provides unified access
// ═══════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────
export * from "./types";

// ── Daemons ─────────────────────────────────────────────────
export { AuthDaemon, getAuthDaemon } from "./authd";
export { PolicyDaemon, getPolicyDaemon, registerService, getServiceIdentity } from "./policyd";
export type { EnvironmentalContext, PolicyDecision } from "./policyd";
export { SecretsDaemon, getSecretsDaemon } from "./secretsd";
export { SessionDaemon, getSessionDaemon } from "./sessiond";
export type { SessionEvent, LockedScreenCapabilities } from "./sessiond";
export { AuditDaemon, getAuditDaemon } from "./auditd";
export { ControlCenterDaemon, getControlCenterDaemon } from "./controlcenterd";
export type { CommandResult } from "./controlcenterd";

// ── Policy Bundles & Decisions ───────────────────────────────
export { PolicyBundleManager, getPolicyBundleManager, DEVICE_MODES } from "./policyd-bundles";
export type { DeviceMode, PolicyBundle, FullPolicyContent, PolicyBundleSource, DeviceModeDefinition } from "./policyd-bundles";
export { ContextualDecisionEngine, getContextualDecisionEngine } from "./policyd-decisions";
export type { EnhancedPolicyContext, EnhancedPolicyDecision, EnhancedDecisionType } from "./policyd-decisions";

// ── Update Daemon ────────────────────────────────────────────
export { UpdateDaemon, getUpdateDaemon } from "./updated";
export type { UpdateState, UpdateChannel, UpdateCatalogEntry, UpdatePreflightResult, UpdateProgress, HealthValidationResult, RollbackEvent, SystemSlot } from "./updated";

// ── Onboarding Daemon ────────────────────────────────────────
export { OnboardingDaemon, getOnboardingDaemon } from "./onboardingd";
export type { OnboardingSession, OnboardingStep, ProtectionDefaults } from "./onboardingd";

// ── Elevation Engine ─────────────────────────────────────────
export { ElevationEngine, getElevationEngine } from "./elevation-engine";
export type { ElevationResult } from "./elevation-engine";

// ── Notification Daemon ──────────────────────────────────────
export { NotifyDaemon, getNotifyDaemon } from "./notifyd";
export type { SecurityNotification, SecurityEventType } from "./notifyd";

// ── Boot Sequence ───────────────────────────────────────────

import { getAuthDaemon } from "./authd";
import { getPolicyDaemon } from "./policyd";
import { getSecretsDaemon } from "./secretsd";
import { getSessionDaemon } from "./sessiond";
import { getAuditDaemon } from "./auditd";
import { getControlCenterDaemon } from "./controlcenterd";
import { getNotifyDaemon } from "./notifyd";
import { getUpdateDaemon } from "./updated";
import { getOnboardingDaemon } from "./onboardingd";
import { getPolicyBundleManager } from "./policyd-bundles";
import { getEcosystemOrchestrator } from "@/lib/services/ecosystem-orchestrator";

let booted = false;

/**
 * Boot all OS security daemons in dependency order:
 * authd → policyd → secretsd → sessiond → auditd → controlcenterd
 */
export async function bootOSSecurity(): Promise<{
  authd: ReturnType<typeof getAuthDaemon>;
  policyd: ReturnType<typeof getPolicyDaemon>;
  secretsd: ReturnType<typeof getSecretsDaemon>;
  sessiond: ReturnType<typeof getSessionDaemon>;
  auditd: ReturnType<typeof getAuditDaemon>;
  controlcenterd: ReturnType<typeof getControlCenterDaemon>;
  notifyd: ReturnType<typeof getNotifyDaemon>;
  updated: ReturnType<typeof getUpdateDaemon>;
  onboardingd: ReturnType<typeof getOnboardingDaemon>;
}> {
  if (booted) {
    return {
      authd: getAuthDaemon(),
      policyd: getPolicyDaemon(),
      secretsd: getSecretsDaemon(),
      sessiond: getSessionDaemon(),
      auditd: getAuditDaemon(),
      controlcenterd: getControlCenterDaemon(),
      notifyd: getNotifyDaemon(),
      updated: getUpdateDaemon(),
      onboardingd: getOnboardingDaemon(),
    };
  }

  console.log("[os-security] Booting security subsystem...");

  const authd = getAuthDaemon();
  await authd.initialize();
  console.log("[os-security] ✓ authd initialized");

  const policyd = getPolicyDaemon();
  await policyd.initialize();
  console.log("[os-security] ✓ policyd initialized");

  // Initialize policy bundle manager
  getPolicyBundleManager();
  console.log("[os-security] ✓ policyd-bundles initialized");

  const secretsd = getSecretsDaemon();
  await secretsd.initialize();
  console.log("[os-security] ✓ secretsd initialized");

  const sessiond = getSessionDaemon();
  await sessiond.initialize();
  console.log("[os-security] ✓ sessiond initialized");

  const auditd = getAuditDaemon();
  await auditd.initialize();
  console.log("[os-security] ✓ auditd initialized");

  const controlcenterd = getControlCenterDaemon();
  await controlcenterd.initialize();
  console.log("[os-security] ✓ controlcenterd initialized");

  const notifyd = getNotifyDaemon();
  await notifyd.initialize();
  notifyd.seedDemoEvents();
  console.log("[os-security] ✓ notifyd initialized");

  const updated = getUpdateDaemon();
  await updated.initialize();
  console.log("[os-security] ✓ updated initialized");

  const onboardingd = getOnboardingDaemon();
  await onboardingd.initialize();
  console.log("[os-security] ✓ onboardingd initialized");

  // Ecosystem Orchestrator (admin-only, after controlcenterd)
  const ecosystemOrch = getEcosystemOrchestrator();
  await ecosystemOrch.initialize();
  console.log("[os-security] ✓ ecosystem-orchestrator initialized");

  // Record boot event
  await auditd.record({
    actorUserId: "system",
    actorSessionId: "boot",
    actorService: "os-security",
    action: "system.boot.security-subsystem",
    decision: "allowed",
    severity: "info",
    reason: "OS security subsystem initialized (policyd + updated + onboardingd + ecosystem-orchestrator)",
  });

  booted = true;
  console.log("[os-security] ✓ Security subsystem ready");

  return { authd, policyd, secretsd, sessiond, auditd, controlcenterd, notifyd, updated, onboardingd };
}

export function isOSSecurityBooted(): boolean {
  return booted;
}
