// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Flows
// End-to-end wired flows for WiFi, VPN, Firewall, Session,
// Token lifecycle, Suspend/Resume, Fast Switch, Guest Teardown
// ═══════════════════════════════════════════════════════════════

import { getControlCenterDaemon } from "../controlcenterd";
import { getSecretsDaemon } from "../secretsd";
import { getAuditDaemon } from "../auditd";
import { getSessionDaemon } from "../sessiond";
import type { ControlCenterCommand, IPCResult, OSAuthMethod, SecretOperation } from "../types";

// ── WiFi Connect Flow (Constrained Handle) ──────────────────

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
    const storeResult = await secretsd.storeSecret(password, "wifi-psk", `user:${userId}`, `WiFi: ${networkName}`);

    // Issue constrained handle for wifid: connect_auth only, single-use, 30s TTL
    if (storeResult.status === "ok" && storeResult.data) {
      secretsd.issueHandle(
        storeResult.data.secretId, "wifid",
        ["connect_auth"], 30000, true
      );
    }
  }

  return { status: result.status === "completed" ? "ok" : result.status === "denied" ? "denied" : "error", error: result.error };
}

// ── VPN Certificate Install Flow (Opaque Handle) ────────────

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

    // Issue sign-only handle for shieldd — key never leaves secretsd
    const secrets = secretsd.listSecrets(`user:${userId}`, "vpn-private-key");
    const vpnSecret = secrets.find(s => s.label === `VPN Key: ${certName}`);
    if (vpnSecret) {
      secretsd.issueHandle(vpnSecret.secretId, "shieldd", ["sign"], 60000, false);
    }

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
  sessionId: string, credential: string, method: OSAuthMethod = "password"
): Promise<IPCResult> {
  const sessiond = getSessionDaemon();
  return sessiond.unlock(sessionId, method, credential);
}

// ── Login → Token Issuance → User Keyring Unlock ────────────

export async function loginFlow(
  userId: string, method: OSAuthMethod, credential: string
): Promise<IPCResult> {
  const sessiond = getSessionDaemon();
  const result = await sessiond.login(userId, method, credential);

  if (result.status === "ok" && result.data) {
    const secretsd = getSecretsDaemon();
    await secretsd.initialize();

    const auditd = getAuditDaemon();
    await auditd.record({
      actorUserId: userId,
      actorSessionId: result.data.sessionId,
      action: "session.login",
      resource: "session",
      decision: "allowed",
      severity: "info",
      metadata: {
        sessionType: result.data.sessionType,
        tokenCount: result.data.tokenIds.length,
      },
    });
  }

  return { status: result.status, error: result.status !== "ok" ? "Login failed" : undefined };
}

// ── Idle → Screensaver → Lock → Token Revocation ────────────

export async function idleToLockFlow(sessionId: string): Promise<IPCResult> {
  const sessiond = getSessionDaemon();
  const session = sessiond.getSession(sessionId);
  if (!session) return { status: "error", error: "Session not found" };

  // Lock triggers sensitive token revocation internally
  const result = sessiond.lock(sessionId);

  if (result.status === "ok") {
    const auditd = getAuditDaemon();
    await auditd.record({
      actorUserId: session.userId,
      actorSessionId: sessionId,
      action: "session.idle-lock",
      resource: "session",
      decision: "allowed",
      severity: "info",
    });
  }

  return result;
}

// ── Suspend → Resume → Policy Evaluation ────────────────────

export async function suspendResumeFlow(
  sessionId: string
): Promise<IPCResult<{ lockRequired: boolean }>> {
  const sessiond = getSessionDaemon();

  // Suspend
  const suspendResult = sessiond.suspendSession(sessionId);
  if (suspendResult.status !== "ok") return suspendResult;

  // Simulate resume (in practice, powerd triggers this)
  const resumeResult = sessiond.resumeSession(sessionId);

  const auditd = getAuditDaemon();
  const session = sessiond.getSession(sessionId);
  if (session) {
    await auditd.record({
      actorUserId: session.userId,
      actorSessionId: sessionId,
      action: "session.suspend-resume",
      resource: "session",
      decision: "allowed",
      severity: "info",
      metadata: { lockRequired: resumeResult.data },
    });
  }

  return resumeResult as IPCResult<{ lockRequired: boolean }>;
}

// ── Fast User Switch Flow ───────────────────────────────────

