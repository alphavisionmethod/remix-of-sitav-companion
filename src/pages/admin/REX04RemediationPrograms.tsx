import REXSubNav from "@/platform/admin/components/admin/REXSubNav";
import { useQuery } from "@tanstack/react-query";
import { fetchRemediationPrograms } from "@/lib/core-services/recommendation-execution/recommendation-loop-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle2, Clock, Target } from "lucide-react";



const statusBadge: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-blue-500/15 text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-400",
  archived: "bg-muted text-muted-foreground",
};

export default function REX04RemediationPrograms() {
  const { data: programs, isLoading } = useQuery({
    queryKey: ["rex04-remediation-programs"],
    queryFn: fetchRemediationPrograms,
    staleTime: 30_000,
  });

  const summary = {
    total: programs?.length || 0,
    active: programs?.filter((p: Record<string, any>) => p.status === "active").length || 0,
    completed: programs?.filter((p: Record<string, any>) => p.status === "completed").length || 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">REX04 — Remediation Programs</h1>
        <p className="text-muted-foreground">Strategic work programs grouping recommendations into focused execution.</p>
      </div>
      <REXSubNav />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Programs", value: summary.total, icon: Layers, color: "text-blue-400" },
          { label: "Active", value: summary.active, icon: Clock, color: "text-amber-400" },
          { label: "Completed", value: summary.completed, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <c.icon className={`h-5 w-5 mx-auto mb-2 ${c.color}`} />
              <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading programs…</p>
        ) : (programs || []).length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No remediation programs yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Programs group approved recommendations into strategic execution tracks.</p>
            </CardContent>
          </Card>
        ) : (
          (programs || []).map((program: Record<string, any>) => (
            <Card key={program.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-lg">{program.title}</CardTitle>
                  <Badge className={statusBadge[program.status] || "bg-muted text-muted-foreground"}>
                    {program.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Focus: {program.focus_area}</span>
                  <span>Open: {program.open_items_count}</span>
                  <span>Done: {program.completed_items_count}</span>
                  {program.linked_flagship_loop && (
                    <Badge variant="outline" className="text-xs">{program.linked_flagship_loop}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
