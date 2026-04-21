// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical Deep Link Registry
// Cross-app deep-link routing model.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";
import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

// ── Deep Link Entry ─────────────────────────────────────────────

export interface DeepLinkEntry {
  readonly deepLinkId: string;
  readonly domain: TaskDomain;
  readonly routeTemplate: string;        // e.g. "/business/clients/:clientId"
  readonly displayLabel: string;
  readonly params: readonly DeepLinkParam[];
  readonly profiles: readonly DeploymentProfileKey[];
  readonly requiresAuth: boolean;
  readonly requiredPermission?: string;
  readonly shellBehavior: "same-window" | "new-tab" | "modal" | "app-launch";
  readonly contextRestoration: boolean;  // restores scroll/state
  readonly supportRef?: string;          // link to support docs
}

export interface DeepLinkParam {
  readonly name: string;
  readonly type: "string" | "uuid" | "number" | "enum";
  readonly required: boolean;
  readonly enumValues?: readonly string[];
}

// ── Deep Link Resolution ────────────────────────────────────────

export interface DeepLinkResolution {
  readonly deepLinkId: string;
  readonly resolvedRoute: string;
  readonly authorized: boolean;
  readonly authReason?: string;
  readonly contextAvailable: boolean;
}

// ── Registry ────────────────────────────────────────────────────

export const DEEP_LINK_REGISTRY: readonly DeepLinkEntry[] = [
  { deepLinkId: "business.client",      domain: "business",      routeTemplate: "/business/clients/:id",        displayLabel: "Client Detail",        params: [{ name: "id", type: "uuid", required: true }],   profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: true },
  { deepLinkId: "business.invoice",     domain: "finance",       routeTemplate: "/finance/invoices/:id",        displayLabel: "Invoice Detail",       params: [{ name: "id", type: "uuid", required: true }],   profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: true },
  { deepLinkId: "admin.user",           domain: "admin",         routeTemplate: "/admin/users/:id",             displayLabel: "User Management",      params: [{ name: "id", type: "uuid", required: true }],   profiles: ["operator"],         requiresAuth: true, requiredPermission: "admin.users.read", shellBehavior: "same-window", contextRestoration: false },
  { deepLinkId: "ai.advisor",           domain: "ai",            routeTemplate: "/ai/advisors/:advisorId",      displayLabel: "Advisor Detail",       params: [{ name: "advisorId", type: "string", required: true }], profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: true },
  { deepLinkId: "integrations.connector", domain: "integrations", routeTemplate: "/integrations/:connectorId", displayLabel: "Connector Detail",     params: [{ name: "connectorId", type: "string", required: true }], profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: false },
  { deepLinkId: "support.ticket",       domain: "support",       routeTemplate: "/support/tickets/:id",         displayLabel: "Support Ticket",       params: [{ name: "id", type: "uuid", required: true }],   profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: true },
  { deepLinkId: "settings.section",     domain: "settings",      routeTemplate: "/settings/:section",           displayLabel: "Settings Section",     params: [{ name: "section", type: "string", required: true }], profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: false },
  { deepLinkId: "workflows.run",        domain: "workflows",     routeTemplate: "/workflows/runs/:runId",       displayLabel: "Workflow Run",         params: [{ name: "runId", type: "uuid", required: true }], profiles: ["user", "operator"], requiresAuth: true, shellBehavior: "same-window", contextRestoration: true },
] as const;

// ── Resolver ────────────────────────────────────────────────────

export function resolveDeepLink(
  deepLinkId: string,
  params: Record<string, string>,
): DeepLinkResolution | null {
  const entry = DEEP_LINK_REGISTRY.find((e) => e.deepLinkId === deepLinkId);
  if (!entry) return null;
  let route = entry.routeTemplate;
  for (const p of entry.params) {
    const value = params[p.name];
    if (p.required && !value) return null;
    if (value) route = route.replace(`:${p.name}`, value);
  }
  return { deepLinkId, resolvedRoute: route, authorized: true, contextAvailable: entry.contextRestoration };
}