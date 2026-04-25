// React Query hooks for the Phase 5 knowledge spine.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEffectiveWorkspaceMemories,
  fetchPendingMemoryReviews,
  resolveMemoryReview,
  type EffectiveMemoryRow,
  type PendingMemoryReview,
} from "./memory-service";
import {
  fetchChunksForFile,
  listRecentIngestionJobs,
  reindexFile,
  searchChunks,
  type KnowledgeChunkRow,
  type IngestionJobRow,
  type ReindexInput,
} from "./knowledge-service";

export const KNOWLEDGE_QUERY_KEYS = {
  effectiveMemories: (ws: string | null, n: number) => ["knowledge", "memories", "effective", ws, n] as const,
  pendingReviews: () => ["knowledge", "memories", "pending"] as const,
  fileChunks: (fileId: string, table: string) => ["knowledge", "chunks", fileId, table] as const,
  jobs: () => ["knowledge", "ingestion-jobs"] as const,
  search: (q: string, ws: string | null) => ["knowledge", "search", q, ws] as const,
};

export function useEffectiveWorkspaceMemories(workspaceId: string | null, maxN = 25) {
  return useQuery<EffectiveMemoryRow[]>({
    queryKey: KNOWLEDGE_QUERY_KEYS.effectiveMemories(workspaceId, maxN),
    queryFn: () => fetchEffectiveWorkspaceMemories(workspaceId, maxN),
    staleTime: 30_000,
  });
}

export function usePendingMemoryReviews() {
  return useQuery<PendingMemoryReview[]>({
    queryKey: KNOWLEDGE_QUERY_KEYS.pendingReviews(),
    queryFn: fetchPendingMemoryReviews,
    staleTime: 15_000,
  });
}

export function useResolveMemoryReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memoryId, decision }: { memoryId: string; decision: "accepted" | "rejected" }) =>
      resolveMemoryReview(memoryId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.pendingReviews() });
    },
  });
}

export function useFileChunks(fileId: string | null, sourceTable: "pb_files" | "file_metadata" = "pb_files") {
  return useQuery<KnowledgeChunkRow[]>({
    queryKey: KNOWLEDGE_QUERY_KEYS.fileChunks(fileId ?? "", sourceTable),
    queryFn: () => (fileId ? fetchChunksForFile(fileId, sourceTable) : Promise.resolve([])),
    enabled: !!fileId,
  });
}

export function useIngestionJobs() {
  return useQuery<IngestionJobRow[]>({
    queryKey: KNOWLEDGE_QUERY_KEYS.jobs(),
    queryFn: () => listRecentIngestionJobs(25),
    refetchInterval: (q) => {
      const data = q.state.data;
      if (!data || data.length === 0) return 8_000;
      return data.some((j) => j.stage !== "indexed" && j.stage !== "failed") ? 3_000 : 15_000;
    },
  });
}

export function useReindexFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReindexInput) => reindexFile(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: KNOWLEDGE_QUERY_KEYS.jobs() });
      qc.invalidateQueries({
        queryKey: KNOWLEDGE_QUERY_KEYS.fileChunks(vars.fileId, vars.sourceTable ?? "pb_files"),
      });
    },
  });
}

export function useChunkSearch(query: string, workspaceId: string | null) {
  return useQuery<KnowledgeChunkRow[]>({
    queryKey: KNOWLEDGE_QUERY_KEYS.search(query, workspaceId),
    queryFn: () => searchChunks(query, workspaceId, 20),
    enabled: query.trim().length > 2,
    staleTime: 10_000,
  });
}