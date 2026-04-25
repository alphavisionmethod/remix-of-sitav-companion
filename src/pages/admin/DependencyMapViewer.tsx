import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { motion } from "framer-motion";
import { Network, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const DependencyMapViewer = () => {
  const { data: maps } = useQuery({
    queryKey: ["dependency-maps"],
    queryFn: async () => {
      const { data } = await fromTable("dependency_maps").select("*, feature_blueprints(title, domain)").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Network className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dependency Map Viewer</h1>
        </div>
        <p className="text-muted-foreground">Visualize auto-mapped dependencies per feature — contracts, services, policies, probes</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(maps ?? []).map((m: Record<string, any>) => {
          const pct = m.total_count > 0 ? Math.round((m.resolved_count / m.total_count) * 100) : 0;
          const cats = [
            { label: "Contracts", items: m.required_contracts ?? [], icon: "📋" },
            { label: "Services", items: m.required_services ?? [], icon: "⚙️" },
            { label: "Policies", items: m.required_policies ?? [], icon: "🛡️" },
            { label: "Proofs", items: m.required_proofs ?? [], icon: "✅" },
            { label: "Events", items: m.required_events ?? [], icon: "📡" },
            { label: "Probes", items: m.required_probes ?? [], icon: "🔍" },
            { label: "Launch Gates", items: m.launch_gates ?? [], icon: "🚀" },
          ];
          return (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{m.feature_id}</span>
                    <Badge variant={pct === 100 ? "default" : "secondary"}>{pct}% resolved</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={pct} className="h-2" />
                  <div className="text-xs text-muted-foreground">{m.resolved_count}/{m.total_count} dependencies resolved</div>
                  {cats.filter(c => c.items.length > 0).map(cat => (
                    <div key={cat.label}>
                      <div className="text-xs font-semibold mb-1">{cat.icon} {cat.label} ({cat.items.length})</div>
                      <div className="flex flex-wrap gap-1">{cat.items.map((item: string) => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {(!maps || maps.length === 0) && (
          <Card className="col-span-full"><CardContent className="pt-6 text-center text-muted-foreground">No dependency maps yet — generate from Feature Factory</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default DependencyMapViewer;
