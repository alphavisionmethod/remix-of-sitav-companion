// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Registry Persistence
// Connects in-memory feature governance to Supabase tables
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import type { FeatureMetadata } from "@/packages/feature-governance";

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function persistFeatureRegistration(meta: FeatureMetadata): Promise<boolean> {
  const userId = await uid();
  if (!userId) return false;

  const { error } = await fromDynamicTable("feature_intake_records").upsert({
    user_id: userId,
    feature_id: meta.featureId,
    feature_name: meta.name,
    feature_type: meta.type,
    primary_owner: meta.primaryOwner,
    domain_alignment: meta.domainAlignment,
    risk_tier: meta.riskTier,
    autonomy_tier: meta.autonomyTier,
    launch_status: meta.launchStatus,
    implementation_status: meta.implementationStatus,
    rollout_status: meta.rolloutStatus,
    kill_switch_class: meta.killSwitchClass,
    support_owner: meta.supportOwner,
    product_owner: meta.productOwner,
    engineering_owner: meta.engineeringOwner,
    capability_ids: meta.capabilityIds,
    surface_ids: meta.surfaceIds,
    data_sensitivity_tier: meta.dataSensitivityTier,
  }, { onConflict: "feature_id" });

  if (error) {
    console.error("[fip-registry] persist:", error);
    return false;
  }
  return true;
}

export async function loadPersistedFeatures(): Promise<FeatureMetadata[]> {
  const userId = await uid();
  if (!userId) return [];

  const { data, error } = await fromDynamicTable("feature_intake_records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("[fip-registry] load:", error);
    return [];
  }

  return data.map((r: Record<string, unknown>) => ({
    featureId: r.feature_id as string,
    name: r.feature_name as string,
    type: (r.feature_type as string[]) || [],
    primaryOwner: r.primary_owner as string,
    secondaryOwners: [],
    capabilityIds: (r.capability_ids as string[]) || [],
    surfaceIds: (r.surface_ids as string[]) || [],
    domainAlignment: r.domain_alignment as string,
    riskTier: r.risk_tier as string,
    autonomyTier: r.autonomy_tier as string,
    dataSensitivityTier: r.data_sensitivity_tier as string || "internal",
    launchStatus: r.launch_status as string,
    implementationStatus: r.implementation_status as string,
    rolloutStatus: r.rollout_status as string,
    killSwitchClass: r.kill_switch_class as string || "graceful",
    supportOwner: r.support_owner as string || "platform-team",
    productOwner: r.product_owner as string || "founder",
    engineeringOwner: r.engineering_owner as string || "platform-team",
  })) as FeatureMetadata[];
}

// ── Seed existing platform features ─────────────────────────

