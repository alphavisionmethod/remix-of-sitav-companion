import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Database, Search as SearchIcon
} from "lucide-react";
import { cloudLifecycleService } from "@/lib/cloud-backbone/cloud-lifecycle-service";
import type { ReconciliationRun } from "@/lib/cloud-backbone/cloud-lifecycle-service";
import { toast } from "sonner";

export function CloudIntegrityAdmin() {
  const [runs, setRuns] = useState<ReconciliationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cloudLifecycleService.getReconciliationRuns().then(r => { setRuns(r); setLoading(false); });
  }, []);

  const latestRun = runs[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Data Integrity</h1>
            <p className="text-sm text-muted-foreground">Reconciliation, quota drift, orphaned blobs, repair status</p>
          </div>
        </div>
        <Button size="sm" onClick={() => toast.info("Starting reconciliation...")} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Run Reconciliation
        </Button>
      </div>

      {latestRun && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Orphaned Blobs", value: latestRun.orphaned_blobs, danger: latestRun.orphaned_blobs > 0 },
            { label: "Missing Blobs", value: latestRun.missing_blobs, danger: latestRun.missing_blobs > 0 },
            { label: "Size Mismatches", value: latestRun.size_mismatches, danger: latestRun.size_mismatches > 0 },
            { label: "Quota Drifts", value: latestRun.quota_drifts, danger: latestRun.quota_drifts > 0 },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold ${s.danger ? "text-amber-400" : "text-emerald-400"}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Reconciliation History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues Found</TableHead>
                <TableHead>Repairs</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map(r => {
                const issues = r.orphaned_blobs + r.missing_blobs + r.size_mismatches + r.quota_drifts;
                const duration = r.started_at && r.completed_at
                  ? Math.round((new Date(r.completed_at).getTime() - new Date(r.started_at).getTime()) / 1000)
                  : null;
                return (
                  <TableRow key={r.id}>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{r.run_type}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {r.status === "completed" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                        <span className="text-sm capitalize">{r.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className={issues > 0 ? "text-amber-400 font-medium" : "text-emerald-400"}>{issues}</TableCell>
                    <TableCell className="text-sm">{r.repairs_applied}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{duration ? `${duration}s` : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.started_at ? new Date(r.started_at).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
