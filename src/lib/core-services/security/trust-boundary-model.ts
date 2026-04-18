// ═══════════════════════════════════════════════════════════════
// SITA OS — Trust Boundary Model
// Formal trust zone definitions (A–G), relationship matrix,
// boundary crossing validation, and integration wiring map
// Covers: Master Prompt Sections 2, 3, 32
// ═══════════════════════════════════════════════════════════════

// ── Trust Zones ───────────────────────────────────────────────

export enum TrustZone {
  UserApp       = "user-app",        // Zone A — Zero Trust
  Extension     = "extension",       // Zone B — Ultra-Low Trust
  SystemService = "system-service",  // Zone C — Limited Trust
  Kernel        = "kernel",          // Zone D — Full Trust
  Cloud         = "cloud",           // Zone E — Verified Trust
  MobileApp     = "mobile-app",      // Zone F — Authority Trust
  AdminFounder  = "admin-founder",   // Zone G — Elevated Governance
}

export type TrustLevel = "zero" | "ultra-low" | "limited" | "full" | "verified" | "authority" | "elevated-governance";

const ZONE_TRUST_LEVELS: Record<TrustZone, TrustLevel> = {
  [TrustZone.UserApp]:       "zero",
  [TrustZone.Extension]:     "ultra-low",
  [TrustZone.SystemService]: "limited",
  [TrustZone.Kernel]:        "full",
  [TrustZone.Cloud]:         "verified",
  [TrustZone.MobileApp]:     "authority",
  [TrustZone.AdminFounder]:  "elevated-governance",
};

// ── Privilege Manifests ───────────────────────────────────────

export interface ZonePrivilegeManifest {
  zone: TrustZone;
  trustLevel: TrustLevel;
  allowed: string[];
  denied: string[];
  requiresForAuthority: string[];
}

const ZONE_MANIFESTS: Record<TrustZone, ZonePrivilegeManifest> = {
  [TrustZone.UserApp]: {
    zone: TrustZone.UserApp, trustLevel: "zero",
    allowed: ["run", "request-capabilities", "access-granted-resources", "call-approved-runtime-apis", "emit-app-events"],
    denied: ["access-kernel-internals", "access-other-app-memory", "make-privileged-syscalls", "bypass-sandbox", "impersonate-services", "modify-trust-state", "modify-policy", "modify-sync-truth", "modify-rollout", "modify-approval-state"],
    requiresForAuthority: [],
  },
  [TrustZone.Extension]: {
    zone: TrustZone.Extension, trustLevel: "ultra-low",
    allowed: ["run-sandboxed", "request-limited-capabilities", "emit-scoped-events"],
    denied: ["access-kernel-internals", "access-app-memory", "make-privileged-syscalls", "bypass-sandbox", "impersonate-services", "modify-trust-state", "access-network-unrestricted", "access-filesystem-unrestricted"],
    requiresForAuthority: ["stronger-signing", "review-policy", "resource-budget-enforcement", "kill-switch"],
  },
  [TrustZone.SystemService]: {
    zone: TrustZone.SystemService, trustLevel: "limited",
    allowed: ["perform-scoped-privileged-ops", "interact-kernel-verified", "access-system-storage", "communicate-cloud-service-identity"],
    denied: ["act-outside-capability-scope", "bypass-policy-trust-audit", "impersonate-other-services", "access-unrelated-service-state"],
    requiresForAuthority: ["authenticated-channels"],
  },
  [TrustZone.Kernel]: {
    zone: TrustZone.Kernel, trustLevel: "full",
    allowed: ["process-isolation", "memory-safety-enforcement", "syscall-validation", "scheduling", "hardware-mediation", "sandbox-enforcement", "security-context-enforcement"],
    denied: [],
    requiresForAuthority: ["minimized-codebase", "hardened", "audited", "formally-verified"],
  },
  [TrustZone.Cloud]: {
    zone: TrustZone.Cloud, trustLevel: "verified",
    allowed: ["authenticate-identity", "verify-service-trust", "authorize-requests", "enforce-policy", "maintain-audit", "verify-artifact-integrity"],
    denied: ["trust-unauthenticated-traffic", "trust-client-declared-state", "trust-unverified-attestation", "implicit-internal-trust"],
    requiresForAuthority: ["authenticated-identity", "service-verification", "request-authorization", "policy-enforcement", "audit-existence"],
  },
  [TrustZone.MobileApp]: {
    zone: TrustZone.MobileApp, trustLevel: "authority",
    allowed: ["trusted-control-surface", "remote-approval", "user-authority-proxy", "trust-visibility"],
    denied: ["trust-stale-local-state", "trust-push-payload-as-truth", "bypass-biometric-for-sensitive", "operate-without-session"],
    requiresForAuthority: ["verified-user-identity", "verified-device-trust", "valid-session", "step-up-auth", "policy-compliant-approval"],
  },
  [TrustZone.AdminFounder]: {
    zone: TrustZone.AdminFounder, trustLevel: "elevated-governance",
    allowed: ["elevated-privileged-ops", "policy-management", "system-configuration", "audit-access"],
    denied: ["hidden-super-admin-bypass", "unaudited-actions", "bypass-approval-requirements", "bypass-blast-radius-review"],
    requiresForAuthority: ["short-lived-sessions", "strong-mfa", "heavy-audit", "policy-gated", "approval-aware", "blast-radius-aware"],
  },
};

