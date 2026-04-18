import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRealityClassifications,
  upsertRealityClassification,
  deleteRealityClassification,
  type RealityClassification,
} from "@/data/persistence/reality-classification-persistence";
import { toast } from "sonner";

const KEY = ["reality-classifications"];

export function useRealityClassifications() {
  return useQuery({ queryKey: KEY, queryFn: fetchRealityClassifications });
}

export function useUpsertClassification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertRealityClassification,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Classification saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteClassification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRealityClassification,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success("Classification removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useClassificationStats(data?: RealityClassification[]) {
  if (!data) return { presentational: 0, simulated: 0, persisted: 0, proven: 0, total: 0, readiness: 0 };
  const counts = { presentational: 0, simulated: 0, persisted: 0, proven: 0 };
  data.forEach((d) => { counts[d.classification]++; });
  const total = data.length;
  const readiness = total ? Math.round((counts.proven / total) * 100) : 0;
  return { ...counts, total, readiness };
}
