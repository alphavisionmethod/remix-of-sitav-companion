import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";

export function IncidentSummaryPanel() {
  const { data: count } = useQuery({
    queryKey: ["panel-incidents"],
    queryFn: async () => {
      const { count } = await fromTable("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]);
      return count || 0;
    },
  });

  return (
    <Card className="hover:-translate-y-0.5 transition-transform">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">Incidents</span>
          </div>
          <Badge variant="outline" className={`text-[9px] ${(count ?? 0) > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
            {(count ?? 0) > 0 ? `${count} Open` : "All Clear"}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-foreground">{count ?? 0}</p>
        <Link to="/admin/incidents" className="text-[10px] text-primary hover:underline">Command center →</Link>
      </CardContent>
    </Card>
  );
}
