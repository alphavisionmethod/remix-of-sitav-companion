// React Query hooks for the app-platform ingestion pipeline
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ingestionService } from "@/lib/services/app-ingestion/ingestion.service";

export function useIngestWebApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => ingestionService.ingestWeb(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-catalog"] }),
  });
}

export function useIngestPwa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (manifestUrl: string) => ingestionService.ingestPwa(manifestUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-catalog"] }),
  });
}

export function useCaptureScreenshot() {
  return useMutation({
    mutationFn: (args: { url: string; appId?: string }) =>
      ingestionService.captureScreenshot(args.url, args.appId),
  });
}

export function useIngestionJob(jobId: string | null) {
  return useQuery({
    queryKey: ["app-ingestion-job", jobId],
    queryFn: () => (jobId ? ingestionService.getJob(jobId) : Promise.resolve(null)),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      return data.status === "running" || data.status === "pending" ? 2000 : false;
    },
  });
}

export function useVerifyPackage() {
  return useMutation({
    mutationFn: (packageId: string) => ingestionService.verifyPackage(packageId),
  });
}
