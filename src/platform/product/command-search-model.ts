// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Command / Search Model
// Universal command/search/discovery layer across domains.
// References existing CommandPalette and use-global-search.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";
import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

// ── Search Result Kind ──────────────────────────────────────────

export type SearchResultKind =
  | "page"           // navigable route/page
  | "app"            // launchable app
  | "entity"         // business object (client, invoice, etc.)
  | "action"         // executable command
  | "setting"        // settings entry
  | "help"           // documentation / support article
  | "diagnostic"     // admin/operator diagnostic tool
  | "notification"   // notification / alert
  | "recent";        // recently accessed item

// ── Search Result ───────────────────────────────────────────────

export interface SearchResult {
  readonly id: string;
  readonly kind: SearchResultKind;
  readonly domain: TaskDomain;
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: string;
  readonly route?: string;
  readonly deepLinkId?: string;
  readonly profiles: readonly DeploymentProfileKey[];
  readonly requiredPermission?: string;
  readonly score: number;            // relevance 0-100
  readonly keywords?: readonly string[];
}

// ── Command Entry ───────────────────────────────────────────────

export interface CommandEntry {
  readonly commandId: string;
  readonly label: string;
  readonly description?: string;
  readonly domain: TaskDomain;
  readonly kind: SearchResultKind;
  readonly shortcut?: string;        // keyboard shortcut
  readonly profiles: readonly DeploymentProfileKey[];
  readonly requiredPermission?: string;
  readonly action: CommandAction;
}

export type CommandAction =
  | { type: "navigate"; route: string }
  | { type: "app-launch"; appId: string }
  | { type: "execute"; handler: string }
  | { type: "open-modal"; modalId: string }
  | { type: "external-link"; url: string };

// ── Search Provider ─────────────────────────────────────────────

export interface SearchProvider {
  readonly providerId: string;
  readonly domain: TaskDomain;
  readonly displayName: string;
  readonly resultKinds: readonly SearchResultKind[];
  readonly priority: number;         // lower = searched first
  readonly profiles: readonly DeploymentProfileKey[];
}

// ── Command Search Registry ─────────────────────────────────────

export interface CommandSearchRegistry {
  readonly providers: readonly SearchProvider[];
  readonly commands: readonly CommandEntry[];
  readonly maxResults: number;
  readonly debounceMs: number;
}