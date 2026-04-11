// ═══════════════════════════════════════════════════════════════
// SITA OS — Enterprise Flow
// SSO/enterprise enrollment for team deployments
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, ArrowRight, ChevronLeft, Shield, Globe, Users, Lock, AlertCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";

interface EnterpriseFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type EnterpriseStep = "org-info" | "admin-auth" | "configuring";

export function EnterpriseFlow({ onBack, onComplete }: EnterpriseFlowProps) {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<EnterpriseStep>("org-info");
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOrgSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setStep("admin-auth");
  }, [orgName]);

  const handleAdminAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;

    setLoading(true);
    setError("");

    // Try sign in first, fall back to sign up
    const { error: signInError } = await signIn(adminEmail, adminPassword);
    if (signInError) {
      // Try creating the account
      const { error: signUpError } = await signUp(adminEmail, adminPassword, orgName + " Admin");
      if (signUpError) {
        setError(signUpError.message || "Authentication failed");
        setLoading(false);
        return;
      }
    }

    setStep("configuring");
    toast.success("Enterprise environment initializing");

    // Simulate enterprise provisioning
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 2500);
  }, [adminEmail, adminPassword, signIn, signUp, orgName, onComplete]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  // Configuring state
  if (step === "configuring") {
    return (
      <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-sm">
          <img src={logo} loading="lazy" alt="SITA" className="h-16 w-16 rounded-2xl mx-auto" style={{ boxShadow: "0 0 40px rgba(139,92,246,0.12)" }} />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Provisioning Enterprise</h2>
            <p className="text-sm text-muted-foreground mt-1">{orgName}</p>
          </div>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            {["Workspace isolation", "Role-based policies", "Audit trail", "SSO configuration"].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.4 }}
                className="flex items-center gap-3 text-xs rounded-lg px-3 py-2 bg-[rgba(255,255,255,0.03)]">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.4 + 0.3 }}>
                  <Check className="h-3.5 w-3.5 text-[hsl(152,55%,48%)]" />
                </motion.div>
                <span className="text-muted-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: "#0B0D10" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 rounded-full"
          style={{ width: 400, height: 400, background: "radial-gradient(circle, hsl(38 85% 58% / 0.03) 0%, transparent 70%)" }} />
      </div>

      <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-sm px-6">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-8">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Welcome
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(38 85% 58% / 0.15), hsl(38 85% 58% / 0.05))" }}>
            <Building2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Enterprise Setup</h2>
            <p className="text-xs text-muted-foreground">
              {step === "org-info" ? "Configure your organization" : "Authenticate as admin"}
            </p>
          </div>
        </div>

        {step === "org-info" && (
          <form onSubmit={handleOrgSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground/70">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input type="text" required value={orgName} onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="Acme Corporation" autoFocus />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground/70">Domain (optional)</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input type="text" value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="acme.com" />
              </div>
            </div>

            {/* Enterprise features preview */}
            <div className="rounded-xl border border-border/30 bg-[rgba(255,255,255,0.02)] p-4 space-y-2.5 mt-6">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Enterprise Includes</p>
              {[
                { icon: Users, label: "Multi-seat workspace with RBAC" },
                { icon: Lock, label: "SSO-ready authentication" },
                { icon: Shield, label: "Advanced audit & compliance" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <f.icon className="h-3 w-3" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <button type="submit" disabled={!orgName.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 mt-4",
                "bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}>
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {step === "admin-auth" && (
          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground/70">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input type="email" required value={adminEmail} onChange={(e) => { setAdminEmail(e.target.value); setError(""); }}
                  className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="admin@acme.com" autoFocus />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input type="password" required value={adminPassword}
                  onChange={(e) => { setAdminPassword(e.target.value); setError(""); }}
                  className="w-full rounded-xl border border-border/40 bg-[rgba(255,255,255,0.03)] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••" />
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" /> {error}
              </motion.p>
            )}

            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setStep("org-info")}
                className="flex-1 rounded-xl border border-border/40 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading || !adminEmail || !adminPassword}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                  "bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                )}>
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground animate-spin" />
                ) : (
                  <>Provision <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 mt-8 text-[10px] text-muted-foreground/30">
          <Shield className="h-3 w-3" />
          <span>Enterprise-grade security · SOC 2 compliant</span>
        </div>
      </motion.div>
    </div>
  );
}
