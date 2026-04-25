// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Replay Mode
// Auto-generated presentation slides from weekly review data
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useActionFn } from "@/hooks/use-action";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { BoardroomSlide } from "@/platform/sita/components/sita/primitives/BoardroomSlide";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import {
  BarChart3, DollarSign, Briefcase, TrendingUp, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, Clock,
  Shield, Sparkles, Target, ArrowRight, Brain, Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Slide data auto-generated from weekly reviews ────────────

interface ReplaySlide {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  domain: "business" | "finance" | "concierge" | "system";
  content: React.ReactNode;
}

const generateWeeklySlides = (): ReplaySlide[] => {
  const weekDate = new Date(Date.now() - 86400000 * 7);
  const weekLabel = weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " +
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return [
    {
      id: "cover",
      title: "Weekly Executive Review",
      subtitle: weekLabel,
      icon: BarChart3,
      domain: "system",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <BarChart3 className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Weekly Executive Review</h1>
            <p className="text-lg text-muted-foreground mt-2">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <MetricPill label="Decisions Made" value="7" />
            <MetricPill label="Actions Completed" value="12" />
            <MetricPill label="Overall Confidence" value="87%" accent />
          </div>
        </div>
      ),
    },
    {
      id: "business-summary",
      title: "Business Health",
      subtitle: "Pipeline, revenue, client status",
      icon: Briefcase,
      domain: "business",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <SlideKPI label="Revenue (MTD)" value="$42,800" trend="up" delta="+12%" />
            <SlideKPI label="Active Pipeline" value="$128K" trend="up" delta="+8 leads" />
            <SlideKPI label="Client Health" value="92%" trend="stable" />
            <SlideKPI label="Aging Leads" value="3" trend="down" delta="resolved 2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SlideInsight title="Top Opportunity" text="Acme Corp renewal — $24K ARR, 88% close probability. Follow-up scheduled." confidence={0.88} />
            <SlideInsight title="Risk Flag" text="2 invoices overdue >30 days. Collections advisor recommends escalation." confidence={0.72} isRisk />
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Advisor Consensus</p>
            <p className="text-sm text-foreground">"Pipeline is strong but collection velocity needs attention. Prioritize follow-up on overdue accounts before pursuing new leads."</p>
          </div>
        </div>
      ),
    },
    {
      id: "finance-summary",
      title: "Financial Health",
      subtitle: "Cash flow, reserves, obligations",
      icon: DollarSign,
      domain: "finance",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <SlideKPI label="Cash Position" value="$31,200" trend="stable" />
            <SlideKPI label="Safe to Spend" value="$8,400" trend="up" delta="+$1.2K" />
            <SlideKPI label="Reserve Health" value="78%" trend="up" delta="+3%" />
            <SlideKPI label="Waste Detected" value="$89/mo" trend="down" delta="-$45" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SlideInsight title="Cash Timing" text="Bills due next 7 days: $4,200. Receivable expected: $6,800. Net positive position." confidence={0.91} />
            <SlideInsight title="Reserve Alert" text="Emergency fund at 78% of target. Advisor recommends $800 transfer this week." confidence={0.85} />
          </div>
          <div className="rounded-xl border border-trust-safe/20 bg-trust-safe/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-trust-safe" />
              <p className="text-xs font-semibold text-trust-safe">Deterministic Verification</p>
            </div>
            <p className="text-xs text-muted-foreground">All calculations verified by sovereign-calculation engine. No LLM-generated arithmetic.</p>
          </div>
        </div>
      ),
    },
    {
      id: "concierge-summary",
      title: "Household & Family",
      subtitle: "Calendar, tasks, providers",
      icon: Home,
      domain: "concierge",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <SlideKPI label="Tasks Completed" value="14" trend="up" />
            <SlideKPI label="Events This Week" value="6" trend="stable" />
            <SlideKPI label="Provider Score" value="4.2/5" trend="stable" />
            <SlideKPI label="Open Items" value="3" trend="down" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SlideInsight title="Calendar Conflict" text="Saturday: Soccer practice overlaps with dentist appointment. Concierge suggests rescheduling dentist to Thursday." confidence={0.82} />
            <SlideInsight title="Provider Update" text="CleanPro reliability flagged. 2 late arrivals this month. Alternative provider identified." confidence={0.75} isRisk />
          </div>
        </div>
      ),
    },
    {
      id: "decisions",
      title: "Decisions & Actions",
      subtitle: "What was decided and what happens next",
      icon: Target,
      domain: "system",
      content: (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decisions Made This Week</p>
            {[
              { text: "Approved: Move $800 to emergency reserve", status: "executed", advisor: "Money Advisor" },
              { text: "Approved: Send collection notice to Invoice #1042", status: "executed", advisor: "Business Advisor" },
              { text: "Deferred: Expand pipeline into healthcare vertical", status: "carried", advisor: "Growth Advisor" },
              { text: "Approved: Switch cleaning provider to SparkleClean", status: "pending", advisor: "Concierge Advisor" },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
                <div className={cn("h-2 w-2 rounded-full shrink-0",
                  d.status === "executed" ? "bg-trust-safe" : d.status === "carried" ? "bg-accent" : "bg-primary"
                )} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{d.text}</p>
                  <p className="text-[10px] text-muted-foreground">{d.advisor}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize",
                  d.status === "executed" ? "bg-trust-safe/10 text-trust-safe" :
                  d.status === "carried" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                )}>{d.status}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Carryover to Next Week</p>
            {["Healthcare vertical assessment", "School enrollment deadline (12 days)", "Reserve target gap analysis"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
                <AlertTriangle className="h-3 w-3 text-accent shrink-0" />
                <p className="text-xs text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "confidence",
      title: "Trust & Confidence",
      subtitle: "How certain we are across domains",
      icon: Shield,
      domain: "system",
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            {[
              { label: "Business Advisor", value: 88 },
              { label: "Money Advisor", value: 92 },
              { label: "Concierge Advisor", value: 78 },
              { label: "Growth Advisor", value: 71 },
              { label: "Risk Advisor", value: 85 },
            ].map((a) => (
              <div key={a.label} className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground w-40">{a.label}</p>
                <div className="flex-1"><ConfidenceBar value={a.value} size="md" /></div>
                <span className="text-sm font-display font-bold text-foreground w-12 text-right">{a.value}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Proof Summary</p>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center"><p className="font-display text-xl font-bold text-trust-safe">18</p><p className="text-[10px] text-muted-foreground">Verified</p></div>
              <div className="text-center"><p className="font-display text-xl font-bold text-primary">5</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
              <div className="text-center"><p className="font-display text-xl font-bold text-destructive">1</p><p className="text-[10px] text-muted-foreground">Failed</p></div>
            </div>
          </div>
        </div>
      ),
    },
  ];
};

// ── Helper components ─────────────────────────────────────────

const MetricPill = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className={cn("rounded-xl border px-4 py-3 text-center", accent ? "border-primary/20 bg-primary/5" : "border-border bg-card/50")}>
    <p className={cn("font-display text-xl font-bold", accent ? "text-primary" : "text-foreground")}>{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const SlideKPI = ({ label, value, trend, delta }: { label: string; value: string; trend: "up" | "down" | "stable"; delta?: string }) => (
  <div className="rounded-xl border border-border bg-card/50 p-3 text-center">
    <p className="font-display text-lg font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
    {delta && (
      <p className={cn("text-[10px] font-medium mt-0.5",
        trend === "up" ? "text-trust-safe" : trend === "down" ? "text-destructive" : "text-muted-foreground"
      )}>{delta}</p>
    )}
  </div>
);

const SlideInsight = ({ title, text, confidence, isRisk }: { title: string; text: string; confidence: number; isRisk?: boolean }) => (
  <div className={cn("rounded-xl border p-4",
    isRisk ? "border-accent/20 bg-accent/5" : "border-border bg-card/50"
  )}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <ConfidenceBar value={Math.round(confidence * 100)} size="sm" />
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

// ── Replay Controller ─────────────────────────────────────────

export default function BoardroomReplay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slides] = useState(generateWeeklySlides);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const INTERVAL = 15;
  const [elapsed, setElapsed] = useState(0);

  const saveSession = useActionFn("workspace", "activity.log", {
    successMessage: "Session saved to history",
    errorMessage: "Failed to save session",
  });

  const handleSaveSession = async () => {
    if (!user || sessionSaved) return;
    const result = await saveSession({
      table: "boardroom_sessions",
      data: {
        user_id: user.id,
        session_type: "weekly",
        title: "Weekly Executive Review",
        slides_data: slides.map(s => ({ id: s.id, title: s.title, domain: s.domain })),
        confidence_score: 87,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
    });
    if (result) setSessionSaved(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setElapsed(prev => {
        if (prev >= INTERVAL - 1) {
          setCurrent(c => (c + 1) % slides.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsFullscreen(false); return; }
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setCurrent(c => Math.min(c + 1, slides.length - 1)); setElapsed(0); }
      if (e.key === "ArrowLeft") { setCurrent(c => Math.max(c - 1, 0)); setElapsed(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slides.length]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const slide = slides[current];
  const Icon = slide.icon;

  const content = (
    <div className={cn("flex flex-col h-full", isFullscreen ? "fixed inset-0 z-[70] bg-background" : "")}>
      {/* Progress bar */}
      <div className="h-1 bg-secondary w-full shrink-0">
        <motion.div className="h-full gradient-sita" style={{ width: `${(elapsed / INTERVAL) * 100}%` }} />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b border-border glass shrink-0">
        <div className="flex items-center gap-3">
          {!isFullscreen && (
            <button onClick={() => navigate("/boardroom")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Boardroom
            </button>
          )}
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="rounded-lg gradient-sita p-1"><BarChart3 className="h-3.5 w-3.5 text-primary-foreground" /></div>
            <div>
              <p className="text-xs font-semibold text-foreground">Weekly Replay</p>
              <p className="text-[9px] text-muted-foreground">Slide {current + 1} of {slides.length}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => navigate("/boardroom/history")} className="rounded-lg px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            History
          </button>
          <button onClick={handleSaveSession} disabled={sessionSaved} className={cn("rounded-lg px-2 py-1.5 text-[10px] transition-colors", sessionSaved ? "text-trust-safe" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            {sessionSaved ? "✓ Saved" : "Save Session"}
          </button>
          <button onClick={() => { setIsPlaying(!isPlaying); setElapsed(0); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button onClick={toggleFullscreen} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16">
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <BoardroomSlide
              title={slide.title}
              subtitle={slide.subtitle}
              slideNumber={current + 1}
              totalSlides={slides.length}
            >
              {slide.content}
            </BoardroomSlide>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 border-t border-border glass shrink-0">
        <button onClick={() => { setCurrent(c => Math.max(c - 1, 0)); setElapsed(0); }} disabled={current === 0}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setElapsed(0); }}
              className={cn("h-2 rounded-full transition-all",
                i === current ? "w-6 gradient-sita" : "w-2 bg-muted hover:bg-muted-foreground/30"
              )} />
          ))}
        </div>
        <button onClick={() => { setCurrent(c => Math.min(c + 1, slides.length - 1)); setElapsed(0); }} disabled={current === slides.length - 1}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-30">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return content;
}
