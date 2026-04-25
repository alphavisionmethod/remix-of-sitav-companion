import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Network, User, Building2, FileText, Briefcase } from "lucide-react";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const ENTITY_ICONS: Record<string, React.ReactNode> = {
  person: <User className="h-3 w-3" />, company: <Building2 className="h-3 w-3" />,
  document: <FileText className="h-3 w-3" />, deal: <Briefcase className="h-3 w-3" />,
};

export default function DRS04ScenarioEntityGraph() {
  const { data, isLoading } = useQuery({
    queryKey: ["drs04-entities"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { entities: [], relationships: [], scenarios: [] };
      const [e, r, s] = await Promise.all([
        fromTable("demo_scenario_entities").select("*, demo_scenarios(name)").eq("user_id", user.id).limit(200),
        fromTable("demo_scenario_relationships").select("*").eq("user_id", user.id).limit(200),
        fromTable("demo_scenarios").select("id, name").eq("user_id", user.id),
      ]);
      return { entities: e.data ?? [], relationships: r.data ?? [], scenarios: s.data ?? [] };
    },
  });

  if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const typeGroups = (data?.entities ?? []).reduce((acc: Record<string, any[]>,  e: Record<string, any>) => {
    (acc[e.entity_type] ??= []).push(e); return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS04 — Scenario Entity Graph</h1>
        <p className="text-sm text-muted-foreground mt-1">Inspect synthetic demo world composition</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{data?.entities.length ?? 0}</p><p className="text-xs text-muted-foreground">Entities</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{data?.relationships.length ?? 0}</p><p className="text-xs text-muted-foreground">Relationships</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{Object.keys(typeGroups).length}</p><p className="text-xs text-muted-foreground">Entity Types</p></CardContent></Card>
      </div>

      {Object.keys(typeGroups).length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Network className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">No scenario entities yet. Seed a demo scenario to populate.</p></CardContent></Card>
      ) : (
        Object.entries(typeGroups).map(([type, entities]: [string, any[]]) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {ENTITY_ICONS[type] ?? <Network className="h-3 w-3" />}
                {type} <Badge variant="outline" className="text-xs ml-auto">{entities.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {entities.slice(0, 10).map((e: Record<string, any>) => (
                  <div key={e.id} className="flex items-center gap-2 text-sm py-1 border-b border-border/30 last:border-0">
                    <span className="font-medium text-foreground">{e.label}</span>
                    <span className="text-xs text-muted-foreground">{e.entity_key}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{e.visibility_scope}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
