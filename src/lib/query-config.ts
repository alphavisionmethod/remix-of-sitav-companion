import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast for queries that have already loaded data before (background refetch failures)
        if (query.state.data !== undefined) {
          toast.error(`Background refresh failed: ${error.message}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(`Action failed: ${error.message}`);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,       // 5 minutes
        gcTime: 30 * 60 * 1000,          // 30 minutes garbage collection
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}
