// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Launch-Honesty Reclassification Engine
// Evidence-driven reclassification of AI features based on
// runtime verification, receipts, usage, and provider health
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
const db = supabase as any;

export type HonestyClass = "real" | "partial" | "demo_governed" | "internal_only" | "unavailable" | "planned";

export interface ReclassificationEvidence {
  providerHealthy: boolean;
  secretPresent: boolean;
  routingPolicyExists: boolean;
  budgetPolicyExists: boolean;
  runtimeVerified: boolean;
  receiptExists: boolean;
  usageLedgerExists: boolean;
  degradedHandled: boolean;
  successRate30d: number;
  invocationCount30d: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  isUserFacing: boolean;
  isAdminOnly: boolean;
}

export interface ReclassificationResult {
  capabilityKey: string;
  previousClass: HonestyClass;
  recommendedClass: HonestyClass;
  evidence: ReclassificationEvidence;
  reason: string;
  claimRisk: string | null;
  blockingGaps: string[];
}

const TARGET_CAPABILITIES: { key: string; userFacing: boolean; adminOnly: boolean }[] = [
  { key: "advisor.chat.primary", userFacing: true, adminOnly: false },
  { key: "boardroom.weekly.summary", userFacing: true, adminOnly: false },
  { key: "classification.extract", userFacing: false, adminOnly: false },
  { key: "admin.synthesis", userFacing: false, adminOnly: true },
  { key: "admin.ai_workforce.run", userFacing: false, adminOnly: true },
  { key: "utility.extract", userFacing: false, adminOnly: false },
  { key: "daily_pulse.generate", userFacing: true, adminOnly: false },
];

function classify(ev: ReclassificationEvidence): { cls: HonestyClass; reason: string; gaps: string[]; claimRisk: string | null } {
  const gaps: string[] = [];

  if (!ev.secretPresent) gaps.push("API key/secret not configured");
  if (!ev.routingPolicyExists) gaps.push("No routing policy defined");
  if (!ev.providerHealthy) gaps.push("Provider not healthy");
  if (!ev.runtimeVerified) gaps.push("No successful runtime invocation");
  if (!ev.receiptExists) gaps.push("No receipt evidence");
  if (!ev.usageLedgerExists) gaps.push("No usage ledger entries");
  if (!ev.budgetPolicyExists) gaps.push("No budget policy");

  if (!ev.secretPresent || (!ev.providerHealthy && !ev.runtimeVerified)) {
    return { cls: "unavailable", reason: "Missing configuration or provider unavailable", gaps, claimRisk: "Cannot claim any AI functionality" };
  }

  if (ev.invocationCount30d === 0 && !ev.runtimeVerified) {
    return { cls: "planned", reason: "Architecture exists but no runtime invocations recorded", gaps, claimRisk: "Must not claim as functional" };
  }

  if (ev.runtimeVerified && ev.receiptExists && ev.usageLedgerExists && ev.routingPolicyExists && ev.successRate30d >= 0.9 && ev.invocationCount30d >= 3) {
    if (ev.isAdminOnly) {
      return { cls: "internal_only", reason: "Runtime verified but admin/internal only", gaps, claimRisk: null };
    }
    return { cls: "real", reason: "Fully verified: provider healthy, runtime proven, receipts exist, high success rate", gaps, claimRisk: null };
  }

  if (ev.isAdminOnly && ev.runtimeVerified) {
    return { cls: "internal_only", reason: "Works internally but not public-facing", gaps, claimRisk: null };
  }

  if (ev.runtimeVerified || ev.invocationCount30d > 0) {
    const reason = ev.successRate30d < 0.9
      ? `Success rate ${(ev.successRate30d * 100).toFixed(0)}% below threshold`
      : `Missing: ${gaps.slice(0, 2).join(", ")}`;
    return { cls: "partial", reason, gaps, claimRisk: "Must not claim as fully live without qualification" };
  }

  return { cls: "demo_governed", reason: "Polished but not backed by verified runtime", gaps, claimRisk: "UI may imply more than reality" };
}

export async function reclassifyAIFeatures(): Promise<ReclassificationResult[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const capKeys = TARGET_CAPABILITIES.map(c => c.key);

  const [usageRes, honestyRes, routingRes, providerHealthRes] = await Promise.all([
    db.from("ai_usage_ledger").select("capability_key, status, created_at, receipt_id").in("capability_key", capKeys).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }).limit(500),
    db.from("ai_launch_honesty").select("capability_key, launch_honesty_class").in("capability_key", capKeys),
    db.from("ai_capability_routing").select("capability_key, is_active, budget_class").in("capability_key", capKeys),
    db.from("ai_provider_health").select("provider, health_state").order("updated_at", { ascending: false }).limit(20),
  ]);

  const usageRows: any[] = usageRes.data ?? [];
  const honestyRows: any[] = honestyRes.data ?? [];
  const routingRows: any[] = routingRes.data ?? [];
  const healthRows: any[] = providerHealthRes.data ?? [];

  const anyProviderHealthy = healthRows.some((h: any) => h.health_state === "healthy" || h.health_state === "degraded");

  const results: ReclassificationResult[] = [];

  for (const target of TARGET_CAPABILITIES) {
    const rows = usageRows.filter((r: any) => r.capability_key === target.key);
    const successes = rows.filter((r: any) => r.status === "success");
    const failures = rows.filter((r: any) => r.status !== "success");
    const hasReceipt = rows.some((r: any) => r.receipt_id);
    const routing = routingRows.find((r: any) => r.capability_key === target.key);
    const honesty = honestyRows.find((r: any) => r.capability_key === target.key);
    const previousClass = (honesty?.launch_honesty_class as HonestyClass) ?? "planned";

    const evidence: ReclassificationEvidence = {
      providerHealthy: anyProviderHealthy,
      secretPresent: true,
      routingPolicyExists: !!routing?.is_active,
      budgetPolicyExists: !!routing?.budget_class,
      runtimeVerified: successes.length > 0,
      receiptExists: hasReceipt,
      usageLedgerExists: rows.length > 0,
      degradedHandled: failures.length === 0 || successes.length > 0,
      successRate30d: rows.length > 0 ? successes.length / rows.length : 0,
      invocationCount30d: rows.length,
      lastSuccessAt: successes[0]?.created_at ?? null,
      lastFailureAt: failures[0]?.created_at ?? null,
      isUserFacing: target.userFacing,
      isAdminOnly: target.adminOnly,
    };

    const { cls, reason, gaps, claimRisk } = classify(evidence);

    results.push({
      capabilityKey: target.key,
      previousClass,
      recommendedClass: cls,
      evidence,
      reason,
      claimRisk,
      blockingGaps: gaps,
    });
  }

  return results;
}
