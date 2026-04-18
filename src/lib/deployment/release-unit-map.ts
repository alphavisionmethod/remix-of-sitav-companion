// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Unit Map
// Release units with versioning strategy
// ═══════════════════════════════════════════════════════════════

export type VersioningStrategy = "semver" | "calver" | "build-hash" | "git-tag";
export type ReleaseFrequency = "continuous" | "daily" | "weekly" | "monthly" | "on-demand";

export interface ReleaseUnit {
  id: string;
  deploymentUnitId: string;
  name: string;
  versioningStrategy: VersioningStrategy;
  releaseFrequency: ReleaseFrequency;
  currentVersion: string;
  changelogPath: string | null;
  signingRequired: boolean;
  approvalRequired: boolean;
  canarySupported: boolean;
  rollbackWindowHours: number;
}

export const RELEASE_UNITS: readonly ReleaseUnit[] = [
  {
    id: "rel-web",
    deploymentUnitId: "web-frontend",
    name: "Web Frontend Release",
    versioningStrategy: "build-hash",
    releaseFrequency: "continuous",
    currentVersion: "latest",
    changelogPath: null,
    signingRequired: false,
    approvalRequired: false,
    canarySupported: false,
    rollbackWindowHours: 24,
  },
  {
    id: "rel-edge",
    deploymentUnitId: "edge-functions",
    name: "Edge Functions Release",
    versioningStrategy: "build-hash",
    releaseFrequency: "continuous",
    currentVersion: "latest",
    changelogPath: null,
    signingRequired: false,
    approvalRequired: false,
    canarySupported: false,
    rollbackWindowHours: 1,
  },
  {
    id: "rel-db",
    deploymentUnitId: "supabase-db",
    name: "Database Migration Release",
    versioningStrategy: "semver",
    releaseFrequency: "on-demand",
    currentVersion: "1.0.0",
    changelogPath: "supabase/migrations/",
    signingRequired: false,
    approvalRequired: true,
    canarySupported: false,
    rollbackWindowHours: 0,
  },
  {
    id: "rel-desktop",
    deploymentUnitId: "electron-desktop",
    name: "Desktop App Release",
    versioningStrategy: "semver",
    releaseFrequency: "monthly",
    currentVersion: "1.0.0",
    changelogPath: "CHANGELOG.md",
    signingRequired: true,
    approvalRequired: true,
    canarySupported: true,
    rollbackWindowHours: 168,
  },
  {
    id: "rel-appliance",
    deploymentUnitId: "appliance-iso",
    name: "Appliance Release",
    versioningStrategy: "semver",
    releaseFrequency: "on-demand",
    currentVersion: "1.0.0",
    changelogPath: "CHANGELOG.md",
    signingRequired: true,
    approvalRequired: true,
    canarySupported: false,
    rollbackWindowHours: 0,
  },
] as const;

export function getReleaseUnit(id: string): ReleaseUnit | undefined {
  return RELEASE_UNITS.find((r) => r.id === id);
}

export function getReleaseUnitForDeployment(deploymentUnitId: string): ReleaseUnit | undefined {
  return RELEASE_UNITS.find((r) => r.deploymentUnitId === deploymentUnitId);
}
