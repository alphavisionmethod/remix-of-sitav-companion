import { useMemo, useState, useCallback, useEffect, lazy, Suspense } from "react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PostArrivalDesktop } from "@/components/sita/PostArrivalDesktop";
import { useInspector, type InspectorEntity } from "@/contexts/InspectorContext";
import { SitaPageHeader, SitaButton, SitaSectionHeader, SitaCard } from "@/components/sita/SitaCard";
import { ApprovalGate } from "@/components/sita/primitives/ApprovalGate";
import { AdvisorAvatar } from "@/components/sita/primitives/AdvisorAvatar";
import { KPITile, OpportunityCard, RiskCard, TimelineItem, ProofCard } from "@/components/sita/SitaComponents";
import { LiveAdvisorCard } from "@/components/sita/LiveAdvisorCard";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { WidgetGrid } from "@/components/sita/WidgetGrid";
import { TrustBadge } from "@/components/sita/TrustBadge";
import { StateBadge } from "@/components/sita/StateBadge";
import { useNavigate } from "react-router-dom";
import { useDataMode } from "@/contexts/DataModeContext";
import { useDisplayMode } from "@/contexts/DisplayModeContext";
import { useLeads, useInvoices, useBills, useCashFlow, useApprovals, useHouseholdTasks, useFamilyEvents, useTravel, useSubscriptions } from "@/hooks/use-sita-data";
import { useCalendarEvents } from "@/hooks/use-calendar-data";
import { useFinanceProjection } from "@/hooks/use-domain-projections";
import { useAIInsight, useCashflowAnalysis, useCRMSync } from "@/hooks/use-backend-actions";
import { PulseSummaryStrip } from "@/components/user-app/PulseSummaryStrip";
import { evaluateCrossDomainIntelligence } from "@/lib/cross-domain";
import { assessBusinessHealth } from "@/lib/domain-engines/business-os";
import { analyzeCashflow, assessBudgetHealth, assessReserves, analyzeInvoiceAging, assessFinancialHealth, analyzeBillCalendar } from "@/lib/domain-engines/finance-os";
import { prioritizeTasks } from "@/lib/domain-engines/concierge-os";
import { adaptMockLeads, adaptMockCustomers, adaptMockOpportunities, adaptMockBills, adaptMockInvoicesForAging, adaptMockHouseholdTasks, buildMockCashflowEntries, buildMockBudgets, buildMockReserves } from "@/lib/domain-engines/adapters";
import type { DomainId, Opportunity, Receipt as ReceiptContract } from "@/packages/contracts";
import type { BusinessHealthResult } from "@/lib/domain-engines/business-os";
import type { FinancialHealthResult, CashflowAnalysis, ReserveAssessment, BillCalendarResult } from "@/lib/domain-engines/finance-os";
import type { TaskPrioritization } from "@/lib/domain-engines/concierge-os";
import { useOSOrchestration } from "@/hooks/useOSOrchestration";
import { useAdaptiveInterface } from "@/hooks/useAdaptiveInterface";
import { useExperienceSignature } from "@/hooks/useExperienceSignature";
import {
  Briefcase, DollarSign, Workflow, Clock, AlertTriangle, CheckCircle, ArrowRight, Sparkles, BarChart3, Receipt, Brain,
  Plane, Users, CalendarDays, FileText, Headphones, Settings, ShieldCheck, Zap, Home, TrendingUp, Shield, Target,
  Lightbulb, Activity, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useAuth } from "@/contexts/AuthContext";


