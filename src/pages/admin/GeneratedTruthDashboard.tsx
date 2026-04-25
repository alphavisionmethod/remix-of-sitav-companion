import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { SitaPageHeader } from "@/platform/sita/components/sita/SitaCard";
import { SitaTabs } from "@/platform/sita/components/sita/SitaComponents";
import {
  CheckCircle2, XCircle, AlertTriangle, Shield, Activity,
  FileJson, Search, Server, Gauge, BarChart3, Layers,
  Clock, Package
} from "lucide-react";

// ── Import generated JSON ───────────────────────────────────
import validationSummary from "../../../generated/validation-summary.json";
import operationalScorecards from "../../../generated/operational-scorecards.json";
import architectureCompliance from "../../../generated/architecture-compliance-report.json";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Types ───────────────────────────────────────────────────
interface ValidationCheck { file: string; exists: boolean; validJson: boolean }
interface Scorecard { serviceName: string; healthScore: number; grade: string; metrics: { dependencyCount: number; hasServiceImplementation: boolean; hasEdgeFunction: boolean; hasHealthEndpoint: boolean } }
interface Violation { type: string; severity: string; description: string }

const vs = validationSummary as { version: string; generatedAt: string; totalChecks: number; passing: number; failing: number; passRate: number; checks: ValidationCheck[] };
const os = operationalScorecards as { version: string; generatedAt: string; totalServices: number; averageHealth: number; gradeDistribution: Record<string, number>; scorecards: Scorecard[] };
const ac = architectureCompliance as { version: string; generatedAt: string; totalViolations: number; errors: number; warnings: number; byType: Record<string, number>; violations: Violation[] };

// ── Grade colors ────────────────────────────────────────────
const GRADE_COLORS: Record<string, string> = {
  healthy: "text-green-400 bg-green-500/15",
  fair: "text-amber-400 bg-amber-500/15",
  degraded: "text-orange-400 bg-orange-500/15",
  critical: "text-red-400 bg-red-500/15",
};

const HEALTH_COLOR = (score: number) =>
  score >= 80 ? "text-green-400" : score >= 60 ? "text-amber-400" : score >= 40 ? "text-orange-400" : "text-red-400";

