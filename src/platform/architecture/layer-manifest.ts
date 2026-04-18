// ═══════════════════════════════════════════════════════════════
// SITA OS — Layer Boundary Manifest
// Canonical source of truth for the 6-layer architecture model.
// Every route prefix, service directory, and component category
// is mapped to exactly one canonical layer.
// ═══════════════════════════════════════════════════════════════

export const LAYERS = {
  WEB: "web",
  APP: "app",
  OS_KERNEL: "os-kernel",
  OS_SERVICES: "os-services",
  ADMIN_OPERATOR: "admin-operator",
  DOMAIN_CAPABILITY: "domain-capability",
} as const;

export type Layer = (typeof LAYERS)[keyof typeof LAYERS];

// ── Route Prefix → Layer Mapping ────────────────────────────────
// Order matters: first match wins (most specific first).

export const ROUTE_LAYER_MAP: { prefix: string; layer: Layer; domain?: string; description: string }[] = [
  // WEB — public, unauthenticated
  { prefix: "/landing", layer: LAYERS.WEB, description: "Public landing page" },
  { prefix: "/login", layer: LAYERS.WEB, description: "Auth entry — login" },
  { prefix: "/signup", layer: LAYERS.WEB, description: "Auth entry — signup" },
  { prefix: "/forgot-password", layer: LAYERS.WEB, description: "Auth recovery" },
  { prefix: "/reset-password", layer: LAYERS.WEB, description: "Auth recovery" },
  { prefix: "/auth/callback", layer: LAYERS.WEB, description: "OAuth callback" },

  // ADMIN / OPERATOR — governance, truth, operator dashboards
  { prefix: "/admin/", layer: LAYERS.ADMIN_OPERATOR, description: "Admin governance surfaces" },
  { prefix: "/owner/", layer: LAYERS.ADMIN_OPERATOR, description: "Owner workspace — governance tier" },
  { prefix: "/mission/", layer: LAYERS.ADMIN_OPERATOR, description: "Mission control — operator tier" },

  // APP — user-facing product experiences (3 domains + offices + apps)
  { prefix: "/business", layer: LAYERS.APP, domain: "business-os", description: "Business domain — user app" },
  { prefix: "/money", layer: LAYERS.APP, domain: "finance-os", description: "Finance domain — user app" },
  { prefix: "/concierge", layer: LAYERS.APP, domain: "concierge-os", description: "Concierge domain — user app" },
  { prefix: "/boardroom", layer: LAYERS.APP, domain: "cross-domain", description: "Boardroom — executive review" },
  { prefix: "/revenue-office", layer: LAYERS.APP, domain: "business-os", description: "Revenue office — business sub-module" },
  { prefix: "/investment-office", layer: LAYERS.APP, domain: "finance-os", description: "Investment office — finance sub-module" },
  { prefix: "/digital-presence", layer: LAYERS.APP, domain: "business-os", description: "Digital presence — business sub-module" },
  { prefix: "/files", layer: LAYERS.APP, description: "File manager — built-in app" },
  { prefix: "/notifications", layer: LAYERS.APP, description: "Notifications — built-in app" },
  { prefix: "/settings", layer: LAYERS.APP, description: "User settings" },
  { prefix: "/app-store", layer: LAYERS.APP, description: "App store — built-in app" },
  { prefix: "/atlas", layer: LAYERS.APP, description: "Atlas — built-in app" },
  { prefix: "/store", layer: LAYERS.APP, description: "Store — built-in app" },
  { prefix: "/search", layer: LAYERS.APP, description: "Global search" },
  { prefix: "/connectors", layer: LAYERS.APP, description: "Connector hub — user-facing" },
  { prefix: "/advisors", layer: LAYERS.APP, description: "Advisor registry — user-facing" },
  { prefix: "/policies", layer: LAYERS.APP, description: "Policy editor — user-facing" },
  { prefix: "/governance", layer: LAYERS.APP, description: "Governance dashboard" },
  { prefix: "/enterprise", layer: LAYERS.APP, description: "Enterprise control plane" },
  { prefix: "/workspace", layer: LAYERS.APP, description: "Workspace surfaces" },
  { prefix: "/observability", layer: LAYERS.APP, description: "Observability — user/operator hybrid" },

  // OS KERNEL — internal, not directly routed (consumed by services)
  { prefix: "/nova-desktop", layer: LAYERS.OS_KERNEL, description: "Nova OS desktop surface" },

  // ONBOARDING — shell-less auth tier
  { prefix: "/onboarding", layer: LAYERS.APP, description: "Onboarding — shell-less auth" },
  { prefix: "/mobile", layer: LAYERS.APP, description: "Mobile surface" },
];

