import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, GitBranch, Cpu, Play, Receipt, CheckCircle2, Radio, Layers,
  Brain, Plug, LayoutDashboard, Wrench, Calculator, ChevronRight,
  Activity, Zap, AlertTriangle, Lock, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { PageShell } from "@/platform/sita/components/sita/PageShell";

// ── Service Module Definitions ─────────────────────────────────

interface ServiceModule {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  fileCount: number;
  category: "engine" | "infrastructure" | "data" | "domain";
  status: "healthy" | "degraded" | "offline";
  dependencies: string[];
  capabilities: string[];
  riskTier: "standard" | "elevated" | "critical";
}

const SERVICE_MODULES: ServiceModule[] = [
  {
    id: "policy-engine", name: "Policy Engine", icon: Shield,
    description: "Truth boundaries, approval requirements, sensitive document classification, outbound communication validation",
    fileCount: 4, category: "engine", status: "healthy",
    dependencies: ["policy-contracts"],
    capabilities: ["truth-boundary-eval", "approval-resolution", "doc-classification", "outbound-validation"],
    riskTier: "critical",
  },
  {
    id: "approval-engine", name: "Approval Engine", icon: Lock,
    description: "Request lifecycle, routing with delegation chains, escalation rules, history and metrics",
    fileCount: 4, category: "engine", status: "healthy",
    dependencies: ["policy-engine", "event-bus"],
    capabilities: ["approval-requests", "approval-routing", "escalation", "history-metrics"],
    riskTier: "critical",
  },
  {
    id: "capability-router", name: "Capability Router", icon: GitBranch,
    description: "Capability registry, pack enablement with entitlement tiers, shell space routing",
    fileCount: 3, category: "infrastructure", status: "healthy",
    dependencies: ["entitlements", "shell-grammar"],
    capabilities: ["capability-registry", "pack-enablement", "shell-routing"],
    riskTier: "standard",
  },
  {
    id: "executor-service", name: "Executor Service", icon: Play,
    description: "Idempotent action execution, workflow step advancement, connector action execution",
    fileCount: 3, category: "engine", status: "healthy",
    dependencies: ["capability-router", "policy-engine", "connector-control-plane"],
    capabilities: ["action-execution", "workflow-steps", "connector-actions"],
    riskTier: "elevated",
  },
  {
    id: "receipt-service", name: "Receipt Service", icon: Receipt,
    description: "Hash-chained receipts, proof bundle assembly, approval and execution proofs",
    fileCount: 4, category: "data", status: "healthy",
    dependencies: ["proof-model", "executor-service"],
    capabilities: ["receipt-creation", "proof-bundles", "approval-receipts", "execution-receipts"],
    riskTier: "standard",
  },
  {
    id: "verification-engine", name: "Verification Engine", icon: CheckCircle2,
    description: "Expected vs actual comparison, rollback signal detection, postcondition checks",
    fileCount: 3, category: "engine", status: "healthy",
    dependencies: ["receipt-service", "proof-model"],
    capabilities: ["verification", "rollback-signals", "postcondition-checks"],
    riskTier: "elevated",
  },
  {
    id: "event-bus", name: "Event Bus", icon: Radio,
    description: "Envelope factory, in-memory pub/sub, subscription management with filtering",
    fileCount: 3, category: "infrastructure", status: "healthy",
    dependencies: ["event-types"],
    capabilities: ["event-envelopes", "pub-sub", "subscriptions"],
    riskTier: "standard",
  },
  {
    id: "projections", name: "Projections", icon: Layers,
    description: "8 domain projections aggregating data into view-ready shapes for all surfaces",
    fileCount: 8, category: "data", status: "healthy",
    dependencies: ["brain-core", "business-os", "finance-os", "concierge-os"],
    capabilities: ["home-pulse", "business-projection", "money-projection", "concierge-projection", "advisor-projection", "boardroom-projection", "proof-projection", "store-projection"],
    riskTier: "standard",
  },
  {
    id: "memory-service", name: "Memory Service", icon: Brain,
    description: "Profile, workflow, preference, boardroom, trust memory and correction tracking",
    fileCount: 6, category: "data", status: "healthy",
    dependencies: ["contracts"],
    capabilities: ["profile-memory", "workflow-memory", "preferences", "boardroom-memory", "trust-memory", "corrections"],
    riskTier: "standard",
  },
  {
    id: "connector-control-plane", name: "Connector Control Plane", icon: Plug,
    description: "11 connectors (Gmail, Calendar, CRM, Banking, Travel, etc.) plus health, auth, and fake mode",
    fileCount: 14, category: "infrastructure", status: "healthy",
    dependencies: ["policy-contracts"],
    capabilities: ["gmail", "calendar", "crm", "accounting", "banking", "travel", "cloud-drive", "signature", "forex-broker", "crypto-exchange", "wallet"],
    riskTier: "elevated",
  },
  {
    id: "boardroom-service", name: "Boardroom Service", icon: LayoutDashboard,
    description: "5 packet generators, carryover lifecycle, decision memory, advisor track composer",
    fileCount: 8, category: "domain", status: "healthy",
    dependencies: ["advisor-config", "memory-service", "projections"],
    capabilities: ["business-packet", "finance-packet", "family-packet", "opportunity-packet", "committee-packet", "carryover", "decision-memory", "advisor-tracks"],
    riskTier: "standard",
  },
  {
    id: "support-diagnostics", name: "Support Diagnostics", icon: Wrench,
    description: "Diagnostic bundles, PII-redacted summaries, replay metadata, incident classification",
    fileCount: 4, category: "infrastructure", status: "healthy",
    dependencies: ["contracts", "connector-control-plane"],
    capabilities: ["diagnostic-bundles", "support-summaries", "replay-metadata", "incident-classification"],
    riskTier: "standard",
  },
  {
    id: "sovereign-calculation", name: "Sovereign Calculation", icon: Calculator,
    description: "Reserve waterfall, AR aging, VaR/Sharpe/drawdown, regime classification, IRR/NPV/CAGR, Monte Carlo",
    fileCount: 6, category: "domain", status: "healthy",
    dependencies: [],
    capabilities: ["reserves", "receivables", "risk-metrics", "regime-classification", "financial-formulas", "scenario-engine"],
    riskTier: "critical",
  },
];