// ── Validation Tab ──────────────────────────────────────────
function ValidationTab() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return vs.checks;
    const q = search.toLowerCase();
    return vs.checks.filter(c => c.file.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-4">
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><FileJson className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{vs.totalChecks}</p><p className="text-xs text-muted-foreground">Total Artifacts</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
          <div><p className="text-2xl font-bold text-green-400">{vs.passing}</p><p className="text-xs text-muted-foreground">Passing</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><XCircle className="h-5 w-5 text-red-400" /></div>
          <div><p className="text-2xl font-bold text-red-400">{vs.failing}</p><p className="text-xs text-muted-foreground">Failing</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Gauge className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{vs.passRate}%</p><p className="text-xs text-muted-foreground">Pass Rate</p></div>
        </CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter artifacts…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Artifact Validation Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              {filtered.map((check, i) => (
                <motion.div key={check.file} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {check.exists && check.validJson ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm text-foreground font-mono truncate">{check.file}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={check.exists ? "bg-green-500/10 text-green-400 border-none text-[9px]" : "bg-red-500/10 text-red-400 border-none text-[9px]"}>
                      {check.exists ? "exists" : "missing"}
                    </Badge>
                    <Badge variant="outline" className={check.validJson ? "bg-green-500/10 text-green-400 border-none text-[9px]" : "bg-red-500/10 text-red-400 border-none text-[9px]"}>
                      {check.validJson ? "valid" : "invalid"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Scorecards Tab ──────────────────────────────────────────
function ScorecardsTab() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = os.scorecards;
    if (gradeFilter !== "all") list = list.filter(s => s.grade === gradeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.serviceName.toLowerCase().includes(q));
    }
    return list;
  }, [search, gradeFilter]);

  const grades = ["all", "healthy", "fair", "degraded", "critical"];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Server className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{os.totalServices}</p><p className="text-xs text-muted-foreground">Total Services</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"><Activity className="h-5 w-5 text-amber-400" /></div>
          <div><p className={`text-2xl font-bold ${HEALTH_COLOR(os.averageHealth)}`}>{os.averageHealth}</p><p className="text-xs text-muted-foreground">Avg Health</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
          <div><p className="text-2xl font-bold text-green-400">{os.gradeDistribution.healthy ?? 0}</p><p className="text-xs text-muted-foreground">Healthy</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
          <div><p className="text-2xl font-bold text-red-400">{(os.gradeDistribution.degraded ?? 0) + (os.gradeDistribution.critical ?? 0)}</p><p className="text-xs text-muted-foreground">At Risk</p></div>
        </CardContent></Card>
      </div>

      {/* Grade Distribution Bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Grade Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {Object.entries(os.gradeDistribution).map(([grade, count]) => {
              if (count === 0) return null;
              const pct = (count / os.totalServices) * 100;
              const colors: Record<string, string> = { healthy: "bg-green-500", fair: "bg-amber-500", degraded: "bg-orange-500", critical: "bg-red-500" };
              return (
                <div key={grade} className={`${colors[grade] ?? "bg-muted"} flex items-center justify-center text-[10px] font-bold text-foreground`} style={{ width: `${pct}%` }}>
                  {count}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            {Object.entries(os.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className={`h-2 w-2 rounded-full ${grade === "healthy" ? "bg-green-500" : grade === "fair" ? "bg-amber-500" : grade === "degraded" ? "bg-orange-500" : "bg-red-500"}`} />
                <span className="capitalize">{grade}: {count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {grades.map(g => (
            <button key={g} onClick={() => setGradeFilter(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${gradeFilter === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >{g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}</button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border">
              {filtered.map((sc, i) => (
                <motion.div key={sc.serviceName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.005 }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${GRADE_COLORS[sc.grade] ?? "bg-muted text-muted-foreground"}`}>
                      {sc.healthScore}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sc.serviceName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {sc.metrics.hasServiceImplementation && <Badge variant="outline" className="text-[8px] bg-green-500/10 text-green-400 border-none">impl</Badge>}
                        {sc.metrics.hasEdgeFunction && <Badge variant="outline" className="text-[8px] bg-blue-500/10 text-blue-400 border-none">edge</Badge>}
                        {sc.metrics.hasHealthEndpoint && <Badge variant="outline" className="text-[8px] bg-purple-500/10 text-purple-400 border-none">health</Badge>}
                        {sc.metrics.dependencyCount > 0 && <span className="text-[9px] text-muted-foreground">{sc.metrics.dependencyCount} deps</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Progress value={sc.healthScore} className="w-20 h-1.5" />
                    <Badge variant="outline" className={`text-[9px] capitalize ${GRADE_COLORS[sc.grade] ?? ""}`}>{sc.grade}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Compliance Tab ──────────────────────────────────────────
function ComplianceTab() {
  const [typeFilter, setTypeFilter] = useState("all");
  const types = useMemo(() => ["all", ...Object.keys(ac.byType)], []);

  const filtered = useMemo(() => {
    if (typeFilter === "all") return ac.violations;
    return ac.violations.filter(v => v.type.includes(typeFilter.replace(/([A-Z])/g, "-$1").toLowerCase()));
  }, [typeFilter]);

  const uniqueViolations = useMemo(() => {
    const map = new Map<string, { violation: Violation; count: number }>();
    ac.violations.forEach(v => {
      const key = `${v.type}::${v.description}`;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { violation: v, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{ac.totalViolations}</p><p className="text-xs text-muted-foreground">Total Violations</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><XCircle className="h-5 w-5 text-red-400" /></div>
          <div><p className="text-2xl font-bold text-red-400">{ac.errors}</p><p className="text-xs text-muted-foreground">Errors</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"><AlertTriangle className="h-5 w-5 text-amber-400" /></div>
          <div><p className="text-2xl font-bold text-amber-400">{ac.warnings}</p><p className="text-xs text-muted-foreground">Warnings</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{Object.keys(ac.byType).length}</p><p className="text-xs text-muted-foreground">Violation Types</p></div>
        </CardContent></Card>
      </div>

      {/* By-Type Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Violations by Type</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(ac.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-foreground font-medium capitalize">{type.replace(/([A-Z])/g, " $1").trim()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={ac.totalViolations > 0 ? (count / ac.totalViolations) * 100 : 0} className="w-32 h-1.5" />
                  <span className="text-sm font-mono text-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deduplicated Violations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Unique Violations ({uniqueViolations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {uniqueViolations.map((uv, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  {uv.violation.severity === "error" ? (
                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{uv.violation.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px]">{uv.violation.type}</Badge>
                      <Badge variant="outline" className={`text-[9px] ${uv.violation.severity === "error" ? "bg-red-500/10 text-red-400 border-none" : "bg-amber-500/10 text-amber-400 border-none"}`}>
                        {uv.violation.severity}
                      </Badge>
                      {uv.count > 1 && <span className="text-[10px] text-muted-foreground">×{uv.count} occurrences</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
const GeneratedTruthDashboard = () => {
  const [tab, setTab] = useState("validation");

  const lastGenerated = new Date(vs.generatedAt).toLocaleString();

  return (
    <motion.div className="mx-auto max-w-7xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <SitaPageHeader
        title="Generated Truth Dashboard"
        subtitle={`${vs.totalChecks} artifacts · ${os.totalServices} services · Last generated ${lastGenerated}`}
      />

      {/* Overall Health Banner */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className={`text-3xl font-bold ${vs.passRate === 100 ? "text-green-400" : "text-amber-400"}`}>{vs.passRate}%</p>
                <p className="text-[10px] text-muted-foreground">Artifact Validity</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className={`text-3xl font-bold ${HEALTH_COLOR(os.averageHealth)}`}>{os.averageHealth}</p>
                <p className="text-[10px] text-muted-foreground">Service Health</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className={`text-3xl font-bold ${ac.errors === 0 ? "text-green-400" : "text-red-400"}`}>{ac.errors}</p>
                <p className="text-[10px] text-muted-foreground">Arch Errors</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">{ac.warnings}</p>
                <p className="text-[10px] text-muted-foreground">Warnings</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>v{vs.version}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SitaTabs
        tabs={[
          { key: "validation", label: "Validation Summary", count: vs.totalChecks },
          { key: "scorecards", label: "Operational Scorecards", count: os.totalServices },
          { key: "compliance", label: "Architecture Compliance", count: ac.totalViolations },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "validation" && <ValidationTab />}
      {tab === "scorecards" && <ScorecardsTab />}
      {tab === "compliance" && <ComplianceTab />}
    </motion.div>
  );
};

export default GeneratedTruthDashboard;
