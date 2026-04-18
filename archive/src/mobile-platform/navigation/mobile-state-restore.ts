// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile State Restore
// Centralized cold-start / warm-resume / deep-link decisions.
// ═══════════════════════════════════════════════════════════════

import type { StateRestoreRequest, StateRestoreDecision } from "../contracts/state-restore-contract";
import { resolveDeepLink } from "./mobile-deep-link-map";
import { getMobileRouteEntry } from "./mobile-route-registry";

const STALE_RESUME_THRESHOLD_SECONDS = 60 * 30; // 30 min

export function decideStateRestore(req: StateRestoreRequest): StateRestoreDecision {
  // Deep-link / push-open path
  if ((req.mode === "deep-link" || req.mode === "push-open") && req.deepLinkKey) {
    const resolved = resolveDeepLink(req.deepLinkKey) ?? resolveDeepLink(`sita:/${req.deepLinkKey.startsWith("/") ? req.deepLinkKey : "/" + req.deepLinkKey}`);
    if (resolved) {
      return {
        targetRoute: resolved.routePath,
        requireBiometric: resolved.authRequirement === "biometric",
        allowStaleHydration: false,
        reason: `${req.mode}:resolved`,
      };
    }
    return { targetRoute: "/mobile", requireBiometric: false, allowStaleHydration: false, reason: `${req.mode}:unresolved` };
  }

  // Warm resume — keep last route unless stale
  if (req.mode === "warm-resume" && req.lastRoute) {
    const entry = getMobileRouteEntry(req.lastRoute);
    const stale = (req.secondsSinceLastForeground ?? 0) > STALE_RESUME_THRESHOLD_SECONDS;
    return {
      targetRoute: entry ? req.lastRoute : "/mobile",
      requireBiometric: Boolean(entry?.biometricGated),
      allowStaleHydration: !stale && Boolean(entry?.toleratesStale),
      reason: stale ? "warm-resume:stale" : "warm-resume:fresh",
    };
  }

  // Cold start
  return { targetRoute: "/mobile", requireBiometric: false, allowStaleHydration: true, reason: "cold-start:default" };
}
