// ═══════════════════════════════════════════════════════════════
// SITA OS — Provenance & Attestation Builder
// Assembles provenance records per artifact from build metadata.
// ═══════════════════════════════════════════════════════════════

export interface ProvenanceRecord {
  readonly provenanceId: string;
  readonly artifactTargetId: string;
  readonly buildWorkflow: string;
  readonly sourceRepo: string;
  readonly sourceRevision: string;
  readonly sourceRevisionShort: string;
  readonly branch: string;
  readonly tag: string | null;
  readonly buildTimestamp: string;
  readonly builderIdentity: string;
  readonly ciRunId: string;
  readonly ciRunUrl: string;
  readonly materials: ProvenanceMaterial[];
  readonly packagingPipeline: string;
  readonly signingStatus: string;
  readonly attestationStatus: string;
  readonly checksumAlgorithm: string;
  readonly checksumValue: string;
  readonly sbomReference: string | null;
  readonly evidenceReferences: string[];
}

export interface ProvenanceMaterial {
  readonly uri: string;
  readonly digest: string;
  readonly type: "source" | "dependency" | "tool" | "config" | "base-image";
}

export interface SupplyChainAttestation {
  readonly attestationId: string;
  readonly format: "sita-attestation-v1";
  readonly generatedAt: string;
  readonly targets: readonly SupplyChainTarget[];
  readonly overallIntegrity: "verified" | "partial" | "unverified";
  readonly sbomsCovered: number;
  readonly sbomsTotal: number;
  readonly signingCoverage: number;
  readonly provenanceCoverage: number;
}

export interface SupplyChainTarget {
  readonly targetId: string;
  readonly provenanceAvailable: boolean;
  readonly signedArtifact: boolean;
  readonly checksumPublished: boolean;
  readonly sbomAvailable: boolean;
  readonly reproducibleBuild: boolean;
  readonly transparencyLogEntry: boolean;
  readonly integrityScore: number;
}

export function buildProvenanceRecord(params: {
  targetId: string;
  workflow: string;
  revision: string;
  branch: string;
  tag: string | null;
  ciRunId: string;
  pipeline: string;
  signingStatus: string;
  checksumValue: string;
}): ProvenanceRecord {
  const shortRev = params.revision.slice(0, 12);
  return {
    provenanceId: `prov-${params.targetId}-${shortRev}`,
    artifactTargetId: params.targetId,
    buildWorkflow: params.workflow,
    sourceRepo: "https://github.com/sita-os/sita-os",
    sourceRevision: params.revision,
    sourceRevisionShort: shortRev,
    branch: params.branch,
    tag: params.tag,
    buildTimestamp: new Date().toISOString(),
    builderIdentity: "github-actions",
    ciRunId: params.ciRunId,
    ciRunUrl: `https://github.com/sita-os/sita-os/actions/runs/${params.ciRunId}`,
    materials: [
      { uri: "https://github.com/sita-os/sita-os", digest: params.revision, type: "source" },
      { uri: "package-lock.json", digest: "computed-at-build", type: "dependency" },
    ],
    packagingPipeline: params.pipeline,
    signingStatus: params.signingStatus,
    attestationStatus: "emitted",
    checksumAlgorithm: "sha256",
    checksumValue: params.checksumValue,
    sbomReference: null,
    evidenceReferences: [],
  };
}

export function buildSupplyChainAttestation(targets: readonly SupplyChainTarget[]): SupplyChainAttestation {
  const signed = targets.filter((t) => t.signedArtifact).length;
  const provenance = targets.filter((t) => t.provenanceAvailable).length;
  const sboms = targets.filter((t) => t.sbomAvailable).length;
  const total = targets.length;
  const allVerified = targets.every((t) => t.integrityScore >= 80);
  return {
    attestationId: `sca-${Date.now()}`,
    format: "sita-attestation-v1",
    generatedAt: new Date().toISOString(),
    targets,
    overallIntegrity: allVerified ? "verified" : total > 0 && provenance > 0 ? "partial" : "unverified",
    sbomsCovered: sboms,
    sbomsTotal: total,
    signingCoverage: total > 0 ? Math.round((signed / total) * 100) : 0,
    provenanceCoverage: total > 0 ? Math.round((provenance / total) * 100) : 0,
  };
}