// ═══════════════════════════════════════════════════════════════
// SITA OS — Payment Simulation Utilities
// Pure functions, no service dependency
// ═══════════════════════════════════════════════════════════════

export {
  simulatePayment,
  performFraudCheck,
} from "@/lib/core-services/payment-execution";

export type {
  PaymentSimulation,
  PaymentIntent,
  FraudCheckResult,
} from "@/lib/core-services/payment-execution";
