import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/components/sita/SitaCard";
import { KPITile, SitaTabs, TimelineItem, EmptyState } from "@/components/sita/SitaComponents";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDataMode } from "@/contexts/DataModeContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockAITeam, mockCosts, mockConnectors } from "@/lib/mocks";
import {
  useAdminIncidents, useAcknowledgeIncident, useResolveIncident, useCreateIncident,
  useAdminPolicies, useCreatePolicy, useSimulatePolicy,
  useAdminAuditLogs, useExportAuditLogs,
  useFleetHealth, useRestartDevice,
  useCouncilDecisions, useCouncilVote,
  useAdminIntelligence,
  useInternalAgents, useAgentControls,
  useTrustCenter, useReleases, useModelRouting, useKnowledgeHealth,
  useSupportCases, useChangeReview, useRollbackCenter, useServiceMap,
} from "@/hooks/use-admin-data";
import {
  AUTONOMY_TIERS, NEVER_ALLOWED, DESIGN_DRIFT_CHECKLIST, WATCHDOG_CONCERNS, getAutonomyLevel,
  MAY_AUTO_EXECUTE, MUST_SIMULATE_FIRST, PROMOTION_RULES, DEMOTION_TRIGGERS, MUST_REQUIRE_HUMAN_APPROVAL,
} from "@/lib/internal-agents/rights";
import { validateLaunchReadiness, getCouncilSummary, getAllCouncilSummaries, ACTION_PIPELINE_STATES } from "@/lib/internal-agents/launch-readiness";
import type { InternalAgentCouncil, InternalAgentDefinition } from "@/lib/internal-agents/types";
import {
  Shield, Activity, Wifi, CheckCircle, AlertTriangle, Clock, Eye, Lock, Cpu, Zap, BarChart3,
  Globe, Key, History, Users, RotateCcw, DollarSign, FileText, Server, Database, RefreshCw,
  Pause, Play, XCircle, Brain, Settings, AlertOctagon, Sparkles, ArrowRight, Search,
  Radio, Power, CloudOff, Cloud, Plus, Download, ThumbsUp, ThumbsDown, Minus,
  Laptop, Smartphone, Tablet, Monitor, HardDrive, Lightbulb, TrendingUp, TrendingDown,
  Target, Gauge, BatteryLow, BatteryFull, BatteryMedium, MapPin, RotateCw,
  ChevronRight, ChevronLeft, Filter, X, FileDown, Vote, Gavel, Scale,
  Bot, Network, ShieldCheck, Coins, Landmark, BookOpen, ChevronDown, ChevronUp, Layers,
  Rocket, GitBranch, BookMarked, Headphones, FileCheck, Map, ExternalLink
} from "lucide-react";

type OwnerPage = "overview" | "workforce" | "incidents" | "connectors" | "costs" | "policies" | "audit" | "fleet" | "intelligence" | "council"
  | "trust-center" | "releases" | "model-routing" | "knowledge" | "support" | "change-review" | "rollback-center" | "system-map";

const subpageFromPath = (path: string): OwnerPage => {
  const last = path.split("/").pop() || "";
  const map: Record<string, OwnerPage> = {
    "ai-team": "workforce", "internal-agents": "workforce", "workforce": "workforce",
    "incidents": "incidents", "connector-health": "connectors",
    "connectors": "connectors", "costs": "costs", "policies": "policies",
    "audit": "audit", "fleet": "fleet", "intelligence": "intelligence", "council": "council",
    "trust-center": "trust-center", "releases": "releases", "model-routing": "model-routing",
    "knowledge": "knowledge", "support": "support", "change-review": "change-review",
    "rollback-center": "rollback-center", "system-map": "system-map",
  };
  return map[last] || "overview";
};

// ═══════════════════════════════════════════════════
// SEVERITY BADGE
// ═══════════════════════════════════════════════════
const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles: Record<string, string> = {
    "SEV-1": "bg-destructive/10 text-destructive border-destructive/20",
    "SEV-2": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "SEV-3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[severity] || styles.low}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${severity === "SEV-1" || severity === "high" ? "bg-destructive" : severity === "SEV-2" || severity === "medium" ? "bg-amber-500" : "bg-blue-500"}`} />
      {severity}
    </span>
  );
};

// ═══════════════════════════════════════════════════
// DEVICE ICON
// ═══════════════════════════════════════════════════
const DeviceIcon = ({ type }: { type: string }) => {
  const icons: Record<string, typeof Monitor> = { desktop: Monitor, laptop: Laptop, tablet: Tablet, phone: Smartphone, server: HardDrive, iot: Lightbulb };
  const Icon = icons[type] || Monitor;
  return <Icon className="h-5 w-5" />;
};

