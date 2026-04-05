import { supabase } from "@/integrations/supabase/client";

export const SCOPE_LEVELS = ["route", "page", "feature", "component_group", "service", "domain", "workspace", "office"] as const;
export type ScopeLevel = typeof SCOPE_LEVELS[number];

export const LAUNCH_IMPACTS = ["blocking", "degraded", "none"] as const;
export type LaunchImpact = typeof LAUNCH_IMPACTS[number];

export const EVIDENCE_SIGNALS = [
  "route_exists", "shell_exists", "component_renders", "data_source_real",
  "contract_exists", "api_exists", "db_persistence", "mock_imports_none",
  "in_memory_only", "edge_function_present", "real_mutation_path",
  "runtime_evidence", "interaction_verified", "proof_receipt",
  "e2e_coverage", "launch_ready",
] as const;

export interface RealityClassification {
  id: string;
  user_id: string;
  route_path: string;
  feature_name: string;
  domain: string;
  scope_level: ScopeLevel;
  classification: "presentational" | "simulated" | "persisted" | "proven";
  confidence: number;
  evidence_inputs: string[];
  missing_requirements: string[];
  blockers: string[];
  owner: string | null;
  launch_impact: LaunchImpact;
  progression_criteria: Record<string, any>;
  mock_sources: string[];
  backend_target: string | null;
  contract_status: "none" | "partial" | "aligned" | "verified";
  verification_evidence: any[];
  readiness_score: number;
  notes: string | null;
  classified_by: string;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export const PROGRESSION_REQUIREMENTS: Record<string, string[]> = {
  "presentational→simulated": ["component_renders", "shell_exists", "data_source_real"],
  "simulated→persisted": ["db_persistence", "mock_imports_none", "real_mutation_path"],
  "persisted→proven": ["contract_exists", "runtime_evidence", "interaction_verified", "e2e_coverage", "launch_ready"],
};

export async function fetchRealityClassifications(): Promise<RealityClassification[]> {
  const { data, error } = await supabase
    .from("reality_classifications")
    .select("*")
    .order("domain", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RealityClassification[];
}

export async function upsertRealityClassification(
  record: Partial<RealityClassification> & { route_path: string; feature_name: string }
): Promise<RealityClassification> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("reality_classifications")
    .upsert({ ...record, user_id: user.id }, { onConflict: "user_id,route_path" })
    .select()
    .single();
  if (error) throw error;
  return data as RealityClassification;
}

export async function deleteRealityClassification(id: string): Promise<void> {
  const { error } = await supabase.from("reality_classifications").delete().eq("id", id);
  if (error) throw error;
}
