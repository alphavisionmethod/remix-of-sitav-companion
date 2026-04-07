// ═══════════════════════════════════════════════════════════════
// SITA OS — Living Desktop Surface
// The primary "place" of the OS — priorities, continuity,
// boardroom preview, command entry, trust awareness
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCashflowAnalysis, useCRMSync } from "@/hooks/use-backend-actions";
import {
  Brain, Sparkles, Bell, Calendar, ArrowRight, CheckCircle,
  Clock, BarChart3, Target, Shield, TrendingUp, Users,
  DollarSign, Briefcase, Home, ChevronRight, Zap,
  FileText, MessageSquare, Plus, Search, Inbox,
  Activity, BookOpen, Layout, Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import type { TrustPosture, ContinuityContext, ShellNotificationDigest } from "./useShellState";

// ── Types ────────────────────────────────────────────────────

interface BoardroomSummary {
  id: string;
  icon: React.ElementType;
  domain: string;
  headline: string;
  detail: string;
  status: "good" | "attention" | "action-needed";
}

interface TodayItem {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  urgency: "now" | "today" | "later";
  domain: string;
}

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
}

interface DesktopSurfaceProps {
  userName?: string;
  trustPosture?: TrustPosture;
  notifications?: ShellNotificationDigest;
  continuity?: ContinuityContext;
  primaryUseMode?: string;
  onOpenCommand?: () => void;
}

// ── Trust Mode Display ───────────────────────────────────────

const TRUST_LABELS: Record<string, { label: string; color: string }> = {
  suggest: { label: "Suggest mode", color: "bg-primary/10 text-primary" },
  "preview-first": { label: "Preview-first", color: "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" },
  "approval-required": { label: "Approval required", color: "bg-[hsl(var(--trust-approval))]/10 text-[hsl(var(--trust-approval))]" },
  quiet: { label: "Quiet mode", color: "bg-secondary text-muted-foreground" },
};

// ── Component ────────────────────────────────────────────────

