// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Navigation Model
// Unifies shells, route families, app launches, admin paths,
// deep links, and context-aware navigation.
// References: route-plane-map, app-plane-map, shell-runtime.
// ═══════════════════════════════════════════════════════════════

import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

// ── Route Family ────────────────────────────────────────────────

export type RouteFamily =
  | "workspace"      // main workspace shell
  | "admin"          // operator/admin surfaces
  | "onboarding"     // first-run / setup flows
  | "auth"           // login / signup / password reset
  | "public"         // marketing / docs / legal
  | "app"            // in-app domain surfaces
  | "settings"       // settings & preferences
  | "support"        // help / diagnostics / trust center
  | "system";        // OS-level (boot, recovery, diagnostics)

// ── Navigation Node ─────────────────────────────────────────────

export interface NavigationNode {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly family: RouteFamily;
  readonly icon?: string;
  readonly profiles: readonly DeploymentProfileKey[];
  readonly parentId?: string;
  readonly order: number;
  readonly badge?: "dot" | "count";
  readonly requiredPermission?: string;
  readonly deepLinkId?: string;
}

// ── Shell Descriptor ────────────────────────────────────────────

export interface ShellDescriptor {
  readonly shellId: string;
  readonly displayName: string;
  readonly rootRoute: string;
  readonly families: readonly RouteFamily[];
  readonly profiles: readonly DeploymentProfileKey[];
  readonly sidebarNodes: readonly NavigationNode[];
}

// ── App Launch Entry ────────────────────────────────────────────

export interface AppLaunchEntry {
  readonly appId: string;
  readonly displayName: string;
  readonly icon: string;
  readonly route: string;
  readonly family: RouteFamily;
  readonly profiles: readonly DeploymentProfileKey[];
  readonly launcherVisible: boolean;
  readonly commandVisible: boolean;
  readonly defaultPinned: readonly DeploymentProfileKey[];
}

// ── Context-Aware Navigation ────────────────────────────────────

export interface NavigationContext {
  readonly currentRoute: string;
  readonly currentFamily: RouteFamily;
  readonly currentShellId: string;
  readonly breadcrumbs: readonly NavigationNode[];
  readonly canGoBack: boolean;
  readonly returnRoute?: string;
}

// ── Navigation Intent ───────────────────────────────────────────

export type NavigationIntent =
  | { type: "route"; route: string; params?: Record<string, string> }
  | { type: "app-launch"; appId: string }
  | { type: "deep-link"; deepLinkId: string; params?: Record<string, string> }
  | { type: "back" }
  | { type: "shell-switch"; shellId: string };