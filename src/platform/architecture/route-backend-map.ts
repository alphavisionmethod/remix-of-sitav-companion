// ═══════════════════════════════════════════════════════════════
// SITA OS — Route → Backend Source Map
// Maps each route family to its primary backend sources and
// key data dependencies (edge functions, tables, providers).
// ═══════════════════════════════════════════════════════════════

import type { BackendSourceType } from "./route-intent-taxonomy";

export interface RouteBackendEntry {
  readonly prefix: string;
  readonly family: string;
  readonly primarySources: readonly BackendSourceType[];
  readonly edgeFunctions: readonly string[];
  readonly tables: readonly string[];
  readonly externalProviders: readonly string[];
}

export const ROUTE_BACKEND_MAP: readonly RouteBackendEntry[] = [
  { prefix: "/login", family: "Auth", primarySources: ["PUBLIC_BFF"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/register", family: "Auth", primarySources: ["PUBLIC_BFF"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/auth", family: "Auth", primarySources: ["PUBLIC_BFF"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/desktop", family: "Desktop", primarySources: ["RUNTIME_SYSTEM"], edgeFunctions: [], tables: ["accounts"], externalProviders: [] },
  { prefix: "/business", family: "Business", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: ["business-query"], tables: ["accounts", "contacts"], externalProviders: [] },
  { prefix: "/money", family: "Money", primarySources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], edgeFunctions: ["financial-query", "tax-calc"], tables: ["transactions"], externalProviders: ["plaid", "stripe"] },
  { prefix: "/concierge", family: "Concierge", primarySources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"], edgeFunctions: ["ai-gateway"], tables: ["ai_invocations", "advisor_agents"], externalProviders: [] },
  { prefix: "/boardroom", family: "Boardroom", primarySources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"], edgeFunctions: ["ai-gateway", "boardroom-dispatch"], tables: ["advisor_board_recommendations", "advisor_board_actions", "boardroom_items"], externalProviders: [] },
  { prefix: "/files", family: "Files", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/settings", family: "Settings", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: ["accounts"], externalProviders: [] },
  { prefix: "/revenue-office", family: "Revenue", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: ["revenue-query"], tables: ["invoices"], externalProviders: [] },
  { prefix: "/investment-office", family: "Investment", primarySources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], edgeFunctions: ["portfolio-query"], tables: ["portfolios"], externalProviders: [] },
  { prefix: "/digital-presence", family: "Digital Presence", primarySources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/connectors", family: "Connectors", primarySources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], edgeFunctions: ["connector-sync"], tables: ["connector_configs"], externalProviders: [] },
  { prefix: "/advisors", family: "Advisors", primarySources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"], edgeFunctions: ["ai-gateway"], tables: ["advisor_agents", "advisor_registry"], externalProviders: [] },
  { prefix: "/workspace", family: "Workspace", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/apps", family: "Apps", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/governance", family: "Governance", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/policies", family: "Policies", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/admin", family: "Admin", primarySources: ["ADMIN_BFF", "DOMAIN_FUNCTION"], edgeFunctions: ["admin-query"], tables: ["admin_sessions", "admin_action_audit"], externalProviders: [] },
  { prefix: "/owner", family: "Owner", primarySources: ["ADMIN_BFF"], edgeFunctions: ["admin-query"], tables: ["admin_sessions"], externalProviders: [] },
  { prefix: "/mission", family: "Mission", primarySources: ["ADMIN_BFF"], edgeFunctions: ["admin-query"], tables: ["admin_action_audit"], externalProviders: [] },
  { prefix: "/notifications", family: "Notifications", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: ["notifications"], externalProviders: [] },
  { prefix: "/search", family: "Search", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/onboarding", family: "Onboarding", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/observability", family: "Observability", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/nova-desktop", family: "Nova Desktop", primarySources: ["RUNTIME_SYSTEM"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/enterprise", family: "Enterprise", primarySources: ["DOMAIN_FUNCTION"], edgeFunctions: [], tables: [], externalProviders: [] },
  { prefix: "/", family: "Landing", primarySources: ["STATIC"], edgeFunctions: [], tables: [], externalProviders: [] },
];

export function getRouteBackend(prefix: string): RouteBackendEntry | undefined {
  let best: RouteBackendEntry | undefined;
  for (const entry of ROUTE_BACKEND_MAP) {
    if (prefix === entry.prefix || prefix.startsWith(entry.prefix + "/") || (entry.prefix === "/" && prefix === "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}