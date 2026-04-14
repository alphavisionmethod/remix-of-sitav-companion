// ═══════════════════════════════════════════════════════════════
// SITA OS — policyd: Authorization Daemon
// RBAC + Capability evaluation, deny-by-default,
// contextual policy checks, decision logging
// ═══════════════════════════════════════════════════════════════

import {
  type OSSession, type OSUserRole, type ActionPolicy, type IPCResult,
  type AuditSeverity, type ServiceIdentity,
  ACTION_AUTHORIZATION_TABLE, DEFAULT_ROLE_CAPABILITIES, hasRequiredRole,
} from "./types";
import { getAuthDaemon } from "./authd";

// ── Environmental Context ───────────────────────────────────

export interface EnvironmentalContext {
  screenLocked: boolean;
  guestSession: boolean;
  enterpriseManaged: boolean;
  publicWifiDetected: boolean;
  securityLockdown: boolean;
  vpnActive: boolean;
  batteryLevel?: number;
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  elevationRequired: boolean;
  freshAuthRequired: boolean;
  matchedPolicy?: ActionPolicy;
  severity: AuditSeverity;
  environmentalOverrides?: string[];
}

// ── Service Identity Registry ───────────────────────────────

const SERVICE_REGISTRY: Map<string, ServiceIdentity> = new Map();

export function registerService(identity: ServiceIdentity): void {
  SERVICE_REGISTRY.set(identity.serviceName, identity);
}

export function getServiceIdentity(name: string): ServiceIdentity | undefined {
  return SERVICE_REGISTRY.get(name);
}

// ── PolicyD Service ─────────────────────────────────────────

export class PolicyDaemon {
  private decisionLog: Array<{
    timestamp: number;
    sessionId: string;
    action: string;
    decision: PolicyDecision;
    correlationId: string;
  }> = [];

  private customPolicies: ActionPolicy[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Register default system services
    const systemServices: ServiceIdentity[] = [
      { serviceName: "wifid", serviceUid: "sita-wifid", allowedActions: ["wifi.toggle", "wifi.connect.open", "wifi.connect.secure", "wifi.forget"], secretScopes: ["wifi-psk"], privileged: true, registeredAt: Date.now() },
      { serviceName: "btd", serviceUid: "sita-btd", allowedActions: ["bluetooth.toggle", "bluetooth.pair", "bluetooth.unpair"], secretScopes: ["bluetooth-bond-key"], privileged: true, registeredAt: Date.now() },
      { serviceName: "shieldd", serviceUid: "sita-shieldd", allowedActions: ["shield.vpn.toggle", "shield.vpn.configure", "shield.firewall.toggle", "shield.firewall.disable", "shield.firewall.rules"], secretScopes: ["vpn-private-key", "certificate-private-key"], privileged: true, registeredAt: Date.now() },
      { serviceName: "powerd", serviceUid: "sita-powerd", allowedActions: ["power.profile.set", "power.shutdown", "power.reboot"], secretScopes: [], privileged: true, registeredAt: Date.now() },
      { serviceName: "certd", serviceUid: "sita-certd", allowedActions: ["cert.install.user", "cert.install.system", "cert.remove"], secretScopes: ["certificate-private-key"], privileged: true, registeredAt: Date.now() },
      { serviceName: "auditd", serviceUid: "sita-auditd", allowedActions: ["audit.view", "audit.export"], secretScopes: [], privileged: true, registeredAt: Date.now() },
    ];

    for (const svc of systemServices) {
      registerService(svc);
    }

    this.initialized = true;
  }

  // ── Core Evaluation ─────────────────────────────────────

