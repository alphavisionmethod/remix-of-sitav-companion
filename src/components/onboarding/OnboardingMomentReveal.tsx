// ═══════════════════════════════════════════════════════════════
// SITA OS — Onboarding Moment Reveal (canonical primitive)
// ═══════════════════════════════════════════════════════════════
// Wrapper for the 9 signature "wow moments" in the personalization
// ceremony. Provides consistent enter animation + optional sparkle
// halo so individual screens stay copy-focused.
// ═══════════════════════════════════════════════════════════════

import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface OnboardingMomentRevealProps {
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  delay?: number;
  haloed?: boolean;
  className?: string;
}

export function OnboardingMomentReveal({
  children,
  icon: Icon = Sparkles,
  delay = 0,
  haloed = true,
  className = "",
}: OnboardingMomentRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.1, type: "spring", damping: 12 }}
      >
        <div className="relative mx-auto w-16 h-16 mb-4">
          {haloed && (
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse" aria-hidden />
          )}
          <div className="relative w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </motion.div>
      {children}
    </motion.div>
  );
}

export default OnboardingMomentReveal;
