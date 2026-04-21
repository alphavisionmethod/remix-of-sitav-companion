#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Proof Artifact Generator
// Generates all release distribution proof JSON artifacts.
// ═══════════════════════════════════════════════════════════════

import { mkdirSync, writeFileSync } from "node:fs";
import { ARTIFACT_PROOF_REGISTRY, getDesktopTargets, getOsTargets, getTargetsWithSigningBlockers } from "../../src/lib/release/artifact-proof-contract";
import { DESKTOP_SIGNING_POLICIES, isDesktopSigningFullyReady, isDesktopNotarizationFullyReady, getSigningBlockers } from "../../src/lib/release/desktop-signing-policy";
import { OS_BOOT_VALIDATION_MATRIX, getAllCIBootCoveredFormats } from "../../src/lib/release/os-boot-validation-policy";
import { INSTALL_UPGRADE_ROLLBACK_MATRIX, getUnvalidatedPaths } from "../../src/lib/release/install-upgrade-rollback-matrix";
import { HARDWARE_COMPATIBILITY_MATRIX, getTestedEnvironments, getIncompatibleEnvironments, getUntestedEnvironments } from "../../src/lib/release/hardware-compatibility-matrix";
import { FIRST_BOOT_CERTIFICATIONS, getMandatoryFirstBootChecks } from "../../src/lib/release/first-boot-certification";
import { RELEASE_CHANNELS, CHANNEL_PROMOTION_RULES, CHANNEL_MIGRATION_SEMANTICS } from "../../src/lib/release/release-channel-policy";
import { buildChecksumReport } from "../../src/lib/release/checksum-publication";
import { buildDesktopEvidencePack, buildOsImagesEvidencePack, buildFullReleaseProvenanceAttestation } from "../../src/lib/release/release-evidence-pack-builder";

const now = new Date().toISOString();
const write = (path: string, data: unknown) => {
  writeFileSync(path, JSON.stringify(data, null, 2));
  console.log(`  ✅ ${path}`);
};

// Ensure directories
mkdirSync("public/generated/release-artifact-proof/desktop", { recursive: true });
mkdirSync("public/generated/release-artifact-proof/os-images", { recursive: true });
mkdirSync("generated", { recursive: true });

console.log("═══ Generating Release Proof Artifacts ═══\n");

// 1. Desktop evidence pack
write("public/generated/release-artifact-proof/desktop/proof-pack.json", buildDesktopEvidencePack());

// 2. OS images evidence pack
write("public/generated/release-artifact-proof/os-images/proof-pack.json", buildOsImagesEvidencePack());

// 3. Desktop notarization status
write("generated/desktop-notarization-status.json", {
  generatedAt: now,
  signingFullyReady: isDesktopSigningFullyReady(),
  notarizationFullyReady: isDesktopNotarizationFullyReady(),
  platforms: DESKTOP_SIGNING_POLICIES,
  blockers: getSigningBlockers(),
  deferredTargets: getTargetsWithSigningBlockers().map((t) => t.targetId),
});

// 4. OS boot CI matrix
write("generated/os-boot-ci-matrix.json", {
  generatedAt: now,
  coveredFormats: getAllCIBootCoveredFormats(),
  matrix: OS_BOOT_VALIDATION_MATRIX,
  allFormatsCovered: OS_BOOT_VALIDATION_MATRIX.every((e) => e.coveredInCI),
});

// 5. Install/upgrade/rollback matrix
write("generated/install-upgrade-rollback-matrix.json", {
  generatedAt: now,
  targets: INSTALL_UPGRADE_ROLLBACK_MATRIX,
  unvalidatedPaths: getUnvalidatedPaths(),
});

// 6. Hardware compatibility validation
write("generated/hardware-compatibility-validation.json", {
  generatedAt: now,
  matrix: HARDWARE_COMPATIBILITY_MATRIX,
  tested: getTestedEnvironments().map((e) => e.environmentId),
  incompatible: getIncompatibleEnvironments().map((e) => e.environmentId),
  untested: getUntestedEnvironments().map((e) => e.environmentId),
});

// 7. First-boot certification report
write("generated/first-boot-certification-report.json", {
  generatedAt: now,
  certifications: FIRST_BOOT_CERTIFICATIONS,
  mandatoryCheckCounts: FIRST_BOOT_CERTIFICATIONS.map((c) => ({
    targetId: c.targetId,
    mandatory: getMandatoryFirstBootChecks(c.targetId).length,
    total: c.checks.length,
  })),
});

// 8. Release channel migration report
write("generated/release-channel-migration-report.json", {
  generatedAt: now,
  channels: RELEASE_CHANNELS,
  promotionRules: CHANNEL_PROMOTION_RULES,
  migrationSemantics: CHANNEL_MIGRATION_SEMANTICS,
});

// 9. Release checksums
write("generated/release-checksums.json", buildChecksumReport());

// 10. Supply chain attestation
const fullAttestation = buildFullReleaseProvenanceAttestation();
write("generated/supply-chain-attestation.json", fullAttestation.provenance);

// 11. Release provenance attestation (replaces existing)
write("generated/release-provenance-attestation.json", {
  generatedAt: now,
  format: "sita-provenance-v1",
  surfaces: {
    web: { buildTool: "vite", outputDir: "dist/", deployTarget: "CDN", signingStatus: "n/a" },
    desktop: {
      buildTool: "electron-packager",
      signingStatus: isDesktopSigningFullyReady() ? "signed" : "deferred-notarization",
      platforms: ["linux", "darwin", "win32"],
      perPlatformSigning: DESKTOP_SIGNING_POLICIES.map((p) => ({
        platform: p.platform,
        signingReady: p.signingReady,
        notarizationReady: p.notarizationReady,
        blockers: p.blockers,
      })),
    },
    appliance: {
      formats: ["ISO", "OVA", "RAW"],
      buildScripts: ["os/image-builder/build.sh", "os/vmware/build-ova.sh", "os/scripts/build-raw-img.sh"],
      signingStatus: "sha256-checksums + MOK-signed boot chain",
      bootValidation: "QEMU CI smoke test",
    },
  },
  rollbackPaths: {
    web: "CDN rollback to previous build",
    desktop: "Auto-update rollback channel",
    appliance: "OTA rollback via sita-ota-agent.sh + A/B partition",
  },
  supplyChain: fullAttestation.provenance,
});

// 12. Release supportability report
write("generated/release-supportability-report.json", {
  generatedAt: now,
  targets: ARTIFACT_PROOF_REGISTRY.map((r) => ({
    targetId: r.targetId,
    runbookIds: r.support.runbookIds,
    recoveryPaths: r.support.recoveryPaths,
    supportBundleIncluded: r.support.supportBundleIncluded,
    readiness: r.readiness,
  })),
  runbooks: [
    "docs/runbooks/release-rollback.md",
    "docs/runbooks/vmware-boot-failure.md",
    "docs/runbooks/desktop-host-bridge-failure.md",
    "docs/runbooks/DESKTOP_SIGNING_PROVISIONING.md",
    "docs/runbooks/APPLIANCE_ESXI_TPM_PROVISIONING.md",
  ],
});

console.log(`\n✅ All 12 release proof artifacts generated.`);