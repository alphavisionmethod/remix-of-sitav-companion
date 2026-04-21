// ═══════════════════════════════════════════════════════════════
// SITA OS — Checksum Publication
// Per-artifact checksum model and verification guidance.
// ═══════════════════════════════════════════════════════════════

export interface ChecksumEntry {
  readonly artifactName: string;
  readonly targetId: string;
  readonly algorithm: "sha256";
  readonly checksumValue: string;
  readonly checksumFileName: string;
  readonly publicationTarget: string;
  readonly verificationCommand: string;
}

export interface ChecksumPublicationReport {
  readonly generatedAt: string;
  readonly algorithm: "sha256";
  readonly entries: readonly ChecksumEntry[];
  readonly totalArtifacts: number;
  readonly artifactsWithChecksums: number;
  readonly coveragePercent: number;
}

// Canonical checksum entries for all shipped artifacts
export const CHECKSUM_ENTRIES: readonly ChecksumEntry[] = [
  {
    artifactName: "SITA-OS-linux-x64.tar.gz",
    targetId: "desktop-linux-x64",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "SITA-OS-linux-x64.tar.gz.sha256",
    publicationTarget: "GitHub Releases + release-electron-linux-manifest.json",
    verificationCommand: "sha256sum --check SITA-OS-linux-x64.tar.gz.sha256",
  },
  {
    artifactName: "SITA-OS-darwin-x64.tar.gz",
    targetId: "desktop-darwin-x64",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "SITA-OS-darwin-x64.tar.gz.sha256",
    publicationTarget: "GitHub Releases + release-electron-darwin-manifest.json",
    verificationCommand: "shasum -a 256 --check SITA-OS-darwin-x64.tar.gz.sha256",
  },
  {
    artifactName: "SITA-OS-win32-x64.zip",
    targetId: "desktop-win32-x64",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "SITA-OS-win32-x64.zip.sha256",
    publicationTarget: "GitHub Releases + release-electron-win32-manifest.json",
    verificationCommand: "certutil -hashfile SITA-OS-win32-x64.zip SHA256",
  },
  {
    artifactName: "sita-os-<version>-amd64.iso",
    targetId: "os-iso-user",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "sita-os-<version>-amd64.iso.sha256",
    publicationTarget: "GitHub Releases + out/*.sha256",
    verificationCommand: "sha256sum --check sita-os-*-amd64.iso.sha256",
  },
  {
    artifactName: "sita-os-<version>-amd64.ova",
    targetId: "os-ova",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "sita-os-<version>-amd64.ova.sha256",
    publicationTarget: "GitHub Releases + out/*.ova.sha256",
    verificationCommand: "sha256sum --check sita-os-*-amd64.ova.sha256",
  },
  {
    artifactName: "sita-os-<version>-amd64.img",
    targetId: "os-raw-img",
    algorithm: "sha256",
    checksumValue: "computed-at-build-time",
    checksumFileName: "sita-os-<version>-amd64.img.sha256",
    publicationTarget: "GitHub Releases + out/*.sha256",
    verificationCommand: "sha256sum --check sita-os-*-amd64.img.sha256",
  },
];

export function buildChecksumReport(): ChecksumPublicationReport {
  const total = CHECKSUM_ENTRIES.length;
  const withChecksums = CHECKSUM_ENTRIES.filter((e) => e.checksumFileName.length > 0).length;
  return {
    generatedAt: new Date().toISOString(),
    algorithm: "sha256",
    entries: CHECKSUM_ENTRIES,
    totalArtifacts: total,
    artifactsWithChecksums: withChecksums,
    coveragePercent: total > 0 ? Math.round((withChecksums / total) * 100) : 0,
  };
}