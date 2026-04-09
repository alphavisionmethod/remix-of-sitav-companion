import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, BarChart3, RefreshCw,
  Shield, Activity, Sparkles, Target, Layers, Gauge, Search, Radar,
  Library, GitCompare, Package, Zap, Award, DollarSign, CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IntelligenceAssetType, EfficiencyScore, OutcomeType, DomainId } from "@/lib/intelligence-architecture";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

// ── Mock Data ───────────────────────────────────────────────

const DEMO_ASSETS: Array<{ id: string; type: IntelligenceAssetType; domain: string; title: string; usageCount: number; qualityScore: number; acceptanceRate: number; status: string; freshness: string; savings: number }> = [
  { id: "ia-1", type: "root-cause-analysis", domain: "engineering", title: "Memory leak in portfolio renderer", usageCount: 12, qualityScore: 92, acceptanceRate: 0.95, status: "active", freshness: "2hr", savings: 540 },
  { id: "ia-2", type: "investment-thesis", domain: "investment-finance", title: "Tech sector rotation thesis Q2", usageCount: 8, qualityScore: 88, acceptanceRate: 0.88, status: "active", freshness: "6hr", savings: 960 },
  { id: "ia-3", type: "automation-playbook", domain: "revenue-business", title: "Lead follow-up sequence playbook", usageCount: 24, qualityScore: 85, acceptanceRate: 0.92, status: "active", freshness: "1d", savings: 1080 },
  { id: "ia-4", type: "website-diagnostic", domain: "digital-presence", title: "Homepage conversion bottleneck", usageCount: 6, qualityScore: 78, acceptanceRate: 0.83, status: "active", freshness: "4hr", savings: 420 },
  { id: "ia-5", type: "issue-fingerprint", domain: "engineering", title: "API timeout pattern — payment service", usageCount: 18, qualityScore: 94, acceptanceRate: 0.97, status: "active", freshness: "30min", savings: 810 },
  { id: "ia-6", type: "strategic-summary", domain: "admin-ops", title: "Q2 operational priorities synthesis", usageCount: 5, qualityScore: 82, acceptanceRate: 0.80, status: "stale", freshness: "3d", savings: 450 },
  { id: "ia-7", type: "decision-frame", domain: "compliance-trust", title: "Data residency decision framework", usageCount: 3, qualityScore: 90, acceptanceRate: 1.0, status: "active", freshness: "12hr", savings: 360 },
  { id: "ia-8", type: "pattern", domain: "engineering", title: "Common N+1 query regression pattern", usageCount: 31, qualityScore: 96, acceptanceRate: 0.98, status: "active", freshness: "1hr", savings: 1400 },
];

const DEMO_DIFFERENTIALS = [
  { id: "da-1", domain: "investment-finance", materiality: 22, action: "reuse-as-is" as const, costFull: 120, costPartial: 35, costReuse: 5, deltas: 2, confidence: 92, desc: "Portfolio state — minor price fluctuation" },
  { id: "da-2", domain: "engineering", materiality: 68, action: "partial-update" as const, costFull: 120, costPartial: 35, costReuse: 5, deltas: 5, confidence: 65, desc: "Build pipeline — new dependency added" },
  { id: "da-3", domain: "revenue-business", materiality: 12, action: "reuse-as-is" as const, costFull: 80, costPartial: 25, costReuse: 3, deltas: 1, confidence: 96, desc: "CRM state — one lead status change" },
  { id: "da-4", domain: "digital-presence", materiality: 85, action: "full-reanalysis" as const, costFull: 150, costPartial: 45, costReuse: 5, deltas: 8, confidence: 38, desc: "Website structure — major layout change detected" },
  { id: "da-5", domain: "compliance-trust", materiality: 5, action: "reuse-as-is" as const, costFull: 100, costPartial: 30, costReuse: 4, deltas: 0, confidence: 98, desc: "Trust policy — no changes" },
];