// ── Resolve Layer for a Route ───────────────────────────────────

export function resolveRouteLayer(path: string): Layer {
  for (const entry of ROUTE_LAYER_MAP) {
    if (path.startsWith(entry.prefix)) return entry.layer;
  }
  return LAYERS.APP; // default: user app
}

export function resolveRouteDomain(path: string): string | undefined {
  for (const entry of ROUTE_LAYER_MAP) {
    if (path.startsWith(entry.prefix)) return entry.domain;
  }
  return undefined;
}

// ── Service Directory → Layer Mapping ───────────────────────────

export const SERVICE_LAYER_MAP: Record<string, { layer: Layer; canonical: boolean; duplicateOf?: string }> = {
  // OS KERNEL — core orchestration primitives
  "brain-core": { layer: LAYERS.OS_KERNEL, canonical: true },
  "conscience-gate": { layer: LAYERS.OS_KERNEL, canonical: true },
  "model-router": { layer: LAYERS.OS_KERNEL, canonical: true },
  "policy-engine": { layer: LAYERS.OS_KERNEL, canonical: true },
  "executor-service": { layer: LAYERS.OS_KERNEL, canonical: true },
  "capability-router": { layer: LAYERS.OS_KERNEL, canonical: true },
  "receipt-service": { layer: LAYERS.OS_KERNEL, canonical: true },
  "event-bus": { layer: LAYERS.OS_KERNEL, canonical: true },
  "approval-engine": { layer: LAYERS.OS_KERNEL, canonical: true },
  "canonical-pipeline": { layer: LAYERS.OS_KERNEL, canonical: true },
  "trust-state-service": { layer: LAYERS.OS_KERNEL, canonical: true },
  "constitution-compiler": { layer: LAYERS.OS_KERNEL, canonical: true },

  // OS SERVICES — cross-domain orchestration
  "intent-orchestrator": { layer: LAYERS.OS_SERVICES, canonical: true },
  "attention-os": { layer: LAYERS.OS_SERVICES, canonical: true },
  "continuity-engine": { layer: LAYERS.OS_SERVICES, canonical: true },
  "chief-of-staff": { layer: LAYERS.OS_SERVICES, canonical: true },
  "timing-intelligence": { layer: LAYERS.OS_SERVICES, canonical: true },
  "digest-engine": { layer: LAYERS.OS_SERVICES, canonical: true },
  "sita-modes": { layer: LAYERS.OS_SERVICES, canonical: true },
  "adaptive-interface": { layer: LAYERS.OS_SERVICES, canonical: true },
  "opportunity-engine": { layer: LAYERS.OS_SERVICES, canonical: true },
  "memory-governance": { layer: LAYERS.OS_SERVICES, canonical: true },
  "boundary-engine": { layer: LAYERS.OS_SERVICES, canonical: true },
  "experience-signature": { layer: LAYERS.OS_SERVICES, canonical: true },
  "personal-graph": { layer: LAYERS.OS_SERVICES, canonical: true },
  "trust-actions": { layer: LAYERS.OS_SERVICES, canonical: true },
  "relationship-intelligence": { layer: LAYERS.OS_SERVICES, canonical: true },
  "ai-gateway": { layer: LAYERS.OS_SERVICES, canonical: true },

  // DOMAIN CAPABILITY — bounded domain actions
  "business-os": { layer: LAYERS.DOMAIN_CAPABILITY, canonical: true },
  "finance-os": { layer: LAYERS.DOMAIN_CAPABILITY, canonical: true },
  "concierge-os": { layer: LAYERS.DOMAIN_CAPABILITY, canonical: true },

  // ADMIN / OPERATOR — truth, verification, diagnostics
  "admin-service": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },
  "self-healing": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },
  "connector-health-service": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },
  "incident-management": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },
  "support-diagnostics": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },
  "analytics-service": { layer: LAYERS.ADMIN_OPERATOR, canonical: true },

  // OS KERNEL — additional execution/infrastructure primitives
  "inference-gateway": { layer: LAYERS.OS_KERNEL, canonical: true },
  "epistemic-firewall": { layer: LAYERS.OS_KERNEL, canonical: true },
  "mnemosyne": { layer: LAYERS.OS_KERNEL, canonical: true },
  "memory-service": { layer: LAYERS.OS_KERNEL, canonical: true },
  "trust-governor": { layer: LAYERS.OS_KERNEL, canonical: true },
  "verification-engine": { layer: LAYERS.OS_KERNEL, canonical: true },
  "workflow-engine": { layer: LAYERS.OS_KERNEL, canonical: true },
  "identity-auth": { layer: LAYERS.OS_KERNEL, canonical: true },
  "integration-hub": { layer: LAYERS.OS_KERNEL, canonical: true },
  "launch-readiness": { layer: LAYERS.OS_KERNEL, canonical: true },
  "service-registry": { layer: LAYERS.OS_KERNEL, canonical: true },

  // OS SERVICES — additional orchestration
  "recommendation-execution": { layer: LAYERS.OS_SERVICES, canonical: true },
  "handoff": { layer: LAYERS.OS_SERVICES, canonical: true },
  "projection-service": { layer: LAYERS.OS_SERVICES, canonical: true },
  "flagship-loops": { layer: LAYERS.OS_SERVICES, canonical: true },

  // APP — user-facing service helpers
  "auth": { layer: LAYERS.APP, canonical: true },
  "notification-service": { layer: LAYERS.APP, canonical: true },
  "google-provider-family": { layer: LAYERS.APP, canonical: true },
  "life-simulation": { layer: LAYERS.APP, canonical: true },
  "search-fabric": { layer: LAYERS.OS_SERVICES, canonical: true },
  "fraud-sentinel": { layer: LAYERS.OS_SERVICES, canonical: true },
  "governance-simulator": { layer: LAYERS.OS_SERVICES, canonical: true },
};

