// ═══════════════════════════════════════════════════════════════
// SITA OS — ABI Versioning Strategy
// Version tracking with compatibility checks and deprecation
// ═══════════════════════════════════════════════════════════════

export type ArtifactKind = 'ipc_method' | 'manifest' | 'policy' | 'package' | 'service_config' | 'db_schema' | 'app_sdk' | 'driver_abi';

export interface VersionEntry {
  artifactId: string;
  kind: ArtifactKind;
  currentVersion: string;
  minSupported: string;
  deprecated?: string;
  deprecationMessage?: string;
  changelog: { version: string; date: string; changes: string[] }[];
}

function parseVer(v: string): number[] {
  return v.split('.').map(Number);
}

function compareVer(a: string, b: string): number {
  const pa = parseVer(a), pb = parseVer(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

class ABIVersionManager {
  private versions = new Map<string, VersionEntry>();

  register(entry: VersionEntry): void {
    this.versions.set(entry.artifactId, entry);
  }

  get(artifactId: string): VersionEntry | undefined {
    return this.versions.get(artifactId);
  }

  /** Check if a version is compatible with current */
  isCompatible(artifactId: string, version: string): { compatible: boolean; deprecated: boolean; message?: string } {
    const entry = this.versions.get(artifactId);
    if (!entry) return { compatible: false, deprecated: false, message: `Unknown artifact: ${artifactId}` };

    if (compareVer(version, entry.minSupported) < 0) {
      return { compatible: false, deprecated: false, message: `Version ${version} is below minimum supported ${entry.minSupported}` };
    }

    if (entry.deprecated && compareVer(version, entry.deprecated) <= 0) {
      return { compatible: true, deprecated: true, message: entry.deprecationMessage ?? `Version ${version} is deprecated` };
    }

    return { compatible: true, deprecated: false };
  }

  /** Get all deprecated artifacts */
  getDeprecated(): VersionEntry[] {
    return [...this.versions.values()].filter(v => v.deprecated);
  }

  /** Get all artifacts by kind */
  getByKind(kind: ArtifactKind): VersionEntry[] {
    return [...this.versions.values()].filter(v => v.kind === kind);
  }

  allEntries(): VersionEntry[] { return [...this.versions.values()]; }

  stats() {
    const byKind: Partial<Record<ArtifactKind, number>> = {};
    this.versions.forEach(v => { byKind[v.kind] = (byKind[v.kind] ?? 0) + 1; });
    return { total: this.versions.size, deprecated: this.getDeprecated().length, byKind };
  }
}

export const abiVersionManager = new ABIVersionManager();

// Pre-register core version entries
const CORE_VERSIONS: VersionEntry[] = [
  { artifactId: 'ipc.platform_bus', kind: 'ipc_method', currentVersion: '1.0.0', minSupported: '1.0.0', changelog: [{ version: '1.0.0', date: '2026-04-15', changes: ['Initial release'] }] },
  { artifactId: 'manifest.app_v1', kind: 'manifest', currentVersion: '1.2.0', minSupported: '1.0.0', changelog: [{ version: '1.0.0', date: '2026-01-01', changes: ['Initial manifest schema'] }, { version: '1.2.0', date: '2026-04-01', changes: ['Added permissions field', 'Added lifecycle hooks'] }] },
  { artifactId: 'policy.v1', kind: 'policy', currentVersion: '1.1.0', minSupported: '1.0.0', changelog: [{ version: '1.0.0', date: '2026-01-01', changes: ['Baseline policy format'] }, { version: '1.1.0', date: '2026-03-01', changes: ['Added precedence rules', 'Added explanation field'] }] },
  { artifactId: 'package.nova_pkg', kind: 'package', currentVersion: '2.0.0', minSupported: '1.5.0', deprecated: '1.5.0', deprecationMessage: 'Package format v1.5 will be removed in 2027-Q1', changelog: [{ version: '2.0.0', date: '2026-04-01', changes: ['Signed packages', 'Delta updates'] }] },
  { artifactId: 'sdk.app_runtime', kind: 'app_sdk', currentVersion: '1.0.0', minSupported: '1.0.0', changelog: [{ version: '1.0.0', date: '2026-04-15', changes: ['Initial SDK release'] }] },
  { artifactId: 'driver.abi_v1', kind: 'driver_abi', currentVersion: '1.0.0', minSupported: '1.0.0', changelog: [{ version: '1.0.0', date: '2026-04-15', changes: ['Stable driver ABI'] }] },
];
abiVersionManager.register = abiVersionManager.register.bind(abiVersionManager);
CORE_VERSIONS.forEach(v => abiVersionManager.register(v));
