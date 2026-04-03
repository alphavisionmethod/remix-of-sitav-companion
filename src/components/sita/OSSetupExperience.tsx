// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium OS Setup Experience
// macOS-like first-run: boot animation, system config, personality
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import {
  Brain, Shield, Zap, Globe, Eye, Lock, Sparkles, Check, ChevronRight,
  Briefcase, DollarSign, Headphones, Building, Home, BarChart3,
  Cpu, Wifi, Database, Server, HardDrive, Activity, Radio,
  Fingerprint, KeyRound, Users, Heart, Clock, Mail, Calendar,
  FileText, CreditCard, Sliders, Sun, Moon, Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────

type Phase = "boot" | "welcome" | "identity" | "domains" | "trust" | "ai-personality" | "appearance" | "system-check" | "ready";

interface SetupState {
  displayName: string;
  role: string;
  enabledDomains: string[];
  trustLevel: "open" | "balanced" | "guarded";
  aiStyle: "proactive" | "balanced" | "reserved";
  explanationDepth: "brief" | "standard" | "detailed";
  theme: "dark" | "light" | "auto";
  accentColor: string;
}

const phases: Phase[] = ["boot", "welcome", "identity", "domains", "trust", "ai-personality", "appearance", "system-check", "ready"];

// ── Boot Screen ─────────────────────────────────────────────

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [line, setLine] = useState(0);
  const bootLines = [
    { text: "SITA OS v3.0.0 — Sovereign Intelligence Platform", delay: 200 },
    { text: "Initializing neural architecture...", delay: 400 },
    { text: "Loading advisor protocols ████████████████ OK", delay: 600 },
    { text: "Mounting trust engine... verified ✓", delay: 300 },
    { text: "Connecting proof ledger... sealed ✓", delay: 250 },
    { text: "Starting governance layer... active ✓", delay: 300 },
    { text: "Loading memory subsystem... ready ✓", delay: 200 },
    { text: "AI workforce online — 20 agents standing by", delay: 400 },
    { text: "", delay: 200 },
    { text: "System ready. Welcome, Operator.", delay: 500 },
  ];

  useEffect(() => {
    if (line >= bootLines.length) {
      setTimeout(onComplete, 800);
      return;
    }
    const timer = setTimeout(() => setLine(l => l + 1), bootLines[line].delay);
    return () => clearTimeout(timer);
  }, [line]);

  return (
    <div className="fixed inset-0 z-[200] bg-[hsl(225,15%,4%)] flex flex-col items-center justify-center font-mono">
      {/* Logo pulse */}
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }} className="mb-8">
        <div className="relative">
          <img src={logo} alt="SITA" className="h-20 w-20 rounded-2xl" />
          <motion.div className="absolute inset-0 rounded-2xl border-2 border-primary/40"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }} />
        </div>
      </motion.div>

      {/* Boot log */}
      <div className="w-full max-w-lg px-6 space-y-1 text-left">
        {bootLines.slice(0, line).map((bl, i) => (
          <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className={cn("text-[11px] leading-relaxed",
              i === line - 1 ? "text-primary" : bl.text.includes("✓") ? "text-[hsl(var(--trust-safe))]" : "text-[hsl(var(--muted-foreground))]"
            )}>
            {bl.text || "\u00A0"}
          </motion.p>
        ))}
        {line < bootLines.length && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-12 w-full max-w-xs px-6">
        <div className="h-1 rounded-full bg-[hsl(var(--muted))]">
          <motion.div className="h-full rounded-full bg-primary"
            animate={{ width: `${(line / bootLines.length) * 100}%` }}
            transition={{ duration: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

// ── Phase Wrapper ───────────────────────────────────────────

function PhaseCard({ children, title, subtitle, icon: Icon, step, total }: {
  children: React.ReactNode; title: string; subtitle: string; icon: typeof Brain; step: number; total: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="w-full max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
            i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted")} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 mb-4">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">{children}</div>
      </div>
    </motion.div>
  );
}

// ── Selection Components ────────────────────────────────────

function OptionCard({ selected, onClick, icon: Icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: typeof Brain; title: string; desc: string;
}) {
  return (
    <button onClick={onClick} className={cn(
      "relative rounded-xl border p-4 text-left transition-all duration-200 group",
      selected ? "border-primary/50 bg-primary/8 shadow-sm shadow-primary/10" : "border-border bg-secondary/20 hover:border-primary/20 hover:bg-secondary/40"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("rounded-lg p-2 transition-colors", selected ? "bg-primary/15" : "bg-secondary")}>
          <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </button>
  );
}

function DomainToggle({ label, icon: Icon, enabled, onToggle, desc, color }: {
  label: string; icon: typeof Brain; enabled: boolean; onToggle: () => void; desc: string; color: string;
}) {
  return (
    <button onClick={onToggle} className={cn(
      "rounded-xl border p-5 text-left transition-all duration-300",
      enabled ? `border-${color}/30 bg-${color}/5` : "border-border bg-secondary/20 opacity-60 hover:opacity-80"
    )}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn("h-5 w-5", enabled ? `text-${color}` : "text-muted-foreground")} />
        <div className={cn("h-3 w-3 rounded-full transition-colors", enabled ? `bg-${color}` : "bg-muted")} />
      </div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </button>
  );
}

// ── System Check Animation ──────────────────────────────────

function SystemCheck({ onComplete }: { onComplete: () => void }) {
  const [checks, setChecks] = useState<{ name: string; status: "pending" | "running" | "done" }[]>([
    { name: "Advisor intelligence layer", status: "pending" },
    { name: "Trust & governance engine", status: "pending" },
    { name: "Proof ledger", status: "pending" },
    { name: "Memory subsystem", status: "pending" },
    { name: "Connector framework", status: "pending" },
    { name: "Budget automation", status: "pending" },
    { name: "Fraud sentinel", status: "pending" },
    { name: "Workflow engine", status: "pending" },
  ]);

  useEffect(() => {
    let idx = 0;
    const run = () => {
      if (idx >= checks.length) {
        setTimeout(onComplete, 600);
        return;
      }
      setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "running" } : c));
      setTimeout(() => {
        setChecks(prev => prev.map((c, i) => i === idx ? { ...c, status: "done" } : c));
        idx++;
        setTimeout(run, 150);
      }, 300 + Math.random() * 200);
    };
    run();
  }, []);

  return (
    <div className="space-y-2">
      {checks.map((c, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 bg-secondary/30">
          {c.status === "done" && <Check className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))]" />}
          {c.status === "running" && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Activity className="h-3.5 w-3.5 text-primary" /></motion.div>}
          {c.status === "pending" && <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />}
          <span className={cn("text-xs", c.status === "done" ? "text-foreground" : c.status === "running" ? "text-primary font-medium" : "text-muted-foreground")}>{c.name}</span>
          {c.status === "done" && <span className="ml-auto text-[10px] text-[hsl(var(--trust-safe))]">Ready</span>}
        </motion.div>
      ))}
    </div>
  );
}

