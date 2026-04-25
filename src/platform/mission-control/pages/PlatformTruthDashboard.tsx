import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TruthBadge, DegradedStateBanner, StalenessIndicator } from "@/components/sita/truth";
import type { FreshnessStatus, SourceType } from "@/components/sita/truth";
import {
  CheckCircle, AlertTriangle, XCircle, Shield, Activity, Clock, Target, Rocket,
  RefreshCw, Database, GitBranch, Eye, FileCheck, Zap, BarChart3, Radio, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Demo truth data ─────────────────────────────────────────────

const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

interface ProjectionState {
  key: string;
  domain: string;
  source: SourceType;
  status: FreshnessStatus;
  confidence: number;
  threshold: number;
  lastMaterialized: string | null;
  degradedReason?: string;
}

const PROJECTIONS: ProjectionState[] = [
  { key: "home-pulse", domain: "shell", source: "database", status: "fresh", confidence: 0.98, threshold: 300, lastMaterialized: h(0.05) },
  { key: "business-projection", domain: "business", source: "database", status: "fresh", confidence: 0.95, threshold: 3600, lastMaterialized: h(0.3) },
  { key: "money-projection", domain: "money", source: "calculation", status: "fresh", confidence: 1.0, threshold: 3600, lastMaterialized: h(0.2) },
  { key: "concierge-projection", domain: "concierge", source: "connector", status: "stale", confidence: 0.82, threshold: 1800, lastMaterialized: h(2) },
  { key: "advisor-state", domain: "advisors", source: "database", status: "fresh", confidence: 0.96, threshold: 900, lastMaterialized: h(0.1) },
  { key: "proof-chain", domain: "proof", source: "calculation", status: "fresh", confidence: 1.0, threshold: 7200, lastMaterialized: h(0.5) },
  { key: "connector-health", domain: "connectors", source: "connector", status: "degraded", confidence: 0.7, threshold: 300, lastMaterialized: h(0.8), degradedReason: "Meta Ads connector expired" },
  { key: "agent-telemetry", domain: "agents", source: "database", status: "fresh", confidence: 0.93, threshold: 600, lastMaterialized: h(0.15) },
  { key: "cost-ledger", domain: "costs", source: "calculation", status: "fresh", confidence: 1.0, threshold: 3600, lastMaterialized: h(0.4) },
  { key: "digital-presence", domain: "presence", source: "connector", status: "stale", confidence: 0.65, threshold: 7200, lastMaterialized: h(8) },
  { key: "store-catalog", domain: "store", source: "database", status: "fresh", confidence: 0.99, threshold: 14400, lastMaterialized: h(1) },
  { key: "workflow-states", domain: "workflows", source: "database", status: "fresh", confidence: 1.0, threshold: 300, lastMaterialized: h(0.02) },
];

interface DegradedState {
  domain: string;
  component: string;
  severity: "info" | "warning" | "critical";
  reason: string;
  impact: string;
  capabilities: string[];
  detected: string;
  resolved: boolean;
}

const DEGRADED_STATES: DegradedState[] = [
  { domain: "connectors", component: "Meta Ads", severity: "warning", reason: "OAuth token expired — reconnection needed", impact: "Ad campaign data not syncing", capabilities: ["meta-ads-sync", "meta-ads-reporting"], detected: h(24), resolved: false },
  { domain: "presence", component: "Site Audit", severity: "info", reason: "Last full site audit was 8 hours ago — threshold is 4h", impact: "SEO/performance scores may be stale", capabilities: ["seo-audit", "performance-score"], detected: h(4), resolved: false },
];

interface LaunchGate {
  name: string;
  category: string;
  required: boolean;
  status: "passed" | "failed" | "pending" | "skipped" | "overridden";
  evidence: string;
  lastChecked: string | null;
  owner: string;
  blockingReason?: string;
}

const LAUNCH_GATES: LaunchGate[] = [
  { name: "RLS on all tables", category: "security", required: true, status: "passed", evidence: "Supabase linter — 0 critical issues", lastChecked: h(0.5), owner: "security-trust" },
  { name: "Auth flow functional", category: "auth", required: true, status: "passed", evidence: "Login/register/logout tested end-to-end", lastChecked: h(1), owner: "reliability-ops" },
  { name: "All domains have projections", category: "data", required: true, status: "passed", evidence: "12/12 domains have materialized projections", lastChecked: h(0.3), owner: "architecture-governance" },
  { name: "Receipt coverage ≥80%", category: "proof", required: true, status: "passed", evidence: "Receipt coverage at 85% (34/40 capabilities)", lastChecked: h(2), owner: "security-trust" },
  { name: "Connector health ≥90%", category: "connectors", required: false, status: "failed", evidence: "4/5 connectors healthy (80%)", lastChecked: h(0.1), owner: "reliability-ops", blockingReason: "Meta Ads connector expired" },
  { name: "No critical degraded states", category: "health", required: true, status: "passed", evidence: "0 critical degraded states active", lastChecked: h(0.1), owner: "reliability-ops" },
  { name: "Audit log coverage", category: "audit", required: true, status: "passed", evidence: "All mutation paths produce audit entries", lastChecked: h(4), owner: "security-trust" },
  { name: "Safe mode functional", category: "safety", required: true, status: "passed", evidence: "Safe mode toggle tested — pauses all automation", lastChecked: h(12), owner: "reliability-ops" },
  { name: "Canary deployment ring", category: "deployment", required: false, status: "pending", evidence: "Not yet implemented — scaffold only", lastChecked: null, owner: "product-build" },
  { name: "Performance budget met", category: "performance", required: false, status: "skipped", evidence: "No performance budget defined yet", lastChecked: null, owner: "product-build" },
];

interface ProofCoverage {
  domain: string;
  total: number;
  covered: number;
  capabilities: { name: string; hasReceipt: boolean }[];
}

const PROOF_COVERAGE: ProofCoverage[] = [
  { domain: "business", total: 8, covered: 7, capabilities: [
    { name: "create-customer", hasReceipt: true }, { name: "update-customer", hasReceipt: true },
    { name: "create-deal", hasReceipt: true }, { name: "create-invoice", hasReceipt: true },
    { name: "send-invoice", hasReceipt: true }, { name: "record-payment", hasReceipt: true },
    { name: "create-lead", hasReceipt: true }, { name: "bulk-import", hasReceipt: false },
  ]},
  { domain: "money", total: 6, covered: 6, capabilities: [
    { name: "create-budget", hasReceipt: true }, { name: "record-expense", hasReceipt: true },
    { name: "categorize-transaction", hasReceipt: true }, { name: "create-bill", hasReceipt: true },
    { name: "mark-bill-paid", hasReceipt: true }, { name: "update-allocation", hasReceipt: true },
  ]},
  { domain: "concierge", total: 5, covered: 4, capabilities: [
    { name: "create-booking", hasReceipt: true }, { name: "cancel-booking", hasReceipt: true },
    { name: "create-event", hasReceipt: true }, { name: "send-communication", hasReceipt: true },
    { name: "manage-subscription", hasReceipt: false },
  ]},
  { domain: "connectors", total: 4, covered: 3, capabilities: [
    { name: "connect-provider", hasReceipt: true }, { name: "disconnect-provider", hasReceipt: true },
    { name: "sync-data", hasReceipt: true }, { name: "rotate-credentials", hasReceipt: false },
  ]},
  { domain: "advisors", total: 5, covered: 4, capabilities: [
    { name: "advisor-request", hasReceipt: true }, { name: "advisor-response", hasReceipt: true },
    { name: "approval-decision", hasReceipt: true }, { name: "knowledge-update", hasReceipt: true },
    { name: "feedback-correction", hasReceipt: false },
  ]},
  { domain: "presence", total: 6, covered: 4, capabilities: [
    { name: "create-site", hasReceipt: true }, { name: "publish-page", hasReceipt: true },
    { name: "update-brand-kit", hasReceipt: true }, { name: "run-audit", hasReceipt: true },
    { name: "create-promotion", hasReceipt: false }, { name: "rollback-publish", hasReceipt: false },
  ]},
  { domain: "agents", total: 6, covered: 5, capabilities: [
    { name: "agent-action", hasReceipt: true }, { name: "agent-escalation", hasReceipt: true },
    { name: "agent-schedule", hasReceipt: true }, { name: "agent-signal", hasReceipt: true },
    { name: "agent-suspension", hasReceipt: true }, { name: "agent-override", hasReceipt: false },
  ]},
];

interface TruthSyncEntry {
  type: string;
  path: string;
  inSync: boolean;
  drift?: string;
  lastChecked: string;
}

const TRUTH_SYNC: TruthSyncEntry[] = [
  { type: "service-manifest", path: "generated/service-manifest.json", inSync: true, lastChecked: h(0.5) },
  { type: "capability-index", path: "generated/capability-index.json", inSync: true, lastChecked: h(0.5) },
  { type: "advisor-registry", path: "generated/advisor-registry.json", inSync: true, lastChecked: h(1) },
  { type: "connector-catalog", path: "generated/connector-catalog.json", inSync: false, drift: "2 new connectors not in catalog", lastChecked: h(6) },
  { type: "event-catalog", path: "generated/event-catalog.json", inSync: true, lastChecked: h(2) },
  { type: "contract-registry", path: "generated/contract-registry.json", inSync: true, lastChecked: h(1) },
];

// ── Sub-components ──────────────────────────────────────────────

function TruthScoreHero() {
  const fresh = PROJECTIONS.filter(p => p.status === "fresh").length;
  const total = PROJECTIONS.length;
  const pct = Math.round((fresh / total) * 100);
  const activeDegraded = DEGRADED_STATES.filter(d => !d.resolved).length;
  const gatesPassed = LAUNCH_GATES.filter(g => g.status === "passed").length;
  const gatesTotal = LAUNCH_GATES.length;
  const proofTotal = PROOF_COVERAGE.reduce((s, d) => s + d.total, 0);
  const proofCovered = PROOF_COVERAGE.reduce((s, d) => s + d.covered, 0);
  const syncInSync = TRUTH_SYNC.filter(t => t.inSync).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
<Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className={cn("text-2xl font-bold", pct >= 90 ? "text-green-400" : pct >= 70 ? "text-amber-400" : "text-red-400")}>{pct}%</p>
          <p className="text-[9px] text-muted-foreground">Projection Freshness</p>
          <p className="text-[9px] text-muted-foreground">{fresh}/{total} fresh</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className={cn("text-2xl font-bold", activeDegraded === 0 ? "text-green-400" : "text-amber-400")}>{activeDegraded}</p>
          <p className="text-[9px] text-muted-foreground">Degraded States</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{gatesPassed}/{gatesTotal}</p>
          <p className="text-[9px] text-muted-foreground">Launch Gates Passed</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{Math.round((proofCovered / proofTotal) * 100)}%</p>
          <p className="text-[9px] text-muted-foreground">Receipt Coverage</p>
          <p className="text-[9px] text-muted-foreground">{proofCovered}/{proofTotal}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className={cn("text-2xl font-bold", syncInSync === TRUTH_SYNC.length ? "text-green-400" : "text-amber-400")}>{syncInSync}/{TRUTH_SYNC.length}</p>
          <p className="text-[9px] text-muted-foreground">Manifests In Sync</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{PROJECTIONS.reduce((s, p) => s + p.confidence, 0) / PROJECTIONS.length > 0.9 ? "High" : "Medium"}</p>
          <p className="text-[9px] text-muted-foreground">Avg Confidence</p>
          <p className="text-[9px] text-muted-foreground">{Math.round((PROJECTIONS.reduce((s, p) => s + p.confidence, 0) / PROJECTIONS.length) * 100)}%</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectionStatesPanel() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Projection States</h3>
        <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6"><RefreshCw className="w-3 h-3" /> Refresh All</Button>
      </div>
      {PROJECTIONS.map(p => (
        <div key={p.key} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">{p.key}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{p.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StalenessIndicator lastUpdated={p.lastMaterialized} thresholdSeconds={p.threshold} />
            <TruthBadge status={p.status} source={p.source} confidence={p.confidence} lastUpdated={p.lastMaterialized ?? undefined} stalenessThresholdSeconds={p.threshold} degradedReason={p.degradedReason} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DegradedStatesPanel() {
  const active = DEGRADED_STATES.filter(d => !d.resolved);
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-foreground">Active Degraded States ({active.length})</h3>
      {active.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground bg-green-500/5 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" /> No active degraded states
        </div>
      ) : (
        active.map((d, i) => (
          <DegradedStateBanner key={i} severity={d.severity} reason={d.reason} impact={d.impact} affectedCapabilities={d.capabilities} dismissible={false} />
        ))
      )}
    </div>
  );
}

function LaunchGatesPanel() {
  const categories = [...new Set(LAUNCH_GATES.map(g => g.category))];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Launch Gates</h3>
        <Button variant="ghost" size="sm" className="text-[10px] gap-1 h-6"><Target className="w-3 h-3" /> Run All Gates</Button>
      </div>
      {categories.map(cat => (
        <div key={cat} className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">{cat}</p>
          {LAUNCH_GATES.filter(g => g.category === cat).map(gate => (
            <div key={gate.name} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2">
                {gate.status === "passed" ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> :
                 gate.status === "failed" ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
                 gate.status === "pending" ? <Clock className="w-3.5 h-3.5 text-muted-foreground" /> :
                 <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                <div>
                  <p className="text-xs text-foreground">{gate.name}</p>
                  <p className="text-[10px] text-muted-foreground">{gate.evidence}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gate.required && <Badge variant="outline" className="text-[8px]">Required</Badge>}
                <Badge variant={gate.status === "passed" ? "default" : gate.status === "failed" ? "destructive" : "secondary"} className="text-[9px] capitalize">{gate.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProofCoveragePanel() {
  const total = PROOF_COVERAGE.reduce((s, d) => s + d.total, 0);
  const covered = PROOF_COVERAGE.reduce((s, d) => s + d.covered, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">Proof/Receipt Coverage Matrix</h3>
        <Badge variant="outline" className="text-[10px]">{covered}/{total} ({Math.round((covered / total) * 100)}%)</Badge>
      </div>
      {PROOF_COVERAGE.map(domain => (
        <Card key={domain.domain} className="bg-card/50 border-border/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground capitalize">{domain.domain}</p>
              <div className="flex items-center gap-2">
                <Progress value={(domain.covered / domain.total) * 100} className="w-20 h-1.5" />
                <span className="text-[10px] text-muted-foreground">{domain.covered}/{domain.total}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {domain.capabilities.map(cap => (
                <Badge key={cap.name} variant="outline" className={cn("text-[9px]", cap.hasReceipt ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400")}>
                  {cap.hasReceipt ? "✓" : "✗"} {cap.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TruthSyncPanel() {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-foreground">Generated Truth Sync</h3>
      {TRUTH_SYNC.map(entry => (
        <div key={entry.type} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            {entry.inSync ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
            <div>
              <p className="text-xs text-foreground">{entry.type}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{entry.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {entry.drift && <span className="text-[10px] text-amber-400">{entry.drift}</span>}
            <StalenessIndicator lastUpdated={entry.lastChecked} thresholdSeconds={3600} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MutationReceiptsPanel() {
  const recentReceipts = [
    { type: "create-customer", domain: "business", actor: "user", target: "customer/cust-789", status: "completed", time: h(0.1), hash: "a3f8...c2d1" },
    { type: "approval-decision", domain: "governance", actor: "user", target: "approval/apr-123", status: "completed", time: h(0.3), hash: "b7e2...f4a9" },
    { type: "sync-data", domain: "connectors", actor: "system", target: "connection/conn-1", status: "completed", time: h(0.5), hash: "c1d3...e5b7" },
    { type: "agent-action", domain: "agents", actor: "agent:health-monitor", target: "health-check/hc-456", status: "completed", time: h(0.8), hash: "d4f6...a8c0" },
    { type: "publish-page", domain: "presence", actor: "user", target: "page/pg-321", status: "completed", time: h(1.2), hash: "e9b1...d3f5" },
    { type: "create-invoice", domain: "business", actor: "user", target: "invoice/inv-654", status: "completed", time: h(2), hash: "f2c4...b6e8" },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-foreground">Recent Mutation Receipts</h3>
      {recentReceipts.map((r, i) => (
        <div key={i} className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-3">
            <FileCheck className="w-3.5 h-3.5 text-primary" />
            <div>
              <p className="text-xs text-foreground">{r.type}</p>
              <p className="text-[10px] text-muted-foreground">{r.target}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[9px] capitalize">{r.domain}</Badge>
            <Badge variant="outline" className="text-[9px]">{r.actor}</Badge>
            <span className="text-[10px] font-mono text-muted-foreground">{r.hash}</span>
            <StalenessIndicator lastUpdated={r.time} thresholdSeconds={3600} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────

export default function PlatformTruthDashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-5">
      <h1 className="sr-only">Platform Truth Dashboard</h1>
      <TruthScoreHero />

      {/* Active degraded states always visible */}
      {DEGRADED_STATES.some(d => !d.resolved) && (
        <div className="space-y-2">
          {DEGRADED_STATES.filter(d => !d.resolved).map((d, i) => (
            <DegradedStateBanner key={i} severity={d.severity} reason={`${d.component}: ${d.reason}`} impact={d.impact} affectedCapabilities={d.capabilities} dismissible={false} />
          ))}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30 border border-border/40 h-8 p-0.5 gap-0.5 flex-wrap">
          {[
            { value: "overview", label: "Projections", icon: Database },
            { value: "proof", label: "Proof Matrix", icon: Shield },
            { value: "receipts", label: "Receipts", icon: FileCheck },
            { value: "gates", label: "Launch Gates", icon: Rocket },
            { value: "sync", label: "Truth Sync", icon: GitBranch },
            { value: "degraded", label: "Degraded", icon: AlertTriangle },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-[10px] h-7 px-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm gap-1">
              <t.icon className="h-3 w-3" />{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview"><ProjectionStatesPanel /></TabsContent>
          <TabsContent value="proof"><ProofCoveragePanel /></TabsContent>
          <TabsContent value="receipts"><MutationReceiptsPanel /></TabsContent>
          <TabsContent value="gates"><LaunchGatesPanel /></TabsContent>
          <TabsContent value="sync"><TruthSyncPanel /></TabsContent>
          <TabsContent value="degraded"><DegradedStatesPanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
