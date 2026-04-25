import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Tag, ShieldCheck } from "lucide-react";
import { CANONICAL_MODES } from "@/lib/dual-reality/reality-mode-registry";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function DRS09TruthLabeling() {
  const { data: labels, isLoading } = useQuery({
    queryKey: ["drs09-labels"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await fromTable("mode_truth_labels").select("*").eq("user_id", user.id);
      return data ?? [];
    },
  });

  const defaultLabels = Object.values(CANONICAL_MODES).map(m => ({
    mode_key: m.key, banner_style: m.key === "real" ? "none" : "subtle",
    disclosure_level: m.key === "real" ? "none" : "operator_only",
    proof_label_style: m.key === "real" ? "real_badge" : "demo_badge",
    launch_claim_class: m.launchHonestyClass,
  }));

  const displayLabels = (labels?.length ?? 0) > 0 ? labels : defaultLabels;

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS09 — Demo Truth & Labeling Review</h1>
        <p className="text-sm text-muted-foreground mt-1">Ensure demo mode stays honest and properly labeled</p>
      </div>

      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <div>
            <span className="font-semibold text-foreground">Launch Honesty Preserved</span>
            <p className="text-xs text-muted-foreground">Demo mode cannot inflate real-mode readiness claims</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayLabels?.map((l: Record<string, any>) => (
            <Card key={l.mode_key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span className="capitalize">{l.mode_key.replace("_", " ")}</span>
                  <Badge className={`ml-auto text-xs ${l.mode_key === "real" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{l.launch_claim_class}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Banner:</span> <span className="text-foreground">{l.banner_style}</span></div>
                  <div><span className="text-muted-foreground">Disclosure:</span> <span className="text-foreground">{l.disclosure_level}</span></div>
                  <div><span className="text-muted-foreground">Proof Label:</span> <span className="text-foreground">{l.proof_label_style}</span></div>
                  <div><span className="text-muted-foreground">Analytics Tag:</span> <span className="text-foreground">{l.analytics_segregation_label ?? "default"}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
