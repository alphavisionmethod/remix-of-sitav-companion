// ═══════════════════════════════════════════════════════════════
// SITA OS — Enhanced Lock Screen
// Premium, trust-aware, privacy-conscious threshold surface
// Signals: presence, readiness, security, urgency, continuity
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, ArrowRight, Shield, Eye, EyeOff, AlertCircle,
  CheckCircle, Bell, Calendar, Clock, Wifi, WifiOff,
  Users, ChevronUp, Fingerprint, Key,
} from "lucide-react";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ShellAmbientBackground } from "./ShellAmbientBackground";
import type { TrustPosture, PrivacyMode, ShellNotificationDigest } from "./useShellState";
import { isOSSecurityBooted } from "@/lib/os-security";
import { sessionUnlockFlow } from "@/lib/os-security/flows";

// ── Types ────────────────────────────────────────────────────

type UnlockState =
  | "idle"
  | "biometric_ready"
  | "pin_entry"
  | "password_entry"
  | "unlocking"
  | "success"
  | "failed";

interface LockScreenAlert {
  id: string;
  icon: React.ElementType;
  label: string;
  domain: string;
  urgency: "critical" | "high" | "normal";
}

interface EnhancedLockScreenProps {
  userName?: string;
  userAvatar?: string;
  onUnlock: (password: string) => Promise<boolean>;
  onForgotPassword?: () => void;
  onSwitchUser?: () => void;
  trustPosture?: TrustPosture;
  privacyMode?: PrivacyMode;
  notifications?: ShellNotificationDigest;
  pendingApprovals?: number;
  alerts?: LockScreenAlert[];
  nextEvent?: { title: string; time: string } | null;
  isOnline?: boolean;
}

// ── Trust Posture Chips ─────────────────────────────────────

const TRUST_DISPLAY: Record<TrustPosture, { label: string; color: string; icon: React.ElementType }> = {
  secure: { label: "Secure", color: "text-trust-safe", icon: Shield },
  approval_waiting: { label: "Approvals waiting", color: "text-[hsl(var(--sita-gold))]", icon: CheckCircle },
  attention_needed: { label: "Attention needed", color: "text-[hsl(var(--urgency-high))]", icon: AlertCircle },
  quiet_mode: { label: "Quiet mode", color: "text-muted-foreground", icon: Shield },
  offline: { label: "Offline", color: "text-muted-foreground", icon: WifiOff },
  degraded: { label: "Limited connectivity", color: "text-[hsl(var(--trust-degraded))]", icon: WifiOff },
};

// ── Component ────────────────────────────────────────────────

