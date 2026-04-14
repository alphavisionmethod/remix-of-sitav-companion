// ═══════════════════════════════════════════════════════════════
// SITA OS — SecurePrompt: Trusted Elevation Prompt
// Glassmorphic modal for admin approval, non-spoofable
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { Shield, Lock, AlertTriangle, X, Eye, EyeOff, Fingerprint, Key } from "lucide-react";
import { useSecurePrompt } from "./SecurePromptProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OSAuthMethod } from "@/lib/os-security/types";

const RISK_CONFIG: Record<string, { color: string; icon: typeof Shield; label: string }> = {
  low: { color: "text-emerald-400", icon: Shield, label: "Low Risk" },
  medium: { color: "text-amber-400", icon: Shield, label: "Medium Risk" },
  high: { color: "text-orange-400", icon: AlertTriangle, label: "High Risk" },
  critical: { color: "text-red-400", icon: AlertTriangle, label: "Critical" },
};

const TIMEOUT_SEC = 60;

export function SecurePrompt() {
  const { state, submitCredential, cancel } = useSecurePrompt();
  const [credential, setCredential] = useState("");
  const [method, setMethod] = useState<OSAuthMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SEC);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.isOpen) {
      setCredential("");
      setError("");
      setShowPassword(false);
      setTimeLeft(TIMEOUT_SEC);
      setSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.isOpen]);

  useEffect(() => {
    if (!state.isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { cancel(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.isOpen, cancel]);

  if (!state.isOpen || !state.request) return null;

  const risk = RISK_CONFIG[state.request.riskLevel] || RISK_CONFIG.medium;
  const RiskIcon = risk.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    submitCredential(credential, method);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Trusted prompt indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-sita-purple/20 border border-sita-purple/30">
        <Lock className="w-3 h-3 text-sita-purple" />
        <span className="text-xs font-medium text-sita-purple">Secure System Prompt</span>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Risk bar */}
        <div className={cn("h-1 w-full", {
          "bg-emerald-500": state.request.riskLevel === "low",
          "bg-amber-500": state.request.riskLevel === "medium",
          "bg-orange-500": state.request.riskLevel === "high",
          "bg-red-500": state.request.riskLevel === "critical",
        })} />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl bg-white/5 border border-white/10")}>
              <Shield className="w-6 h-6 text-sita-purple" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Authentication Required
              </h2>
              <div className={cn("flex items-center gap-1.5 mt-0.5", risk.color)}>
                <RiskIcon className="w-3 h-3" />
                <span className="text-xs font-medium">{risk.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={cancel}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {state.request.impactDescription}
          </p>

          {state.request.requesterApp && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
              <span className="text-xs text-muted-foreground">Requested by:</span>
              <span className="text-xs font-medium text-foreground">{state.request.requesterApp}</span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <span className="text-xs text-muted-foreground">Action:</span>
            <code className="text-xs font-mono text-sita-purple">{state.request.action}</code>
          </div>
        </div>

        {/* Auth method tabs */}
        <div className="px-6 pb-3 flex gap-2">
          {(["password", "pin"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setCredential(""); setError(""); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                method === m
                  ? "bg-sita-purple/20 text-sita-purple border border-sita-purple/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {m === "password" ? "Password" : "PIN"}
            </button>
          ))}
          <button
            onClick={() => setMethod("biometric")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
              method === "biometric"
                ? "bg-sita-purple/20 text-sita-purple border border-sita-purple/30"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <Fingerprint className="w-3 h-3" />
            Biometric
          </button>
        </div>

        {/* Credential form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {method !== "biometric" ? (
            <div className="relative">
              <Input
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={credential}
                onChange={(e) => { setCredential(e.target.value); setError(""); }}
                placeholder={method === "pin" ? "Enter PIN" : "Enter password"}
                className="pr-10 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50"
                autoComplete="off"
                inputMode={method === "pin" ? "numeric" : "text"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <Fingerprint className="w-12 h-12 text-sita-purple animate-pulse" />
              <p className="mt-2 text-sm text-muted-foreground">Touch sensor to authenticate</p>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground/60">
              Timeout: {timeLeft}s
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancel}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting || (method !== "biometric" && !credential.trim())}
                className="bg-sita-purple hover:bg-sita-purple/90 text-white gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Authenticate
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
