import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HardDrive, FileText, Image, Film, Archive, Trash2,
  TrendingUp, AlertTriangle, Shield,
} from "lucide-react";

const storageBreakdown = [
  { domain: "Documents", icon: FileText, used: 2.4, color: "bg-blue-500" },
  { domain: "Images", icon: Image, used: 1.8, color: "bg-emerald-500" },
  { domain: "Media", icon: Film, used: 3.2, color: "bg-purple-500" },
  { domain: "Backups", icon: Archive, used: 5.1, color: "bg-amber-500" },
  { domain: "Proof Bundles", icon: Shield, used: 0.8, color: "bg-rose-500" },
  { domain: "System", icon: HardDrive, used: 1.2, color: "bg-muted-foreground" },
];

const totalUsed = storageBreakdown.reduce((sum, s) => sum + s.used, 0);
const totalQuota = 50;
const usagePercent = Math.round((totalUsed / totalQuota) * 100);

const retentionPolicies = [
  { name: "Expired downloads", rule: "Auto-delete after 30 days", items: 3 },
  { name: "Old backups", rule: "Keep last 5 snapshots", items: 2 },
  { name: "Temporary files", rule: "Auto-delete after 7 days", items: 8 },
];

export default function StorageManager() {
  return (
    <PageShell width="wide">
      <SitaPageHeader
        icon={<HardDrive className="h-6 w-6" />}
        title="Storage Manager"
        subtitle="File usage, retention policies, and cleanup"
      >
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-1.5" /> Run Cleanup
        </Button>
      </SitaPageHeader>

      {/* Quota overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold">{totalUsed.toFixed(1)} GB <span className="text-sm font-normal text-muted-foreground">of {totalQuota} GB</span></p>
            </div>
            <Badge variant={usagePercent > 80 ? "destructive" : "secondary"}>
              {usagePercent}% used
            </Badge>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            {storageBreakdown.map((s) => (
              <div
                key={s.domain}
                className={`h-full ${s.color}`}
                style={{ width: `${(s.used / totalQuota) * 100}%` }}
                title={`${s.domain}: ${s.used} GB`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by domain */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {storageBreakdown.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.domain}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{s.domain}</p>
                </div>
                <p className="text-xl font-bold">{s.used} GB</p>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.used / totalQuota) * 100 * (totalQuota / 10)}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Retention policies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Retention Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {retentionPolicies.map((policy) => (
            <div key={policy.name} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
              <div>
                <p className="text-sm font-medium">{policy.name}</p>
                <p className="text-xs text-muted-foreground">{policy.rule}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{policy.items} items</Badge>
                <Button variant="ghost" size="sm">Clean</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Archive suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Archive Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            SITA recommends archiving 3 large files (2.1 GB total) that haven't been accessed in 90+ days.
          </p>
          <Button variant="outline" size="sm" className="mt-3">
            <Archive className="h-4 w-4 mr-1.5" /> Review Suggestions
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
