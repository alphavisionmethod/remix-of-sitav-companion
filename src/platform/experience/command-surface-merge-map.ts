// ═══════════════════════════════════════════════════════════════
// SITA OS — Command / Search Surface Merge Map
// Global and domain-scoped command palette routing.
// ═══════════════════════════════════════════════════════════════

export interface CommandSurfaceMergeEntry {
  readonly surfaceId: string;
  readonly layer: "shell" | "app";
  readonly componentRef: string;
  readonly trigger: string;
  readonly scope: string;
  readonly resultMerging: string;
}

export const COMMAND_SURFACE_MERGE_MAP: readonly CommandSurfaceMergeEntry[] = [
  {
    surfaceId: "global-command-palette",
    layer: "shell",
    componentRef: "CommandPalette",
    trigger: "⌘K (global)",
    scope: "Cross-domain: system commands + app commands grouped by domain",
    resultMerging: "App commands registered via command registry; grouped under domain header",
  },
  {
    surfaceId: "domain-command-palette",
    layer: "app",
    componentRef: "DomainCommandPalette",
    trigger: "⌘K (when app focused, scoped) or domain-specific shortcut",
    scope: "Single-domain commands and search",
    resultMerging: "Results scoped to active domain; can elevate to global via '>' prefix",
  },
  {
    surfaceId: "universal-search",
    layer: "shell",
    componentRef: "UniversalCommandSurface",
    trigger: "Search bar in CommandPalette",
    scope: "Cross-domain entity search (contacts, invoices, files, etc.)",
    resultMerging: "Results from all domains, ranked by relevance and recency",
  },
] as const;

export const COMMAND_KEYBOARD_OWNERSHIP = {
  globalShortcuts: ["⌘K", "⌘,", "⌘W", "⌃⌘Q"] as const,
  appShortcuts: "All other keyboard input when app window is focused" as const,
  conflictResolution: "Shell global shortcuts always win; app shortcuts only fire when no shell shortcut matches" as const,
} as const;