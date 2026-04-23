import RCPSubNav from "@/components/admin/RCPSubNav";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Replace, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import {
  REPLACEMENT_PROGRAM, getMockReplacementProgress,
  type MigrationStatus, type MockType
} from "@/runtimes/reality/reality-audit-registry";

const contractColors: Record<string, string> = {
  absent: "text-red-400 bg-red-500/10",
  draft: "text-amber-400 bg-amber-500/10",
  defined: "text-blue-400 bg-blue-500/10",
  implemented: "text-emerald-400 bg-emerald-500/10",
};

const statusColors: Record<MigrationStatus, string> = {
  identified: "text-muted-foreground bg-muted/30",
  planned: "text-blue-400 bg-blue-500/10",
  in_progress: "text-amber-400 bg-amber-500/10",
  blocked: "text-red-400 bg-red-500/10",
  completed: "text-emerald-400 bg-emerald-500/10",
  validated: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
};

const MockReplacementProgram = () => {
  const progress = getMockReplacementProgress();
  const pctDone = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const byDomain = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    REPLACEMENT_PROGRAM.forEach(m => {
      const existing = map.get(m.domain) || { total: 0, done: 0 };
      existing.total++;
      if (m.done) existing.done++;
      map.set(m.domain, existing);
    });
    return Array.from(map.entries()).sort((a, b) => (a[1].done / a[1].total) - (b[1].done / b[1].total));
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <RCPSubNav />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Replace className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Mock Replacement Board</h1>
          <p className="text-sm text-muted-foreground">Formal migration execution board — eliminating production mocks from critical domains</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(Object.entries(progress.byStatus) as [MigrationStatus, number][]).map(([status, count]) => (
          <Card key={status} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className="text-xl font-bold">{count}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{status.replace("_", " ")}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Total Mocks", value: progress.total, color: "text-blue-400" },
          { label: "Replaced", value: progress.done, color: progress.done > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "P0 Remaining", value: progress.p0Remaining, color: progress.p0Remaining > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Progress", value: `${pctDone}%`, color: pctDone >= 50 ? "text-emerald-400" : "text-amber-400" },
        ]).map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Domain progress */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Domain Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {byDomain.map(([domain, data]) => {
              const pct = Math.round((data.done / data.total) * 100);
              return (
                <div key={domain} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{domain}</span>
                    <span className="font-mono text-xs">{data.done}/{data.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Replacement Board with expanded detail */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="w-20">Domain</TableHead>
                  <TableHead className="w-14">P</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-20">Contract</TableHead>
                  <TableHead className="w-24">Owner</TableHead>
                  <TableHead className="w-16">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REPLACEMENT_PROGRAM.map(m => (
                  <>
                    <TableRow key={m.id}
                      className={`cursor-pointer ${m.done ? "bg-emerald-500/5" : m.migrationPriority === "P0" ? "bg-red-500/5" : ""}`}
                      onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}>
                      <TableCell>
                        {expandedId === m.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{m.page}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{m.route}</div>
                      </TableCell>
                      <TableCell className="text-xs capitalize">{m.domain}</TableCell>
                      <TableCell><Badge variant={m.migrationPriority === "P0" ? "destructive" : "secondary"} className="text-[10px]">{m.migrationPriority}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{m.type}</Badge></TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[m.migrationStatus]}`}>{m.migrationStatus.replace("_", " ")}</span></TableCell>
                      <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${contractColors[m.contractStatus]}`}>{m.contractStatus}</span></TableCell>
                      <TableCell className="text-xs">{m.owner || "—"}</TableCell>
                      <TableCell><span className={`text-[10px] capitalize ${m.truthSeverity === "critical" ? "text-red-400" : m.truthSeverity === "high" ? "text-amber-400" : "text-muted-foreground"}`}>{m.truthSeverity}</span></TableCell>
                    </TableRow>
                    {expandedId === m.id && (
                      <TableRow key={`${m.id}-detail`}>
                        <TableCell colSpan={10} className="bg-muted/20">
                          <div className="p-3 space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div><span className="text-muted-foreground text-xs">Mock Source</span><p className="text-xs">{m.source}</p></div>
                              <div><span className="text-muted-foreground text-xs">Real Backend Target</span><p className="text-xs">{m.realBackendTarget}</p></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div><span className="text-muted-foreground text-xs">Persistence Target</span><p className="text-xs">{m.persistenceTarget}</p></div>
                              <div><span className="text-muted-foreground text-xs">Sequence Order</span><p className="text-xs">#{m.sequenceOrder}</p></div>
                            </div>
                            {m.blockers.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-xs">Blockers</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.blockers.map(b => <Badge key={b} variant="destructive" className="text-[9px]">{b}</Badge>)}
                                </div>
                              </div>
                            )}
                            {m.expectedContracts.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-xs">Expected Contracts</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.expectedContracts.map(c => <Badge key={c} variant="outline" className="text-[9px]">{c}</Badge>)}
                                </div>
                              </div>
                            )}
                            {m.dependencies.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-xs">Dependencies</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.dependencies.map(d => <Badge key={d} variant="secondary" className="text-[9px]">{d}</Badge>)}
                                </div>
                              </div>
                            )}
                            {m.validationEvidence.length > 0 && (
                              <div>
                                <span className="text-muted-foreground text-xs">Validation Evidence</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {m.validationEvidence.map(v => <Badge key={v} variant="outline" className="text-[9px] text-emerald-400">{v}</Badge>)}
                                </div>
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground p-2 rounded bg-muted/30">{m.notes}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* P0 Alerts */}
      {progress.p0Remaining > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> P0 Mock Replacements Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REPLACEMENT_PROGRAM.filter(m => !m.done && m.migrationPriority === "P0").map(m => (
                <div key={m.id} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{m.page}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{m.owner || "Unowned"}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[m.migrationStatus]}`}>{m.migrationStatus.replace("_", " ")}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${contractColors[m.contractStatus]}`}>{m.contractStatus}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.notes}</p>
                  {m.blockers.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {m.blockers.map(b => <Badge key={b} variant="destructive" className="text-[9px]">{b}</Badge>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MockReplacementProgram;
