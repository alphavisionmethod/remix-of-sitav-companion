// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Capability Registry
//
// Phase 2 of Meta-Architecture. Maps APP-LEVEL FEATURES (not raw
// hardware capabilities) to each canonical surface with explicit
// support state. This is the source of truth that:
//   - UI gating consults via runtime guards
//   - Launch-honesty enforcement reads from
//   - Mobile parity dashboards summarize
//   - Release readiness CI gates check
//
// Every entry MUST point to a real bounded context in the
// bounded-context registry (Phase 1).
// ═══════════════════════════════════════════════════════════════

import type { CanonicalSurface } from "./surface-types";
import { CANONICAL_SURFACES } from "./surface-types";
import type { BoundedContextId } from "@/platform/architecture/bounded-context-types";

/** Per-surface capability availability state. */
export type FeatureAvailability =
  | "supported"     // Fully available, real implementation
  | "simulated"     // Visible but backed by simulation/mock data
  | "degraded"      // Available with reduced functionality
  | "fallback"      // Works via degraded fallback path
  | "prohibited"    // MUST NOT be exposed on this surface
  | "roadmap"       // Planned, not yet implemented
  | "unsupported";  // Surface cannot host this feature

export interface FeatureCapabilityEntry {
  /** Stable feature id (kebab-case). */
  featureId: string;
  /** Human-readable feature name. */
  name: string;
  /** Owning bounded context (foreign key to bounded-context-registry). */
  contextId: BoundedContextId;
  /** Per-surface availability matrix. */
  availability: Record<CanonicalSurface, FeatureAvailability>;
  /** Per-surface notes (rendered in admin explorer). */
  notes?: Partial<Record<CanonicalSurface, string>>;
  /** Honesty caveat surfaced in launch readiness reports. */
  launchHonestyNote?: string;
  /** Support consequence if this feature is unavailable on a target surface. */
  supportConsequence?: string;
  /** Optional fallback feature id consumed when this one is degraded. */
  fallbackFeatureId?: string;
}

// ── Helpers ──────────────────────────────────────────────────
function uniform(state: FeatureAvailability): Record<CanonicalSurface, FeatureAvailability> {
  return CANONICAL_SURFACES.reduce((acc, s) => {
    acc[s] = state;
    return acc;
  }, {} as Record<CanonicalSurface, FeatureAvailability>);
}

function override(
  base: FeatureAvailability,
  overrides: Partial<Record<CanonicalSurface, FeatureAvailability>>,
): Record<CanonicalSurface, FeatureAvailability> {
  return { ...uniform(base), ...overrides };
}

