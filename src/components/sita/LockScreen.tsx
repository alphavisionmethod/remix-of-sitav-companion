// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Lock Screen
// Futuristic OS lock for returning users after boot sequence
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Fingerprint, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import logo from "@/assets/logo.webp";
import { cn } from "@/lib/utils";

interface LockScreenProps {
  userName?: string;
  userAvatar?: string;
  onUnlock: (password: string) => Promise<boolean>;
  onForgotPassword?: () => void;
  onSwitchUser?: () => void;
}

export function LockScreen({
  userName = "SITA User",
  userAvatar,
  onUnlock,
  onForgotPassword,
  onSwitchUser,
}: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Current time display
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus password input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password.trim() || isUnlocking) return;

    setIsUnlocking(true);
    setError("");

    try {
      const success = await onUnlock(password);
      if (success) {
        setUnlocked(true);
      } else {
        setError("Incorrect password");
        setShake(true);
        setPassword("");
        setTimeout(() => setShake(false), 600);
        inputRef.current?.focus();
      }
    } catch {
      setError("Authentication failed");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsUnlocking(false);
    }
  }, [password, isUnlocking, onUnlock]);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {!unlocked && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: "#0A0A0A" }}
          role="main"
          aria-label="SITA OS Lock Screen"
        >
          {/* Ambient background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle radial glow at top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 800,
                height: 800,
                borderRadius: "50%",
                background: "radial-gradient(circle, hsl(265 55% 58% / 0.04) 0%, transparent 60%)",
              }}
            />
            {/* Bottom accent */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
              style={{
                width: 600,
                height: 600,
                borderRadius: "50%",
                background: "radial-gradient(circle, hsl(38 85% 58% / 0.02) 0%, transparent 60%)",
              }}
            />
            {/* Floating particles */}
            {!prefersReducedMotion && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 2 + Math.random() * 2,
                      height: 2 + Math.random() * 2,
                      left: `${15 + Math.random() * 70}%`,
                      top: `${20 + Math.random() * 60}%`,
                      background: `hsl(265 55% 58% / ${0.1 + Math.random() * 0.15})`,
                    }}
                    animate={{
                      y: [0, -20 - Math.random() * 30, 0],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 6 + Math.random() * 4,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Time display */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute top-12 text-center"
          >
            <p
              className="text-[64px] font-extralight tracking-tight leading-none"
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                fontFamily: "Inter, system-ui, sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {hours}:{minutes}
            </p>
            <p
              className="text-sm font-light tracking-wide mt-1"
              style={{ color: "rgba(255, 255, 255, 0.4)" }}
            >
              {dateStr}
            </p>
          </motion.div>

          {/* Center: Avatar + Password */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-5 z-10"
          >
            {/* User avatar / mark */}
            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-20 w-20 rounded-full object-cover"
                  style={{
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 0 40px rgba(139, 92, 246, 0.1)",
                  }}
                />
              ) : (
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(265 55% 58% / 0.2), hsl(265 55% 58% / 0.08))",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(139, 92, 246, 0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <img src={logo} loading="lazy" alt="SITA" className="h-12 w-12 rounded-xl opacity-80" />
                </div>
              )}
              {/* Online indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2"
                style={{
                  borderColor: "#0A0A0A",
                  background: "hsl(152 55% 48%)",
                  boxShadow: "0 0 8px hsl(152 55% 48% / 0.4)",
                }}
              />
            </div>

            {/* User name */}
            <p
              className="text-[15px] font-medium tracking-wide"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {userName}
            </p>

            {/* Password form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
              <motion.div
                animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div
                  className={cn(
                    "flex items-center rounded-2xl border transition-all duration-300",
                    error
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]",
                    "focus-within:border-[hsl(265,55%,58%,0.4)] focus-within:bg-[rgba(255,255,255,0.06)]",
                    "hover:border-[rgba(255,255,255,0.12)]"
                  )}
                  style={{ backdropFilter: "blur(16px)" }}
                >
                  <Lock className="h-3.5 w-3.5 ml-4 text-[rgba(255,255,255,0.3)]" />
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    className="w-52 bg-transparent px-3 py-3 text-sm text-[rgba(255,255,255,0.9)] placeholder:text-[rgba(255,255,255,0.25)] focus:outline-none"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                    autoComplete="current-password"
                    disabled={isUnlocking}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-2 text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!password.trim() || isUnlocking}
                    className={cn(
                      "flex items-center justify-center rounded-xl h-8 w-8 mr-1.5 transition-all duration-200",
                      password.trim()
                        ? "bg-[hsl(265,55%,58%)] text-white hover:bg-[hsl(265,55%,62%)]"
                        : "bg-transparent text-[rgba(255,255,255,0.15)]"
                    )}
                  >
                    {isUnlocking ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error message */}
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
            <div className="flex items-center gap-4 mt-2">
              {onForgotPassword && (
                <button
                  onClick={onForgotPassword}
                  className="text-[11px] text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] transition-colors"
                >
                  Forgot password?
                </button>
              )}
              {onSwitchUser && (
                <>
                  <span className="text-[rgba(255,255,255,0.1)]">·</span>
                  <button
                    onClick={onSwitchUser}
                    className="text-[11px] text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] transition-colors"
                  >
                    Switch user
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Bottom: Trust indicator */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="absolute bottom-8 flex items-center gap-2 text-[11px]"
            style={{ color: "rgba(255, 255, 255, 0.2)" }}
          >
            <Shield className="h-3 w-3" />
            <span>Secure environment · End-to-end encrypted</span>
          </motion.div>

          {/* Breathing glow keyframe */}
          <style>{`
            @keyframes lock-pulse {
              0%, 100% { box-shadow: 0 0 20px 0 rgba(139, 92, 246, 0.05); }
              50% { box-shadow: 0 0 40px 4px rgba(139, 92, 246, 0.1); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
