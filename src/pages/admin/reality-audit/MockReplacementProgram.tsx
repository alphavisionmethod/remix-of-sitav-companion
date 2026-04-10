import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Replace, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { MOCK_REPLACEMENT_PROGRAM, getMockReplacementProgress } from "@/lib/reality-audit/reality-audit-registry";

const contractColors: Record<string, string> = {
  absent: "text-red-400 bg-red-500/10",
  draft: "text-amber-400 bg-amber-500/10",
  defined: "text-blue-400 bg-blue-500/10",
  implemented: "text-emerald-400 bg-emerald-500/10",
};

const MockReplacementProgram = () => {
  const progress = getMockReplacementProgress();
  const pctDone = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  const byDomain = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    MOCK_REPLACEMENT_PROGRAM.forEach(m => {
      const existing = map.get(m.domain) || { total: 0, done: 0 };
      existing.total++;
      if (m.done) existing.done++;
      map.set(m.domain, existing);
    });
    return Array.from(map.entries()).sort((a, b) => (a[1].done / a[1].total) - (b[1].done / b[1].total));
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Replace className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Mock Replacement Program</h1>
          <p className="text-sm text-muted-foreground">Centralized program to eliminate all production mock imports from critical domains</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Mocks", value: progress.total, color: "text-blue-400" },
          { label: "Replaced", value: progress.done, color: progress.done > 0 ? "text-emerald-400" : "text-muted-foreground" },
          { label: "P0 Remaining", value: progress.p0Remaining, color: progress.p0Remaining > 0 ? "text-red-400" : "text-emerald-400" },
          { label: "Progress", value: `${pctDone}%`, color: pctDone >= 50 ? "text-emerald-400" : "text-amber-400" },
        ].map(k => (
          <Card key={k.label} className="bg-card/50"><CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-muted-foreground">{k.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Domain progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Domain Progress</CardTitle>
        </CardHeader>
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

      {/* Replacement Board */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="w-24">Domain</TableHead>
                  <TableHead className="w-16">P</TableHead>
                  <TableHead>Mock Source</TableHead>
                  <TableHead>Real Target</TableHead>
                  <TableHead className="w-24">Contract</TableHead>
                  <TableHead className="w-16">Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REPLACEMENT_PROGRAM.map(m => (
                  <TableRow key={m.id} className={m.done ? "bg-emerald-500/5" : m.migrationPriority === "P0" ? "bg-red-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{m.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{m.page}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{m.route}</div>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{m.domain}</TableCell>
                    <TableCell><Badge variant={m.migrationPriority === "P0" ? "destructive" : "secondary"} className="text-[10px]">{m.migrationPriority}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{m.mockSource}</TableCell>
                    <TableCell className="text-xs max-w-[180px] truncate">{m.realBackendTarget}</TableCell>
                    <TableCell><span className={`text-[10px] px-2 py-0.5 rounded ${contractColors[m.contractStatus]}`}>{m.contractStatus}</span></TableCell>
                    <TableCell>{m.done ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}</TableCell>
                  </TableRow>
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
              {MOCK_REPLACEMENT_PROGRAM.filter(m => !m.done && m.migrationPriority === "P0").map(m => (
                <div key={m.id} className="p-2 rounded bg-red-500/10 border border-red-500/20 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.page}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${contractColors[m.contractStatus]}`}>{m.contractStatus}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{m.notes}</p>
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