// ── Registry ─────────────────────────────────────────────────
export const FEATURE_CAPABILITY_REGISTRY: readonly FeatureCapabilityEntry[] = [
  // Auth / Identity
  {
    featureId: "auth-email-password",
    name: "Email/Password Authentication",
    contextId: "setup-identity",
    availability: override("supported", { offline: "degraded" }),
    notes: { offline: "Cached session only; new sign-in requires network." },
    supportConsequence: "Users cannot sign in when offline beyond cache TTL.",
  },
  {
    featureId: "auth-biometric",
    name: "Biometric Authentication (WebAuthn / Face ID / Touch ID)",
    contextId: "setup-identity",
    availability: override("supported", {
      web: "fallback",
      electron: "fallback",
      appliance: "unsupported",
      offline: "supported",
      demo: "simulated",
    }),
    notes: {
      web: "WebAuthn where browser supports; otherwise password fallback.",
      appliance: "Hardware varies; not assumed.",
    },
    launchHonestyNote: "Do not claim Face ID parity on appliance surfaces.",
  },

  // Boardroom
  {
    featureId: "boardroom-session",
    name: "Boardroom Session Generation",
    contextId: "boardroom",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
    notes: { offline: "Read-only of cached sessions; no new generation." },
  },
  {
    featureId: "boardroom-vote",
    name: "Boardroom Decision Voting",
    contextId: "boardroom",
    availability: override("supported", { offline: "prohibited", demo: "simulated" }),
    supportConsequence: "Decisions cannot be cast offline — would break proof chain.",
  },

  // Business OS
  {
    featureId: "crm-lead-capture",
    name: "CRM Lead Capture",
    contextId: "business-os",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
    notes: { offline: "Queued in offline sync engine; flushed on reconnect." },
  },
  {
    featureId: "crm-pipeline-management",
    name: "CRM Pipeline Management",
    contextId: "business-os",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
  },

  // Finance OS
  {
    featureId: "finance-cashflow",
    name: "Cashflow Analysis",
    contextId: "finance-os",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
    notes: { offline: "Cached projections only; no fresh recompute." },
  },
  {
    featureId: "finance-payment-execution",
    name: "Payment Execution",
    contextId: "finance-os",
    availability: override("supported", {
      offline: "prohibited",
      demo: "simulated",
      ios: "degraded",
      android: "degraded",
    }),
    notes: {
      ios: "Requires biometric step-up.",
      android: "Requires biometric step-up.",
    },
    launchHonestyNote: "Payments must never be executed offline; queueing prohibited.",
    supportConsequence: "Failed payment attempts must surface explicit refusal receipt.",
  },

  // Concierge OS
  {
    featureId: "concierge-task-prioritization",
    name: "Task Prioritization",
    contextId: "concierge-os",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
  },

  // Investment Office
  {
    featureId: "investment-portfolio",
    name: "Investment Portfolio View",
    contextId: "investment-office",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
  },

  // Mission Control
  {
    featureId: "mission-control-overview",
    name: "Mission Control Overview",
    contextId: "mission-control",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
  },

  // Cloud Control Plane
  {
    featureId: "control-plane-kill-switches",
    name: "Kill Switch Console",
    contextId: "cloud-control-plane",
    availability: override("supported", { offline: "prohibited", demo: "simulated" }),
    launchHonestyNote: "Operator emergency controls must require live connection.",
  },

  // Integrations
  {
    featureId: "integrations-oauth-connect",
    name: "OAuth Connector Connection",
    contextId: "integrations",
    availability: override("supported", { offline: "prohibited", demo: "simulated" }),
  },
  {
    featureId: "integrations-webhook-ingest",
    name: "Webhook Ingestion",
    contextId: "integrations",
    availability: override("supported", { offline: "unsupported", demo: "simulated" }),
  },

  // Proof / Trust
  {
    featureId: "proof-receipt-generation",
    name: "Proof Receipt Generation",
    contextId: "proof-trust",
    availability: override("supported", { offline: "degraded", demo: "simulated" }),
    notes: { offline: "Receipts queued for chain; integrity verified on flush." },
  },
  {
    featureId: "proof-chain-verification",
    name: "Proof Chain Verification",
    contextId: "proof-trust",
    availability: override("supported", { offline: "supported", demo: "simulated" }),
    notes: { offline: "Local verification against cached chain head." },
  },

  // Runtime / Kernel
  {
    featureId: "runtime-window-management",
    name: "Window Management (multi-window)",
    contextId: "runtime-kernel",
    availability: {
      web: "simulated",
      electron: "supported",
      appliance: "simulated",
      ios: "unsupported",
      android: "unsupported",
      offline: "supported",
      demo: "simulated",
      real: "supported",
    },
    launchHonestyNote: "Multi-window on web/appliance is a UX simulation, not real OS.",
  },
  {
    featureId: "runtime-system-tray",
    name: "System Tray Integration",
    contextId: "runtime-kernel",
    availability: {
      web: "unsupported",
      electron: "supported",
      appliance: "unsupported",
      ios: "unsupported",
      android: "unsupported",
      offline: "supported",
      demo: "simulated",
      real: "supported",
    },
  },
  {
    featureId: "runtime-deep-linking",
    name: "Deep Link Handling",
    contextId: "runtime-kernel",
    availability: override("supported", { offline: "degraded", demo: "simulated", appliance: "fallback" }),
  },

  // Mobile
  {
    featureId: "mobile-push-notifications",
    name: "Push Notifications",
    contextId: "mobile",
    availability: {
      web: "fallback",
      electron: "supported",
      appliance: "unsupported",
      ios: "supported",
      android: "supported",
      offline: "unsupported",
      demo: "simulated",
      real: "supported",
    },
    notes: {
      web: "Web Push where browser supports; otherwise none.",
      appliance: "No mobile transport on appliance form factor.",
    },
  },
  {
    featureId: "mobile-offline-sync",
    name: "Offline Sync Engine",
    contextId: "mobile",
    availability: override("supported", { appliance: "fallback" }),
  },
  {
    featureId: "mobile-secure-storage",
    name: "Secure Mobile Storage (Keychain/Keystore)",
    contextId: "mobile",
    availability: {
      web: "fallback",
      electron: "supported",
      appliance: "unsupported",
      ios: "supported",
      android: "supported",
      offline: "supported",
      demo: "simulated",
      real: "supported",
    },
  },

  // Admin
  {
    featureId: "admin-control-plane",
    name: "Admin Control Plane",
    contextId: "admin",
    availability: override("supported", { offline: "degraded", demo: "simulated", ios: "degraded", android: "degraded" }),
    notes: {
      ios: "Mobile admin is read-only triage view.",
      android: "Mobile admin is read-only triage view.",
    },
  },
] as const;

// ── Lookup helpers ───────────────────────────────────────────
export function getFeatureCapability(featureId: string): FeatureCapabilityEntry | undefined {
  return FEATURE_CAPABILITY_REGISTRY.find((f) => f.featureId === featureId);
}

export function getFeaturesByContext(contextId: BoundedContextId): FeatureCapabilityEntry[] {
  return FEATURE_CAPABILITY_REGISTRY.filter((f) => f.contextId === contextId);
}

export function getFeaturesBySurfaceState(
  surface: CanonicalSurface,
  state: FeatureAvailability,
): FeatureCapabilityEntry[] {
  return FEATURE_CAPABILITY_REGISTRY.filter((f) => f.availability[surface] === state);
}

export function getFeatureAvailability(
  featureId: string,
  surface: CanonicalSurface,
): FeatureAvailability | undefined {
  return getFeatureCapability(featureId)?.availability[surface];
}

export function isFeatureUsableOnSurface(featureId: string, surface: CanonicalSurface): boolean {
  const state = getFeatureAvailability(featureId, surface);
  return state === "supported" || state === "degraded" || state === "fallback" || state === "simulated";
}

export function isFeatureProhibitedOnSurface(featureId: string, surface: CanonicalSurface): boolean {
  return getFeatureAvailability(featureId, surface) === "prohibited";
}

export function getFeatureCapabilitySummary(): {
  totalFeatures: number;
  bySurface: Record<CanonicalSurface, Record<FeatureAvailability, number>>;
} {
  const bySurface = {} as Record<CanonicalSurface, Record<FeatureAvailability, number>>;
  for (const surface of CANONICAL_SURFACES) {
    bySurface[surface] = {
      supported: 0, simulated: 0, degraded: 0, fallback: 0,
      prohibited: 0, roadmap: 0, unsupported: 0,
    };
  }
  for (const feature of FEATURE_CAPABILITY_REGISTRY) {
    for (const surface of CANONICAL_SURFACES) {
      bySurface[surface][feature.availability[surface]]++;
    }
  }
  return { totalFeatures: FEATURE_CAPABILITY_REGISTRY.length, bySurface };
}
