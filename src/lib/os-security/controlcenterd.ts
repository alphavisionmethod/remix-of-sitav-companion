// ═══════════════════════════════════════════════════════════════
// SITA OS — controlcenterd: Control Center Daemon
// Authenticated IPC entry point, request routing,
// policy preflight, elevation orchestration
// ═══════════════════════════════════════════════════════════════

import {
  type ControlCenterCommand, type IPCResult, type ElevationRequest,
  type ElevationApprovalToken, type OSSession,
} from "./types";
import { getAuthDaemon } from "./authd";
import { getPolicyDaemon, type EnvironmentalContext, type PolicyDecision } from "./policyd";
import { getAuditDaemon } from "./auditd";
import { getSessionDaemon } from "./sessiond";

// ── Command Result ──────────────────────────────────────────

export interface CommandResult {
  commandId: string;
  status: "completed" | "denied" | "elevation-required" | "error";
  policyDecision: PolicyDecision;
  elevationRequest?: ElevationRequest;
  data?: unknown;
  error?: string;
}

// ── Elevation Callback ──────────────────────────────────────

type ElevationCallback = (request: ElevationRequest) => Promise<{
  approved: boolean;
  credential?: string;
  method?: "password" | "pin" | "biometric" | "security-key";
}>;

// ── ControlCenterD Service ──────────────────────────────────

export class ControlCenterDaemon {
  private environment: EnvironmentalContext = {
    screenLocked: false,
    guestSession: false,
    enterpriseManaged: false,
    publicWifiDetected: false,
    securityLockdown: false,
    vpnActive: false,
  };
  
  private elevationCallback: ElevationCallback | null = null;
  private commandLog: Array<{ command: ControlCenterCommand; result: CommandResult }> = [];
  private serviceHandlers: Map<string, (action: string, payload: Record<string, unknown>, token?: ElevationApprovalToken) => Promise<IPCResult>> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  // ── Environment Updates ─────────────────────────────────

  updateEnvironment(partial: Partial<EnvironmentalContext>): void {
    this.environment = { ...this.environment, ...partial };
  }

  getEnvironment(): EnvironmentalContext {
    return { ...this.environment };
  }

  // ── Elevation UI Registration ───────────────────────────

  setElevationCallback(cb: ElevationCallback): void {
    this.elevationCallback = cb;
  }

  // ── Service Handler Registration ────────────────────────

  registerServiceHandler(
    servicePrefix: string,
    handler: (action: string, payload: Record<string, unknown>, token?: ElevationApprovalToken) => Promise<IPCResult>
  ): void {
    this.serviceHandlers.set(servicePrefix, handler);
  }

  // ── Main Command Entry Point ────────────────────────────

  async executeCommand(command: ControlCenterCommand): Promise<CommandResult> {
    const correlationId = crypto.randomUUID();
    const policyd = getPolicyDaemon();
    const auditd = getAuditDaemon();
    const sessiond = getSessionDaemon();

    // 1. Validate caller session
    const session = sessiond.getSession(command.callerSessionId);
    if (!session) {
      const result: CommandResult = {
        commandId: command.commandId,
        status: "error",
        policyDecision: { allowed: false, reason: "Invalid session", elevationRequired: false, freshAuthRequired: false, severity: "warning" },
        error: "Session not found",
      };
      this.logCommand(command, result);
      return result;
    }

    // Update environment from session state
    this.environment.screenLocked = session.locked;
    this.environment.guestSession = session.role === "guest";

    // 2. Policy preflight
    const decision = policyd.evaluate(command.action, session, this.environment, correlationId);

    // 3. If denied outright
    if (!decision.allowed && !decision.elevationRequired) {
      await auditd.logAuthorization(
        command.callerUserId, command.callerSessionId,
        command.action, "denied", decision.severity, decision.reason
      );

      const result: CommandResult = {
        commandId: command.commandId,
        status: "denied",
        policyDecision: decision,
        error: decision.reason,
      };
      this.logCommand(command, result);
      return result;
    }

    // 4. If elevation required
    if (decision.elevationRequired) {
      return this.handleElevation(command, session, decision, correlationId);
    }

    // 5. If fresh auth required
    if (decision.freshAuthRequired) {
      const authd = getAuthDaemon();
      if (!authd.isAuthFresh(session.sessionId)) {
        const elevationRequest: ElevationRequest = {
          requestId: crypto.randomUUID(),
          sessionId: session.sessionId,
          userId: session.userId,
          action: command.action,
          targetService: this.resolveTargetService(command.action),
          requestedAt: Date.now(),
          riskLevel: "medium",
          impactDescription: `Re-authentication required for: ${decision.matchedPolicy?.displayName || command.action}`,
        };

        const result: CommandResult = {
          commandId: command.commandId,
          status: "elevation-required",
          policyDecision: decision,
          elevationRequest,
        };
        this.logCommand(command, result);
        return result;
      }
    }

    // 6. Execute via service handler
    return this.dispatchToService(command, session, decision, correlationId);
  }

