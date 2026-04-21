// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Signing & Notarization Policy
// Canonical truth source for signing state per desktop platform.
// ═══════════════════════════════════════════════════════════════

export interface PlatformSigningPolicy {
  readonly platform: string;
  readonly signingRequired: boolean;
  readonly signingMechanism: string;
  readonly signingReady: boolean;
  readonly notarizationRequired: boolean;
  readonly notarizationMechanism: string;
  readonly notarizationReady: boolean;
  readonly requiredSecrets: string[];
  readonly missingSecrets: string[];
  readonly blockers: string[];
  readonly closurePath: string[];
  readonly proofArtifacts: string[];
  readonly releaseGateBehavior: "block" | "warn" | "pass";
  readonly runbook: string;
}

export const DESKTOP_SIGNING_POLICIES: readonly PlatformSigningPolicy[] = [
  {
    platform: "linux",
    signingRequired: false,
    signingMechanism: "gpg-signed .deb via dpkg-sig (optional)",
    signingReady: true,
    notarizationRequired: false,
    notarizationMechanism: "n/a",
    notarizationReady: true,
    requiredSecrets: [],
    missingSecrets: [],
    blockers: [],
    closurePath: [],
    proofArtifacts: ["generated/release-electron-linux-manifest.json"],
    releaseGateBehavior: "pass",
    runbook: "docs/runbooks/release-rollback.md",
  },
  {
    platform: "darwin",
    signingRequired: true,
    signingMechanism: "Apple Developer ID codesign + hardened runtime (electron/entitlements.plist)",
    signingReady: false,
    notarizationRequired: true,
    notarizationMechanism: "notarytool submit + stapler staple",
    notarizationReady: false,
    requiredSecrets: ["MAC_CERTS", "MAC_CERTS_PASSWORD", "APPLE_ID", "APPLE_ID_PASSWORD", "APPLE_TEAM_ID"],
    missingSecrets: ["MAC_CERTS", "MAC_CERTS_PASSWORD", "APPLE_ID", "APPLE_ID_PASSWORD", "APPLE_TEAM_ID"],
    blockers: ["Apple Developer Program enrollment not completed"],
    closurePath: [
      "1. Enroll in Apple Developer Program ($99/yr)",
      "2. Create Developer ID Application certificate",
      "3. Export .p12 and base64-encode as MAC_CERTS secret",
      "4. Generate app-specific password for APPLE_ID_PASSWORD",
      "5. Add all 5 secrets to GitHub Actions",
      "6. Trigger release-electron workflow — signing activates automatically",
      "7. Run: codesign --verify + spctl --assess + xcrun stapler validate",
    ],
    proofArtifacts: ["generated/release-electron-darwin-manifest.json", "generated/desktop-signing-status.json"],
    releaseGateBehavior: "warn",
    runbook: "docs/runbooks/DESKTOP_SIGNING_PROVISIONING.md",
  },
  {
    platform: "win32",
    signingRequired: true,
    signingMechanism: "Authenticode signtool sign (EV/OV cert)",
    signingReady: false,
    notarizationRequired: false,
    notarizationMechanism: "n/a (SmartScreen reputation builds over time)",
    notarizationReady: true,
    requiredSecrets: ["WINDOWS_PFX", "WINDOWS_PFX_PASSWORD"],
    missingSecrets: ["WINDOWS_PFX", "WINDOWS_PFX_PASSWORD"],
    blockers: ["EV/OV code-signing certificate not procured"],
    closurePath: [
      "1. Purchase EV (preferred) or OV code-signing cert from DigiCert/Sectigo/SSL.com",
      "2. Export to .pfx and base64-encode as WINDOWS_PFX secret",
      "3. Add WINDOWS_PFX and WINDOWS_PFX_PASSWORD to GitHub Actions",
      "4. Trigger release-electron workflow — Authenticode signing activates automatically",
      "5. Run: signtool verify /pa /v sita-os.exe",
    ],
    proofArtifacts: ["generated/release-electron-win32-manifest.json", "generated/desktop-signing-status.json"],
    releaseGateBehavior: "warn",
    runbook: "docs/runbooks/DESKTOP_SIGNING_PROVISIONING.md",
  },
];

export function getSigningPolicy(platform: string): PlatformSigningPolicy | undefined {
  return DESKTOP_SIGNING_POLICIES.find((p) => p.platform === platform);
}

export function isDesktopSigningFullyReady(): boolean {
  return DESKTOP_SIGNING_POLICIES.every((p) => !p.signingRequired || p.signingReady);
}

export function isDesktopNotarizationFullyReady(): boolean {
  return DESKTOP_SIGNING_POLICIES.every((p) => !p.notarizationRequired || p.notarizationReady);
}

export function getSigningBlockers(): Array<{ platform: string; blockers: string[] }> {
  return DESKTOP_SIGNING_POLICIES
    .filter((p) => p.blockers.length > 0)
    .map((p) => ({ platform: p.platform, blockers: p.blockers }));
}