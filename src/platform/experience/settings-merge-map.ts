// ═══════════════════════════════════════════════════════════════
// SITA OS — Settings Merge Map
// Shell-level vs app-level vs operator-level settings ownership.
// ═══════════════════════════════════════════════════════════════

export interface SettingsMergeEntry {
  readonly sectionId: string;
  readonly layer: "shell" | "app" | "operator";
  readonly description: string;
  readonly componentRef: string;
  readonly accessLevel: "all-users" | "authenticated" | "admin-only";
}

export const SETTINGS_MERGE_MAP: readonly SettingsMergeEntry[] = [
  { sectionId: "appearance",       layer: "shell",    description: "Theme, wallpaper, accent color, dark mode",    componentRef: "AppearanceSettings",    accessLevel: "all-users" },
  { sectionId: "accessibility",    layer: "shell",    description: "Font size, reduced motion, contrast",          componentRef: "AccessibilitySettings", accessLevel: "all-users" },
  { sectionId: "notifications",    layer: "shell",    description: "Global notification preferences",              componentRef: "NotificationSettings",  accessLevel: "authenticated" },
  { sectionId: "dock-launcher",    layer: "shell",    description: "Dock pinning, launch behavior, auto-hide",     componentRef: "DockSettings",          accessLevel: "authenticated" },
  { sectionId: "privacy-security", layer: "shell",    description: "Lock screen, session timeout, data privacy",   componentRef: "PrivacySettings",       accessLevel: "authenticated" },
  { sectionId: "domain-prefs",     layer: "app",      description: "Per-domain preferences (business, finance...)", componentRef: "DomainPreferences",     accessLevel: "authenticated" },
  { sectionId: "advisor-config",   layer: "app",      description: "AI advisor autonomy, budget, personality",      componentRef: "AdvisorSettings",       accessLevel: "authenticated" },
  { sectionId: "integrations",     layer: "app",      description: "Connected services, API keys, connectors",      componentRef: "IntegrationSettings",   accessLevel: "authenticated" },
  { sectionId: "admin-policies",   layer: "operator", description: "Admin policies, role management, audit",        componentRef: "AdminPolicies",         accessLevel: "admin-only" },
  { sectionId: "admin-safety",     layer: "operator", description: "Safety actions, kill switches, dry runs",       componentRef: "SafetySettings",        accessLevel: "admin-only" },
] as const;