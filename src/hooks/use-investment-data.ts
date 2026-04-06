// ═══════════════════════════════════════════════════════════════
// SITA OS — Investment React Query Hooks  
// Re-exports from use-domain-data + adds additional hooks
// ═══════════════════════════════════════════════════════════════

export { useCapitalBuckets, usePositions, useTheses } from "@/hooks/use-domain-data";

import { useQuery } from "@tanstack/react-query";
import { useRealityProvider } from "@/lib/hooks/useRealityProvider";
import { supabase } from "@/integrations/supabase/client";

export function useAssetSnapshots() {
  const { mode } = useRealityProvider();
  return useQuery({
    queryKey: ["asset-snapshots", mode],
    queryFn: async () => {
      if (mode !== "real") return [];
      const { data, error } = await supabase.from("asset_market_snapshots").select("*").order("snapshot_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}
