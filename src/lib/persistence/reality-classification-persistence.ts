import { supabase } from "@/integrations/supabase/client";

export interface RealityClassification {
  id: string;
  user_id: string;
  route_path: string;
  feature_name: string;
  domain: string;
  classification: "presentational" | "simulated" | "persisted" | "proven";
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
