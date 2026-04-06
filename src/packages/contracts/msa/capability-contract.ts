// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Capability Model
// Surface-neutral capability invocation and portability
// ═══════════════════════════════════════════════════════════════

export type ActionType = "command" | "query" | "workflow" | "event";
export type RiskTier = "low" | "medium" | "high" | "critical";
export type PortabilityClass = "portable" | "web_preferred" | "surface_specific";

export interface CapabilityDefinition {
  id: string;
  capabilityKey: string;
  displayName: string;
  domain: string;
  actionType: ActionType;
  riskTier: RiskTier;
  portabilityClass: PortabilityClass;
  requiresApproval: boolean;
  aiEligible: boolean;
}

export interface CapabilitySurfaceBinding {
  id: string;
  capabilityId: string;
  surfaceId: string;
  bindingStatus: "production" | "beta" | "planned" | "unsupported";
  interactionPattern: string;
  constraints?: Record<string, unknown>;
}

export interface CapabilityPortabilityRecord {
  id: string;
  capabilityId: string;
  surfaceId: string;
  portabilityScore: number;
  blockers: string[];
  evidence: Record<string, unknown>;
  status: "not_assessed" | "portable" | "partial" | "blocked";
}

/** Surface-neutral capability invocation envelope */
export interface CapabilityInvocation {
  capabilityKey: string;
  params: Record<string, unknown>;
  surface: string;
  userId: string;
  mode: "live" | "demo" | "simulation";
  correlationId?: string;
}

/** Capability execution result */
export interface CapabilityResult {
  success: boolean;
  data?: unknown;
  receipt?: { id: string; hash: string; type: string };
  error?: string;
  latencyMs?: number;
}