const DEMO_EFFICIENCY: Array<{ id: string; name: string; type: EfficiencyScore["entityType"]; composite: number; quality: number; costEff: number; acceptance: number; override: number; reuse: number; trend: string }> = [
  { id: "e-1", name: "Finance Advisor", type: "agent", composite: 82, quality: 88, costEff: 76, acceptance: 0.92, override: 0.08, reuse: 0.45, trend: "improving" },
  { id: "e-2", name: "Self-Healing Agent", type: "agent", composite: 78, quality: 90, costEff: 82, acceptance: 0.95, override: 0.05, reuse: 0.62, trend: "stable" },
  { id: "e-3", name: "Strategy Synthesizer", type: "agent", composite: 71, quality: 85, costEff: 52, acceptance: 0.78, override: 0.22, reuse: 0.28, trend: "degrading" },
  { id: "e-4", name: "Growth Agent", type: "agent", composite: 74, quality: 80, costEff: 68, acceptance: 0.85, override: 0.15, reuse: 0.35, trend: "stable" },
  { id: "e-5", name: "Monitor Agent", type: "agent", composite: 91, quality: 92, costEff: 95, acceptance: 0.98, override: 0.02, reuse: 0.72, trend: "improving" },
];

const DEMO_OUTCOMES: Array<{ type: OutcomeType; count: number; costCents: number; valueCents: number; roi: number }> = [
  { type: "incident-prevented", count: 8, costCents: 2400, valueCents: 48000, roi: 20.0 },
  { type: "bug-resolved", count: 14, costCents: 4200, valueCents: 28000, roi: 6.7 },
  { type: "lead-recovered", count: 6, costCents: 1800, valueCents: 18000, roi: 10.0 },
  { type: "self-heal-success", count: 22, costCents: 1100, valueCents: 22000, roi: 20.0 },
  { type: "release-approved", count: 4, costCents: 3200, valueCents: 16000, roi: 5.0 },
  { type: "strategic-recommendation-accepted", count: 3, costCents: 4800, valueCents: 36000, roi: 7.5 },
  { type: "automation-completed", count: 18, costCents: 900, valueCents: 9000, roi: 10.0 },
  { type: "customer-retained", count: 2, costCents: 1600, valueCents: 24000, roi: 15.0 },
];

const DEMO_PACKETS: Array<{ domain: DomainId; tokenCount: number; compressionRatio: number; fresh: boolean; changes: number; risks: number; confidence: number; compiledAgo: string }> = [
  { domain: "admin-ops", tokenCount: 1200, compressionRatio: 0.12, fresh: true, changes: 3, risks: 1, confidence: 82, compiledAgo: "15min" },
  { domain: "engineering", tokenCount: 1800, compressionRatio: 0.15, fresh: true, changes: 5, risks: 2, confidence: 76, compiledAgo: "8min" },
  { domain: "revenue-business", tokenCount: 1400, compressionRatio: 0.11, fresh: true, changes: 2, risks: 0, confidence: 89, compiledAgo: "22min" },
  { domain: "digital-presence", tokenCount: 2100, compressionRatio: 0.18, fresh: false, changes: 8, risks: 3, confidence: 58, compiledAgo: "2hr" },
  { domain: "investment-finance", tokenCount: 1600, compressionRatio: 0.14, fresh: true, changes: 4, risks: 1, confidence: 84, compiledAgo: "12min" },
  { domain: "concierge-household", tokenCount: 900, compressionRatio: 0.08, fresh: true, changes: 1, risks: 0, confidence: 94, compiledAgo: "45min" },
  { domain: "connectors-integrations", tokenCount: 1100, compressionRatio: 0.10, fresh: true, changes: 2, risks: 1, confidence: 80, compiledAgo: "30min" },
  { domain: "launch-deployment", tokenCount: 1500, compressionRatio: 0.13, fresh: true, changes: 3, risks: 2, confidence: 72, compiledAgo: "18min" },
  { domain: "compliance-trust", tokenCount: 1300, compressionRatio: 0.12, fresh: true, changes: 0, risks: 0, confidence: 96, compiledAgo: "1hr" },
];

const DEMO_CROSS_TENANT_PATTERNS = [
  { type: "issue-signature", desc: "API timeout cascade after deploy", freq: 42, conf: 94, tenants: 18 },
  { type: "crm-leakage", desc: "Leads going cold after 48hr without follow-up", freq: 67, conf: 88, tenants: 31 },
  { type: "deployment-failure", desc: "Migration timeout on large tables", freq: 23, conf: 91, tenants: 12 },
  { type: "self-heal-outcome", desc: "Cache flush resolves 80% of 5xx spikes", freq: 89, conf: 96, tenants: 45 },
  { type: "low-value-loop", desc: "Repeated SEO audit with no content changes", freq: 34, conf: 82, tenants: 22 },
];

// ── Helpers ─────────────────────────────────────────────────

