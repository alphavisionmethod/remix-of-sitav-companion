// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5 Knowledge Service
// Reads knowledge_chunks; triggers reindex via knowledge-indexer
// edge function (authority-gated by shared.knowledge.reindex).
// ═══════════════════════════════════════════════════════════════
import { supabase } from "@/integrations/supabase/client";

export type EmbeddingStatus = "pending" | "embedded" | "failed" | "skipped";
export type IngestionStage =
  | "queued" | "extracting" | "classifying"
  | "chunking" | "embedding" | "indexed" | "failed";

export interface KnowledgeChunkRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  module_id: string | null;
  pillar: string;
  file_id: string;
  source_table: "pb_files" | "file_metadata";
  chunk_index: number;
  content: string;
  token_estimate: number;
  sensitivity: string;
  embedding_status: EmbeddingStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IngestionJobRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  source_kind: string;
  source_id: string | null;
  source_table: string | null;
  stage: IngestionStage;
  progress: number;
  error: string | null;
  correlation_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export async function fetchChunksForFile(
  fileId: string,
  sourceTable: "pb_files" | "file_metadata" = "pb_files",
): Promise<KnowledgeChunkRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any)
    .from("knowledge_chunks")
    .select("*")
    .eq("user_id", user.id)
    .eq("file_id", fileId)
    .eq("source_table", sourceTable)
    .order("chunk_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as KnowledgeChunkRow[];
}

export async function searchChunks(
  query: string,
  workspaceId: string | null,
  limit = 10,
): Promise<KnowledgeChunkRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let q = (supabase as any)
    .from("knowledge_chunks")
    .select("*")
    .eq("user_id", user.id)
    .textSearch("content_search", query, { type: "websearch", config: "english" })
    .limit(limit);
  if (workspaceId) q = q.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as KnowledgeChunkRow[];
}

export async function listRecentIngestionJobs(limit = 25): Promise<IngestionJobRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await (supabase as any)
    .from("ingestion_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as IngestionJobRow[];
}

export interface ReindexInput {
  fileId: string;
  sourceTable?: "pb_files" | "file_metadata";
  workspaceId?: string | null;
  moduleId?: string | null;
  pillar?: string;
  force?: boolean;
}

export async function reindexFile(input: ReindexInput): Promise<{
  ok: boolean; job_id: string; chunks?: number; error?: string;
}> {
  const { data, error } = await supabase.functions.invoke("knowledge-indexer", {
    body: {
      file_id: input.fileId,
      source_table: input.sourceTable ?? "pb_files",
      workspace_id: input.workspaceId ?? null,
      module_id: input.moduleId ?? null,
      pillar: input.pillar ?? "shared",
      force: input.force ?? false,
    },
  });
  if (error) throw new Error(error.message ?? "Reindex failed");
  return data as { ok: boolean; job_id: string; chunks?: number; error?: string };
}