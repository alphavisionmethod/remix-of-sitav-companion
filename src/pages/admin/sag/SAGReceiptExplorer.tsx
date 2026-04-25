import { motion } from "framer-motion";
import { Receipt, Zap, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInferenceReceipts, useTaskRequests } from "@/hooks/use-sag-data";
import SAGSubNav from "@/platform/admin/components/admin/SAGSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const SAGReceiptExplorer = () => {
  const { data: receipts = [], isLoading } = useInferenceReceipts();
  const { data: tasks = [] } = useTaskRequests();

  const verified = receipts.filter((r: Record<string, any>) => r.verification_outcome === 'passed').length;
  const totalCost = receipts.reduce((s: number,  r: Record<string, any>) => s + (r.cost_actual_cents || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
<SAGSubNav />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-primary" /> SAG09 — Inference Receipt & Trace Explorer</h1>
        <p className="text-muted-foreground mt-1">Inspect individual AI task traces and audit trails</p>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{receipts.length}</p><p className="text-xs text-muted-foreground">Total Receipts</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-green-500">{verified}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">${(totalCost / 100).toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Receipted Cost</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold">{receipts.filter((r: Record<string, any>) => r.cache_hits > 0).length}</p><p className="text-xs text-muted-foreground">Cache Hits</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading receipts...</p> :
          receipts.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inference receipts yet. Every AI action will be receipted here with full trace data.</p>
            </CardContent></Card>
          ) :
          receipts.map((r: Record<string, any>) => (
            <Card key={r.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{r.capability_id || '—'}</span>
                    <span className="text-xs text-muted-foreground font-mono">{r.prompt_family_id || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{r.provider}/{r.model}</Badge>
                    <Badge variant="outline" className="text-xs">{r.cost_actual_cents}¢</Badge>
                    {r.latency_ms && <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />{r.latency_ms}ms</Badge>}
                    <Badge className={r.verification_outcome === 'passed' ? 'bg-green-500/10 text-green-500 text-xs' : r.verification_outcome === 'failed' ? 'bg-destructive/10 text-destructive text-xs' : 'bg-muted text-muted-foreground text-xs'}>
                      {r.verification_outcome === 'passed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : r.verification_outcome === 'failed' ? <XCircle className="h-3 w-3 mr-1" /> : null}
                      {r.verification_outcome}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div>Route: {r.route_reason || '—'}</div>
                  <div>Tokens: {r.input_tokens}in / {r.output_tokens}out</div>
                  <div>Cache: {r.cache_hits || 0} hits</div>
                  <div>Redacted: {r.redaction_applied ? 'Yes' : 'No'}</div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default SAGReceiptExplorer;
