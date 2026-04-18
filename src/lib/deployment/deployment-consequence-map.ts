// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Consequence Map
// What breaks if a deployment unit goes down
// ═══════════════════════════════════════════════════════════════

export type ImpactSeverity = "total-outage" | "major-degradation" | "partial-degradation" | "no-impact";

export interface DeploymentConsequence {
  deploymentUnitId: string;
  ifDown: ImpactSeverity;
  affectedCapabilities: string[];
  affectedUsers: string;
  mitigationStrategy: string;
  maxTolerableDowntimeMinutes: number;
}

export const DEPLOYMENT_CONSEQUENCES: readonly DeploymentConsequence[] = [
  {
    deploymentUnitId: "web-frontend",
    ifDown: "total-outage",
    affectedCapabilities: ["All web UI", "Admin panel", "User workflows"],
    affectedUsers: "All web users",
    mitigationStrategy: "CDN cache serves stale content; rollback to previous build",
    maxTolerableDowntimeMinutes: 5,
  },
  {
    deploymentUnitId: "edge-functions",
    ifDown: "major-degradation",
    affectedCapabilities: ["AI inference", "Advisor loops", "Custom business logic"],
    affectedUsers: "All users performing AI-powered actions",
    mitigationStrategy: "Graceful degradation; show cached results; queue pending actions",
    maxTolerableDowntimeMinutes: 15,
  },
  {
    deploymentUnitId: "supabase-db",
    ifDown: "total-outage",
    affectedCapabilities: ["All data operations", "Auth", "Realtime"],
    affectedUsers: "All users",
    mitigationStrategy: "Supabase managed failover; local cache for read-only mode",
    maxTolerableDowntimeMinutes: 5,
  },
  {
    deploymentUnitId: "electron-desktop",
    ifDown: "no-impact",
    affectedCapabilities: ["Desktop-specific features (local backup, window control)"],
    affectedUsers: "Desktop users only — web continues to work",
    mitigationStrategy: "Users fall back to web version",
    maxTolerableDowntimeMinutes: 0,
  },
  {
    deploymentUnitId: "nginx-proxy",
    ifDown: "partial-degradation",
    affectedCapabilities: ["Self-hosted/appliance access"],
    affectedUsers: "Self-hosted and appliance users only",
    mitigationStrategy: "Direct access to upstream; failover to backup proxy",
    maxTolerableDowntimeMinutes: 10,
  },
  {
    deploymentUnitId: "traefik-proxy",
    ifDown: "partial-degradation",
    affectedCapabilities: ["Routing for self-hosted environments"],
    affectedUsers: "Self-hosted users",
    mitigationStrategy: "Direct service access; manual DNS failover",
    maxTolerableDowntimeMinutes: 10,
  },
  {
    deploymentUnitId: "kong-gateway",
    ifDown: "partial-degradation",
    affectedCapabilities: ["API rate limiting", "Advanced API management"],
    affectedUsers: "API consumers in self-hosted environments",
    mitigationStrategy: "Bypass Kong; direct upstream access (loses rate limiting)",
    maxTolerableDowntimeMinutes: 15,
  },
  {
    deploymentUnitId: "appliance-iso",
    ifDown: "no-impact",
    affectedCapabilities: ["Appliance deployment only"],
    affectedUsers: "On-premises appliance users",
    mitigationStrategy: "Snapshot restore; cloud fallback",
    maxTolerableDowntimeMinutes: 0,
  },
] as const;

export function getConsequence(unitId: string): DeploymentConsequence | undefined {
  return DEPLOYMENT_CONSEQUENCES.find((c) => c.deploymentUnitId === unitId);
}

export function getCriticalUnits(): DeploymentConsequence[] {
  return DEPLOYMENT_CONSEQUENCES.filter((c) => c.ifDown === "total-outage");
}