// ── Mission Mode Emphasis Config ─────────────────────────────────
const MISSION_MODE_CONFIG: Record<string, {
  greeting: string;
  heroSubtitle: string;
  kpiOrder: string[];
  showSections: string[];
  hideSections: string[];
  accentColor: string;
}> = {
  "normal": {
    greeting: "Here's your operating view",
    heroSubtitle: "Balanced view across all domains",
    kpiOrder: ["business", "finance", "leads", "actions"],
    showSections: ["advisors", "approvals", "actions", "cross-domain", "intelligence", "opportunities", "boardroom", "activity", "proof", "ai-spend", "quick-access"],
    hideSections: [],
    accentColor: "",
  },
  "sales-day": {
    greeting: "Sales Day — Crush your pipeline",
    heroSubtitle: "Focus on pipeline, leads, deal acceleration, and follow-ups",
    kpiOrder: ["leads", "business", "actions", "finance"],
    showSections: ["advisors", "actions", "opportunities", "activity", "quick-access"],
    hideSections: ["boardroom", "ai-spend"],
    accentColor: "from-amber-500/10 to-orange-500/5",
  },
  "closing-day": {
    greeting: "Closing Day — Seal the deals",
    heroSubtitle: "Focus on closing deals and finalizing proposals today",
    kpiOrder: ["business", "leads", "finance", "actions"],
    showSections: ["advisors", "actions", "opportunities", "proof", "quick-access"],
    hideSections: ["boardroom", "intelligence", "ai-spend"],
    accentColor: "from-green-500/10 to-emerald-500/5",
  },
  "travel-mode": {
    greeting: "Travel Mode — Stay coordinated",
    heroSubtitle: "Itineraries, bookings, and on-the-go essentials",
    kpiOrder: ["actions", "finance", "business", "leads"],
    showSections: ["advisors", "actions", "cross-domain", "quick-access"],
    hideSections: ["opportunities", "boardroom", "intelligence", "ai-spend"],
    accentColor: "from-sky-500/10 to-blue-500/5",
  },
  "family-week": {
    greeting: "Family Week — Home first",
    heroSubtitle: "Household coordination, school activities, and family routines",
    kpiOrder: ["actions", "finance", "business", "leads"],
    showSections: ["advisors", "actions", "cross-domain", "quick-access"],
    hideSections: ["opportunities", "boardroom", "intelligence", "proof", "ai-spend"],
    accentColor: "from-pink-500/10 to-rose-500/5",
  },
  "tax-week": {
    greeting: "Tax Week — Stay compliant",
    heroSubtitle: "Tax preparation, deductions, and compliance review",
    kpiOrder: ["finance", "business", "actions", "leads"],
    showSections: ["advisors", "actions", "cross-domain", "proof", "quick-access"],
    hideSections: ["opportunities", "boardroom", "intelligence", "ai-spend"],
    accentColor: "from-violet-500/10 to-purple-500/5",
  },
  "collections-recovery": {
    greeting: "Collections Recovery — Get paid",
    heroSubtitle: "Focus on overdue invoices and receivables recovery",
    kpiOrder: ["finance", "business", "leads", "actions"],
    showSections: ["advisors", "actions", "cross-domain", "proof", "quick-access"],
    hideSections: ["boardroom", "intelligence", "ai-spend"],
    accentColor: "from-amber-500/10 to-yellow-500/5",
  },
  "calm": {
    greeting: "Calm Mode — Essentials only",
    heroSubtitle: "Minimal notifications, only what truly needs attention",
    kpiOrder: ["actions", "finance", "business", "leads"],
    showSections: ["actions", "quick-access"],
    hideSections: ["advisors", "approvals", "cross-domain", "intelligence", "opportunities", "boardroom", "activity", "proof", "ai-spend"],
    accentColor: "from-slate-500/10 to-gray-500/5",
  },
  "launch": {
    greeting: "Launch Mode — All systems go",
    heroSubtitle: "Full monitoring with metrics, pipeline, and revenue focus",
    kpiOrder: ["business", "finance", "leads", "actions"],
    showSections: ["advisors", "approvals", "actions", "cross-domain", "intelligence", "opportunities", "boardroom", "activity", "proof", "ai-spend", "quick-access"],
    hideSections: [],
    accentColor: "from-orange-500/10 to-red-500/5",
  },
  "emergency": {
    greeting: "Emergency Stabilization",
    heroSubtitle: "Critical incident mode — essential actions and heightened monitoring",
    kpiOrder: ["actions", "finance", "business", "leads"],
    showSections: ["approvals", "actions", "cross-domain", "proof", "quick-access"],
    hideSections: ["advisors", "intelligence", "opportunities", "boardroom", "activity", "ai-spend"],
    accentColor: "from-red-500/15 to-rose-500/8",
  },
};