// ── Layout → Layer Mapping ──────────────────────────────────────

export const LAYOUT_LAYER_MAP = {
  PublicLayout: LAYERS.WEB,
  ShellLayout: LAYERS.APP, // also serves OS_SERVICES surfaces
  AdminShell: LAYERS.ADMIN_OPERATOR,
  OwnerWorkspaceShell: LAYERS.ADMIN_OPERATOR,
} as const;

// ── Component Directory → Layer Mapping ─────────────────────────

export const COMPONENT_LAYER_MAP: Record<string, Layer> = {
  "src/components/admin": LAYERS.ADMIN_OPERATOR,
  "src/components/sita/admin": LAYERS.ADMIN_OPERATOR,
  "src/components/concierge": LAYERS.APP,
  "src/components/business": LAYERS.APP,
  "src/components/finance": LAYERS.APP,
  "src/components/sita": LAYERS.APP,
  "src/components/ui": LAYERS.APP, // shared primitives
  "src/lib/nova-sdk/kernel": LAYERS.OS_KERNEL,
  "src/lib/nova-sdk": LAYERS.OS_KERNEL,
  "src/lib/sita-kernel.ts": LAYERS.OS_KERNEL,
  "src/lib/core-services": LAYERS.OS_KERNEL,
  "src/lib/services": LAYERS.OS_SERVICES,
  "src/packages/contracts": LAYERS.OS_KERNEL,
};
