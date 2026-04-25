// ═══════════════════════════════════════════════════════════════
// SITA OS — Arrival Preparation Step (Phase 2.16) — Rewrite
// Full environment summary with desktop preview and module map
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import {
  Shield, Brain, Globe, Sparkles, CheckCircle, ChevronRight,
  Eye, Users, DollarSign, Briefcase, Calendar, Heart,
  TrendingUp, Bell, Plug, Trophy, Clock, Settings, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ArrivalPrepStepProps {
  displayName: string;
  enabledDomains: string[];
  trustLevel: string;
  rituals: string[];
  aiStyle: string;
  primaryUseMode: string;
  activeAdvisors: { id: string; enabled: boolean; priority: string }[];
  connectedSystems: number;
  firstWinAction: string;
  permissionChoices: Record<string, boolean>;
  deferredCount: number;
  deferredItems?: string[];
  trustCalibrationLevel?: number;
  onNext: () => void;
  onPrev: () => void;
}

const domainLabels: Record<string, { label: string; icon: typeof Globe }> = {
  business: { label: "Business OS", icon: Briefcase },
  money: { label: "Finance OS", icon: DollarSign },
  concierge: { label: "Concierge OS", icon: Calendar },
};

const trustLabels: Record<string, string> = {
  open: "Open — autonomous with proof",
  balanced: "Balanced — approval for important actions",
  guarded: "Guarded — approval before every action",
};

const calibrationLabels: Record<number, string> = {
  1: "Observe only — SITA watches, never acts",
  2: "Suggest — SITA recommends, you decide",
  3: "Simulate — SITA previews outcomes first",
  4: "Ask before acting — approval required",
  5: "Auto-routine — handles repetitive tasks",
};

const advisorIcons: Record<string, typeof Heart> = {
  life: Heart, money: DollarSign, business: Briefcase,
  family: Users, concierge: Sparkles, growth: TrendingUp,
};

const useModeLabels: Record<string, string> = {
  personal: "Personal Life", family: "Family & Household",
  business: "Business & Operator", money: "Money & Financial", full: "Full SITA",
};

export const ArrivalPrepStep = ({
  displayName, enabledDomains, trustLevel, rituals, aiStyle,
  primaryUseMode, activeAdvisors, connectedSystems, firstWinAction,
  permissionChoices, deferredCount, deferredItems, trustCalibrationLevel, onNext, onPrev,
}: ArrivalPrepStepProps) => {
  const enabledAdvisors = activeAdvisors.filter(a => a.enabled);
  const enabledPermissions = Object.values(permissionChoices).filter(Boolean).length;

  const summaryGroups = [
    {
      label: "Active Advisors",
      icon: Brain,
      items: enabledAdvisors.length > 0
        ? enabledAdvisors.map(a => a.id.charAt(0).toUpperCase() + a.id.slice(1) + " Advisor")
        : ["No advisors active"],
    },
    {
      label: "Use Mode",
      icon: Sparkles,
      items: [useModeLabels[primaryUseMode] || "Not selected"],
    },
    {
      label: "Trust Mode",
      icon: Shield,
      items: [
        trustCalibrationLevel && calibrationLabels[trustCalibrationLevel]
          ? calibrationLabels[trustCalibrationLevel]
          : trustLabels[trustLevel] || trustLevel
      ],
    },
    {
      label: "Active Domains",
      icon: Globe,
      items: enabledDomains.map(d => domainLabels[d]?.label || d),
    },
    {
      label: "Connected Systems",
      icon: Plug,
      items: [connectedSystems > 0 ? `${connectedSystems} system${connectedSystems !== 1 ? "s" : ""} connected` : "No systems connected yet"],
    },
    {
      label: "First Win",
      icon: Trophy,
      items: [firstWinAction ? firstWinAction.replace(/-/g, " ") : "Not selected"],
    },
    {
      label: "Privacy Baseline",
      icon: Eye,
      items: [`${enabledPermissions}/7 permissions enabled`],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Summary */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20"
              >
                <CheckCircle className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Your environment is ready
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {displayName ? `${displayName}, here's` : "Here's"} everything SITA has configured
              </p>
            </div>

            {/* Summary Grid */}
            <div className="p-8 pt-6 space-y-2.5">
              {summaryGroups.map((section, i) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="rounded-xl border border-border/50 bg-secondary/20 p-3.5"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <section.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {section.items.map((item, j) => (
                      <span key={j} className="rounded-full bg-primary/8 border border-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-foreground capitalize">
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Deferred items */}
              {deferredCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl border border-border/30 bg-secondary/10 p-3 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {deferredCount} item{deferredCount !== 1 ? "s" : ""} deferred — available in Settings
                    </span>
                  </div>
                  {deferredItems && deferredItems.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-5">
                      {deferredItems.map((item, i) => (
                        <span key={i} className="text-[9px] text-muted-foreground/70 bg-secondary/30 rounded-full px-2 py-0.5 capitalize">
                          {item.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Post-onboarding refinement plan (Req #9) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="rounded-xl border border-primary/15 bg-primary/5 p-3.5 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    What SITA will keep learning
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Your communication patterns", timeline: "over the next week" },
                    { label: "Your schedule rhythm", timeline: "over the next month" },
                    { label: "Your spending patterns", timeline: "as data connects" },
                    { label: "Your priorities", timeline: "refined every boardroom session" },
                    { label: "Your support preferences", timeline: "with each calibration check-in" },
                  ].map((item, i) => (
                    <p key={i} className="text-[10px] text-foreground/70">
                      <span className="text-foreground font-medium">{item.label}</span>{" "}
                      — <span className="text-muted-foreground italic">{item.timeline}</span>
                    </p>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  Refine anytime in Settings → Personalization
                </p>
              </motion.div>

              {/* Status line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--trust-safe))] animate-pulse" />
                All systems initialized · Advisors standing by · Proof engine active
              </motion.div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                <div className="flex items-center gap-3">
                  <button onClick={onPrev} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Settings className="h-3 w-3" /> Make changes
                  </button>
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Learn the basics
                  </button>
                </div>
                <motion.button
                  onClick={onNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
                >
                  Enter SITA <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Desktop preview + environment map */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-8 space-y-4">
            {/* Desktop preview */}
            <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Desktop preview</p>
              <div className="rounded-xl border border-border/50 bg-[#0B0D10] overflow-hidden aspect-[16/10]">
                {/* Mini top bar */}
                <div className="h-5 bg-card/60 border-b border-border/30 flex items-center justify-between px-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-sm bg-primary/60" />
                    <span className="text-[6px] text-muted-foreground font-semibold">SITA OS</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-[hsl(var(--trust-safe))]" />
                </div>
                {/* Content area */}
                <div className="flex h-[calc(100%-20px)]">
                  {/* Sidebar */}
                  <div className="w-10 border-r border-border/20 bg-card/20 p-1 space-y-1">
                    {enabledDomains.slice(0, 3).map((d, i) => {
                      const cfg = domainLabels[d];
                      return (
                        <motion.div
                          key={d}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 + i * 0.15 }}
                          className="h-6 w-6 mx-auto rounded-md bg-primary/10 flex items-center justify-center"
                        >
                          {cfg && <cfg.icon className="h-2.5 w-2.5 text-primary/60" />}
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Main */}
                  <div className="flex-1 p-2 space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="rounded-md bg-primary/5 border border-primary/10 p-1.5"
                    >
                      <div className="h-1.5 w-12 bg-primary/20 rounded" />
                      <div className="h-1 w-20 bg-muted/30 rounded mt-1" />
                    </motion.div>
                    {firstWinAction && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                        className="rounded-md bg-[hsl(var(--trust-safe))]/5 border border-[hsl(var(--trust-safe))]/10 p-1.5"
                      >
                        <div className="h-1 w-16 bg-[hsl(var(--trust-safe))]/20 rounded" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Environment map — illuminated modules */}
            <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Environment map</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "business-os", label: "Business", icon: Briefcase, active: enabledDomains.includes("business") },
                  { id: "finance-os", label: "Finance", icon: DollarSign, active: enabledDomains.includes("money") },
                  { id: "concierge-os", label: "Concierge", icon: Calendar, active: enabledDomains.includes("concierge") },
                  { id: "trust-center", label: "Trust", icon: Shield, active: true },
                  { id: "boardroom", label: "Boardroom", icon: Brain, active: true },
                  { id: "proof-engine", label: "Proof", icon: Eye, active: true },
                ].map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={cn(
                      "rounded-lg border p-2 text-center transition-all",
                      mod.active
                        ? "border-primary/20 bg-primary/5 shadow-sm shadow-primary/5"
                        : "border-border/30 bg-secondary/10 opacity-40"
                    )}
                  >
                    <mod.icon className={cn("h-3.5 w-3.5 mx-auto mb-1",
                      mod.active ? "text-primary" : "text-muted-foreground"
                    )} />
                    <p className="text-[8px] text-muted-foreground font-medium">{mod.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Advisor presence */}
              {enabledAdvisors.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[9px] text-muted-foreground">{enabledAdvisors.length} advisors ready</span>
                  <div className="flex gap-1 ml-auto">
                    {enabledAdvisors.map(a => {
                      const AdvIcon = advisorIcons[a.id] || Sparkles;
                      return (
                        <motion.div
                          key={a.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                          <AdvIcon className="h-2.5 w-2.5 text-primary" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