// ── Main Setup Component ────────────────────────────────────

export function OSSetupExperience() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("boot");
  const [state, setState] = useState<SetupState>({
    displayName: "",
    role: "",
    enabledDomains: ["business", "money", "concierge"],
    trustLevel: "balanced",
    aiStyle: "balanced",
    explanationDepth: "standard",
    theme: "dark",
    accentColor: "purple",
  });
  const [systemCheckDone, setSystemCheckDone] = useState(false);

  const phaseIdx = phases.indexOf(phase);
  const totalSteps = phases.length - 3; // exclude boot, system-check, ready from step count

  const goNext = useCallback(() => {
    const nextIdx = phaseIdx + 1;
    if (nextIdx < phases.length) setPhase(phases[nextIdx]);
  }, [phaseIdx]);

  const goPrev = useCallback(() => {
    const prevIdx = phaseIdx - 1;
    if (prevIdx >= 1) setPhase(phases[prevIdx]); // don't go back to boot
  }, [phaseIdx]);

  const finishSetup = async () => {
    if (!user) { navigate("/"); return; }
    try {
      const memoryItems = [
        { user_id: user.id, key: "display_name", value: JSON.stringify(state.displayName), category: "profile" },
        { user_id: user.id, key: "role", value: JSON.stringify(state.role), category: "preference" },
        { user_id: user.id, key: "enabled_domains", value: JSON.stringify(state.enabledDomains), category: "preference" },
        { user_id: user.id, key: "trust_level", value: JSON.stringify(state.trustLevel), category: "preference" },
        { user_id: user.id, key: "ai_style", value: JSON.stringify(state.aiStyle), category: "preference" },
        { user_id: user.id, key: "explanation_depth", value: JSON.stringify(state.explanationDepth), category: "preference" },
      ].filter(m => m.value && m.value !== '""');

      await (supabase as any).from("user_memory").upsert(memoryItems, { onConflict: "user_id,key" });
      await (supabase as any).from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
      toast.success("SITA OS configured successfully");
    } catch (e) {
      console.error(e);
    }
    navigate("/");
  };

  const canAdvance = () => {
    if (phase === "identity") return state.displayName.length > 0 && state.role.length > 0;
    if (phase === "domains") return state.enabledDomains.length > 0;
    return true;
  };

  const toggleDomain = (d: string) => {
    setState(prev => ({
      ...prev,
      enabledDomains: prev.enabledDomains.includes(d)
        ? prev.enabledDomains.filter(x => x !== d)
        : [...prev.enabledDomains, d],
    }));
  };

  // Determine step number for non-boot phases
  const stepNum = Math.max(0, phaseIdx - 1);

  return (
    <>
      {/* Boot */}
      {phase === "boot" && <BootScreen onComplete={goNext} />}

      {/* Setup phases */}
      {phase !== "boot" && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-background overflow-y-auto p-4">
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
          </div>

          <AnimatePresence mode="wait">
            {/* Welcome */}
            {phase === "welcome" && (
              <PhaseCard key="welcome" title="Welcome to SITA OS" subtitle="Your sovereign AI operating system" icon={Brain} step={0} total={totalSteps}>
                <div className="text-center space-y-6">
                  <motion.img src={logo} alt="SITA" initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className="mx-auto h-24 w-24 rounded-3xl shadow-2xl shadow-primary/20" />
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    One brain, three domains — Business, Money, and Concierge — all working together under your control.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Shield, label: "Trust-First", desc: "Every action has proof" },
                      { icon: Eye, label: "Transparent", desc: "You see everything" },
                      { icon: Lock, label: "Sovereign", desc: "Your data, your rules" },
                    ].map(p => (
                      <div key={p.label} className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
                        <p.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                        <p className="text-xs font-semibold text-foreground">{p.label}</p>
                        <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={goNext} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    Begin Setup <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </PhaseCard>
            )}

            {/* Identity */}
            {phase === "identity" && (
              <PhaseCard key="identity" title="Who are you?" subtitle="This personalizes your entire experience" icon={Fingerprint} step={1} total={totalSteps}>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
                    <input value={state.displayName} onChange={e => setState(s => ({ ...s, displayName: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      placeholder="How should SITA address you?" autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Role</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        { key: "founder", icon: Briefcase, title: "Founder", desc: "Running a business" },
                        { key: "executive", icon: BarChart3, title: "Executive", desc: "Managing operations" },
                        { key: "family-office", icon: Building, title: "Family Office", desc: "Full-service operations" },
                        { key: "personal", icon: Home, title: "Personal", desc: "Life management" },
                      ].map(r => (
                        <OptionCard key={r.key} selected={state.role === r.key} onClick={() => setState(s => ({ ...s, role: r.key }))}
                          icon={r.icon} title={r.title} desc={r.desc} />
                      ))}
                    </div>
                  </div>
                  <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={canAdvance()} />
                </div>
              </PhaseCard>
            )}

            {/* Domains */}
            {phase === "domains" && (
              <PhaseCard key="domains" title="Choose Your Domains" subtitle="Enable the areas SITA should manage for you" icon={Globe} step={2} total={totalSteps}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3">
                    <DomainToggle icon={Briefcase} label="Business" desc="Leads, customers, revenue, invoices, CRM"
                      enabled={state.enabledDomains.includes("business")} onToggle={() => toggleDomain("business")} color="primary" />
                    <DomainToggle icon={DollarSign} label="Money" desc="Bills, subscriptions, reserves, investments, budgets"
                      enabled={state.enabledDomains.includes("money")} onToggle={() => toggleDomain("money")} color="accent" />
                    <DomainToggle icon={Headphones} label="Concierge" desc="Calendar, tasks, household, travel, appointments"
                      enabled={state.enabledDomains.includes("concierge")} onToggle={() => toggleDomain("concierge")} color="trust-safe" />
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground">You can enable more domains later from Settings</p>
                  <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={canAdvance()} />
                </div>
              </PhaseCard>
            )}

            {/* Trust */}
            {phase === "trust" && (
              <PhaseCard key="trust" title="Trust & Autonomy" subtitle="How much should SITA act on its own?" icon={Shield} step={3} total={totalSteps}>
                <div className="space-y-4">
                  {[
                    { key: "open", icon: Zap, title: "Open — Act freely", desc: "SITA handles routine actions automatically. You review later via proof trail." },
                    { key: "balanced", icon: Shield, title: "Balanced — Ask for important things", desc: "Low-risk actions run automatically. High-impact actions need your approval." },
                    { key: "guarded", icon: Lock, title: "Guarded — Ask before acting", desc: "SITA proposes everything, acts only when you approve. Maximum control." },
                  ].map(t => (
                    <OptionCard key={t.key} selected={state.trustLevel === t.key}
                      onClick={() => setState(s => ({ ...s, trustLevel: t.key as any }))}
                      icon={t.icon} title={t.title} desc={t.desc} />
                  ))}
                  <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true} />
                </div>
              </PhaseCard>
            )}

            {/* AI Personality */}
            {phase === "ai-personality" && (
              <PhaseCard key="ai-personality" title="AI Communication Style" subtitle="How should your advisors communicate?" icon={Sparkles} step={4} total={totalSteps}>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Communication Style</label>
                    <div className="space-y-2">
                      {[
                        { key: "proactive", title: "Proactive", desc: "Advisors surface insights and suggestions without being asked" },
                        { key: "balanced", title: "Balanced", desc: "Important findings are surfaced; routine info stays in background" },
                        { key: "reserved", title: "Reserved", desc: "Advisors respond when asked. Minimal unsolicited communication" },
                      ].map(s => (
                        <OptionCard key={s.key} selected={state.aiStyle === s.key}
                          onClick={() => setState(prev => ({ ...prev, aiStyle: s.key as any }))}
                          icon={Brain} title={s.title} desc={s.desc} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Explanation Depth</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "brief", label: "Brief", desc: "Just the answer" },
                        { key: "standard", label: "Standard", desc: "Answer + context" },
                        { key: "detailed", label: "Detailed", desc: "Full reasoning" },
                      ].map(d => (
                        <button key={d.key} onClick={() => setState(s => ({ ...s, explanationDepth: d.key as any }))}
                          className={cn("rounded-xl border p-3 text-center transition-all",
                            state.explanationDepth === d.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
                          )}>
                          <p className="text-xs font-semibold text-foreground">{d.label}</p>
                          <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true} />
                </div>
              </PhaseCard>
            )}

            {/* Appearance */}
            {phase === "appearance" && (
              <PhaseCard key="appearance" title="Appearance" subtitle="Make SITA feel like yours" icon={Sun} step={5} total={totalSteps}>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "dark", icon: Moon, label: "Dark" },
                        { key: "light", icon: Sun, label: "Light" },
                        { key: "auto", icon: Monitor, label: "Auto" },
                      ].map(t => (
                        <button key={t.key} onClick={() => setState(s => ({ ...s, theme: t.key as any }))}
                          className={cn("rounded-xl border p-4 text-center transition-all",
                            state.theme === t.key ? "border-primary/50 bg-primary/8" : "border-border bg-secondary/20 hover:border-primary/20"
                          )}>
                          <t.icon className={cn("h-5 w-5 mx-auto mb-1.5", state.theme === t.key ? "text-primary" : "text-muted-foreground")} />
                          <p className="text-xs font-semibold text-foreground">{t.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Accent Color</label>
                    <div className="flex gap-2 justify-center">
                      {[
                        { key: "purple", color: "bg-[hsl(265,55%,58%)]" },
                        { key: "blue", color: "bg-[hsl(215,70%,55%)]" },
                        { key: "green", color: "bg-[hsl(152,55%,48%)]" },
                        { key: "gold", color: "bg-[hsl(38,85%,58%)]" },
                        { key: "rose", color: "bg-[hsl(345,65%,55%)]" },
                      ].map(c => (
                        <button key={c.key} onClick={() => setState(s => ({ ...s, accentColor: c.key }))}
                          className={cn("h-9 w-9 rounded-full transition-all", c.color,
                            state.accentColor === c.key ? "ring-2 ring-offset-2 ring-primary ring-offset-card scale-110" : "hover:scale-105"
                          )} />
                      ))}
                    </div>
                  </div>
                  <NavButtons onPrev={goPrev} onNext={goNext} canAdvance={true} />
                </div>
              </PhaseCard>
            )}

            {/* System Check */}
            {phase === "system-check" && (
              <PhaseCard key="system-check" title="Initializing Your System" subtitle="Running final checks..." icon={Cpu} step={6} total={totalSteps}>
                <SystemCheck onComplete={() => { setSystemCheckDone(true); setTimeout(goNext, 400); }} />
              </PhaseCard>
            )}

            {/* Ready */}
            {phase === "ready" && (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl mx-auto text-center space-y-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                  <div className="relative mx-auto w-24 h-24">
                    <img src={logo} alt="SITA" className="h-24 w-24 rounded-3xl shadow-2xl shadow-primary/30" />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--trust-safe))] shadow-lg">
                      <Check className="h-5 w-5 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                <div>
                  <h1 className="font-display text-3xl font-bold gradient-sita-text">
                    {state.displayName ? `Welcome, ${state.displayName}` : "SITA OS Ready"}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">Your operating system is configured and all systems are online.</p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {[
                    { label: "Domains", value: state.enabledDomains.length, icon: Globe },
                    { label: "Trust", value: state.trustLevel, icon: Shield },
                    { label: "AI Style", value: state.aiStyle, icon: Brain },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                      <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-xs font-bold text-foreground capitalize">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <button onClick={finishSetup}
                  className="w-full max-w-sm mx-auto rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3.5 text-sm font-semibold text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  Enter SITA OS <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

// ── Nav Buttons ─────────────────────────────────────────────

function NavButtons({ onPrev, onNext, canAdvance }: { onPrev: () => void; onNext: () => void; canAdvance: boolean }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button onClick={onPrev} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
      <button onClick={onNext} disabled={!canAdvance}
        className={cn("rounded-xl px-6 py-2.5 text-sm font-semibold transition-all flex items-center gap-2",
          canAdvance ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
        )}>
        Continue <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
