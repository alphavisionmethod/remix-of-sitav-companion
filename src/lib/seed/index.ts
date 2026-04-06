// ═══════════════════════════════════════════════════════════════
// SITA OS — Seed & Data Flow Initialization
// Single entry point for bootstrapping the ecosystem
// ═══════════════════════════════════════════════════════════════

export { seedEcosystemData } from "./ecosystem-master-seeder";
export { seedWorkforceData } from "@/lib/admin-ai/workforce-seed-data";
export { initializeDataFlows, logOsEvent, logAuditEvent, recordAiUsage, createIncident, recordReceipt, recordConnectorHealth, updateSurfaceContext, updatePresenceState } from "./data-flow-bridge";
export { registerContract, getContract, listContracts, evaluateExecution, executeWithContract, getAdvisorGrounding, validateAdvisorInputs, checkAdvisorActionAllowed } from "./contract-runtime-consumer";

// ── Full Bootstrap ──────────────────────────────────────────
export async function bootstrapSitaOS(): Promise<{ success: boolean; details: Record<string, unknown> }> {
  try {
    // 1. Seed ecosystem reference data
    const ecosystemResult = await (await import("./ecosystem-master-seeder")).seedEcosystemData();

    // 2. Seed AI workforce data
    const workforceResult = await (await import("@/lib/admin-ai/workforce-seed-data")).seedWorkforceData();

    // 3. Initialize ambient data flows
    await (await import("./data-flow-bridge")).initializeDataFlows();

    console.log("[bootstrap] SITA OS fully bootstrapped");
    return {
      success: true,
      details: {
        ecosystem: ecosystemResult,
        workforce: workforceResult,
        flows: "initialized",
      },
    };
  } catch (error: any) {
    console.error("[bootstrap] Failed:", error);
    return { success: false, details: { error: error.message } };
  }
}