// ── Trust Relationship Matrix ─────────────────────────────────

export type RelationshipVerdict = "allowed" | "denied" | "conditional";

export interface TrustRelationship {
  source: TrustZone;
  target: TrustZone;
  verdict: RelationshipVerdict;
  conditions: string[];
  description: string;
}

const TRUST_MATRIX: TrustRelationship[] = [
  // UserApp relationships
  { source: TrustZone.UserApp, target: TrustZone.UserApp, verdict: "denied", conditions: [], description: "Apps do not trust other apps" },
  { source: TrustZone.UserApp, target: TrustZone.Extension, verdict: "denied", conditions: [], description: "Apps do not trust plugin code" },
  { source: TrustZone.UserApp, target: TrustZone.SystemService, verdict: "conditional", conditions: ["mediated-runtime-api", "signed-system-surface"], description: "Apps may trust only mediated runtime APIs" },
  { source: TrustZone.UserApp, target: TrustZone.Kernel, verdict: "conditional", conditions: ["mediated-runtime-api"], description: "Apps access kernel only through runtime mediation" },
  { source: TrustZone.UserApp, target: TrustZone.Cloud, verdict: "conditional", conditions: ["authenticated-session", "tls"], description: "Apps trust cloud only after auth + TLS" },

  // SystemService relationships
  { source: TrustZone.SystemService, target: TrustZone.Kernel, verdict: "allowed", conditions: ["verified-interface"], description: "Services trust kernel enforcement" },
  { source: TrustZone.SystemService, target: TrustZone.SystemService, verdict: "conditional", conditions: ["authenticated-channel", "verified-peer"], description: "Services trust authenticated peers only" },
  { source: TrustZone.SystemService, target: TrustZone.Cloud, verdict: "conditional", conditions: ["signed-config", "validated", "version-compatible"], description: "Services trust cloud config only if signed" },
  { source: TrustZone.SystemService, target: TrustZone.UserApp, verdict: "denied", conditions: [], description: "Services do not trust app inputs directly" },

  // Kernel relationships
  { source: TrustZone.Kernel, target: TrustZone.Kernel, verdict: "conditional", conditions: ["verified-boot-chain", "signed-core-binaries"], description: "Kernel trusts only verified boot chain" },
  { source: TrustZone.Kernel, target: TrustZone.UserApp, verdict: "denied", conditions: [], description: "Kernel does not trust userspace memory/pointers" },
  { source: TrustZone.Kernel, target: TrustZone.SystemService, verdict: "conditional", conditions: ["explicit-security-context"], description: "Kernel trusts services within security contexts" },

  // Cloud relationships
  { source: TrustZone.Cloud, target: TrustZone.UserApp, verdict: "conditional", conditions: ["authenticated-identity"], description: "Cloud trusts authenticated device/app identities" },
  { source: TrustZone.Cloud, target: TrustZone.Cloud, verdict: "conditional", conditions: ["authenticated-internal-traffic"], description: "Cloud does not trust unauthenticated internal traffic" },
  { source: TrustZone.Cloud, target: TrustZone.MobileApp, verdict: "conditional", conditions: ["attestation-verified"], description: "Cloud trusts attestation only after verification" },

  // MobileApp relationships
  { source: TrustZone.MobileApp, target: TrustZone.Cloud, verdict: "conditional", conditions: ["authenticated-session", "tls-validated"], description: "Mobile trusts cloud after authenticated session + TLS" },
  { source: TrustZone.MobileApp, target: TrustZone.MobileApp, verdict: "conditional", conditions: ["biometric-verified", "session-valid"], description: "Mobile trusts user after biometric/session" },

  // AdminFounder relationships
  { source: TrustZone.AdminFounder, target: TrustZone.Cloud, verdict: "conditional", conditions: ["strict-scope", "approval-ladder", "audit-trail"], description: "Admin trusted within strict scopes and approvals" },
  { source: TrustZone.AdminFounder, target: TrustZone.Kernel, verdict: "conditional", conditions: ["dual-approval", "blast-radius-review"], description: "Admin must not bypass audit or rollback" },
];

