// ═══════════════════════════════════════════════════════════════
// SITA OS — Shell Space Routing Service
// Maps capability IDs to shell surface routes
// ═══════════════════════════════════════════════════════════════

import type { NavigationSection } from "@/packages/shell-grammar";

export interface ShellRoute {
  capabilityId: string;
  section: NavigationSection;
  path: string;
  panelType: "full" | "drawer" | "modal" | "inline";
  deepLinkable: boolean;
}

const ROUTE_MAP: ShellRoute[] = [
  { capabilityId: "biz-crm-read", section: "business", path: "/business/customers", panelType: "full", deepLinkable: true },
  { capabilityId: "biz-crm-write", section: "business", path: "/business/customers/edit", panelType: "drawer", deepLinkable: false },
  { capabilityId: "biz-comms-send", section: "business", path: "/business/communications", panelType: "modal", deepLinkable: false },
  { capabilityId: "fin-accounts-read", section: "money", path: "/money/accounts", panelType: "full", deepLinkable: true },
  { capabilityId: "fin-payment-execute", section: "money", path: "/money/payments/new", panelType: "drawer", deepLinkable: false },
  { capabilityId: "fin-transfer", section: "money", path: "/money/transfers/new", panelType: "modal", deepLinkable: false },
  { capabilityId: "con-calendar-read", section: "concierge", path: "/concierge/calendar", panelType: "full", deepLinkable: true },
  { capabilityId: "con-booking-create", section: "concierge", path: "/concierge/bookings/new", panelType: "drawer", deepLinkable: false },
  { capabilityId: "plat-diagnostic", section: "admin", path: "/admin/diagnostics", panelType: "full", deepLinkable: true },
  { capabilityId: "plat-config-write", section: "admin", path: "/admin/config", panelType: "full", deepLinkable: true },
];

export function resolveRoute(capabilityId: string): ShellRoute | undefined {
  return ROUTE_MAP.find((r) => r.capabilityId === capabilityId);
}

export function resolveSection(capabilityId: string): NavigationSection | undefined {
  return ROUTE_MAP.find((r) => r.capabilityId === capabilityId)?.section;
}

export function listRoutesForSection(section: NavigationSection): ShellRoute[] {
  return ROUTE_MAP.filter((r) => r.section === section);
}

export function getDeepLinkableRoutes(): ShellRoute[] {
  return ROUTE_MAP.filter((r) => r.deepLinkable);
}

export function registerRoute(route: ShellRoute): void {
  const existing = ROUTE_MAP.findIndex((r) => r.capabilityId === route.capabilityId);
  if (existing >= 0) ROUTE_MAP[existing] = route;
  else ROUTE_MAP.push(route);
}

