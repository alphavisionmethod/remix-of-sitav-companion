import { Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useEngineEvents } from "@/lib/hooks/useEngineEventsData";

const IntelligenceInsuranceDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { events, loading } = useEngineEvents("intelligence-insurance", { limit: 50 });

  if (authLoading || !isAdmin) return null;

  const hedges = events.map(e => ({
    trigger: (e.event_data.trigger as string) || "unknown",
    domain: (e.event_data.domain as string) || "platform",
    action: (e.event_data.action as string) || "verify",
    cost: Number(e.event_data.cost_cents) || 0,
    result: (e.event_data.result as string) || "pending",
    confidence: Number(e.event_data.confidence_after) || 0,
    createdAt: e.created_at,
  }));

  const prevented = hedges.filter(h => h.result === "prevented_error").length;
  const totalCost = hedges.reduce((s, h) => s + h.cost, 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <SitaPageHeader icon={<Shield className="h-6 w-6" />} title="Intelligence Insurance Layer" subtitle="Risk hedges against hallucination and false confidence" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Insurance Events", v: String(hedges.length) },
          { l: "Errors Prevented", v: String(prevented), c: "text-emerald-400" },
          { l: "Insurance Cost", v: `$${(totalCost / 100).toFixed(0)}` },
          { l: "Active", v: "Enabled", c: "text-emerald-400" },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-xl font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading insurance events…</div>
      ) : hedges.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No insurance events recorded yet. The insurance layer will log verification passes, consistency checks, and hedging actions as they occur.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Insurance Events</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Trigger</TableHead><TableHead className="text-xs">Domain</TableHead>
            <TableHead className="text-xs">Action</TableHead><TableHead className="text-xs text-center">Result</TableHead>
            <TableHead className="text-xs text-right">Cost</TableHead><TableHead className="text-xs text-right">Conf</TableHead>
            <TableHead className="text-xs">Time</TableHead>
          </TableRow></TableHeader><TableBody>
            {hedges.map((h, i) => (<TableRow key={i}>
              <TableCell className="text-xs font-medium text-foreground">{h.trigger}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{h.domain}</TableCell>
              <TableCell><Badge variant="outline" className="text-[9px]">{h.action}</Badge></TableCell>
              <TableCell className="text-center"><Badge variant="secondary" className="text-[9px]">{h.result}</Badge></TableCell>
              <TableCell className="text-xs text-right font-mono">${(h.cost / 100).toFixed(2)}</TableCell>
              <TableCell className="text-xs text-right">{h.confidence}%</TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default IntelligenceInsuranceDashboard;
