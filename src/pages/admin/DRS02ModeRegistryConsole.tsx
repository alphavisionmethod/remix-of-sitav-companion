import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings } from "lucide-react";
import { CANONICAL_MODES, type RealityModeKey } from "@/lib/dual-reality/reality-mode-registry";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function DRS02ModeRegistryConsole() {
  const modes = Object.values(CANONICAL_MODES);

  const { data: truthLabels } = useQuery({
    queryKey: ["drs02-truth-labels"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await fromTable("mode_truth_labels").select("*").eq("user_id", user.id);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS02 — Mode Registry Console</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and inspect runtime modes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map(mode => (
          <Card key={mode.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {mode.name}
                <Badge className={`ml-auto text-xs ${mode.key === "real" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {mode.key}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{mode.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Honesty:</span> <span className="text-foreground">{mode.launchHonestyClass}</span></div>
                <div><span className="text-muted-foreground">AI Policy:</span> <span className="text-foreground">{mode.aiPolicy}</span></div>
                <div><span className="text-muted-foreground">Analytics:</span> <span className="text-foreground">{mode.analyticsMode}</span></div>
                <div><span className="text-muted-foreground">Receipts:</span> <span className="text-foreground">{mode.receiptMode}</span></div>
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Side Effects</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(mode.sideEffects).map(([k, v]) => (
                    <Badge key={k} variant="outline" className={`text-[10px] ${v ? "text-green-400" : "text-red-400"}`}>
                      {k.replace(/([A-Z])/g, " $1").trim()}: {v ? "✓" : "✗"}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