const BatteryIcon = ({ level }: { level: number | null }) => {
  if (level === null) return null;
  if (level < 25) return <BatteryLow className="h-4 w-4 text-destructive" />;
  if (level < 60) return <BatteryMedium className="h-4 w-4 text-amber-500" />;
  return <BatteryFull className="h-4 w-4 text-trust-safe" />;
};

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
const OwnerCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = subpageFromPath(location.pathname);
  const { isDemoMode, toggleMode, connectors, refreshConnectors } = useDataMode();

  // Data hooks
  const { data: incidentData } = useAdminIncidents();
  const { data: policyData } = useAdminPolicies();
  const { data: auditData } = useAdminAuditLogs();
  const { data: fleetData } = useFleetHealth();
  const { data: councilData } = useCouncilDecisions();
  const { data: intelligenceData } = useAdminIntelligence();
  const { data: workforceData } = useInternalAgents();
  const agentControls = useAgentControls();
  const { data: trustData } = useTrustCenter();
  const { data: releasesData } = useReleases();
  const { data: modelData } = useModelRouting();
  const { data: knowledgeData } = useKnowledgeHealth();
  const { data: supportData } = useSupportCases();
  const { data: changeData } = useChangeReview();
  const { data: rollbackData } = useRollbackCenter();
  const { data: serviceMapData } = useServiceMap();

  // Mutations
  const acknowledgeIncident = useAcknowledgeIncident();
  const resolveIncident = useResolveIncident();
  const createIncident = useCreateIncident();
  const createPolicy = useCreatePolicy();
  const simulatePolicy = useSimulatePolicy();
  const exportAudit = useExportAuditLogs();
  const restartDevice = useRestartDevice();
  const councilVote = useCouncilVote();

  // Local state for dialogs
  const [resolveDialog, setResolveDialog] = useState<{ open: boolean; incidentId: string }>({ open: false, incidentId: "" });
  const [rootCause, setRootCause] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [createIncidentDialog, setCreateIncidentDialog] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: "", severity: "SEV-2", impact: "", description: "" });
  const [createPolicyDialog, setCreatePolicyDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: "", category: "money", conditions: "{}", approval_required: false });
  const [simulatorDialog, setSimulatorDialog] = useState(false);
  const [simInput, setSimInput] = useState({ domain: "money", action: "pay_bill", amount: 100 });
  const [simResult, setSimResult] = useState<any>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCouncil, setSelectedCouncil] = useState<InternalAgentCouncil | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [workforceView, setWorkforceView] = useState<"councils" | "rights" | "watchdog" | "readiness">("councils");

  const incidents = incidentData?.incidents || [];
  const policies = policyData?.policies || [];
  const auditLogs = auditData?.logs || [];
  const devices = fleetData?.devices || [];
  const decisions = councilData?.decisions || [];

  const openIncidents = incidents.filter((i: any) => i.status === "open").length;

  const goTo = (key: string) => {
    const routeMap: Record<string, string> = {
      overview: "/owner", workforce: "/owner/internal-agents", incidents: "/owner/incidents",
      connectors: "/owner/connector-health", costs: "/owner/costs", policies: "/owner/policies",
      audit: "/owner/audit", fleet: "/owner/fleet", intelligence: "/owner/intelligence",
      council: "/owner/council", "trust-center": "/owner/trust-center", releases: "/owner/releases",
      "model-routing": "/owner/model-routing", knowledge: "/owner/knowledge", support: "/owner/support",
      "change-review": "/owner/change-review", "rollback-center": "/owner/rollback-center",
      "system-map": "/owner/system-map",
    };
    navigate(routeMap[key] || "/owner");
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "incidents", label: "Incidents", count: openIncidents },
    { key: "intelligence", label: "Intelligence" },
    { key: "policies", label: "Policies" },
    { key: "fleet", label: "Fleet" },
    { key: "council", label: "Council", count: (councilData?.summary?.pending || 0) },
    { key: "audit", label: "Audit" },
    { key: "workforce", label: "Workforce", count: workforceData?.summary?.totalAgents },
    { key: "connectors", label: "Connectors" },
    { key: "costs", label: "Costs" },
    { key: "trust-center", label: "Trust" },
    { key: "releases", label: "Releases" },
    { key: "model-routing", label: "Models" },
    { key: "knowledge", label: "Knowledge" },
    { key: "support", label: "Support" },
    { key: "change-review", label: "Changes" },
    { key: "rollback-center", label: "Rollback" },
    { key: "system-map", label: "System Map" },
  ];

  const councilIcons: Record<string, typeof Bot> = {
    "product-build": Layers,
    "reliability-ops": Server,
    "security-trust": ShieldCheck,
    "runtime-cost": Coins,
    "architecture-governance": Landmark,
    "knowledge-coordination": BookOpen,
  };

  return (
    <motion.div className="mx-auto max-w-6xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SitaPageHeader
        title="Owner Control Center"
        subtitle="Full admin control — incidents, intelligence, policies, fleet, council, and governance"
        actions={
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${isDemoMode ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
              <div className={`h-2 w-2 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              {isDemoMode ? "Demo Mode" : "Live Mode"}
            </div>
            <SitaButton variant="secondary"><RefreshCw className="h-4 w-4" /> Refresh</SitaButton>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="System Health" value={openIncidents === 0 ? "100%" : openIncidents <= 2 ? "94%" : "82%"} trend={openIncidents === 0 ? "up" : "down"} icon={Shield} className="gradient-sita-subtle" />
        <KPITile label="Open Incidents" value={openIncidents} icon={AlertTriangle} sub={openIncidents > 0 ? `${incidents.filter((i: any) => i.severity === "SEV-1").length} critical` : "All clear"} />
        <KPITile label="Fleet Devices" value={`${fleetData?.kpis?.online || 0}/${fleetData?.kpis?.total || 0}`} sub="Online" icon={Server} />
        <KPITile label="Active Policies" value={policyData?.summary?.active || 0} icon={Shield} />
        <KPITile label="Anomalies" value={intelligenceData?.anomalies?.total_anomalies || 0} icon={Zap} sub={`${intelligenceData?.anomalies?.severity_summary?.critical || 0} critical`} />
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-2 px-2">
        <SitaTabs tabs={tabs} active={activePage} onChange={goTo} />
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════ */}
        {/* OVERVIEW */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* ── What Matters Now ── */}
            <SitaCard hover={false} glow className="p-5 border-primary/10 bg-primary/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-foreground">What Matters Now</p>
                  <p className="text-xs text-muted-foreground">Prioritized decisions needing your attention</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { text: "2 invoices overdue — total $4,200. Auto-reminder ready to send.", risk: "high" as const, action: "Send Reminders", ignore: "Late fees may apply. Cash flow impact in 5 days." },
                  { text: "Connector 'Stripe' degraded — last sync 4 hours ago.", risk: "medium" as const, action: "Check Health", ignore: "Payment processing may miss recent transactions." },
                  { text: "Council vote pending: approve Growth Advisor autonomy upgrade.", risk: "low" as const, action: "Review Vote", ignore: "Growth recommendations stay in suggest-only mode." },
                  openIncidents > 0 ? { text: `${openIncidents} open incident${openIncidents > 1 ? "s" : ""} — ${incidents.filter((i: any) => i.severity === "SEV-1").length} critical.`, risk: "critical" as const, action: "View Incidents", ignore: "System health may degrade without intervention." } : null,
                ].filter(Boolean).slice(0, 4).map((item: any, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border/30 bg-secondary/20 p-3 transition-all hover:bg-secondary/30">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${item.risk === "critical" ? "bg-destructive animate-pulse" : item.risk === "high" ? "bg-orange-500" : item.risk === "medium" ? "bg-amber-500" : "bg-blue-500"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">If ignored: {item.ignore}</p>
                      </div>
                    </div>
                    <SitaButton variant="accent" size="sm" className="shrink-0 text-[11px]">{item.action}</SitaButton>
                  </div>
                ))}
              </div>
            </SitaCard>

            {/* ── Revenue / Risk / AI Spend ── */}
            <div className="grid gap-3 sm:grid-cols-3">
              <SitaCard hover={false} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue (30d)</span>
                </div>
                <p className="text-2xl font-bold text-foreground">$47,200</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-medium">+12% vs last month</span>
                </div>
                <div className="flex gap-0.5 mt-2 h-6">
                  {[40, 55, 35, 60, 72, 65, 80, 75, 68, 82, 90, 85].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-primary/20 relative overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-primary/50 rounded-sm" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </SitaCard>

              <SitaCard hover={false} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</span>
                </div>
                <p className="text-2xl font-bold text-foreground">Low</p>
                <p className="text-[11px] text-muted-foreground mt-1">1 connector degraded · 0 policy violations</p>
                <div className="flex gap-0.5 mt-2 h-6">
                  {[10, 15, 8, 12, 20, 18, 10, 5, 8, 12, 15, 10].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-amber-500/10 relative overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-amber-500/30 rounded-sm" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </SitaCard>

              <SitaCard hover={false} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-sita-purple" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Spend (30d)</span>
                </div>
                <p className="text-2xl font-bold text-foreground">$128</p>
                <p className="text-[11px] text-muted-foreground mt-1">~4,200 requests · avg 30 tokens/req</p>
                <div className="flex gap-0.5 mt-2 h-6">
                  {[30, 40, 35, 45, 50, 42, 38, 55, 48, 52, 45, 40].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-primary/10 relative overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-primary/30 rounded-sm" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>

            {/* ── Platform Maturity + Safe Mode + Undo ── */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Platform Maturity Gauge */}
              <SitaCard hover={false} className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Maturity</p>
                <div className="flex items-center justify-center">
                  <div className="relative h-28 w-28">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-secondary" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-primary" strokeDasharray={`${0.82 * 264} 264`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">82</span>
                      <span className="text-[9px] text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-3 text-[10px]">
                  {[{ l: "Agent Health", v: 95 }, { l: "Connectors", v: 75 }, { l: "Policies", v: 88 }, { l: "Test Coverage", v: 70 }].map(m => (
                    <div key={m.l} className="flex items-center justify-between px-2 py-1 rounded bg-secondary/30">
                      <span className="text-muted-foreground">{m.l}</span>
                      <span className="font-semibold text-foreground">{m.v}%</span>
                    </div>
                  ))}
                </div>
              </SitaCard>

              {/* Operating Mode + Safe Mode */}
              <SitaCard hover={false} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDemoMode ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                      {isDemoMode ? <CloudOff className="h-5 w-5 text-amber-500" /> : <Cloud className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Operating Mode</p>
                      <p className="text-[10px] text-muted-foreground">{isDemoMode ? "Sample data" : "Live connections"}</p>
                    </div>
                  </div>
                  <Switch checked={!isDemoMode} onCheckedChange={toggleMode} />
                </div>

                <div className="border-t border-border/30 pt-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Power className="h-4 w-4 text-destructive" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Safe Mode</p>
                        <p className="text-[10px] text-muted-foreground">Pause all automation</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </SitaCard>

              {/* Undo Last Admin Change */}
              <SitaCard hover={false} className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last Admin Change</p>
                <div className="rounded-xl bg-secondary/30 p-3 mb-3">
                  <p className="text-xs font-medium text-foreground">Policy "High-value payments" updated</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Threshold changed from $500 → $1,000</p>
                  <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                </div>
                <SitaButton variant="secondary" className="w-full text-xs gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Undo This Change
                </SitaButton>

                <div className="mt-3 space-y-1">
                  {[
                    { text: "Advisor config: Growth Advisor → supporting", time: "Yesterday" },
                    { text: "Pack paused: Concierge Pro", time: "3 days ago" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] px-1 py-1.5 rounded hover:bg-secondary/20 transition-colors cursor-pointer">
                      <span className="text-muted-foreground truncate flex-1">{c.text}</span>
                      <span className="text-muted-foreground/50 shrink-0 ml-2">{c.time}</span>
                    </div>
                  ))}
                </div>
              </SitaCard>
            </div>

            {/* ── Quick Nav to Owner Sub-pages ── */}
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Pricing", icon: DollarSign, path: "/owner/pricing" },
                { label: "Packs", icon: Layers, path: "/owner/packs" },
                { label: "Advisors", icon: Users, path: "/owner/advisors" },
                { label: "Enterprise", icon: Globe, path: "/enterprise" },
                { label: "Incidents", icon: AlertTriangle, action: () => goTo("incidents") },
                { label: "Intelligence", icon: Brain, action: () => goTo("intelligence") },
                { label: "Fleet", icon: Server, action: () => goTo("fleet") },
                { label: "Policies", icon: Shield, action: () => goTo("policies") },
                { label: "Audit Log", icon: FileText, action: () => goTo("audit") },
                { label: "Council", icon: Gavel, action: () => goTo("council") },
              ].map((a, i) => (
                <button key={i} onClick={a.action || (() => navigate(a.path!))} className="flex items-center gap-2.5 rounded-xl border border-border/50 p-3 text-xs font-medium text-foreground transition-all hover:bg-secondary/40 hover:shadow-xs hover:border-primary/20">
                  <a.icon className="h-4 w-4 text-muted-foreground" /> {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* INCIDENTS */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "incidents" && (
          <motion.div key="incidents" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search incidents..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <SitaButton variant="accent" onClick={() => setCreateIncidentDialog(true)}>
                <Plus className="h-4 w-4" /> New Incident
              </SitaButton>
            </div>

            {incidents
              .filter((inc: any) => statusFilter === "all" || inc.status === statusFilter)
              .filter((inc: any) => !searchFilter || inc.title.toLowerCase().includes(searchFilter.toLowerCase()))
              .map((inc: any) => (
                <SitaCard key={inc.id} hover={false} className="p-5" lane={inc.status === "open" ? "action" : undefined}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{inc.id}</span>
                        <SeverityBadge severity={inc.severity} />
                        <StateBadge state={inc.status === "open" ? "executing" : inc.status === "acknowledged" ? "approval-requested" : "completed"} size="sm" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{inc.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{inc.impact}</p>
                      {inc.description && <p className="text-xs text-muted-foreground/70 mt-1 italic">{inc.description}</p>}

                      {/* Timeline */}
                      {inc.timeline && inc.timeline.length > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Timeline</p>
                          <div className="space-y-1.5">
                            {inc.timeline.slice(-3).map((entry: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px]">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="font-medium text-foreground capitalize">{entry.action}</span>
                                <span className="text-muted-foreground">by {entry.actor === "system" || entry.actor?.includes("monitor") || entry.actor?.includes("detector") ? entry.actor : "you"}</span>
                                <span className="text-muted-foreground/60 ml-auto">{new Date(entry.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {inc.root_cause && (
                        <div className="mt-3 rounded-lg bg-trust-safe/5 border border-trust-safe/10 p-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-trust-safe mb-1">Root Cause</p>
                          <p className="text-xs text-foreground">{inc.root_cause}</p>
                        </div>
                      )}
                    </div>

                    {inc.status !== "resolved" && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {inc.status === "open" && (
                          <SitaButton variant="secondary" size="sm" onClick={() => acknowledgeIncident.mutate(inc.id)}>
                            <Eye className="h-3 w-3" /> Acknowledge
                          </SitaButton>
                        )}
                        <SitaButton variant="accent" size="sm" onClick={() => { setResolveDialog({ open: true, incidentId: inc.id }); setRootCause(""); setResolveNotes(""); }}>
                          <CheckCircle className="h-3 w-3" /> Resolve
                        </SitaButton>
                      </div>
                    )}
                  </div>
                </SitaCard>
              ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* INTELLIGENCE */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "intelligence" && (
          <motion.div key="intelligence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Anomaly Detection */}
            <div>
              <SitaSectionHeader title="Anomaly Detection" subtitle="Statistical outliers detected via 6-sigma analysis" />
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                {["latency", "tokens", "confidence"].map(metric => {
                  const data = intelligenceData?.anomalies?.metrics?.[metric];
                  if (!data) return null;
                  return (
                    <SitaCard key={metric} hover={false} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric}</p>
                        {data.anomalies.length > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.anomalies.some((a: any) => a.severity === "critical") ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}`}>
                            {data.anomalies.length} anomal{data.anomalies.length === 1 ? "y" : "ies"}
                          </span>
                        )}
                      </div>
                      <p className="font-display text-2xl font-bold text-foreground">{metric === "confidence" ? data.stats.mean.toFixed(2) : data.stats.mean}</p>
                      <p className="text-[11px] text-muted-foreground">σ = {data.stats.stddev}{metric === "latency" ? "ms" : metric === "tokens" ? " tokens" : ""}</p>
                      {data.anomalies.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {data.anomalies.slice(0, 2).map((a: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground">Peak: {a.value}</span>
                              <span className={`font-bold ${a.severity === "critical" ? "text-destructive" : "text-amber-500"}`}>{a.sigma}σ</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </SitaCard>
                  );
                })}
              </div>
            </div>

            {/* Forecasts */}
            <div>
              <SitaSectionHeader title="Incident Forecasts" subtitle="Predictive analysis based on metric trends" />
              <div className="grid gap-3 sm:grid-cols-2">
                {(intelligenceData?.forecasts || []).map((f: any) => (
                  <SitaCard key={f.id} hover={false} className="p-5" lane={f.severity === "warning" ? "action" : undefined}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`rounded-xl p-2.5 ${f.severity === "warning" ? "bg-amber-500/10" : f.severity === "critical" ? "bg-destructive/10" : "bg-blue-500/10"}`}>
                        {f.type === "all-clear" ? <CheckCircle className="h-5 w-5 text-trust-safe" /> : <TrendingUp className={`h-5 w-5 ${f.severity === "warning" ? "text-amber-500" : "text-blue-500"}`} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{f.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Probability</span>
                          <span className="text-[10px] font-bold text-foreground">{Math.round(f.probability * 100)}%</span>
                        </div>
                        <Progress value={f.probability * 100} className="h-2" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">{f.timeWindow}</span>
                    </div>
                    {f.preventiveMeasures.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preventive Measures</p>
                        {f.preventiveMeasures.map((m: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] text-foreground">
                            <ChevronRight className="h-3 w-3 text-primary shrink-0" /> {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </SitaCard>
                ))}
              </div>
            </div>

            {/* Cost Optimization */}
            <div>
              <SitaSectionHeader title="Cost Optimization" subtitle="AI-powered suggestions to reduce spend" />
              <div className="grid gap-3 sm:grid-cols-2">
                {(intelligenceData?.optimization?.suggestions || []).map((s: any) => (
                  <SitaCard key={s.id} hover={false} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="rounded-xl bg-accent/10 p-2.5">
                        <DollarSign className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-accent/5 border border-accent/10 p-2.5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">Projected Savings</p>
                        <p className="text-sm font-bold text-foreground">{s.projectedSavings}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Confidence</p>
                        <p className="text-sm font-semibold text-foreground">{Math.round(s.confidence * 100)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.effort === "low" ? "bg-trust-safe/10 text-trust-safe" : "bg-amber-500/10 text-amber-500"}`}>
                        {s.effort} effort
                      </span>
                    </div>
                  </SitaCard>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* POLICIES */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "policies" && (
          <motion.div key="policies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <SitaButton variant="accent" onClick={() => setCreatePolicyDialog(true)}><Plus className="h-4 w-4" /> New Policy</SitaButton>
              <SitaButton variant="secondary" onClick={() => setSimulatorDialog(true)}><Gauge className="h-4 w-4" /> Policy Simulator</SitaButton>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {policies.map((p: any) => (
                <SitaCard key={p.id} hover={false} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{p.category}</span>
                        {p.approval_required && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Requires Approval</span>}
                        {p.version && <span className="text-[10px] text-muted-foreground">v{p.version}</span>}
                      </div>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${p.active ? "bg-trust-verified" : "bg-muted-foreground"}`} />
                  </div>
                  {p.conditions && Object.keys(p.conditions).length > 0 && (
                    <div className="rounded-lg bg-secondary/30 p-2.5 mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Conditions</p>
                      <div className="space-y-0.5">
                        {Object.entries(p.conditions).map(([k, v]: [string, any]) => (
                          <p key={k} className="text-[11px] text-foreground"><span className="text-muted-foreground">{k.replace(/_/g, " ")}:</span> {Array.isArray(v) ? v.join(", ") : String(v)}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-semibold ${p.active ? "text-trust-safe" : "text-muted-foreground"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </SitaCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* FLEET */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "fleet" && (
          <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <KPITile label="Total" value={fleetData?.kpis?.total || 0} icon={Server} />
              <KPITile label="Online" value={fleetData?.kpis?.online || 0} icon={Wifi} trend="up" />
              <KPITile label="Degraded" value={fleetData?.kpis?.degraded || 0} icon={AlertTriangle} />
              <KPITile label="Offline" value={fleetData?.kpis?.offline || 0} icon={XCircle} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {devices.map((d: any) => (
                <SitaCard key={d.device_id} hover={false} className="p-5" lane={d.health === "degraded" ? "action" : d.connectivity === "offline" ? "unresolved" : undefined}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        d.connectivity === "online" ? "bg-trust-safe/10 text-trust-safe" :
                        d.connectivity === "offline" ? "bg-destructive/10 text-destructive" :
                        "bg-amber-500/10 text-amber-500"
                      }`}>
                        <DeviceIcon type={d.type} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{d.type}</p>
                      </div>
                    </div>
                    <div className={`h-3 w-3 rounded-full ${d.connectivity === "online" ? "bg-trust-verified" : d.connectivity === "offline" ? "bg-destructive" : "bg-amber-500 animate-pulse"}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-lg bg-secondary/30 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Connectivity</p>
                      <p className="text-xs font-semibold text-foreground capitalize">{d.connectivity}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/30 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Health</p>
                      <p className="text-xs font-semibold text-foreground capitalize">{d.health}</p>
                    </div>
                  </div>

                  {d.battery !== null && (
                    <div className="flex items-center gap-2 mb-2">
                      <BatteryIcon level={d.battery} />
                      <Progress value={d.battery} className="flex-1 h-1.5" />
                      <span className="text-[10px] font-medium text-foreground">{d.battery}%</span>
                    </div>
                  )}

                  {d.issues && d.issues.length > 0 && (
                    <div className="space-y-1 mb-3">
                      {d.issues.map((issue: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-500">
                          <AlertTriangle className="h-3 w-3 shrink-0" /> {issue}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {d.last_heartbeat ? `Last seen: ${new Date(d.last_heartbeat).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : "Never seen"}
                    </span>
                    {d.connectivity !== "online" && (
                      <SitaButton variant="accent" size="sm" onClick={() => restartDevice.mutate(d.device_id)}>
                        <RotateCw className="h-3 w-3" /> Restart
                      </SitaButton>
                    )}
                  </div>
                </SitaCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* COUNCIL */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "council" && (
          <motion.div key="council" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 mb-2">
              <KPITile label="Pending" value={councilData?.summary?.pending || 0} icon={Clock} />
              <KPITile label="Approved" value={councilData?.summary?.approved || 0} icon={CheckCircle} trend="up" />
              <KPITile label="Rejected" value={councilData?.summary?.rejected || 0} icon={XCircle} />
            </div>

            {decisions.map((d: any) => (
              <SitaCard key={d.id} hover={false} className="p-5" lane={d.status === "pending" ? "action" : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gavel className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{d.title}</p>
                      <StateBadge state={d.status === "pending" ? "approval-requested" : d.status === "approved" ? "approved" : "failed"} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">{d.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{d.domain}</span>
                      {d.deadline && <span className="text-[10px] text-muted-foreground">Deadline: {new Date(d.deadline).toLocaleDateString()}</span>}
                    </div>

                    {/* Vote counts */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 text-trust-safe" />
                        <span className="text-sm font-semibold text-foreground">{d.votes_for}</span>
                        <span className="text-[10px] text-muted-foreground">for</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                        <span className="text-sm font-semibold text-foreground">{d.votes_against}</span>
                        <span className="text-[10px] text-muted-foreground">against</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{d.votes_abstained}</span>
                        <span className="text-[10px] text-muted-foreground">abstained</span>
                      </div>
                    </div>
                  </div>

                  {d.status === "pending" && (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <SitaButton variant="accent" size="sm" onClick={() => councilVote.mutate({ decisionId: d.id, vote: "for" })}>
                        <ThumbsUp className="h-3 w-3" /> Vote For
                      </SitaButton>
                      <SitaButton variant="ghost" size="sm" onClick={() => councilVote.mutate({ decisionId: d.id, vote: "against" })}>
                        <ThumbsDown className="h-3 w-3" /> Against
                      </SitaButton>
                      <SitaButton variant="ghost" size="sm" onClick={() => councilVote.mutate({ decisionId: d.id, vote: "abstain" })}>
                        <Minus className="h-3 w-3" /> Abstain
                      </SitaButton>
                    </div>
                  )}
                </div>
              </SitaCard>
            ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* AUDIT */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "audit" && (
          <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter by action..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)} className="pl-9" />
                </div>
              </div>
              <SitaButton variant="secondary" onClick={() => exportAudit.mutate({ startDate: new Date(Date.now() - 30 * 86400000).toISOString(), endDate: new Date().toISOString() })}>
                <FileDown className="h-4 w-4" /> Export CSV
              </SitaButton>
            </div>

            <SitaCard hover={false} className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timestamp</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resource</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Result</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actor</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .filter((log: any) => !searchFilter || log.action.toLowerCase().includes(searchFilter.toLowerCase()))
                      .map((log: any) => (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium text-foreground">{log.action}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{log.resource_type}/{log.resource_id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${log.result === "success" ? "bg-trust-safe/10 text-trust-safe" : "bg-destructive/10 text-destructive"}`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{log.actor_id === "system" ? "System" : "You"}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                            {log.changes && Object.keys(log.changes).length > 0 ? JSON.stringify(log.changes) : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </SitaCard>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* INTERNAL AI WORKFORCE */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "workforce" && (
          <motion.div key="workforce" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Chief of Staff Banner */}
            {(() => {
              const cos = workforceData?.supervisors?.find((s: any) => s.supervisorId === "chief-of-staff");
              return (
                <SitaCard hover={false} glow className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-bold text-foreground">Chief of Staff</p>
                        <p className="text-[11px] text-muted-foreground">Coordinating {workforceData?.summary?.totalCouncils || 6} councils · {cos?.runtime?.activeEscalations || 0} active escalations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Overrides</p>
                        <p className="text-sm font-semibold text-foreground">{cos?.runtime?.overrideCount || 0}</p>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${cos?.runtime?.status === "active" ? "bg-trust-verified" : "bg-trust-degraded animate-pulse"}`} />
                    </div>
                  </div>
                </SitaCard>
              );
            })()}

            {/* KPI Strip */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <KPITile label="Total Agents" value={workforceData?.summary?.totalAgents || 0} icon={Bot} />
              <KPITile label="Councils" value={workforceData?.summary?.totalCouncils || 0} icon={Network} />
              <KPITile label="Active" value={workforceData?.summary?.activeCount || 0} icon={CheckCircle} trend="up" />
              <KPITile label="Paused" value={workforceData?.summary?.pausedCount || 0} icon={Pause} />
              <KPITile label="Invocations" value={(workforceData?.summary?.totalInvocations || 0).toLocaleString()} icon={Zap} />
              <KPITile label="Total Cost" value={workforceData?.summary?.totalCost || "$0"} icon={DollarSign} />
            </div>

            {/* Sub-nav */}
            <div className="flex items-center gap-2">
              {(["councils", "rights", "watchdog", "readiness"] as const).map(v => (
                <button key={v} onClick={() => { setWorkforceView(v); setSelectedCouncil(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${workforceView === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {v === "councils" ? "Councils" : v === "rights" ? "Rights & Governance" : v === "watchdog" ? "Watchdog" : "Launch Readiness"}
                </button>
              ))}
            </div>

            {/* ── COUNCILS VIEW ── */}
            {workforceView === "councils" && !selectedCouncil && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(workforceData?.councils || []).map((council: any) => {
                  const councilAgents = (workforceData?.agents || []).filter((a: any) => a.council === council.councilId);
                  const activeAgents = councilAgents.filter((a: any) => a.runtime?.status === "active").length;
                  const sup = workforceData?.supervisors?.find((s: any) => s.supervisorId === council.supervisorId);
                  const CouncilIcon = councilIcons[council.councilId] || Bot;
                  const totalEscalations = councilAgents.reduce((sum: number, a: any) => sum + (a.runtime?.escalationCount || 0), 0);

                  return (
                    <SitaCard key={council.councilId} hover className="p-5 cursor-pointer" onClick={() => setSelectedCouncil(council.councilId)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                            <CouncilIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{council.name}</p>
                            <p className="text-[10px] text-muted-foreground">{council.agentCount} agents</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{council.purpose}</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-1.5 rounded-lg bg-secondary/30">
                          <p className="text-sm font-semibold text-foreground">{activeAgents}/{council.agentCount}</p>
                          <p className="text-[9px] text-muted-foreground">Active</p>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-secondary/30">
                          <p className="text-sm font-semibold text-foreground">{totalEscalations}</p>
                          <p className="text-[9px] text-muted-foreground">Escalations</p>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-secondary/30">
                          <p className="text-sm font-semibold text-foreground">{council.quorum}%</p>
                          <p className="text-[9px] text-muted-foreground">Quorum</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Supervisor: {sup?.name || "—"}</span>
                        {council.vetoAuthority && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Veto</span>
                        )}
                      </div>
                    </SitaCard>
                  );
                })}
              </div>
            )}

            {/* ── COUNCIL DRILL-DOWN ── */}
            {workforceView === "councils" && selectedCouncil && (() => {
              const council = (workforceData?.councils || []).find((c: any) => c.councilId === selectedCouncil);
              const councilAgents = (workforceData?.agents || []).filter((a: any) => a.council === selectedCouncil);
              const sup = workforceData?.supervisors?.find((s: any) => s.supervisorId === council?.supervisorId);

              return (
                <div className="space-y-4">
                  <button onClick={() => setSelectedCouncil(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Councils
                  </button>

                  {/* Supervisor Card */}
                  {sup && (
                    <SitaCard hover={false} className="p-4 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{sup.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Max {sup.maxConcurrentEscalations} escalations · {sup.canOverride ? "Can override" : "No override"} · {sup.canSuspend ? "Can suspend" : "No suspend"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Overrides</p>
                            <p className="text-sm font-semibold text-foreground">{sup.runtime?.overrideCount || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Active</p>
                            <p className="text-sm font-semibold text-foreground">{sup.runtime?.activeEscalations || 0}</p>
                          </div>
                        </div>
                      </div>
                    </SitaCard>
                  )}

                  {/* Agent Cards */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {councilAgents.map((agent: any) => {
                      const isExpanded = expandedAgent === agent.agentId;
                      const level = getAutonomyLevel(agent.maxAutonomyLevel);

                      return (
                        <SitaCard key={agent.agentId} hover={false} className="p-4" lane={agent.runtime?.status === "paused" ? "unresolved" : undefined}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`h-2.5 w-2.5 rounded-full ${agent.runtime?.status === "active" ? "bg-trust-verified" : agent.runtime?.status === "paused" ? "bg-muted-foreground" : "bg-trust-degraded animate-pulse"}`} />
                              <div>
                                <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                                <p className="text-[10px] text-muted-foreground">{agent.mission}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${level <= 1 ? "bg-blue-500/10 text-blue-500" : level <= 3 ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"}`}>
                              L{level}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            <div className="text-center p-1 rounded bg-secondary/30">
                              <p className="text-xs font-semibold text-foreground">{(agent.runtime?.invocationCount || 0).toLocaleString()}</p>
                              <p className="text-[8px] text-muted-foreground">Invocations</p>
                            </div>
                            <div className="text-center p-1 rounded bg-secondary/30">
                              <p className="text-xs font-semibold text-foreground">{Math.round((agent.runtime?.confidenceAvg || 0) * 100)}%</p>
                              <p className="text-[8px] text-muted-foreground">Confidence</p>
                            </div>
                            <div className="text-center p-1 rounded bg-secondary/30">
                              <p className="text-xs font-semibold text-foreground">{agent.runtime?.escalationCount || 0}</p>
                              <p className="text-[8px] text-muted-foreground">Escalations</p>
                            </div>
                            <div className="text-center p-1 rounded bg-secondary/30">
                              <p className="text-xs font-semibold text-foreground">${(agent.runtime?.costCompute || 0).toFixed(2)}</p>
                              <p className="text-[8px] text-muted-foreground">Cost</p>
                            </div>
                          </div>

                          <p className="text-[10px] text-muted-foreground mb-2 truncate">Last: {agent.runtime?.lastAction || "—"}</p>

                          <div className="flex items-center gap-1.5">
                            <SitaButton variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); agentControls.mutate({ agentId: agent.agentId, action: agent.runtime?.status === "active" ? "pause" : "resume" }); }}>
                              {agent.runtime?.status === "active" ? <><Pause className="h-3 w-3" /> Pause</> : <><Play className="h-3 w-3" /> Resume</>}
                            </SitaButton>
                            <SitaButton variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); agentControls.mutate({ agentId: agent.agentId, action: "toggle-simulation" }); }}>
                              <Eye className="h-3 w-3" /> {agent.runtime?.simulationOnly ? "Live" : "Sim"}
                            </SitaButton>
                            <button onClick={() => setExpandedAgent(isExpanded ? null : agent.agentId)} className="ml-auto p-1 rounded hover:bg-secondary transition-colors">
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                            </button>
                          </div>

                          {/* Expanded Contract View */}
                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-border space-y-2">
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Special Ability</p>
                                <p className="text-xs text-foreground">{agent.specialAbility}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Scope</p>
                                  <div className="flex flex-wrap gap-1">
                                    {agent.scope.slice(0, 4).map((s: string) => (
                                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Out of Scope</p>
                                  <div className="flex flex-wrap gap-1">
                                    {agent.outOfScope.slice(0, 3).map((s: string) => (
                                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/5 text-destructive">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Schedule: {agent.schedule} · Maturity: {agent.maturity}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Human Approval Required</p>
                                <div className="flex flex-wrap gap-1">
                                  {agent.humanApprovalRequirements.map((r: string) => (
                                    <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{r}</span>
                                  ))}
                                  {agent.humanApprovalRequirements.length === 0 && <span className="text-[9px] text-muted-foreground">None</span>}
                                </div>
                              </div>
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">KPIs</p>
                                <p className="text-[10px] text-foreground">{agent.measurableKpis.join(" · ")}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Rollback Authority</p>
                                <p className="text-[10px] text-foreground">{agent.rollbackAuthority}</p>
                              </div>
                            </motion.div>
                          )}
                        </SitaCard>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── RIGHTS & GOVERNANCE VIEW ── */}
            {workforceView === "rights" && (
              <div className="space-y-6">
                {/* Autonomy Ladder */}
                <div>
                  <SitaSectionHeader title="Autonomy Ladder" subtitle="7-tier rights model — agents cannot self-promote" />
                  <div className="space-y-2">
                    {AUTONOMY_TIERS.map(tier => {
                      const agentsAtLevel = (workforceData?.agents || []).filter((a: any) => getAutonomyLevel(a.maxAutonomyLevel) === tier.level);
                      return (
                        <SitaCard key={tier.level} hover={false} className="p-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg min-w-[36px] text-center ${tier.level <= 1 ? "bg-blue-500/10 text-blue-500" : tier.level <= 3 ? "bg-amber-500/10 text-amber-500" : tier.level <= 4 ? "bg-orange-500/10 text-orange-500" : "bg-destructive/10 text-destructive"}`}>
                              L{tier.level}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                                {tier.canWriteProduction && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">Can write</span>}
                              </div>
                              <p className="text-[10px] text-muted-foreground">{tier.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-foreground">{agentsAtLevel.length}</p>
                              <p className="text-[9px] text-muted-foreground">agents</p>
                            </div>
                          </div>
                        </SitaCard>
                      );
                    })}
                  </div>
                </div>

                {/* Never-Allowed */}
                <div>
                  <SitaSectionHeader title="Never-Allowed Actions" subtitle="Prohibited for ALL agents regardless of autonomy" />
                  <SitaCard hover={false} className="p-4">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {NEVER_ALLOWED.map(action => (
                        <div key={action} className="flex items-center gap-2 text-xs">
                          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <span className="text-foreground">{action}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>

                {/* Design Drift Checklist */}
                <div>
                  <SitaSectionHeader title="Design Drift Monitoring" subtitle="10-point UI quality checklist" />
                  <SitaCard hover={false} className="p-4">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {DESIGN_DRIFT_CHECKLIST.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3.5 w-3.5 text-trust-safe shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>

                {/* May Auto-Execute */}
                <div>
                  <SitaSectionHeader title="May Auto-Execute" subtitle="Actions allowed without human approval if explicitly enabled" />
                  <SitaCard hover={false} className="p-4">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {MAY_AUTO_EXECUTE.map(cat => (
                        <div key={cat} className="flex items-center gap-2 text-xs">
                          <Play className="h-3.5 w-3.5 text-trust-safe shrink-0" />
                          <span className="text-foreground">{cat}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>

                {/* Must Simulate First */}
                <div>
                  <SitaSectionHeader title="Must Simulate First" subtitle="These categories require simulation before any execution" />
                  <SitaCard hover={false} className="p-4">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {MUST_SIMULATE_FIRST.map(cat => (
                        <div key={cat} className="flex items-center gap-2 text-xs">
                          <Eye className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="text-foreground">{cat}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>

                {/* Promotion Rules */}
                <div>
                  <SitaSectionHeader title="Promotion Rules" subtitle="Requirements to escalate agent autonomy levels" />
                  <div className="space-y-2">
                    {PROMOTION_RULES.map(rule => (
                      <SitaCard key={`${rule.fromLevel}-${rule.toLevel}`} hover={false} className="p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 min-w-[36px] text-center">L{rule.fromLevel}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 min-w-[36px] text-center">L{rule.toLevel}</span>
                          <div className="flex-1 flex flex-wrap gap-1">
                            {rule.requires.map(r => (
                              <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{r}</span>
                            ))}
                          </div>
                          {rule.timeConstraint && <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{rule.timeConstraint}</span>}
                        </div>
                      </SitaCard>
                    ))}
                  </div>
                </div>

                {/* Demotion Triggers */}
                <div>
                  <SitaSectionHeader title="Demotion Triggers" subtitle="Conditions that automatically reduce agent autonomy" />
                  <SitaCard hover={false} className="p-4">
                    <div className="space-y-2">
                      {DEMOTION_TRIGGERS.map(d => (
                        <div key={d.triggerId} className="flex items-center gap-3 text-xs">
                          <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <div className="flex-1">
                            <span className="font-semibold text-foreground">{d.name}</span>
                            <span className="text-muted-foreground ml-2">— {d.description}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${d.severity === "automatic" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}`}>{d.severity}</span>
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>
              </div>
            )}

            {/* ── WATCHDOG VIEW ── */}
            {workforceView === "watchdog" && (
              <div>
                <SitaSectionHeader title="Watchdog Status" subtitle="Dedicated monitoring for critical system concerns" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {WATCHDOG_CONCERNS.map(w => {
                    const agent = (workforceData?.agents || []).find((a: any) => a.agentId === w.agentId);
                    return (
                      <SitaCard key={w.concern} hover={false} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                            <ShieldCheck className="h-5 w-5 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{w.concern}</p>
                            <p className="text-[10px] text-muted-foreground">Monitored by: {agent?.name || w.agentId}</p>
                          </div>
                          <div className={`h-3 w-3 rounded-full ${agent?.runtime?.status === "active" ? "bg-trust-verified" : "bg-trust-degraded animate-pulse"}`} />
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Response</p>
                          <p className="text-xs text-foreground">{w.response}</p>
                        </div>
                        {agent?.runtime && (
                          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                            <span>{(agent.runtime.invocationCount || 0).toLocaleString()} scans</span>
                            <span>Confidence: {Math.round((agent.runtime.confidenceAvg || 0) * 100)}%</span>
                          </div>
                        )}
                      </SitaCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── LAUNCH READINESS VIEW ── */}
            {workforceView === "readiness" && (() => {
              const readiness = validateLaunchReadiness();
              const summaries = getAllCouncilSummaries();
              return (
                <div className="space-y-6">
                  {/* Readiness Score */}
                  <SitaCard hover={false} glow className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-display text-base font-bold text-foreground">Launch Readiness</p>
                        <p className="text-xs text-muted-foreground">{readiness.passedChecks}/{readiness.totalChecks} checks passed</p>
                      </div>
                      <div className={`text-2xl font-bold ${readiness.passed ? "text-trust-safe" : "text-amber-500"}`}>
                        {Math.round((readiness.passedChecks / readiness.totalChecks) * 100)}%
                      </div>
                    </div>
                    <Progress value={(readiness.passedChecks / readiness.totalChecks) * 100} className="h-2" />
                  </SitaCard>

                  {/* Checklist */}
                  <SitaSectionHeader title="14-Point Checklist" subtitle="All items must pass before launch" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {readiness.results.map(r => (
                      <SitaCard key={r.id} hover={false} className="p-3" lane={r.passed ? undefined : "action"}>
                        <div className="flex items-center gap-2.5">
                          {r.passed ? <CheckCircle className="h-4 w-4 text-trust-safe shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{r.detail}</p>
                          </div>
                        </div>
                      </SitaCard>
                    ))}
                  </div>

                  {/* Founder-Safe Council Summaries */}
                  <SitaSectionHeader title="Council Summaries" subtitle="Plain-language overview for non-technical operators" />
                  <div className="space-y-3">
                    {summaries.map(s => {
                      const CouncilIcon = councilIcons[s.councilId] || Bot;
                      return (
                        <SitaCard key={s.councilId} hover={false} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                              <CouncilIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{s.name} <span className="text-muted-foreground font-normal">({s.agentCount} agents)</span></p>
                              <p className="text-xs text-muted-foreground mt-1">{s.summary}</p>
                            </div>
                          </div>
                        </SitaCard>
                      );
                    })}
                  </div>

                  {/* Action Pipeline */}
                  <SitaSectionHeader title="Action Pipeline" subtitle="Every agent action flows through these states" />
                  <SitaCard hover={false} className="p-4">
                    <div className="flex items-center justify-between">
                      {ACTION_PIPELINE_STATES.map((state, i) => (
                        <div key={state} className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${i === 0 ? "bg-blue-500/10" : i === 1 ? "bg-amber-500/10" : i === 2 ? "bg-accent/10" : "bg-trust-safe/10"}`}>
                              <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-foreground mt-1 capitalize">{state}</p>
                          </div>
                          {i < ACTION_PIPELINE_STATES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
                        </div>
                      ))}
                    </div>
                  </SitaCard>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* CONNECTORS */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "connectors" && (
          <motion.div key="connectors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaCard hover={false} glow className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-bold text-foreground">External Connections</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{isDemoMode ? "Simulated status (Demo)" : "Real connector status (Live)"}</p>
                </div>
                <SitaButton variant="secondary" size="sm" onClick={refreshConnectors}>
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </SitaButton>
              </div>
            </SitaCard>
            <div className="grid gap-3 sm:grid-cols-2">
              {connectors.map((c, i) => (
                <SitaCard key={i} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.status === "connected" ? "bg-emerald-500/10" : c.status === "degraded" ? "bg-amber-500/10" : "bg-secondary"}`}>
                        <Wifi className={`h-5 w-5 ${c.status === "connected" ? "text-emerald-500" : c.status === "degraded" ? "text-amber-500" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{c.type}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${c.status === "connected" ? "bg-emerald-500/10 text-emerald-600" : c.status === "degraded" ? "bg-amber-500/10 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{c.lastSync ? `Last sync: ${c.lastSync}` : "Not synced"}</span>
                    <div className="flex gap-1">
                      {c.status === "disconnected" && <SitaButton variant="accent" size="sm"><Power className="h-3 w-3" /> Connect</SitaButton>}
                      {c.status === "connected" && <SitaButton variant="ghost" size="sm"><RefreshCw className="h-3 w-3" /> Sync</SitaButton>}
                      {c.status === "degraded" && <SitaButton variant="secondary" size="sm"><AlertTriangle className="h-3 w-3" /> Fix</SitaButton>}
                    </div>
                  </div>
                </SitaCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* COSTS */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "costs" && (
          <motion.div key="costs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaCard hover={false} glow className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                  <DollarSign className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">$27.40</p>
                  <p className="text-sm text-muted-foreground">Total monthly cost · +8% vs last month</p>
                </div>
              </div>
            </SitaCard>
            {mockCosts.map((c, i) => (
              <SitaCard key={i} hover={false} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <p className="text-sm text-foreground">{c.service}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${c.percentage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-16 text-right">{c.cost}</span>
                    <span className={`text-[10px] ${c.trend === "up" ? "text-urgency-high" : c.trend === "down" ? "text-trust-safe" : "text-muted-foreground"}`}>
                      {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "—"}
                    </span>
                  </div>
                </div>
              </SitaCard>
            ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TRUST CENTER */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "trust-center" && (
          <motion.div key="trust-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaCard hover={false} glow className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-sita">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{(trustData as any)?.overallScore || 94}%</p>
                  <p className="text-sm text-muted-foreground">Overall Trust Score · {(trustData as any)?.trend || "stable"}</p>
                </div>
              </div>
            </SitaCard>
            <SitaSectionHeader title="Domain Trust Scores" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {((trustData as any)?.domains || []).map((d: any) => (
                <SitaCard key={d.domain} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{d.domain}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === "healthy" ? "bg-trust-safe/10 text-trust-safe" : "bg-amber-500/10 text-amber-500"}`}>{d.status}</span>
                  </div>
                  <Progress value={d.score} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{d.score}%</p>
                </SitaCard>
              ))}
            </div>
            <SitaSectionHeader title="Verification Status" />
            <SitaCard hover={false} className="p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries((trustData as any)?.verificationStatus || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-trust-safe" />
                    <span className="text-xs text-foreground">{k.replace(/([A-Z])/g, " $1").trim()}: <span className="font-semibold">{String(v)}</span></span>
                  </div>
                ))}
              </div>
            </SitaCard>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* RELEASES */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "releases" && (
          <motion.div key="releases" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <KPITile label="Current Version" value={(releasesData as any)?.currentVersion || "—"} icon={Rocket} className="gradient-sita-subtle" />
              <KPITile label="Frozen" value={(releasesData as any)?.frozen ? "Yes" : "No"} icon={Shield} />
            </div>
            <SitaSectionHeader title="Release Rings" />
            <div className="grid gap-3 sm:grid-cols-3">
              {((releasesData as any)?.rings || []).map((r: any) => (
                <SitaCard key={r.ring} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Ring {r.ring}: {r.name}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.status === "deployed" ? "bg-trust-safe/10 text-trust-safe" : r.status === "deploying" ? "bg-amber-500/10 text-amber-500" : "bg-secondary text-muted-foreground"}`}>{r.status}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{r.version}</p>
                  <Progress value={r.progress} className="h-1.5" />
                </SitaCard>
              ))}
            </div>
            <SitaSectionHeader title="Release Gates" />
            <SitaCard hover={false} className="p-4">
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {((releasesData as any)?.gates || []).map((g: any) => (
                  <div key={g.name} className="flex items-center gap-2 text-xs">
                    {g.passed ? <CheckCircle className="h-3.5 w-3.5 text-trust-safe" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    <span className="text-foreground">{g.name}</span>
                  </div>
                ))}
              </div>
            </SitaCard>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* MODEL ROUTING */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "model-routing" && (
          <motion.div key="model-routing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <KPITile label="Total Cost" value={`$${(modelData as any)?.totalCost || 0}`} icon={DollarSign} className="gradient-sita-subtle" />
              <KPITile label="Total Tokens" value={((modelData as any)?.totalTokens || 0).toLocaleString()} icon={Zap} />
              <KPITile label="Routing" value={(modelData as any)?.routingPolicy || "—"} icon={Brain} />
            </div>
            <SitaSectionHeader title="Model Performance" />
            <SitaCard hover={false} className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Model</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cost/1K</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quality</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">P95 Latency</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Requests</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Auto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((modelData as any)?.models || []).map((m: any) => (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{m.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">${m.costPer1kTokens}</td>
                        <td className="px-4 py-3 text-xs text-foreground">{m.qualityScore}%</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{m.latencyP95}ms</td>
                        <td className="px-4 py-3 text-xs text-foreground">{m.requestCount}</td>
                        <td className="px-4 py-3">{m.autoRoute ? <CheckCircle className="h-3.5 w-3.5 text-trust-safe" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SitaCard>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* KNOWLEDGE */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "knowledge" && (
          <motion.div key="knowledge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <KPITile label="Total Docs" value={(knowledgeData as any)?.totalDocs || 0} icon={BookOpen} className="gradient-sita-subtle" />
              <KPITile label="Fresh" value={(knowledgeData as any)?.freshDocs || 0} icon={CheckCircle} trend="up" />
              <KPITile label="Stale" value={(knowledgeData as any)?.staleDocs || 0} icon={AlertTriangle} />
              <KPITile label="Registry Sync" value={`${(knowledgeData as any)?.registryInSync || 0}/${(knowledgeData as any)?.registryFiles || 0}`} icon={Database} />
            </div>
            <SitaSectionHeader title="Stale Documents" />
            {((knowledgeData as any)?.staleDcosList || []).map((d: any) => (
              <SitaCard key={d.name} hover={false} className="p-3" lane="action">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">Last updated: {d.lastUpdated} · {d.staleDays} days stale</p>
                  </div>
                  <SitaButton variant="secondary" size="sm"><RefreshCw className="h-3 w-3" /> Update</SitaButton>
                </div>
              </SitaCard>
            ))}
            <SitaSectionHeader title="Registry Drift Detection" />
            {((knowledgeData as any)?.driftDetections || []).map((d: any) => (
              <SitaCard key={d.file} hover={false} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {d.status === "synced" ? <CheckCircle className="h-3.5 w-3.5 text-trust-safe" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    <p className="text-sm text-foreground">{d.file}</p>
                  </div>
                  <span className={`text-[10px] font-semibold ${d.status === "synced" ? "text-trust-safe" : "text-amber-500"}`}>{d.status}</span>
                </div>
                {d.detail && <p className="text-[11px] text-muted-foreground mt-1 ml-6">{d.detail}</p>}
              </SitaCard>
            ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SUPPORT */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "support" && (
          <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaSectionHeader title="Support Cases" subtitle="Diagnostic bundles and investigation tools" />
            {((supportData as any) || []).map((c: any) => (
              <SitaCard key={c.id} hover={false} className="p-4" lane={c.status === "open" ? "action" : undefined}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.priority === "high" ? "bg-destructive/10 text-destructive" : c.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>{c.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">Assigned: {c.assignedTo} · {c.diagnosticBundle ? "Bundle ready" : "No bundle"}</p>
                  </div>
                  <StateBadge state={c.status === "open" ? "executing" : c.status === "in-progress" ? "approval-requested" : "completed"} size="sm" />
                </div>
              </SitaCard>
            ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* CHANGE REVIEW */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "change-review" && (
          <motion.div key="change-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaSectionHeader title="Architecture Decision Records" subtitle="ADR tracking and compliance" />
            {((changeData as any) || []).map((adr: any) => (
              <SitaCard key={adr.id} hover={false} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{adr.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${adr.status === "approved" ? "bg-trust-safe/10 text-trust-safe" : "bg-amber-500/10 text-amber-500"}`}>{adr.status}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${adr.impact === "high" ? "bg-destructive/10 text-destructive" : adr.impact === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}>{adr.impact} impact</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{adr.title}</p>
                    <p className="text-[11px] text-muted-foreground">Author: {adr.author} · {adr.date}</p>
                  </div>
                </div>
              </SitaCard>
            ))}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ROLLBACK CENTER */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "rollback-center" && (
          <motion.div key="rollback-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <SitaCard hover={false} glow className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${(rollbackData as any)?.globalRollbackReady ? "bg-trust-safe/10" : "bg-destructive/10"}`}>
                  <RotateCcw className={`h-5 w-5 ${(rollbackData as any)?.globalRollbackReady ? "text-trust-safe" : "text-destructive"}`} />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-foreground">Global Rollback</p>
                  <p className="text-xs text-muted-foreground">{(rollbackData as any)?.globalRollbackReady ? "All services ready for rollback" : "Some services not rollback-ready"}</p>
                </div>
              </div>
            </SitaCard>
            <SitaSectionHeader title="Per-Service Rollback Readiness" />
            <div className="grid gap-3 sm:grid-cols-2">
              {((rollbackData as any)?.services || []).map((s: any) => (
                <SitaCard key={s.name} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.rollbackReady ? "bg-trust-safe/10 text-trust-safe" : "bg-destructive/10 text-destructive"}`}>
                      {s.rollbackReady ? "Ready" : "Not Ready"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{s.version} → {s.previousVersion}</span>
                    <span>Health: {s.healthScore}%</span>
                  </div>
                  {s.lastRollback && <p className="text-[10px] text-muted-foreground mt-1">Last rollback: {new Date(s.lastRollback).toLocaleDateString()}</p>}
                </SitaCard>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* SYSTEM MAP */}
        {/* ══════════════════════════════════════════ */}
        {activePage === "system-map" && (
          <motion.div key="system-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <KPITile label="Total Services" value={(serviceMapData as any)?.totalServices || 0} icon={Server} className="gradient-sita-subtle" />
              <KPITile label="Healthy" value={(serviceMapData as any)?.totalHealthy || 0} icon={CheckCircle} trend="up" />
              <KPITile label="Layers" value={((serviceMapData as any)?.layers || []).length} icon={Layers} />
            </div>
            <SitaSectionHeader title="Platform Topology" subtitle="All 9 architectural layers" />
            <div className="space-y-2">
              {((serviceMapData as any)?.layers || []).map((layer: any) => (
                <SitaCard key={layer.id} hover={false} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{layer.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{layer.healthyCount}/{layer.serviceCount} healthy</span>
                      <div className={`h-2.5 w-2.5 rounded-full ${layer.healthyCount === layer.serviceCount ? "bg-trust-safe" : "bg-amber-500 animate-pulse"}`} />
                    </div>
                  </div>
                  <Progress value={(layer.healthyCount / layer.serviceCount) * 100} className="h-1.5 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {layer.services.map((s: string) => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                  </div>
                </SitaCard>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ══════════════════════════════════════════ */}
      {/* DIALOGS */}
      {/* ══════════════════════════════════════════ */}

      {/* Resolve Incident Dialog */}
      <Dialog open={resolveDialog.open} onOpenChange={open => setResolveDialog({ ...resolveDialog, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve Incident</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Root Cause</label>
              <Textarea placeholder="What caused this incident?" value={rootCause} onChange={e => setRootCause(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Notes (optional)</label>
              <Textarea placeholder="Additional notes..." value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <SitaButton variant="ghost" onClick={() => setResolveDialog({ open: false, incidentId: "" })}>Cancel</SitaButton>
            <SitaButton variant="accent" onClick={() => { resolveIncident.mutate({ incidentId: resolveDialog.incidentId, rootCause, notes: resolveNotes }); setResolveDialog({ open: false, incidentId: "" }); }}>
              <CheckCircle className="h-4 w-4" /> Resolve
            </SitaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Incident Dialog */}
      <Dialog open={createIncidentDialog} onOpenChange={setCreateIncidentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report New Incident</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input placeholder="Incident title..." value={newIncident.title} onChange={e => setNewIncident({ ...newIncident, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Severity</label>
              <Select value={newIncident.severity} onValueChange={v => setNewIncident({ ...newIncident, severity: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEV-1">SEV-1 (Critical)</SelectItem>
                  <SelectItem value="SEV-2">SEV-2 (Warning)</SelectItem>
                  <SelectItem value="SEV-3">SEV-3 (Info)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Impact</label>
              <Input placeholder="What's affected?" value={newIncident.impact} onChange={e => setNewIncident({ ...newIncident, impact: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea placeholder="Details..." value={newIncident.description} onChange={e => setNewIncident({ ...newIncident, description: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <SitaButton variant="ghost" onClick={() => setCreateIncidentDialog(false)}>Cancel</SitaButton>
            <SitaButton variant="accent" onClick={() => { createIncident.mutate(newIncident); setCreateIncidentDialog(false); setNewIncident({ title: "", severity: "SEV-2", impact: "", description: "" }); }}>
              <Plus className="h-4 w-4" /> Create
            </SitaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={createPolicyDialog} onOpenChange={setCreatePolicyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Policy</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input placeholder="Policy name..." value={newPolicy.name} onChange={e => setNewPolicy({ ...newPolicy, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Domain</label>
              <Select value={newPolicy.category} onValueChange={v => setNewPolicy({ ...newPolicy, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="money">Money</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="concierge">Concierge</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Conditions (JSON)</label>
              <Textarea placeholder='{"max_amount": 500}' value={newPolicy.conditions} onChange={e => setNewPolicy({ ...newPolicy, conditions: e.target.value })} className="mt-1 font-mono text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newPolicy.approval_required} onCheckedChange={v => setNewPolicy({ ...newPolicy, approval_required: v })} />
              <label className="text-sm text-foreground">Requires approval</label>
            </div>
          </div>
          <DialogFooter>
            <SitaButton variant="ghost" onClick={() => setCreatePolicyDialog(false)}>Cancel</SitaButton>
            <SitaButton variant="accent" onClick={() => {
              let conditions = {};
              try { conditions = JSON.parse(newPolicy.conditions); } catch {}
              createPolicy.mutate({ name: newPolicy.name, category: newPolicy.category, conditions, approval_required: newPolicy.approval_required });
              setCreatePolicyDialog(false);
              setNewPolicy({ name: "", category: "money", conditions: "{}", approval_required: false });
            }}>
              <Plus className="h-4 w-4" /> Create
            </SitaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Simulator Dialog */}
      <Dialog open={simulatorDialog} onOpenChange={setSimulatorDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Policy Simulator</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">Test how your active policies would respond to a hypothetical action.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Domain</label>
                <Select value={simInput.domain} onValueChange={v => setSimInput({ ...simInput, domain: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="money">Money</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="concierge">Concierge</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Action</label>
                <Input value={simInput.action} onChange={e => setSimInput({ ...simInput, action: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <Input type="number" value={simInput.amount} onChange={e => setSimInput({ ...simInput, amount: Number(e.target.value) })} className="mt-1" />
            </div>
            <SitaButton variant="accent" className="w-full" onClick={() => {
              if (isDemoMode) {
                // Demo simulation
                const mockResult = {
                  simulation: {
                    input: simInput,
                    final_effect: simInput.amount > 500 ? "deny" : "allow",
                    evaluated_policies: 3,
                    results: [
                      { policy_name: "Auto-pay under $500", effect: simInput.amount > 500 ? "deny" : "allow", reasons: simInput.amount > 500 ? [`Amount $${simInput.amount} exceeds max $500`] : ["Within auto-pay limit"] },
                    ],
                  },
                };
                setSimResult(mockResult);
              } else {
                simulatePolicy.mutate(simInput, { onSuccess: (data) => setSimResult(data) });
              }
            }}>
              <Gauge className="h-4 w-4" /> Run Simulation
            </SitaButton>

            {(simResult || simulatePolicy.data) && (
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Result:</span>
                  {(() => {
                    const r = simResult?.simulation || simulatePolicy.data?.simulation;
                    if (!r) return null;
                    return (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${r.final_effect === "allow" ? "bg-trust-safe/10 text-trust-safe" : r.final_effect === "deny" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                        {r.final_effect.toUpperCase()}
                      </span>
                    );
                  })()}
                </div>
                {(() => {
                  const r = simResult?.simulation || simulatePolicy.data?.simulation;
                  if (!r) return null;
                  return (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">{r.evaluated_policies} policies evaluated</p>
                      {r.results?.map((pr: any, i: number) => (
                        <div key={i} className="rounded-lg bg-secondary/30 p-2.5">
                          <p className="text-xs font-medium text-foreground">{pr.policy_name}</p>
                          <p className={`text-[10px] font-bold ${pr.effect === "allow" ? "text-trust-safe" : pr.effect === "deny" ? "text-destructive" : "text-accent"}`}>{pr.effect}</p>
                          {pr.reasons.map((reason: string, j: number) => (
                            <p key={j} className="text-[11px] text-muted-foreground">{reason}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default OwnerCenter;
