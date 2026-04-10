import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, Search, CheckCircle, XCircle, Clock, Shield, AlertTriangle, FileText, Activity } from "lucide-react";
import {
  CI_GATE_REGISTRY, VALIDATION_RUNS, getCIGatePassRate, getRecentValidationRuns,
  type CIGateEntry
} from "@/lib/platform-law/platform-law-registry";

const PLE04CIGateMonitor = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "blocking" | "advisory">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pass" | "fail" | "skipped" | "never-run">("all");
  const [catFilter, setCatFilter] = useState<"all" | "architecture" | "validation" | "generation" | "master">("all");

  const filtered = useMemo(() => {
    return CI_GATE_REGISTRY.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.scriptPath.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && g.type !== typeFilter) return false;
      if (statusFilter !== "all" && g.lastStatus !== statusFilter) return false;
      if (catFilter !== "all" && g.category !== catFilter) return false;
      return true;
    });
  }, [search, typeFilter, statusFilter, catFilter]);

  const passRate = getCIGatePassRate();
  const blocking = CI_GATE_REGISTRY.filter(g => g.type === "blocking").length;
  const failing = CI_GATE_REGISTRY.filter(g => g.lastStatus === "fail").length;
  const recentRuns = getRecentValidationRuns(5);

  const statusIcon: Record<string, JSX.Element> = {
    pass: <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />,
    fail: <XCircle className="h-3.5 w-3.5 text-red-400" />,
    skipped: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    "never-run": <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  };

  const prChecklist = [
    "Feature ID declared", "Feature manifest updated", "Contracts added/updated",
    "Route registered with shell", "Interaction IDs added for P0", "Journey coverage updated",
    "Proof/receipt path considered", "Degraded/error/loading states included",
    "Runtime evidence/probe added", "Readiness impact noted",
  ];

  const runStatusColor: Record<string, string> = { pass: "text-emerald-400", fail: "text-red-400", partial: "text-amber-400" };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><GitBranch className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">CI & PR Gate Monitor</h1>
          <p className="text-sm text-muted-foreground">{CI_GATE_REGISTRY.length} gates · {passRate}% passing · {failing} failing · {blocking} blocking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Gates", value: CI_GATE_REGISTRY.length, color: "text-blue-400" },
          { label: "Pass Rate", value: `${passRate}%`, color: passRate >= 90 ? "text-emerald-400" : "text-amber-400" },
          { label: "Blocking", value: blocking, color: "text-red-400" },
          { label: "Failing", value: failing, color: failing === 0 ? "text-emerald-400" : "text-red-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Validation Run History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Validation Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRuns.map(run => (
              <div key={run.validationRunId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${runStatusColor[run.overallStatus]}`}>{run.overallStatus.toUpperCase()}</span>
                  <Badge variant="outline" className="text-[10px]">{run.runType}</Badge>
                  <span className="text-xs text-muted-foreground">{run.lawPackIds.join(", ")}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {run.blockerCount > 0 && <span className="text-red-400">{run.blockerCount} blockers</span>}
                  {run.warningCount > 0 && <span className="text-amber-400">{run.warningCount} warnings</span>}
                  <span className="text-muted-foreground">{run.completedAt.split("T")[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search gates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value as any)}>
          <option value="all">All Categories</option>
          <option value="architecture">Architecture</option>
          <option value="validation">Validation</option>
          <option value="generation">Generation</option>
          <option value="master">Master</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
          <option value="all">All Types</option>
          <option value="blocking">Blocking</option>
          <option value="advisory">Advisory</option>
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">All Statuses</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Gate</TableHead>
                  <TableHead className="w-24">Category</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-24">Domain</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24">Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(g => (
                  <TableRow key={g.id} className={g.lastStatus === "fail" ? "bg-red-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{g.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{g.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">{g.description}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{g.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={g.type === "blocking" ? "destructive" : "secondary"} className="text-[10px]">
                        {g.type === "blocking" ? <Shield className="h-2.5 w-2.5 mr-1" /> : <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {g.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{g.domain}</TableCell>
                    <TableCell><div className="flex items-center gap-1">{statusIcon[g.lastStatus]}<span className="text-xs">{g.lastStatus}</span></div></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{g.lastRun || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Required PR Checklist Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                <div className="w-5 h-5 rounded border border-border flex items-center justify-center text-[10px] text-muted-foreground">{i + 1}</div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PLE04CIGateMonitor;