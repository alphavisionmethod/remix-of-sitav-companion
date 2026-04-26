// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Family Registry (Wave G — Constitution Rule 51)
//
// Hand-curated, typed registry of every route family in src/routes/families/.
// Cross-checked at build time by:
//   - scripts/architecture/checks/check-route-family-classification.ts
//   - scripts/architecture/checks/check-route-family-registry-completeness.ts
//   - scripts/architecture/checks/check-route-family-app-vs-os-separation.ts
//   - scripts/architecture/checks/check-route-family-no-page-bodies.ts
// Generator: scripts/architecture/generate/generate-route-family-registry.ts
// ═══════════════════════════════════════════════════════════════

import type { RouteFamilyDescriptor } from "@/routes/types/route-family-types";

export const ROUTE_FAMILY_REGISTRY: readonly RouteFamilyDescriptor[] = [
  // ── Module pillars ──────────────────────────────────────────
  {
    id: "business",
    name: "Business OS",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/modules/business/pages/**",
    filePath: "src/routes/families/business-routes.tsx",
    factoryExport: "getBusinessRoutes",
  },
  {
    id: "concierge",
    name: "Concierge",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/modules/concierge/pages/**",
    filePath: "src/routes/families/concierge-routes.tsx",
    factoryExport: "getConciergeRoutes",
  },
  {
    id: "money",
    name: "Money / Finance OS",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/modules/finance/pages/**",
    filePath: "src/routes/families/money-routes.tsx",
    factoryExport: "getMoneyRoutes",
  },
  {
    id: "health",
    name: "Health OS",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/modules/health/pages/**",
    filePath: "src/routes/families/health-routes.tsx",
    factoryExport: "getHealthRoutes",
  },
  {
    id: "investment",
    name: "Investment Workspace (canonical /investment — core 18 routes)",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/investment-office/**",
    filePath: "src/routes/families/investment-routes.tsx",
    factoryExport: "getInvestmentRoutes",
    notes: "Phase 5 consolidation — /investment is the single canonical Investment Office namespace. Extended pages live in the sibling 'investment-office' family below.",
  },

  // ── Platform systems ───────────────────────────────────────
  {
    id: "boardroom",
    name: "Boardroom",
    kind: "platform",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/boardroom/pages/**",
    filePath: "src/routes/families/boardroom-routes.tsx",
    factoryExport: "getBoardroomRoutes",
  },
  {
    id: "advisor",
    name: "Advisor Council",
    kind: "platform",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/advisors/pages/**",
    filePath: "src/routes/families/advisor-routes.tsx",
    factoryExport: "getAdvisorRoutes",
  },
  {
    id: "business-advisor",
    name: "Business Advisor",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/modules/business/pages/business-advisors/**",
    filePath: "src/routes/families/business-advisor-routes.tsx",
    factoryExport: "getBusinessAdvisorRoutes",
  },
  {
    id: "trust",
    name: "Trust Center",
    kind: "platform",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/trust/pages/**",
    filePath: "src/routes/families/trust-routes.tsx",
    factoryExport: "getTrustRoutes",
  },
  {
    id: "files",
    name: "Files",
    kind: "platform",
    surface: "user-product",
    profiles: ["both"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/files/pages/**",
    filePath: "src/routes/families/files-routes.tsx",
    factoryExport: "getFilesRoutes",
  },
  {
    id: "communications",
    name: "Communications",
    kind: "platform",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/orchestration/pages/**",
    filePath: "src/routes/families/communications-routes.tsx",
    factoryExport: "getCommunicationsRoutes",
  },
  {
    id: "settings",
    name: "Settings",
    kind: "platform",
    surface: "shared-shell",
    profiles: ["both"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/settings/pages/**",
    filePath: "src/routes/families/settings-routes.tsx",
    factoryExport: "getSettingsRoutes",
  },

  // ── App-runtime (app store, launcher) ───────────────────────
  {
    id: "apps",
    name: "App Store / Launcher",
    kind: "app-runtime",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/app-platform/pages/**",
    filePath: "src/routes/families/apps-routes.tsx",
    factoryExport: "getAppsRoutes",
  },

  // ── Experimental split (Wave G — was experimental-routes.tsx) ─
  {
    id: "investment-office",
    name: "Investment Office — Extended Pages (canonical /investment/* extension)",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/investment-office/**",
    filePath: "src/routes/families/investment-office-routes.tsx",
    factoryExport: "getInvestmentOfficeRoutes",
    notes: "Phase 5 — emits ONLY the extended /investment/* routes that are not declared in investment-routes.tsx (BeginnerMode, AdvancedMode, CapitalTwin, DecisionTheater, etc.). Together both families form the single canonical /investment/* namespace. Legacy /investments/* served by USER_REDIRECTS in src/routes/redirects/user-redirect-map.ts.",
  },
  {
    id: "revenue-office",
    name: "Revenue Office",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "shell-mount",
    canonicalPageOwner: "src/pages/revenue-office/**",
    filePath: "src/routes/families/revenue-office-routes.tsx",
    factoryExport: "getRevenueOfficeRoutes",
    notes: "Wraps Outlet with RevenueOfficeModeProvider — declared shell-mount. Split from experimental-routes.tsx in Wave G.",
  },
  {
    id: "digital-presence",
    name: "Digital Presence",
    kind: "module",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/digital-presence/**",
    filePath: "src/routes/families/digital-presence-routes.tsx",
    factoryExport: "getDigitalPresenceRoutes",
    notes: "Split from experimental-routes.tsx in Wave G.",
  },
  {
    id: "pack-store",
    name: "Pack Store + App Platform",
    kind: "app-runtime",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/{store,app-platform}/**",
    filePath: "src/routes/families/pack-store-routes.tsx",
    factoryExport: "getPackStoreRoutes",
    notes: "Split from experimental-routes.tsx in Wave G.",
  },
  {
    id: "digital-twins",
    name: "Digital Twins / Scenario / AI Economics",
    kind: "platform",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/{DigitalTwinsPage,ScenarioLabPage,AIEconomicsPage,RecoveredValuePage}.tsx",
    filePath: "src/routes/families/digital-twins-routes.tsx",
    factoryExport: "getDigitalTwinsRoutes",
    notes: "Split from experimental-routes.tsx in Wave G.",
  },

  // ── OS shell (desktop, system, personal-brain, workspaces, built-in apps, intelligence) ─
  {
    id: "os",
    name: "OS Shell + Personal Brain + Built-in Apps + Intelligence",
    kind: "os-shell",
    surface: "shared-shell",
    profiles: ["both"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/{personal-brain,sita,intelligence,apps}/** + root shell pages",
    filePath: "src/routes/families/os-routes.tsx",
    factoryExport: "getOSRoutes",
    notes: "Conflates 4 sub-concepts (shell, personal-brain, workspaces, built-in apps, intelligence). Splitting deferred to Wave H.",
  },

  // ── Admin / Owner / Mobile (PascalCase legacy → kebab-case) ─
  {
    id: "admin",
    name: "Admin Control Plane",
    kind: "admin",
    surface: "operator",
    profiles: ["operator"],
    owns: "topology-only",
    canonicalPageOwner: "src/pages/admin/** (Rule 30 ratchet → src/admin/modules/<domain>/views/)",
    filePath: "src/routes/families/admin-routes.tsx",
    factoryExport: "getAdminRoutes",
  },
  {
    id: "owner",
    name: "Owner Mode",
    kind: "platform",
    surface: "owner",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/owner/pages/**",
    filePath: "src/routes/families/owner-routes.tsx",
    factoryExport: "getOwnerRoutes",
  },
  {
    id: "mobile",
    name: "Mobile Trusted-Device Shell",
    kind: "mobile-runtime",
    surface: "user-product",
    profiles: ["user"],
    owns: "topology-only",
    canonicalPageOwner: "src/platform/experience/pages/mobile/**",
    filePath: "src/routes/families/mobile-routes.tsx",
    factoryExport: "MobileRoutes",
  },
] as const;

/** Lookup table by id. */
export const ROUTE_FAMILY_BY_ID = new Map(
  ROUTE_FAMILY_REGISTRY.map((f) => [f.id, f] as const),
);

/** Total registered families. */
export const ROUTE_FAMILY_COUNT = ROUTE_FAMILY_REGISTRY.length;