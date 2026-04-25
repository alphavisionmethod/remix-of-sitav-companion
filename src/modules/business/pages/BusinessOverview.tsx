import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, Briefcase, ArrowRight, CheckCircle,
  AlertTriangle, Clock, TrendingUp, Send, DollarSign,
  Gavel, Eye, Zap, PhoneCall, RotateCcw, Settings,
  Sparkles, Play, BarChart3, Leaf, Shield
} from "lucide-react";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getIdentityLayer } from "@/domains/engines/business-identity-layers";
import { HomeIdentityHeader } from "@/components/business/home/HomeIdentityHeader";
import { WhatMattersNowHero } from "@/components/business/home/WhatMattersNowHero";
import { PressurePulseLayer } from "@/components/business/home/PressurePulseLayer";
import { OpportunityRecoveryLayer } from "@/components/business/home/OpportunityRecoveryLayer";
import { ContinuityTimeline } from "@/components/business/home/ContinuityTimeline";
import { AdvisorSynthesisZone } from "@/components/business/home/AdvisorSynthesisZone";
import { BoardroomEntryZone } from "@/components/business/home/BoardroomEntryZone";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────
type SessionMode = "operating" | "morning" | "eod";
type BusinessState = "live" | "calm" | "review-heavy" | "degraded" | "first-use" | "low-data";

// ── State Detection ───────────────────────────────────────────
function detectBusinessState(profileConfidence: number, isAdapted: boolean): BusinessState {
  if (!isAdapted) return "first-use";
  if (profileConfidence < 0.3) return "low-data";
  if (profileConfidence < 0.5) return "degraded";
  // In a real system these would be computed from actual data signals
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());
  if (isWeekend || (hour >= 20 || hour < 6)) return "calm";
  return "live";
}

