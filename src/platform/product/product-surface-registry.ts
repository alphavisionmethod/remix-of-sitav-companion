// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Surface Registry
// Canonical definition of the four distinct SITA products
// ═══════════════════════════════════════════════════════════════

export enum ProductSurface {
  SITA_OS_DESKTOP = "sita-os-desktop",
  SITA_MOBILE_APP = "sita-mobile-app",
  SITA_ADMIN_BACKEND = "sita-admin-backend",
  SITA_CORE_API = "sita-core-api",
}

export interface ProductSurfaceDefinition {
  surface: ProductSurface;
  displayName: string;
  description: string;
  routePrefixes: string[];
  deploymentTargets: string[];
  buildPipeline: string;
  requiredCapabilities: string[];
  ownedEdgeFunctionPrefixes: string[];
  ownedTablePrefixes: string[];
}

export const PRODUCT_SURFACE_DEFINITIONS: Record<ProductSurface, ProductSurfaceDefinition> = {
  [ProductSurface.SITA_OS_DESKTOP]: {
    surface: ProductSurface.SITA_OS_DESKTOP,
    displayName: "SITA OS Desktop",
    description: "Immersive desktop-like operating environment with shell, boardroom, advisors, and domain apps.",
    routePrefixes: [
      "/desktop", "/business", "/finance", "/concierge", "/boardroom",
      "/files", "/settings", "/integrations", "/trust", "/advisor",
      "/investment", "/money", "/communications", "/apps",
    ],
    deploymentTargets: ["web", "electron", "vmware-ova", "iso", "raw-img"],
    buildPipeline: "vite-build + electron-builder + packer",
    requiredCapabilities: [
      "shell", "focus-dock", "window-management", "advisor-board",
      "boardroom", "file-management", "trust-system", "setup-ceremony",
    ],
    ownedEdgeFunctionPrefixes: [
      "boardroom-", "advisor-", "desktop-", "file-", "trust-",
      "setup-", "world-model-", "environment-",
    ],
    ownedTablePrefixes: [
      "advisor_", "boardroom_", "desktop_", "environment_",
      "trust_", "setup_", "world_model_",
    ],
  },

  [ProductSurface.SITA_MOBILE_APP]: {
    surface: ProductSurface.SITA_MOBILE_APP,
    displayName: "SITA Mobile App",
    description: "Companion mobile-first operating surface with pulse, quick actions, and sync.",
    routePrefixes: ["/mobile"],
    deploymentTargets: ["pwa", "capacitor-ios", "capacitor-android"],
    buildPipeline: "vite-build + capacitor-sync",
    requiredCapabilities: [
      "mobile-onboarding", "push-notifications", "mobile-boardroom",
      "advisor-presence", "quick-actions", "offline-sync",
      "mobile-approvals", "mobile-pulse",
    ],
    ownedEdgeFunctionPrefixes: ["mobile-", "push-", "cloud-sync-"],
    ownedTablePrefixes: ["mobile_", "push_", "sync_"],
  },

  [ProductSurface.SITA_ADMIN_BACKEND]: {
    surface: ProductSurface.SITA_ADMIN_BACKEND,
    displayName: "SITA Admin Backend",
    description: "Owner-only control plane for tenant oversight, diagnostics, and system management.",
    routePrefixes: ["/admin"],
    deploymentTargets: ["web"],
    buildPipeline: "vite-build",
    requiredCapabilities: [
      "tenant-oversight", "user-management", "environment-management",
      "integration-health", "diagnostics", "deployment-management",
      "feature-flags", "trust-rule-management", "analytics",
      "recovery-tooling", "support-tools",
    ],
    ownedEdgeFunctionPrefixes: [
      "admin-", "support-", "generate-support-", "workflow-repair",
    ],
    ownedTablePrefixes: [
      "admin_", "kill_switch", "feature_flag",
    ],
  },

  [ProductSurface.SITA_CORE_API]: {
    surface: ProductSurface.SITA_CORE_API,
    displayName: "SITA Core API Platform",
    description: "Shared backend engine: auth, profiles, workflows, advisors, integrations, telemetry.",
    routePrefixes: [], // No UI routes — pure API
    deploymentTargets: ["supabase-edge"],
    buildPipeline: "supabase-deploy",
    requiredCapabilities: [
      "auth", "user-profiles", "environment-model", "setup-persistence",
      "trust-permissions", "advisors", "integrations", "workflows",
      "notifications", "file-handling", "telemetry", "admin-apis",
    ],
    ownedEdgeFunctionPrefixes: [
      "auth-", "ai-gateway", "alert-", "billing-", "cashflow-",
      "communications-", "connector-", "data-export", "error-",
      "gdpr-", "health-", "invoice-", "lead-", "notification-",
      "receipt-", "webhook-", "workflow-",
    ],
    ownedTablePrefixes: [
      "accounts", "ai_", "alerts", "approval_", "billing_",
      "communications_", "connector_", "error_", "incidents",
      "invoices", "leads", "notifications", "observability_",
      "receipts", "uptime_", "workflow_",
    ],
  },
};

// ── Route → Surface mapping ──────────────────────────────────

export function resolveRouteSurface(path: string): ProductSurface | null {
  for (const [surface, def] of Object.entries(PRODUCT_SURFACE_DEFINITIONS)) {
    for (const prefix of def.routePrefixes) {
      if (path === prefix || path.startsWith(prefix + "/")) {
        return surface as ProductSurface;
      }
    }
  }
  return null;
}

export function resolveEdgeFunctionSurface(fnName: string): ProductSurface[] {
  const surfaces: ProductSurface[] = [];
  for (const [surface, def] of Object.entries(PRODUCT_SURFACE_DEFINITIONS)) {
    for (const prefix of def.ownedEdgeFunctionPrefixes) {
      if (fnName.startsWith(prefix)) {
        surfaces.push(surface as ProductSurface);
        break;
      }
    }
  }
  // Core API is fallback owner for unmatched functions
  if (surfaces.length === 0) surfaces.push(ProductSurface.SITA_CORE_API);
  return surfaces;
}