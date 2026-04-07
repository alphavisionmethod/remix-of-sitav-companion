// ═══════════════════════════════════════════════════════════════
// SITA OS — Immune Controller (Re-export from core-services)
// Wire to the advanced 204-line immune controller
// ═══════════════════════════════════════════════════════════════
// @persistence: none — stateless module, no durable state to persist

export {
  ImmuneController,
  createImmuneController,
} from "@/lib/core-services/self-healing/immune-controller";

export type { QuarantineRecord, ImmuneRule } from "@/lib/core-services/self-healing/types";

