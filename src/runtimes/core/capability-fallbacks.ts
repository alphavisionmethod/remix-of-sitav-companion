// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Fallback Registry
//
// Declarative fallback strategy per (featureId, surface) pair.
// Consumed by runtime guards and the UI degraded-state banner.
// ═══════════════════════════════════════════════════════════════

import type { CanonicalSurface } from "./surface-types";
import {
  FEATURE_CAPABILITY_REGISTRY,
  type FeatureCapabilityEntry,
} from "./feature-capability-registry";

export type FallbackStrategy =
  | "use-cache"           // Serve last-known-good from local cache
  | "queue-and-flush"     // Queue mutation; flush on reconnect
  | "downgrade-ui"        // Render simplified UI
  | "delegate-to-host"    // Hand off to host bridge (Electron/native)
  | "delegate-to-server"  // Defer compute to server
  | "simulate-only"       // Show simulated output with explicit banner
  | "refuse-with-receipt" // Block action and emit refusal receipt
  | "none";               // No fallback exists; surface unsupported

export interface CapabilityFallback {
  featureId: string;
  surface: CanonicalSurface;
  strategy: FallbackStrategy;
  description: string;
  /** Optional UI banner copy when this fallback is active. */
  bannerCopy?: string;
}

export const CAPABILITY_FALLBACKS: readonly CapabilityFallback[] = [
  // Auth offline degradation
  { featureId: "auth-email-password", surface: "offline", strategy: "use-cache",
    description: "Cached session token until expiry.",
    bannerCopy: "Working from cached session — sign in unavailable offline." },
  { featureId: "auth-biometric", surface: "web", strategy: "downgrade-ui",
    description: "Falls back to password when WebAuthn unavailable." },
  { featureId: "auth-biometric", surface: "electron", strategy: "delegate-to-host",
    description: "Uses OS biometric when host bridge exposes it; password otherwise." },

  // Boardroom
  { featureId: "boardroom-session", surface: "offline", strategy: "use-cache",
    description: "Read-only cached sessions; no new generation." },
  { featureId: "boardroom-vote", surface: "offline", strategy: "refuse-with-receipt",
    description: "Voting prohibited offline to preserve proof chain." },

  // CRM
  { featureId: "crm-lead-capture", surface: "offline", strategy: "queue-and-flush",
    description: "Mutation queued by offline sync engine; flushed on reconnect.",
    bannerCopy: "You're offline — changes will sync when you're back online." },
  { featureId: "crm-pipeline-management", surface: "offline", strategy: "queue-and-flush",
    description: "Pipeline updates queued and flushed on reconnect." },

  // Finance
  { featureId: "finance-cashflow", surface: "offline", strategy: "use-cache",
    description: "Cached projections served read-only." },
  { featureId: "finance-payment-execution", surface: "offline", strategy: "refuse-with-receipt",
    description: "Payments must never execute offline." },
  { featureId: "finance-payment-execution", surface: "ios", strategy: "delegate-to-server",
    description: "Step-up biometric then server-side execution." },
  { featureId: "finance-payment-execution", surface: "android", strategy: "delegate-to-server",
    description: "Step-up biometric then server-side execution." },

  // Concierge / Investment / Mission Control / Admin (uniform offline cache)
  { featureId: "concierge-task-prioritization", surface: "offline", strategy: "use-cache",
    description: "Cached priority list; recompute deferred." },
  { featureId: "investment-portfolio", surface: "offline", strategy: "use-cache",
    description: "Cached portfolio snapshot." },
  { featureId: "mission-control-overview", surface: "offline", strategy: "use-cache",
    description: "Cached overview metrics." },
  { featureId: "admin-control-plane", surface: "offline", strategy: "downgrade-ui",
    description: "Read-only triage view; mutations refused." },
  { featureId: "admin-control-plane", surface: "ios", strategy: "downgrade-ui",
    description: "Read-only mobile admin." },
  { featureId: "admin-control-plane", surface: "android", strategy: "downgrade-ui",
    description: "Read-only mobile admin." },

  // Control plane / integrations
  { featureId: "control-plane-kill-switches", surface: "offline", strategy: "refuse-with-receipt",
    description: "Operator emergency controls require live connection." },
  { featureId: "integrations-oauth-connect", surface: "offline", strategy: "refuse-with-receipt",
    description: "OAuth handshake requires network." },
  { featureId: "integrations-webhook-ingest", surface: "offline", strategy: "none",
    description: "Webhook ingestion is server-side; offline is N/A on client." },

  // Proof
  { featureId: "proof-receipt-generation", surface: "offline", strategy: "queue-and-flush",
    description: "Receipts queued; integrity verified on flush." },

  // Runtime / Kernel
  { featureId: "runtime-window-management", surface: "web", strategy: "simulate-only",
    description: "Simulated multi-window via SitaOS shell.",
    bannerCopy: "Multi-window experience is a simulated UX layer." },
  { featureId: "runtime-window-management", surface: "appliance", strategy: "simulate-only",
    description: "Simulated multi-window on appliance display." },
  { featureId: "runtime-deep-linking", surface: "appliance", strategy: "delegate-to-host",
    description: "Appliance host resolves deep links to app routes." },

  // Mobile push
  { featureId: "mobile-push-notifications", surface: "web", strategy: "downgrade-ui",
    description: "Web Push when supported; in-app notifier otherwise." },
  { featureId: "mobile-secure-storage", surface: "web", strategy: "downgrade-ui",
    description: "IndexedDB with encrypted envelope as fallback." },
  { featureId: "mobile-offline-sync", surface: "appliance", strategy: "delegate-to-server",
    description: "Appliance defers to server-resident sync engine." },
] as const;

// ── Lookup helpers ───────────────────────────────────────────
export function getFallback(
  featureId: string,
  surface: CanonicalSurface,
): CapabilityFallback | undefined {
  return CAPABILITY_FALLBACKS.find((f) => f.featureId === featureId && f.surface === surface);
}

export function getFallbacksForFeature(featureId: string): CapabilityFallback[] {
  return CAPABILITY_FALLBACKS.filter((f) => f.featureId === featureId);
}

export function getFallbacksForSurface(surface: CanonicalSurface): CapabilityFallback[] {
  return CAPABILITY_FALLBACKS.filter((f) => f.surface === surface);
}

/**
 * Validate that every degraded/fallback feature/surface combination
 * has a declared fallback. Returns missing pairs.
 */
export function validateFallbackCoverage(): Array<{ featureId: string; surface: CanonicalSurface; state: string }> {
  const missing: Array<{ featureId: string; surface: CanonicalSurface; state: string }> = [];
  for (const feature of FEATURE_CAPABILITY_REGISTRY as readonly FeatureCapabilityEntry[]) {
    for (const [surface, state] of Object.entries(feature.availability)) {
      if (state === "fallback" || state === "degraded") {
        const fallback = getFallback(feature.featureId, surface as CanonicalSurface);
        if (!fallback) {
          missing.push({ featureId: feature.featureId, surface: surface as CanonicalSurface, state });
        }
      }
    }
  }
  return missing;
}
