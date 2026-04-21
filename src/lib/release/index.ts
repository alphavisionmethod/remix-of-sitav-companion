// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Layer Barrel
// Canonical import: @/lib/release
// ═══════════════════════════════════════════════════════════════

export {
  ARTIFACT_PROOF_REGISTRY,
  getArtifactProof,
  getDesktopTargets,
  getOsTargets,
  getTargetsWithSigningBlockers,
  getProductionReadyTargets,
  getDeferredTargets,
} from "./artifact-proof-contract";

export type {
  ArtifactTargetId,
  ArtifactType,
  SigningState,
  NotarizationState,
  ReadinessState,
  ArtifactProofRecord,
} from "./artifact-proof-contract";

export {
  DESKTOP_SIGNING_POLICIES,
  getSigningPolicy,
  isDesktopSigningFullyReady,
  isDesktopNotarizationFullyReady,
  getSigningBlockers,
} from "./desktop-signing-policy";

export type { PlatformSigningPolicy } from "./desktop-signing-policy";

export {
  OS_BOOT_VALIDATION_MATRIX,
  getBootValidationForFormat,
  getAllCIBootCoveredFormats,
  getUncoveredFormats,
} from "./os-boot-validation-policy";

export type { BootValidationEntry } from "./os-boot-validation-policy";

export {
  INSTALL_UPGRADE_ROLLBACK_MATRIX,
  getLifecycleMatrix,
  getUnvalidatedPaths,
} from "./install-upgrade-rollback-matrix";

export type { TargetLifecycleMatrix, LifecyclePathEntry } from "./install-upgrade-rollback-matrix";

export {
  HARDWARE_COMPATIBILITY_MATRIX,
  getCompatibility,
  getTestedEnvironments,
  getIncompatibleEnvironments,
  getUntestedEnvironments,
} from "./hardware-compatibility-matrix";

export type { HardwareEnvironment, TargetCompatibility } from "./hardware-compatibility-matrix";

export {
  FIRST_BOOT_CERTIFICATIONS,
  getFirstBootCertification,
  getMandatoryFirstBootChecks,
} from "./first-boot-certification";

export type { FirstBootCertification, FirstBootCheck } from "./first-boot-certification";

export {
  RELEASE_CHANNELS,
  CHANNEL_PROMOTION_RULES,
  CHANNEL_MIGRATION_SEMANTICS,
  getChannel,
  getPromotionRule,
  getMigrationSemantics,
} from "./release-channel-policy";

export type { ChannelId, ReleaseChannel, ChannelPromotionRule, ChannelMigrationSemantics } from "./release-channel-policy";

export {
  buildProvenanceRecord,
  buildSupplyChainAttestation,
} from "./provenance-attestation-builder";

export type { ProvenanceRecord, SupplyChainAttestation, SupplyChainTarget } from "./provenance-attestation-builder";

export {
  CHECKSUM_ENTRIES,
  buildChecksumReport,
} from "./checksum-publication";

export type { ChecksumEntry, ChecksumPublicationReport } from "./checksum-publication";

export {
  buildDesktopEvidencePack,
  buildOsImagesEvidencePack,
  buildFullReleaseProvenanceAttestation,
} from "./release-evidence-pack-builder";

export type { EvidencePackSummary, TargetEvidenceSummary } from "./release-evidence-pack-builder";