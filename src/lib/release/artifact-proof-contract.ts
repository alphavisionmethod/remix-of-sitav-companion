// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Proof Contract
// Canonical proof model per build target. Every shipped artifact
// must satisfy this contract before claiming distribution-ready.
// ═══════════════════════════════════════════════════════════════

export type ArtifactTargetId =
  | "desktop-linux-x64"
  | "desktop-darwin-x64"
  | "desktop-darwin-arm64"
  | "desktop-win32-x64"
  | "os-iso-user"
  | "os-iso-operator"
  | "os-ova"
  | "os-raw-img";

export type ArtifactType =
  | "electron-tar-gz"
  | "electron-zip"
  | "bootable-iso"
  | "vmware-ova"
  | "raw-disk-img";

export type SigningState =
  | "signed"
  | "unsigned"
  | "deferred-on-cert"
  | "not-applicable";

export type NotarizationState =
  | "notarized"
  | "deferred-on-cert"
  | "not-applicable";

export type ReadinessState =
  | "production-ready"
  | "scaffold-ready"
  | "deferred-on-external"
  | "not-started";

export interface SigningRequirement {
  readonly platform: string;
  readonly required: boolean;
  readonly mechanism: string;
  readonly currentState: SigningState;
  readonly blockers: string[];
  readonly requiredSecrets: string[];
}

export interface NotarizationRequirement {
  readonly platform: string;
  readonly required: boolean;
  readonly mechanism: string;
  readonly currentState: NotarizationState;
  readonly blockers: string[];
}

export interface ProvenanceRequirement {
  readonly buildWorkflow: string;
  readonly sourceRevisionCaptured: boolean;
  readonly materialsRecorded: boolean;
  readonly attestationFormat: string;
}

export interface ChecksumRequirement {
  readonly algorithm: "sha256" | "sha384" | "sha512";
  readonly publishedWithArtifact: boolean;
  readonly verificationGuidance: string;
}

export interface BootValidationRequirement {
  readonly ciJobId: string;
  readonly bootCriteria: string[];
  readonly failureDetection: string[];
  readonly safeModeExpected: boolean;
  readonly evidenceEmitted: string[];
}

export interface FirstBootRequirement {
  readonly shellLaunch: boolean;
  readonly runtimeReadiness: boolean;
  readonly essentialDaemons: string[];
  readonly profileResolution: boolean;
  readonly crashSafeStartup: boolean;
  readonly supportVisibility: boolean;
}

export interface InstallUpgradeRollbackExpectation {
  readonly freshInstallValidated: boolean;
  readonly upgradeFromPrevious: boolean;
  readonly rollbackOnFailure: boolean;
  readonly channelMigration: boolean;
  readonly downgradeConstraints: string[];
}

export interface HardwareCompatRequirement {
  readonly testedEnvironments: string[];
  readonly knownIncompatible: string[];
  readonly tpmRequired: boolean;
  readonly secureBootRequired: boolean;
  readonly minRamMb: number;
  readonly minDiskGb: number;
}

export interface SupportLinkage {
  readonly runbookIds: string[];
  readonly recoveryPaths: string[];
  readonly supportBundleIncluded: boolean;
}

export interface ArtifactProofRecord {
  readonly targetId: ArtifactTargetId;
  readonly artifactType: ArtifactType;
  readonly buildWorkflow: string;
  readonly packagingSource: string;
  readonly signing: SigningRequirement;
  readonly notarization: NotarizationRequirement;
  readonly provenance: ProvenanceRequirement;
  readonly checksum: ChecksumRequirement;
  readonly releaseChannels: string[];
  readonly installUpgradeRollback: InstallUpgradeRollbackExpectation;
  readonly bootValidation: BootValidationRequirement | null;
  readonly firstBoot: FirstBootRequirement | null;
  readonly hardwareCompat: HardwareCompatRequirement | null;
  readonly support: SupportLinkage;
  readonly evidencePackLocation: string;
  readonly readiness: ReadinessState;
}

// ── Canonical artifact registry ──────────────────────────────

