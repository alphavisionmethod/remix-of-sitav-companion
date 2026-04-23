// ═══════════════════════════════════════════════════════════════
// SITA OS — Auto-Seed: Populates reality_classifications and
// mock_replacements from the detection engine's audit registry.
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { ROUTE_CLASSIFICATION_SEEDS, REPLACEMENT_SEEDS } from "@/lib/detection/reality-detection-engine";

export async function autoSeedClassifications(): Promise<{ seeded: number; skipped: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { seeded: 0, skipped: 0 };

  const { data: existing } = await fromTable("reality_classifications").select("route_path").eq("user_id", user.id);
  const existingPaths = new Set((existing ?? []).map((e: any) => e.route_path));

  let seeded = 0;
  let skipped = 0;

  for (const seed of ROUTE_CLASSIFICATION_SEEDS) {
    if (existingPaths.has(seed.routePath)) { skipped++; continue; }

    const { error } = await fromTable("reality_classifications").insert({
      user_id: user.id,
      route_path: seed.routePath,
      feature_name: seed.featureName,
      domain: seed.domain,
      scope_level: "feature",
      classification: seed.classification,
      confidence: seed.confidence,
      evidence_inputs: seed.evidenceInputs,
      missing_requirements: [],
      blockers: [],
      launch_impact: seed.launchImpact,
      mock_sources: seed.sources,
      backend_target: seed.backendTarget,
      contract_status: seed.backendTarget ? "partial" : "none",
      readiness_score: seed.classification === "proven" ? 95 : seed.classification === "persisted" ? 60 : seed.classification === "simulated" ? 30 : 10,
      classified_by: "auto-seed",
      verification_evidence: [],
      progression_criteria: {},
      notes: "Auto-seeded by Reality Detection Engine",
    });

    if (!error) seeded++;
  }

  return { seeded, skipped };
}

export async function autoSeedMockReplacements(): Promise<{ seeded: number; skipped: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { seeded: 0, skipped: 0 };

  const { data: existing } = await fromTable("mock_replacements").select("feature_name, page_path").eq("user_id", user.id);
  const existingKeys = new Set((existing ?? []).map((e: any) => `${e.feature_name}::${e.page_path}`));

  let seeded = 0;
  let skipped = 0;

  for (const seed of REPLACEMENT_SEEDS) {
    const key = `${seed.featureName}::${seed.pagePath}`;
    if (existingKeys.has(key)) { skipped++; continue; }

    const { error } = await fromTable("mock_replacements").insert({
      user_id: user.id,
      feature_name: seed.featureName,
      page_path: seed.pagePath,
      mock_source: seed.source,
      mock_type: seed.type,
      real_backend_target: seed.realBackendTarget,
      migration_priority: seed.migrationPriority,
      migration_status: "identified",
      sequence_order: seed.sequenceOrder,
      blockers: [],
      validation_evidence: [],
      runtime_evidence: [],
      dependencies: [],
    });

    if (!error) seeded++;
  }

  return { seeded, skipped };
}

export async function autoSeedAll() {
  const [classifications, replacements] = await Promise.all([
    autoSeedClassifications(),
    autoSeedMockReplacements(),
  ]);
  return { classifications, replacements };
}
