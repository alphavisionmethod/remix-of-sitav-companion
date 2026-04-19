/**
 * SITA OS — Canonical UX Trust Microcopy
 * Single source of truth for trust-sensitive AI agency wording.
 *
 * Used by:
 *   - Admin AI surfaces (boards, mission control, autonomy ladder)
 *   - check-no-ambiguous-ai-agency-claims.ts (validator allowlist)
 *
 * Rule: Wording must NEVER imply stronger autonomous behavior than
 * runtime proof actually supports. When in doubt, downgrade language.
 */

/** Canonical AI-agency phrases. Validators allowlist these and BLOCK regression to forbidden patterns. */
export const aiAgency = {
  /** Agent is provisioned and capable of acting within governed scope, but does not act unbidden. */
  readyToAct: "ready to act",
  /** Agent surfaces options/recommendations only — never executes without explicit operator approval. */
  canRecommend: "can recommend",
  /** Action is permitted only inside a pre-approved, evidenced scope (whitelist + autonomy gate). */
  governedScope: "within governed scope",
  /** Capability is exposed only when end-to-end runtime proof exists (receipts, ledger, fallback). */
  runtimeProvenOnly: "runtime-proven only",
  /** Agent observes/diagnoses but does not change state. */
  observesOnly: "observes only",
  /** Agent has staged a proposal awaiting human approval. */
  proposalStaged: "proposal staged for approval",
} as const;

/**
 * Forbidden phrases that imply unbounded AI autonomy.
 * The validator scans src/components and src/pages and BLOCKS on any match
 * outside `archive/` or files in `EXEMPT_PATHS` below.
 */
export const FORBIDDEN_AI_AGENCY_PHRASES: readonly string[] = [
  "workforce is acting",
  "ai is autonomously",
  "is acting on your behalf",
  "ai is taking action",
  "agents are deciding",
  "automatically deciding for you",
  "autonomously executing",
  "ai will decide",
  "the ai decides",
] as const;

/**
 * Files where the validator does NOT scan (e.g., this microcopy file itself, where the
 * forbidden phrases must appear as data; documentation; tests).
 */
export const EXEMPT_PATHS: readonly string[] = [
  "src/lib/ux-trust/microcopy.ts",
  "src/lib/ux-trust/__tests__",
  "src/lib/ux-trust/microcopy-system.ts",
] as const;

/** Helper: scan text for forbidden agency phrases (case-insensitive). */
export function findForbiddenAgencyPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_AI_AGENCY_PHRASES.filter((p) => lower.includes(p.toLowerCase()));
}

/** Helper: get all canonical agency phrases as an array. */
export function getCanonicalAgencyPhrases(): string[] {
  return Object.values(aiAgency);
}
