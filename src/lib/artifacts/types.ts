// ═══════════════════════════════════════════════════════════════
// Public Artifact Viewer — Types
// Shape of /generated/artifact-index.json and individual artifacts
// produced by scripts/manifests/generate/generate-public-artifact-mirror.ts.
// ═══════════════════════════════════════════════════════════════

export type ArtifactCategory = "audits" | "manifests" | "registry" | "reports" | "docs";

export interface PublicArtifact {
  /** Path relative to /generated/artifacts/ (e.g. "manifests/routes.json"). */
  path: string;
  /** Original repo-relative source path. */
  sourcePath: string;
  sizeBytes: number;
  lastModified: string; // ISO 8601
  sha256: string;
}

export interface ArtifactCategoryGroup {
  name: ArtifactCategory;
  count: number;
  files: PublicArtifact[];
}

export interface ArtifactIndex {
  generatedAt: string;
  totalArtifacts: number;
  categories: ArtifactCategoryGroup[];
  policyVersion: string;
}
