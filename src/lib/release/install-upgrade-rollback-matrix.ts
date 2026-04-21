// ═══════════════════════════════════════════════════════════════
// SITA OS — Install / Upgrade / Rollback Matrix
// Declares lifecycle path coverage per artifact target.
// ═══════════════════════════════════════════════════════════════

export type LifecyclePathType =
  | "fresh-install"
  | "upgrade-same-channel"
  | "upgrade-cross-channel"
  | "rollback-auto"
  | "rollback-manual"
  | "downgrade";

export type ValidationStatus = "validated" | "declared" | "partial" | "not-applicable";

export interface LifecyclePathEntry {
  readonly pathType: LifecyclePathType;
  readonly description: string;
  readonly validationStatus: ValidationStatus;
  readonly mechanism: string;
  readonly evidenceSource: string;
  readonly constraints: string[];
}

export interface TargetLifecycleMatrix {
  readonly targetId: string;
  readonly targetLabel: string;
  readonly paths: readonly LifecyclePathEntry[];
}

export const INSTALL_UPGRADE_ROLLBACK_MATRIX: readonly TargetLifecycleMatrix[] = [
  {
    targetId: "desktop",
    targetLabel: "Electron Desktop (all platforms)",
    paths: [
      {
        pathType: "fresh-install",
        description: "User downloads archive and extracts/runs for the first time",
        validationStatus: "validated",
        mechanism: "Electron packager output runs standalone without prior state",
        evidenceSource: ".github/workflows/release-electron.yml",
        constraints: [],
      },
      {
        pathType: "upgrade-same-channel",
        description: "Auto-updater pulls next version from same channel",
        validationStatus: "declared",
        mechanism: "electron/auto-updater.cjs checks manifest, downloads, verifies signature, swaps binary",
        evidenceSource: "electron/auto-updater.cjs",
        constraints: ["Requires signed update manifests on darwin/win32"],
      },
      {
        pathType: "upgrade-cross-channel",
        description: "User migrates from beta to stable channel",
        validationStatus: "declared",
        mechanism: "Channel preference stored in user settings; next update check uses new channel URL",
        evidenceSource: "electron/auto-updater.cjs",
        constraints: ["Cross-channel migration is one-way (stable→beta requires opt-in)"],
      },
      {
        pathType: "rollback-auto",
        description: "Auto-updater rolls back if updated binary fails health check",
        validationStatus: "declared",
        mechanism: "Previous binary kept in rollback slot; crash-reporter triggers revert",
        evidenceSource: "electron/crash-reporter.cjs",
        constraints: ["Rollback slot holds exactly one previous version"],
      },
      {
        pathType: "rollback-manual",
        description: "User manually downloads previous version archive",
        validationStatus: "validated",
        mechanism: "Archives are immutable on GitHub Releases; user re-extracts",
        evidenceSource: ".github/workflows/release-electron.yml",
        constraints: [],
      },
      {
        pathType: "downgrade",
        description: "User attempts to install older version than minimum-version policy",
        validationStatus: "declared",
        mechanism: "Auto-updater enforces minimum-version-policy; manual downgrade not blocked",
        evidenceSource: "electron/auto-updater.cjs",
        constraints: ["Manual downgrade may cause data migration issues"],
      },
    ],
  },
  {
    targetId: "os-iso",
    targetLabel: "OS ISO (user + operator profiles)",
    paths: [
      {
        pathType: "fresh-install",
        description: "Boot from ISO, run installer to disk",
        validationStatus: "validated",
        mechanism: "os/installer/scripts/install.sh partitions and installs to A/B layout",
        evidenceSource: ".github/workflows/os-build-iso.yml (QEMU smoke test)",
        constraints: ["Requires 32GB+ disk, 4GB+ RAM"],
      },
      {
        pathType: "upgrade-same-channel",
        description: "OTA agent pulls next bundle from channel manifest",
        validationStatus: "validated",
        mechanism: "scripts/release/supply-chain/sita-ota-agent.sh downloads, verifies signature, applies to inactive partition",
        evidenceSource: "os/scripts/verify-update-bundle.sh",
        constraints: ["A/B partition scheme required"],
      },
      {
        pathType: "upgrade-cross-channel",
        description: "Operator switches channel in deployment profile",
        validationStatus: "declared",
        mechanism: "Channel field in /etc/sita/deployment-profile.json; next OTA poll uses new channel",
        evidenceSource: "os/profiles/profile.schema.json",
        constraints: ["Operator profile required for channel change"],
      },
      {
        pathType: "rollback-auto",
        description: "Failed boot on new partition triggers A/B rollback",
        validationStatus: "validated",
        mechanism: "GRUB/systemd-boot counts failed boots; reverts to previous slot after 3 failures",
        evidenceSource: "os/scripts/rollback-to-previous.sh",
        constraints: ["One rollback slot available"],
      },
      {
        pathType: "rollback-manual",
        description: "Operator triggers manual rollback via sita-ops CLI",
        validationStatus: "declared",
        mechanism: "os/bin/sita-ops rollback activates previous partition",
        evidenceSource: "os/bin/sita-ops",
        constraints: [],
      },
      {
        pathType: "downgrade",
        description: "Forced downgrade to earlier version",
        validationStatus: "declared",
        mechanism: "Fresh re-install from older ISO; OTA does not support downgrade",
        evidenceSource: "os/scripts/release.sh",
        constraints: ["Data migration not guaranteed on downgrade"],
      },
    ],
  },
  {
    targetId: "os-ova",
    targetLabel: "VMware OVA Appliance",
    paths: [
      {
        pathType: "fresh-install",
        description: "Import OVA into VMware hypervisor",
        validationStatus: "validated",
        mechanism: "Standard OVF import; first-boot provisioning via sita-first-boot.sh",
        evidenceSource: ".github/workflows/os-build-iso.yml (build-ova job)",
        constraints: ["VMware ESXi 7+ or Workstation 17+ required"],
      },
      {
        pathType: "upgrade-same-channel",
        description: "OTA agent upgrades within running VM",
        validationStatus: "declared",
        mechanism: "Same OTA path as ISO; sita-ota-agent.sh operates inside the VM",
        evidenceSource: "scripts/release/iso/sita-ota-agent.sh",
        constraints: [],
      },
      {
        pathType: "rollback-auto",
        description: "A/B partition rollback within VM",
        validationStatus: "declared",
        mechanism: "Same A/B mechanism as ISO",
        evidenceSource: "os/scripts/rollback-to-previous.sh",
        constraints: [],
      },
      {
        pathType: "rollback-manual",
        description: "VMware snapshot rollback",
        validationStatus: "declared",
        mechanism: "Hypervisor-level snapshot/revert",
        evidenceSource: "docs/vmware-deployment.md",
        constraints: ["Requires VMware snapshot taken before upgrade"],
      },
      {
        pathType: "downgrade",
        description: "Full OVA re-deploy from older version",
        validationStatus: "declared",
        mechanism: "Delete VM, import older OVA",
        evidenceSource: "docs/vmware-deployment.md",
        constraints: ["All VM state is lost on re-deploy"],
      },
    ],
  },
  {
    targetId: "os-raw-img",
    targetLabel: "Raw Disk Image (cloud/bare-metal)",
    paths: [
      {
        pathType: "fresh-install",
        description: "dd-flash to disk or cloud import",
        validationStatus: "validated",
        mechanism: "Raw image flashed via dd or cloud console import",
        evidenceSource: ".github/workflows/os-build-iso.yml",
        constraints: ["32GB+ target disk required"],
      },
      {
        pathType: "upgrade-same-channel",
        description: "OTA agent upgrades in-place",
        validationStatus: "declared",
        mechanism: "Same OTA path as ISO",
        evidenceSource: "scripts/release/iso/sita-ota-agent.sh",
        constraints: [],
      },
      {
        pathType: "rollback-auto",
        description: "A/B partition rollback",
        validationStatus: "declared",
        mechanism: "Same A/B mechanism as ISO",
        evidenceSource: "os/scripts/rollback-to-previous.sh",
        constraints: [],
      },
      {
        pathType: "rollback-manual",
        description: "Re-flash from previous image",
        validationStatus: "declared",
        mechanism: "dd-flash older .img file",
        evidenceSource: "os/scripts/build-raw-img.sh",
        constraints: ["All state lost on re-flash"],
      },
    ],
  },
];

export function getLifecycleMatrix(targetId: string): TargetLifecycleMatrix | undefined {
  return INSTALL_UPGRADE_ROLLBACK_MATRIX.find((m) => m.targetId === targetId);
}

export function getUnvalidatedPaths(): Array<{ targetId: string; pathType: string }> {
  const gaps: Array<{ targetId: string; pathType: string }> = [];
  for (const target of INSTALL_UPGRADE_ROLLBACK_MATRIX) {
    for (const path of target.paths) {
      if (path.validationStatus !== "validated" && path.validationStatus !== "not-applicable") {
        gaps.push({ targetId: target.targetId, pathType: path.pathType });
      }
    }
  }
  return gaps;
}