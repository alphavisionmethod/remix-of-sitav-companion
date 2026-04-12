import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConciergePageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps concierge sub-pages with:
 * - Layered relief-first ambient gradients (soft teal → rose → lavender)
 * - Multi-point glow blurs for depth
 * - Gentle fade-in with subtle upward drift
 */
export function ConciergePageWrapper({ children, className }: ConciergePageWrapperProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Primary ambient glow — top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)), hsl(var(--accent)))" }}
      />
      {/* Secondary ambient glow — bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full opacity-[0.03] blur-[60px]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent)), hsl(var(--primary)))" }}
      />
      {/* Layered relief gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
        style={{
          background: `
            linear-gradient(135deg, hsl(var(--primary) / 0.035) 0%, transparent 40%),
            linear-gradient(225deg, hsl(var(--accent) / 0.025) 0%, transparent 50%),
            linear-gradient(315deg, hsl(var(--primary) / 0.015) 0%, transparent 60%)
          `,
        }}
      />
      {children}
    </motion.div>
  );
}

interface ConciergePageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps concierge sub-pages with:
 * - Soft purple-rose ambient background gradient
 * - Top-corner glow blur
 * - Gentle fade-in (0.35s ease)
 */
export function ConciergePageWrapper({ children, className }: ConciergePageWrapperProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Ambient glow — top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.045] blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)), hsl(var(--accent)))" }}
      />
      {/* Soft ambient gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/[0.03] via-accent/[0.02] to-transparent"
      />
      {children}
    </motion.div>
  );
}
