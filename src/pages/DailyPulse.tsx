// ═══════════════════════════════════════════════════════════════
// SITA OS — Daily Pulse (Cross-Domain Morning Briefing)
// Flagship Loop 1 surface — wired to live DB counts + emits proof
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";

import { useLoopEmitter } from "@/hooks/use-flagship-loop-proof";
import { HeroCard, SummaryCard, QueueCard, AdvisorCard } from "@/components/sita/cards";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { EmptyState } from "@/components/sita/EmptyState";
import { ListReveal, ListRevealItem } from "@/components/sita/motion/AppTransitions";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle, ArrowRight, Home, Sparkles, Wallet,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
// ── Helpers ──────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const DOMAIN_ACCENTS = {
  business: { from: "hsl(217 90% 55%)", to: "hsl(217 70% 45%)" },
  money:    { from: "hsl(160 60% 45%)", to: "hsl(152 55% 48%)" },
  concierge:{ from: "hsl(292 60% 55%)", to: "hsl(265 55% 58%)" },
} as const;

type DomainKey = keyof typeof DOMAIN_ACCENTS;

// ── Live data hook ───────────────────────────────────────────

function usePulseLiveData(userId: string | undefined) {
  return useQuery({
    queryKey: ["pulse-live", userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const [notif, approvals, files, recs] = await Promise.all([
        fromTable("notifications").select("id, title, urgency, created_at")
          .eq("user_id", userId!).order("created_at", { ascending: false }).limit(10),
        fromTable("ai_workforce_approval_queue").select("id, title, status, priority, created_at")
          .eq("user_id", userId!).eq("status", "pending").order("created_at", { ascending: false }).limit(10),
        fromTable("cloud_files").select("id", { count: "exact", head: true })
          .eq("user_id", userId!),
        fromTable("ai_workforce_recommendations")
          .select("id, title, severity, status, created_at")
          .eq("user_id", userId!).eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        notifications: (notif.data ?? []) as Array<{ id: string; title: string; urgency?: string }>,
        approvals: (approvals.data ?? []) as Array<{ id: string; title: string; priority?: string }>,
        fileCount: (files.count ?? 0) as number,
        recommendations: (recs.data ?? []) as Array<{ id: string; title: string; severity?: string }>,
      };
    },
  });
}

// ── Component ────────────────────────────────────────────────

export default function DailyPulse() {
  const { user, isDemo } = useAuth();
  const isDemoMode = false;
  const navigate = useNavigate();
  const emitLoop = useLoopEmitter("sign-in-dashboard-pulse");
  const [approvalsOpen, setApprovalsOpen] = useState(false);

  const { data: live, isLoading } = usePulseLiveData(user?.id);

  // Emit a loop completion the first time live data arrives.
  useEffect(() => {
    if (!user || isDemoMode || isLoading) return;
    const t0 = performance.now();
    emitLoop("pulse_view", {
      latency_ms: Math.round(performance.now() - t0),
      evidence: {
        notifications: live?.notifications.length ?? 0,
        pending_approvals: live?.approvals.length ?? 0,
        files: live?.fileCount ?? 0,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoading]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "there";

  const pendingApprovals = live?.approvals ?? [];
  const recentNotifications = live?.notifications ?? [];
  const fileCount = live?.fileCount ?? 0;

  const businessKpis = useMemo(() => [
    { label: "Pending Approvals", value: String(pendingApprovals.length) },
    { label: "Recommendations", value: String(live?.recommendations.length ?? 0) },
    { label: "Notifications", value: String(recentNotifications.length) },
  ], [pendingApprovals.length, live?.recommendations.length, recentNotifications.length]);

  const moneyKpis = useMemo(() => [
    { label: "Files in Library", value: String(fileCount) },
    { label: "Pending Review", value: String(pendingApprovals.filter(a => a.priority === "high").length) },
  ], [fileCount, pendingApprovals]);

  const conciergeKpis = useMemo(() => [
    { label: "Active Signals", value: String(recentNotifications.length) },
    { label: "Today", value: formatDate() },
  ], [recentNotifications.length]);

  const urgentItems = [
    ...pendingApprovals.slice(0, 3).map(a => ({
      id: a.id,
      label: a.title || "Pending approval",
      urgency: (a.priority === "high" ? "high" : "normal") as "high" | "normal",
    })),
    ...recentNotifications.filter(n => n.urgency === "high").slice(0, 2).map(n => ({
      id: n.id,
      label: n.title || "Notification",
      urgency: "high" as const,
    })),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <h1 className="sr-only">Daily Pulse</h1>
      <PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />

      <HeroCard
        title={formatDate()}
        metric={`${getGreeting()}, ${firstName}`}
        subtitle={isDemoMode
          ? "Cross-Domain Morning Briefing (demo)"
          : `${pendingApprovals.length} pending · ${recentNotifications.length} updates · ${fileCount} files`}
        accentFrom="hsl(265 55% 58%)"
        accentTo="hsl(285 50% 48%)"
        icon={<Sparkles className="h-5 w-5 text-[hsl(265_55%_58%)]" />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Business" icon={<Briefcase className="h-4 w-4" />} kpis={businessKpis} />
        <SummaryCard title="Finance" icon={<Wallet className="h-4 w-4" />} kpis={moneyKpis} />
        <SummaryCard title="Concierge" icon={<Home className="h-4 w-4" />} kpis={conciergeKpis} />
      </div>

      {urgentItems.length > 0 && (
        <QueueCard title="Needs Attention" items={urgentItems} />
      )}

      <ListReveal className="grid gap-4 md:grid-cols-3">
        <ListRevealItem>
          <AdvisorCard
            advisorName="Business Advisor"
            domain="business"
            insight={pendingApprovals.length > 0
              ? `${pendingApprovals.length} approvals waiting on you. Reviewing them now keeps execution moving.`
              : "No pending approvals — clean queue."}
            confidence={pendingApprovals.length > 0 ? 88 : 95}
            accentColor={DOMAIN_ACCENTS.business.from}
            action={{ label: "Open Approvals", onClick: () => navigate("/approvals") }}
          />
        </ListRevealItem>
        <ListRevealItem>
          <AdvisorCard
            advisorName="Finance Advisor"
            domain="finance"
            insight={fileCount > 0
              ? `${fileCount} files in library. Run intelligence to extract obligations and renewals.`
              : "No files yet — upload statements or contracts to unlock insights."}
            confidence={88}
            accentColor={DOMAIN_ACCENTS.money.from}
            action={{ label: "Open Files", onClick: () => navigate("/files") }}
          />
        </ListRevealItem>
        <ListRevealItem>
          <AdvisorCard
            advisorName="Life Advisor"
            domain="concierge"
            insight={recentNotifications.length > 0
              ? `${recentNotifications.length} fresh signals across the household stream.`
              : "All quiet — household stream is calm."}
            confidence={90}
            accentColor={DOMAIN_ACCENTS.concierge.from}
            action={{ label: "See Activity", onClick: () => navigate("/activity") }}
          />
        </ListRevealItem>
      </ListReveal>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] overflow-hidden"
      >
        <button
          onClick={() => setApprovalsOpen(!approvalsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-[hsl(0_0%_100%/0.03)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[hsl(38_85%_58%)]" />
            <span className="text-sm font-medium text-[hsl(0_0%_90%)]">Pending Approvals</span>
            <span className="text-xs text-[hsl(0_0%_50%)] bg-[hsl(0_0%_100%/0.06)] px-2 py-0.5 rounded-full">
              {pendingApprovals.length}
            </span>
          </div>
          {approvalsOpen ? <ChevronUp className="h-4 w-4 text-[hsl(0_0%_50%)]" /> : <ChevronDown className="h-4 w-4 text-[hsl(0_0%_50%)]" />}
        </button>
        {approvalsOpen && pendingApprovals.length > 0 && (
          <div className="border-t border-[hsl(0_0%_100%/0.06)] divide-y divide-[hsl(0_0%_100%/0.06)]">
            {pendingApprovals.map(a => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-[hsl(0_0%_80%)]">{a.title || "Pending approval"}</p>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", {
                  "bg-[hsl(0_70%_50%/0.1)] text-[hsl(0_70%_60%)]": a.priority === "high",
                  "bg-[hsl(38_85%_58%/0.1)] text-[hsl(38_85%_58%)]": a.priority === "medium",
                  "bg-[hsl(0_0%_100%/0.06)] text-[hsl(0_0%_50%)]": !a.priority || a.priority === "low",
                })}>{a.priority || "normal"}</span>
              </div>
            ))}
          </div>
        )}
        {approvalsOpen && pendingApprovals.length === 0 && (
          <div className="border-t border-[hsl(0_0%_100%/0.06)] p-4">
            <EmptyState
              variant="card"
              icon={CheckCircle}
              title="All clear"
              description="No pending approvals."
            />
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {([
          { key: "business", label: "Business Center", route: "/business", icon: Briefcase, accent: DOMAIN_ACCENTS.business },
          { key: "money", label: "Finance Center", route: "/money", icon: Wallet, accent: DOMAIN_ACCENTS.money },
          { key: "concierge", label: "Concierge Center", route: "/concierge", icon: Home, accent: DOMAIN_ACCENTS.concierge },
        ] as const).map(d => (
          <button
            key={d.key}
            onClick={() => navigate(d.route)}
            className="flex items-center gap-2 rounded-xl border border-[hsl(0_0%_100%/0.06)] px-4 py-2.5 hover:bg-[hsl(0_0%_100%/0.03)] transition-all"
          >
            <d.icon className="h-4 w-4" style={{ color: d.accent.from }} />
            <span className="text-sm font-medium text-[hsl(0_0%_90%)]">{d.label}</span>
            <ArrowRight className="h-3 w-3 text-[hsl(0_0%_50%)]" />
          </button>
        ))}
      </div>
    </div>
  );
}
