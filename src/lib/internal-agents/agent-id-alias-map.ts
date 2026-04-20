// SITA OS — Internal Agent ID Alias Map
//
// The registry standardized on the "aw-*" prefix for all 40 internal agents.
// Several edge functions still reference legacy IDs ("st-*", "ro-*", "rc-*",
// "kc-*", "ar-*"). Rather than rewriting every edge function (and risking
// breaking live cron jobs), we keep an alias map so:
//   1. Runtime code can address agents by either ID without breakage.
//   2. Validators count legacy references as wiring evidence for the
//      canonical agent.
//   3. Future cleanup can remove aliases one-by-one without coordination.

export const AGENT_ID_ALIASES: Record<string, string> = {
  // security-trust council
  "st-security-monitor": "aw-security-monitor",
  "st-permission-drift": "aw-permission-drift",
  "st-policy-review": "aw-policy-review",
  "st-trust-threshold": "aw-trust-threshold",
  "st-fraud-abuse": "aw-fraud-abuse",
  "st-privacy-boundary": "aw-privacy-boundary",
  "st-audit-completeness": "aw-audit-trail",

  // reliability-ops council
  "ro-incident-response": "aw-incident-response",

  // runtime-cost council
  "rc-cost-sentinel": "aw-ai-spend-control",

  // knowledge-coordination council
  "kc-knowledge-coordinator": "aw-knowledge-curator",

  // architecture-governance council
  "ar-architecture-truth": "aw-arch-consistency",
  "ar-policy-architect": "aw-arch-consistency",
  "aw-policy-architect": "aw-arch-consistency",
};

/**
 * Resolve any legacy or canonical agent identifier to its canonical "aw-*" ID.
 * Returns the input unchanged when no alias is registered.
 */
export function canonicalAgentId(id: string): string {
  return AGENT_ID_ALIASES[id] ?? id;
}

/**
 * Reverse lookup: list every alias (including the canonical ID itself) by which
 * a given canonical agent can legitimately be referenced from runtime code.
 */
export function aliasesForCanonical(canonicalId: string): string[] {
  const out = new Set<string>([canonicalId]);
  for (const [alias, target] of Object.entries(AGENT_ID_ALIASES)) {
    if (target === canonicalId) out.add(alias);
  }
  return [...out];
}
