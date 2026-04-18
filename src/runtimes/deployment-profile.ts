// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Deployment Profile Reader
//
// Reads /etc/sita/deployment-profile.json (native) or falls back
// to "user" profile in browser/web contexts.
// ═══════════════════════════════════════════════════════════════

import type { CanonicalPlaneKey } from "@/platform/architecture/plane-registry";
import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

export interface DeploymentProfileManifest {
  profile: DeploymentProfileKey;
  displayName: string;
  artifactName: string;
  description?: string;
  defaultShellHome: string;
  enabledPlanes: CanonicalPlaneKey[];
  adminPlaneAccess: "default" | "role-gated" | "disabled";
  allowedApps: string[];
  featureFlags: Record<string, unknown>;
  supportToolingLevel?: "self-service" | "operator-full";
  branding?: { wordmarkSuffix?: string; themeVariant?: string };
}

const USER_FALLBACK: DeploymentProfileManifest = {
  profile: "user",
  displayName: "SITA OS — User Edition",
  artifactName: "sita-os-user",
  defaultShellHome: "/desktop",
  enabledPlanes: ["core-os", "shell-runtime", "user", "backend-services"],
  adminPlaneAccess: "role-gated",
  allowedApps: [
    "business-os", "money-os", "concierge", "files", "boardroom",
    "workspace", "app-store", "settings", "notifications",
  ],
  featureFlags: {
    "show.admin.nav": false,
    "show.dev.tools": false,
    "support.diagnostics.level": "user-self-service",
    "branding.variant": "user",
  },
  supportToolingLevel: "self-service",
  branding: { wordmarkSuffix: "", themeVariant: "user-default" },
};

let cachedProfile: DeploymentProfileManifest | null = null;

/**
 * Read the active deployment profile.
 *
 * Resolution order:
 *   1. window.__SITA_DEPLOYMENT_PROFILE__ (Electron preload injection)
 *   2. localStorage override (`sita.deploymentProfile`) for dev
 *   3. fallback to user profile
 */
export function getDeploymentProfile(): DeploymentProfileManifest {
  if (cachedProfile) return cachedProfile;

  // 1. Electron preload injection
  if (typeof window !== "undefined") {
    const injected = (window as any).__SITA_DEPLOYMENT_PROFILE__;
    if (injected && typeof injected === "object" && injected.profile) {
      cachedProfile = injected as DeploymentProfileManifest;
      return cachedProfile;
    }
  }

  // 2. Dev override via localStorage
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem("sita.deploymentProfile");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.profile === "operator" || parsed?.profile === "user") {
          cachedProfile = parsed;
          return cachedProfile!;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback
  cachedProfile = USER_FALLBACK;
  return cachedProfile;
}

export function isOperatorProfile(): boolean {
  return getDeploymentProfile().profile === "operator";
}

export function isUserProfile(): boolean {
  return getDeploymentProfile().profile === "user";
}

export function isFeatureFlagEnabled(key: string): boolean {
  const v = getDeploymentProfile().featureFlags[key];
  return v === true || v === "true";
}

export function getFeatureFlag<T = unknown>(key: string): T | undefined {
  return getDeploymentProfile().featureFlags[key] as T | undefined;
}

export function isAppAllowed(appId: string): boolean {
  return getDeploymentProfile().allowedApps.includes(appId);
}

export function getDefaultShellHome(): string {
  return getDeploymentProfile().defaultShellHome;
}

/** For tests / dev tools only. */
export function __setDeploymentProfileForTesting(p: DeploymentProfileManifest | null) {
  cachedProfile = p;
}
