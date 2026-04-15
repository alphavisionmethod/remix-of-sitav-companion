// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Feature Registry
// Registry of features with their runtime requirements
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTarget } from "./runtime-detection";
import type { ProductRealityTier } from "./product-reality-tiers";

export interface RuntimeFeatureEntry {
  featureId: string;
  name: string;
  domain: "platform" | "business" | "finance" | "concierge" | "admin" | "os";
  /** Required capabilities (from capability matrix) */
  requiredCapabilities: string[];
  /** Runtime targets this feature runs on */
  supportedTargets: RuntimeTarget[];
  /** Current reality tier */
  realityTier: ProductRealityTier;
  /** Whether the feature is enabled */
  enabled: boolean;
  /** Minimum trust score required */
  minTrustScore: number;
  /** Whether feature requires authentication */
  requiresAuth: boolean;
}

export const RUNTIME_FEATURES: RuntimeFeatureEntry[] = [
  // ── Platform ──
  { featureId: "auth-flow", name: "Authentication Flow", domain: "platform", requiredCapabilities: ["auth"], supportedTargets: ["browser", "electron", "capacitor", "pwa"], realityTier: "T1", enabled: true, minTrustScore: 0, requiresAuth: false },
  { featureId: "settings-mgmt", name: "Settings Management", domain: "platform", requiredCapabilities: ["auth", "offline-storage"], supportedTargets: ["browser", "electron", "capacitor", "pwa"], realityTier: "T1", enabled: true, minTrustScore: 0.3, requiresAuth: true },

  // ── Business OS ──
  { featureId: "crm-dashboard", name: "CRM Dashboard", domain: "business", requiredCapabilities: ["auth", "realtime-sync"], supportedTargets: ["browser", "electron", "pwa"], realityTier: "T2", enabled: true, minTrustScore: 0.5, requiresAuth: true },
  { featureId: "client-management", name: "Client Management", domain: "business", requiredCapabilities: ["auth", "realtime-sync", "ai-inference"], supportedTargets: ["browser", "electron", "pwa"], realityTier: "T2", enabled: true, minTrustScore: 0.5, requiresAuth: true },

  // ── Finance OS ──
  { featureId: "financial-dashboard", name: "Financial Dashboard", domain: "finance", requiredCapabilities: ["auth", "realtime-sync"], supportedTargets: ["browser", "electron", "pwa"], realityTier: "T2", enabled: true, minTrustScore: 0.6, requiresAuth: true },
  { featureId: "projections", name: "Financial Projections", domain: "finance", requiredCapabilities: ["auth", "ai-inference"], supportedTargets: ["browser", "electron"], realityTier: "T3", enabled: true, minTrustScore: 0.7, requiresAuth: true },

  // ── Concierge OS ──
  { featureId: "scheduling", name: "Smart Scheduling", domain: "concierge", requiredCapabilities: ["auth", "realtime-sync"], supportedTargets: ["browser", "electron", "capacitor", "pwa"], realityTier: "T2", enabled: true, minTrustScore: 0.4, requiresAuth: true },

  // ── Admin ──
  { featureId: "admin-truth-dashboard", name: "Admin Truth Dashboard", domain: "admin", requiredCapabilities: ["auth"], supportedTargets: ["browser", "electron"], realityTier: "T1", enabled: true, minTrustScore: 0.9, requiresAuth: true },

  // ── Boardroom ──
  { featureId: "boardroom-session", name: "Boardroom Session", domain: "platform", requiredCapabilities: ["auth", "ai-inference", "proof-emission"], supportedTargets: ["browser", "electron"], realityTier: "T3", enabled: true, minTrustScore: 0.8, requiresAuth: true },
];

export function getFeature(featureId: string): RuntimeFeatureEntry | undefined {
  return RUNTIME_FEATURES.find((f) => f.featureId === featureId);
}

export function getFeaturesByDomain(domain: RuntimeFeatureEntry["domain"]): RuntimeFeatureEntry[] {
  return RUNTIME_FEATURES.filter((f) => f.domain === domain);
}

export function isFeatureAvailable(featureId: string, target: RuntimeTarget): boolean {
  const feature = getFeature(featureId);
  return feature ? feature.enabled && feature.supportedTargets.includes(target) : false;
}
