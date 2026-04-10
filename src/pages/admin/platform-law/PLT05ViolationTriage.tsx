import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle, Search, XCircle, CheckCircle, Clock, Shield, Users, Filter, BarChart3
} from "lucide-react";
import {
  VALIDATION_VIOLATIONS, WAIVERS,
  getOpenViolations, getRepeatViolators, getViolationAge, getWaiverForViolation,
  type ValidationViolationRecord, type ViolationStatus
} from "@/lib/platform-law/platform-law-registry";

const PLT05ViolationTriage = () => {
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ViolationStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ValidationViolationRecord | null>(null);

  const openViolations = getOpenViolations();
  const repeatViolators = getRepeatViolators();
  const blockers = VALIDATION_VIOLATIONS.filter(v => v.severity === "critical" && v.status === "open");
  const owners = [...new Set(VALIDATION_VIOLATIONS.map(v => v.owner))];

  const filtered = useMemo(() => {
    return VALIDATION_VIOLATIONS.filter(v => {
      if (search && !v.message.toLowerCase().includes(search.toLowerCase()) && !v.violationId.toLowerCase().includes(search.toLowerCase())) return false;
      if (sevFilter !== "all" && v.severity !== sevFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (ownerFilter !== "all" && v.owner !== ownerFilter) return false;
      return true;
    });
  }, [search, sevFilter, statusFilter, ownerFilter]);

  const sevColor: Record<string, string> = { critical: "destructive", high: "default", medium: "secondary", low: "outline" };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-6 w-6 text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold">Violation Triage Board</h1>
          <p className="text-sm text-muted-foreground">{VALIDATION_VIOLATIONS.length} total · {openViolations.length} open · {blockers.length} blockers · {WAIVERS.filter(w => w.status === "active").length} active waivers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Violations", value: VALIDATION_VIOLATIONS.length, color: "text-blue-400" },
          { label: "Open", value: openViolations.length, color: openViolations.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Blockers", value: blockers.length, color: blockers.length > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Active Waivers", value: WAIVERS.filter(w => w.status === "active").length, color: "text-amber-400" },
          { label: "Resolved", value: VALIDATION_VIOLATIONS.filter(v => v.status === "resolved").length, color: "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Repeat Violators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-amber-400" /> Repeat Violators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {repeatViolators.map(rv => (
              <div key={rv.owner} className={`p-3 rounded-lg border cursor-pointer transition-colors ${ownerFilter === rv.owner ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"}`}
                onClick={() => setOwnerFilter(ownerFilter === rv.owner ? "all" : rv.owner)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{rv.owner}</span>
                  <Badge variant={rv.openCount > 2 ? "destructive" : "secondary"} className="text-[10px]">{rv.count} total</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">{rv.openCount} open · {rv.count - rv.openCount} resolved</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Age Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Violation Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "< 1 day", range: [0, 1], color: "bg-emerald-500/20 text-emerald-400" },
              { label: "1-3 days", range: [1, 3], color: "bg-amber-500/20 text-amber-400" },
              { label: "3-7 days", range: [3, 7], color: "bg-orange-500/20 text-orange-400" },
              { label: "7+ days", range: [7, 999], color: "bg-red-500/20 text-red-400" },
            ].map(bucket => {
              const count = openViolations.filter(v => {
                const age = getViolationAge(v);
                return age >= bucket.range[0] && age < bucket.range[1];
              }).length;
              return (
                <div key={bucket.label} className={`p-3 rounded-lg text-center ${bucket.color}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs">{bucket.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Waiver Review */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Active Waivers ({WAIVERS.filter(w => w.status === "active").length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {WAIVERS.filter(w => w.status === "active").map(w => (
              <div key={w.waiverId} className="p-3 rounded border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{w.waiverId}</span>
                    <Badge variant="outline" className="text-[10px]">{w.ruleId}</Badge>
                    <span className="text-xs text-muted-foreground">→ {w.violationId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Expires: {w.expiresAt}</span>
                </div>
                <p className="text-xs text-muted-foreground">{w.justification}</p>
                <div className="text-[10px] text-muted-foreground mt-1">Approved by: {w.approvedBy}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search violations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={sevFilter} onChange={e => setSevFilter(e.target.value as any)}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="waived">Waived</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-20">Rule</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-20">Severity</TableHead>
                <TableHead className="w-24">Owner</TableHead>
                <TableHead className="w-16">Age</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-16">Waiver</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(v => {
                  const age = getViolationAge(v);
                  const waiver = getWaiverForViolation(v.violationId);
                  return (
                    <TableRow key={v.violationId} className={`cursor-pointer hover:bg-muted/30 ${v.severity === "critical" && v.status === "open" ? "bg-red-500/5" : ""}`} onClick={() => setSelected(v)}>
                      <TableCell className="font-mono text-xs">{v.violationId}</TableCell>
                      <TableCell className="font-mono text-xs">{v.ruleId}</TableCell>
                      <TableCell className="text-xs max-w-[300px] truncate">{v.message}</TableCell>
                      <TableCell><Badge variant={sevColor[v.severity] as any} className="text-[10px]">{v.severity}</Badge></TableCell>
                      <TableCell className="text-xs">{v.owner}</TableCell>
                      <TableCell className={`text-xs font-mono ${age > 7 ? "text-red-400" : age > 3 ? "text-amber-400" : "text-muted-foreground"}`}>{age}d</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{v.status}</Badge></TableCell>
                      <TableCell>{waiver ? <Shield className="h-3.5 w-3.5 text-amber-400" /> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      {selected && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-sm">{selected.violationId} — {selected.ruleId}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
          </div></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{selected.message}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><span className="text-muted-foreground text-xs">Severity</span><div><Badge variant={sevColor[selected.severity] as any}>{selected.severity}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Status</span><div><Badge variant="outline">{selected.status}</Badge></div></div>
              <div><span className="text-muted-foreground text-xs">Owner</span><div>{selected.owner}</div></div>
              <div><span className="text-muted-foreground text-xs">Age</span><div className="font-mono">{getViolationAge(selected)} days</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground text-xs">Artifact Type</span><div>{selected.artifactType}</div></div>
              <div><span className="text-muted-foreground text-xs">Artifact Ref</span><div className="font-mono text-xs">{selected.artifactRef}</div></div>
            </div>
            {selected.featureId && <div><span className="text-muted-foreground text-xs">Feature</span><div className="font-mono text-xs">{selected.featureId}</div></div>}
            <div><span className="text-muted-foreground text-xs">Remediation Guidance</span><p className="text-xs mt-1 p-2 rounded bg-emerald-500/10 text-emerald-400">{selected.remediationGuidance}</p></div>
            {getWaiverForViolation(selected.violationId) && (
              <div className="p-3 rounded border border-amber-500/20 bg-amber-500/5">
                <span className="text-amber-400 text-xs font-medium">Active Waiver</span>
                <p className="text-xs text-muted-foreground mt-1">{getWaiverForViolation(selected.violationId)!.justification}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PLT05ViolationTriage;
