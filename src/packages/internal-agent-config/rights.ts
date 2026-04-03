// Re-export canonical rights from lib
export {
  AUTONOMY_TIERS,
  NEVER_ALLOWED,
  MUST_REQUIRE_HUMAN_APPROVAL,
  DESIGN_DRIFT_CHECKLIST,
  WATCHDOG_CONCERNS,
  MAY_AUTO_EXECUTE,
  MUST_SIMULATE_FIRST,
  PROMOTION_RULES,
  DEMOTION_TRIGGERS,
  AGENT_METRICS,
  getAutonomyTier,
  getAutonomyLevel,
  canAutoApply,
} from "@/lib/internal-agents/rights";
export type { AutonomyTier, PromotionRule, DemotionTrigger, AgentMetricDefinition } from "@/lib/internal-agents/rights";
