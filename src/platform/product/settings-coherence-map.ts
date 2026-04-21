// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Settings Coherence Map
// Unified settings ownership and exposure model.
// References: settings-profile.ts, shell-runtime.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";
import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

// ── Settings Ownership ──────────────────────────────────────────

export type SettingsLevel = "user" | "domain" | "workspace" | "operator" | "system";

export interface SettingsEntry {
  readonly settingId: string;
  readonly domain: TaskDomain;
  readonly level: SettingsLevel;
  readonly displayLabel: string;
  readonly description: string;
  readonly route: string;
  readonly profiles: readonly DeploymentProfileKey[];
  readonly requiredPermission?: string;
  readonly runtimeConstraint?: string;
  readonly group: "account" | "notifications" | "privacy" | "display" | "integrations" | "advanced" | "operator" | "system";
}

// ── Registry ────────────────────────────────────────────────────

export const SETTINGS_REGISTRY: readonly SettingsEntry[] = [
  { settingId: "account.profile",        domain: "settings", level: "user",      displayLabel: "Profile",             description: "Manage your name, email, and avatar.",            route: "/settings/profile",        profiles: ["user", "operator"], group: "account" },
  { settingId: "account.security",       domain: "settings", level: "user",      displayLabel: "Security",            description: "Password, MFA, and trusted devices.",             route: "/settings/security",       profiles: ["user", "operator"], group: "account" },
  { settingId: "notifications.prefs",    domain: "settings", level: "user",      displayLabel: "Notifications",       description: "Configure notification preferences.",             route: "/settings/notifications",  profiles: ["user", "operator"], group: "notifications" },
  { settingId: "privacy.data",           domain: "settings", level: "user",      displayLabel: "Privacy & Data",      description: "Data export, deletion, and consent.",             route: "/settings/privacy",        profiles: ["user", "operator"], group: "privacy" },
  { settingId: "display.theme",          domain: "settings", level: "user",      displayLabel: "Appearance",          description: "Theme, layout, and display preferences.",         route: "/settings/appearance",     profiles: ["user", "operator"], group: "display" },
  { settingId: "integrations.connected", domain: "integrations", level: "domain", displayLabel: "Connected Apps",     description: "Manage connected integrations.",                  route: "/settings/integrations",   profiles: ["user", "operator"], group: "integrations" },
  { settingId: "advanced.developer",     domain: "settings", level: "user",      displayLabel: "Developer",           description: "API keys, webhooks, and developer tools.",        route: "/settings/developer",      profiles: ["user", "operator"], group: "advanced" },
  { settingId: "operator.fleet",         domain: "admin",    level: "operator",  displayLabel: "Fleet Management",    description: "Manage release rings and fleet diagnostics.",     route: "/admin/settings/fleet",    profiles: ["operator"], requiredPermission: "admin.fleet.manage", group: "operator" },
  { settingId: "operator.killswitch",    domain: "admin",    level: "operator",  displayLabel: "Kill Switches",       description: "Emergency feature kill switches.",                route: "/admin/settings/killswitch", profiles: ["operator"], requiredPermission: "admin.killswitch.manage", group: "operator" },
  { settingId: "system.runtime",         domain: "system",   level: "system",    displayLabel: "Runtime Config",      description: "System runtime configuration and flags.",         route: "/admin/settings/runtime",  profiles: ["operator"], requiredPermission: "admin.system.manage", group: "system" },
] as const;

// ── Helpers ─────────────────────────────────────────────────────

export function getSettingsForLevel(level: SettingsLevel): readonly SettingsEntry[] {
  return SETTINGS_REGISTRY.filter((s) => s.level === level);
}

export function getSettingsForProfile(profile: DeploymentProfileKey): readonly SettingsEntry[] {
  return SETTINGS_REGISTRY.filter((s) => s.profiles.includes(profile));
}