export async function fastUserSwitchFlow(
  fromSessionId: string, toSessionId: string
): Promise<IPCResult> {
  const sessiond = getSessionDaemon();
  const fromSession = sessiond.getSession(fromSessionId);
  const toSession = sessiond.getSession(toSessionId);

  if (!fromSession || !toSession) {
    return { status: "error", error: "One or both sessions not found" };
  }

  const result = sessiond.switchSession(fromSessionId, toSessionId);

  if (result.status === "ok") {
    const auditd = getAuditDaemon();
    await auditd.record({
      actorUserId: toSession.userId,
      actorSessionId: toSessionId,
      action: "session.switch",
      resource: `from:${fromSession.userId}`,
      decision: "allowed",
      severity: "warning",
    });
  }

  return result;
}

// ── Guest Session Full Teardown ─────────────────────────────

export async function guestTeardownFlow(sessionId: string): Promise<IPCResult> {
  const sessiond = getSessionDaemon();
  const session = sessiond.getSession(sessionId);
  if (!session) return { status: "error", error: "Session not found" };
  if (session.role !== "guest") return { status: "error", error: "Not a guest session" };

  const secretsd = getSecretsDaemon();

  // Destroy ephemeral keyring
  await secretsd.destroyKeyring("ephemeral");

  // Erase any guest-scoped secrets
  const guestSecrets = secretsd.listSecrets(`user:${session.userId}`, undefined, true);
  for (const secret of guestSecrets) {
    secretsd.secureErase(secret.secretId);
  }

  // Teardown session (revokes all tokens)
  const result = sessiond.teardownGuestSession(sessionId);

  // Re-create ephemeral keyring for next guest
  await secretsd.createKeyring("ephemeral", "ephemeral", "standard");

  if (result.status === "ok") {
    const auditd = getAuditDaemon();
    await auditd.record({
      actorUserId: session.userId,
      actorSessionId: sessionId,
      action: "session.guest-teardown",
      resource: "guest-session",
      decision: "allowed",
      severity: "warning",
      metadata: { secretsErased: guestSecrets.length },
    });
  }

  return result;
}

// ── WiFi Connect with Constrained Handle Flow ───────────────

export async function wifiConnectWithHandleFlow(
  sessionId: string, userId: string,
  secretId: string, networkName: string
): Promise<IPCResult> {
  const secretsd = getSecretsDaemon();

  // Issue constrained handle: connect_auth only, single-use, 30s
  const handleResult = secretsd.issueHandle(secretId, "wifid", ["connect_auth"], 30000, true);
  if (handleResult.status !== "ok" || !handleResult.data) {
    return { status: "error", error: "Failed to issue handle for WiFi connect" };
  }

  // wifid uses handle
  const credential = await secretsd.useHandle(handleResult.data.handleId, "wifid", "connect_auth");
  if (credential.status !== "ok") {
    return { status: "error", error: "Failed to retrieve WiFi credential" };
  }

  const auditd = getAuditDaemon();
  await auditd.record({
    actorUserId: userId,
    actorSessionId: sessionId,
    action: "wifi.connect.handle",
    resource: networkName,
    decision: "allowed",
    severity: "info",
  });

  return { status: "ok" };
}

// ── VPN Sign with Opaque Handle Flow ────────────────────────

export async function vpnSignWithHandleFlow(
  sessionId: string, userId: string,
  secretId: string, dataToSign: string
): Promise<IPCResult<string>> {
  const secretsd = getSecretsDaemon();

  // Issue sign-only handle for shieldd
  const handleResult = secretsd.issueHandle(secretId, "shieldd", ["sign"], 60000, false);
  if (handleResult.status !== "ok" || !handleResult.data) {
    return { status: "error", error: "Failed to issue handle for VPN signing" };
  }

  // shieldd uses handle to perform signing (secretsd performs crypto internally)
  const keyResult = await secretsd.useHandle(handleResult.data.handleId, "shieldd", "sign");
  if (keyResult.status !== "ok") {
    return { status: "error", error: "Failed to perform VPN signing operation" };
  }

  // Simulate signature (in real OS, this would be done inside secretsd)
  const signature = `vpn-sig-${crypto.randomUUID().slice(0, 16)}`;

  const auditd = getAuditDaemon();
  await auditd.record({
    actorUserId: userId,
    actorSessionId: sessionId,
    action: "vpn.sign.handle",
    resource: secretId.slice(0, 8),
    decision: "allowed",
    severity: "high",
  });

  return { status: "ok", data: signature };
}
