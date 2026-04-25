// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8 Federation Service
// Wraps workspace_federations + workspace_federation_grants tables
// and the federate_memories RPC for explicit cross-workspace sharing.
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export type FederationStatus = "active" | "revoked" | "expired";
export type FederationSensitivity = "public" | "internal" | "confidential" | "restricted";

export interface WorkspaceFederationRow {
  id: string;
  user_id: string;
  source_workspace_id: string;
  target_workspace_id: string;
  status: FederationStatus;
  scope_chunks: boolean;
  scope_memories: boolean;
  scope_voice: boolean;
  max_sensitivity: FederationSensitivity;
  rationale: string;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  updated_at: string;
}

export interface FederationOverviewRow {
  federation_id: string | null;
  user_id: string | null;
  source_workspace_id: string | null;
  target_workspace_id: string | null;
  status: string | null;
  scope_chunks: boolean | null;
  scope_memories: boolean | null;
  scope_voice: boolean | null;
  max_sensitivity: string | null;
  active_grants: number | null;
  chunk_grants: number | null;
  memory_grants: number | null;
  last_grant_at: string | null;
  created_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

export interface CreateFederationInput {
  sourceWorkspaceId: string;
  targetWorkspaceId: string;
  scopeChunks?: boolean;
  scopeMemories?: boolean;
  scopeVoice?: boolean;
  maxSensitivity?: FederationSensitivity;
  rationale: string;
  expiresAt?: string | null;
}

export async function listFederationOverview(): Promise<FederationOverviewRow[]> {
  const sb = supabase as unknown as {
    from: (t: string) => {
      select: (q: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: FederationOverviewRow[] | null; error: unknown }>;
      };
    };
  };
  const { data, error } = await sb
    .from("workspace_federation_overview")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FederationOverviewRow[];
}

export async function createFederation(input: CreateFederationInput): Promise<WorkspaceFederationRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("auth_required");
  const payload = {
    user_id: user.id,
    source_workspace_id: input.sourceWorkspaceId,
    target_workspace_id: input.targetWorkspaceId,
    scope_chunks: input.scopeChunks ?? true,
    scope_memories: input.scopeMemories ?? true,
    scope_voice: input.scopeVoice ?? false,
    max_sensitivity: input.maxSensitivity ?? "internal",
    rationale: input.rationale,
    ...(input.expiresAt ? { expires_at: input.expiresAt } : {}),
  };
  const sb = supabase as unknown as {
    from: (t: string) => {
      insert: (p: unknown) => {
        select: () => { single: () => Promise<{ data: WorkspaceFederationRow | null; error: unknown }> };
      };
    };
  };
  const { data, error } = await sb.from("workspace_federations").insert(payload).select().single();
  if (error) throw error;
  if (!data) throw new Error("create_federation_failed");
  return data;
}

export async function revokeFederation(federationId: string): Promise<void> {
  const sb = supabase as unknown as {
    from: (t: string) => {
      update: (p: unknown) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
    };
  };
  const { error } = await sb
    .from("workspace_federations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", federationId);
  if (error) throw error;
}

export interface FederateMemoriesResult {
  memory_id: string;
  granted: boolean;
}

export async function federateMemories(
  federationId: string,
  memoryIds: string[],
): Promise<FederateMemoriesResult[]> {
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    args: { _federation_id: string; _memory_ids: string[] },
  ) => Promise<{ data: FederateMemoriesResult[] | null; error: unknown }>)(
    "federate_memories",
    { _federation_id: federationId, _memory_ids: memoryIds },
  );
  if (error) throw error;
  return (data ?? []) as FederateMemoriesResult[];
}