// ── Category Config ────────────────────────────────────────────

const CATEGORY_CONFIG = {
  engine: { label: "Engines", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  infrastructure: { label: "Infrastructure", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  data: { label: "Data Layer", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  domain: { label: "Domain Services", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

const RISK_BADGE = {
  standard: { label: "Standard", variant: "outline" as const },
  elevated: { label: "Elevated", variant: "secondary" as const },
  critical: { label: "Critical", variant: "destructive" as const },
};

// ── Component ──────────────────────────────────────────────────

export default function ServiceArchitectureDashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const selected = useMemo(() => SERVICE_MODULES.find((m) => m.id === selectedModule), [selectedModule]);

  const stats = useMemo(() => ({
    totalModules: SERVICE_MODULES.length,
    totalFiles: SERVICE_MODULES.reduce((a, m) => a + m.fileCount, 0),
    totalCapabilities: SERVICE_MODULES.reduce((a, m) => a + m.capabilities.length, 0),
    healthy: SERVICE_MODULES.filter((m) => m.status === "healthy").length,
    categories: Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
      key,
      ...cfg,
      count: SERVICE_MODULES.filter((m) => m.category === key).length,
    })),
  }), []);

  return (
    <PageShell>
    <div className="min-h-screen p-6 space-y-6">
{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Architecture</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalModules} modules · {stats.totalFiles} files · {stats.totalCapabilities} capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Activity className="h-3 w-3 text-emerald-400" />
            {stats.healthy}/{stats.totalModules} Healthy
          </Badge>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.categories.map((cat) => (
          <Card key={cat.key} className={`${cat.bg} ${cat.border} border`}>
            <CardContent className="p-4">
              <div className={`text-xs font-medium ${cat.color} uppercase tracking-wider`}>{cat.label}</div>
              <div className="text-2xl font-bold mt-1">{cat.count}</div>
              <div className="text-xs text-muted-foreground">modules</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Module Grid</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="capabilities">Capability Registry</TabsTrigger>
        </TabsList>

        {/* ── Module Grid ─────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_MODULES.map((mod) => {
              const catCfg = CATEGORY_CONFIG[mod.category];
              const isSelected = selectedModule === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "ring-2 ring-primary shadow-lg" : "hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedModule(isSelected ? null : mod.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${catCfg.bg}`}>
                            <mod.icon className={`h-4 w-4 ${catCfg.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold">{mod.name}</CardTitle>
                            <span className={`text-[10px] uppercase tracking-wider ${catCfg.color}`}>{catCfg.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge {...RISK_BADGE[mod.riskTier]} className="text-[10px] h-5">
                            {RISK_BADGE[mod.riskTier].label}
                          </Badge>
                          <div className={`h-2 w-2 rounded-full ${
                            mod.status === "healthy" ? "bg-emerald-400" : mod.status === "degraded" ? "bg-amber-400" : "bg-red-400"
                          }`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{mod.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{mod.fileCount} files</span>
                        <span>{mod.capabilities.length} capabilities</span>
                        <span>{mod.dependencies.length} deps</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${CATEGORY_CONFIG[selected.category].bg}`}>
                        <selected.icon className={`h-6 w-6 ${CATEGORY_CONFIG[selected.category].color}`} />
                      </div>
                      <div>
                        <CardTitle>{selected.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{selected.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.capabilities.map((cap) => (
                            <Badge key={cap} variant="outline" className="text-[10px]">
                              <Zap className="h-2.5 w-2.5 mr-1" />
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Dependencies</h4>
                        {selected.dependencies.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No dependencies (standalone)</p>
                        ) : (
                          <div className="space-y-1">
                            {selected.dependencies.map((dep) => (
                              <div key={dep} className="flex items-center gap-1.5 text-xs">
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono text-muted-foreground">{dep}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Status</h4>
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${
                              selected.status === "healthy" ? "bg-emerald-400" : "bg-amber-400"
                            }`} />
                            <span className="text-sm font-medium capitalize">{selected.status}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Risk Tier</h4>
                          <Badge {...RISK_BADGE[selected.riskTier]}>{RISK_BADGE[selected.riskTier].label}</Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Files</h4>
                          <span className="text-sm font-medium">{selected.fileCount} service files</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Dependencies ─────────────────────────────────── */}
        <TabsContent value="dependencies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dependency Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {SERVICE_MODULES.map((mod) => {
                    const catCfg = CATEGORY_CONFIG[mod.category];
                    const dependedOnBy = SERVICE_MODULES.filter((m) => m.dependencies.includes(mod.id));
                    return (
                      <div key={mod.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50">
                        <div className={`p-2 rounded-lg ${catCfg.bg} shrink-0`}>
                          <mod.icon className={`h-4 w-4 ${catCfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{mod.name}</span>
                            <Badge variant="outline" className="text-[10px] h-4">{mod.fileCount} files</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-muted-foreground font-medium">Depends on: </span>
                              {mod.dependencies.length === 0 ? (
                                <span className="text-emerald-400">None (leaf)</span>
                              ) : (
                                <span className="font-mono">{mod.dependencies.join(", ")}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-muted-foreground font-medium">Used by: </span>
                              {dependedOnBy.length === 0 ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <span className="font-mono">{dependedOnBy.map((m) => m.id).join(", ")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Capability Registry ─────────────────────────── */}
        <TabsContent value="capabilities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Capability Registry
                <Badge variant="outline" className="ml-2 text-xs">{stats.totalCapabilities} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {SERVICE_MODULES.map((mod) => {
                    const catCfg = CATEGORY_CONFIG[mod.category];
                    return (
                      <div key={mod.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <mod.icon className={`h-3.5 w-3.5 ${catCfg.color}`} />
                          <span className="text-sm font-semibold">{mod.name}</span>
                          <Badge {...RISK_BADGE[mod.riskTier]} className="text-[10px] h-4">
                            {RISK_BADGE[mod.riskTier].label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 ml-5">
                          {mod.capabilities.map((cap) => (
                            <Badge key={`${mod.id}-${cap}`} variant="outline" className="text-[10px] font-mono">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PageShell>
  );
}
