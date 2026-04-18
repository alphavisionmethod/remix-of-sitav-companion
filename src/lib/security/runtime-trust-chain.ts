// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Trust Chain
// 7 trust zones (A-G) with validation rules and escalation
// ═══════════════════════════════════════════════════════════════

export type TrustZoneId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type TrustLevel = "untrusted" | "basic" | "verified" | "elevated" | "privileged" | "sovereign";
export type ZoneTransitionVerdict = "allow" | "deny" | "challenge" | "escalate";

export interface TrustZoneEntry {
  readonly zoneId: TrustZoneId;
  readonly name: string;
  readonly description: string;
  readonly minTrustLevel: TrustLevel;
  readonly requiresMFA: boolean;
  readonly requiresDeviceAttestation: boolean;
  readonly allowedRoles: readonly string[];
  readonly dataClassification: string;
  readonly auditRequired: boolean;
  readonly networkBoundary: "client" | "edge" | "server" | "isolated";
  readonly maxSessionDurationMs: number;
  readonly examples: readonly string[];
}

export const TRUST_ZONE_REGISTRY: readonly TrustZoneEntry[] = [
  {
    zoneId: "A", name: "UserApps", description: "Standard user-facing application layer",
    minTrustLevel: "basic", requiresMFA: false, requiresDeviceAttestation: false,
    allowedRoles: ["owner", "admin", "member", "viewer", "guest"],
    dataClassification: "internal", auditRequired: false, networkBoundary: "client",
    maxSessionDurationMs: 86400000,
    examples: ["Business dashboard", "Finance views", "Concierge interactions"]
  },
  {
    zoneId: "B", name: "Extensions", description: "Third-party integrations and connectors",
    minTrustLevel: "basic", requiresMFA: false, requiresDeviceAttestation: false,
    allowedRoles: ["owner", "admin", "member"],
    dataClassification: "internal", auditRequired: true, networkBoundary: "edge",
    maxSessionDurationMs: 3600000,
    examples: ["CRM connectors", "OAuth flows", "Webhook receivers"]
  },
  {
    zoneId: "C", name: "SystemServices", description: "Internal platform services and orchestration",
    minTrustLevel: "verified", requiresMFA: false, requiresDeviceAttestation: false,
    allowedRoles: ["owner", "admin"],
    dataClassification: "confidential", auditRequired: true, networkBoundary: "server",
    maxSessionDurationMs: 43200000,
    examples: ["AI Gateway", "Advisor Orchestrator", "Event Bus", "Sync Service"]
  },
  {
    zoneId: "D", name: "Kernel", description: "Core execution primitives and trust enforcement",
    minTrustLevel: "elevated", requiresMFA: true, requiresDeviceAttestation: true,
    allowedRoles: ["owner"],
    dataClassification: "restricted", auditRequired: true, networkBoundary: "isolated",
    maxSessionDurationMs: 3600000,
    examples: ["Policy Engine", "Kill Switch", "Audit Service", "Trust Engine"]
  },
  {
    zoneId: "E", name: "Cloud", description: "Supabase edge functions and cloud-hosted backend",
    minTrustLevel: "verified", requiresMFA: false, requiresDeviceAttestation: false,
    allowedRoles: ["owner", "admin"],
    dataClassification: "confidential", auditRequired: true, networkBoundary: "server",
    maxSessionDurationMs: 43200000,
    examples: ["Edge functions", "Database operations", "Storage API"]
  },
  {
    zoneId: "F", name: "MobileApp", description: "Mobile application runtime with reduced trust",
    minTrustLevel: "basic", requiresMFA: false, requiresDeviceAttestation: true,
    allowedRoles: ["owner", "admin", "member", "viewer"],
    dataClassification: "internal", auditRequired: false, networkBoundary: "client",
    maxSessionDurationMs: 604800000,
    examples: ["Mobile dashboard", "Push notifications", "Biometric auth"]
  },
  {
    zoneId: "G", name: "AdminFounder", description: "Founder/admin control plane with maximum privilege",
    minTrustLevel: "sovereign", requiresMFA: true, requiresDeviceAttestation: true,
    allowedRoles: ["owner"],
    dataClassification: "restricted", auditRequired: true, networkBoundary: "isolated",
    maxSessionDurationMs: 1800000,
    examples: ["Kill switches", "User management", "System configuration", "Boardroom decisions"]
  },
] as const;