export const PLATFORM_SEED_FEATURES: FeatureMetadata[] = [
  { featureId: "money-office", name: "Money Office", type: ["governed-workflow"], primaryOwner: "finance-os", secondaryOwners: ["brain-core"], capabilityIds: ["observe.finance", "recommend.bills", "execute.payments"], surfaceIds: ["/money"], domainAlignment: "finance", riskTier: "R3", autonomyTier: "approval-ready", dataSensitivityTier: "confidential", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "business-os", name: "Business OS", type: ["governed-workflow"], primaryOwner: "business-os", secondaryOwners: ["brain-core"], capabilityIds: ["observe.business", "recommend.leads", "draft.invoices"], surfaceIds: ["/business"], domainAlignment: "business", riskTier: "R2", autonomyTier: "recommend", dataSensitivityTier: "confidential", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "concierge-os", name: "Concierge OS", type: ["governed-workflow"], primaryOwner: "concierge-os", secondaryOwners: ["brain-core"], capabilityIds: ["observe.household", "recommend.tasks", "draft.travel"], surfaceIds: ["/concierge"], domainAlignment: "concierge", riskTier: "R1", autonomyTier: "recommend", dataSensitivityTier: "internal", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "daily-pulse", name: "Daily Pulse", type: ["boardroom"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["boardroom-compose.daily", "summarize.cross-domain"], surfaceIds: ["/"], domainAlignment: "cross-domain", riskTier: "R0", autonomyTier: "observe", dataSensitivityTier: "internal", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "instant", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "advisor-council", name: "Advisor Council", type: ["advisor-runtime"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["recommend.advisor", "draft.advisor", "classify.intent"], surfaceIds: ["/advisors"], domainAlignment: "cross-domain", riskTier: "R1", autonomyTier: "recommend", dataSensitivityTier: "confidential", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "proof-center", name: "Proof Center", type: ["support-diagnostics"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["verify.receipts", "observe.proof"], surfaceIds: ["/proof"], domainAlignment: "cross-domain", riskTier: "R0", autonomyTier: "observe", dataSensitivityTier: "internal", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "instant", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "boardroom", name: "Boardroom", type: ["boardroom"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["boardroom-compose.weekly", "projection-build.finance", "summarize.cross-domain"], surfaceIds: ["/boardroom"], domainAlignment: "cross-domain", riskTier: "R0", autonomyTier: "observe", dataSensitivityTier: "internal", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "instant", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "mission-control", name: "Mission Control (Admin)", type: ["support-diagnostics", "analytics-reporting"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["observe.system", "support-diagnose.platform"], surfaceIds: ["/admin"], domainAlignment: "system", riskTier: "R1", autonomyTier: "observe", dataSensitivityTier: "restricted", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "full", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "lead-management", name: "Lead Management", type: ["governed-workflow"], primaryOwner: "business-os", secondaryOwners: [], capabilityIds: ["observe.leads", "classify.leads", "recommend.leads"], surfaceIds: ["/business/leads"], domainAlignment: "business", riskTier: "R1", autonomyTier: "recommend", dataSensitivityTier: "confidential", launchStatus: "beta", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "invoice-collections", name: "Invoice & Collections", type: ["governed-workflow", "connector"], primaryOwner: "business-os", secondaryOwners: ["finance-os"], capabilityIds: ["execute.invoices", "notify.collections", "observe.revenue"], surfaceIds: ["/business/invoices", "/business/collections"], domainAlignment: "business", riskTier: "R3", autonomyTier: "approval-ready", dataSensitivityTier: "confidential", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "bill-management", name: "Bill Management", type: ["governed-workflow"], primaryOwner: "finance-os", secondaryOwners: [], capabilityIds: ["observe.bills", "recommend.bills", "execute.payments"], surfaceIds: ["/money/bills"], domainAlignment: "finance", riskTier: "R3", autonomyTier: "approval-ready", dataSensitivityTier: "confidential", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "subscription-waste", name: "Subscription Waste Detection", type: ["analytics-reporting", "simulation"], primaryOwner: "finance-os", secondaryOwners: [], capabilityIds: ["observe.subscriptions", "classify.waste", "recommend.cancel"], surfaceIds: ["/money/subscriptions"], domainAlignment: "finance", riskTier: "R1", autonomyTier: "recommend", dataSensitivityTier: "confidential", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "instant", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "household-ops", name: "Household Operations", type: ["governed-workflow"], primaryOwner: "concierge-os", secondaryOwners: [], capabilityIds: ["observe.household", "recommend.tasks", "notify.tasks"], surfaceIds: ["/concierge/tasks"], domainAlignment: "concierge", riskTier: "R0", autonomyTier: "recommend", dataSensitivityTier: "internal", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "travel-planning", name: "Travel Planning", type: ["governed-workflow"], primaryOwner: "concierge-os", secondaryOwners: [], capabilityIds: ["draft.travel", "recommend.travel", "observe.travel"], surfaceIds: ["/concierge/travel"], domainAlignment: "concierge", riskTier: "R1", autonomyTier: "draft", dataSensitivityTier: "internal", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
  { featureId: "file-ingestion", name: "File Ingestion & Search", type: ["memory", "graph-identity"], primaryOwner: "brain-core", secondaryOwners: [], capabilityIds: ["observe.files", "classify.documents", "pack-install.files"], surfaceIds: ["/files"], domainAlignment: "cross-domain", riskTier: "R1", autonomyTier: "draft", dataSensitivityTier: "confidential", launchStatus: "alpha", implementationStatus: "in-progress", rolloutStatus: "canary", killSwitchClass: "graceful", supportOwner: "platform-team", productOwner: "founder", engineeringOwner: "platform-team" },
];

export async function seedPlatformFeatures(): Promise<{ seeded: number; errors: number }> {
  let seeded = 0, errors = 0;
  for (const feature of PLATFORM_SEED_FEATURES) {
    const ok = await persistFeatureRegistration(feature);
    if (ok) seeded++; else errors++;
  }
  return { seeded, errors };
}
