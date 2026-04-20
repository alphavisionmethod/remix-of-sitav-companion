// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Runtime-Tier Mapping
// Parallel registry to feature-tier-registry.ts (which classifies
// architectural reality). This file maps each feature to the
// canonical 4-Tier RUNTIME model.
// ═══════════════════════════════════════════════════════════════

import type { RuntimeTier } from "./runtime-tier-model";

export interface FeatureRuntimeTierMapping {
  featureId: string;
  name: string;
  ownerDomain: string;
  supportedTiers: readonly RuntimeTier[];
  simulatedTiers: readonly RuntimeTier[];
  fallbackTiers: readonly RuntimeTier[];
  prohibitedTiers: readonly RuntimeTier[];
  roadmapTiers: readonly RuntimeTier[];
  fallback: string;
  launchHonesty: "honest" | "needs-disclosure" | "drift-risk";
  notes?: string;
}

const ALL_TIERS = [
  "WEB_APP",
  "DESKTOP_HOST",
  "APPLIANCE_RUNTIME",
  "SIMULATED_OS_EXPERIENCE",
] as const satisfies readonly RuntimeTier[];

export const FEATURE_RUNTIME_TIER_MAPPING: readonly FeatureRuntimeTierMapping[] = [
  // ── Authentication & Identity ────────────────────────────────
  { featureId: "auth-email", name: "Email Authentication", ownerDomain: "auth", supportedTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Sign in with email and password.", launchHonesty: "honest" },
  { featureId: "auth-google", name: "Google OAuth", ownerDomain: "auth", supportedTiers: ["WEB_APP", "DESKTOP_HOST", "APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Sign in with Google.", launchHonesty: "honest" },
  { featureId: "biometric-auth", name: "Biometric / Passkey", ownerDomain: "auth", supportedTiers: [], simulatedTiers: [], fallbackTiers: ["WEB_APP", "DESKTOP_HOST"], prohibitedTiers: ["APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "Use device passkey via WebAuthn.", launchHonesty: "honest" },

  // ── Core Product Features ────────────────────────────────────
  { featureId: "boardroom", name: "Boardroom Decision Engine", ownerDomain: "platform", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open the boardroom.", launchHonesty: "honest" },
  { featureId: "business-os", name: "Business OS Suite", ownerDomain: "business-os", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open Business OS.", launchHonesty: "honest" },
  { featureId: "money-os", name: "Money OS Suite", ownerDomain: "finance-os", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open Money.", launchHonesty: "honest" },
  { featureId: "concierge", name: "Concierge", ownerDomain: "concierge-os", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open Concierge.", launchHonesty: "honest" },
  { featureId: "files", name: "Files", ownerDomain: "files", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open Files.", launchHonesty: "honest" },
  { featureId: "communications", name: "Communications", ownerDomain: "communications", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open Communications.", launchHonesty: "honest" },
  { featureId: "search", name: "Universal Search", ownerDomain: "search", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open search.", launchHonesty: "honest" },
  { featureId: "command-palette", name: "Command Palette", ownerDomain: "platform", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Press ⌘K.", launchHonesty: "honest" },
  { featureId: "approval-flows", name: "Approval Flows", ownerDomain: "governance", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open approvals.", launchHonesty: "honest" },
  { featureId: "proof-receipts", name: "Proof Receipts", ownerDomain: "governance", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Open receipts.", launchHonesty: "honest" },

  // ── Filesystem ───────────────────────────────────────────────
  { featureId: "filesystem-local", name: "Local Filesystem Access", ownerDomain: "files", supportedTiers: ["DESKTOP_HOST", "APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: ["WEB_APP"], prohibitedTiers: [], roadmapTiers: [], fallback: "Use the browser file picker to select files.", launchHonesty: "honest", notes: "Web uses user-mediated picker." },
  { featureId: "file-picker", name: "File Picker", ownerDomain: "files", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Pick from cloud or local.", launchHonesty: "honest" },
  { featureId: "local-backup", name: "Local Backup", ownerDomain: "files", supportedTiers: ["DESKTOP_HOST", "APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: ["WEB_APP"], prohibitedTiers: [], roadmapTiers: [], fallback: "Download/upload your backup file.", launchHonesty: "honest" },

  // ── Notifications ────────────────────────────────────────────
  { featureId: "notifications-push", name: "Push Notifications", ownerDomain: "notifications", supportedTiers: ["WEB_APP", "DESKTOP_HOST"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "Push is browser/desktop only.", launchHonesty: "honest", notes: "VAPID active; FCM planned; APNs deferred." },
  { featureId: "notifications-native", name: "Native OS Notifications", ownerDomain: "notifications", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: [], fallbackTiers: ["WEB_APP"], prohibitedTiers: ["APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "Browser notifications used as fallback.", launchHonesty: "honest" },
  { featureId: "in-app-toast", name: "In-App Toast", ownerDomain: "notifications", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },

  // ── Desktop-only Native ──────────────────────────────────────
  { featureId: "window-control", name: "Window Management", ownerDomain: "shell", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: ["WEB_APP", "APPLIANCE_RUNTIME"], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Window controls available on desktop app.", launchHonesty: "needs-disclosure", notes: "Web simulates a windowed shell — never a real OS window manager." },
  { featureId: "tray-icon", name: "System Tray Icon", ownerDomain: "shell", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["WEB_APP", "APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "Tray is desktop-only.", launchHonesty: "honest" },
  { featureId: "menu-bar", name: "Native Menu Bar", ownerDomain: "shell", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: ["WEB_APP", "APPLIANCE_RUNTIME"], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Menu bar simulated outside desktop.", launchHonesty: "needs-disclosure" },
  { featureId: "auto-update-desktop", name: "Desktop Auto-Update", ownerDomain: "deployment", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["WEB_APP", "APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "Web reloads automatically; appliance uses OTA.", launchHonesty: "honest" },
  { featureId: "crash-reporter-ui", name: "Crash Reporter UI", ownerDomain: "support", supportedTiers: ["DESKTOP_HOST"], simulatedTiers: [], fallbackTiers: ["WEB_APP", "APPLIANCE_RUNTIME"], prohibitedTiers: [], roadmapTiers: [], fallback: "Crash reports collected via in-app channel.", launchHonesty: "honest" },

  // ── Appliance-only ───────────────────────────────────────────
  { featureId: "first-boot-ceremony", name: "First-Boot Ceremony", ownerDomain: "appliance", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: ["WEB_APP", "DESKTOP_HOST"], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "First-boot only runs on appliance images.", launchHonesty: "needs-disclosure" },
  { featureId: "ota-update", name: "OTA Update Agent", ownerDomain: "appliance", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["WEB_APP", "DESKTOP_HOST"], roadmapTiers: [], fallback: "OTA is appliance-only.", launchHonesty: "honest" },
  { featureId: "appliance-recovery", name: "Appliance Recovery", ownerDomain: "appliance", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["WEB_APP", "DESKTOP_HOST"], roadmapTiers: [], fallback: "Recovery is appliance-only.", launchHonesty: "honest" },
  { featureId: "managed-runtime-services", name: "Managed Runtime Services", ownerDomain: "appliance", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Managed services run inside the appliance.", launchHonesty: "honest" },

  // ── Simulated Shell Surfaces ─────────────────────────────────
  { featureId: "desktop-shell", name: "Desktop Shell", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Simulated OS shell.", launchHonesty: "needs-disclosure" },
  { featureId: "dock", name: "Dock", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Dock is simulated UX.", launchHonesty: "honest" },
  { featureId: "lock-screen", name: "Lock Screen", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Lock screen is a UX surface.", launchHonesty: "honest" },
  { featureId: "control-center", name: "Control Center", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "mission-control", name: "Mission Control", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "app-launcher", name: "App Launcher", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "boot-sequence-ux", name: "Boot Sequence (UX)", ownerDomain: "shell", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: ["WEB_APP", "DESKTOP_HOST"], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Boot animation is UX outside appliance.", launchHonesty: "needs-disclosure" },
  { featureId: "ambient-widgets", name: "Ambient Widgets", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "wallpaper", name: "Wallpaper System", ownerDomain: "shell", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },

  // ── Simulated Kernel Layer ───────────────────────────────────
  { featureId: "nova-kernel-runtime", name: "Nova Kernel (Runtime)", ownerDomain: "runtime", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: ["APPLIANCE_RUNTIME"], fallback: "Kernel is an architectural simulation.", launchHonesty: "needs-disclosure", notes: "Kernel stays simulated for experience per architecture memory." },
  { featureId: "nova-filesystem-runtime", name: "Nova Filesystem (Runtime)", ownerDomain: "runtime", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Simulated FS on IndexedDB.", launchHonesty: "needs-disclosure" },
  { featureId: "nova-compositor-runtime", name: "Nova Compositor (Runtime)", ownerDomain: "runtime", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Compositor simulated in React.", launchHonesty: "needs-disclosure" },
  { featureId: "process-model-runtime", name: "Process Lifecycle (Runtime)", ownerDomain: "runtime", supportedTiers: [], simulatedTiers: [...ALL_TIERS], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "trust-zones", name: "Trust Zone Security", ownerDomain: "security", supportedTiers: ["APPLIANCE_RUNTIME"], simulatedTiers: ["WEB_APP", "DESKTOP_HOST"], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "Trust zones simulated outside appliance.", launchHonesty: "needs-disclosure" },

  // ── Mobile / PWA ─────────────────────────────────────────────
  { featureId: "mobile-pwa-install", name: "Install as PWA", ownerDomain: "platform", supportedTiers: ["WEB_APP"], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: ["APPLIANCE_RUNTIME"], roadmapTiers: [], fallback: "PWA install via browser.", launchHonesty: "honest" },
  { featureId: "session-restore", name: "Session Restore", ownerDomain: "platform", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },

  // ── Connectors / Integrations ────────────────────────────────
  { featureId: "connectors", name: "Connectors", ownerDomain: "integrations", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "integration-oauth", name: "OAuth Integrations", ownerDomain: "integrations", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },

  // ── Admin / Operator ─────────────────────────────────────────
  { featureId: "admin-dashboard", name: "Admin Dashboard", ownerDomain: "admin", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
  { featureId: "kill-switches", name: "Emergency Kill Switches", ownerDomain: "admin", supportedTiers: [...ALL_TIERS], simulatedTiers: [], fallbackTiers: [], prohibitedTiers: [], roadmapTiers: [], fallback: "", launchHonesty: "honest" },
] as const;

export function getFeatureRuntimeTier(featureId: string): FeatureRuntimeTierMapping | undefined {
  return FEATURE_RUNTIME_TIER_MAPPING.find((f) => f.featureId === featureId);
}

export function listFeaturesForTier(
  tier: RuntimeTier,
  status: "supported" | "simulated" | "fallback" | "roadmap",
): FeatureRuntimeTierMapping[] {
  const key = (status + "Tiers") as
    | "supportedTiers"
    | "simulatedTiers"
    | "fallbackTiers"
    | "roadmapTiers";
  return FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f[key].includes(tier));
}

export function listFeaturesNeedingDisclosure(): FeatureRuntimeTierMapping[] {
  return FEATURE_RUNTIME_TIER_MAPPING.filter((f) => f.launchHonesty === "needs-disclosure");
}

// ═══════════════════════════════════════════════════════════════
// Canonical resolver — the ONLY supported way for non-React code,
// CI gates, generators, and admin dashboards to determine
// (feature × tier) availability without re-deriving the rules.
// React surfaces should use `useFeatureRuntimeTier()` /
// `useCapability()` from `runtime-context`, which delegate here.
// ═══════════════════════════════════════════════════════════════

import type { TierAvailability } from "./runtime-tier-model";

/** Resolve the availability of a feature on a specific runtime tier. */
export function resolveFeatureTierAvailability(
  featureId: string,
  tier: RuntimeTier,
): TierAvailability {
  const feature = getFeatureRuntimeTier(featureId);
  if (!feature) return "prohibited";
  if (feature.supportedTiers.includes(tier)) return "supported";
  if (feature.simulatedTiers.includes(tier)) return "simulated";
  if (feature.fallbackTiers.includes(tier)) return "fallback";
  if (feature.roadmapTiers.includes(tier)) return "roadmap";
  return "prohibited";
}

/** True if the feature has `supported` status on the given tier. */
export function isFeatureSupportedOn(featureId: string, tier: RuntimeTier): boolean {
  return resolveFeatureTierAvailability(featureId, tier) === "supported";
}

/** True if a registered feature is **not** prohibited on the tier (any
 *  positive status: supported, simulated, fallback, roadmap). */
export function isFeatureAvailableOn(featureId: string, tier: RuntimeTier): boolean {
  return resolveFeatureTierAvailability(featureId, tier) !== "prohibited";
}

/** All registered feature ids. */
export function listRegisteredFeatureIds(): readonly string[] {
  return FEATURE_RUNTIME_TIER_MAPPING.map((f) => f.featureId);
}

export interface FeatureCoverageRow {
  featureId: string;
  name: string;
  ownerDomain: string;
  byTier: Record<RuntimeTier, TierAvailability>;
  launchHonesty: FeatureRuntimeTierMapping["launchHonesty"];
}

/** Materialize the full feature × tier coverage matrix. Used by the
 *  build-time generator (`cross-tier-capability-matrix.generated.ts`)
 *  and by the admin Cross-Tier board. */
export function enumerateFeatureCoverage(): readonly FeatureCoverageRow[] {
  const tiers: readonly RuntimeTier[] = [
    "WEB_APP",
    "DESKTOP_HOST",
    "APPLIANCE_RUNTIME",
    "SIMULATED_OS_EXPERIENCE",
  ];
  return FEATURE_RUNTIME_TIER_MAPPING.map((f) => {
    const byTier = {} as Record<RuntimeTier, TierAvailability>;
    for (const t of tiers) byTier[t] = resolveFeatureTierAvailability(f.featureId, t);
    return {
      featureId: f.featureId,
      name: f.name,
      ownerDomain: f.ownerDomain,
      byTier,
      launchHonesty: f.launchHonesty,
    };
  });
}
