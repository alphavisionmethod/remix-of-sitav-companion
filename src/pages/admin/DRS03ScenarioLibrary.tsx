import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Users, Layers } from "lucide-react";
import DRSSubNav from "@/platform/admin/components/admin/DRSSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



export default function DRS03ScenarioLibrary() {
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["drs03-scenarios"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await fromTable("demo_scenarios").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const statusColor: Record<string, string> = { draft: "bg-muted text-muted-foreground", approved: "bg-blue-500/20 text-blue-400", active: "bg-green-500/20 text-green-400", archived: "bg-red-500/20 text-red-400" };

  return (
    <div className="space-y-6 p-6">
<DRSSubNav />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DRS03 — Scenario Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Inspect all demo scenarios and their composition</p>
      </div>

      {(scenarios?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center"><BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">No scenarios created yet. Create your first investor demo scenario.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios?.map((s: Record<string, any>) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" /> {s.name}
                  <Badge className={`ml-auto text-xs ${statusColor[s.status] ?? ""}`}>{s.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline" className="text-xs"><Users className="h-3 w-3 mr-1" />{s.category}</Badge>
                  <span className="text-muted-foreground">v{s.version}</span>
                  {s.active && <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>}
                </div>
                {s.domain_coverage?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.domain_coverage.map((d: string) => (
                      <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>
                    ))}
                  </div>
                )}
                {s.narrative_summary && <p className="text-xs text-muted-foreground italic mt-2 border-l-2 border-primary/30 pl-2">{s.narrative_summary}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