// ── Boundary Crossing Log ─────────────────────────────────────

export interface BoundaryCrossingEvent {
  id: string;
  timestamp: string;
  sourceZone: TrustZone;
  targetZone: TrustZone;
  verdict: RelationshipVerdict;
  action: string;
  actorId: string;
  conditionsMet: string[];
  conditionsFailed: string[];
  blocked: boolean;
  reason: string;
}

// ── Integration Wiring Map ────────────────────────────────────

export interface ZoneIntegration {
  zone: TrustZone;
  integratesWith: string[];
}

const ZONE_INTEGRATIONS: ZoneIntegration[] = [
  { zone: TrustZone.Kernel, integratesWith: ["syscall-firewall", "memory-safety", "sandbox-contexts", "watchdog", "panic-recovery", "secure-boot-chain"] },
  { zone: TrustZone.SystemService, integratesWith: ["service-identity", "limited-trust-scopes", "audit-emitters", "local-watchdogs", "update-trust-chain", "os-agent", "telemetry"] },
  { zone: TrustZone.Cloud, integratesWith: ["zero-trust-authn-authz", "trust-service", "policy-engine", "approval-service", "audit-service", "ai-safety-router", "receipt-service", "health-incident"] },
  { zone: TrustZone.MobileApp, integratesWith: ["biometric-secure-storage", "approval-flows", "trust-history", "command-receipts", "step-up-auth", "push-security", "emergency-actions"] },
  { zone: TrustZone.AdminFounder, integratesWith: ["policy-simulations", "release-gating", "audit-trails", "approval-ladders", "receipt-rollback-visibility", "ai-transparency", "incident-workflows"] },
  { zone: TrustZone.UserApp, integratesWith: ["capability-engine", "sandbox-policy", "app-signing-verification", "trust-hooks", "resource-governor"] },
  { zone: TrustZone.Extension, integratesWith: ["capability-engine", "sandbox-policy", "signing-verification", "kill-switch", "resource-budget"] },
];

// ── Trust Boundary Model Class ────────────────────────────────

export class TrustBoundaryModel {
  private crossingLog: BoundaryCrossingEvent[] = [];
  private readonly maxLogSize = 500;
  private listeners: Array<(event: BoundaryCrossingEvent) => void> = [];

  // ── Zone Info ─────────────────────────────────────────────

  getZoneManifest(zone: TrustZone): ZonePrivilegeManifest {
    return ZONE_MANIFESTS[zone];
  }

  getAllManifests(): ZonePrivilegeManifest[] {
    return Object.values(ZONE_MANIFESTS);
  }

  getZoneTrustLevel(zone: TrustZone): TrustLevel {
    return ZONE_TRUST_LEVELS[zone];
  }

  getZoneIntegrations(zone: TrustZone): string[] {
    return ZONE_INTEGRATIONS.find((z) => z.zone === zone)?.integratesWith ?? [];
  }

  getAllIntegrations(): ZoneIntegration[] {
    return [...ZONE_INTEGRATIONS];
  }

