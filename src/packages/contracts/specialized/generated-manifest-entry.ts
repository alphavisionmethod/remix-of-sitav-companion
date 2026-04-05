// ═══════════════════════════════════════════════════════════════
// SITA OS — Specialized: Generated Manifest Entry
// Tracks auto-generated artifacts, configs, and code outputs
// ═══════════════════════════════════════════════════════════════

export type ManifestEntryType =
  | "contract"
  | "schema"
  | "migration"
  | "policy"
  | "playbook"
  | "template"
  | "config"
  | "report"
  | "projection"
  | "edge-function";

export type ManifestGenerationSource =
  | "onboarding"
  | "vertical-pack"
  | "advisor"
  | "operator"
  | "system"
  | "migration";

export interface GeneratedManifestEntry {
  id: string;
  type: ManifestEntryType;
  name: string;
  path: string;
  version: string;
  generatedAt: string;
  generatedBy: ManifestGenerationSource;
  checksum: string;
  dependencies: string[];
  supersedes?: string;
  description: string;
  domain?: string;
  tenantId: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface GeneratedManifest {
  entries: GeneratedManifestEntry[];
  version: string;
  generatedAt: string;
  totalEntries: number;
  integrity: string;
}