  // ── Elevation Handling ──────────────────────────────────

  private async handleElevation(
    command: ControlCenterCommand,
    session: OSSession,
    decision: PolicyDecision,
    correlationId: string
  ): Promise<CommandResult> {
    const auditd = getAuditDaemon();
    const authd = getAuthDaemon();

    const elevationRequest: ElevationRequest = {
      requestId: crypto.randomUUID(),
      sessionId: session.sessionId,
      userId: session.userId,
      action: command.action,
      targetService: this.resolveTargetService(command.action),
      requestedAt: Date.now(),
      riskLevel: decision.severity === "critical" ? "critical" : decision.severity === "high" ? "high" : "medium",
      impactDescription: decision.matchedPolicy?.description || `Privileged action: ${command.action}`,
      requesterApp: command.callerService,
    };

    // If no elevation callback, return elevation-required for UI to handle
    if (!this.elevationCallback) {
      const result: CommandResult = {
        commandId: command.commandId,
        status: "elevation-required",
        policyDecision: decision,
        elevationRequest,
      };
      this.logCommand(command, result);
      return result;
    }

    // Invoke secure prompt
    const approval = await this.elevationCallback(elevationRequest);

    if (!approval.approved || !approval.credential) {
      await auditd.logElevation(session.userId, session.sessionId, command.action, false);
      const result: CommandResult = {
        commandId: command.commandId,
        status: "denied",
        policyDecision: decision,
        error: "Elevation denied by user",
      };
      this.logCommand(command, result);
      return result;
    }

    // Verify credential and issue token
    const tokenResult = await authd.beginElevation(
      session.sessionId,
      command.action,
      this.resolveTargetService(command.action),
      approval.credential,
      approval.method || "password"
    );

    if (tokenResult.status !== "ok" || !tokenResult.data) {
      await auditd.logElevation(session.userId, session.sessionId, command.action, false, approval.method);
      const result: CommandResult = {
        commandId: command.commandId,
        status: "denied",
        policyDecision: decision,
        error: tokenResult.error || "Elevation authentication failed",
      };
      this.logCommand(command, result);
      return result;
    }

    await auditd.logElevation(session.userId, session.sessionId, command.action, true, approval.method);

    // Dispatch with token
    return this.dispatchToService(command, session, decision, correlationId, tokenResult.data);
  }

  // ── Service Dispatch ────────────────────────────────────

  private async dispatchToService(
    command: ControlCenterCommand,
    session: OSSession,
    decision: PolicyDecision,
    correlationId: string,
    token?: ElevationApprovalToken
  ): Promise<CommandResult> {
    const auditd = getAuditDaemon();
    const servicePrefix = command.action.split(".")[0];
    const handler = this.serviceHandlers.get(servicePrefix);

    if (handler) {
      try {
        const serviceResult = await handler(command.action, command.payload, token);
        await auditd.logAuthorization(
          command.callerUserId, command.callerSessionId,
          command.action,
          serviceResult.status === "ok" ? "allowed" : "denied",
          decision.severity
        );

        const result: CommandResult = {
          commandId: command.commandId,
          status: serviceResult.status === "ok" ? "completed" : "error",
          policyDecision: decision,
          data: serviceResult.data,
          error: serviceResult.error,
        };
        this.logCommand(command, result);
        return result;
      } catch (err) {
        const result: CommandResult = {
          commandId: command.commandId,
          status: "error",
          policyDecision: decision,
          error: `Service error: ${err instanceof Error ? err.message : "Unknown"}`,
        };
        this.logCommand(command, result);
        return result;
      }
    }

    // No handler — mark as completed (action acknowledged)
    await auditd.logAuthorization(
      command.callerUserId, command.callerSessionId,
      command.action, "allowed", decision.severity
    );

    const result: CommandResult = {
      commandId: command.commandId,
      status: "completed",
      policyDecision: decision,
    };
    this.logCommand(command, result);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────

  private resolveTargetService(action: string): string {
    const prefix = action.split(".")[0];
    const serviceMap: Record<string, string> = {
      wifi: "wifid", bluetooth: "btd", shield: "shieldd",
      power: "powerd", cert: "certd", audit: "auditd",
      secrets: "secretsd", session: "sessiond", user: "authd",
      security: "policyd",
    };
    return serviceMap[prefix] || "controlcenterd";
  }

  private logCommand(command: ControlCenterCommand, result: CommandResult): void {
    this.commandLog.push({ command, result });
    if (this.commandLog.length > 5000) this.commandLog = this.commandLog.slice(-2500);
  }

  getCommandLog(limit = 100) {
    return this.commandLog.slice(-limit);
  }

  getStats() {
    return {
      commandsProcessed: this.commandLog.length,
      registeredHandlers: this.serviceHandlers.size,
      environment: this.environment,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _controlcenterd: ControlCenterDaemon | null = null;
export function getControlCenterDaemon(): ControlCenterDaemon {
  if (!_controlcenterd) _controlcenterd = new ControlCenterDaemon();
  return _controlcenterd;
}
