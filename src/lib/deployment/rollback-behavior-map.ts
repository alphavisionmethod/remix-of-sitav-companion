// ═══════════════════════════════════════════════════════════════
// SITA OS — Rollback Behavior Map
// Rollback model per deployment unit
// ═══════════════════════════════════════════════════════════════

export type RollbackType = "instant" | "manual" | "auto" | "impossible";

export interface RollbackBehavior {
  deploymentUnitId: string;
  rollbackType: RollbackType;
  rollbackProcedure: string;
  dataLossRisk: boolean;
  estimatedDowntimeMinutes: number;
  requiresApproval: boolean;
  automatedTriggers: string[];
}

export const ROLLBACK_BEHAVIORS: readonly RollbackBehavior[] = [
  {
    deploymentUnitId: "web-frontend",
    rollbackType: "instant",
    rollbackProcedure: "Revert CDN to previous build hash",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 0,
    requiresApproval: false,
    automatedTriggers: ["error-rate > 5%", "core-web-vitals degradation"],
  },
  {
    deploymentUnitId: "edge-functions",
    rollbackType: "instant",
    rollbackProcedure: "Re-deploy previous function version via Supabase CLI",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 0,
    requiresApproval: false,
    automatedTriggers: ["500-error-rate > 10%", "timeout-rate > 20%"],
  },
  {
    deploymentUnitId: "supabase-db",
    rollbackType: "manual",
    rollbackProcedure: "Execute reverse migration SQL. May require data reconciliation.",
    dataLossRisk: true,
    estimatedDowntimeMinutes: 15,
    requiresApproval: true,
    automatedTriggers: [],
  },
  {
    deploymentUnitId: "electron-desktop",
    rollbackType: "auto",
    rollbackProcedure: "electron-updater auto-rollback on crash loop detection within 30s of launch",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 1,
    requiresApproval: false,
    automatedTriggers: ["crash-loop-30s", "bridge-methods-unavailable"],
  },
  {
    deploymentUnitId: "nginx-proxy",
    rollbackType: "instant",
    rollbackProcedure: "Roll back Docker image tag to previous version",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 0,
    requiresApproval: false,
    automatedTriggers: ["health-check-failure"],
  },
  {
    deploymentUnitId: "traefik-proxy",
    rollbackType: "instant",
    rollbackProcedure: "Revert traefik config file and restart container",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 0,
    requiresApproval: false,
    automatedTriggers: ["health-check-failure"],
  },
  {
    deploymentUnitId: "kong-gateway",
    rollbackType: "instant",
    rollbackProcedure: "Revert kong.yml declarative config",
    dataLossRisk: false,
    estimatedDowntimeMinutes: 0,
    requiresApproval: false,
    automatedTriggers: ["health-check-failure"],
  },
  {
    deploymentUnitId: "appliance-iso",
    rollbackType: "manual",
    rollbackProcedure: "Restore from previous VM snapshot or re-image from previous ISO",
    dataLossRisk: true,
    estimatedDowntimeMinutes: 30,
    requiresApproval: true,
    automatedTriggers: [],
  },
] as const;

export function getRollbackBehavior(unitId: string): RollbackBehavior | undefined {
  return ROLLBACK_BEHAVIORS.find((r) => r.deploymentUnitId === unitId);
}

export function getUnitsWithDataLossRisk(): RollbackBehavior[] {
  return ROLLBACK_BEHAVIORS.filter((r) => r.dataLossRisk);
}
