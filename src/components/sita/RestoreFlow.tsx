// ═══════════════════════════════════════════════════════════════
// SITA OS — Restore Flow
// Allows returning users to sign in and restore their workspace
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft, AlertCircle, Shield, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";
import { cn } from "@/lib/utils";

interface RestoreFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export function RestoreFlow({ onBack, onComplete }: RestoreFlowProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restored, setRestored] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message || "Authentication failed");
    } else {
      setRestored(true);
      toast.success("Workspace restored successfully");
      setTimeout(onComplete, 1200);
    }
  }, [email, password, signIn, onComplete]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  if (restored) {
    return (
      <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <img src={logo} alt="SITA" className="h-20 w-20 rounded-2xl" style={{ boxShadow: "0 0 40px rgba(139,92,246,0.15)" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full shadow-lg"
              style={{ background: "hsl(152 55% 48%)" }}>
              <Check className="h-4 w-4 text-white" />
            </motion.div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Workspace Restored</h2>
            <p className="text-sm text-muted-foreground mt-1">Loading your environment...</p>
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

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 500, height: 500, background: "radial-gradient(circle, hsl(265 55% 58% / 0.04) 0%, transparent 70%)" }} />
      </div>

      <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm px-6">
        {/* Back button */}
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-8">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Welcome
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(265 55% 58% / 0.15), hsl(265 55% 58% / 0.05))" }}>
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Restore Workspace</h2>
            <p className="text-xs text-muted-foreground">Sign in to recover your SITA environment</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" /> {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading || !email || !password}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
              "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            )}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Restoring...
              </div>
            ) : (
              <>Restore & Continue <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 mt-8 text-[10px] text-muted-foreground/30">
          <Shield className="h-3 w-3" />
          <span>Your data remains encrypted and private</span>
        </div>
      </motion.div>
    </div>
  );
}
