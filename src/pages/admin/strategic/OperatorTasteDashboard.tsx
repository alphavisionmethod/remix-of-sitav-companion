import { Heart, Settings, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaPageHeader";
import { useRequireAdmin } from "@/platform/auth/hooks/useRequireAdmin";
import { useOperatorTaste } from "@/platform/personal-brain/hooks/useIntelligencePersistence";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const OperatorTasteDashboard = () => {
  const { isAdmin, loading: authLoading } = useRequireAdmin();
  const { profiles, loading: dataLoading } = useOperatorTaste();

  if (authLoading || !isAdmin) return null;

  const totalApplied = profiles.reduce((s, p) => s + p.times_applied, 0);
  const avgConfidence = profiles.length > 0
    ? profiles.reduce((s, p) => s + Number(p.confidence), 0) / profiles.length
    : 0;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
<SitaPageHeader icon={<Heart className="h-6 w-6" />} title="Operator Taste Memory" subtitle="Learned preferences — summary depth, explanation style, confidence thresholds, approval patterns" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Learned Preferences", v: String(profiles.length) },
          { l: "Times Applied", v: String(totalApplied), c: "text-emerald-400" },
          { l: "Avg Confidence", v: `${(avgConfidence * 100).toFixed(0)}%` },
          { l: "Active Learning", v: profiles.length > 0 ? "On" : "Waiting", c: profiles.length > 0 ? "text-emerald-400" : "text-muted-foreground" },
        ].map(m => (
          <Card key={m.l} className="bg-card/80 border-border/50"><CardContent className="p-3 text-center">
            <p className={`text-lg font-bold ${m.c || "text-foreground"}`}>{m.v}</p>
            <p className="text-[10px] text-muted-foreground">{m.l}</p>
          </CardContent></Card>
        ))}
      </div>
      {dataLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading operator preferences…</div>
      ) : profiles.length === 0 ? (
        <Card className="bg-card/80 border-border/50"><CardContent className="py-8 text-center text-muted-foreground text-sm">
          No operator taste preferences learned yet. As the system observes operator behavior (approvals, rejections, overrides), preferences will be captured here automatically.
        </CardContent></Card>
      ) : (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Learned Preferences</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow>
            <TableHead className="text-xs">Preference</TableHead>
            <TableHead className="text-xs">Value</TableHead>
            <TableHead className="text-xs">Learned From</TableHead>
            <TableHead className="text-xs text-right">Confidence</TableHead>
            <TableHead className="text-xs text-right">Applied</TableHead>
            <TableHead className="text-xs">Last Used</TableHead>
          </TableRow></TableHeader><TableBody>
            {profiles.map(p => (<TableRow key={p.id}>
              <TableCell className="text-xs font-medium text-foreground">{p.preference_key.replace(/_/g, " ")}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{JSON.stringify(p.preference_value).slice(0, 60)}</TableCell>
              <TableCell><Badge variant="outline" className="text-[9px]">{p.learned_from}</Badge></TableCell>
              <TableCell className="text-xs text-right">{(Number(p.confidence) * 100).toFixed(0)}%</TableCell>
              <TableCell className="text-xs text-right font-mono">{p.times_applied}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{p.last_applied_at ? new Date(p.last_applied_at).toLocaleDateString() : "—"}</TableCell>
            </TableRow>))}
          </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  );
};
export default OperatorTasteDashboard;
