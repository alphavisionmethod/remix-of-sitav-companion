// ═══════════════════════════════════════════════════════════════
// SITA OS — Responsive Coherence Map
// Declares responsive behavior per visual tier and shell mode.
// ═══════════════════════════════════════════════════════════════

import type { ShellMode } from "./shell-app-merge-grammar";

export interface ResponsiveCoherenceEntry {
  readonly mode: ShellMode;
  readonly shellBehavior: string;
  readonly appBehavior: string;
  readonly navigationAdaptation: string;
  readonly chromeReduction: string;
  readonly layoutPattern: string;
}

export const RESPONSIVE_COHERENCE_MAP: readonly ResponsiveCoherenceEntry[] = [
  {
    mode: "desktop-windowed",
    shellBehavior: "Full shell: menu bar, dock, window compositor, desktop canvas",
    appBehavior: "App in floating/resizable window with full sidebar and toolbar",
    navigationAdaptation: "Dual nav: shell dock + app sidebar coexist",
    chromeReduction: "None — full chrome",
    layoutPattern: "workspace / admin-operator / app-detail",
  },
  {
    mode: "desktop-fullscreen",
    shellBehavior: "Menu bar persists; dock auto-hides; desktop hidden",
    appBehavior: "App takes full viewport below menu bar; sidebar persistent",
    navigationAdaptation: "App sidebar replaces dock as primary nav",
    chromeReduction: "Window chrome removed; dock auto-hides",
    layoutPattern: "workspace (fullscreen variant)",
  },
  {
    mode: "browser-web",
    shellBehavior: "No shell chrome; route-based rendering",
    appBehavior: "DomainAppShell provides app-level nav (top-bar or sidebar)",
    navigationAdaptation: "App nav only; collapsible sidebar or drawer-on-mobile",
    chromeReduction: "All shell chrome removed",
    layoutPattern: "Per route: landing, workspace, settings, etc.",
  },
  {
    mode: "mobile",
    shellBehavior: "No shell chrome",
    appBehavior: "MobileShell with bottom tab bar; stacked navigation",
    navigationAdaptation: "Tab bar replaces all nav; drawer for secondary",
    chromeReduction: "Maximum — no window chrome, no sidebar, no dock",
    layoutPattern: "mobile-optimized",
  },
] as const;