export const ARTIFACT_PROOF_REGISTRY: readonly ArtifactProofRecord[] = [
  // ── Desktop: Linux x64 ────────────────────────────────────
  {
    targetId: "desktop-linux-x64",
    artifactType: "electron-tar-gz",
    buildWorkflow: ".github/workflows/release-electron.yml",
    packagingSource: "electron/forge.config.cjs",
    signing: {
      platform: "linux",
      required: false,
      mechanism: "gpg (optional dpkg-sig)",
      currentState: "not-applicable",
      blockers: [],
      requiredSecrets: ["LINUX_GPG_PRIVATE_KEY", "LINUX_GPG_PASSPHRASE"],
    },
    notarization: {
      platform: "linux",
      required: false,
      mechanism: "n/a",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/release-electron.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-provenance-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "sha256sum --check SITA-OS-linux-x64.tar.gz.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["Auto-updater prevents downgrade below minimum-version policy"],
    },
    bootValidation: null,
    firstBoot: null,
    hardwareCompat: null,
    support: {
      runbookIds: ["RB-DESKTOP-HOST-BRIDGE", "RB-RELEASE-ROLLBACK"],
      recoveryPaths: ["Auto-update rollback channel", "Manual re-install from archive"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/desktop/",
    readiness: "production-ready",
  },

  // ── Desktop: macOS x64 ────────────────────────────────────
  {
    targetId: "desktop-darwin-x64",
    artifactType: "electron-tar-gz",
    buildWorkflow: ".github/workflows/release-electron.yml",
    packagingSource: "electron/forge.config.cjs",
    signing: {
      platform: "darwin",
      required: true,
      mechanism: "Apple Developer ID codesign + hardened runtime",
      currentState: "deferred-on-cert",
      blockers: ["Apple Developer Program enrollment pending"],
      requiredSecrets: ["MAC_CERTS", "MAC_CERTS_PASSWORD", "APPLE_ID", "APPLE_ID_PASSWORD", "APPLE_TEAM_ID"],
    },
    notarization: {
      platform: "darwin",
      required: true,
      mechanism: "notarytool + stapler",
      currentState: "deferred-on-cert",
      blockers: ["Apple Developer Program enrollment pending"],
    },
    provenance: {
      buildWorkflow: ".github/workflows/release-electron.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-provenance-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "shasum -a 256 --check SITA-OS-darwin-x64.tar.gz.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["Auto-updater prevents downgrade below minimum-version policy"],
    },
    bootValidation: null,
    firstBoot: null,
    hardwareCompat: null,
    support: {
      runbookIds: ["RB-DESKTOP-HOST-BRIDGE", "RB-RELEASE-ROLLBACK"],
      recoveryPaths: ["Auto-update rollback channel", "Manual re-install from archive"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/desktop/",
    readiness: "deferred-on-external",
  },

  // ── Desktop: macOS arm64 ──────────────────────────────────
  {
    targetId: "desktop-darwin-arm64",
    artifactType: "electron-tar-gz",
    buildWorkflow: ".github/workflows/release-electron.yml",
    packagingSource: "electron/forge.config.cjs",
    signing: {
      platform: "darwin",
      required: true,
      mechanism: "Apple Developer ID codesign + hardened runtime",
      currentState: "deferred-on-cert",
      blockers: ["Apple Developer Program enrollment pending"],
      requiredSecrets: ["MAC_CERTS", "MAC_CERTS_PASSWORD", "APPLE_ID", "APPLE_ID_PASSWORD", "APPLE_TEAM_ID"],
    },
    notarization: {
      platform: "darwin",
      required: true,
      mechanism: "notarytool + stapler",
      currentState: "deferred-on-cert",
      blockers: ["Apple Developer Program enrollment pending"],
    },
    provenance: {
      buildWorkflow: ".github/workflows/release-electron.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-provenance-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "shasum -a 256 --check SITA-OS-darwin-arm64.tar.gz.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["Auto-updater prevents downgrade below minimum-version policy"],
    },
    bootValidation: null,
    firstBoot: null,
    hardwareCompat: null,
    support: {
      runbookIds: ["RB-DESKTOP-HOST-BRIDGE", "RB-RELEASE-ROLLBACK"],
      recoveryPaths: ["Auto-update rollback channel", "Manual re-install from archive"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/desktop/",
    readiness: "deferred-on-external",
  },

  // ── Desktop: Windows x64 ──────────────────────────────────
  {
    targetId: "desktop-win32-x64",
    artifactType: "electron-zip",
    buildWorkflow: ".github/workflows/release-electron.yml",
    packagingSource: "electron/forge.config.cjs",
    signing: {
      platform: "win32",
      required: true,
      mechanism: "Authenticode signtool (EV/OV cert)",
      currentState: "deferred-on-cert",
      blockers: ["EV/OV code-signing certificate procurement pending"],
      requiredSecrets: ["WINDOWS_PFX", "WINDOWS_PFX_PASSWORD"],
    },
    notarization: {
      platform: "win32",
      required: false,
      mechanism: "n/a (Authenticode SmartScreen reputation)",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/release-electron.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-provenance-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "certutil -hashfile SITA-OS-win32-x64.zip SHA256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["Auto-updater prevents downgrade below minimum-version policy"],
    },
    bootValidation: null,
    firstBoot: null,
    hardwareCompat: null,
    support: {
      runbookIds: ["RB-DESKTOP-HOST-BRIDGE", "RB-RELEASE-ROLLBACK"],
      recoveryPaths: ["Auto-update rollback channel", "Manual re-install from archive"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/desktop/",
    readiness: "deferred-on-external",
  },

  // ── OS: ISO (user profile) ────────────────────────────────
  {
    targetId: "os-iso-user",
    artifactType: "bootable-iso",
    buildWorkflow: ".github/workflows/os-build-iso.yml",
    packagingSource: "os/image-builder/build.sh",
    signing: {
      platform: "linux",
      required: true,
      mechanism: "MOK Secure Boot signing (sbsigntool)",
      currentState: "signed",
      blockers: [],
      requiredSecrets: ["SITA_MOK_KEY_BASE64", "SITA_MOK_CERT_BASE64"],
    },
    notarization: {
      platform: "linux",
      required: false,
      mechanism: "n/a",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/os-build-iso.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-os-attestation-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "sha256sum --check sita-os-*-amd64.iso.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["A/B partition rollback limited to one previous slot"],
    },
    bootValidation: {
      ciJobId: "smoke-test (user)",
      bootCriteria: ["GRUB menu loads", "Kernel boots to systemd target", "Shell is reachable", "Runtime health passes"],
      failureDetection: ["QEMU serial console timeout", "No login prompt within 180s", "Kernel panic on console"],
      safeModeExpected: true,
      evidenceEmitted: ["out/qemu-validation-report.json", "out/qemu-validation.log"],
    },
    firstBoot: {
      shellLaunch: true,
      runtimeReadiness: true,
      essentialDaemons: ["sita-os.service", "sita-ota.service", "sita-backup.service", "sita-metrics.service"],
      profileResolution: true,
      crashSafeStartup: true,
      supportVisibility: true,
    },
    hardwareCompat: {
      testedEnvironments: ["QEMU/KVM x86_64", "VMware ESXi 7+", "VirtualBox 7+", "Bare-metal x86_64 UEFI"],
      knownIncompatible: ["ARM64 (not yet supported)", "Legacy BIOS-only (hybrid ISO covers BIOS but untested)"],
      tpmRequired: false,
      secureBootRequired: false,
      minRamMb: 4096,
      minDiskGb: 32,
    },
    support: {
      runbookIds: ["RB-VMWARE-BOOT", "RB-RELEASE-ROLLBACK", "RB-SETUP-CHECKPOINT-CORRUPTION"],
      recoveryPaths: ["Recovery partition", "OTA rollback via sita-ota-agent.sh", "Fresh re-install from ISO"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/os-images/",
    readiness: "production-ready",
  },

  // ── OS: ISO (operator profile) ────────────────────────────
  {
    targetId: "os-iso-operator",
    artifactType: "bootable-iso",
    buildWorkflow: ".github/workflows/os-build-iso.yml",
    packagingSource: "os/image-builder/build.sh",
    signing: {
      platform: "linux",
      required: true,
      mechanism: "MOK Secure Boot signing (sbsigntool)",
      currentState: "signed",
      blockers: [],
      requiredSecrets: ["SITA_MOK_KEY_BASE64", "SITA_MOK_CERT_BASE64"],
    },
    notarization: {
      platform: "linux",
      required: false,
      mechanism: "n/a",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/os-build-iso.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-os-attestation-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "sha256sum --check sita-os-*-amd64.iso.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["A/B partition rollback limited to one previous slot"],
    },
    bootValidation: {
      ciJobId: "smoke-test (operator)",
      bootCriteria: ["GRUB menu loads", "Kernel boots to systemd target", "Shell is reachable", "Runtime health passes"],
      failureDetection: ["QEMU serial console timeout", "No login prompt within 180s", "Kernel panic on console"],
      safeModeExpected: true,
      evidenceEmitted: ["out/qemu-validation-report.json", "out/qemu-validation.log"],
    },
    firstBoot: {
      shellLaunch: true,
      runtimeReadiness: true,
      essentialDaemons: ["sita-os.service", "sita-ota.service", "sita-backup.service", "sita-metrics.service"],
      profileResolution: true,
      crashSafeStartup: true,
      supportVisibility: true,
    },
    hardwareCompat: {
      testedEnvironments: ["QEMU/KVM x86_64", "VMware ESXi 7+", "VirtualBox 7+", "Bare-metal x86_64 UEFI"],
      knownIncompatible: ["ARM64 (not yet supported)"],
      tpmRequired: false,
      secureBootRequired: false,
      minRamMb: 4096,
      minDiskGb: 32,
    },
    support: {
      runbookIds: ["RB-VMWARE-BOOT", "RB-RELEASE-ROLLBACK", "RB-SETUP-CHECKPOINT-CORRUPTION"],
      recoveryPaths: ["Recovery partition", "OTA rollback via sita-ota-agent.sh", "Fresh re-install from ISO"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/os-images/",
    readiness: "production-ready",
  },

  // ── OS: OVA ───────────────────────────────────────────────
  {
    targetId: "os-ova",
    artifactType: "vmware-ova",
    buildWorkflow: ".github/workflows/os-build-iso.yml",
    packagingSource: "os/vmware/build-ova.sh",
    signing: {
      platform: "linux",
      required: true,
      mechanism: "SHA-256 checksum + MOK chain from parent ISO",
      currentState: "signed",
      blockers: [],
      requiredSecrets: [],
    },
    notarization: {
      platform: "linux",
      required: false,
      mechanism: "n/a",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/os-build-iso.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-os-attestation-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "sha256sum --check sita-os-*-amd64.ova.sha256",
    },
    releaseChannels: ["beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: false,
      downgradeConstraints: ["OVA requires full re-deploy for major version downgrade"],
    },
    bootValidation: {
      ciJobId: "build-ova",
      bootCriteria: ["OVA imports into hypervisor", "VM boots from VMDK", "Network reachable post-boot"],
      failureDetection: ["OVA build script exit non-zero", "VMDK conversion failure"],
      safeModeExpected: false,
      evidenceEmitted: ["out/*.ova.manifest.json", "out/*.ova.sha256"],
    },
    firstBoot: {
      shellLaunch: true,
      runtimeReadiness: true,
      essentialDaemons: ["sita-os.service", "sita-ota.service"],
      profileResolution: true,
      crashSafeStartup: true,
      supportVisibility: true,
    },
    hardwareCompat: {
      testedEnvironments: ["VMware ESXi 7+", "VMware Workstation 17+", "VMware Fusion 13+"],
      knownIncompatible: ["Hyper-V (use ISO instead)", "Proxmox (use RAW IMG)"],
      tpmRequired: false,
      secureBootRequired: false,
      minRamMb: 4096,
      minDiskGb: 32,
    },
    support: {
      runbookIds: ["RB-VMWARE-BOOT", "RB-RELEASE-ROLLBACK", "RB-ESXI-TPM-PROVISIONING"],
      recoveryPaths: ["VMware snapshot rollback", "OTA rollback via sita-ota-agent.sh", "Fresh OVA re-deploy"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/os-images/",
    readiness: "production-ready",
  },

  // ── OS: RAW IMG ───────────────────────────────────────────
  {
    targetId: "os-raw-img",
    artifactType: "raw-disk-img",
    buildWorkflow: ".github/workflows/os-build-iso.yml",
    packagingSource: "os/scripts/build-raw-img.sh",
    signing: {
      platform: "linux",
      required: true,
      mechanism: "SHA-256 checksum + dm-verity root hash",
      currentState: "signed",
      blockers: [],
      requiredSecrets: [],
    },
    notarization: {
      platform: "linux",
      required: false,
      mechanism: "n/a",
      currentState: "not-applicable",
      blockers: [],
    },
    provenance: {
      buildWorkflow: ".github/workflows/os-build-iso.yml",
      sourceRevisionCaptured: true,
      materialsRecorded: true,
      attestationFormat: "sita-os-attestation-v1",
    },
    checksum: {
      algorithm: "sha256",
      publishedWithArtifact: true,
      verificationGuidance: "sha256sum --check sita-os-*-amd64.img.sha256",
    },
    releaseChannels: ["dev", "internal", "beta", "stable"],
    installUpgradeRollback: {
      freshInstallValidated: true,
      upgradeFromPrevious: true,
      rollbackOnFailure: true,
      channelMigration: true,
      downgradeConstraints: ["Raw image flash overwrites; rollback requires re-flash"],
    },
    bootValidation: null,
    firstBoot: {
      shellLaunch: true,
      runtimeReadiness: true,
      essentialDaemons: ["sita-os.service", "sita-ota.service"],
      profileResolution: true,
      crashSafeStartup: true,
      supportVisibility: true,
    },
    hardwareCompat: {
      testedEnvironments: ["Bare-metal x86_64 UEFI", "Cloud VMs (AWS, GCP, Azure via raw import)"],
      knownIncompatible: ["ARM64 (not yet supported)"],
      tpmRequired: false,
      secureBootRequired: false,
      minRamMb: 4096,
      minDiskGb: 32,
    },
    support: {
      runbookIds: ["RB-RELEASE-ROLLBACK"],
      recoveryPaths: ["Re-flash from latest raw image", "OTA rollback via sita-ota-agent.sh"],
      supportBundleIncluded: true,
    },
    evidencePackLocation: "public/generated/release-artifact-proof/os-images/",
    readiness: "production-ready",
  },
] as const;

// ── Helpers ─────────────────────────────────────────────────

export function getArtifactProof(targetId: ArtifactTargetId): ArtifactProofRecord | undefined {
  return ARTIFACT_PROOF_REGISTRY.find((r) => r.targetId === targetId);
}

export function getDesktopTargets(): ArtifactProofRecord[] {
  return ARTIFACT_PROOF_REGISTRY.filter((r) => r.targetId.startsWith("desktop-"));
}

export function getOsTargets(): ArtifactProofRecord[] {
  return ARTIFACT_PROOF_REGISTRY.filter((r) => r.targetId.startsWith("os-"));
}

export function getTargetsWithSigningBlockers(): ArtifactProofRecord[] {
  return ARTIFACT_PROOF_REGISTRY.filter((r) => r.signing.blockers.length > 0);
}

export function getProductionReadyTargets(): ArtifactProofRecord[] {
  return ARTIFACT_PROOF_REGISTRY.filter((r) => r.readiness === "production-ready");
}

export function getDeferredTargets(): ArtifactProofRecord[] {
  return ARTIFACT_PROOF_REGISTRY.filter((r) => r.readiness === "deferred-on-external");
}