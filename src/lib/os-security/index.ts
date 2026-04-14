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

// ── Elevation Engine ─────────────────────────────────────────
export { ElevationEngine, getElevationEngine } from "./elevation-engine";
export type { ElevationResult } from "./elevation-engine";

// ── Boot Sequence ───────────────────────────────────────────

import { getAuthDaemon } from "./authd";
import { getPolicyDaemon } from "./policyd";
import { getSecretsDaemon } from "./secretsd";
import { getSessionDaemon } from "./sessiond";
import { getAuditDaemon } from "./auditd";
import { getControlCenterDaemon } from "./controlcenterd";

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
}> {
  if (booted) {
    return {
      authd: getAuthDaemon(),
      policyd: getPolicyDaemon(),
      secretsd: getSecretsDaemon(),
      sessiond: getSessionDaemon(),
      auditd: getAuditDaemon(),
      controlcenterd: getControlCenterDaemon(),
    };
  }

  console.log("[os-security] Booting security subsystem...");

  const authd = getAuthDaemon();
  await authd.initialize();
  console.log("[os-security] ✓ authd initialized");

  const policyd = getPolicyDaemon();
  await policyd.initialize();
  console.log("[os-security] ✓ policyd initialized");

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

  // Record boot event
  await auditd.record({
    actorUserId: "system",
    actorSessionId: "boot",
    actorService: "os-security",
    action: "system.boot.security-subsystem",
    decision: "allowed",
    severity: "info",
    reason: "OS security subsystem initialized",
  });

  booted = true;
  console.log("[os-security] ✓ Security subsystem ready");

  return { authd, policyd, secretsd, sessiond, auditd, controlcenterd };
}

export function isOSSecurityBooted(): boolean {
  return booted;
}
