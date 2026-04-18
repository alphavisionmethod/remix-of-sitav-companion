// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Tier Registry
// Every major feature classified by implementation tier
// ═══════════════════════════════════════════════════════════════

import type { ProductRealityTier } from "./product-reality-tiers";

export interface FeatureTierEntry {
  featureId: string;
  name: string;
  domain: string;
  tier: ProductRealityTier;
  description: string;
  codeLocation: string;
  launchReady: boolean;
}

export const FEATURE_TIER_REGISTRY: readonly FeatureTierEntry[] = [
  // ── Production Features ────────────────────────────────────
  { featureId: "auth-email", name: "Email Authentication", domain: "auth", tier: "production", description: "Email/password signup and login via Supabase Auth", codeLocation: "src/pages/Auth.tsx", launchReady: true },
  { featureId: "auth-google", name: "Google OAuth", domain: "auth", tier: "production", description: "Google OAuth social login", codeLocation: "src/pages/Auth.tsx", launchReady: true },
  { featureId: "data-persistence", name: "Cloud Data Persistence", domain: "platform", tier: "production", description: "Supabase-backed data storage with RLS", codeLocation: "src/integrations/supabase/", launchReady: true },
  { featureId: "admin-dashboard", name: "Admin Dashboard", domain: "admin", tier: "production", description: "Administrative control plane", codeLocation: "src/pages/admin/", launchReady: true },
  { featureId: "advisor-system", name: "Advisor Council System", domain: "ai-workforce", tier: "production", description: "AI advisor agents with recommendations", codeLocation: "src/lib/advisor/", launchReady: true },
  { featureId: "boardroom", name: "Boardroom Decision Engine", domain: "platform", tier: "production", description: "Strategic decision chamber with evidence and recommendations", codeLocation: "src/lib/boardroom/", launchReady: true },
  { featureId: "crm-hub", name: "CRM Integration Hub", domain: "business-os", tier: "production", description: "Customer relationship management with CSV import", codeLocation: "src/components/crm/", launchReady: true },
  { featureId: "connector-framework", name: "Connector Framework", domain: "integrations", tier: "production", description: "OAuth-based connector system for external services", codeLocation: "src/lib/connectors/", launchReady: true },

  // ── Prototype Features ─────────────────────────────────────
  { featureId: "desktop-app", name: "Electron Desktop App", domain: "runtime", tier: "prototype", description: "Desktop application with native capabilities", codeLocation: "electron/", launchReady: false },
  { featureId: "appliance-deploy", name: "Appliance Deployment", domain: "deployment", tier: "prototype", description: "ISO/OVA appliance for self-hosted deployment", codeLocation: "scripts/build-iso.sh", launchReady: false },

  // ── Simulated Features ─────────────────────────────────────
  { featureId: "nova-kernel", name: "Nova OS Kernel", domain: "runtime", tier: "simulated", description: "Simulated kernel with scheduler, memory, syscalls", codeLocation: "src/lib/nova-sdk/kernel/", launchReady: false },
  { featureId: "nova-filesystem", name: "Nova Filesystem", domain: "runtime", tier: "simulated", description: "B-tree filesystem simulated on IndexedDB", codeLocation: "src/lib/nova-sdk/kernel/fs/", launchReady: false },
  { featureId: "nova-compositor", name: "Window Compositor", domain: "runtime", tier: "simulated", description: "Layer-based window compositor simulated in React", codeLocation: "src/lib/nova-sdk/rendering/", launchReady: false },
  { featureId: "boot-sequence", name: "Boot Ceremony", domain: "runtime", tier: "simulated", description: "4-phase OS boot sequence as app initialization", codeLocation: "src/lib/nova-sdk/kernel/boot/", launchReady: false },
  { featureId: "process-model", name: "Process Lifecycle", domain: "runtime", tier: "simulated", description: "Process states and lifecycle management", codeLocation: "src/lib/nova-sdk/", launchReady: false },
  { featureId: "security-zones", name: "Trust Zone Security", domain: "security", tier: "simulated", description: "7 trust zones simulated via capability checks", codeLocation: "src/lib/nova-sdk/kernel/security/", launchReady: false },

  // ── Spec Only ──────────────────────────────────────────────
  { featureId: "gpu-compositor", name: "GPU Rasterizer", domain: "runtime", tier: "spec-only", description: "GPU-based compositor specification", codeLocation: "infra/docs/COMPOSITOR_RASTERIZER_SPEC.md", launchReady: false },
  { featureId: "hardware-attestation", name: "Hardware Attestation", domain: "security", tier: "spec-only", description: "TPM-backed trust attestation", codeLocation: "src/packages/contracts/native/electron-ipc.ts", launchReady: false },
] as const;

export function getFeaturesByTier(tier: ProductRealityTier): FeatureTierEntry[] {
  return FEATURE_TIER_REGISTRY.filter((f) => f.tier === tier);
}

export function getLaunchReadyFeatures(): FeatureTierEntry[] {
  return FEATURE_TIER_REGISTRY.filter((f) => f.launchReady);
}

export function getFeaturesByDomain(domain: string): FeatureTierEntry[] {
  return FEATURE_TIER_REGISTRY.filter((f) => f.domain === domain);
}
