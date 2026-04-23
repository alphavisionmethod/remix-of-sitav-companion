// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Mode Resolver
// Determines active mode based on environment, tokens, session,
// tenant, route context, and operator overrides
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export type ResolutionSource =
  | "tenant"
  | "feature_flag"
  | "demo_token"
  | "operator_override"
  | "environment_default"
  | "scenario_binding"
  | "other";

export interface ModeResolution {
  mode: RealityModeKey;
  source: ResolutionSource;
  scenarioId?: string;
  scenarioKey?: string;
  policyProfileId?: string;
  sessionId?: string;
  resolvedAt: number;
}

const TOKEN_KEY = "sita-demo-token";
const MODE_OVERRIDE_KEY = "sita-mode-override";

/**
 * Resolve the current reality mode using priority chain:
 * 1. URL param ?demo=<scenario_key> (highest for demo launches)
 * 2. Session override (operator set via admin)
 * 3. Demo token in sessionStorage
 * 4. Environment default (always "real" in production)
 */
export function resolveMode(opts?: {
  searchParams?: URLSearchParams;
  route?: string;
}): ModeResolution {
  const now = Date.now();

  // 1. URL-based demo activation
  const params = opts?.searchParams ?? new URLSearchParams(window.location.search);
  const demoParam = params.get("demo");
  if (demoParam) {
    sessionStorage.setItem(TOKEN_KEY, demoParam);
    return {
      mode: "demo",
      source: "demo_token",
      scenarioKey: demoParam,
      resolvedAt: now,
    };
  }

  // 2. Operator override (set via admin console)
  const override = sessionStorage.getItem(MODE_OVERRIDE_KEY);
  if (override) {
    try {
      const parsed = JSON.parse(override);
      if (parsed.mode && parsed.expiresAt > now) {
        return {
          mode: parsed.mode as RealityModeKey,
          source: "operator_override",
          scenarioId: parsed.scenarioId,
          scenarioKey: parsed.scenarioKey,
          resolvedAt: now,
        };
      }
      sessionStorage.removeItem(MODE_OVERRIDE_KEY);
    } catch {
      sessionStorage.removeItem(MODE_OVERRIDE_KEY);
    }
  }

  // 3. Active demo token
  const demoToken = sessionStorage.getItem(TOKEN_KEY);
  if (demoToken) {
    return {
      mode: "demo",
      source: "demo_token",
      scenarioKey: demoToken,
      resolvedAt: now,
    };
  }

  // 4. Default: real mode
  return {
    mode: "real",
    source: "environment_default",
    resolvedAt: now,
  };
}

/** Set an operator override for demo/sandbox mode */
export function setModeOverride(
  mode: RealityModeKey,
  opts?: { scenarioId?: string; scenarioKey?: string; durationMinutes?: number }
): void {
  const expiresAt = Date.now() + (opts?.durationMinutes ?? 60) * 60 * 1000;
  sessionStorage.setItem(
    MODE_OVERRIDE_KEY,
    JSON.stringify({
      mode,
      scenarioId: opts?.scenarioId,
      scenarioKey: opts?.scenarioKey,
      expiresAt,
    })
  );
}

/** Clear mode override, return to real */
export function clearModeOverride(): void {
  sessionStorage.removeItem(MODE_OVERRIDE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

/** Persist resolution event to DB for audit */
export async function persistResolution(resolution: ModeResolution): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await fromTable("reality_mode_resolutions").insert({
    user_id: user.id,
    resolved_mode: resolution.mode,
    resolution_source: resolution.source,
    scenario_id: resolution.scenarioId,
    session_id: resolution.sessionId,
    route: window.location.pathname,
  });
}