export function EnhancedLockScreen({
  userName = "SITA User",
  userAvatar,
  onUnlock,
  onForgotPassword,
  onSwitchUser,
  trustPosture = "secure",
  privacyMode = "personal",
  notifications = { total: 0, approvals: 0, urgent: 0, business: 0, finance: 0, household: 0, system: 0 },
  pendingApprovals = 0,
  alerts = [],
  nextEvent = null,
  isOnline = true,
}: EnhancedLockScreenProps) {
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unlockState, setUnlockState] = useState<UnlockState>("idle");
  const [authMode, setAuthMode] = useState<"password" | "pin" | "biometric">("password");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  // Clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 700);
    return () => clearTimeout(t);
  }, []);

  // Lockout timer
  useEffect(() => {
    if (!lockoutUntil) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setError("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  const handleFailure = useCallback(() => {
    const attempts = failedAttempts + 1;
    setFailedAttempts(attempts);
    
    // Rate limiting: lockout after 5 attempts
    if (attempts >= 5) {
      const lockoutMs = Math.min(30000 * Math.pow(2, Math.floor(attempts / 5) - 1), 300000);
      setLockoutUntil(Date.now() + lockoutMs);
      setError(`Too many attempts. Locked for ${Math.ceil(lockoutMs / 1000)}s`);
    } else {
      setError(`Incorrect ${authMode === "pin" ? "PIN" : "password"} (${5 - attempts} attempts remaining)`);
    }
    
    setShake(true);
    setPassword("");
    setPin("");
    setTimeout(() => {
      setShake(false);
      setUnlockState(authMode === "pin" ? "pin_entry" : "password_entry");
    }, 600);
    if (authMode === "pin") pinRef.current?.focus();
    else inputRef.current?.focus();
  }, [failedAttempts, authMode]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const credential = authMode === "pin" ? pin : password;
    if (!credential.trim() || unlockState === "unlocking" || isLockedOut) return;

    setUnlockState("unlocking");
    setError("");

    try {
      // Try OS security flow first
      if (isOSSecurityBooted()) {
        const { getSessionDaemon } = await import("@/lib/os-security/sessiond");
        const sessiond = getSessionDaemon();
        const sessions = sessiond.getAllSessions();
        const session = sessions[0];
        if (session) {
          const result = await sessionUnlockFlow(session.sessionId, credential, authMode === "pin" ? "pin" : "password");
          if (result.status === "ok") {
            setUnlockState("success");
            setFailedAttempts(0);
            setTimeout(() => setDismissed(true), 500);
            return;
          }
        }
      }

      // Fallback to provided onUnlock
      const success = await onUnlock(credential);
      if (success) {
        setUnlockState("success");
        setFailedAttempts(0);
        setTimeout(() => setDismissed(true), 500);
      } else {
        setUnlockState("failed");
        handleFailure();
      }
    } catch {
      setUnlockState("failed");
      handleFailure();
    }
  }, [password, pin, unlockState, onUnlock, authMode, isLockedOut, handleFailure]);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const trust = TRUST_DISPLAY[trustPosture];
  const TrustIcon = trust.icon;

  // Privacy-aware notification display
  const notifDisplay = useMemo(() => {
    if (privacyMode === "shared") {
      return notifications.total > 0 ? `${notifications.total} pending items` : null;
    }
    if (privacyMode === "managed") {
      return notifications.urgent > 0 ? `${notifications.urgent} urgent items` : null;
    }
    // personal — show breakdown
    const parts: string[] = [];
    if (notifications.approvals > 0) parts.push(`${notifications.approvals} approvals`);
    if (notifications.urgent > 0) parts.push(`${notifications.urgent} urgent`);
    if (notifications.business > 0) parts.push(`${notifications.business} business`);
    if (notifications.finance > 0) parts.push(`${notifications.finance} finance`);
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [notifications, privacyMode]);

  const visibleAlerts = privacyMode === "personal" ? alerts.slice(0, 3) : [];

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: "hsl(225, 12%, 7%)" }}
          role="main"
          aria-label="SITA OS Lock Screen"
        >
          {/* Shared ambient background */}
          <ShellAmbientBackground mood={trustPosture === "attention_needed" ? "alert" : undefined} intensity="subtle" />

          {/* ── Top Status Bar ──────────────────────────────── */}
          <motion.div
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
          >
            {/* Left: connectivity */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5 text-[rgba(255,255,255,0.3)]" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-[rgba(255,255,255,0.25)]" />
              )}
            </div>

            {/* Right: trust posture */}
            <div className="flex items-center gap-2">
              {pendingApprovals > 0 && (
                <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[hsl(var(--sita-gold)/0.12)] text-[hsl(var(--sita-gold))]">
                  <CheckCircle className="h-2.5 w-2.5" />
                  {pendingApprovals}
                </span>
              )}
              <span className={cn("flex items-center gap-1 text-[10px] font-medium", trust.color)}>
                <TrustIcon className="h-3 w-3" />
                {trust.label}
              </span>
            </div>
          </motion.div>

          {/* ── Time Display ────────────────────────────────── */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="absolute top-16 sm:top-20 text-center"
          >
            <p
              className="text-[72px] sm:text-[88px] font-extralight tracking-tight leading-none tabular-nums"
              style={{
                color: "rgba(255, 255, 255, 0.88)",
                fontFamily: "var(--font-body)",
              }}
            >
              {hours}
              <span className="opacity-60">:</span>
              {minutes}
            </p>
            <p
              className="text-sm font-light tracking-widest mt-2 uppercase"
              style={{ color: "rgba(255, 255, 255, 0.35)" }}
            >
              {dateStr}
            </p>
          </motion.div>

          {/* ── Center: Identity + Unlock ────────────────────── */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col items-center gap-4 z-10"
          >
            {/* Avatar */}
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-20 w-20 rounded-full object-cover"
                  style={{
                    boxShadow: unlockState === "success"
                      ? "0 0 0 3px hsl(152, 55%, 48%), 0 0 40px hsl(152, 55%, 48%, 0.2)"
                      : "0 0 0 2px rgba(255,255,255,0.06), 0 0 40px rgba(139, 92, 246, 0.08)",
                    transition: "box-shadow 0.4s ease",
                  }}
                />
              ) : (
                <motion.div
                  className="h-20 w-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(265 55% 58% / 0.18), hsl(265 55% 58% / 0.06))",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 0 40px rgba(139, 92, 246, 0.06)",
                    backdropFilter: "blur(12px)",
                  }}
                  animate={
                    unlockState === "success"
                      ? { boxShadow: "0 0 0 3px hsl(152, 55%, 48%), 0 0 40px hsl(152, 55%, 48%, 0.2)" }
                      : {}
                  }
                >
                  <img src={logo} loading="lazy" alt="SITA" className="h-12 w-12 rounded-xl opacity-80" />
                </motion.div>
              )}
              {/* Status dot */}
              <div
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2"
                style={{
                  borderColor: "hsl(225, 12%, 7%)",
                  background: unlockState === "success"
                    ? "hsl(152 55% 48%)"
                    : isOnline
                    ? "hsl(152 55% 48%)"
                    : "hsl(220 8% 40%)",
                  boxShadow: `0 0 8px ${isOnline ? "hsl(152 55% 48% / 0.3)" : "transparent"}`,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {/* Name */}
            <p
              className="text-[15px] font-medium tracking-wide"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {userName}
            </p>

            {/* Auth mode switcher */}
            <div className="flex items-center gap-1 mb-1">
              {(["password", "pin", "biometric"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setAuthMode(mode); setError(""); setPassword(""); setPin(""); }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                    authMode === mode
                      ? "bg-[hsl(265,55%,58%,0.2)] text-[hsl(265,55%,70%)]"
                      : "text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.45)]"
                  )}
                >
                  {mode === "password" && <Lock className="h-2.5 w-2.5 inline mr-1" />}
                  {mode === "pin" && <Key className="h-2.5 w-2.5 inline mr-1" />}
                  {mode === "biometric" && <Fingerprint className="h-2.5 w-2.5 inline mr-1" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Unlock form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
              <motion.div
                animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {authMode === "biometric" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockState("unlocking");
                      // Simulate biometric
                      setTimeout(async () => {
                        const success = await onUnlock("biometric-token");
                        if (success) {
                          setUnlockState("success");
                          setTimeout(() => setDismissed(true), 500);
                        } else {
                          setUnlockState("failed");
                          handleFailure();
                        }
                      }, 1200);
                    }}
                    disabled={unlockState === "unlocking" || isLockedOut}
                    className="flex flex-col items-center gap-3 px-10 py-6 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    style={{ backdropFilter: "blur(20px)" }}
                  >
                    <Fingerprint className={cn(
                      "h-10 w-10 transition-colors",
                      unlockState === "unlocking" ? "text-[hsl(265,55%,58%)] animate-pulse" :
                      unlockState === "success" ? "text-[hsl(152,55%,48%)]" :
                      "text-[rgba(255,255,255,0.3)]"
                    )} />
                    <span className="text-[11px] text-[rgba(255,255,255,0.3)]">
                      {unlockState === "unlocking" ? "Scanning…" : "Touch to unlock"}
                    </span>
                  </button>
                ) : authMode === "pin" ? (
                  <div
                    className={cn(
                      "flex items-center rounded-2xl border transition-all duration-300",
                      error ? "border-destructive/40 bg-destructive/5" : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]",
                      "focus-within:border-[hsl(265,55%,58%,0.35)] focus-within:bg-[rgba(255,255,255,0.05)]",
                    )}
                    style={{ backdropFilter: "blur(20px)" }}
                  >
                    <Key className="h-3.5 w-3.5 ml-4 text-[rgba(255,255,255,0.25)]" />
                    <input
                      ref={pinRef}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setPin(v);
                        setError("");
                        if (unlockState !== "unlocking") setUnlockState("pin_entry");
                      }}
                      placeholder="Enter PIN"
                      className="w-56 bg-transparent px-3 py-3 text-sm text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none tracking-[0.5em] text-center"
                      style={{ fontFamily: "var(--font-body)" }}
                      autoComplete="off"
                      disabled={unlockState === "unlocking" || unlockState === "success" || isLockedOut}
                    />
                    <button
                      type="submit"
                      disabled={!pin.trim() || unlockState === "unlocking" || unlockState === "success" || isLockedOut}
                      className={cn(
                        "flex items-center justify-center rounded-xl h-8 w-8 mr-1.5 transition-all duration-200",
                        unlockState === "success" ? "bg-[hsl(152,55%,48%)] text-white" :
                        pin.trim() ? "bg-[hsl(265,55%,58%)] text-white hover:bg-[hsl(265,55%,62%)]" :
                        "bg-transparent text-[rgba(255,255,255,0.1)]"
                      )}
                    >
                      {unlockState === "unlocking" ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : unlockState === "success" ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center rounded-2xl border transition-all duration-300",
                      error ? "border-destructive/40 bg-destructive/5" : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]",
                      "focus-within:border-[hsl(265,55%,58%,0.35)] focus-within:bg-[rgba(255,255,255,0.05)]",
                      "hover:border-[rgba(255,255,255,0.1)]"
                    )}
                    style={{ backdropFilter: "blur(20px)" }}
                  >
                    <Lock className="h-3.5 w-3.5 ml-4 text-[rgba(255,255,255,0.25)]" />
                    <input
                      ref={inputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                        if (unlockState !== "unlocking") setUnlockState("password_entry");
                      }}
                      placeholder="Enter password"
                      className="w-56 bg-transparent px-3 py-3 text-sm text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none"
                      style={{ fontFamily: "var(--font-body)" }}
                      autoComplete="current-password"
                      disabled={unlockState === "unlocking" || unlockState === "success" || isLockedOut}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2 text-[rgba(255,255,255,0.2)] hover:text-[rgba(255,255,255,0.45)] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="submit"
                      disabled={!password.trim() || unlockState === "unlocking" || unlockState === "success" || isLockedOut}
                      className={cn(
                        "flex items-center justify-center rounded-xl h-8 w-8 mr-1.5 transition-all duration-200",
                        unlockState === "success" ? "bg-[hsl(152,55%,48%)] text-white" :
                        password.trim() ? "bg-[hsl(265,55%,58%)] text-white hover:bg-[hsl(265,55%,62%)]" :
                        "bg-transparent text-[rgba(255,255,255,0.1)]"
                      )}
                    >
                      {unlockState === "unlocking" ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : unlockState === "success" ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "hsl(0, 65%, 60%)" }}
                  >
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>

            {/* Secondary actions */}
            <div className="flex items-center gap-4 mt-1">
              {onForgotPassword && (
                <button
                  onClick={onForgotPassword}
                  className="text-[11px] text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.55)] transition-colors"
                >
                  Forgot password?
                </button>
              )}
              {onSwitchUser && (
                <>
                  <span className="text-[rgba(255,255,255,0.08)]">·</span>
                  <button
                    onClick={onSwitchUser}
                    className="flex items-center gap-1 text-[11px] text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.55)] transition-colors"
                  >
                    <Users className="h-3 w-3" />
                    Switch user
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Bottom: Notification Summary + Alerts ─────────── */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 px-6"
          >
            {/* Next event (privacy-aware) */}
            {nextEvent && privacyMode === "personal" && (
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <Calendar className="h-3 w-3 text-[rgba(255,255,255,0.3)]" />
                <span className="text-[11px] text-[rgba(255,255,255,0.4)]">
                  {nextEvent.time} — {nextEvent.title}
                </span>
              </div>
            )}

            {/* Alert summary cards */}
            {visibleAlerts.length > 0 && (
              <motion.div
                className="flex flex-col items-center gap-1.5 w-full max-w-sm"
                initial={false}
              >
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="flex items-center gap-1.5 text-[10px] text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.5)] transition-colors"
                >
                  <Bell className="h-3 w-3" />
                  {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? "s" : ""}
                  <ChevronUp className={cn("h-3 w-3 transition-transform", showAlerts && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showAlerts && visibleAlerts.map((alert, i) => {
                    const AlertIcon = alert.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 4, height: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]"
                      >
                        <AlertIcon className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          alert.urgency === "critical" ? "text-[hsl(0,65%,60%)]" :
                          alert.urgency === "high" ? "text-[hsl(var(--sita-gold))]" :
                          "text-[rgba(255,255,255,0.4)]"
                        )} />
                        <span className="text-[11px] text-[rgba(255,255,255,0.5)] flex-1 truncate">{alert.label}</span>
                        <span className="text-[9px] text-[rgba(255,255,255,0.2)] uppercase tracking-wider">{alert.domain}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Notification digest */}
            {notifDisplay && (
              <p className="text-[10px] text-[rgba(255,255,255,0.2)] tracking-wide">
                {notifDisplay}
              </p>
            )}

            {/* Trust footer */}
            <div className="flex items-center gap-2 text-[10px] text-[rgba(255,255,255,0.15)]">
              <Shield className="h-3 w-3" />
              <span>Secure environment · End-to-end encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
