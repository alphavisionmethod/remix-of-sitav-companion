import { supabase } from "@/integrations/supabase/client";

export interface MockReplacement {
  id: string;
  user_id: string;
  feature_name: string;
  page_path: string;
  mock_source: string;
  mock_type: "hardcoded" | "local_array" | "localstorage" | "in_memory_engine" | "pure_function" | "demo_flow";
  real_backend_target: string | null;
  expected_contract: string | null;
  migration_status: "identified" | "planned" | "in_progress" | "blocked" | "completed" | "validated";
  migration_owner: string | null;
  migration_priority: "critical" | "high" | "medium" | "low";
  blockers: string[];
  validation_evidence: any[];
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMockReplacements(): Promise<MockReplacement[]> {
  const { data, error } = await supabase
    .from("mock_replacements")
    .select("*")
    .order("migration_priority", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MockReplacement[];
}

export async function upsertMockReplacement(
  record: Partial<MockReplacement> & { feature_name: string; page_path: string; mock_source: string }
): Promise<MockReplacement> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload = { ...record, user_id: user.id };
  const { data, error } = await supabase
    .from("mock_replacements")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as MockReplacement;
}

export async function updateMockReplacementStatus(
  id: string,
  status: MockReplacement["migration_status"]
): Promise<void> {
  const updates: any = { migration_status: status };
  if (status === "completed" || status === "validated") updates.done_at = new Date().toISOString();
  const { error } = await supabase.from("mock_replacements").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteMockReplacement(id: string): Promise<void> {
  const { error } = await supabase.from("mock_replacements").delete().eq("id", id);
  if (error) throw error;
}
