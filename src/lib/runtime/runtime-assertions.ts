// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Assertions
// Invariant checks: assert surface, mode, capability
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";
import type { RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import type { RuntimeContext } from "./runtime-context";

export class RuntimeAssertionError extends Error {
  constructor(
    public readonly assertion: string,
    public readonly expected: string,
    public readonly actual: string
  ) {
    super(`Runtime assertion failed: ${assertion} — expected ${expected}, got ${actual}`);
    this.name = "RuntimeAssertionError";
  }
}

/** Assert the runtime is executing on an expected target */
export function assertTarget(ctx: RuntimeContext, ...allowed: RuntimeTarget[]): void {
  if (!allowed.includes(ctx.detection.target)) {
    throw new RuntimeAssertionError(
      "target",
      allowed.join(" | "),
      ctx.detection.target
    );
  }
}

/** Assert the runtime is in an expected reality mode */
export function assertMode(ctx: RuntimeContext, ...allowed: RealityModeKey[]): void {
  if (!allowed.includes(ctx.realityMode)) {
    throw new RuntimeAssertionError(
      "realityMode",
      allowed.join(" | "),
      ctx.realityMode
    );
  }
}

/** Assert the runtime has a specific capability available */
export function assertCapability(ctx: RuntimeContext, capabilityId: string): void {
  const has = ctx.capabilities.some((c) => c.capabilityId === capabilityId);
  if (!has) {
    throw new RuntimeAssertionError(
      "capability",
      capabilityId,
      `[${ctx.capabilities.map((c) => c.capabilityId).join(", ")}]`
    );
  }
}

/** Assert the user is authenticated with minimum trust */
export function assertAuthenticated(ctx: RuntimeContext, minTrust = 0): void {
  if (!ctx.trust.isAuthenticated) {
    throw new RuntimeAssertionError("authenticated", "true", "false");
  }
  if (ctx.trust.trustScore < minTrust) {
    throw new RuntimeAssertionError(
      "trustScore",
      `>= ${minTrust}`,
      String(ctx.trust.trustScore)
    );
  }
}

/** Assert MFA is verified */
export function assertMFA(ctx: RuntimeContext): void {
  if (!ctx.trust.mfaVerified) {
    throw new RuntimeAssertionError("mfaVerified", "true", "false");
  }
}

/** Soft check — returns boolean instead of throwing */
export function checkTarget(ctx: RuntimeContext, ...allowed: RuntimeTarget[]): boolean {
  return allowed.includes(ctx.detection.target);
}

export function checkCapability(ctx: RuntimeContext, capabilityId: string): boolean {
  return ctx.capabilities.some((c) => c.capabilityId === capabilityId);
}
