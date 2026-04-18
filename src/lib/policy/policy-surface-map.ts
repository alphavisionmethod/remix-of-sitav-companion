// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Surface Map (Phase 3)
//
// For each (PolicyDomain, CanonicalSurface) pair, declare whether
// privileged actions in the domain are allowed on that surface.
// This binds the policy matrix to the Phase 2 surface registry.
// ═══════════════════════════════════════════════════════════════

import type { CanonicalSurface } from "@/runtimes/surface-types";
import { CANONICAL_SURFACES } from "@/runtimes/surface-types";
import type { PolicyDomainKey } from "./policy-domain-map";
import { ALL_POLICY_DOMAINS } from "./policy-domain-map";

export type SurfacePolicyState =
  | "allowed"             // Fully allowed
  | "allowed-with-stepup" // Requires biometric / MFA step-up
  | "read-only"           // Mutations refused, reads allowed
  | "prohibited";         // Hard-block on this surface

export interface SurfacePolicyEntry {
  domain: PolicyDomainKey;
  surface: CanonicalSurface;
  state: SurfacePolicyState;
  reason: string;
}

// Default matrix — explicit overrides only where state ≠ "allowed".
const OVERRIDES: readonly SurfacePolicyEntry[] = [
  // Money — most restrictive
  { domain: "money", surface: "ios",       state: "allowed-with-stepup", reason: "Mobile financial mutations require biometric step-up." },
  { domain: "money", surface: "android",   state: "allowed-with-stepup", reason: "Mobile financial mutations require biometric step-up." },
  { domain: "money", surface: "offline",   state: "prohibited",          reason: "No financial mutations offline — proof chain integrity." },
  { domain: "money", surface: "demo",      state: "read-only",           reason: "Demo mode: simulated outputs, no real execution." },

  // System / Kernel
  { domain: "system", surface: "web",       state: "read-only",           reason: "Runtime commands require host bridge or appliance." },
  { domain: "system", surface: "ios",       state: "read-only",           reason: "Mobile sandbox blocks runtime commands." },
  { domain: "system", surface: "android",   state: "read-only",           reason: "Mobile sandbox blocks runtime commands." },
  { domain: "system", surface: "offline",   state: "prohibited",          reason: "Operator commands require live coordination." },
  { domain: "system", surface: "demo",      state: "read-only",           reason: "Demo mode runtime is sandboxed." },

  // Admin
  { domain: "admin", surface: "ios",       state: "read-only",           reason: "Mobile admin is triage-only." },
  { domain: "admin", surface: "android",   state: "read-only",           reason: "Mobile admin is triage-only." },
  { domain: "admin", surface: "offline",   state: "read-only",           reason: "No admin mutations offline." },
  { domain: "admin", surface: "demo",      state: "read-only",           reason: "Demo cannot mutate platform config." },

  // Integrations (OAuth handshake)
  { domain: "integrations", surface: "offline", state: "prohibited",     reason: "OAuth requires live network." },
  { domain: "integrations", surface: "demo",    state: "read-only",      reason: "Demo connectors are simulated only." },

  // Trust / Proof
  { domain: "trust", surface: "offline", state: "read-only",            reason: "Proof generation queues offline; verification only." },
  { domain: "trust", surface: "demo",    state: "read-only",            reason: "Demo proofs are simulated only." },

  // Boardroom
  { domain: "boardroom", surface: "offline", state: "prohibited",       reason: "Boardroom voting requires live proof chain." },
  { domain: "boardroom", surface: "demo",    state: "read-only",        reason: "Demo boardroom is read-only walkthrough." },

  // Identity
  { domain: "identity", surface: "offline", state: "read-only",         reason: "Identity changes require online verification." },
];

/** Resolve the policy state for a (domain, surface) pair. */
export function getSurfacePolicyState(
  domain: PolicyDomainKey,
  surface: CanonicalSurface,
): SurfacePolicyState {
  const override = OVERRIDES.find((o) => o.domain === domain && o.surface === surface);
  return override?.state ?? "allowed";
}

export function getSurfacePolicyReason(
  domain: PolicyDomainKey,
  surface: CanonicalSurface,
): string | null {
  const override = OVERRIDES.find((o) => o.domain === domain && o.surface === surface);
  return override?.reason ?? null;
}

export const POLICY_SURFACE_OVERRIDES = OVERRIDES;

/** Build the full domain × surface matrix (used by admin explorer). */
export function buildSurfacePolicyMatrix(): Record<PolicyDomainKey, Record<CanonicalSurface, SurfacePolicyState>> {
  const out = {} as Record<PolicyDomainKey, Record<CanonicalSurface, SurfacePolicyState>>;
  for (const domain of ALL_POLICY_DOMAINS) {
    out[domain] = {} as Record<CanonicalSurface, SurfacePolicyState>;
    for (const surface of CANONICAL_SURFACES) {
      out[domain][surface] = getSurfacePolicyState(domain, surface);
    }
  }
  return out;
}

export function isProhibitedOnSurface(domain: PolicyDomainKey, surface: CanonicalSurface): boolean {
  return getSurfacePolicyState(domain, surface) === "prohibited";
}

export function requiresStepUp(domain: PolicyDomainKey, surface: CanonicalSurface): boolean {
  return getSurfacePolicyState(domain, surface) === "allowed-with-stepup";
}
