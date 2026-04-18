// ═══════════════════════════════════════════════════════════════
// SITA OS — App → Plane Membership Map (Part 2)
//
// Sidecar to the existing app registry. Every shippable app id
// declares its canonical plane, profiles, and visibility rules.
// Used by:
//   - launcher-profile.ts → filter launcher entries
//   - command-profile.ts  → filter command palette
//   - app-store grid      → respect profile visibility
//   - check-app-plane-coverage.ts CI gate
//   - emit-profile-composition.ts → generated reports
// ═══════════════════════════════════════════════════════════════

import type { CanonicalPlaneKey } from "./plane-registry";
import type { DeploymentProfileKey } from "./route-plane-map";

export interface AppPlaneEntry {
  /** Canonical app id (matches src/lib/app-platform / src/lib/apps registry). */
  appId: string;
  /** Display name for launcher/store. */
  displayName: string;
  /** Plane that owns this app. */
  plane: CanonicalPlaneKey;
  /** Profiles where this app is shippable. */
  profiles: DeploymentProfileKey[];
  /** Optional permission required (admin-rbac key). */
  roleRequired?: string;
  /** Visible in launcher grid by default? */
  launcherVisible: boolean;
  /** Visible in command palette? */
  commandVisible: boolean;
  /** Pin to dock by default in this profile? */
  defaultPinned: ("user" | "operator")[];
  /** Risk classification (operator-only ops are typically R3+). */
  riskTier: "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
  /** Short purpose for docs/reports. */
  description: string;
}

export const APP_PLANE_MAP: AppPlaneEntry[] = [
  // ── User Product Plane ──
  { appId: "business-os",  displayName: "Business",      plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: ["user"],            riskTier: "R1", description: "Business OS — operations, CRM, ops insight" },
  { appId: "money-os",     displayName: "Money",         plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: ["user"],            riskTier: "R2", description: "Finance OS — cashflow, taxes, accounts" },
  { appId: "concierge",    displayName: "Concierge",     plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: ["user"],            riskTier: "R1", description: "AI Concierge — chief of staff" },
  { appId: "boardroom",    displayName: "Boardroom",     plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: ["user"],            riskTier: "R2", description: "Advisor council & strategic decisions" },
  { appId: "workspace",    displayName: "Workspace",     plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: [],                  riskTier: "R0", description: "Personal workspace surface" },
  { appId: "app-store",    displayName: "App Store",     plane: "user", profiles: ["user"],            launcherVisible: true, commandVisible: true,  defaultPinned: [],                  riskTier: "R1", description: "App platform store / catalog" },

  // ── Shared Shell Runtime (both profiles) ──
  { appId: "files",         displayName: "Files",         plane: "shell-runtime", profiles: ["user", "operator"], launcherVisible: true, commandVisible: true,  defaultPinned: ["user", "operator"], riskTier: "R1", description: "Files browser (shared)" },
  { appId: "settings",      displayName: "Settings",      plane: "shell-runtime", profiles: ["user", "operator"], launcherVisible: true, commandVisible: true,  defaultPinned: [],                   riskTier: "R0", description: "Settings (role-aware sections)" },
  { appId: "notifications", displayName: "Notifications", plane: "shell-runtime", profiles: ["user", "operator"], launcherVisible: true, commandVisible: true,  defaultPinned: [],                   riskTier: "R0", description: "Notifications center" },
  { appId: "search",        displayName: "Search",        plane: "shell-runtime", profiles: ["user", "operator"], launcherVisible: false, commandVisible: true, defaultPinned: [],                   riskTier: "R0", description: "Global command palette / search" },

  // ── Admin / Operator Control Plane ──
  { appId: "observability",       displayName: "Observability",       plane: "admin", profiles: ["operator"], roleRequired: "audit.view",        launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R2", description: "Fleet health, traces, signals" },
  { appId: "release-center",      displayName: "Release Center",      plane: "admin", profiles: ["operator"], roleRequired: "release.view",      launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R3", description: "Release readiness gates & rings" },
  { appId: "verification-center", displayName: "Verification Center", plane: "admin", profiles: ["operator"], roleRequired: "verification.view", launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R3", description: "Truth & reality audit" },
  { appId: "kill-switch-center",  displayName: "Kill Switch Center",  plane: "admin", profiles: ["operator"], roleRequired: "security.kill",     launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R5", description: "Privileged kill-switch & security overrides" },
  { appId: "support-diagnostics", displayName: "Support Diagnostics", plane: "admin", profiles: ["operator"], roleRequired: "support.view",      launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R3", description: "Operator support tooling & bundles" },
  { appId: "ai-governance",       displayName: "AI Governance",       plane: "admin", profiles: ["operator"], roleRequired: "ai.governance",     launcherVisible: true, commandVisible: true, defaultPinned: [],            riskTier: "R3", description: "AI cost, safety, model routing" },
  { appId: "platform-control",    displayName: "Platform Control",    plane: "admin", profiles: ["operator"], roleRequired: "platform.admin",    launcherVisible: true, commandVisible: true, defaultPinned: [],            riskTier: "R4", description: "Cloud, connectors, infra control" },
  { appId: "user-org-intervention", displayName: "Access Intervention", plane: "admin", profiles: ["operator"], roleRequired: "users.intervene", launcherVisible: true, commandVisible: true, defaultPinned: [],            riskTier: "R4", description: "User/org/access intervention" },
  { appId: "incident-triage",     displayName: "Incident Triage",     plane: "admin", profiles: ["operator"], roleRequired: "incident.respond",  launcherVisible: true, commandVisible: true, defaultPinned: ["operator"], riskTier: "R3", description: "Live incident command surface" },
];

/** Index by appId for O(1) lookups. */
export const APP_PLANE_INDEX: Record<string, AppPlaneEntry> = Object.freeze(
  APP_PLANE_MAP.reduce((acc, e) => { acc[e.appId] = e; return acc; }, {} as Record<string, AppPlaneEntry>)
);

export function getAppPlaneEntry(appId: string): AppPlaneEntry | undefined {
  return APP_PLANE_INDEX[appId];
}

export function appsForProfile(profile: DeploymentProfileKey): AppPlaneEntry[] {
  return APP_PLANE_MAP.filter((e) => e.profiles.includes(profile));
}

export function appsForPlane(plane: CanonicalPlaneKey): AppPlaneEntry[] {
  return APP_PLANE_MAP.filter((e) => e.plane === plane);
}