export function DesktopSurface({
  userName,
  trustPosture = "secure",
  notifications = { total: 0, approvals: 0, urgent: 0, business: 0, finance: 0, household: 0, system: 0 },
  continuity = { lastWorkspace: null, lastActivity: null, pendingDrafts: 0, unfinishedWorkflows: 0, whatChanged: [] },
  primaryUseMode = "full",
  onOpenCommand,
}: DesktopSurfaceProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = useReducedMotion();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = userName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const anim = (delay: number) =>
    reduced ? {} : {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { delay, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    };

  // ── Boardroom Summary (adaptive by use mode) ────────────
  const boardroomItems = useMemo<BoardroomSummary[]>(() => {
    const items: BoardroomSummary[] = [
      { id: "biz", icon: Briefcase, domain: "Business", headline: "Pipeline health", detail: "12 active deals · 3 need attention", status: "attention" },
      { id: "fin", icon: DollarSign, domain: "Finance", headline: "Cash position", detail: "All bills current · Reserve at 85%", status: "good" },
      { id: "life", icon: Home, domain: "Household", headline: "Week ahead", detail: "6 tasks · 2 appointments · 1 overdue", status: "attention" },
    ];
    // Reorder by use mode
    if (primaryUseMode === "business") return [items[0], items[1], items[2]];
    if (primaryUseMode === "finance") return [items[1], items[0], items[2]];
    if (primaryUseMode === "household") return [items[2], items[0], items[1]];
    return items;
  }, [primaryUseMode]);

  // ── Today's Items ──────────────────────────────────────────
  const todayItems = useMemo<TodayItem[]>(() => [
    { id: "pulse", icon: Bell, label: "Review morning pulse", sublabel: "3 items need attention", urgency: "now", domain: "System" },
    { id: "approvals", icon: CheckCircle, label: `${notifications.approvals || 2} approvals waiting`, sublabel: "Advisor recommendations", urgency: "now", domain: "Trust" },
    { id: "followups", icon: Users, label: "Follow up with warm leads", sublabel: "2 contacts cooling down", urgency: "today", domain: "Business" },
    { id: "bills", icon: DollarSign, label: "Review upcoming bills", sublabel: "3 due this week", urgency: "today", domain: "Finance" },
    { id: "calendar", icon: Calendar, label: "2 meetings today", sublabel: "10:00 AM, 2:30 PM", urgency: "today", domain: "Calendar" },
  ], [notifications]);

  // ── Quick Actions ──────────────────────────────────────────
  const quickActions: QuickAction[] = [
    { id: "boardroom", icon: BarChart3, label: "Enter Boardroom", path: "/boardroom" },
    { id: "approvals", icon: CheckCircle, label: "Review Approvals", path: "/approvals" },
    { id: "capture", icon: Plus, label: "Capture", path: "/inbox" },
    { id: "tasks", icon: Target, label: "Tasks", path: "/concierge" },
  ];

  // ── Continuity Items ───────────────────────────────────────
  const continuityItems = useMemo(() => {
    const items: { icon: React.ElementType; label: string }[] = [];
    if (continuity.lastWorkspace) items.push({ icon: Layout, label: `Continue in ${continuity.lastWorkspace}` });
    if (continuity.pendingDrafts > 0) items.push({ icon: FileText, label: `${continuity.pendingDrafts} draft${continuity.pendingDrafts !== 1 ? "s" : ""} waiting` });
    if (continuity.unfinishedWorkflows > 0) items.push({ icon: Workflow, label: `${continuity.unfinishedWorkflows} workflow${continuity.unfinishedWorkflows !== 1 ? "s" : ""} in progress` });
    if (continuity.whatChanged.length > 0) items.push({ icon: Activity, label: `${continuity.whatChanged.length} things changed` });
    return items;
  }, [continuity]);

  const trustMode = TRUST_LABELS[trustPosture === "secure" ? "suggest" : trustPosture === "approval_waiting" ? "approval-required" : "suggest"];

  return (
    <div className="relative mx-auto max-w-6xl space-y-5">
      {/* ── Hero: Greeting + Command Entry ──────────────────── */}
      <motion.div {...anim(0)} className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 md:p-8">
        {/* Ambient accent */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[hsl(var(--sita-gold))]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", trustMode.color)}>
                <Shield className="h-2.5 w-2.5" />
                {trustMode.label}
              </span>
              {notifications.total > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  <Bell className="h-2.5 w-2.5" />
                  {notifications.total}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {greeting}{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what matters right now.
            </p>
          </div>

          {/* Command entry pill */}
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2.5 rounded-xl border border-border/50 glass-panel px-4 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:border-border min-w-[240px]"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left text-xs">Search or do anything…</span>
            <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
        </div>
      </motion.div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Boardroom + Today (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Boardroom Preview */}
          <motion.div {...anim(0.1)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Boardroom</h2>
              </div>
              <button
                onClick={() => navigate("/boardroom")}
                className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Full briefing <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-border/20">
              {boardroomItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    {...anim(0.15 + i * 0.06)}
                    className="flex items-center gap-3.5 p-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                    onClick={() => navigate(
                      item.domain === "Business" ? "/business" :
                      item.domain === "Finance" ? "/money" : "/concierge"
                    )}
                  >
                    <div className={cn(
                      "rounded-lg p-2 shrink-0",
                      item.status === "good" ? "bg-[hsl(var(--trust-safe))]/10" :
                      item.status === "attention" ? "bg-[hsl(var(--sita-gold))]/10" :
                      "bg-destructive/10"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        item.status === "good" ? "text-[hsl(var(--trust-safe))]" :
                        item.status === "attention" ? "text-[hsl(var(--sita-gold))]" :
                        "text-destructive"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.domain}</span>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.status === "good" ? "bg-[hsl(var(--trust-safe))]" :
                          item.status === "attention" ? "bg-[hsl(var(--sita-gold))]" :
                          "bg-destructive"
                        )} />
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{item.headline}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Today's Focus */}
          <motion.div {...anim(0.25)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border/30">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Today</h2>
            </div>
            <div className="divide-y divide-border/20">
              {todayItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    {...anim(0.3 + i * 0.04)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors"
                  >
                    <div className={cn(
                      "rounded-lg p-1.5 shrink-0",
                      item.urgency === "now" ? "bg-primary/10" :
                      item.urgency === "today" ? "bg-[hsl(var(--sita-gold))]/10" :
                      "bg-secondary/40"
                    )}>
                      <Icon className={cn(
                        "h-3.5 w-3.5",
                        item.urgency === "now" ? "text-primary" :
                        item.urgency === "today" ? "text-[hsl(var(--sita-gold))]" :
                        "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{item.label}</p>
                      {item.sublabel && <p className="text-[10px] text-muted-foreground">{item.sublabel}</p>}
                    </div>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-medium shrink-0",
                      item.urgency === "now" ? "bg-primary/10 text-primary" :
                      item.urgency === "today" ? "bg-[hsl(var(--sita-gold))]/10 text-[hsl(var(--sita-gold))]" :
                      "bg-secondary/60 text-muted-foreground"
                    )}>
                      {item.urgency === "now" ? "Now" : item.urgency === "today" ? "Today" : "Later"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Actions */}
          <motion.div {...anim(0.15)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border/30">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Quick Actions</h2>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-1.5 rounded-xl p-3 hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="rounded-lg bg-primary/8 p-2 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Continuity */}
          {continuityItems.length > 0 && (
            <motion.div {...anim(0.25)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-border/30">
                <Clock className="h-4 w-4 text-[hsl(var(--sita-gold))]" />
                <h2 className="text-sm font-bold text-foreground">Continue</h2>
              </div>
              <div className="p-2 space-y-1">
                {continuityItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left group"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground flex-1">{item.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Advisor Insights */}
          <motion.div {...anim(0.3)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border/30">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Advisor Insights</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { advisor: "Business Advisor", insight: "3 leads cooling — follow up today", color: "text-primary" },
                { advisor: "Money Advisor", insight: "Insurance renewal due in 12 days", color: "text-[hsl(var(--trust-safe))]" },
                { advisor: "Concierge", insight: "Grocery list ready for approval", color: "text-[hsl(var(--sita-gold))]" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg px-2 py-2">
                  <Sparkles className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", item.color)} />
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.advisor}</p>
                    <p className="text-xs text-foreground mt-0.5">{item.insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Workflows */}
          <motion.div {...anim(0.35)} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-border/30">
              <Workflow className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Active Workflows</h2>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: "Invoice follow-up automation", status: "running", count: 3 },
                { label: "Lead scoring pipeline", status: "waiting", count: 1 },
              ].map((wf, i) => (
                <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
                  <div className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    wf.status === "running" ? "bg-[hsl(var(--trust-safe))] animate-pulse" : "bg-[hsl(var(--sita-gold))]"
                  )} />
                  <span className="text-xs text-foreground flex-1">{wf.label}</span>
                  <span className="text-[10px] text-muted-foreground">{wf.count} items</span>
                </div>
              ))}
              <button
                onClick={() => navigate("/workflows")}
                className="w-full text-[11px] text-primary hover:text-primary/80 py-1 transition-colors"
              >
                View all workflows →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
