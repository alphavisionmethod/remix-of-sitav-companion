// ═══════════════════════════════════════════════════════════════
// SITA OS — Desktop Security Boundaries
// Trust model, preload isolation, FS sandbox, secret handling
// ═══════════════════════════════════════════════════════════════

export type TrustEnforcement = "hardware-backed" | "software-enforced" | "policy-enforced";
export type ThreatVector = "renderer-escape" | "ipc-injection" | "fs-traversal" | "update-tampering" | "secret-exfiltration" | "privilege-escalation";

export interface SecurityBoundary {
  id: string;
  name: string;
  enforcement: TrustEnforcement;
  description: string;
  mitigations: string[];
  threatVectors: ThreatVector[];
  verified: boolean;
}

export const DESKTOP_SECURITY_BOUNDARIES: readonly SecurityBoundary[] = [
  {
    id: "preload-isolation",
    name: "Preload Script Isolation",
    enforcement: "software-enforced",
    description: "contextBridge.exposeInMainWorld creates a frozen, cloned API surface. Renderer cannot access Node.js or Electron internals.",
    mitigations: [
      "contextIsolation: true in BrowserWindow config",
      "nodeIntegration: false prevents require() in renderer",
      "sandbox: true enables Chromium sandbox",
      "Only whitelisted methods exposed via contextBridge",
    ],
    threatVectors: ["renderer-escape", "privilege-escalation"],
    verified: true,
  },
  {
    id: "ipc-channel-control",
    name: "IPC Channel Access Control",
    enforcement: "software-enforced",
    description: "Only explicitly registered IPC channels are accessible. Preload defines the exact channel surface.",
    mitigations: [
      "No ipcRenderer.send for arbitrary channels",
      "Only ipcRenderer.invoke and ipcRenderer.on for registered channels",
      "Main process validates channel names in handlers",
      "No remote module enabled",
    ],
    threatVectors: ["ipc-injection"],
    verified: true,
  },
  {
    id: "filesystem-sandbox",
    name: "Filesystem Access Sandbox",
    enforcement: "software-enforced",
    description: "File operations are mediated by the main process fs-bridge. No direct filesystem access from renderer.",
    mitigations: [
      "Dialog-gated file selection (showOpenDialog, showSaveDialog)",
      "Backup operations restricted to app-specific directory",
      "Path validation in main process before filesystem operations",
      "No arbitrary path access from renderer",
    ],
    threatVectors: ["fs-traversal"],
    verified: true,
  },
  {
    id: "update-authenticity",
    name: "Update Package Authenticity",
    enforcement: "software-enforced",
    description: "Auto-updater verifies package signatures before applying updates. Update metadata served over HTTPS.",
    mitigations: [
      "electron-updater signature verification",
      "HTTPS-only update feed",
      "Package hash verification before install",
      "Rollback capability on failed update",
    ],
    threatVectors: ["update-tampering"],
    verified: true,
  },
  {
    id: "local-secret-handling",
    name: "Local Secret Storage",
    enforcement: "policy-enforced",
    description: "Sensitive data (tokens, keys) should use OS keychain via safeStorage. No plaintext secrets on disk.",
    mitigations: [
      "Electron safeStorage API for encryption",
      "OS keychain integration (Keychain on macOS, Credential Store on Windows, Secret Service on Linux)",
      "No secrets stored in localStorage or unencrypted files",
      "Session tokens cleared on logout",
    ],
    threatVectors: ["secret-exfiltration"],
    verified: false, // Policy-enforced, requires app-level implementation audit
  },
  {
    id: "csp-enforcement",
    name: "Content Security Policy",
    enforcement: "software-enforced",
    description: "CSP headers restrict script sources, prevent inline scripts, and block unsafe-eval.",
    mitigations: [
      "CSP meta tag or header in renderer HTML",
      "script-src restricted to self and trusted origins",
      "No unsafe-inline or unsafe-eval",
      "frame-ancestors restricted",
    ],
    threatVectors: ["renderer-escape", "ipc-injection"],
    verified: true,
  },
] as const;

/** Summary of security posture */
export interface SecurityPostureSummary {
  totalBoundaries: number;
  verifiedBoundaries: number;
  unverifiedBoundaries: number;
  hardwareBacked: number;
  softwareEnforced: number;
  policyEnforced: number;
  allThreatVectors: ThreatVector[];
  coveredThreatVectors: ThreatVector[];
}

export function getSecurityPostureSummary(): SecurityPostureSummary {
  const allVectors = new Set<ThreatVector>();
  const coveredVectors = new Set<ThreatVector>();

  for (const boundary of DESKTOP_SECURITY_BOUNDARIES) {
    for (const v of boundary.threatVectors) {
      allVectors.add(v);
      if (boundary.verified) coveredVectors.add(v);
    }
  }

  return {
    totalBoundaries: DESKTOP_SECURITY_BOUNDARIES.length,
    verifiedBoundaries: DESKTOP_SECURITY_BOUNDARIES.filter((b) => b.verified).length,
    unverifiedBoundaries: DESKTOP_SECURITY_BOUNDARIES.filter((b) => !b.verified).length,
    hardwareBacked: DESKTOP_SECURITY_BOUNDARIES.filter((b) => b.enforcement === "hardware-backed").length,
    softwareEnforced: DESKTOP_SECURITY_BOUNDARIES.filter((b) => b.enforcement === "software-enforced").length,
    policyEnforced: DESKTOP_SECURITY_BOUNDARIES.filter((b) => b.enforcement === "policy-enforced").length,
    allThreatVectors: Array.from(allVectors),
    coveredThreatVectors: Array.from(coveredVectors),
  };
}
