// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Flows
// End-to-end wired flows for WiFi, VPN, Firewall, Session
// ═══════════════════════════════════════════════════════════════

import { getControlCenterDaemon } from "../controlcenterd";
import { getSecretsDaemon } from "../secretsd";
import { getAuditDaemon } from "../auditd";
import type { ControlCenterCommand, IPCResult } from "../types";

// ── WiFi Connect Flow ───────────────────────────────────────

export async function wifiConnectFlow(
  sessionId: string, userId: string,
  networkName: string, password?: string
): Promise<IPCResult> {
  const ccd = getControlCenterDaemon();
  const action = password ? "wifi.connect.secure" : "wifi.connect.open";

  const command: ControlCenterCommand = {
    commandId: crypto.randomUUID(),
    action,
    payload: { networkName, hasPassword: !!password },
    callerSessionId: sessionId,
    callerUserId: userId,
    timestamp: Date.now(),
  };

  const result = await ccd.executeCommand(command);

  if (result.status === "completed" && password) {
    const secretsd = getSecretsDaemon();
    await secretsd.storeSecret(password, "wifi-psk", `user:${userId}`, `WiFi: ${networkName}`);
  }

  return { status: result.status === "completed" ? "ok" : result.status === "denied" ? "denied" : "error", error: result.error };
}

// ── VPN Certificate Install Flow ────────────────────────────

export async function vpnCertInstallFlow(
  sessionId: string, userId: string,
  certName: string, privateKeyPem: string
): Promise<IPCResult> {
  const ccd = getControlCenterDaemon();

  const command: ControlCenterCommand = {
    commandId: crypto.randomUUID(),
    action: "cert.install.system",
    payload: { certName, type: "vpn-root" },
    callerSessionId: sessionId,
    callerUserId: userId,
    timestamp: Date.now(),
  };

  const result = await ccd.executeCommand(command);

  if (result.status === "completed") {
    const secretsd = getSecretsDaemon();
    await secretsd.storeSecret(privateKeyPem, "vpn-private-key", `user:${userId}`, `VPN Key: ${certName}`, { keyringId: "system" });
    const auditd = getAuditDaemon();
    await auditd.record({ actorUserId: userId, actorSessionId: sessionId, action: "cert.install.system", resource: certName, decision: "allowed", severity: "critical" });
  }

  return { status: result.status === "completed" ? "ok" : result.status === "denied" ? "denied" : "error", error: result.error };
}

// ── Firewall Disable Flow ───────────────────────────────────

export async function firewallDisableFlow(
  sessionId: string, userId: string
): Promise<IPCResult> {
  const ccd = getControlCenterDaemon();

  const command: ControlCenterCommand = {
    commandId: crypto.randomUUID(),
    action: "shield.firewall.disable",
    payload: {},
    callerSessionId: sessionId,
    callerUserId: userId,
    timestamp: Date.now(),
  };

  const result = await ccd.executeCommand(command);
  return { status: result.status === "completed" ? "ok" : result.status === "denied" ? "denied" : "error", error: result.error, data: result.elevationRequest };
}

// ── Session Unlock Flow ─────────────────────────────────────

export async function sessionUnlockFlow(
  sessionId: string, credential: string, method: "password" | "pin" | "biometric" | "security-key" = "password"
): Promise<IPCResult> {
  const { getSessionDaemon } = await import("../sessiond");
  const sessiond = getSessionDaemon();
  return sessiond.unlock(sessionId, method, credential);
}