  // ── Relationship Lookup ───────────────────────────────────

  getRelationship(source: TrustZone, target: TrustZone): TrustRelationship | null {
    return TRUST_MATRIX.find((r) => r.source === source && r.target === target) ?? null;
  }

  getFullMatrix(): TrustRelationship[] {
    return [...TRUST_MATRIX];
  }

  // ── Boundary Crossing Validation ──────────────────────────

  validateCrossing(params: {
    sourceZone: TrustZone;
    targetZone: TrustZone;
    action: string;
    actorId: string;
    satisfiedConditions: string[];
  }): BoundaryCrossingEvent {
    const relationship = this.getRelationship(params.sourceZone, params.targetZone);

    let verdict: RelationshipVerdict = "denied";
    let conditionsMet: string[] = [];
    let conditionsFailed: string[] = [];
    let blocked = true;
    let reason = "No trust relationship defined between zones";

    if (relationship) {
      if (relationship.verdict === "allowed") {
        verdict = "allowed";
        blocked = false;
        reason = relationship.description;
        conditionsMet = relationship.conditions;
      } else if (relationship.verdict === "denied") {
        verdict = "denied";
        blocked = true;
        reason = relationship.description;
      } else {
        // Conditional — check all conditions
        conditionsMet = relationship.conditions.filter((c) => params.satisfiedConditions.includes(c));
        conditionsFailed = relationship.conditions.filter((c) => !params.satisfiedConditions.includes(c));
        if (conditionsFailed.length === 0) {
          verdict = "allowed";
          blocked = false;
          reason = `All conditions satisfied: ${conditionsMet.join(", ")}`;
        } else {
          verdict = "denied";
          blocked = true;
          reason = `Missing conditions: ${conditionsFailed.join(", ")}`;
        }
      }
    }

    // Same-zone is always allowed (except explicitly denied in matrix)
    if (params.sourceZone === params.targetZone && !relationship) {
      verdict = "allowed";
      blocked = false;
      reason = "Same-zone communication";
    }

    const event: BoundaryCrossingEvent = {
      id: `bc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      sourceZone: params.sourceZone,
      targetZone: params.targetZone,
      verdict,
      action: params.action,
      actorId: params.actorId,
      conditionsMet,
      conditionsFailed,
      blocked,
      reason,
    };

    this.crossingLog.push(event);
    if (this.crossingLog.length > this.maxLogSize) {
      this.crossingLog = this.crossingLog.slice(-this.maxLogSize);
    }

    for (const listener of this.listeners) {
      try { listener(event); } catch { /* swallow */ }
    }

    return event;
  }

  // ── Crossing Log ──────────────────────────────────────────

  getCrossingLog(limit = 50): BoundaryCrossingEvent[] {
    return this.crossingLog.slice(-limit);
  }

  getBlockedCrossings(limit = 50): BoundaryCrossingEvent[] {
    return this.crossingLog.filter((e) => e.blocked).slice(-limit);
  }

  // ── Events ────────────────────────────────────────────────

  onCrossing(listener: (event: BoundaryCrossingEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Action Validation Against Zone ────────────────────────

  isActionAllowed(zone: TrustZone, action: string): boolean {
    const manifest = ZONE_MANIFESTS[zone];
    if (manifest.denied.includes(action)) return false;
    if (manifest.allowed.includes(action)) return true;
    return false; // Default deny
  }

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const total = this.crossingLog.length;
    const blocked = this.crossingLog.filter((e) => e.blocked).length;
    const allowed = total - blocked;
    const bySourceZone: Record<string, number> = {};
    const byTargetZone: Record<string, number> = {};

    for (const event of this.crossingLog) {
      bySourceZone[event.sourceZone] = (bySourceZone[event.sourceZone] ?? 0) + 1;
      byTargetZone[event.targetZone] = (byTargetZone[event.targetZone] ?? 0) + 1;
    }

    return { total, blocked, allowed, bySourceZone, byTargetZone, logSize: this.crossingLog.length };
  }
}

// ── Factory ───────────────────────────────────────────────────

export function createTrustBoundaryModel(): TrustBoundaryModel {
  return new TrustBoundaryModel();
}
