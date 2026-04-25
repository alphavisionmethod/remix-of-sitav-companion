import { useState } from "react";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { SitaTabs } from "@/components/sita/SitaComponents";
import { SitaCard } from "@/components/sita/SitaCard";
import { Rocket, ArrowUpCircle, ArrowDownCircle, Shield, Clock, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReleaseStatus, ReleaseChannel, ReleaseRing } from "@/packages/contracts/domain-types/release-record";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

interface DemoRelease {
  id: string;
  version: string;
  title: string;
  channel: ReleaseChannel;
  ring: ReleaseRing;
  status: ReleaseStatus;
  rolloutPct: number;
  affectedTenants: number;
  approvedBy: string | null;
  createdAt: string;
  evidenceComplete: boolean;
}

const demoReleases: DemoRelease[] = [
  { id: "r1", version: "2.14.0", title: "Trust ladder enhancements", channel: "stable", ring: "general-availability", status: "completed", rolloutPct: 100, affectedTenants: 1, approvedBy: "Owner", createdAt: "2026-04-07", evidenceComplete: true },
  { id: "r2", version: "2.15.0-beta.3", title: "Advisor memory persistence", channel: "beta", ring: "ring-1", status: "rolling-out", rolloutPct: 45, affectedTenants: 1, approvedBy: "Owner", createdAt: "2026-04-08", evidenceComplete: true },
  { id: "r3", version: "2.15.0-canary.1", title: "PDF viewer + data grid", channel: "canary", ring: "ring-0", status: "candidate", rolloutPct: 0, affectedTenants: 0, approvedBy: null, createdAt: "2026-04-09", evidenceComplete: false },
  { id: "r4", version: "2.13.2", title: "Hotfix: invoice rounding", channel: "stable", ring: "general-availability", status: "rolled-back", rolloutPct: 0, affectedTenants: 1, approvedBy: "Owner", createdAt: "2026-04-05", evidenceComplete: true },
];

const statusIcon = (s: ReleaseStatus) => {
  switch (s) {
    case "completed": return <CheckCircle2 className="h-4 w-4 text-trust-safe" />;
    case "rolling-out": return <ArrowUpCircle className="h-4 w-4 text-primary animate-pulse" />;
    case "candidate": return <Clock className="h-4 w-4 text-sita-gold" />;
    case "rolled-back": return <ArrowDownCircle className="h-4 w-4 text-destructive" />;
    case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const statusColor = (s: ReleaseStatus) => {
  switch (s) {
    case "completed": return "bg-trust-safe/10 text-trust-safe border-trust-safe/30";
    case "rolling-out": return "bg-primary/10 text-primary border-primary/30";
    case "candidate": return "bg-sita-gold/10 text-sita-gold border-sita-gold/30";
    case "rolled-back": return "bg-destructive/10 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const ReleaseDeploymentWorkspace = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "rollout" | "rollback" | "evidence">("inventory");

  return (
    <div className="mx-auto max-w-7xl space-y-4">
<SitaPageHeader icon={<Rocket className="h-6 w-6" />} title="Release & Deployment" subtitle="Manage release inventory, rollout channels, rollback, and evidence chains">
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
      </SitaPageHeader>

      <SitaTabs tabs={[
        { key: "inventory", label: "Release Inventory" },
        { key: "rollout", label: "Rollout Status" },
        { key: "rollback", label: "Rollback Center" },
        { key: "evidence", label: "Evidence Chains" },
      ]} active={activeTab} onChange={(k) => setActiveTab(k as typeof activeTab)} />

      {activeTab === "inventory" && (
        <SitaCard className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Ring</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoReleases.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.version}</TableCell>
                  <TableCell className="text-sm">{r.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] capitalize">{r.channel}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.ring}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {statusIcon(r.status)}
                      <Badge variant="outline" className={`text-[10px] capitalize ${statusColor(r.status)}`}>{r.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={r.rolloutPct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{r.rolloutPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.evidenceComplete ? (
                      <Badge variant="outline" className="text-[10px] bg-trust-safe/10 text-trust-safe border-trust-safe/30">Complete</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-sita-gold/10 text-sita-gold border-sita-gold/30">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SitaCard>
      )}

      {activeTab === "rollout" && (
        <div className="space-y-4">
          {demoReleases.filter(r => r.status === "rolling-out" || r.status === "candidate").map((r) => (
            <SitaCard key={r.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium">{r.version} — {r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Channel: {r.channel} · Ring: {r.ring} · Created {r.createdAt}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {statusIcon(r.status)}
                  <Badge className={statusColor(r.status)} variant="outline">{r.status}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Rollout progress</span>
                    <span className="font-medium">{r.rolloutPct}%</span>
                  </div>
                  <Progress value={r.rolloutPct} className="h-2" />
                </div>
                <div className="flex gap-2">
                  {r.status === "candidate" && <Button size="sm">Promote to Ring-0</Button>}
                  {r.status === "rolling-out" && (
                    <>
                      <Button size="sm">Advance Ring</Button>
                      <Button size="sm" variant="destructive">Rollback</Button>
                    </>
                  )}
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {activeTab === "rollback" && (
        <div className="space-y-4">
          {demoReleases.filter(r => r.status === "rolled-back").map((r) => (
            <SitaCard key={r.id} className="p-5">
              <div className="flex items-start gap-3">
                <ArrowDownCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium">{r.version} — {r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Rolled back on {r.createdAt}</p>
                  <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-xs font-medium text-destructive">Reason: regression</p>
                    <p className="text-xs text-muted-foreground mt-1">Invoice rounding caused $0.01 discrepancies across 12 transactions. Detected by Money Advisor within 4 minutes.</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5 mr-1" /> View Impact</Button>
                    <Button variant="outline" size="sm"><Shield className="h-3.5 w-3.5 mr-1" /> Evidence Bundle</Button>
                  </div>
                </div>
              </div>
            </SitaCard>
          ))}
          {demoReleases.filter(r => r.status === "rolled-back").length === 0 && (
            <SitaCard className="p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-trust-safe mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No rollbacks recorded</p>
            </SitaCard>
          )}
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="space-y-4">
          {demoReleases.map((r) => (
            <SitaCard key={r.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm">{r.version}</h3>
                  <p className="text-xs text-muted-foreground">{r.title}</p>
                </div>
                {r.evidenceComplete ? (
                  <Badge variant="outline" className="bg-trust-safe/10 text-trust-safe border-trust-safe/30">Chain Complete</Badge>
                ) : (
                  <Badge variant="outline" className="bg-sita-gold/10 text-sita-gold border-sita-gold/30">Chain Incomplete</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Test Suite", done: r.evidenceComplete },
                  { label: "Import Smoke", done: r.evidenceComplete },
                  { label: "Deployment Hash", done: true },
                  { label: "Approval Receipt", done: r.approvedBy !== null },
                ].map((e) => (
                  <div key={e.label} className={`rounded-lg border p-2 text-center text-xs ${e.done ? "border-trust-safe/30 bg-trust-safe/5" : "border-border/40"}`}>
                    {e.done ? <CheckCircle2 className="h-3.5 w-3.5 text-trust-safe mx-auto mb-1" /> : <AlertTriangle className="h-3.5 w-3.5 text-sita-gold mx-auto mb-1" />}
                    {e.label}
                  </div>
                ))}
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReleaseDeploymentWorkspace;
