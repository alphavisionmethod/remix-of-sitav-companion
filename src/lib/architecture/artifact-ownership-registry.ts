// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Ownership Overlay Registry
// Hand-curated entries for artifacts whose producers are NOT
// statically discoverable by the scanner (edge functions, OS build
// scripts, external CI workflows, etc).
// The auto-generated `generated/artifact-ownership-manifest.json`
// merges these on top of static-scan results.
// ═══════════════════════════════════════════════════════════════

export interface ArtifactOwnershipOverlay {
  artifact: string;
  producer: string;
  owner:
    | "architecture" | "runtime" | "security" | "operations"
    | "ai-workforce" | "deployment" | "governance" | "support"
    | "platform" | "integrations" | "launch";
  rationale: string;
}

export const ARTIFACT_OWNERSHIP_OVERLAY: readonly ArtifactOwnershipOverlay[] = [
  // OS image build artifacts (produced by GitHub Actions workflow, not a TS script)
  { artifact: "generated/os-build/build-manifest.json", producer: ".github/workflows/os-build-iso.yml", owner: "deployment", rationale: "Produced by os-build-iso GitHub Actions workflow" },
  { artifact: "generated/os-build/iso-checksum.json", producer: ".github/workflows/os-build-iso.yml", owner: "deployment", rationale: "Produced by os-build-iso GitHub Actions workflow" },

  // Edge-function emitted artifacts (written by Deno runtime, not Node scripts)
  { artifact: "generated/ai-runtime/nightly-run-attestation.json", producer: "supabase/functions/ai-runtime-nightly-run/index.ts", owner: "ai-workforce", rationale: "Emitted by edge function on nightly cron" },
  { artifact: "generated/dr-drill/last-run.json", producer: "supabase/functions/dr-drill-runner/index.ts", owner: "support", rationale: "Emitted by DR drill edge function" },

  // Aggregated readiness summaries (multi-step pipeline)
  { artifact: "generated/os-release-readiness-summary.md", producer: "scripts/architecture/checks/check-os-release-readiness.ts", owner: "deployment", rationale: "Aggregated by master release readiness check" },
  { artifact: "generated/os-release-readiness-report.json", producer: "scripts/architecture/checks/check-os-release-readiness.ts", owner: "deployment", rationale: "Aggregated by master release readiness check" },
];

/** Map by artifact path for O(1) lookup */
export const ARTIFACT_OWNERSHIP_OVERLAY_MAP: ReadonlyMap<string, ArtifactOwnershipOverlay> =
  new Map(ARTIFACT_OWNERSHIP_OVERLAY.map((e) => [e.artifact, e]));
