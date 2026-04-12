import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
