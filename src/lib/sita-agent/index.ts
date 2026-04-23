// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita Agent barrel (Phase E)
// ═══════════════════════════════════════════════════════════════

export type {
  ActionPlan,
  ActionStep,
  PlanResult,
  PlanStepResult,
  SitaActionRisk,
  SitaAgentDomain,
} from "./plan-types";

export {
  publishAgentPlan,
  clearAgentPlan,
  readActiveAgentPlan,
  subscribeAgentPlan,
  useActiveAgentPlan,
  speakAgentSummary,
  summarizePlanResult,
} from "./agent-core";

export {
  getAllSkills,
  getSkillsByDomain,
  getSkill,
  buildSkillCatalogForPlanner,
  type SitaSkillDef,
} from "./skill-registry";

export {
  getAutonomyTier,
  getAutonomyTiers,
  setAutonomyTier,
  useAutonomyTiers,
  canAutoRunStep,
  type AutonomyTiers,
} from "./autonomy-tier";

export { useSitaAgent } from "./useSitaAgent";