export interface ZoneTransitionRule {
  readonly from: TrustZoneId;
  readonly to: TrustZoneId;
  readonly verdict: ZoneTransitionVerdict;
  readonly requiresChallenge: string | null;
  readonly auditOnTransition: boolean;
}

const TRUST_LEVEL_ORDER: Record<TrustLevel, number> = {
  untrusted: 0, basic: 1, verified: 2, elevated: 3, privileged: 4, sovereign: 5,
};

export const ZONE_TRANSITION_RULES: readonly ZoneTransitionRule[] = [
  { from: "A", to: "B", verdict: "allow", requiresChallenge: null, auditOnTransition: false },
  { from: "A", to: "C", verdict: "challenge", requiresChallenge: "role-check", auditOnTransition: true },
  { from: "A", to: "D", verdict: "deny", requiresChallenge: null, auditOnTransition: true },
  { from: "A", to: "G", verdict: "escalate", requiresChallenge: "mfa+attestation", auditOnTransition: true },
  { from: "B", to: "C", verdict: "challenge", requiresChallenge: "scope-validation", auditOnTransition: true },
  { from: "B", to: "E", verdict: "allow", requiresChallenge: null, auditOnTransition: true },
  { from: "C", to: "D", verdict: "challenge", requiresChallenge: "mfa+attestation", auditOnTransition: true },
  { from: "C", to: "E", verdict: "allow", requiresChallenge: null, auditOnTransition: false },
  { from: "F", to: "A", verdict: "allow", requiresChallenge: null, auditOnTransition: false },
  { from: "F", to: "C", verdict: "challenge", requiresChallenge: "biometric+role", auditOnTransition: true },
  { from: "F", to: "G", verdict: "deny", requiresChallenge: null, auditOnTransition: true },
  { from: "G", to: "D", verdict: "allow", requiresChallenge: null, auditOnTransition: true },
] as const;

// ── Query Functions ────────────────────────────────────────────

export function getZone(id: TrustZoneId): TrustZoneEntry {
  return TRUST_ZONE_REGISTRY.find((z) => z.zoneId === id)!;
}

export function getZonesByMinTrust(level: TrustLevel): readonly TrustZoneEntry[] {
  const minOrder = TRUST_LEVEL_ORDER[level];
  return TRUST_ZONE_REGISTRY.filter((z) => TRUST_LEVEL_ORDER[z.minTrustLevel] >= minOrder);
}

export function getTransitionRule(from: TrustZoneId, to: TrustZoneId): ZoneTransitionRule | undefined {
  return ZONE_TRANSITION_RULES.find((r) => r.from === from && r.to === to);
}

export function canTransition(from: TrustZoneId, to: TrustZoneId): ZoneTransitionVerdict {
  const rule = getTransitionRule(from, to);
  if (!rule) {
    const fromZone = getZone(from);
    const toZone = getZone(to);
    return TRUST_LEVEL_ORDER[fromZone.minTrustLevel] >= TRUST_LEVEL_ORDER[toZone.minTrustLevel] ? "allow" : "deny";
  }
  return rule.verdict;
}

export function getHighSecurityZones(): readonly TrustZoneEntry[] {
  return TRUST_ZONE_REGISTRY.filter((z) => z.requiresMFA || z.requiresDeviceAttestation);
}

export function getAuditRequiredZones(): readonly TrustZoneEntry[] {
  return TRUST_ZONE_REGISTRY.filter((z) => z.auditRequired);
}

export function compareTrustLevels(a: TrustLevel, b: TrustLevel): number {
  return TRUST_LEVEL_ORDER[a] - TRUST_LEVEL_ORDER[b];
}