  evaluate(
    action: string,
    session: OSSession,
    environment: EnvironmentalContext,
    correlationId?: string
  ): PolicyDecision {
    const corrId = correlationId || crypto.randomUUID();

    // 1. Find matching policy
    const policy = this.findPolicy(action);
    if (!policy) {
      const decision: PolicyDecision = {
        allowed: false,
        reason: `No policy found for action: ${action}. Deny by default.`,
        elevationRequired: false,
        freshAuthRequired: false,
        severity: "warning",
      };
      this.logDecision(session.sessionId, action, decision, corrId);
      return decision;
    }

    const overrides: string[] = [];

    // 2. Check locked session
    if (session.locked && !policy.lockedSessionAllowed) {
      const decision: PolicyDecision = {
        allowed: false,
        reason: "Action not allowed while session is locked",
        elevationRequired: false,
        freshAuthRequired: true,
        matchedPolicy: policy,
        severity: "warning",
      };
      this.logDecision(session.sessionId, action, decision, corrId);
      return decision;
    }

    // 3. Check role
    if (!hasRequiredRole(session.role, policy.requiredRole)) {
      const decision: PolicyDecision = {
        allowed: false,
        reason: `Insufficient role: requires ${policy.requiredRole}, user has ${session.role}`,
        elevationRequired: policy.elevationRequired,
        freshAuthRequired: policy.freshAuthRequired,
        matchedPolicy: policy,
        severity: policy.auditSeverity,
      };
      this.logDecision(session.sessionId, action, decision, corrId);
      return decision;
    }

    // 4. Check capability
    if (!session.capabilities.includes(policy.requiredCapability)) {
      const decision: PolicyDecision = {
        allowed: false,
        reason: `Missing capability: ${policy.requiredCapability}`,
        elevationRequired: false,
        freshAuthRequired: false,
        matchedPolicy: policy,
        severity: "warning",
      };
      this.logDecision(session.sessionId, action, decision, corrId);
      return decision;
    }

    // 5. Environmental overrides
    if (environment.securityLockdown) {
      const lockdownDenied = ["shield.firewall.disable", "security.baseline.change", "cert.install.system"];
      if (lockdownDenied.includes(action)) {
        overrides.push("security-lockdown-active");
        const decision: PolicyDecision = {
          allowed: false,
          reason: "Action blocked: security lockdown mode is active",
          elevationRequired: false,
          freshAuthRequired: false,
          matchedPolicy: policy,
          severity: "critical",
          environmentalOverrides: overrides,
        };
        this.logDecision(session.sessionId, action, decision, corrId);
        return decision;
      }
    }

    if (environment.guestSession && policy.requiredRole !== "guest") {
      overrides.push("guest-session-restriction");
    }

    if (environment.publicWifiDetected && action.startsWith("secrets.")) {
      overrides.push("public-wifi-secret-access-warning");
    }

    // 6. Check auth freshness
    const authd = getAuthDaemon();
    const needsFresh = policy.freshAuthRequired && !authd.isAuthFresh(session.sessionId);

    // 7. Build result
    const decision: PolicyDecision = {
      allowed: !policy.elevationRequired || false, // elevation-required means not auto-allowed
      reason: policy.elevationRequired
        ? `Action requires elevation: ${policy.description}`
        : `Action allowed: ${policy.description}`,
      elevationRequired: policy.elevationRequired,
      freshAuthRequired: needsFresh,
      matchedPolicy: policy,
      severity: policy.auditSeverity,
      environmentalOverrides: overrides.length > 0 ? overrides : undefined,
    };

    // If no elevation needed, allow it
    if (!policy.elevationRequired) {
      decision.allowed = true;
    }

    this.logDecision(session.sessionId, action, decision, corrId);
    return decision;
  }

  // ── Explain ─────────────────────────────────────────────

  explain(action: string): { policy: ActionPolicy | null; capabilities: string[]; roles: OSUserRole[] } {
    const policy = this.findPolicy(action);
    if (!policy) return { policy: null, capabilities: [], roles: [] };

    const roles: OSUserRole[] = [];
    for (const [role, caps] of Object.entries(DEFAULT_ROLE_CAPABILITIES)) {
      if (caps.includes(policy.requiredCapability)) {
        roles.push(role as OSUserRole);
      }
    }

    return { policy, capabilities: [policy.requiredCapability], roles };
  }

  // ── Service Authorization ───────────────────────────────

  authorizeService(serviceName: string, action: string): boolean {
    const svc = SERVICE_REGISTRY.get(serviceName);
    if (!svc) return false;
    return svc.allowedActions.includes(action);
  }

  // ── Policy Management ───────────────────────────────────

  addCustomPolicy(policy: ActionPolicy): void {
    this.customPolicies.push(policy);
  }

  private findPolicy(action: string): ActionPolicy | undefined {
    // Custom policies take precedence
    return this.customPolicies.find(p => p.action === action)
      || ACTION_AUTHORIZATION_TABLE.find(p => p.action === action);
  }

  // ── Decision Log ────────────────────────────────────────

  private logDecision(sessionId: string, action: string, decision: PolicyDecision, correlationId: string) {
    this.decisionLog.push({
      timestamp: Date.now(),
      sessionId,
      action,
      decision,
      correlationId,
    });
    if (this.decisionLog.length > 10000) {
      this.decisionLog = this.decisionLog.slice(-5000);
    }
  }

  getDecisionLog(limit = 100) {
    return this.decisionLog.slice(-limit);
  }

  getRegisteredServices(): ServiceIdentity[] {
    return Array.from(SERVICE_REGISTRY.values());
  }

  getStats() {
    return {
      totalPolicies: ACTION_AUTHORIZATION_TABLE.length + this.customPolicies.length,
      registeredServices: SERVICE_REGISTRY.size,
      decisionLogSize: this.decisionLog.length,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _policyd: PolicyDaemon | null = null;
export function getPolicyDaemon(): PolicyDaemon {
  if (!_policyd) _policyd = new PolicyDaemon();
  return _policyd;
}
