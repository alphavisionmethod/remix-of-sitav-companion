// ═══════════════════════════════════════════════════════════════
// SITA OS — Premium Welcome Screen
// The first interactive moment after secure boot.
// Feels like entering a luxury operating environment.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ChevronRight, Globe, Accessibility, RotateCcw, Building2,
  Wifi, WifiOff, Eye, Lock, Monitor,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Types ───────────────────────────────────────────────────

type WelcomeState =
  | "DEFAULT"
  | "SETUP_SELECTED"
  | "RESTORE_SELECTED"
  | "ENTERPRISE_SELECTED"
  | "ACCESSIBILITY_OPEN";

interface FirstWelcomeScreenProps {
  onSetup: () => void;
  onRestore?: () => void;
  onEnterprise?: () => void;
}

// ── Visual Panel — abstract OS environment ──────────────────

function EnvironmentVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Layered depth planes */}
      <div className="absolute inset-0">
        {/* Deep ambient glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 480,
            height: 480,
            background: "radial-gradient(circle, hsl(265 55% 58% / 0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 rounded-full"
          style={{
            width: 320,
            height: 320,
            background: "radial-gradient(circle, hsl(38 85% 58% / 0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Floating translucent panels — abstract OS surfaces */}
      <div className="relative w-80 h-80">
        {/* Panel 1 — large backdrop */}
        <motion.div
          className="absolute rounded-2xl border border-border/20"
          style={{
            width: 260,
            height: 180,
            top: 40,
            left: 10,
            background: "linear-gradient(135deg, hsl(225 10% 12% / 0.6), hsl(225 10% 9% / 0.4))",
            backdropFilter: "blur(20px)",
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Panel 2 — floating card */}
        <motion.div
          className="absolute rounded-xl border border-border/15"
          style={{
            width: 180,
            height: 120,
            top: 80,
            left: 70,
            background: "linear-gradient(145deg, hsl(225 10% 14% / 0.7), hsl(225 10% 10% / 0.5))",
            backdropFilter: "blur(16px)",
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          {/* Subtle inner content lines */}
          <div className="p-4 space-y-2.5">
            <div className="h-1.5 w-16 rounded-full bg-foreground/8" />
            <div className="h-1.5 w-24 rounded-full bg-foreground/5" />
            <div className="h-1.5 w-12 rounded-full bg-foreground/5" />
          </div>
        </motion.div>

        {/* Panel 3 — small accent card */}
        <motion.div
          className="absolute rounded-lg border border-primary/10"
          style={{
            width: 140,
            height: 80,
            top: 160,
            left: 130,
            background: "linear-gradient(160deg, hsl(265 55% 58% / 0.08), hsl(225 10% 10% / 0.4))",
            backdropFilter: "blur(12px)",
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="p-3 space-y-2">
            <div className="h-1 w-8 rounded-full bg-primary/15" />
            <div className="h-1 w-14 rounded-full bg-foreground/5" />
          </div>
        </motion.div>

        {/* Subtle connection lines between panels */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 320 320"
          fill="none"
        >
          <motion.line
            x1="140" y1="130" x2="160" y2="170"
            stroke="hsl(265 55% 58% / 0.1)"
            strokeWidth="0.5"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.line
            x1="200" y1="180" x2="210" y2="200"
            stroke="hsl(38 85% 58% / 0.08)"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </svg>

        {/* Floating trust dot */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            top: 60,
            left: 240,
            background: "hsl(152 55% 48% / 0.5)",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

// ── Accessibility Panel ─────────────────────────────────────

function AccessibilityPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-sm border-l border-border/30 p-8 flex flex-col"
      style={{ background: "hsl(225 12% 8% / 0.97)", backdropFilter: "blur(24px)" }}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-lg font-semibold text-foreground">Accessibility</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          Close
        </button>
      </div>
      <div className="space-y-4 flex-1">
        {[
          { label: "Reduce motion", desc: "Minimize animations and transitions" },
          { label: "High contrast", desc: "Increase visual contrast for readability" },
          { label: "Larger text", desc: "Scale interface text for easier reading" },
          { label: "Screen reader support", desc: "Optimize for assistive technologies" },
          { label: "Keyboard navigation", desc: "Full keyboard-first interaction support" },
          { label: "Voice guidance", desc: "Audio descriptions and navigation cues" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/20 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <div className="h-5 w-9 rounded-full bg-muted border border-border/40 flex items-center px-0.5">
              <div className="h-4 w-4 rounded-full bg-muted-foreground/40 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function FirstWelcomeScreen({ onSetup, onRestore, onEnterprise }: FirstWelcomeScreenProps) {
  const [state, setState] = useState<WelcomeState>("DEFAULT");
  const [isOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);

  const handleSetup = useCallback(() => {
    setState("SETUP_SELECTED");
    // Brief pause for visual acknowledgment then proceed
    setTimeout(onSetup, 300);
  }, [onSetup]);

  const handleRestore = useCallback(() => {
    if (onRestore) {
      setState("RESTORE_SELECTED");
      setTimeout(onRestore, 300);
    }
  }, [onRestore]);

  const handleEnterprise = useCallback(() => {
    if (onEnterprise) {
      setState("ENTERPRISE_SELECTED");
      setTimeout(onEnterprise, 300);
    }
  }, [onEnterprise]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fadeIn = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div
      className="fixed inset-0 z-[190] flex select-none"
      style={{ backgroundColor: "#0B0D10" }}
      role="main"
      aria-label="Welcome to SITA OS"
    >
      {/* ── Left Content Panel ── */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[46%] px-8 sm:px-12 lg:px-16 xl:px-20">
        {/* SITA mark */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <img
            src={logo}
            alt="SITA OS"
            className="h-14 w-14 rounded-xl"
            style={{ boxShadow: "0 0 40px 0 hsl(265 55% 58% / 0.08)" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1] mb-4"
        >
          Welcome to SITA&nbsp;OS
        </motion.h1>

        {/* Positioning statement */}
        <motion.p
          {...fadeIn}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md mb-3"
        >
          Your trusted system for life, business, money, and follow-through.
        </motion.p>

        {/* Trust note */}
        <motion.p
          {...fadeIn}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-xs text-muted-foreground/60 tracking-wide mb-10 flex items-center gap-3"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-[hsl(var(--trust-safe))]" />
            Private by design
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3 w-3 text-muted-foreground/50" />
            Visible control
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-muted-foreground/50" />
            Your rules
          </span>
        </motion.p>

        {/* ── Primary Actions ── */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="space-y-3 max-w-sm"
        >
          {/* Primary CTA */}
          <button
            onClick={handleSetup}
            disabled={state === "SETUP_SELECTED"}
            className={cn(
              "w-full flex items-center justify-between rounded-xl px-6 py-4 text-sm font-semibold transition-all duration-200",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:opacity-70",
            )}
          >
            Set Up SITA
            <ChevronRight className="h-4 w-4 opacity-70" />
          </button>

          {/* Secondary actions row */}
          <div className="flex gap-2">
            <button
              onClick={handleRestore}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/40 px-4 py-3 text-xs font-medium transition-all duration-200",
                "text-muted-foreground bg-transparent",
                "hover:border-border hover:text-foreground hover:bg-secondary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore
            </button>
            <button
              onClick={handleEnterprise}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/40 px-4 py-3 text-xs font-medium transition-all duration-200",
                "text-muted-foreground bg-transparent",
                "hover:border-border hover:text-foreground hover:bg-secondary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Enterprise
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Right Visual Panel ── */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="hidden lg:flex flex-1 items-center justify-center relative"
      >
        <EnvironmentVisual />
      </motion.div>

      {/* ── Footer Utility Bar ── */}
      <motion.footer
        {...fadeIn}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="fixed bottom-0 left-0 right-0 z-[195] flex items-center justify-between px-6 sm:px-10 py-3"
        style={{ background: "linear-gradient(to top, #0B0D10 60%, transparent)" }}
      >
        {/* Left — Language & Region */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
          <button className="flex items-center gap-1.5 hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1">
            <Globe className="h-3 w-3" />
            English
          </button>
          <span className="text-border/30">·</span>
          <button className="hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1">
            Region
          </button>
        </div>

        {/* Center — Privacy */}
        <div className="hidden sm:flex text-[11px] text-muted-foreground/30">
          Privacy &amp; Terms
        </div>

        {/* Right — Network, Accessibility, System */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-[hsl(var(--trust-safe))]/60" />
            ) : (
              <WifiOff className="h-3 w-3 text-destructive/60" />
            )}
          </span>
          <button
            onClick={() => setState("ACCESSIBILITY_OPEN")}
            className="flex items-center gap-1.5 hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1"
            aria-label="Accessibility options"
          >
            <Accessibility className="h-3 w-3" />
          </button>
          <span className="text-[10px] text-muted-foreground/25 hidden sm:inline">
            v3.0
          </span>
        </div>
      </motion.footer>

      {/* ── Accessibility Drawer ── */}
      <AnimatePresence>
        {state === "ACCESSIBILITY_OPEN" && (
          <AccessibilityPanel onClose={() => setState("DEFAULT")} />
        )}
      </AnimatePresence>
    </div>
  );
}
