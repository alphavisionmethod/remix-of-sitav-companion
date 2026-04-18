// ═══════════════════════════════════════════════════════════════
// SITA OS — Orchestration Context
// Unified context for all layers: user, trust, capability, surface
// ═══════════════════════════════════════════════════════════════

import type { OrchestrationDomain } from "./orchestration-types";

export interface OrchestrationContext {
  // User / Identity
  user: UserContext;

  // Trust
  trust: TrustContext;

  // Capability
  capability: CapabilityContext;

  // Surface / Runtime
  surface: SurfaceContext;

  // Business / Domain
  domain: DomainContext;

  // Permission
  permission: PermissionContext;

  // Provenance
  provenance: ProvenanceContext;
}

export interface UserContext {
  userId: string;
  tenantId?: string;
  email?: string;
  displayName?: string;
  isAuthenticated: boolean;
  isDemo: boolean;
  roles: string[];
  sessionId?: string;
}

export interface TrustContext {
  trustGrade: string;
  trustScore: number;
  evidenceGrade: string;
  evidenceCount: number;
  lastVerifiedAt?: string;
  mfaVerified: boolean;
}

export interface CapabilityContext {
  availableCapabilities: string[];
  activeCapabilityId?: string;
  budgetRemaining?: number;
  quotaRemaining?: number;
}

export interface SurfaceContext {
  surfaceType: "desktop" | "mobile" | "wearable" | "api" | "assistant" | "boardroom";
  deviceId?: string;
  viewport?: "desktop" | "tablet" | "mobile";
  isOffline: boolean;
  locale: string;
  timezone: string;
}

export interface DomainContext {
  primaryDomain: OrchestrationDomain;
  activeDomains: OrchestrationDomain[];
  businessState?: Record<string, unknown>;
  financeState?: Record<string, unknown>;
  conciergeState?: Record<string, unknown>;
}

export interface PermissionContext {
  permissions: string[];
  maxAutonomyLevel: number;
  requiresApprovalAbove: number;
  allowFinancial: boolean;
  allowClientFacing: boolean;
  allowCommunication: boolean;
}

export interface ProvenanceContext {
  correlationId: string;
  parentCorrelationId?: string;
  originatingIntent?: string;
  chainDepth: number;
  sourceSystem: string;
}

export function createDefaultContext(userId: string, surfaceType: SurfaceContext["surfaceType"] = "desktop"): OrchestrationContext {
  return {
    user: {
      userId,
      isAuthenticated: true,
      isDemo: false,
      roles: [],
    },
    trust: {
      trustGrade: "standard",
      trustScore: 0.5,
      evidenceGrade: "C",
      evidenceCount: 0,
      mfaVerified: false,
    },
    capability: {
      availableCapabilities: [],
    },
    surface: {
      surfaceType,
      isOffline: false,
      locale: "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    domain: {
      primaryDomain: "platform",
      activeDomains: ["platform"],
    },
    permission: {
      permissions: [],
      maxAutonomyLevel: 1,
      requiresApprovalAbove: 0.8,
      allowFinancial: false,
      allowClientFacing: false,
      allowCommunication: false,
    },
    provenance: {
      correlationId: crypto.randomUUID(),
      chainDepth: 0,
      sourceSystem: "sita-os",
    },
  };
}
