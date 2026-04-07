// ═══════════════════════════════════════════════════════════════
// SITA OS — Post-Arrival First Desktop State
// The first thing the user sees after setup completes.
// Welcome card · First boardroom brief · Today's priorities · Deferred items
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  Brain, Sparkles, Bell, Calendar, ArrowRight, CheckCircle,
  Clock, Plug, Sliders, BarChart3, Target, Shield,
  TrendingUp, Users, DollarSign, Briefcase, BookOpen,
  ChevronRight, Zap, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────

interface UserSetupData {
  displayName: string;
  advisorActivation: { id: string; name: string; enabled: boolean }[];
  primaryUseMode: string;
  firstWin: string;
  deferredConnections: string[];
  trustLevel: string;
  enabledDomains: string[];
  worldModel: Record<string, unknown>;
}

interface BoardroomBrief {
  id: string;
  icon: typeof Briefcase;
  domain: string;
  headline: string;
  detail: string;
  status: "good" | "attention" | "action-needed";
}

interface TodayPriority {
  id: string;
  icon: typeof Target;
  label: string;
  domain: string;
  urgency: "now" | "today" | "this-week";
}

// ── Component ────────────────────────────────────────────────

export function PostArrivalDesktop({ onDismiss }: { onDismiss: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [setupData, setSetupData] = useState<UserSetupData | null>(null);
  const [phase, setPhase] = useState<"welcome" | "ready">("welcome");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Load user's setup choices
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await fromTable("user_memory")
          .select("key, value")
          .eq("user_id", user.id);

        const mem: Record<string, any> = {};
        (data || []).forEach((r: any) => {
          try { mem[r.key] = JSON.parse(r.value); } catch { mem[r.key] = r.value; }
        });

        setSetupData({
          displayName: mem.display_name || "",
          advisorActivation: mem.advisor_activation || [],
          primaryUseMode: mem.primary_use_mode || "",
          firstWin: mem.first_recovery || "",
          deferredConnections: mem.deferred_connections || [],
          trustLevel: mem.trust_level || "balanced",
          enabledDomains: mem.enabled_domains || [],
          worldModel: mem.world_model || {},
        });
      } catch {
        setSetupData({
          displayName: "",
          advisorActivation: [],
          primaryUseMode: "",
          firstWin: "",
          deferredConnections: [],
          trustLevel: "balanced",
          enabledDomains: ["business", "finance", "concierge"],
          worldModel: {},
        });
      }
    };
    load();
  }, [user]);

  // Auto-advance welcome → ready
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 2200);
    return () => clearTimeout(t);
  }, []);

  const activeAdvisors = setupData?.advisorActivation?.filter(a => a.enabled) || [];
  const advisorCount = activeAdvisors.length || 3;
  const deferredItems = setupData?.deferredConnections || [];

  // Generate contextual boardroom briefs
  const boardroomBriefs: BoardroomBrief[] = [
    ...(setupData?.enabledDomains?.includes("business") ? [{
      id: "biz",
      icon: Briefcase,
      domain: "Business",
      headline: "Pipeline ready for review",
      detail: "12 active deals • 3 need attention this week",
      status: "attention" as const,
    }] : []),
    ...(setupData?.enabledDomains?.includes("finance") ? [{
      id: "fin",
      icon: DollarSign,
      domain: "Finance",
      headline: "Cash position healthy",
      detail: "All bills current • Next payment cycle in 5 days",
      status: "good" as const,
    }] : []),
    ...(setupData?.enabledDomains?.includes("concierge") ? [{
      id: "home",
      icon: Home,
      domain: "Household",
      headline: "Week ahead coordinated",
      detail: "6 tasks active • 1 overdue • Family calendar synced",
      status: "attention" as const,
    }] : []),
  ];

  // Today's priorities based on setup choices
  const todayPriorities: TodayPriority[] = [
    { id: "pulse", icon: Bell, label: "Review your morning pulse", domain: "System", urgency: "now" },
    ...(setupData?.firstWin === "missed-followup" ? [{ id: "fw1", icon: Users, label: "Follow up with stale contacts", domain: "Business", urgency: "today" as const }] : []),
    ...(setupData?.firstWin === "bill-payment" ? [{ id: "fw2", icon: DollarSign, label: "Review upcoming bills", domain: "Finance", urgency: "today" as const }] : []),
    ...(setupData?.firstWin === "weekly-schedule" ? [{ id: "fw3", icon: Calendar, label: "Plan your week", domain: "Concierge", urgency: "today" as const }] : []),
    ...(setupData?.firstWin === "household-coordination" ? [{ id: "fw4", icon: Home, label: "Sync household tasks", domain: "Household", urgency: "today" as const }] : []),
    { id: "trust", icon: Shield, label: "Review advisor trust settings", domain: "System", urgency: "this-week" },
    { id: "explore", icon: Sparkles, label: "Explore your operating environment", domain: "System", urgency: "this-week" },
  ];

  const handleEnterDesktop = () => {
    localStorage.setItem("sita-post-arrival-seen", "true");
    onDismiss();
  };

  const anim = (delay: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ── Welcome Card ─────────────────────────────────────── */}
      <motion.div {...anim(0)} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {greeting}{setupData?.displayName ? `, ${setupData.displayName}` : ""}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                SITA is ready. {advisorCount} advisor{advisorCount !== 1 ? "s" : ""} active. Your environment is configured.
              </p>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--trust-safe))]/10 border border-[hsl(var(--trust-safe))]/20 px-3 py-1 text-xs font-medium text-[hsl(var(--trust-safe))]">
              <CheckCircle className="h-3 w-3" /> Setup complete
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3 w-3" /> {advisorCount} advisors online
            </span>
            {setupData?.trustLevel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 border border-border/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Shield className="h-3 w-3" /> Trust: {setupData.trustLevel}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Boardroom Brief + Today ────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* First Boardroom Brief */}
          <motion.div {...anim(0.15)} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-sm font-bold text-foreground">First Boardroom Brief</h2>
              </div>
              <button
                onClick={() => navigate("/boardroom")}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                Full briefing <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-border/30">
              {boardroomBriefs.map((brief, i) => (
                <motion.div
                  key={brief.id}
                  {...anim(0.2 + i * 0.08)}
                  className="flex items-start gap-4 p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => navigate(
                    brief.domain === "Business" ? "/business" :
                    brief.domain === "Finance" ? "/money" :
                    "/concierge"
                  )}
                >
                  <div className={cn(
                    "rounded-lg p-2 shrink-0",
                    brief.status === "good" ? "bg-[hsl(var(--trust-safe))]/10" :
                    brief.status === "attention" ? "bg-[hsl(var(--sita-gold))]/10" :
                    "bg-destructive/10"
                  )}>
                    <brief.icon className={cn(
                      "h-4 w-4",
                      brief.status === "good" ? "text-[hsl(var(--trust-safe))]" :
                      brief.status === "attention" ? "text-[hsl(var(--sita-gold))]" :
                      "text-destructive"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{brief.domain}</span>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        brief.status === "good" ? "bg-[hsl(var(--trust-safe))]" :
                        brief.status === "attention" ? "bg-[hsl(var(--sita-gold))]" :
                        "bg-destructive"
                      )} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{brief.headline}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{brief.detail}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                </motion.div>
              ))}

              {boardroomBriefs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-xs text-muted-foreground">Your boardroom will populate as data flows in.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Today's Priorities */}
          <motion.div {...anim(0.3)} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 p-5 border-b border-border/40">
              <Target className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Today's Priorities</h2>
            </div>

            <div className="divide-y divide-border/30">
              {todayPriorities.map((priority, i) => (
                <motion.div
                  key={priority.id}
                  {...anim(0.35 + i * 0.06)}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors"
                >
                  <div className={cn(
                    "rounded-lg p-1.5",
                    priority.urgency === "now" ? "bg-primary/10" :
                    priority.urgency === "today" ? "bg-[hsl(var(--sita-gold))]/10" :
                    "bg-secondary/40"
                  )}>
                    <priority.icon className={cn(
                      "h-3.5 w-3.5",
                      priority.urgency === "now" ? "text-primary" :
                      priority.urgency === "today" ? "text-[hsl(var(--sita-gold))]" :
                      "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{priority.label}</p>
                    <p className="text-[10px] text-muted-foreground">{priority.domain}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    priority.urgency === "now" ? "bg-primary/10 text-primary" :
                    priority.urgency === "today" ? "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" :
                    "bg-secondary/60 text-muted-foreground"
                  )}>
                    {priority.urgency === "now" ? "Now" : priority.urgency === "today" ? "Today" : "This week"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column: Deferred Items + Quick Actions ────── */}
        <div className="space-y-6">
          {/* Deferred Setup Items */}
          {deferredItems.length > 0 && (
            <motion.div {...anim(0.25)} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2.5 p-4 border-b border-border/40 bg-[hsl(var(--sita-gold))]/5">
                <Clock className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                <h3 className="text-sm font-bold text-foreground">Finish Later</h3>
              </div>
              <div className="p-3 space-y-1.5">
                {deferredItems.map(item => (
                  <button
                    key={item}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left group"
                  >
                    <Plug className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground flex-1">Connect {item}</span>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Set up →</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Advisor Summary */}
          <motion.div {...anim(0.35)} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 p-4 border-b border-border/40">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Your Advisors</h3>
            </div>
            <div className="p-3 space-y-1.5">
              {activeAdvisors.length > 0 ? activeAdvisors.slice(0, 5).map(advisor => (
                <div key={advisor.id} className="flex items-center gap-2.5 px-3 py-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{advisor.name}</span>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))]" />
                </div>
              )) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted-foreground">Advisors are standing by</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Learn Later */}
          <motion.div {...anim(0.4)} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center gap-2.5 p-4 border-b border-border/40">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Learn When Ready</h3>
            </div>
            <div className="p-3 space-y-1">
              {[
                { icon: Brain, label: "How SITA thinks" },
                { icon: Shield, label: "How approvals work" },
                { icon: BarChart3, label: "How Boardroom works" },
              ].map(topic => (
                <button
                  key={topic.label}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-secondary/30 transition-colors text-left"
                >
                  <topic.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs text-foreground">{topic.label}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 ml-auto" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Enter Desktop CTA ────────────────────────────────── */}
      <motion.div {...anim(0.5)} className="flex justify-center pt-2 pb-6">
        <button
          onClick={handleEnterDesktop}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          Enter your operating environment
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
