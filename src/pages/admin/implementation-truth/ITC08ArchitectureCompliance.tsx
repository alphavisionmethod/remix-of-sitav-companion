// ═══════════════════════════════════════════════════════════════
// ITC08 — Architecture Compliance Board
// Surfaces results from generated/architecture-compliance-report.json
// ═══════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

interface CheckResult {
  script: string;
  passed: boolean;
  duration_ms: number;
  error?: string;
}

interface ArchReport {
  version: string;
  generatedAt: string;
  summary: { total: number; passed: number; failed: number; score: number };
  checks: CheckResult[];
}

function useArchitectureReport() {
  return useQuery({
    queryKey: ["architecture-compliance-report"],
    queryFn: async (): Promise<ArchReport | null> => {
      try {
        const res = await fetch("/generated/architecture-compliance-report.json");
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

function scriptName(path: string): string {
  return path.replace("scripts/architecture/", "").replace(".ts", "");
}

export default function ITC08ArchitectureCompliance() {
  const { data: report, isLoading } = useArchitectureReport();

  if (isLoading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading report...</div>;

  const noReport = !report;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Architecture Compliance Board</h1>
          <Badge variant="outline" className="text-[8px]">ITC08</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Results from 17 architecture enforcement scripts</p>
      </div>

      {noReport ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <div className="text-sm font-medium text-foreground mb-1">No Architecture Report Found</div>
            <div className="text-[11px] text-muted-foreground">
              Run <code className="bg-muted px-1 py-0.5 rounded text-[10px]">npx tsx scripts/architecture/architecture-report.ts</code> to generate the compliance report.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-foreground">{report.summary.score}%</div>
                <div className="text-[10px] text-muted-foreground">Compliance Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-500">{report.summary.passed}</div>
                <div className="text-[10px] text-muted-foreground">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-destructive">{report.summary.failed}</div>
                <div className="text-[10px] text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-foreground">{report.summary.total}</div>
                <div className="text-[10px] text-muted-foreground">Total Checks</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Compliance Progress</CardTitle>
                <span className="text-[10px] text-muted-foreground">Generated: {new Date(report.generatedAt).toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={report.summary.score} className="h-3" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Check Results</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Check</TableHead>
                    <TableHead className="text-[10px] w-20">Status</TableHead>
                    <TableHead className="text-[10px] w-24">Duration</TableHead>
                    <TableHead className="text-[10px]">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.checks.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-[11px] font-mono">{scriptName(c.script)}</TableCell>
                      <TableCell>
                        {c.passed ? (
                          <Badge className="text-[8px] h-4 bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Pass
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[8px] h-4">
                            <XCircle className="h-2.5 w-2.5 mr-1" /> Fail
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {c.duration_ms}ms
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] text-destructive max-w-xs truncate">{c.error || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
