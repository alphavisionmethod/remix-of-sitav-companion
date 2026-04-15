import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Search, Eye, KeyRound, Activity } from "lucide-react";
import { cloudAuditService, type AuditSeverity } from "@/lib/cloud-backbone/cloud-audit-service";

function timeSince(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  if (ms < 60000) return "Just now";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}

export function CloudAuditAdmin() {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState<"all" | AuditSeverity>("all");
  const events = cloudAuditService.getRecentEvents();
  const suspicious = cloudAuditService.getSuspiciousBehaviors();
  const alerts = cloudAuditService.getSecurityAlerts();
  const revocations = cloudAuditService.getTokenRevocations();

  const filteredEvents = events.filter(e => {
    const matchSearch = e.action.includes(search.toLowerCase()) || e.actorName.toLowerCase().includes(search.toLowerCase());
    const matchSev = sevFilter === "all" || e.severity === sevFilter;
    return matchSearch && matchSev;
  });

  return (
    <div className="space-y-4">
      {/* Security Alerts Banner */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-foreground">Active Security Alerts</span>
            </div>
            <div className="space-y-2">
              {alerts.filter(a => !a.acknowledged).map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded bg-background/50">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${a.severity === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                  <Badge variant={cloudAuditService.getSeverityBadge(a.severity)} className="text-xs capitalize">{a.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Suspicious Behavior */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              Suspicious Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suspicious.map(s => (
              <div key={s.id} className={`p-3 rounded-lg border ${s.resolved ? "border-border/30 opacity-60" : "border-amber-500/30 bg-amber-500/5"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{s.userName}</span>
                  <Badge variant={cloudAuditService.getSeverityBadge(s.severity)} className="text-[10px] capitalize">{s.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">{timeSince(s.detectedAt)}</span>
                  {s.resolved && <Badge variant="outline" className="text-[10px]">Resolved</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Token Revocations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Token Revocations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {revocations.map(r => (
              <div key={r.id} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.userName}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{r.tokenType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.reason}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{timeSince(r.revokedAt)}</p>
              </div>
            ))}
            {revocations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No recent revocations</p>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              "Why is this failing?"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { q: "Mass deletion detected?", a: "User deleted 847 files in 2 min — likely accidental bulk select. Files in trash, recoverable for 30 days.", sev: "critical" as const },
              { q: "Outdated client versions?", a: "3 devices on v1.x lack critical security patches. Force-reauth recommended.", sev: "warning" as const },
              { q: "Token refresh anomaly?", a: "Bob's device token refreshed 45× in 10 min — possible auth loop. Monitor or revoke.", sev: "warning" as const },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${item.sev === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
                  <p className="text-xs font-medium text-foreground">{item.q}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event Stream */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Audit Event Stream</CardTitle>
            <div className="flex gap-2">
              <div className="relative w-[200px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 h-7 text-xs" />
              </div>
              <div className="flex gap-1">
                {(["all", "info", "warning", "critical"] as const).map(s => (
                  <Button key={s} size="sm" variant={sevFilter === s ? "default" : "ghost"} onClick={() => setSevFilter(s)} className="h-7 text-[10px] capitalize px-2">
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.slice(0, 20).map(e => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className={`h-2 w-2 rounded-full ${e.severity === "critical" ? "bg-red-400" : e.severity === "warning" ? "bg-amber-400" : "bg-blue-400"}`} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.action}</TableCell>
                  <TableCell className="text-sm">{e.actorName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.targetType}:{e.targetId}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{e.ipAddress}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeSince(e.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
