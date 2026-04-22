// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Intent Taxonomy & Canonical Route Metadata
// Single source of truth for route classification, ownership,
// and cross-cutting concerns (backend, truth, support, observability).
// ═══════════════════════════════════════════════════════════════

import type { CanonicalPlaneKey } from "./plane-registry";
import type { Layer } from "./layer-manifest";
import type { RuntimeTier } from "@/runtimes/runtime-tier-model";

// ── Route Intent ────────────────────────────────────────────────

export type RouteIntent =
  | "LANDING"
  | "AUTH"
  | "ONBOARDING"
  | "USER_WORKSPACE"
  | "ADMIN_OPERATOR"
  | "OWNER_OVERRIDE"
  | "APP_PLATFORM"
  | "DESKTOP_OS"
  | "SETTINGS"
  | "INTEGRATION"
  | "SUPPORT"
  | "MARKETING"
  | "EXPERIMENTAL"
  | "SYSTEM_RECOVERY"
  | "INTERNAL_TOOLING";

// ── Route Tier ──────────────────────────────────────────────────

export type RouteTier =
  | "PUBLIC"
  | "AUTHENTICATED"
  | "PRIVILEGED"
  | "OPERATOR_CRITICAL"
  | "SYSTEM_CRITICAL"
  | "EXPERIMENTAL"
  | "DEPRECATED";

// ── Backend Source ──────────────────────────────────────────────

export type BackendSourceType =
  | "PUBLIC_BFF"
  | "ADMIN_BFF"
  | "DOMAIN_FUNCTION"
  | "ORCHESTRATION_FUNCTION"
  | "RUNTIME_SYSTEM"
  | "EXTERNAL_PROVIDER"
  | "STATIC";

// ── Truth Primitive ─────────────────────────────────────────────

export type TruthPrimitive =
  | "STATUS"
  | "PROVENANCE"
  | "EVIDENCE"
  | "AI_DISCLOSURE"
  | "TRUST_COPY"
  | "RECEIPT"
  | "PROOF_BUNDLE";

// ── Auth Level ──────────────────────────────────────────────────

export type AuthLevel = "public" | "authenticated" | "admin" | "owner";

// ── Error Reporting ─────────────────────────────────────────────

export type ErrorReporting = "structured" | "best-effort" | "none";

// ── Escalation Path ─────────────────────────────────────────────

export type EscalationPath = "operator" | "engineering" | "external" | "self-service";

// ── Deprecation Status ─────────────────────────────────────────

export type DeprecationStatus = "active" | "deprecated" | "sunset" | "quarantined";

// ── Canonical Route Metadata ────────────────────────────────────

export interface RouteMetadata {
  readonly routeId: string;
  readonly path: string;
  readonly prefix: string;
  readonly family: string;
  readonly intent: RouteIntent;
  readonly tier: RouteTier;
  readonly plane: CanonicalPlaneKey;
  readonly layer: Layer;
  readonly owner: string;
  readonly domain: string;
  readonly supportedRuntimes: readonly RuntimeTier[];
  readonly degradedRuntimes: readonly RuntimeTier[];
  readonly blockedRuntimes: readonly RuntimeTier[];
  readonly profiles: readonly ("user" | "operator")[];
  readonly authRequired: boolean;
  readonly authLevel: AuthLevel;
  readonly requiredCapabilities: readonly string[];
  readonly shell: string;
  readonly lazyEntry: boolean;
  readonly pageSource: string;
  readonly backendSources: readonly BackendSourceType[];
  readonly dataDependencies: readonly string[];
  readonly truthPrimitives: readonly TruthPrimitive[];
  readonly supportMapping: {
    readonly runbookRef: string | null;
    readonly killSwitchRef: string | null;
    readonly escalationPath: EscalationPath;
    readonly diagnosticEntry: string | null;
  };
  readonly observabilityMapping: {
    readonly errorReporting: ErrorReporting;
    readonly telemetryHooks: readonly string[];
    readonly adminDiagnosticPath: string | null;
  };
  readonly deprecationStatus: DeprecationStatus;
}

// ── All 4 runtimes shorthand ────────────────────────────────────

const ALL_RUNTIMES: readonly RuntimeTier[] = [
  "WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME", "SIMULATED_OS_EXPERIENCE",
];
const WEB_DESKTOP: readonly RuntimeTier[] = ["WEB_APP", "DESKTOP_HOST"];
const NO_RUNTIMES: readonly RuntimeTier[] = [];

// ── Default observability / support ─────────────────────────────

