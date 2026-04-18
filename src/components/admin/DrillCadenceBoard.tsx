import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface CadenceRow {
  id: string;
  drill_key: string;
  display_name: string;
  category: string;
  cadence_label: string;
  cadence_interval_hours: number;
  owner_role: string;
  last_run_at: string | null;
  last_status: string | null;
  next_due_at: string | null;
  is_active: boolean;
  description: string | null;
}

const statusBadge = (row: CadenceRow) => {
  if (!row.last_run_at) return <Badge variant="outline">never run</Badge>;
  const ageHours = (Date.now() - new Date(row.last_run_at).getTime()) / (1000 * 60 * 60);
  const overdue = ageHours > row.cadence_interval_hours * 1.2;
  if (overdue) return <Badge variant="destructive">overdue</Badge>;
  if (row.last_status === "failed") return <Badge variant="destructive">last run failed</Badge>;
  return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">healthy</Badge>;
};

export default function DrillCadenceBoard() {
  const [rows, setRows] = useState<CadenceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("drill_cadence_registry")
        .select("*")
        .eq("is_active", true)
        .order("category");
      setRows((data ?? []) as CadenceRow[]);
      setLoading(false);
    })();
  }, []);

  const grouped = rows.reduce<Record<string, CadenceRow[]>>((acc, r) => {
    (acc[r.category] ||= []).push(r); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Drill Cadence</h2>
        <p className="text-sm text-muted-foreground">Recurring operational drills, owners, and freshness.</p>
      </div>
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader><CardTitle className="capitalize text-base">{cat.replace(/-/g, " ")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.map(r => (
              <div key={r.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.display_name}</span>
                    {statusBadge(r)}
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.cadence_label}</span>
                    <span>owner: {r.owner_role}</span>
                    {r.last_run_at && <span>last: {new Date(r.last_run_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {r.last_status === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />}
                  {r.last_status === "failed" && <AlertCircle className="h-4 w-4 text-destructive inline" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
