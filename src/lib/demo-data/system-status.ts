// ═══════════════════════════════════════════════════════════════
// SITA OS — Demo Data Facade: System Status / Self-Healing
// Pages import from here instead of core-services directly
// ═══════════════════════════════════════════════════════════════

export {
  createSelfHealingService,
  createImmuneController,
  createFleetHealthService,
  HEALING_CAPABILITY_MAP,
  ESCALATION_RULES,
  DEGRADED_MODES,
} from "@/lib/core-services/self-healing";

export type {
  Incident,
  ServiceHealthRecord,
  QuarantineRecord,
  CircuitBreakerState,
} from "@/lib/core-services/self-healing/types";
