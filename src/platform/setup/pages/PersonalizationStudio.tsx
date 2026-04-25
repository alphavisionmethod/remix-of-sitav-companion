import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge } from "@/platform/sita/components/sita/TrustBadge";
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAdaptivePersonalization } from "@/hooks/use-adaptive-personalization";
import { Switch } from "@/components/ui/switch";
import {
  User, Brain, Sliders, Shield, MessageSquare, Clock, Eye, Zap, Heart,
  Bell, Calendar, Briefcase, DollarSign, Home, Sparkles, Check, Edit, Save,
  ChevronRight, RotateCcw, Power, X, CheckCircle2
} from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

type SubPage = "profile" | "preferences" | "memory" | "automation" | "boardroom";

const subpageFromPath = (path: string): SubPage => {
  if (path.includes("/preferences")) return "preferences";
  if (path.includes("/memory")) return "memory";
  if (path.includes("/automation")) return "automation";
  if (path.includes("/boardroom")) return "boardroom";
  return "profile";
};

// ─── Profile Section ───────────────────────────────────────

const ProfileSection = () => {
  const { preferences, patterns, setPreference, confirmPattern, dismissPattern, getLayer } = useAdaptivePersonalization();
  const [editing, setEditing] = useState(false);

  const traits = [
    { icon: MessageSquare, label: "Communication Style", path: "communication.style", value: preferences.communication.style, options: ["direct", "supportive", "analytical", "casual"] },
    { icon: Eye, label: "Explanation Depth", path: "communication.explanationDepth", value: preferences.communication.explanationDepth, options: ["minimal", "balanced", "detailed"] },
    { icon: Shield, label: "Risk Tolerance", path: "workflow.riskTolerance", value: preferences.workflow.riskTolerance, options: ["conservative", "moderate", "aggressive"] },
    { icon: Clock, label: "Reminder Cadence", path: "communication.reminderCadence", value: preferences.communication.reminderCadence, options: ["minimal", "gentle", "persistent"] },
    { icon: Zap, label: "Automation Comfort", path: "workflow.automationComfort", value: preferences.workflow.automationComfort, options: ["manual", "growing", "fully-automated"] },
    { icon: Bell, label: "Notification Sensitivity", path: "communication.notificationSensitivity", value: preferences.communication.notificationSensitivity, options: ["all", "important", "critical", "silent"] },
    { icon: Calendar, label: "Calendar Intensity", path: "workflow.calendarIntensity", value: preferences.workflow.calendarIntensity, options: ["light", "moderate", "packed"] },
    { icon: Heart, label: "Life Priority", path: "household.lifePriority", value: preferences.household.lifePriority, options: ["business-first", "family-first", "balanced", "self-first"] },
  ];

  const handleSave = () => {
    setEditing(false);
  };

  const activePatterns = patterns.filter((p) => !p.dismissed);
  const stillLearning = [
    "Your preferred time for weekly reviews",
    "Shopping brand preferences",
    "How you handle urgent vs routine tasks",
  ].filter((_, i) => patterns.length < i + 5);

  return (
    <div className="space-y-6">
<div className="flex items-center justify-between">
        <SitaSectionHeader title="Your Operating Profile" subtitle="How SITA understands and communicates with you" />
        <SitaButton variant={editing ? "primary" : "secondary"} size="sm" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? <><Save className="h-3.5 w-3.5" /> Save</> : <><Edit className="h-3.5 w-3.5" /> Edit</>}
        </SitaButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {traits.map((t, i) => {
          const layer = getLayer(t.path);
          return (
            <SitaCard key={i} hover={false} className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/8 p-2"><t.icon className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                    {layer === "inferred" && <Sparkles className="h-2.5 w-2.5 text-accent" />}
                  </div>
                  {editing ? (
                    <select
                      className="mt-1 w-full rounded-lg border border-border bg-secondary/40 px-2 py-1.5 text-sm text-foreground"
                      value={t.value}
                      onChange={(e) => setPreference(t.path, e.target.value)}
                    >
                      {t.options.map((o) => <option key={o} value={o}>{o.replace(/-/g, " ")}</option>)}
                    </select>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium text-foreground capitalize">{String(t.value).replace(/-/g, " ")}</p>
                  )}
                </div>
              </div>
            </SitaCard>
          );
        })}
      </div>

      <SitaSectionHeader title="What SITA Has Learned" subtitle="Inferred patterns from your behavior" />
      {activePatterns.length > 0 ? (
        <div className="space-y-2">
          {activePatterns.map((p) => (
            <SitaCard key={p.id} hover={false} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Sparkles className="h-3.5 w-3.5 text-accent shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground">{p.source} · {p.sampleCount} samples</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(p.confidence * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8">{Math.round(p.confidence * 100)}%</span>
                  </div>
                  <TrustBadge level={p.confidence >= 0.85 ? "verified" : p.confidence >= 0.7 ? "review" : "low-confidence"} size="sm" />
                  {!p.confirmed && (
                    <div className="flex gap-1">
                      <button onClick={() => confirmPattern(p.id)} className="p-1 rounded hover:bg-primary/10" title="Confirm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      </button>
                      <button onClick={() => dismissPattern(p.id)} className="p-1 rounded hover:bg-destructive/10" title="Dismiss">
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                  {p.confirmed && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      ) : (
        <SitaCard hover={false} className="p-5">
          <div className="text-center text-sm text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No patterns detected yet. Keep using SITA and patterns will emerge automatically.</p>
          </div>
        </SitaCard>
      )}

      {stillLearning.length > 0 && (
        <SitaCard hover={false} glow className="p-5 gradient-sita-subtle">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-5 w-5 text-primary" />
            <SitaCardTitle>SITA is Still Learning</SitaCardTitle>
          </div>
          <div className="space-y-2">
            {stillLearning.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                {item}
              </div>
            ))}
          </div>
        </SitaCard>
      )}
    </div>
  );
};

// ─── Preferences Section ───────────────────────────────────

const PreferencesSection = () => {
  const { preferences, setPreference, getLayer } = useAdaptivePersonalization();
  const [editGroup, setEditGroup] = useState<string | null>(null);

  const groups = [
    { title: "Business", icon: Briefcase, prefs: [
      { key: "Lead follow-up cadence", path: "financial.billPaymentTiming", val: preferences.financial.billPaymentTiming },
      { key: "Quote approval threshold", path: "trust.autoApproveThreshold", val: `$${preferences.trust.autoApproveThreshold}` },
      { key: "Preferred CRM view", path: "domain.businessView", val: preferences.domain.businessView },
    ]},
    { title: "Money", icon: DollarSign, prefs: [
      { key: "Safe-to-spend buffer", path: "financial.safeToSpendBuffer", val: `$${preferences.financial.safeToSpendBuffer}` },
      { key: "Savings auto-transfer", path: "financial.savingsAutoTransfer", val: preferences.financial.savingsAutoTransfer ? "Enabled" : "Disabled" },
      { key: "Spending alert threshold", path: "financial.spendingAlertThreshold", val: `$${preferences.financial.spendingAlertThreshold}` },
      { key: "Budget view style", path: "financial.budgetViewStyle", val: preferences.financial.budgetViewStyle },
    ]},
    { title: "Household", icon: Home, prefs: [
      { key: "Grocery restock day", path: "household.groceryDay", val: preferences.household.groceryDay },
      { key: "Task assignment", path: "household.taskAssignment", val: preferences.household.taskAssignment },
      { key: "Family meeting", path: "household.familyMeetingDay", val: `${preferences.household.familyMeetingDay} ${preferences.household.familyMeetingTime}` },
      { key: "Child coordination", path: "household.childCoordination", val: preferences.household.childCoordination },
    ]},
  ];

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => (
        <div key={gi} className="space-y-3">
          <div className="flex items-center justify-between">
            <SitaSectionHeader title={g.title} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.prefs.map((p, pi) => {
              const layer = getLayer(p.path);
              return (
                <SitaCard key={pi} hover={false} className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{p.key}</span>
                      {layer === "inferred" && <Sparkles className="h-2.5 w-2.5 text-accent" />}
                    </div>
                    <span className="text-sm font-medium text-foreground capitalize">{String(p.val)}</span>
                  </div>
                </SitaCard>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Memory Section ────────────────────────────────────────

const MemorySection = () => {
  const { patterns } = useAdaptivePersonalization();

  const categories = [
    { cat: "Behavioral Patterns", count: patterns.length, items: patterns.slice(0, 3).map((p) => p.label) },
    { cat: "Workflow Patterns", count: patterns.filter((p) => p.dimension.startsWith("navigation")).length, items: patterns.filter((p) => p.dimension.startsWith("navigation")).map((p) => p.label).slice(0, 3) },
    { cat: "Trust & Approval", count: patterns.filter((p) => p.dimension.startsWith("trust")).length, items: patterns.filter((p) => p.dimension.startsWith("trust")).map((p) => p.label).slice(0, 3) },
    { cat: "Schedule & Timing", count: patterns.filter((p) => p.dimension.startsWith("schedule")).length, items: patterns.filter((p) => p.dimension.startsWith("schedule")).map((p) => p.label).slice(0, 3) },
  ];

  return (
    <div className="space-y-6">
      <SitaSectionHeader title="Memory by Category" subtitle="What SITA has learned about you" />
      {categories.map((c, i) => (
        <SitaCard key={i} hover={false} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <SitaCardTitle>{c.cat}</SitaCardTitle>
            <span className="text-xs text-muted-foreground">{c.count} patterns</span>
          </div>
          {c.items.length > 0 ? (
            <div className="space-y-1.5">
              {c.items.map((item, j) => (
                <div key={j} className="flex items-center gap-2 text-xs text-foreground">
                  <Brain className="h-3 w-3 text-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No patterns detected yet in this category</p>
          )}
        </SitaCard>
      ))}
    </div>
  );
};

// ─── Automation Section ────────────────────────────────────

const AutomationSection = () => {
  const { autoRules, autoPilot, setAutoPilot, setRuleEnabled, setRuleLevel, ruleEvaluations } = useAdaptivePersonalization();

  const levelLabels = { suggest: "Suggest Only", draft: "Draft for Review", auto: "Fully Automated" };
  const trustMap = { suggest: "low-confidence" as const, draft: "review" as const, auto: "verified" as const };

  return (
    <div className="space-y-6">
      {/* Auto-Pilot Toggle */}
      <SitaCard hover={false} glow className="p-5 gradient-sita-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Power className="h-5 w-5 text-primary" />
            <div>
              <SitaCardTitle>Auto-Pilot Mode</SitaCardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, SITA auto-applies all high-confidence learnings without asking
              </p>
            </div>
          </div>
          <Switch checked={autoPilot} onCheckedChange={setAutoPilot} />
        </div>
      </SitaCard>

      <SitaSectionHeader title="Automation Rules" subtitle="What SITA handles automatically vs. with approval" />
      {autoRules.map((rule) => {
        const evalResult = ruleEvaluations.find((e) => e.ruleId === rule.id);
        return (
          <SitaCard key={rule.id} hover={false} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{rule.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
              </div>
              <Switch checked={rule.enabled} onCheckedChange={(v) => setRuleEnabled(rule.id, v)} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <div className="flex gap-1">
                {(["suggest", "draft", "auto"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRuleLevel(rule.id, level)}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      rule.level === level
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {levelLabels[level]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {evalResult?.triggered && (
                  <span className="text-[10px] text-accent">Active</span>
                )}
                <TrustBadge level={trustMap[rule.level]} size="sm" />
              </div>
            </div>
          </SitaCard>
        );
      })}
    </div>
  );
};

// ─── Boardroom Section ─────────────────────────────────────

const BoardroomSection = () => {
  const { preferences, setPreference } = useAdaptivePersonalization();

  const items = [
    { key: "Review frequency", path: "workflow.reviewFrequency", val: preferences.workflow.reviewFrequency },
    { key: "Chart style", path: "display.chartStyle", val: preferences.display.chartStyle },
    { key: "Decision format", path: "workflow.decisionFormat", val: preferences.workflow.decisionFormat },
    { key: "Risk visibility", path: "trust.riskVisibility", val: preferences.trust.riskVisibility },
    { key: "Weekly review day", path: "schedule.weeklyReviewDay", val: preferences.schedule.weeklyReviewDay },
  ];

  return (
    <div className="space-y-6">
      <SitaSectionHeader title="Boardroom Style" subtitle="How SITA presents reviews and decisions" />
      {items.map((p, i) => (
        <SitaCard key={i} hover={false} className="p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{p.key}</span>
            <span className="text-sm font-medium text-foreground capitalize">{String(p.val).replace(/-/g, " ")}</span>
          </div>
        </SitaCard>
      ))}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────

const PersonalizationStudio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patterns, autoRules, preferences, resetAll, loaded } = useAdaptivePersonalization();
  const activePage = subpageFromPath(location.pathname);

  const goTo = (key: string) => {
    if (key === "profile") navigate("/personalization");
    else navigate(`/personalization/${key}`);
  };

  const confirmedPatterns = patterns.filter((p) => p.confirmed).length;
  const avgConfidence = patterns.length > 0
    ? Math.round(patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length * 100)
    : 0;
  const activeRules = autoRules.filter((r) => r.enabled).length;

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex items-center justify-between">
        <SitaPageHeader title="Personalization Studio" subtitle="How SITA understands you — your profile, preferences, and learning model" />
        <SitaButton variant="secondary" size="sm" onClick={resetAll}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </SitaButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Learned Patterns" value={String(patterns.length)} trend={patterns.length > 0 ? "up" : undefined} sub={`${confirmedPatterns} confirmed`} icon={Brain} />
        <KPITile label="Avg Confidence" value={avgConfidence > 0 ? `${avgConfidence}%` : "—"} trend={avgConfidence >= 80 ? "up" : undefined} sub={avgConfidence >= 80 ? "Strong alignment" : "Building…"} icon={Sparkles} />
        <KPITile label="Active Rules" value={String(activeRules)} sub={`${autoRules.length} total`} icon={Zap} />
        <KPITile label="Auto-Pilot" value={preferences.autoPilot ? "ON" : "OFF"} sub={preferences.autoPilot ? "Fully autonomous" : "Manual control"} icon={Power} />
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <SitaTabs
          tabs={[
            { key: "profile", label: "Profile" },
            { key: "preferences", label: "Preferences" },
            { key: "memory", label: "Memory" },
            { key: "automation", label: "Automation" },
            { key: "boardroom", label: "Boardroom Style" },
          ]}
          active={activePage}
          onChange={goTo}
        />
      </div>

      {activePage === "profile" && <ProfileSection />}
      {activePage === "preferences" && <PreferencesSection />}
      {activePage === "memory" && <MemorySection />}
      {activePage === "automation" && <AutomationSection />}
      {activePage === "boardroom" && <BoardroomSection />}
    </motion.div>
  );
};

export default PersonalizationStudio;
