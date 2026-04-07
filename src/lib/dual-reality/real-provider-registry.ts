// ═══════════════════════════════════════════════════════════════
// SITA OS — Real Provider Registry
// Tracks activation status of real (live) providers across domains.
// Used by the mode resolution engine to determine provider availability.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export type ProviderCategory =
  | "identity"
  | "connector"
  | "ai_inference"
  | "ai_gateway"
  | "sync"
  | "notification"
  | "storage"
  | "payment"
  | "analytics"
  | "device"
  | "calendar"
  | "email";

export type ActivationState =
  | "active"          // Live, operational
  | "configured"      // Credentials present, not yet verified
  | "degraded"        // Partially working
  | "inactive"        // Not configured
  | "blocked"         // Deliberately blocked
  | "planned";        // Architecture ready, no implementation

export interface RealProviderActivationRecord {
  providerId: string;
  category: ProviderCategory;
  providerName: string;
  activationState: ActivationState;
  requiresSecret: boolean;
  secretConfigured: boolean;
  healthScore: number;          // 0-100
  lastHealthCheck?: string;
  domains: string[];            // Domains this provider serves
  launchHonestyClass: "truthful" | "partial" | "demo_backed" | "unavailable" | "planned";
  notes?: string;
}

// ── Provider Activation Records ─────────────────────────────────

const REAL_PROVIDERS: RealProviderActivationRecord[] = [
  // Identity
  { providerId: "supabase-auth", category: "identity", providerName: "Supabase Auth", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 95, domains: ["auth"], launchHonestyClass: "truthful", notes: "RLS-enforced, session management active" },

  // Storage
  { providerId: "supabase-storage", category: "storage", providerName: "Supabase Storage", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 90, domains: ["files", "documents"], launchHonestyClass: "truthful", notes: "documents bucket configured" },

  // AI
  { providerId: "lovable-ai-gateway", category: "ai_gateway", providerName: "Lovable AI Gateway", activationState: "configured", requiresSecret: true, secretConfigured: true, healthScore: 85, domains: ["ai_gateway", "advisor", "boardroom"], launchHonestyClass: "partial", notes: "LOVABLE_API_KEY present, edge functions deployed" },

  // Connectors
  { providerId: "connector-proxy", category: "connector", providerName: "Connector Proxy", activationState: "degraded", requiresSecret: false, secretConfigured: true, healthScore: 55, domains: ["connectors"], launchHonestyClass: "partial", notes: "Edge function deployed, no live OAuth credentials" },

  // Notifications
  { providerId: "notification-queue", category: "notification", providerName: "Notification Queue", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 70, domains: ["notifications"], launchHonestyClass: "partial", notes: "Dedup trigger active, no push delivery" },

  // Sync
  { providerId: "realtime-sync", category: "sync", providerName: "Supabase Realtime", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 80, domains: ["workspace", "notifications"], launchHonestyClass: "truthful" },

  // Analytics
  { providerId: "internal-analytics", category: "analytics", providerName: "Internal Analytics", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 85, domains: ["analytics"], launchHonestyClass: "partial", notes: "Demo/real segregation active" },

  // Payment
  { providerId: "stripe", category: "payment", providerName: "Stripe", activationState: "planned", requiresSecret: true, secretConfigured: false, healthScore: 0, domains: ["billing", "money"], launchHonestyClass: "planned" },

  // Calendar
  { providerId: "calendar-sync", category: "calendar", providerName: "Calendar Sync", activationState: "planned", requiresSecret: true, secretConfigured: false, healthScore: 0, domains: ["calendar"], launchHonestyClass: "planned" },

  // Device
  { providerId: "device-telemetry", category: "device", providerName: "Device Telemetry", activationState: "active", requiresSecret: false, secretConfigured: true, healthScore: 75, domains: ["devices"], launchHonestyClass: "partial", notes: "Web device detection active" },

  // Email
  { providerId: "email-provider", category: "email", providerName: "Email Provider", activationState: "planned", requiresSecret: true, secretConfigured: false, healthScore: 0, domains: ["notifications", "communications"], launchHonestyClass: "planned" },
];

// ── Registry API ────────────────────────────────────────────────

/**
 * Get all real provider activation records
 */
export function getAllProviders(): RealProviderActivationRecord[] {
  return [...REAL_PROVIDERS];
}

/**
 * Get providers by category
 */
export function getProvidersByCategory(category: ProviderCategory): RealProviderActivationRecord[] {
  return REAL_PROVIDERS.filter(p => p.category === category);
}

/**
 * Get providers serving a specific domain
 */
export function getProvidersForDomain(domain: string): RealProviderActivationRecord[] {
  return REAL_PROVIDERS.filter(p => p.domains.includes(domain));
}

/**
 * Get a specific provider by ID
 */
export function getProvider(providerId: string): RealProviderActivationRecord | undefined {
  return REAL_PROVIDERS.find(p => p.providerId === providerId);
}

/**
 * Check if a domain has any active real providers
 */
export function domainHasActiveProvider(domain: string): boolean {
  return REAL_PROVIDERS.some(p => p.domains.includes(domain) && (p.activationState === "active" || p.activationState === "configured"));
}

/**
 * Get the aggregate health for a domain based on its providers
 */
export function getDomainProviderHealth(domain: string): {
  hasProvider: boolean;
  bestState: ActivationState;
  avgHealth: number;
  launchHonestyClass: string;
} {
  const providers = getProvidersForDomain(domain);
  if (providers.length === 0) {
    return { hasProvider: false, bestState: "planned", avgHealth: 0, launchHonestyClass: "planned" };
  }

  const stateRank: Record<ActivationState, number> = { active: 5, configured: 4, degraded: 3, inactive: 2, blocked: 1, planned: 0 };
  const best = providers.reduce((a, b) => stateRank[a.activationState] > stateRank[b.activationState] ? a : b);
  const avgHealth = Math.round(providers.reduce((s, p) => s + p.healthScore, 0) / providers.length);

  return {
    hasProvider: true,
    bestState: best.activationState,
    avgHealth,
    launchHonestyClass: best.launchHonestyClass,
  };
}

/**
 * Get summary stats for all providers
 */
export function getProviderSummary(): {
  total: number;
  active: number;
  configured: number;
  degraded: number;
  planned: number;
  avgHealth: number;
} {
  const active = REAL_PROVIDERS.filter(p => p.activationState === "active").length;
  const configured = REAL_PROVIDERS.filter(p => p.activationState === "configured").length;
  const degraded = REAL_PROVIDERS.filter(p => p.activationState === "degraded").length;
  const planned = REAL_PROVIDERS.filter(p => p.activationState === "planned").length;
  const avgHealth = Math.round(REAL_PROVIDERS.reduce((s, p) => s + p.healthScore, 0) / REAL_PROVIDERS.length);

  return { total: REAL_PROVIDERS.length, active, configured, degraded, planned, avgHealth };
}

/**
 * Persist provider activation to DB for audit trail
 */
export async function persistProviderActivation(providerId: string, state: ActivationState): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "provider_activation_change",
    category: "provider",
    actor: "system",
    target_type: "provider",
    target_id: providerId,
    severity: "medium",
    details: { providerId, newState: state, timestamp: new Date().toISOString() },
  });
}
