// ═══════════════════════════════════════════════════════════════
// Personal Brain — Data Export hook (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function usePbDataExport() {
  const [exporting, setExporting] = useState(false);

  const exportAll = useCallback(async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: { action: "data.export", payload: {} },
      });
      if (error) throw error;
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `personal-brain-export-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Export ready",
        description: "Your Brain data has been downloaded.",
      });
    } catch (e) {
      toast({
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportAll };
}