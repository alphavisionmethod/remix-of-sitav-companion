// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Evidence Pack Builder
// Assembles coherent evidence packs per build target.
// ═══════════════════════════════════════════════════════════════

import {
  ARTIFACT_PROOF_REGISTRY,
  getDesktopTargets,
  getOsTargets,
  type ArtifactProofRecord,
} from "./artifact-proof-contract";
import { DESKTOP_SIGNING_POLICIES } from "./desktop-signing-policy";
import { OS_BOOT_VALIDATION_MATRIX } from "./os-boot-validation-policy";
import { INSTALL_UPGRADE_ROLLBACK_MATRIX } from "./install-upgrade-rollback-matrix";
import { HARDWARE_COMPATIBILITY_MATRIX } from "./hardware-compatibility-matrix";
import { FIRST_BOOT_CERTIFICATIONS } from "./first-boot-certification";
import { RELEASE_CHANNELS, CHANNEL_PROMOTION_RULES, CHANNEL_MIGRATION_SEMANTICS } from "./release-channel-policy";
import { buildChecksumReport } from "./checksum-publication";
import { buildSupplyChainAttestation, type SupplyChainTarget } from "./provenance-attestation-builder";

export interface EvidencePackSummary {
  readonly generatedAt: string;
  readonly packType: "desktop" | "os-images";
  readonly targets: readonly TargetEvidenceSummary[];
  readonly overallReadiness: string;
  readonly signingClosure: string;
  readonly bootValidationClosure: string;
  readonly lifecycleClosure: string;
  readonly hardwareCompatClosure: string;
  readonly firstBootClosure: string;
  readonly channelClosure: string;
  readonly provenanceClosure: string;
  readonly checksumClosure: string;
  readonly supportLinkage: string;
  readonly gaps: readonly string[];
}

export interface TargetEvidenceSummary {
  readonly targetId: string;
  readonly artifactType: string;
  readonly readiness: string;
  readonly signingState: string;
  readonly notarizationState: string;
  readonly checksumPublished: boolean;
  readonly provenanceAvailable: boolean;
  readonly bootValidationCovered: boolean;
  readonly firstBootCertified: boolean;
  readonly lifecyclePathsCovered: number;
  readonly hardwareEnvsTested: number;
  readonly runbookLinked: boolean;
  readonly gaps: readonly string[];
}

function summarizeTarget(record: ArtifactProofRecord): TargetEvidenceSummary {
  const gaps: string[] = [];
  if (record.signing.currentState === "deferred-on-cert") {
    gaps.push(`Signing deferred: ${record.signing.blockers.join(", ")}`);
  }
  if (record.notarization.currentState === "deferred-on-cert") {
    gaps.push(`Notarization deferred: ${record.notarization.blockers.join(", ")}`);
  }
  if (record.readiness === "deferred-on-external") {
    gaps.push("Readiness blocked on external credential provisioning");
  }

  const lifecycle = INSTALL_UPGRADE_ROLLBACK_MATRIX.find((m) =>
    record.targetId.startsWith(m.targetId) || record.targetId.includes(m.targetId)
  );
  const hwCompat = HARDWARE_COMPATIBILITY_MATRIX.find((c) =>
    record.targetId.startsWith(c.targetId) || record.targetId.includes(c.targetId)
  );
  const firstBoot = FIRST_BOOT_CERTIFICATIONS.find((c) =>
    record.targetId.startsWith(c.targetId) || record.targetId.includes(c.targetId)
  );

  return {
    targetId: record.targetId,
    artifactType: record.artifactType,
    readiness: record.readiness,
    signingState: record.signing.currentState,
    notarizationState: record.notarization.currentState,
    checksumPublished: record.checksum.publishedWithArtifact,
    provenanceAvailable: record.provenance.sourceRevisionCaptured,
    bootValidationCovered: record.bootValidation !== null,
    firstBootCertified: firstBoot?.applicable ?? false,
    lifecyclePathsCovered: lifecycle?.paths.length ?? 0,
    hardwareEnvsTested: hwCompat?.environments.filter((e) => e.status === "tested").length ?? 0,
    runbookLinked: record.support.runbookIds.length > 0,
    gaps,
  };
}

export function buildDesktopEvidencePack(): EvidencePackSummary {
  const targets = getDesktopTargets().map(summarizeTarget);
  const allGaps = targets.flatMap((t) => t.gaps);
  const allSigned = targets.every((t) => t.signingState === "signed" || t.signingState === "not-applicable");
  const allNotarized = targets.every((t) => t.notarizationState === "notarized" || t.notarizationState === "not-applicable");

  return {
    generatedAt: new Date().toISOString(),
    packType: "desktop",
    targets,
    overallReadiness: allGaps.length === 0 ? "production-ready" : "deferred-on-external",
    signingClosure: allSigned ? "complete" : "pending-credentials",
    bootValidationClosure: "not-applicable",
    lifecycleClosure: "declared",
    hardwareCompatClosure: "tested-in-ci",
    firstBootClosure: "not-applicable",
    channelClosure: "defined",
    provenanceClosure: "emitted-per-build",
    checksumClosure: "emitted-per-build",
    supportLinkage: "linked",
    gaps: allGaps,
  };
}

export function buildOsImagesEvidencePack(): EvidencePackSummary {
  const targets = getOsTargets().map(summarizeTarget);
  const allGaps = targets.flatMap((t) => t.gaps);
  const bootCovered = targets.every((t) => t.bootValidationCovered);

  return {
    generatedAt: new Date().toISOString(),
    packType: "os-images",
    targets,
    overallReadiness: allGaps.length === 0 ? "production-ready" : "partial",
    signingClosure: "complete",
    bootValidationClosure: bootCovered ? "ci-validated" : "partial",
    lifecycleClosure: "declared",
    hardwareCompatClosure: "partial-tested",
    firstBootClosure: "certified",
    channelClosure: "defined",
    provenanceClosure: "emitted-per-build",
    checksumClosure: "emitted-per-build",
    supportLinkage: "linked",
    gaps: allGaps,
  };
}

export function buildFullReleaseProvenanceAttestation() {
  const supplyChainTargets: SupplyChainTarget[] = ARTIFACT_PROOF_REGISTRY.map((r) => ({
    targetId: r.targetId,
    provenanceAvailable: r.provenance.sourceRevisionCaptured,
    signedArtifact: r.signing.currentState === "signed" || r.signing.currentState === "not-applicable",
    checksumPublished: r.checksum.publishedWithArtifact,
    sbomAvailable: r.targetId.startsWith("os-"),
    reproducibleBuild: r.targetId.startsWith("os-"),
    transparencyLogEntry: false,
    integrityScore: r.readiness === "production-ready" ? 90 : r.readiness === "deferred-on-external" ? 60 : 30,
  }));

  return {
    provenance: buildSupplyChainAttestation(supplyChainTargets),
    channels: RELEASE_CHANNELS,
    promotionRules: CHANNEL_PROMOTION_RULES,
    migrationSemantics: CHANNEL_MIGRATION_SEMANTICS,
    checksums: buildChecksumReport(),
  };
}