const MetricCard = ({ icon: Icon, label, value, sub, color }: { icon: typeof Brain; label: string; value: string; sub: string; color?: string }) => (
  <Card className="bg-card/80 border-border/50">
    <CardContent className="p-3">
      <Icon className={`h-4 w-4 mb-1 ${color || "text-primary"}`} />
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground/60">{sub}</p>
    </CardContent>
  </Card>
);

const actionColors: Record<string, string> = {
  "reuse-as-is": "text-emerald-400 bg-emerald-500/10",
  "partial-update": "text-blue-400 bg-blue-500/10",
  "full-reanalysis": "text-amber-400 bg-amber-500/10",
  "escalate": "text-rose-400 bg-rose-500/10",
};

const trendIcons = { improving: TrendingUp, stable: Activity, degrading: TrendingDown };
const trendColors = { improving: "text-emerald-400", stable: "text-muted-foreground", degrading: "text-rose-400" };

// ── Component ───────────────────────────────────────────────

const IntelligenceEfficiencyBoard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const totalSavings = DEMO_ASSETS.reduce((s, a) => s + a.savings, 0);
  const totalReuses = DEMO_ASSETS.reduce((s, a) => s + a.usageCount, 0);
  const avgQuality = Math.round(DEMO_ASSETS.reduce((s, a) => s + a.qualityScore, 0) / DEMO_ASSETS.length);
  const reuseDecisions = DEMO_DIFFERENTIALS.filter(d => d.action === "reuse-as-is").length;
  const totalOutcomeValue = DEMO_OUTCOMES.reduce((s, o) => s + o.valueCents, 0);
  const totalOutcomeCost = DEMO_OUTCOMES.reduce((s, o) => s + o.costCents, 0);
  const overallROI = totalOutcomeCost > 0 ? (totalOutcomeValue / totalOutcomeCost).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Intelligence Efficiency Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reusable cognition · differential reasoning · outcome economics · efficiency scoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1"><Activity className="h-3 w-3" /> Live</Badge>
          <Badge variant="secondary" className="gap-1"><Award className="h-3 w-3" /> ROI: {overallROI}x</Badge>
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="asset-library" className="text-xs">Asset Library</TabsTrigger>
          <TabsTrigger value="differential" className="text-xs">Differential Reasoning</TabsTrigger>
          <TabsTrigger value="domain-packets" className="text-xs">Domain Packets</TabsTrigger>
          <TabsTrigger value="efficiency" className="text-xs">Efficiency Scores</TabsTrigger>
          <TabsTrigger value="outcomes" className="text-xs">Outcome Economics</TabsTrigger>
          <TabsTrigger value="cross-tenant" className="text-xs">Cross-Tenant Patterns</TabsTrigger>
        </TabsList>

        {/* ══ Overview ════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <MetricCard icon={Library} label="Intelligence Assets" value={String(DEMO_ASSETS.length)} sub={`${DEMO_ASSETS.filter(a => a.status === "active").length} active`} />
            <MetricCard icon={RefreshCw} label="Total Reuses" value={String(totalReuses)} sub="this period" />
            <MetricCard icon={DollarSign} label="Compute Saved" value={`$${(totalSavings / 100).toFixed(0)}`} sub="via intelligence reuse" color="text-emerald-400" />
            <MetricCard icon={GitCompare} label="Differential Reuse" value={`${reuseDecisions}/${DEMO_DIFFERENTIALS.length}`} sub="domains reused as-is" />
            <MetricCard icon={Award} label="Avg Quality" value={`${avgQuality}/100`} sub="across all assets" />
            <MetricCard icon={Target} label="Outcome ROI" value={`${overallROI}x`} sub="value / AI cost" color="text-emerald-400" />
            <MetricCard icon={Package} label="Domain Packets" value={`${DEMO_PACKETS.filter(p => p.fresh).length}/${DEMO_PACKETS.length}`} sub="fresh packets" />
          </div>

          {/* Key Lanes */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Top Reused Assets */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Reused Assets</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DEMO_ASSETS.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div className="max-w-[65%]">
                      <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.type} · {a.domain}</p>
                    </div>
                    <div className="text-right text-[10px]">
                      <p className="text-foreground font-mono">{a.usageCount} reuses</p>
                      <p className="text-emerald-400">${(a.savings / 100).toFixed(0)} saved</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Differential Reasoning Summary */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Differential Reasoning</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DEMO_DIFFERENTIALS.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <div className="max-w-[60%]">
                      <p className="text-xs font-medium text-foreground">{d.domain}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.desc}</p>
                    </div>
                    <Badge className={`${actionColors[d.action]} text-[9px]`} variant="secondary">{d.action}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Outcome Economics Quick View */}
            <Card className="bg-card/80 border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Outcome ROI</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DEMO_OUTCOMES.sort((a, b) => b.roi - a.roi).slice(0, 5).map(o => (
                  <div key={o.type} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                    <span className="text-xs text-foreground">{o.type.replace(/-/g, " ")}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-emerald-400 font-mono">{o.roi}x</span>
                      <span className="text-muted-foreground">{o.count} outcomes</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Savings by domain */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Intelligence Reuse Savings by Domain</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(
                  DEMO_ASSETS.reduce<Record<string, number>>((acc, a) => { acc[a.domain] = (acc[a.domain] || 0) + a.savings; return acc; }, {})
                ).sort(([, a], [, b]) => b - a).map(([domain, savings]) => (
                  <div key={domain} className="p-3 rounded-lg bg-secondary/20 text-center">
                    <p className="text-lg font-bold text-emerald-400">${(savings / 100).toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">{domain}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Asset Library ════════════════════════════════════ */}
        <TabsContent value="asset-library" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Library className="h-4 w-4 text-primary" /> Intelligence Asset Library</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Asset</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Domain</TableHead>
                    <TableHead className="text-xs text-right">Reuses</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                    <TableHead className="text-xs text-right">Acceptance</TableHead>
                    <TableHead className="text-xs">Freshness</TableHead>
                    <TableHead className="text-xs text-right">Savings</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_ASSETS.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">{a.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px]">{a.type}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.domain}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{a.usageCount}</TableCell>
                      <TableCell className="text-xs text-right"><span className={a.qualityScore >= 90 ? "text-emerald-400" : a.qualityScore >= 75 ? "text-foreground" : "text-amber-400"}>{a.qualityScore}</span></TableCell>
                      <TableCell className="text-xs text-right">{(a.acceptanceRate * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{a.freshness}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-emerald-400">${(a.savings / 100).toFixed(0)}</TableCell>
                      <TableCell><Badge variant={a.status === "active" ? "secondary" : "destructive"} className="text-[9px]">{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Asset Type Distribution */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Asset Type Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  DEMO_ASSETS.reduce<Record<string, number>>((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {})
                ).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">{type}: {count}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Differential Reasoning ══════════════════════════ */}
        <TabsContent value="differential" className="space-y-4 mt-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{reuseDecisions}</p>
                <p className="text-[10px] text-muted-foreground">Reused As-Is</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{DEMO_DIFFERENTIALS.filter(d => d.action === "partial-update").length}</p>
                <p className="text-[10px] text-muted-foreground">Partial Updates</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{DEMO_DIFFERENTIALS.filter(d => d.action === "full-reanalysis").length}</p>
                <p className="text-[10px] text-muted-foreground">Full Reanalysis</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  ${(DEMO_DIFFERENTIALS.reduce((s, d) => s + (d.action === "reuse-as-is" ? d.costFull - d.costReuse : d.action === "partial-update" ? d.costFull - d.costPartial : 0), 0) / 100).toFixed(0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Saved This Cycle</p>
              </CardContent>
            </Card>
          </div>

          {/* Differential Analysis Table */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4 text-primary" /> Differential Analysis</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Domain</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Materiality</TableHead>
                    <TableHead className="text-xs text-right">Deltas</TableHead>
                    <TableHead className="text-xs text-right">Confidence</TableHead>
                    <TableHead className="text-xs text-right">Full Cost</TableHead>
                    <TableHead className="text-xs text-right">Actual Cost</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_DIFFERENTIALS.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs font-medium text-foreground">{d.domain}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{d.desc}</TableCell>
                      <TableCell className="text-xs text-right">
                        <span className={d.materiality > 60 ? "text-amber-400" : d.materiality > 30 ? "text-foreground" : "text-emerald-400"}>{d.materiality}</span>
                      </TableCell>
                      <TableCell className="text-xs text-right">{d.deltas}</TableCell>
                      <TableCell className="text-xs text-right">{d.confidence}%</TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">${(d.costFull / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-emerald-400">
                        ${((d.action === "reuse-as-is" ? d.costReuse : d.action === "partial-update" ? d.costPartial : d.costFull) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell><Badge className={`${actionColors[d.action]} text-[9px]`} variant="secondary">{d.action}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Escalation Gates */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Confidence-Gated Escalation Policy</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-3">
              {[
                { gate: "Reuse as-is", trigger: "Materiality < 10, confidence > 90", tier: "utility", cost: "~$0.05" },
                { gate: "Partial update", trigger: "Materiality 10-70, some deltas", tier: "standard", cost: "~$0.35" },
                { gate: "Full reanalysis", trigger: "Materiality > 70 or invalidation", tier: "premium", cost: "~$1.20" },
                { gate: "Escalate", trigger: "Low prior confidence + new deltas", tier: "exceptional", cost: "~$2.00+" },
              ].map(g => (
                <div key={g.gate} className="p-3 rounded-lg bg-secondary/20 space-y-1 text-center">
                  <p className="text-xs font-medium text-foreground">{g.gate}</p>
                  <p className="text-[10px] text-muted-foreground">{g.trigger}</p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{g.tier}</Badge>
                    <span className="text-[9px] text-muted-foreground">{g.cost}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Domain Packets ══════════════════════════════════ */}
        <TabsContent value="domain-packets" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Domain Intelligence Packets</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Domain</TableHead>
                    <TableHead className="text-xs text-right">Tokens</TableHead>
                    <TableHead className="text-xs text-right">Compression</TableHead>
                    <TableHead className="text-xs text-right">Changes</TableHead>
                    <TableHead className="text-xs text-right">Risks</TableHead>
                    <TableHead className="text-xs text-right">Confidence</TableHead>
                    <TableHead className="text-xs">Compiled</TableHead>
                    <TableHead className="text-xs">Fresh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_PACKETS.map(p => (
                    <TableRow key={p.domain}>
                      <TableCell className="text-xs font-medium text-foreground">{p.domain}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{p.tokenCount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-400">{(p.compressionRatio * 100).toFixed(0)}%</TableCell>
                      <TableCell className="text-xs text-right">{p.changes}</TableCell>
                      <TableCell className="text-xs text-right">{p.risks > 0 ? <span className="text-amber-400">{p.risks}</span> : "0"}</TableCell>
                      <TableCell className="text-xs text-right"><span className={p.confidence >= 80 ? "text-emerald-400" : p.confidence >= 60 ? "text-foreground" : "text-rose-400"}>{p.confidence}%</span></TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{p.compiledAgo}</TableCell>
                      <TableCell><Badge variant={p.fresh ? "secondary" : "destructive"} className="text-[9px]">{p.fresh ? "fresh" : "stale"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Zero-Waste Prompt Stats */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Zero-Waste Prompt Architecture</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-3">
              {[
                { label: "Avg Packet Size", value: `${Math.round(DEMO_PACKETS.reduce((s, p) => s + p.tokenCount, 0) / DEMO_PACKETS.length).toLocaleString()} tok`, desc: "vs ~12k avg raw prompt" },
                { label: "Avg Compression", value: `${Math.round(DEMO_PACKETS.reduce((s, p) => s + p.compressionRatio, 0) / DEMO_PACKETS.length * 100)}%`, desc: "of original context size" },
                { label: "Fresh Packets", value: `${DEMO_PACKETS.filter(p => p.fresh).length}/${DEMO_PACKETS.length}`, desc: "ready for immediate use" },
                { label: "Estimated Savings", value: `$${((DEMO_PACKETS.reduce((s, p) => s + (12000 - p.tokenCount), 0) * 0.003) / 100).toFixed(0)}/day`, desc: "from packet-driven prompts" },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-secondary/20 text-center">
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{s.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Efficiency Scores ═══════════════════════════════ */}
        <TabsContent value="efficiency" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Agent Efficiency Scores</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Agent</TableHead>
                    <TableHead className="text-xs text-right">Composite</TableHead>
                    <TableHead className="text-xs text-right">Quality</TableHead>
                    <TableHead className="text-xs text-right">Cost Eff.</TableHead>
                    <TableHead className="text-xs text-right">Acceptance</TableHead>
                    <TableHead className="text-xs text-right">Override</TableHead>
                    <TableHead className="text-xs text-right">Intel Reuse</TableHead>
                    <TableHead className="text-xs">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_EFFICIENCY.sort((a, b) => b.composite - a.composite).map(e => {
                    const TrendIcon = trendIcons[e.trend as keyof typeof trendIcons] || Activity;
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs font-medium text-foreground">{e.name}</TableCell>
                        <TableCell className="text-xs text-right">
                          <span className={e.composite >= 80 ? "text-emerald-400" : e.composite >= 60 ? "text-foreground" : "text-rose-400"}>
                            {e.composite}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right">{e.quality}</TableCell>
                        <TableCell className="text-xs text-right">{e.costEff}</TableCell>
                        <TableCell className="text-xs text-right">{(e.acceptance * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right">{(e.override * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-xs text-right">{(e.reuse * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendIcon className={`h-3 w-3 ${trendColors[e.trend as keyof typeof trendColors]}`} />
                            <span className={`text-[10px] ${trendColors[e.trend as keyof typeof trendColors]}`}>{e.trend}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Efficiency Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DEMO_EFFICIENCY.filter(e => e.composite < 80).map(e => (
                <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-foreground">
                    <span className="font-medium">{e.name}</span>:
                    {e.override > 0.15 ? " High override rate — review prompt quality." : ""}
                    {e.reuse < 0.3 ? " Low intelligence reuse — expand asset library coverage." : ""}
                    {e.costEff < 60 ? " Poor cost efficiency — consider model tier adjustment." : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Outcome Economics ═══════════════════════════════ */}
        <TabsContent value="outcomes" className="space-y-4 mt-4">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{DEMO_OUTCOMES.reduce((s, o) => s + o.count, 0)}</p>
                <p className="text-[10px] text-muted-foreground">Total Outcomes</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">${(totalOutcomeCost / 100).toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">AI Cost</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">${(totalOutcomeValue / 100).toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">Estimated Value</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{overallROI}x</p>
                <p className="text-[10px] text-muted-foreground">Overall ROI</p>
              </CardContent>
            </Card>
          </div>

          {/* Outcome Table */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Cost Per Useful Outcome</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Outcome Type</TableHead>
                    <TableHead className="text-xs text-right">Count</TableHead>
                    <TableHead className="text-xs text-right">AI Cost</TableHead>
                    <TableHead className="text-xs text-right">Value</TableHead>
                    <TableHead className="text-xs text-right">Cost/Outcome</TableHead>
                    <TableHead className="text-xs text-right">ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_OUTCOMES.sort((a, b) => b.roi - a.roi).map(o => (
                    <TableRow key={o.type}>
                      <TableCell className="text-xs font-medium text-foreground">{o.type.replace(/-/g, " ")}</TableCell>
                      <TableCell className="text-xs text-right">{o.count}</TableCell>
                      <TableCell className="text-xs text-right font-mono">${(o.costCents / 100).toFixed(0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-emerald-400">${(o.valueCents / 100).toFixed(0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">${(o.costCents / o.count / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">
                        <span className={o.roi >= 10 ? "text-emerald-400" : o.roi >= 5 ? "text-foreground" : "text-amber-400"}>{o.roi}x</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══ Cross-Tenant Patterns ═══════════════════════════ */}
        <TabsContent value="cross-tenant" className="space-y-4 mt-4">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4 text-primary" /> Anonymized Cross-Tenant Patterns</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Pattern Type</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Frequency</TableHead>
                    <TableHead className="text-xs text-right">Confidence</TableHead>
                    <TableHead className="text-xs text-right">Tenants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_CROSS_TENANT_PATTERNS.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.type}</Badge></TableCell>
                      <TableCell className="text-xs text-foreground">{p.desc}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{p.freq}</TableCell>
                      <TableCell className="text-xs text-right">{p.conf}%</TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground">{p.tenants}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Privacy & Governance</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Anonymization", desc: "All patterns stripped of tenant-identifying information", status: "enforced" },
                { label: "Opt-in Control", desc: "Enterprise tenants can opt out of cross-tenant learning", status: "available" },
                { label: "Confidence Gating", desc: "Patterns only used above 80% confidence threshold", status: "active" },
              ].map(g => (
                <div key={g.label} className="p-3 rounded-lg bg-secondary/20 space-y-1">
                  <p className="text-xs font-medium text-foreground">{g.label}</p>
                  <p className="text-[10px] text-muted-foreground">{g.desc}</p>
                  <Badge variant="secondary" className="text-[9px] text-emerald-400">{g.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligenceEfficiencyBoard;