const DailyPulse = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDataMode();
  const { inspect } = useInspector();
  const { missionMode } = useDisplayMode();
  const { user } = useAuth();
  const os = useOSOrchestration();
  const interfaceState = useAdaptiveInterface();
  const signature = useExperienceSignature();
  const [showPostArrival, setShowPostArrival] = useState(() => {
    return !localStorage.getItem("sita-post-arrival-seen") && sessionStorage.getItem("sita-post-arrival-trigger") === "true";
  });
  const [seeding, setSeeding] = useState(false);
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [osPulseDigest, setOsPulseDigest] = useState<string | null>(null);
  const aiInsight = useAIInsight();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // OS-driven daily pulse generation
  const cognitiveLoad = os.getCognitiveLoad();
  const attentionStack = os.getAttentionStack();
  const currentMode = os.getCurrentMode();
  const activeInterventions = os.getActiveInterventions();

  // Activate daily pulse digest from the 7 registered providers
  useEffect(() => {
    if (!os.hydrated) return;
    let cancelled = false;
    os.dailyPulse(user?.user_metadata?.full_name).then(digest => {
      if (!cancelled) {
        const digestText = digest.greeting + "\n" + digest.sections.map(s => `${s.title}: ${s.summary}`).join("\n");
        setOsPulseDigest(digestText);
        // Persist the generated digest to CAI table
        import("@/lib/persistence/cai-persistence-bridge").then(({ persistDigestCompilation }) => {
          persistDigestCompilation({
            digest_type: "daily_pulse",
            mode: currentMode as string,
            source_refs: digest.sections.map(s => s.type),
            delivery_surface: "desktop",
            summary_ref: digest.greeting,
          });
        });
      }
    }).catch(e => console.warn("[DailyPulse] digest generation:", e));
    return () => { cancelled = true; };
  }, [os.hydrated]);

  // Domain projection hooks (wired from use-domain-projections + use-calendar-data)
  const financeProjection = useFinanceProjection();
  const now = new Date();
  const calendarEvents = useCalendarEvents(now.getFullYear(), now.getMonth());

  const modeConfig = MISSION_MODE_CONFIG[missionMode.id] || MISSION_MODE_CONFIG["normal"];
  const showSection = (s: string) => !modeConfig.hideSections.includes(s);

  const { data: leads = [] } = useLeads();
  const { data: invoices = [] } = useInvoices();
  const { data: bills = [] } = useBills();
  const { data: cashFlow } = useCashFlow();
  const { data: approvals = [] } = useApprovals();
  const { data: householdTasks = [] } = useHouseholdTasks();
  const { data: familyEvents = [] } = useFamilyEvents();
  const { data: travel = [] } = useTravel();
  const { data: subscriptions = [] } = useSubscriptions();

  // Wire to edge functions for live finance + CRM data
  const { data: liveCashflow } = useCashflowAnalysis();
  const crmSync = useCRMSync();
  const liveCf = liveCashflow as never;
  const crmHealth = crmSync.healthCheck.data as never;

  const hasAnyData = isDemoMode || leads.length > 0 || invoices.length > 0 || bills.length > 0 || householdTasks.length > 0;

  const pendingApprovals = approvals.filter((a: Record<string, any>) => a.status === "pending");

  const crossDomainInsights = evaluateCrossDomainIntelligence({
    invoices: invoices as never[], bills: bills as never[], leads: leads as never[], cashFlow: cashFlow as never,
    householdTasks: householdTasks as never[], familyEvents: familyEvents as never[], travel: travel as never[], subscriptions: subscriptions as never[],
  });

  const staleLeads = (leads as never[]).filter((l: Record<string, any>) => l.status === "cooling" || l.lastTouch?.includes("d ago"));
  const overdueBills = (bills as never[]).filter((b: Record<string, any>) => b.status === "overdue");
  const upcomingBills = (bills as never[]).filter((b: Record<string, any>) => b.status === "upcoming");
  const actionCount = staleLeads.length + overdueBills.length + pendingApprovals.length;

  // ── Domain Engine Computations ──────────────────────────────
  const businessHealth = useMemo(() => {
    const bizLeads = adaptMockLeads(leads as never[]);
    const bizCustomers = adaptMockCustomers([
      { id: "C-001", name: "Acme Corp", mrr: "$2,400", health: "healthy", lastInteraction: "Yesterday" },
      { id: "C-002", name: "Bloom Studio", mrr: "$1,200", health: "at-risk", lastInteraction: "2 weeks ago" },
      { id: "C-003", name: "NovaTech", mrr: "$4,800", health: "healthy", lastInteraction: "Today" },
    ]);
    const bizPipeline = adaptMockOpportunities([
      { id: "O-001", name: "Acme Expansion", value: "$48,000", stage: "negotiation", probability: 75, daysOpen: 34 },
      { id: "O-002", name: "Bloom Retainer", value: "$14,400", stage: "proposal", probability: 60, daysOpen: 12 },
      { id: "O-003", name: "NovaTech Upgrade", value: "$24,000", stage: "discovery", probability: 40, daysOpen: 5 },
    ]);
    return assessBusinessHealth(bizCustomers, bizPipeline, [6800, 7200, 7900, 8100, 8420]);
  }, [leads]);

  const finHealth = useMemo(() => {
    const entries = buildMockCashflowEntries();
    const budgets = buildMockBudgets();
    const reserves = buildMockReserves();
    const finInvoices = adaptMockInvoicesForAging(invoices as never[]);
    const cf = analyzeCashflow(entries, 24680);
    const bh = assessBudgetHealth(budgets);
    const ra = assessReserves(reserves, 7500);
    const ia = analyzeInvoiceAging(finInvoices);
    return { health: assessFinancialHealth(cf, bh, ra, ia), cashflow: cf, billCalendar: analyzeBillCalendar(adaptMockBills(bills as never[])), reserves: ra };
  }, [invoices, bills]);

  const taskPrioritization = useMemo(() => {
    const tasks = adaptMockHouseholdTasks(householdTasks as never[]);
    return prioritizeTasks(tasks);
  }, [householdTasks]);

  const formatScore = (score: number) => score >= 80 ? "Strong" : score >= 60 ? "Stable" : score >= 40 ? "Needs Work" : "Critical";
  const scoreTrend = (score: number): "up" | "flat" | "down" => score >= 70 ? "up" : score >= 50 ? "flat" : "down";

  // ── Mission-Mode-Aware Advisor Moves ──────────────────────────
  const advisorTopMoves = useMemo(() => {
    const businessMove = {
      advisor: "Business", icon: Briefcase,
      move: businessHealth.opportunities.length > 0 ? businessHealth.opportunities[0].suggestedAction : "Close Sarah Chen quote — she's comparing vendors. 15-min callback recommended.",
      confidence: businessHealth.overallScore >= 70 ? "High" : "Medium",
      urgency: businessHealth.risks.some(r => r.severity === "critical") ? "Now" : "Today",
    };
    const financeMove = {
      advisor: "Money", icon: DollarSign,
      move: finHealth.health.risks.length > 0 ? finHealth.health.risks[0].suggestedAction : "Schedule $1,800 overdue invoice follow-up. Collections ladder step 2.",
      confidence: finHealth.health.overallScore >= 70 ? "High" : "Medium",
      urgency: finHealth.billCalendar.overdue.length > 0 ? "Now" : "Today",
    };
    const conciergeMove = {
      advisor: "Concierge", icon: Headphones,
      move: taskPrioritization.prioritized.length > 0 ? `Top priority: ${taskPrioritization.prioritized[0].title} (score: ${taskPrioritization.prioritized[0].score})` : "Confirm dentist appointment for Thursday. Prep insurance card.",
      confidence: "Medium" as string,
      urgency: taskPrioritization.prioritized.some(t => t.score > 70) ? "Today" : "Tomorrow",
    };

    // Reorder based on mission mode
    const emphasized = missionMode.emphasizedDomains;
    if (emphasized.includes("business") && !emphasized.includes("concierge")) return [businessMove, financeMove, conciergeMove];
    if (emphasized.includes("concierge") && !emphasized.includes("business")) return [conciergeMove, financeMove, businessMove];
    if (emphasized.includes("finance")) return [financeMove, businessMove, conciergeMove];
    return [businessMove, financeMove, conciergeMove];
  }, [businessHealth, finHealth, taskPrioritization, missionMode]);

  // Cross-domain priorities
  const crossDomainPriorities = [
    { domain: "Business → Money", title: "Receivables gap detected", description: `$${finHealth.cashflow.totalInflows.toLocaleString()} inflows vs $${finHealth.cashflow.totalOutflows.toLocaleString()} outflows this period. ${finHealth.cashflow.healthIndicator} position.`, severity: finHealth.cashflow.healthIndicator === "negative" ? "critical" as const : "warning" as const },
    { domain: "Concierge → Business", title: `${taskPrioritization.prioritized.length} tasks prioritized`, description: `${taskPrioritization.totalEstimatedMinutes} min estimated. Focus block: ${taskPrioritization.suggestedFocusBlock.optimalTimeOfDay} (${taskPrioritization.suggestedFocusBlock.totalMinutes} min).`, severity: "info" as const },
    { domain: "Money → Business", title: `Reserve coverage: ${(finHealth.reserves.coverageRatio * 100).toFixed(0)}%`, description: `${finHealth.reserves.monthsOfRunway.toFixed(1)} months runway. ${finHealth.reserves.recommendations[0] || "Reserves on track."}`, severity: finHealth.reserves.coverageRatio < 0.5 ? "critical" as const : "info" as const },
  ];

  // ── KPI tiles ordered by mission mode ──────────────────────────
  const kpiTiles = {
    business: <KPITile key="biz" label="Business Health" value={`${businessHealth.overallScore}/100`} trend={scoreTrend(businessHealth.overallScore)} sub={formatScore(businessHealth.overallScore)} icon={Briefcase} />,
    finance: <KPITile key="fin" label="Financial Health" value={`${finHealth.health.overallScore}/100`} trend={scoreTrend(finHealth.health.overallScore)} sub={finHealth.health.summary.split("—")[0].trim()} icon={DollarSign} />,
    leads: <KPITile key="leads" label="Active Leads" value={String((leads as never[]).length)} trend="up" sub={`${staleLeads.length} cooling`} icon={Target} />,
    actions: <KPITile key="actions" label="Pending Actions" value={String(actionCount)} sub={`${pendingApprovals.length} approvals · ${taskPrioritization.prioritized.length} tasks`} icon={Workflow} />,
  };
  const orderedKpis = modeConfig.kpiOrder.map(k => kpiTiles[k as keyof typeof kpiTiles]);

  // Post-arrival first desktop state — shown once after setup
  if (showPostArrival) {
    return (
      <PostArrivalDesktop onDismiss={() => {
        sessionStorage.removeItem("sita-post-arrival-trigger");
        setShowPostArrival(false);
      }} />
    );
  }

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const { error } = await supabase.functions.invoke("seed-user-data");
      if (error) throw error;
      toast.success("Demo data seeded! Refreshing…");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast.error("Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  if (!hasAnyData) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 p-8 md:p-10 gradient-sita-subtle">
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground font-medium">{timeGreeting}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">Welcome to SITA OS</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">Your sovereign AI operating system is ready. Seed demo data to explore all features, or set up your first domain manually.</p>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {seeding ? "Seeding…" : "Seed Demo Data"}
            </button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <EmptyStateCTA
            icon={Briefcase}
            title="Business"
            description="Add leads, customers, and start tracking your pipeline."
            actions={[{ label: "Get Started", to: "/business" }]}
          />
          <EmptyStateCTA
            icon={DollarSign}
            title="Money"
            description="Track bills, subscriptions, and set budgets."
            actions={[{ label: "Get Started", to: "/money" }]}
          />
          <EmptyStateCTA
            icon={Headphones}
            title="Concierge"
            description="Organize tasks, appointments, and family schedules."
            actions={[{ label: "Get Started", to: "/concierge" }]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero — adapts to mission mode */}
      <div className={`relative overflow-hidden rounded-2xl border border-border/60 p-8 md:p-10 ${modeConfig.accentColor ? `bg-gradient-to-br ${modeConfig.accentColor}` : "gradient-sita-subtle"}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm text-muted-foreground font-medium">{timeGreeting}</p>
            {missionMode.id !== "normal" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                <span>{missionMode.icon}</span> {missionMode.name}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${isDemoMode ? "bg-amber-500/10 text-amber-500 border border-amber-500/15" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-amber-500" : "bg-emerald-500"}`} />
              {isDemoMode ? "Demo" : "Live"}
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl md:text-[2rem] font-bold tracking-tight text-foreground">{modeConfig.greeting}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg leading-relaxed">
            {modeConfig.heroSubtitle}
          </p>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute -bottom-6 right-20 h-32 w-32 rounded-full bg-accent/5 blur-[60px]" />
        <div className="absolute left-1/3 -bottom-4 h-24 w-48 rounded-full bg-primary/3 blur-[50px]" />
      </div>

      {/* ── What Changed ── */}
      <SitaCard hover={false} className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">What Changed</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Since last visit</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {staleLeads.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--sita-gold))]" />
              <span className="text-[12px] text-foreground">{staleLeads.length} leads went cold</span>
            </div>
          )}
          {overdueBills.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
              <span className="text-[12px] text-foreground">{overdueBills.length} bills overdue</span>
            </div>
          )}
          {pendingApprovals.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--sita-purple))]" />
              <span className="text-[12px] text-foreground">{pendingApprovals.length} approvals waiting</span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--trust-safe))]" />
            <span className="text-[12px] text-foreground">{crossDomainInsights.length} insights detected</span>
          </div>
        </div>
      </SitaCard>

      {/* ── Quick Actions Row ── */}
      <div className="flex flex-wrap gap-2">
        <SitaButton size="sm" variant="ghost" onClick={() => navigate("/business/leads")}>
          <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Add Lead
        </SitaButton>
        <SitaButton size="sm" variant="ghost" onClick={() => navigate("/money/bills")}>
          <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Pay Bill
        </SitaButton>
        <SitaButton size="sm" variant="ghost" onClick={() => navigate("/concierge/tasks")}>
          <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Create Task
        </SitaButton>
        <SitaButton size="sm" variant="ghost" onClick={() => navigate("/files")}>
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Upload File
        </SitaButton>
      </div>

      {/* KPIs — ordered by mission mode */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {orderedKpis}
      </div>

      {/* ── Chief-of-Staff Interventions ── */}
      {activeInterventions.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Chief-of-Staff" subtitle="Proactive nudges from your OS" />
          <div className="grid gap-2 sm:grid-cols-2">
            {activeInterventions.slice(0, 4).map((intervention: any, i: number) => (
              <SitaCard key={i} hover className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Lightbulb className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{intervention.type || "Nudge"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{intervention.message || intervention.suggestion || "Review recommended"}</p>
                    {intervention.persona && (
                      <span className="inline-block mt-1.5 text-[9px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 capitalize">
                        {intervention.persona}
                      </span>
                    )}
                  </div>
                </div>
              </SitaCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Inline Approval Queue (with ApprovalGate) ── */}
      {showSection("approvals") && pendingApprovals.length > 0 && (
        <div className="space-y-3">
          <SitaSectionHeader title="Quick Approvals" subtitle="Decide inline — no context switch needed" />
          {pendingApprovals.slice(0, 2).map((approval: any, i: number) => (
            <ApprovalGate
              key={i}
              title={approval.title || `Approval #${i + 1}`}
              description={approval.description || "Requires your review"}
              riskLevel={approval.risk_level === "high" ? "high" : approval.risk_level === "low" ? "low" : "medium"}
              policyContext={approval.policy_context}
              onApprove={() => {}}
              onReject={() => {}}
              onSimulate={() => {}}
            />
          ))}
        </div>
      )}

      {/* ── Boardroom Prep Card ── */}
      {showSection("boardroom") && (
        <SitaCard hover className="cursor-pointer" onClick={() => navigate("/boardroom")}>
          <div className="flex items-center gap-4 p-1">
            <div className="rounded-xl bg-[hsl(var(--sita-purple-dark))]/10 p-3">
              <BarChart3 className="h-5 w-5 text-[hsl(var(--sita-purple))]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Weekly Business Review</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {businessHealth.risks.length} risks · {businessHealth.opportunities.length} opportunities · {pendingApprovals.length} decisions pending
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <AdvisorAvatar domain="business" size="sm" />
                <AdvisorAvatar domain="money" size="sm" />
                <AdvisorAvatar domain="concierge" size="sm" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </SitaCard>
      )}

      {/* === Advisor Top Moves === */}
      {showSection("advisors") && (
        <div className="space-y-3">
          <SitaSectionHeader title="Advisor Top Moves" subtitle="Your advisors' highest-priority recommendations right now" />
          <div className="grid gap-3 md:grid-cols-3">
            {advisorTopMoves.map((move) => {
              const domain = move.advisor.toLowerCase();
              const hasInsight = !!aiInsights[domain];
              const isRequesting = aiInsight.isPending;
              return (
                <div key={move.advisor} className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card-hover hover:border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <move.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{move.advisor} Advisor</span>
                    <span className="ml-auto text-[10px] font-medium rounded-full bg-accent/10 text-accent px-2 py-0.5">{move.urgency}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{hasInsight ? aiInsights[domain] : move.move}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <TrustBadge level={hasInsight ? "verified" : move.confidence === "High" ? "verified" : "review"} label={hasInsight ? "AI Live" : `${move.confidence} confidence`} size="sm" />
                    {!isDemoMode && !hasInsight && (
                      <button
                        onClick={() => {
                          aiInsight.mutate(
                            { intent: "daily_pulse_insight", domain, context: { section: move.advisor } },
                            {
                              onSuccess: (data: Record<string, any>) => {
                                if (data?.recommendation) {
                                  setAiInsights(prev => ({ ...prev, [domain]: data.recommendation }));
                                }
                              },
                            }
                          );
                        }}
                        disabled={isRequesting}
                        className="ml-auto inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {isRequesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Get AI Insight
                      </button>
                    )}
                    {hasInsight && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary">
                        <Sparkles className="h-3 w-3" /> Live AI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* === Approval Queue === */}
          {showSection("approvals") && pendingApprovals.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Approval Queue" subtitle={`${pendingApprovals.length} items waiting for your decision`} action={<button onClick={() => navigate("/approvals")} className="text-xs text-primary hover:underline">View all</button>} />
              {pendingApprovals.slice(0, 3).map((approval: any, i: number) => (
                <div key={i} onClick={() => navigate("/approvals")} className="rounded-xl border border-border bg-card p-4 pl-5 cursor-pointer transition-all hover:shadow-card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2"><Shield className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{approval.title || `Approval #${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{approval.description || "Requires your review and decision"}</p>
                      </div>
                    </div>
                    <StateBadge state="approval-requested" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === Action Needed === */}
          {showSection("actions") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Action Needed" subtitle="Requires your attention" />
              {staleLeads.length > 0 && (
                <div onClick={() => inspect({
                  id: "stale-leads", type: "lead", title: `${staleLeads.length} Stale Leads`, subtitle: "No contact in 48+ hours — revenue at risk",
                  domain: "business", status: "cooling", trustLevel: "degraded",
                  details: { count: staleLeads.length, risk: "Revenue loss", recommended_action: "Follow up today" },
                  proofChain: [{ id: "p1", action: "Last outreach recorded", result: "confirmed", timestamp: "48+ hours ago" }],
                  advisorReasoning: [{ advisor: "Business", recommendation: "Prioritize follow-up on highest-value leads", confidence: 0.85, reasoning: "Leads cooling beyond 48h have 40% lower conversion rate" }],
                  linkedWorkflows: [{ id: "wf1", name: "Lead Follow-Up Automation", status: "paused", step: "Awaiting owner action" }],
                })} className="rounded-xl border border-border bg-card p-4 pl-5 cursor-pointer transition-all hover:shadow-card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-urgency-high/10 p-2"><AlertTriangle className="h-4 w-4 text-urgency-high" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{staleLeads.length} Stale Leads</p>
                        <p className="text-xs text-muted-foreground">No contact in 48+ hours — revenue at risk</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              )}
              {overdueBills.length > 0 && (
                <div onClick={() => inspect({
                  id: "overdue-bills", type: "bill", title: `${overdueBills.length} Overdue Bills`, subtitle: "Payment required immediately",
                  domain: "finance", status: "overdue", trustLevel: "degraded",
                  details: { count: overdueBills.length, urgency: "High", impact: "Late fees & credit risk" },
                  proofChain: [{ id: "p2", action: "Bill due date passed", result: "confirmed", timestamp: "Today" }],
                  advisorReasoning: [{ advisor: "Finance", recommendation: "Pay overdue bills to avoid penalties", confidence: 0.92, reasoning: "Late payments incur 1.5% monthly fee and may affect vendor relationships" }],
                })} className="rounded-xl border border-border bg-card p-4 pl-5 cursor-pointer transition-all hover:shadow-card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-accent/10 p-2"><DollarSign className="h-4 w-4 text-accent" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{overdueBills.length} Overdue Bills</p>
                        <p className="text-xs text-muted-foreground">Payment required immediately</p>
                      </div>
                    </div>
                    <TrustBadge level="degraded" label="Overdue" size="sm" />
                  </div>
                </div>
              )}
              {upcomingBills.length > 0 && (
                <div onClick={() => navigate("/money")} className="rounded-xl border border-border bg-card p-4 pl-5 cursor-pointer transition-all hover:shadow-card-hover group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-accent/10 p-2"><DollarSign className="h-4 w-4 text-accent" /></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{upcomingBills.length} Bills Due Soon</p>
                        <p className="text-xs text-muted-foreground">Upcoming payments this week</p>
                      </div>
                    </div>
                    <TrustBadge level="review" label="Due Soon" size="sm" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === Cross-Domain Priorities === */}
          {showSection("cross-domain") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Cross-Domain Priorities" subtitle="Connections SITA detected across your domains" />
              {crossDomainPriorities.map((p, i) => {
                const severityColor = p.severity === "critical" ? "bg-urgency-critical/10" : p.severity === "warning" ? "bg-trust-review/10" : "bg-primary/10";
                const severityText = p.severity === "critical" ? "text-urgency-critical" : p.severity === "warning" ? "text-trust-review" : "text-primary";
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 pl-5 transition-all hover:shadow-card-hover">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg ${severityColor} p-2 shrink-0`}><Activity className={`h-4 w-4 ${severityText}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{p.title}</p>
                          <span className="text-[10px] bg-secondary rounded px-1.5 py-px text-muted-foreground">{p.domain}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cross-Domain Intelligence (dynamic) */}
          {showSection("intelligence") && crossDomainInsights.length > 0 && (
            <div className="space-y-3">
              <SitaSectionHeader title="Live Intelligence" subtitle="Real-time cross-domain signals" />
              {crossDomainInsights.map((insight) => {
                const domainIcon = { business: Briefcase, money: DollarSign, concierge: CalendarDays, family: Users }[insight.sourceDomain] || Brain;
                const DomainIcon = domainIcon;
                const severityColor = insight.severity === "critical" ? "bg-urgency-critical/10" : insight.severity === "warning" ? "bg-trust-review/10" : "bg-primary/10";
                const severityText = insight.severity === "critical" ? "text-urgency-critical" : insight.severity === "warning" ? "text-trust-review" : "text-primary";
                return (
                  <div key={insight.id} className="rounded-xl border border-border bg-card p-4 pl-5 transition-all hover:shadow-card-hover">
                    <DemoModeBadge />
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg ${severityColor} p-2 shrink-0`}><DomainIcon className={`h-4 w-4 ${severityText}`} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{insight.title}</p>
                          <span className="text-[10px] bg-secondary rounded px-1.5 py-px text-muted-foreground">{insight.sourceDomain} → {insight.impactDomain}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                        {insight.suggestedAction && (
                          <p className="text-xs text-primary mt-1.5 flex items-center gap-1"><Sparkles className="h-3 w-3 shrink-0" /> {insight.suggestedAction}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Opportunities */}
          {showSection("opportunities") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Opportunities" subtitle="SITA detected potential" />
              <OpportunityCard title="Sarah Chen hasn't received a quote" description="She inquired 2 days ago — send before she shops competitors" action="Send Quote" />
              <OpportunityCard title="Marcus Johnson — upsell potential" description="3 invoices paid on time, expanding scope conversation possible" action="Review" />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* === Boardroom Preview === */}
          {showSection("boardroom") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Boardroom Preview" subtitle="Weekly operating posture" />
              <div onClick={() => navigate("/boardroom")} className="rounded-xl border border-border bg-card overflow-hidden cursor-pointer transition-all hover:shadow-card-hover group">
                <div className="gradient-sita p-4 flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">Weekly Business Review</p>
                    <p className="text-xs text-primary-foreground/70">Ready for your review</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary-foreground/60 ml-auto transition-transform group-hover:translate-x-1" />
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Priorities</span>
                    <span className="font-medium text-foreground">4 items</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Active Risks</span>
                    <span className="font-medium text-urgency-high">2 flagged</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Opportunities</span>
                    <span className="font-medium text-trust-verified">3 identified</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Advisor Consensus</span>
                    <TrustBadge level="verified" label="Aligned" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          {showSection("activity") && (
            <div className="space-y-3">
              <SitaSectionHeader title="What Changed" />
              <div className="space-y-0 rounded-xl border border-border bg-card p-3">
                <TimelineItem icon={CheckCircle} color="text-trust-verified" title="Invoice #1038 paid" subtitle="Marcus Johnson — $4,200" time="2h ago" />
                <TimelineItem icon={Briefcase} color="text-primary" title="New lead: Sarah Chen" subtitle="Via website contact form" time="4h ago" />
                <TimelineItem icon={Clock} color="text-accent" title="Appointment confirmed" subtitle="Tomorrow 2:00 PM — James Rodriguez" time="6h ago" />
                <TimelineItem icon={AlertTriangle} color="text-urgency-high" title="Invoice #1035 overdue" subtitle="7 days past due — $1,800" time="1d ago" />
              </div>
            </div>
          )}

          {/* Recent Proof */}
          {showSection("proof") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Recent Proof" action={<button onClick={() => navigate("/proof")} className="text-xs text-primary hover:underline">View all</button>} />
              <ProofCard title="Invoice #1038 payment" artifact="Stripe payment confirmation" time="2h ago" trust="verified" state="verified" />
              <ProofCard title="Quote #1042 delivery" artifact="Email delivery confirmed" time="4h ago" trust="verified" state="completed" />
              <ProofCard title="Lead follow-up completed" artifact="Call recording + transcript" time="6h ago" trust="verified" state="completed" />
            </div>
          )}

          {/* Advisor Insight */}
          {showSection("advisors") && (
            <div className="space-y-3">
              <SitaSectionHeader title="Advisor Insights" />
              <LiveAdvisorCard advisor="business" intent="daily_pulse" demoName="Business Advisor" demoRole="Lead & Revenue Intelligence" demoConfidence="High" demoRecommendation="Focus on closing the Sarah Chen quote today — she's likely comparing vendors. Schedule a 15-min callback." demoReasoning="Based on lead aging pattern and typical close windows for her segment." />
            </div>
          )}

          {/* AI Spend Widget */}
          {showSection("ai-spend") && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-trust-safe" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI Spend This Month</p>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-xl font-bold gradient-sita-text">$4.32</span>
                <span className="text-xs text-muted-foreground">of $50.00</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                <div className="h-full rounded-full bg-trust-safe" style={{ width: "9%" }} />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="flex justify-between text-muted-foreground"><span>Advising</span><span>$2.15</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Automations</span><span>$0.92</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Simulations</span><span>$0.85</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Document OCR</span><span>$0.40</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Grid — customizable desktop widgets */}
      <WidgetGrid />

      {/* Quick Access App Grid */}
      {showSection("quick-access") && (
        <div className="space-y-3">
          <SitaSectionHeader title="Quick Access" subtitle="Jump to any app" />
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {[
              { icon: FileText, label: "Files", path: "/files", badge: 3 },
              { icon: Briefcase, label: "CRM", path: "/business", badge: 1 },
              { icon: DollarSign, label: "Finance", path: "/money" },
              { icon: CalendarDays, label: "Calendar", path: "/concierge/calendar" },
              { icon: CheckCircle, label: "Tasks", path: "/concierge/tasks" },
              { icon: Workflow, label: "Approvals", path: "/approvals", badge: pendingApprovals.length || undefined },
              { icon: Brain, label: "Advisors", path: "/boardroom" },
              { icon: Home, label: "Household", path: "/concierge" },
              { icon: Settings, label: "Settings", path: "/settings" },
            ].map((app) => (
              <button
                key={app.label}
                onClick={() => navigate(app.path)}
                className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 transition-all hover:shadow-card-hover hover:border-primary/20 group"
              >
                <app.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{app.label}</span>
                {app.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground px-1">
                    {app.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DailyPulseWithBoundary = () => (
  <GlobalErrorBoundary>
    <DailyPulse />
  </GlobalErrorBoundary>
);

export default DailyPulseWithBoundary;
