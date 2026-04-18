import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Clock, Layers, Archive, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { cloudLifecycleService } from "@/platform/cloud/cloud-lifecycle-service";
import type { StorageTier, ArchiveJob } from "@/platform/cloud/cloud-lifecycle-service";
import { toast } from "sonner";

export function CloudLifecycleAdmin() {
  const [tiers, setTiers] = useState<StorageTier[]>([]);
  const [archiveJobs, setArchiveJobs] = useState<ArchiveJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([cloudLifecycleService.getTiers(), cloudLifecycleService.getArchiveJobs()])
      .then(([t, a]) => { setTiers(t); setArchiveJobs(a); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lifecycle Management</h1>
          <p className="text-sm text-muted-foreground">Tiering rules, retention policies, archive jobs</p>
        </div>
      </div>

      {/* Tier Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Storage Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tiers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${cloudLifecycleService.getTierColor(t.tier_key).replace("text-", "bg-")}`} />
                <div>
                  <p className="text-sm font-medium">{t.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(t.cost_per_gb_cents / 100).toFixed(3)}/GB · {t.retrieval_latency_ms < 1000 ? `${t.retrieval_latency_ms}ms` : `${(t.retrieval_latency_ms / 3600000).toFixed(1)}h`} retrieval
                  </p>
                </div>
              </div>
              <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{t.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Default Lifecycle Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Default Lifecycle Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { rule: "Move versions older than 90 days to Warm", from: "hot", to: "warm", days: 90, enabled: true },
            { rule: "Archive deleted items after 30 days", from: "warm", to: "cold", days: 30, enabled: true },
            { rule: "Purge archived items after 365 days", from: "cold", to: "purge", days: 365, enabled: false },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{r.rule}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className={cloudLifecycleService.getTierColor(r.from)}>{r.from}</span>
                    {" → "}
                    <span className={cloudLifecycleService.getTierColor(r.to)}>{r.to}</span>
                    {" · "}{r.days} days
                  </p>
                </div>
              </div>
              <Switch checked={r.enabled} onCheckedChange={() => toast.info(`Toggle lifecycle rule`)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Archive Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Archive className="h-4 w-4 text-primary" /> Archive / Restore Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {archiveJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No archive jobs yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Object</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archiveJobs.map(j => (
                  <TableRow key={j.id}>
                    <TableCell>{j.direction === "archive" ? <ArrowDown className="h-4 w-4 text-blue-400" /> : <ArrowUp className="h-4 w-4 text-amber-400" />}</TableCell>
                    <TableCell className="text-xs font-mono">{j.object_id.slice(0, 8)}...</TableCell>
                    <TableCell><span className={cloudLifecycleService.getTierColor(j.target_tier)}>{j.target_tier}</span></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{j.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