const defaultSupport = (escalation: EscalationPath = "self-service"): RouteMetadata["supportMapping"] => ({
  runbookRef: null, killSwitchRef: null, escalationPath: escalation, diagnosticEntry: null,
});

const defaultObs = (level: ErrorReporting = "best-effort"): RouteMetadata["observabilityMapping"] => ({
  errorReporting: level, telemetryHooks: ["page-view"], adminDiagnosticPath: null,
});

// ═══════════════════════════════════════════════════════════════
// ROUTE METADATA REGISTRY — ~30 canonical route family entries
// ═══════════════════════════════════════════════════════════════

export const ROUTE_METADATA_REGISTRY: readonly RouteMetadata[] = [
  // ── Auth ──
  {
    routeId: "auth-login", path: "/login", prefix: "/login", family: "Landing/Auth",
    intent: "AUTH", tier: "PUBLIC", plane: "shell-runtime", layer: "web",
    owner: "identity", domain: "auth",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: false, authLevel: "public", requiredCapabilities: [],
    shell: "AuthLayout", lazyEntry: true, pageSource: "src/pages/LoginPage.tsx",
    backendSources: ["PUBLIC_BFF"], dataDependencies: ["auth.session"],
    truthPrimitives: [], supportMapping: defaultSupport(), observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  {
    routeId: "auth-register", path: "/register", prefix: "/register", family: "Landing/Auth",
    intent: "AUTH", tier: "PUBLIC", plane: "shell-runtime", layer: "web",
    owner: "identity", domain: "auth",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: false, authLevel: "public", requiredCapabilities: [],
    shell: "AuthLayout", lazyEntry: true, pageSource: "src/pages/RegisterPage.tsx",
    backendSources: ["PUBLIC_BFF"], dataDependencies: ["auth.session"],
    truthPrimitives: [], supportMapping: defaultSupport(), observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Desktop ──
  {
    routeId: "desktop-home", path: "/desktop", prefix: "/desktop", family: "Nova Desktop",
    intent: "DESKTOP_OS", tier: "AUTHENTICATED", plane: "user", layer: "os-kernel",
    owner: "platform", domain: "desktop",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/DesktopPage.tsx",
    backendSources: ["RUNTIME_SYSTEM"], dataDependencies: ["user.profile", "user.preferences"],
    truthPrimitives: [], supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Business ──
  {
    routeId: "business", path: "/business", prefix: "/business", family: "Business",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "productivity", domain: "business",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/BusinessShellPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["accounts", "contacts", "projects"],
    truthPrimitives: ["STATUS"], supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Money ──
  {
    routeId: "money", path: "/money", prefix: "/money", family: "Money/Finance",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "finance", domain: "money",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/MoneyShellPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], dataDependencies: ["transactions", "accounts_financial"],
    truthPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE", "RECEIPT"],
    supportMapping: { runbookRef: "RB-MONEY-001", killSwitchRef: "KS-FINANCIAL-OPS", escalationPath: "engineering", diagnosticEntry: "/admin/support" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
  // ── Concierge ──
  {
    routeId: "concierge", path: "/concierge", prefix: "/concierge", family: "Concierge",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "intelligence", domain: "concierge",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/ConciergeShellPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"],
    dataDependencies: ["ai_invocations", "advisor_agents"],
    truthPrimitives: ["AI_DISCLOSURE", "RECEIPT"],
    supportMapping: { runbookRef: "RB-AI-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
  // ── Boardroom ──
  {
    routeId: "boardroom", path: "/boardroom", prefix: "/boardroom", family: "Boardroom",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "intelligence", domain: "boardroom",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/BoardroomPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"],
    dataDependencies: ["advisor_board_recommendations", "advisor_board_actions", "boardroom_items"],
    truthPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE", "RECEIPT", "PROOF_BUNDLE"],
    supportMapping: { runbookRef: "RB-BOARDROOM-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
  // ── Files ──
  {
    routeId: "files", path: "/files", prefix: "/files", family: "Files",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "productivity", domain: "files",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/FilesPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["storage.files"],
    truthPrimitives: ["STATUS", "PROVENANCE"],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Settings ──
  {
    routeId: "settings", path: "/settings", prefix: "/settings", family: "Settings",
    intent: "SETTINGS", tier: "AUTHENTICATED", plane: "shell-runtime", layer: "app",
    owner: "platform", domain: "settings",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/SettingsPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["user.preferences"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Revenue Office ──
  {
    routeId: "revenue-office", path: "/revenue-office", prefix: "/revenue-office", family: "Revenue Office",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "finance", domain: "revenue",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/RevenueOfficeShellPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["invoices", "revenue_streams"],
    truthPrimitives: ["STATUS", "EVIDENCE", "RECEIPT"],
    supportMapping: { runbookRef: "RB-REVENUE-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: null },
    observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Investment Office ──
  {
    routeId: "investment-office", path: "/investment-office", prefix: "/investment-office", family: "Investment Office",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "finance", domain: "investment",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/InvestmentShellPage.tsx",
*** this hunk is wrong, let me fix
    backendSources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], dataDependencies: ["portfolios", "holdings"],
    truthPrimitives: ["STATUS", "PROVENANCE", "EVIDENCE", "AI_DISCLOSURE"],
    supportMapping: { runbookRef: "RB-INVEST-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: null },
    observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Digital Presence ──
  {
    routeId: "digital-presence", path: "/digital-presence", prefix: "/digital-presence", family: "Digital Presence",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "marketing", domain: "digital-presence",
    supportedRuntimes: WEB_DESKTOP, degradedRuntimes: ["SIMULATED_OS_EXPERIENCE"] as readonly RuntimeTier[], blockedRuntimes: ["APPLIANCE_RUNTIME"] as readonly RuntimeTier[],
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/DigitalPresenceShellPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], dataDependencies: ["websites", "analytics"],
    truthPrimitives: ["STATUS"],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Connectors ──
  {
    routeId: "connectors", path: "/connectors", prefix: "/connectors", family: "Connectors",
    intent: "INTEGRATION", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "integrations", domain: "connectors",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/ConnectorsPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "EXTERNAL_PROVIDER"], dataDependencies: ["connector_configs"],
    truthPrimitives: ["STATUS", "PROVENANCE"],
    supportMapping: { runbookRef: "RB-CONN-001", killSwitchRef: "KS-CONNECTORS", escalationPath: "engineering", diagnosticEntry: "/admin/support" },
    observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Advisors ──
  {
    routeId: "advisors", path: "/advisors", prefix: "/advisors", family: "Advisors",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "intelligence", domain: "advisors",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/AdvisorsPage.tsx",
    backendSources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"], dataDependencies: ["advisor_agents", "advisor_registry"],
    truthPrimitives: ["AI_DISCLOSURE", "RECEIPT"],
    supportMapping: { runbookRef: "RB-AI-001", killSwitchRef: "KS-AI-GLOBAL", escalationPath: "engineering", diagnosticEntry: "/admin/engineering" },
    observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Workspace ──
  {
    routeId: "workspace", path: "/workspace", prefix: "/workspace", family: "Workspace",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "productivity", domain: "workspace",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/WorkspacePage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["workspace_items"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Apps / App Store ──
  {
    routeId: "apps", path: "/apps", prefix: "/apps", family: "App Store",
    intent: "APP_PLATFORM", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "platform", domain: "apps",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/AppStoreCenter.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["app_registry"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Notifications ──
  {
    routeId: "notifications", path: "/notifications", prefix: "/notifications", family: "Notifications",
    intent: "SETTINGS", tier: "AUTHENTICATED", plane: "shell-runtime", layer: "app",
    owner: "platform", domain: "notifications",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/NotificationsPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["notifications"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Search ──
  {
    routeId: "search", path: "/search", prefix: "/search", family: "Search",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "shell-runtime", layer: "app",
    owner: "platform", domain: "search",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: false, pageSource: "src/pages/SearchPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: [],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Onboarding ──
  {
    routeId: "onboarding", path: "/onboarding", prefix: "/onboarding", family: "Onboarding",
    intent: "ONBOARDING", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "platform", domain: "onboarding",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/OnboardingPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["onboarding_state"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Governance ──
  {
    routeId: "governance", path: "/governance", prefix: "/governance", family: "Governance",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "compliance", domain: "governance",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/GovernancePage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["governance_policies"],
    truthPrimitives: ["STATUS", "EVIDENCE"],
    supportMapping: defaultSupport("operator"), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Enterprise ──
  {
    routeId: "enterprise", path: "/enterprise", prefix: "/enterprise", family: "Enterprise",
    intent: "USER_WORKSPACE", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "enterprise", domain: "enterprise",
    supportedRuntimes: WEB_DESKTOP, degradedRuntimes: ["SIMULATED_OS_EXPERIENCE"] as readonly RuntimeTier[], blockedRuntimes: ["APPLIANCE_RUNTIME"] as readonly RuntimeTier[],
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/EnterprisePage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: [],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Policies ──
  {
    routeId: "policies", path: "/policies", prefix: "/policies", family: "Policies",
    intent: "SETTINGS", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "compliance", domain: "policies",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/PoliciesPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["policies"],
    truthPrimitives: ["STATUS"],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Observability (user) ──
  {
    routeId: "observability", path: "/observability", prefix: "/observability", family: "Observability",
    intent: "SUPPORT", tier: "AUTHENTICATED", plane: "user", layer: "app",
    owner: "operations", domain: "observability",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/ObservabilityPage.tsx",
    backendSources: ["DOMAIN_FUNCTION"], dataDependencies: ["logs", "metrics"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Admin ──
  {
    routeId: "admin", path: "/admin", prefix: "/admin", family: "Admin Core",
    intent: "ADMIN_OPERATOR", tier: "OPERATOR_CRITICAL", plane: "admin", layer: "admin-operator",
    owner: "operations", domain: "admin",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: ["SIMULATED_OS_EXPERIENCE"] as readonly RuntimeTier[], blockedRuntimes: NO_RUNTIMES,
    profiles: ["operator"], authRequired: true, authLevel: "admin", requiredCapabilities: ["admin.view"],
    shell: "AdminControlPlaneShell", lazyEntry: true, pageSource: "src/pages/admin/AdminDashboard.tsx",
    backendSources: ["ADMIN_BFF", "DOMAIN_FUNCTION"], dataDependencies: ["admin_sessions", "admin_action_audit"],
    truthPrimitives: ["STATUS", "EVIDENCE", "RECEIPT"],
    supportMapping: { runbookRef: "RB-ADMIN-001", killSwitchRef: "KS-ADMIN-PANEL", escalationPath: "engineering", diagnosticEntry: "/admin/observability" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["page-view", "action", "latency"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
  // ── Owner ──
  {
    routeId: "owner", path: "/owner", prefix: "/owner", family: "Owner",
    intent: "OWNER_OVERRIDE", tier: "SYSTEM_CRITICAL", plane: "admin", layer: "admin-operator",
    owner: "operations", domain: "owner",
    supportedRuntimes: WEB_DESKTOP, degradedRuntimes: ["SIMULATED_OS_EXPERIENCE"] as readonly RuntimeTier[], blockedRuntimes: ["APPLIANCE_RUNTIME"] as readonly RuntimeTier[],
    profiles: ["operator"], authRequired: true, authLevel: "owner", requiredCapabilities: ["owner.view"],
    shell: "OwnerWorkspaceShell", lazyEntry: true, pageSource: "src/pages/owner/OwnerDashboard.tsx",
    backendSources: ["ADMIN_BFF"], dataDependencies: ["admin_sessions"],
    truthPrimitives: ["STATUS", "EVIDENCE", "RECEIPT", "PROOF_BUNDLE"],
    supportMapping: { runbookRef: "RB-OWNER-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: "/admin/observability" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["page-view", "action"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
  // ── Mission Control ──
  {
    routeId: "mission", path: "/mission", prefix: "/mission", family: "Mission Control",
    intent: "ADMIN_OPERATOR", tier: "OPERATOR_CRITICAL", plane: "admin", layer: "admin-operator",
    owner: "operations", domain: "mission",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: ["SIMULATED_OS_EXPERIENCE"] as readonly RuntimeTier[], blockedRuntimes: NO_RUNTIMES,
    profiles: ["operator"], authRequired: true, authLevel: "admin", requiredCapabilities: ["admin.view"],
    shell: "AdminControlPlaneShell", lazyEntry: true, pageSource: "src/pages/admin/MissionControlPage.tsx",
    backendSources: ["ADMIN_BFF"], dataDependencies: ["admin_action_audit"],
    truthPrimitives: ["STATUS", "EVIDENCE"],
    supportMapping: { runbookRef: "RB-ADMIN-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: "/admin/observability" },
    observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── Nova Desktop ──
  {
    routeId: "nova-desktop", path: "/nova-desktop", prefix: "/nova-desktop", family: "Nova Desktop",
    intent: "DESKTOP_OS", tier: "AUTHENTICATED", plane: "user", layer: "os-kernel",
    owner: "platform", domain: "desktop",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: true, pageSource: "src/pages/NovaDesktopPage.tsx",
    backendSources: ["RUNTIME_SYSTEM"], dataDependencies: ["user.preferences"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Landing / Root ──
  {
    routeId: "landing", path: "/", prefix: "/", family: "Landing/Auth",
    intent: "LANDING", tier: "AUTHENTICATED", plane: "user", layer: "web",
    owner: "platform", domain: "shell",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "ShellLayout", lazyEntry: false, pageSource: "src/pages/Index.tsx",
    backendSources: ["STATIC"], dataDependencies: [],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs(),
    deprecationStatus: "active",
  },
  // ── Auth flow ──
  {
    routeId: "auth", path: "/auth", prefix: "/auth", family: "Landing/Auth",
    intent: "AUTH", tier: "PUBLIC", plane: "shell-runtime", layer: "web",
    owner: "identity", domain: "auth",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: false, authLevel: "public", requiredCapabilities: [],
    shell: "AuthLayout", lazyEntry: false, pageSource: "src/pages/AuthCallbackPage.tsx",
    backendSources: ["PUBLIC_BFF"], dataDependencies: ["auth.session"],
    truthPrimitives: [],
    supportMapping: defaultSupport(), observabilityMapping: defaultObs("structured"),
    deprecationStatus: "active",
  },
  // ── API surface ──
  {
    routeId: "api", path: "/api", prefix: "/api", family: "Backend API",
    intent: "INTERNAL_TOOLING", tier: "SYSTEM_CRITICAL", plane: "backend-services", layer: "domain-capability",
    owner: "platform", domain: "api",
    supportedRuntimes: ALL_RUNTIMES, degradedRuntimes: NO_RUNTIMES, blockedRuntimes: NO_RUNTIMES,
    profiles: ["user", "operator"], authRequired: true, authLevel: "authenticated", requiredCapabilities: [],
    shell: "none", lazyEntry: false, pageSource: "supabase/functions",
    backendSources: ["DOMAIN_FUNCTION", "ORCHESTRATION_FUNCTION"], dataDependencies: [],
    truthPrimitives: ["RECEIPT"],
    supportMapping: { runbookRef: "RB-API-001", killSwitchRef: null, escalationPath: "engineering", diagnosticEntry: "/admin/observability" },
    observabilityMapping: { errorReporting: "structured", telemetryHooks: ["latency"], adminDiagnosticPath: "/admin/observability" },
    deprecationStatus: "active",
  },
];

// ── Lookup helpers ──────────────────────────────────────────────

export function getRouteMetadata(routeId: string): RouteMetadata | undefined {
  return ROUTE_METADATA_REGISTRY.find((r) => r.routeId === routeId);
}

export function getRouteMetadataByPath(path: string): RouteMetadata | undefined {
  let best: RouteMetadata | undefined;
  for (const entry of ROUTE_METADATA_REGISTRY) {
    if (path === entry.prefix || path.startsWith(entry.prefix + "/") || (entry.prefix === "/" && path === "/")) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best;
}

export function getRoutesByIntent(intent: RouteIntent): readonly RouteMetadata[] {
  return ROUTE_METADATA_REGISTRY.filter((r) => r.intent === intent);
}

export function getRoutesByTier(tier: RouteTier): readonly RouteMetadata[] {
  return ROUTE_METADATA_REGISTRY.filter((r) => r.tier === tier);
}

export function getRoutesRequiringTruth(): readonly RouteMetadata[] {
  return ROUTE_METADATA_REGISTRY.filter((r) => r.truthPrimitives.length > 0);
}

export function getRegistryStats() {
  return {
    total: ROUTE_METADATA_REGISTRY.length,
    byIntent: Object.fromEntries(
      (["LANDING", "AUTH", "ONBOARDING", "USER_WORKSPACE", "ADMIN_OPERATOR", "OWNER_OVERRIDE", "APP_PLATFORM", "DESKTOP_OS", "SETTINGS", "INTEGRATION", "SUPPORT", "EXPERIMENTAL", "SYSTEM_RECOVERY", "INTERNAL_TOOLING"] as RouteIntent[])
        .map((i) => [i, ROUTE_METADATA_REGISTRY.filter((r) => r.intent === i).length])
    ),
    byTier: Object.fromEntries(
      (["PUBLIC", "AUTHENTICATED", "PRIVILEGED", "OPERATOR_CRITICAL", "SYSTEM_CRITICAL", "EXPERIMENTAL", "DEPRECATED"] as RouteTier[])
        .map((t) => [t, ROUTE_METADATA_REGISTRY.filter((r) => r.tier === t).length])
    ),
    withTruth: ROUTE_METADATA_REGISTRY.filter((r) => r.truthPrimitives.length > 0).length,
    withBackend: ROUTE_METADATA_REGISTRY.filter((r) => r.backendSources.length > 0 && !r.backendSources.includes("STATIC")).length,
    withSupport: ROUTE_METADATA_REGISTRY.filter((r) => r.supportMapping.runbookRef !== null).length,
  };
}