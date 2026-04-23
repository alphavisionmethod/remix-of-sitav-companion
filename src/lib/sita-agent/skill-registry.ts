// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent: Skill registry (Phase E)
// ═══════════════════════════════════════════════════════════════
// Single source of truth for what Sita is allowed to attempt.
// Each entry binds a planner-friendly skillId to a kernel
// (domain, capabilityId) pair plus risk + reversibility metadata.
// ═══════════════════════════════════════════════════════════════

import { BUSINESS_SKILLS } from "./skills/business-skills";
import { FINANCE_SKILLS } from "./skills/finance-skills";
import { CONCIERGE_SKILLS } from "./skills/concierge-skills";
import type { SitaActionRisk, SitaAgentDomain } from "./plan-types";

export interface SitaSkillDef {
  id: string;                     // dotted, stable: "finance.invoice.create"
  domain: SitaAgentDomain;
  capabilityId: string;           // kernel capability id
  label: string;                  // user-facing
  description: string;
  risk: SitaActionRisk;
  reversible: boolean;
  requiresApproval: boolean;
  paramHints?: Record<string, string>;
}

const ALL: SitaSkillDef[] = [
  ...BUSINESS_SKILLS,
  ...FINANCE_SKILLS,
  ...CONCIERGE_SKILLS,
];

const BY_ID = new Map<string, SitaSkillDef>(ALL.map((s) => [s.id, s]));

export function getAllSkills(): SitaSkillDef[] {
  return ALL;
}

export function getSkillsByDomain(domain: SitaAgentDomain): SitaSkillDef[] {
  return ALL.filter((s) => s.domain === domain);
}

export function getSkill(id: string): SitaSkillDef | undefined {
  return BY_ID.get(id);
}

/** Compact catalog used as planner system-prompt context. */
export function buildSkillCatalogForPlanner(): Array<{
  id: string;
  domain: SitaAgentDomain;
  description: string;
  risk: SitaActionRisk;
  reversible: boolean;
  requiresApproval: boolean;
  paramHints?: Record<string, string>;
}> {
  return ALL.map(({ id, domain, description, risk, reversible, requiresApproval, paramHints }) => ({
    id, domain, description, risk, reversible, requiresApproval, paramHints,
  }));
}