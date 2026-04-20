// ═══════════════════════════════════════════════════════════════
// SITA OS — Page Shell Compliance Map
// Maps route prefixes to required layout grammar patterns.
// ═══════════════════════════════════════════════════════════════

import type { LayoutPatternId } from "./layout-grammar-map";
import type { PageClass } from "@/lib/reality/page-state-contract";

export type MobileAdaptationStandard = "full" | "partial" | "desktop-only" | "not-applicable";

export interface ShellComplianceEntry {
  readonly routePrefix: string;
  readonly requiredLayout: LayoutPatternId;
  readonly expectedPageClass: PageClass;
  readonly mobileAdaptation: MobileAdaptationStandard;
  readonly description: string;
}

export const PAGE_SHELL_COMPLIANCE_MAP: readonly ShellComplianceEntry[] = [
  // ── Public / Marketing ───────────────────────────────────────
  { routePrefix: "/landing",          requiredLayout: "landing",          expectedPageClass: "static",    mobileAdaptation: "full",         description: "Public landing pages" },
  { routePrefix: "/pricing",          requiredLayout: "marketing",        expectedPageClass: "static",    mobileAdaptation: "full",         description: "Pricing page" },
  { routePrefix: "/about",            requiredLayout: "marketing",        expectedPageClass: "static",    mobileAdaptation: "full",         description: "About page" },

  // ── Auth ─────────────────────────────────────────────────────
  { routePrefix: "/auth",             requiredLayout: "auth",             expectedPageClass: "auth",      mobileAdaptation: "full",         description: "Auth flows" },
  { routePrefix: "/login",            requiredLayout: "auth",             expectedPageClass: "auth",      mobileAdaptation: "full",         description: "Login" },
  { routePrefix: "/signup",           requiredLayout: "auth",             expectedPageClass: "auth",      mobileAdaptation: "full",         description: "Signup" },

  // ── Onboarding ───────────────────────────────────────────────
  { routePrefix: "/onboarding",       requiredLayout: "onboarding",       expectedPageClass: "form",      mobileAdaptation: "full",         description: "Setup wizard" },
  { routePrefix: "/setup",            requiredLayout: "onboarding",       expectedPageClass: "form",      mobileAdaptation: "full",         description: "Account setup" },

  // ── Desktop OS ───────────────────────────────────────────────
  { routePrefix: "/",                 requiredLayout: "desktop-os",       expectedPageClass: "dashboard", mobileAdaptation: "desktop-only", description: "Desktop shell root" },
  { routePrefix: "/desktop",          requiredLayout: "desktop-os",       expectedPageClass: "dashboard", mobileAdaptation: "desktop-only", description: "Desktop page" },
  { routePrefix: "/os",               requiredLayout: "desktop-os",       expectedPageClass: "dashboard", mobileAdaptation: "desktop-only", description: "OS pages" },

  // ── Workspace (product) ──────────────────────────────────────
  { routePrefix: "/boardroom",        requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Boardroom" },
  { routePrefix: "/business",         requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Business center" },
  { routePrefix: "/money",            requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Finance center" },
  { routePrefix: "/concierge",        requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Concierge" },
  { routePrefix: "/communications",   requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Communications" },
  { routePrefix: "/files",            requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Files" },
  { routePrefix: "/approvals",        requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Approvals" },
  { routePrefix: "/approval-chamber", requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Approval chamber" },
  { routePrefix: "/notifications",    requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Notifications" },
  { routePrefix: "/inbox",            requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Inbox" },
  { routePrefix: "/daily-pulse",      requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Daily pulse" },
  { routePrefix: "/advisor",          requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Advisor pages" },
  { routePrefix: "/connectors",       requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "Connectors" },
  { routePrefix: "/digital-presence", requiredLayout: "workspace",        expectedPageClass: "dashboard", mobileAdaptation: "partial",      description: "Digital presence" },

  // ── Settings ─────────────────────────────────────────────────
  { routePrefix: "/settings",         requiredLayout: "settings",         expectedPageClass: "form",      mobileAdaptation: "full",         description: "Settings" },

  // ── Admin ────────────────────────────────────────────────────
  { routePrefix: "/admin",            requiredLayout: "admin-operator",   expectedPageClass: "dashboard", mobileAdaptation: "desktop-only", description: "Admin control plane" },

  // ── App Store / Detail ───────────────────────────────────────
  { routePrefix: "/apps",             requiredLayout: "app-detail",       expectedPageClass: "data-detail", mobileAdaptation: "partial",    description: "App pages" },
  { routePrefix: "/app-store",        requiredLayout: "workspace",        expectedPageClass: "data-list", mobileAdaptation: "partial",      description: "App store" },

  // ── Mobile ───────────────────────────────────────────────────
  { routePrefix: "/mobile",           requiredLayout: "mobile-optimized", expectedPageClass: "dashboard", mobileAdaptation: "full",         description: "Mobile views" },
] as const;

/** Total compliance entries. */
export const COMPLIANCE_ENTRY_COUNT = PAGE_SHELL_COMPLIANCE_MAP.length;

/** Find compliance entry for a route. Longest prefix match. */
export function getShellCompliance(route: string): ShellComplianceEntry | undefined {
  let best: ShellComplianceEntry | undefined;
  let bestLen = 0;
  for (const entry of PAGE_SHELL_COMPLIANCE_MAP) {
    if (route.startsWith(entry.routePrefix) && entry.routePrefix.length > bestLen) {
      best = entry;
      bestLen = entry.routePrefix.length;
    }
  }
  return best;
}