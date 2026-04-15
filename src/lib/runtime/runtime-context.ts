// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Context
// Unified context: surface + mode + capabilities + trust
// ═══════════════════════════════════════════════════════════════

import type { RuntimeDetectionResult, RuntimeTarget, RuntimeEnvironment } from "./runtime-detection";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import type { RuntimeCapabilityEntry } from "./runtime-capability-matrix";

export interface RuntimeContext {
  /** Detected runtime target and environment */
  detection: RuntimeDetectionResult;

  /** Active reality mode (real/demo/sandbox/dev_demo) */
  realityMode: RealityModeKey;

  /** Available capabilities for this target */
  capabilities: RuntimeCapabilityEntry[];

  /** Trust metadata */
  trust: RuntimeTrustState;

  /** Session metadata */
  session: RuntimeSessionState;

  /** Timestamps */
  bootedAt: string;
  lastHeartbeat: string;
}

export interface RuntimeTrustState {
  isAuthenticated: boolean;
  trustScore: number;
  mfaVerified: boolean;
  sessionValid: boolean;
}

export interface RuntimeSessionState {
  sessionId: string;
  userId: string | null;
  tenantId: string | null;
  locale: string;
  timezone: string;
}

/**
 * Create a default RuntimeContext for a given target and mode.
 */
export function createDefaultRuntimeContext(
  detection: RuntimeDetectionResult,
  realityMode: RealityModeKey = "real"
): RuntimeContext {
  const now = new Date().toISOString();
  return {
    detection,
    realityMode,
    capabilities: [],
    trust: {
      isAuthenticated: false,
      trustScore: 0,
      mfaVerified: false,
      sessionValid: false,
    },
    session: {
      sessionId: crypto.randomUUID(),
      userId: null,
      tenantId: null,
      locale: "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    bootedAt: now,
    lastHeartbeat: now,
  };
}

/**
 * Check if runtime context permits a given operation class.
 */
export function isRuntimeAuthorized(
  ctx: RuntimeContext,
  requiredTrust: number,
  requiresMfa: boolean
): boolean {
  if (!ctx.trust.isAuthenticated) return false;
  if (ctx.trust.trustScore < requiredTrust) return false;
  if (requiresMfa && !ctx.trust.mfaVerified) return false;
  return true;
}
