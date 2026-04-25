// ═══════════════════════════════════════════════════════════════
// SITA OS — Noob-Friendly Affordable Setup Checklist
// Practical guide to making the admin AI team powerful but cheap
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { getWorkforceRoles, getWorkforceStats } from "@/lib/core-services/ai-workforce/workforce-orchestrator";
import { DEFAULT_THRESHOLDS, ROLE_BUDGET_POLICIES } from "@/lib/core-services/ai-workforce/admin-budget-routing-policy";
import { ClipboardCheck, Shield, DollarSign, Zap, CheckCircle, AlertTriangle, Eye, Lock, Repeat, FileText, BarChart3, Users } from "lucide-react";
import AITSubNav from "@/platform/admin/components/admin/AITSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

interface CheckItem {
  id: string;
  step: number;
  title: string;
  description: string;
  detail: string;
  icon: React.ElementType;
  autoCheck?: () => boolean;
}

export default function AITSetupChecklist() {
  const { data: roles = [] } = useQuery({ queryKey: ["setup-roles"], queryFn: getWorkforceRoles });
  const { data: stats } = useQuery({ queryKey: ["setup-stats"], queryFn: getWorkforceStats });
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});

  // Load persisted checks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sita-setup-checklist");
      if (saved) setManualChecks(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setManualChecks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("sita-setup-checklist", JSON.stringify(next));
      return next;
    });
  };

  const activeRoles = roles.filter(r => r.is_active).length;
  const hasBalancedDefault = Object.values(ROLE_BUDGET_POLICIES).filter(p => p.defaultClass === "balanced_admin" || p.defaultClass === "economy_admin").length >= 8;

  const steps: CheckItem[] = [
    {
      id: "s1", step: 1, title: "Start with only 2 model tiers",
      description: "One balanced/default model + one premium model. Add economy later.",
      detail: "Don't configure 10 models on day one. Start simple: balanced for daily work, premium for synthesis only.",
      icon: Zap,
    },
    {
      id: "s2", step: 2, title: "Make balanced the default for almost everything",
      description: "Most admin roles should start on balanced, not premium.",
      detail: `Currently ${Object.values(ROLE_BUDGET_POLICIES).filter(p => p.defaultClass !== "premium_architecture" && p.defaultClass !== "deep_audit").length}/10 roles default to balanced/economy. Premium only for architecture synthesis, remediation planning, founder-grade summaries, deep audits.`,
      icon: Shield,
      autoCheck: () => hasBalancedDefault,
    },
    {
      id: "s3", step: 3, title: "Put all API keys in Supabase secrets only",
      description: "OPENAI_API_KEY, ANTHROPIC_API_KEY — never in frontend code.",
      detail: "Go to Supabase Dashboard > Settings > Edge Functions > Secrets. Add your keys there. Never hardcode them in components or .env files committed to git.",
      icon: Lock,
    },
    {
      id: "s4", step: 4, title: "Route all admin AI through the gateway",
      description: "No direct OpenAI/Anthropic calls from admin pages. Everything goes through AI provider gateway → role routing → budget policy → receipts.",
      detail: "The workforce-executor.ts already enforces this. Every task goes through invokeAICapability() with budget pre-flight checks.",
      icon: Shield,
    },
    {
      id: "s5", step: 5, title: "Create roles before creating 'agents'",
      description: "Think: role registry → task types → routing rules → approval rules. Not random always-on bots.",
      detail: `Currently ${activeRoles} roles active. Each role has defined budget class, fallback tier, and approval requirements.`,
      icon: Users,
      autoCheck: () => activeRoles >= 3,
    },
    {
      id: "s6", step: 6, title: "Make tasks operator-invoked first",
      description: "Click to run audit, diagnosis, remediation plan, summary. Manual first, automation later.",
      detail: "AIT03 Task Invocation Console supports manual invocation with scope, budget posture, and pre-flight budget checks.",
      icon: ClipboardCheck,
    },
    {
      id: "s7", step: 7, title: "Add premium warnings in the UI",
      description: "Show estimated cost band. Say 'balanced recommended first'. Allow premium only intentionally.",
      detail: "Pre-flight budget check panel in AIT03 shows warnings when premium is selected, cost bands, and downgrade notices.",
      icon: AlertTriangle,
    },
    {
      id: "s8", step: 8, title: "Reuse recent outputs",
      description: "Show last result, allow 'refresh' rather than rerunning blindly, suggest cached output if fresh.",
      detail: `Rerun ceiling: ${DEFAULT_THRESHOLDS.rerunCeilingPerHour}/hour for same task+scope. Workforce orchestrator supports getCachedOutput() for recent results.`,
      icon: Repeat,
    },
    {
      id: "s9", step: 9, title: "Use structured outputs",
      description: "Prefer short structured findings, recommendation arrays, issue lists. Avoid giant essay outputs.",
      detail: "Budget class specs limit maxTokens: economy=500, balanced=800, premium=2000, deep_audit=3000. This bounds response size.",
      icon: FileText,
    },
    {
      id: "s10", step: 10, title: "Limit automatic runs",
      description: "No always-on daily premium reports or recursive agent chains. Start manual, add one scheduled digest maybe.",
      detail: "No cron/scheduler is active by default. All tasks require operator invocation through AIT03.",
      icon: Shield,
    },
    {
      id: "s11", step: 11, title: "Add budget dashboards from day one",
      description: "Spend by role, by provider, by day, premium %, blocked budget events.",
      detail: "AIT05 Cost & Efficiency board shows all budget metrics with policy compliance tracking.",
      icon: BarChart3,
    },
    {
      id: "s12", step: 12, title: "Add approval for expensive actions",
      description: "If AI task exceeds premium threshold, affects system settings, or proposes risky changes → send to approval queue.",
      detail: "Human Approval Queue (HQ01-HQ04) supports risk-tier-aware routing with evidence-backed review.",
      icon: CheckCircle,
    },
    {
      id: "s13", step: 13, title: "Expand only after seeing real usage",
      description: "Only add more roles, providers, premium models, automation after watching usefulness, cost, reliability, and adoption.",
      detail: "Monitor AIT05 budget metrics and HQ03 decision history before expanding the AI team.",
      icon: Eye,
    },
    {
      id: "s14", step: 14, title: "Suggested initial launch strategy",
      description: "5 roles max active, mostly balanced routing, premium only for 2-3 task classes, manual invocation, strong caching, strong approval.",
      detail: `Current state: ${activeRoles} active roles, global daily budget $${(DEFAULT_THRESHOLDS.dailyGlobalAdminSpendCents / 100).toFixed(2)}, premium ceiling ${DEFAULT_THRESHOLDS.premiumPercentageCeiling}%.`,
      icon: DollarSign,
    },
  ];

  const isChecked = (item: CheckItem) => item.autoCheck?.() ?? manualChecks[item.id] ?? false;
  const completedCount = steps.filter(isChecked).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6 p-6 max-w-[1200px] mx-auto">
      <AITSubNav />
<div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" /> Affordable AI Team Setup Checklist
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Make the admin AI team feel powerful without burning money</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{completedCount}/{steps.length} steps completed</span>
            <Badge variant={pct >= 80 ? "default" : pct >= 50 ? "secondary" : "outline"} className="text-[10px]">{pct}%</Badge>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(item => {
          const checked = isChecked(item);
          return (
            <Card key={item.id} className={checked ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {item.autoCheck ? (
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${checked ? "bg-emerald-500 text-foreground" : "bg-muted text-muted-foreground"}`}>
                        {checked ? "✓" : item.step}
                      </div>
                    ) : (
                      <Checkbox checked={checked} onCheckedChange={() => toggle(item.id)} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${checked ? "text-emerald-500" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${checked ? "line-through text-muted-foreground" : ""}`}>
                        Step {item.step}: {item.title}
                      </span>
                      {item.autoCheck && <Badge variant="outline" className="text-[10px]">auto-detected</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{item.detail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