// ── Session Mode Toggle ───────────────────────────────────────
function SessionModeToggle({ mode, onChange }: { mode: SessionMode; onChange: (m: SessionMode) => void }) {
  const hour = new Date().getHours();
  const suggested = hour < 12 ? "morning" : hour >= 17 ? "eod" : "operating";

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-card/40 border border-border/20">
      {[
        { key: "morning" as const, icon: Sun, label: "Morning" },
        { key: "operating" as const, icon: Briefcase, label: "Operating" },
        { key: "eod" as const, icon: Moon, label: "End of Day" },
      ].map(m => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all ${
            mode === m.key
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-muted-foreground hover:text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          <m.icon size={11} />
          {m.label}
          {m.key === suggested && mode !== m.key && (
            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Morning Briefing ──────────────────────────────────────────
function MorningBriefingOverlay() {
  const { primaryMode } = useBusinessProfile();

  const briefItems = [
    { icon: AlertTriangle, color: "text-amber-400", text: "2 overdue follow-ups from yesterday need attention" },
    { icon: DollarSign, color: "text-emerald-400", text: "$8,400 payment received overnight — Meridian account" },
    { icon: TrendingUp, color: "text-blue-400", text: "Pipeline advanced: 2 deals moved to proposal stage" },
    { icon: Zap, color: "text-violet-400", text: "New high-intent lead detected from website activity" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-border/20"
      style={{ background: `linear-gradient(160deg, hsl(38 85% 58% / 0.06) 0%, hsl(var(--card) / 0.6) 50%)` }}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Sun size={18} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground/90 font-[Space_Grotesk]">Morning Briefing</h2>
            <p className="text-[10px] text-muted-foreground">What happened since yesterday · What to focus on first</p>
          </div>
        </div>
        <div className="space-y-2">
          {briefItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/30 border border-border/10">
              <item.icon size={14} className={item.color} />
              <p className="text-xs text-foreground/70">{item.text}</p>
            </motion.div>
          ))}
        </div>
        <div className="p-3 rounded-xl border border-amber-500/10 bg-amber-500/5">
          <p className="text-[11px] text-amber-400/70">
            <span className="font-semibold">Today's primary leverage:</span> Close the 2 overdue follow-ups before noon — both accounts show active buying intent.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── End of Day Closure ────────────────────────────────────────
function EODClosureOverlay() {
  const closureItems = [
    { icon: CheckCircle, color: "text-emerald-400", label: "Completed", value: "7 tasks", detail: "including 2 high-priority follow-ups" },
    { icon: AlertTriangle, color: "text-amber-400", label: "Still Open", value: "3 items", detail: "1 overdue, 2 due tomorrow" },
    { icon: DollarSign, color: "text-blue-400", label: "Revenue Moved", value: "$42.8K", detail: "pipeline value progressed today" },
    { icon: RotateCcw, color: "text-violet-400", label: "Recovered", value: "$8,400", detail: "from late payment collection" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-border/20"
      style={{ background: `linear-gradient(160deg, hsl(265 55% 58% / 0.05) 0%, hsl(var(--card) / 0.6) 50%)` }}>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Moon size={18} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground/90 font-[Space_Grotesk]">End of Day Closure</h2>
            <p className="text-[10px] text-muted-foreground">What moved today · What carries into tomorrow</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {closureItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="p-3 rounded-xl bg-card/30 border border-border/10">
              <div className="flex items-center gap-2 mb-1.5">
                <item.icon size={12} className={item.color} />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">{item.label}</span>
              </div>
              <p className="text-base font-bold font-mono text-foreground/80">{item.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{item.detail}</p>
            </motion.div>
          ))}
        </div>
        <div className="p-3 rounded-xl border border-violet-500/10 bg-violet-500/5">
          <p className="text-[11px] text-violet-400/70">
            <span className="font-semibold">Carry forward:</span> 1 overdue follow-up (Atlas Corp) should be first action tomorrow morning.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Resume Strip ──────────────────────────────────────────────
function ResumeStrip() {
  const items = [
    { label: "Last reviewed: Pipeline", time: "4h ago", icon: BarChart3 },
    { label: "Prepared: Follow-up to Atlas Corp", time: "Not sent", icon: Send },
    { label: "Opened: Collections queue", time: "Yesterday", icon: DollarSign },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40 shrink-0">Resume:</span>
      {items.map((item, i) => (
        <button key={i}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/30 border border-border/15 hover:border-border/30 transition-all text-[10px] text-muted-foreground hover:text-foreground/70 whitespace-nowrap shrink-0">
          <item.icon size={10} />
          <span>{item.label}</span>
          <span className="text-muted-foreground/40 text-[8px]">· {item.time}</span>
        </button>
      ))}
    </motion.div>
  );
}

// ── Dynamic Action Tray ───────────────────────────────────────
function DynamicActionTray() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  const actions = useMemo(() => {
    const base = [
      { label: "Follow Up", icon: Send },
      { label: "Review Pipeline", icon: TrendingUp },
      { label: "Chase Payments", icon: DollarSign },
      { label: "Ask Advisor", icon: Sparkles },
      { label: "Open Boardroom", icon: Gavel },
    ];
    const modeActions: Record<string, typeof base> = {
      ecommerce: [
        { label: "Recover Carts", icon: RotateCcw },
        { label: "Check Orders", icon: BarChart3 },
        ...base.slice(2),
      ],
      "employee-based": [
        { label: "Assign Work", icon: Settings },
        { label: "Clear Blockers", icon: Zap },
        ...base.slice(2),
      ],
      "appointment-based": [
        { label: "Send Reminders", icon: Send },
        { label: "Check Schedule", icon: Clock },
        ...base.slice(2),
      ],
      agency: [
        { label: "Review Projects", icon: Eye },
        { label: "Client Outreach", icon: PhoneCall },
        ...base.slice(2),
      ],
    };
    return modeActions[primaryMode] || base;
  }, [primaryMode]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="flex items-center gap-2 flex-wrap">
      {actions.map((a, i) => (
        <motion.button key={a.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.04 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
          style={{
            background: `hsl(${identity.accentColor} / 0.06)`,
            color: `hsl(${identity.accentColor} / 0.75)`,
            border: `1px solid hsl(${identity.accentColor} / 0.1)`,
          }}>
          <a.icon size={11} />
          {a.label}
        </motion.button>
      ))}
    </motion.div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-5 p-4 md:p-6 max-w-[1400px] mx-auto">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Skeleton className="xl:col-span-2 h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Skeleton className="lg:col-span-3 h-48 rounded-2xl" />
        <Skeleton className="lg:col-span-2 h-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}

// ── First Use State ───────────────────────────────────────────
function FirstUseState() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-6 p-8">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `hsl(${identity.accentColor} / 0.1)` }}>
          <Sparkles size={28} style={{ color: `hsl(${identity.accentColor})` }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground/90 font-[Space_Grotesk] mb-2">Your Operating Room Awaits</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Business Home becomes your command center as you connect your data. Start by adding customers, leads, or invoices to unlock intelligent synthesis.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          {[
            { icon: TrendingUp, label: "Pipeline Intelligence", desc: "Track deals and opportunities" },
            { icon: DollarSign, label: "Revenue Awareness", desc: "Collections and cash timing" },
            { icon: Sparkles, label: "AI Advisor", desc: "Strategic recommendations" },
            { icon: Gavel, label: "Boardroom", desc: "Formal strategic review" },
          ].map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="p-3 rounded-xl bg-card/30 border border-border/15">
              <f.icon size={14} className="text-muted-foreground mb-1.5" />
              <p className="text-[11px] font-medium text-foreground/70">{f.label}</p>
              <p className="text-[9px] text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <Button className="gap-2" style={{ background: `hsl(${identity.accentColor})` }}>
          <Play size={14} />
          Get Started
        </Button>
      </div>
    </motion.div>
  );
}

// ── Low Data State ────────────────────────────────────────────
function LowDataState() {
  const { primaryMode } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <HomeIdentityHeader />
      {/* Low-data guidance banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 border border-amber-500/15"
        style={{ background: `linear-gradient(135deg, hsl(38 85% 58% / 0.04) 0%, hsl(var(--card) / 0.5) 100%)` }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Eye size={18} className="text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground/80 font-[Space_Grotesk]">Observation Mode</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your operating room is active but running on limited data. As you add more customers, deals, and activities, 
              the synthesis and recommendations will become more precise and confident.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {["Add contacts", "Create pipeline", "Log activities"].map(action => (
                <button key={action}
                  className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: `hsl(${identity.accentColor} / 0.08)`,
                    color: `hsl(${identity.accentColor} / 0.7)`,
                    border: `1px solid hsl(${identity.accentColor} / 0.12)`,
                  }}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <WhatMattersNowHero />
      <DynamicActionTray />
      <OpportunityRecoveryLayer />
    </motion.div>
  );
}

// ── Degraded State Banner ─────────────────────────────────────
function DegradedBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
      <Shield size={14} className="text-amber-400/70 shrink-0" />
      <p className="text-[10px] text-amber-400/60 leading-relaxed">
        <span className="font-semibold">Reduced confidence:</span> Some data sources are stale or incomplete. Recommendations are shown with lower confidence and caution flags are elevated.
      </p>
    </motion.div>
  );
}

// ── Calm Day Overlay ──────────────────────────────────────────
function CalmDayBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="rounded-2xl p-5 border border-emerald-500/15"
      style={{ background: `linear-gradient(135deg, hsl(152 55% 48% / 0.04) 0%, hsl(var(--card) / 0.4) 100%)` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Leaf size={18} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground/80 font-[Space_Grotesk]">Business is Steady</h3>
          <p className="text-[10px] text-muted-foreground">No urgent items. A good time to focus on opportunities, planning, or strategic improvements.</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Zone Emphasis by Profile ──────────────────────────────────
function getZoneEmphasis(primaryMode: string) {
  const base = { hero: 1, pressure: 1, opportunity: 1, continuity: 1, advisor: 1, boardroom: 1 };
  switch (primaryMode) {
    case "ecommerce": return { ...base, opportunity: 1.2, hero: 0.9 };
    case "service": return { ...base, hero: 1.2, advisor: 1.1 };
    case "employee-based": return { ...base, pressure: 1.2, hero: 1.1 };
    case "brick-and-mortar": return { ...base, pressure: 1.1, opportunity: 0.9 };
    case "appointment-based": return { ...base, hero: 1.1, pressure: 1.1 };
    case "agency": return { ...base, opportunity: 1.1, advisor: 1.1, boardroom: 1.1 };
    default: return base;
  }
}

// ── Main Orchestrator ─────────────────────────────────────────
const BusinessOverview = () => {
  const { primaryMode, isAdapted, profile } = useBusinessProfile();
  const identity = getIdentityLayer(primaryMode);
  const [sessionMode, setSessionMode] = useState<SessionMode>("operating");
  const [isLoading] = useState(false);

  const businessState = useMemo(() => detectBusinessState(profile.profileConfidence, isAdapted), [profile.profileConfidence, isAdapted]);
  const emphasis = useMemo(() => getZoneEmphasis(primaryMode), [primaryMode]);

  if (isLoading) return <LoadingSkeleton />;
  if (businessState === "first-use") return (
    <div className="min-h-full bg-background overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        <FirstUseState />
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-background overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">
        {/* Top bar: Session toggle + Resume */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SessionModeToggle mode={sessionMode} onChange={setSessionMode} />
          <ResumeStrip />
        </div>

        {/* Degraded state banner */}
        {businessState === "degraded" && <DegradedBanner />}

        <AnimatePresence mode="wait">
          {sessionMode === "morning" ? (
            <motion.div key="morning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-5">
                <MorningBriefingOverlay />
                <HomeIdentityHeader />
                <WhatMattersNowHero />
                <DynamicActionTray />
              </div>
            </motion.div>
          ) : sessionMode === "eod" ? (
            <motion.div key="eod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-5">
                <EODClosureOverlay />
                <ContinuityTimeline />
                <AdvisorSynthesisZone />
                <DynamicActionTray />
              </div>
            </motion.div>
          ) : businessState === "low-data" ? (
            <motion.div key="low-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LowDataState />
            </motion.div>
          ) : (
            <motion.div key="operating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-5">
                {/* Calm day banner */}
                {businessState === "calm" && <CalmDayBanner />}

                {/* Zone A — Identity Header */}
                <HomeIdentityHeader />

                {/* Zone B + C — Asymmetric: Hero 2/3, Pressure 1/3 */}
                {/* Swap column ratio when pressure is emphasized */}
                <div className={`grid grid-cols-1 gap-5 ${
                  emphasis.pressure > emphasis.hero
                    ? "xl:grid-cols-5"
                    : "xl:grid-cols-3"
                }`}>
                  <div className={emphasis.pressure > emphasis.hero ? "xl:col-span-3" : "xl:col-span-2"}>
                    <WhatMattersNowHero />
                  </div>
                  <div className={emphasis.pressure > emphasis.hero ? "xl:col-span-2" : "xl:col-span-1"}>
                    <PressurePulseLayer />
                  </div>
                </div>

                {/* Dynamic Action Tray */}
                <DynamicActionTray />

                {/* Zone D — Opportunity & Recovery */}
                <OpportunityRecoveryLayer />

                {/* Zone E + F — Continuity + Advisor */}
                {/* Swap order when advisor emphasis is high */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {emphasis.advisor > emphasis.continuity ? (
                    <>
                      <AdvisorSynthesisZone />
                      <ContinuityTimeline />
                    </>
                  ) : (
                    <>
                      <ContinuityTimeline />
                      <AdvisorSynthesisZone />
                    </>
                  )}
                </div>

                {/* Zone G — Boardroom Entry */}
                <BoardroomEntryZone />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessOverview;
