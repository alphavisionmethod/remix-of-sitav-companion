import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMockReplacements,
  upsertMockReplacement,
  updateMockReplacementStatus,
  deleteMockReplacement,
  type MockReplacement,
} from "@/lib/persistence/mock-replacement-persistence";
import { toast } from "sonner";

const KEY = ["mock-replacements"];

export function useMockReplacements() {
  return useQuery({ queryKey: KEY, queryFn: fetchMockReplacements });
}

export function useUpsertMockReplacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertMockReplacement,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Mock replacement saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMockStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MockReplacement["migration_status"] }) =>
      updateMockReplacementStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMockReplacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMockReplacement,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMockReplacementStats(data?: MockReplacement[]) {
  if (!data) return { identified: 0, planned: 0, in_progress: 0, blocked: 0, completed: 0, validated: 0, total: 0, completionRate: 0 };
  const counts = { identified: 0, planned: 0, in_progress: 0, blocked: 0, completed: 0, validated: 0 };
  data.forEach((d) => { counts[d.migration_status]++; });
  const total = data.length;
  const done = counts.completed + counts.validated;
  return { ...counts, total, completionRate: total ? Math.round((done / total) * 100) : 0 };
}
