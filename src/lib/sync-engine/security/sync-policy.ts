// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Policy Engine
// Policy-driven sync restrictions integrated with policyd/wifid/shieldd
// ═══════════════════════════════════════════════════════════════

import type { EncryptionClass } from "../sync-object-model";

/** Policy rule for sync behavior */
export interface SyncPolicyRule {
  id: string;
  name: string;
  description: string;
  category: "network" | "device" | "namespace" | "user" | "encryption" | "schedule";
  /** Whether this rule is enforced */
  enforced: boolean;
  /** Who can override this rule */
  overridableBy: ("admin" | "user" | "none")[];
  /** The policy condition */
  condition: PolicyCondition;
  /** The action to take when condition is met */
  action: PolicyAction;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/** Conditions that trigger a policy */
export interface PolicyCondition {
  type: "network-state" | "device-trust" | "namespace-match" | "user-role" | "time-window" | "data-class" | "composite";
  /** For network-state: trusted, untrusted, metered, roaming, vpn-required */
  networkState?: string;
  /** For device-trust: minimum trust level */
  minTrustLevel?: string;
  /** For namespace-match: namespace prefix or exact */
  namespacePattern?: string;
  /** For user-role: required role */
  userRole?: string;
  /** For time-window: schedule */
  timeWindow?: { startHour: number; endHour: number; days: number[] };
  /** For data-class: encryption class filter */
  dataClass?: EncryptionClass;
  /** For composite: AND/OR sub-conditions */
  operator?: "AND" | "OR";
  subConditions?: PolicyCondition[];
}

/** Action to take when a policy condition is met */
export interface PolicyAction {
  type: "block" | "allow" | "restrict" | "encrypt-upgrade" | "warn" | "log";
  /** For restrict: which operations to restrict */
  restrictedOperations?: ("push" | "pull" | "realtime" | "background")[];
  /** For encrypt-upgrade: minimum encryption class */
  minEncryptionClass?: EncryptionClass;
  /** User-facing message */
  message?: string;
}

/** Policy evaluation result */
export interface PolicyEvaluation {
  allowed: boolean;
  appliedRules: string[];
  restrictions: string[];
  warnings: string[];
  requiredEncryptionClass?: EncryptionClass;
  reason: string;
}

/** Network trust state from wifid/shieldd */
export interface NetworkTrustState {
  networkType: "wifi" | "cellular" | "ethernet" | "vpn" | "unknown";
  trusted: boolean;
  encrypted: boolean;
  metered: boolean;
  roaming: boolean;
  vpnActive: boolean;
  ssid?: string;
  signalStrength?: number;
}

// ─── Default Policy Rules ─────────────────────────────────────

const DEFAULT_POLICIES: SyncPolicyRule[] = [
  {
    id: "pol-01", name: "Block Sync on Untrusted Networks", description: "Prevent sync of sensitive data on untrusted Wi-Fi without VPN",
    category: "network", enforced: true, overridableBy: ["admin"], priority: 10,
    condition: { type: "composite", operator: "AND", subConditions: [
      { type: "network-state", networkState: "untrusted" },
      { type: "data-class", dataClass: "encrypted-at-rest" },
    ]},
    action: { type: "block", message: "Sync paused: untrusted network detected. Connect VPN or switch to trusted Wi-Fi." },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "pol-02", name: "Force E2EE on Sensitive Namespaces", description: "Require end-to-end encryption for finance and secrets namespaces",
    category: "encryption", enforced: true, overridableBy: ["none"], priority: 5,
    condition: { type: "namespace-match", namespacePattern: "settings.network" },
    action: { type: "encrypt-upgrade", minEncryptionClass: "encrypted-at-rest", message: "Network settings require encryption at rest" },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "pol-03", name: "Disable Session Sync for Guests", description: "Guest users cannot sync session/workspace data",
    category: "user", enforced: true, overridableBy: ["admin"], priority: 15,
    condition: { type: "composite", operator: "AND", subConditions: [
      { type: "user-role", userRole: "guest" },
      { type: "namespace-match", namespacePattern: "session." },
    ]},
    action: { type: "block", message: "Session sync is not available for guest accounts." },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "pol-04", name: "Restrict Web Client Data Classes", description: "Web clients cannot access device-bound encrypted data",
    category: "device", enforced: true, overridableBy: ["none"], priority: 8,
    condition: { type: "composite", operator: "AND", subConditions: [
      { type: "device-trust", minTrustLevel: "semi-trusted" },
      { type: "data-class", dataClass: "device-bound" },
    ]},
    action: { type: "block", message: "Device-bound data cannot sync to web clients." },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "pol-05", name: "Metered Connection Restrictions", description: "Limit sync to settings only on metered connections",
    category: "network", enforced: true, overridableBy: ["user"], priority: 20,
    condition: { type: "network-state", networkState: "metered" },
    action: { type: "restrict", restrictedOperations: ["background"], message: "Background sync paused on metered connection." },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "pol-06", name: "Managed Device Sync Control", description: "Admin can disable sync entirely on managed devices",
    category: "device", enforced: false, overridableBy: ["admin"], priority: 1,
    condition: { type: "device-trust", minTrustLevel: "trusted" },
    action: { type: "block", message: "Sync is disabled on this managed device." },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

class SyncPolicyEngine {
  private rules: SyncPolicyRule[] = [...DEFAULT_POLICIES];
  private networkState: NetworkTrustState = {
    networkType: "wifi", trusted: true, encrypted: true,
    metered: false, roaming: false, vpnActive: false,
  };
  private userRole: string = "user";

  /** Evaluate whether a sync operation is allowed */
  evaluate(params: {
    namespace: string;
    encryptionClass: EncryptionClass;
    operation: "push" | "pull" | "realtime" | "background";
    deviceTrustLevel?: string;
  }): PolicyEvaluation {
    const result: PolicyEvaluation = {
      allowed: true,
      appliedRules: [],
      restrictions: [],
      warnings: [],
      reason: "No blocking policies apply",
    };

    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (!rule.enforced) continue;

      if (this.matchesCondition(rule.condition, params)) {
        result.appliedRules.push(rule.id);

        switch (rule.action.type) {
          case "block":
            result.allowed = false;
            result.reason = rule.action.message ?? rule.description;
            return result;
          case "restrict":
            if (rule.action.restrictedOperations?.includes(params.operation)) {
              result.restrictions.push(rule.name);
              if (rule.action.message) result.warnings.push(rule.action.message);
            }
            break;
          case "warn":
            if (rule.action.message) result.warnings.push(rule.action.message);
            break;
          case "encrypt-upgrade":
            result.requiredEncryptionClass = rule.action.minEncryptionClass;
            break;
          case "log":
            // Log only, no action
            break;
        }
      }
    }

    if (result.restrictions.length > 0) {
      result.reason = `Restricted by: ${result.restrictions.join(", ")}`;
    }

    return result;
  }

  /** Update network trust state (from wifid/shieldd) */
  updateNetworkState(state: Partial<NetworkTrustState>): void {
    this.networkState = { ...this.networkState, ...state };
  }

  /** Set user role */
  setUserRole(role: string): void {
    this.userRole = role;
  }

  /** Get current network state */
  getNetworkState(): NetworkTrustState {
    return { ...this.networkState };
  }

  /** Get all policy rules */
  getRules(): SyncPolicyRule[] {
    return [...this.rules];
  }

  /** Get enforced rules */
  getEnforcedRules(): SyncPolicyRule[] {
    return this.rules.filter(r => r.enforced);
  }

  /** Add a custom policy rule */
  addRule(rule: SyncPolicyRule): void {
    this.rules.push(rule);
  }

  /** Update a rule */
  updateRule(ruleId: string, patch: Partial<SyncPolicyRule>): boolean {
    const idx = this.rules.findIndex(r => r.id === ruleId);
    if (idx === -1) return false;
    this.rules[idx] = { ...this.rules[idx], ...patch, id: ruleId, updatedAt: new Date().toISOString() };
    return true;
  }

  /** Toggle rule enforcement */
  toggleEnforcement(ruleId: string, enforced: boolean): boolean {
    return this.updateRule(ruleId, { enforced });
  }

  /** Remove a rule */
  removeRule(ruleId: string): boolean {
    const before = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== ruleId);
    return this.rules.length < before;
  }

  // ─── Internal ───────────────────────────────

  private matchesCondition(condition: PolicyCondition, params: {
    namespace: string;
    encryptionClass: EncryptionClass;
    operation: string;
    deviceTrustLevel?: string;
  }): boolean {
    switch (condition.type) {
      case "network-state":
        if (condition.networkState === "untrusted") return !this.networkState.trusted;
        if (condition.networkState === "metered") return this.networkState.metered;
        if (condition.networkState === "roaming") return this.networkState.roaming;
        if (condition.networkState === "vpn-required") return !this.networkState.vpnActive;
        return false;

      case "device-trust":
        return params.deviceTrustLevel === condition.minTrustLevel;

      case "namespace-match":
        if (!condition.namespacePattern) return false;
        return params.namespace.startsWith(condition.namespacePattern);

      case "user-role":
        return this.userRole === condition.userRole;

      case "data-class":
        return params.encryptionClass === condition.dataClass;

      case "composite":
        if (!condition.subConditions?.length) return false;
        if (condition.operator === "AND") {
          return condition.subConditions.every(sub => this.matchesCondition(sub, params));
        }
        return condition.subConditions.some(sub => this.matchesCondition(sub, params));

      default:
        return false;
    }
  }
}

/** Singleton sync policy engine */
export const syncPolicy = new SyncPolicyEngine();
