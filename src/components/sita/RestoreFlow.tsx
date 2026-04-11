// ═══════════════════════════════════════════════════════════════
// SITA OS — Restore Flow (Spec-compliant Screen 8)
// Sign in → Restore Preview → Confirm/Start Fresh
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft,
  AlertCircle, Shield, Check, User, Calendar, Briefcase, Layout,
  Settings, Sparkles, Clock, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";

interface RestoreFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type FlowStep = "auth" | "preview" | "restoring" | "done";

const RESTORABLE_CATEGORIES = [
  { icon: Sparkles, label: "Advisors & Personality", count: 4, color: "text-primary" },
  { icon: Shield, label: "Trust Settings", count: 1, color: "text-trust-safe" },
  { icon: Briefcase, label: "Boards & Workspaces", count: 7, color: "text-primary" },
  { icon: Layout, label: "Desktop Layout", count: 1, color: "text-muted-foreground" },
  { icon: Settings, label: "Connections & Integrations", count: 3, color: "text-primary" },
  { icon: Clock, label: "Routines & Rituals", count: 5, color: "text-muted-foreground" },
];

export function RestoreFlow({ onBack, onComplete }: RestoreFlowProps) {
  const { signIn } = useAuth();
  const [step, setStep] = useState<FlowStep>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restoreProgress, setRestoreProgress] = useState(0);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message || "Authentication failed");
    } else {
      setStep("preview");
    }
  }, [email, password, signIn]);

  const handleRestore = useCallback(() => {
    setStep("restoring");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStep("done");
          toast.success("Environment restored successfully");
          setTimeout(onComplete, 1200);
        }, 500);
      }
      setRestoreProgress(Math.min(100, Math.round(p)));
    }, 400);
  }, [onComplete]);

  const handleStartFresh = useCallback(() => {
    toast.info("Starting fresh environment");
    onComplete();
  }, [onComplete]);

  // ── Done state ──
  if (step === "done") {
    return (
      <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <img src={logo} loading="lazy" alt="SITA" className="h-20 w-20 rounded-2xl" style={{ boxShadow: "0 0 40px rgba(139,92,246,0.15)" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full shadow-lg"
              style={{ background: "hsl(152 55% 48%)" }}>
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Environment Restored</h2>
            <p className="text-sm text-muted-foreground mt-1">Loading your workspace...</p>
          </div>
          <div className="flex justify-center">
            <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "hsl(265 55% 58%)" }}
                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Restoring state ──
  if (step === "restoring") {
    return (
      <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-sm px-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <RefreshCw className="h-10 w-10 text-primary mx-auto" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Restoring your environment</h2>
            <p className="text-sm text-muted-foreground mt-1">Syncing advisors, settings, and workspace…</p>
          </div>
          <div className="w-full max-w-xs mx-auto">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full bg-primary" style={{ width: `${restoreProgress}%` }}
                transition={{ duration: 0.3 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{restoreProgress}%</p>
          </div>
          {RESTORABLE_CATEGORIES.map((cat, i) => {
            const catDone = restoreProgress > (i + 1) * (100 / RESTORABLE_CATEGORIES.length);
            return (
              <motion.div key={cat.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 text-xs">
                {catDone ? <Check className="h-3 w-3 text-trust-safe" /> : <div className="h-3 w-3 rounded-full border border-muted animate-pulse" />}
                <span className={catDone ? "text-foreground" : "text-muted-foreground"}>{cat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 500, height: 500, background: "radial-gradient(circle, hsl(265 55% 58% / 0.04) 0%, transparent 70%)" }} />
      </div>

      <AnimatePresence mode="wait">
        {/* ── Auth Step ── */}
        {step === "auth" && (
          <motion.div key="auth" {...fadeIn} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm px-6">
            <button onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-8">
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(265 55% 58% / 0.15), hsl(265 55% 58% / 0.05))" }}>
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Restore Environment</h2>
                <p className="text-xs text-muted-foreground">Sign in to recover your SITA workspace</p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/70">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="you@example.com" autoFocus />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground/70">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <input type={showPw ? "text" : "password"} required value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-destructive rounded-lg bg-destructive/5 border border-destructive/20 p-2.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                  <button type="button" onClick={() => { setPassword(""); setError(""); }}
                    className="ml-auto text-xs text-primary hover:underline">Try again</button>
                </motion.div>
              )}

              <button type="submit" disabled={loading || !email || !password}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                  "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                )}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <div className="text-center">
                <button type="button" onClick={onBack} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  Use another method
                </button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-2 mt-8 text-[10px] text-muted-foreground/30">
              <Shield className="h-3 w-3" />
              <span>Your data remains encrypted and private</span>
            </div>
          </motion.div>
        )}

        {/* ── Restore Preview Step ── */}
        {step === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }} className="relative z-10 w-full max-w-md px-6">

            {/* Profile header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">{email.split("@")[0]}'s Environment</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Last used: Today</span>
                </div>
              </div>
            </div>

            {/* Restorable categories */}
            <div className="rounded-2xl border border-border/30 bg-card/60 p-5 mb-6" style={{ backdropFilter: "blur(12px)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">What will be restored</p>
              <div className="space-y-3">
                {RESTORABLE_CATEGORIES.map((cat, i) => (
                  <motion.div key={cat.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0">
                      <cat.icon className={cn("h-4 w-4", cat.color)} />
                    </div>
                    <span className="text-sm text-foreground flex-1">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground">{cat.count} items</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button onClick={handleRestore}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all">
                <RotateCcw className="h-4 w-4" /> Restore this environment
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setStep("auth")}
                  className="flex-1 text-center rounded-xl border border-border/40 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  Choose another
                </button>
                <button onClick={handleStartFresh}
                  className="flex-1 text-center rounded-xl border border-border/40 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all">
                  Start fresh instead
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40">You can also restore later from Settings</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
