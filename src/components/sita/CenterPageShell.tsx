// ═══════════════════════════════════════════════════════════════
// SITA OS — Center Page Shell
// Premium page wrapper with hero entrance, ambient glow, and
// cinematic page transitions for Business / Money / Concierge
// ═══════════════════════════════════════════════════════════════

import { ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type CenterDomain = "business" | "finance" | "concierge";

interface CenterPageShellProps {
  domain: CenterDomain;
  children: ReactNode;
  className?: string;
}

const DOMAIN_THEMES: Record<CenterDomain, {
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  glowColor: string;
  accentLine: string;
  orbColor1: string;
  orbColor2: string;
}> = {
  business: {
    title: "Business Center",
    subtitle: "Pipeline, revenue, and growth — all in one place",
    icon: "💼",
    gradient: "from-[hsl(265_55%_58%/0.15)] via-[hsl(265_55%_58%/0.05)] to-transparent",
    glowColor: "hsl(265 55% 58% / 0.08)",
    accentLine: "from-[hsl(265_55%_58%/0.6)] via-[hsl(265_55%_58%/0.2)] to-transparent",
    orbColor1: "hsl(265 55% 58% / 0.06)",
    orbColor2: "hsl(38 85% 58% / 0.04)",
  },
  finance: {
    title: "Money Center",
    subtitle: "Cash flow, investments, and financial clarity",
    icon: "💰",
    gradient: "from-[hsl(38_85%_58%/0.12)] via-[hsl(38_85%_58%/0.04)] to-transparent",
    glowColor: "hsl(38 85% 58% / 0.06)",
    accentLine: "from-[hsl(38_85%_58%/0.6)] via-[hsl(38_85%_58%/0.2)] to-transparent",
    orbColor1: "hsl(38 85% 58% / 0.05)",
    orbColor2: "hsl(265 55% 58% / 0.03)",
  },
  concierge: {
    title: "Concierge",
    subtitle: "Life admin, family logistics, and daily operations",
    icon: "🎯",
    gradient: "from-[hsl(152_55%_48%/0.12)] via-[hsl(152_55%_48%/0.04)] to-transparent",
    glowColor: "hsl(152 55% 48% / 0.06)",
    accentLine: "from-[hsl(152_55%_48%/0.6)] via-[hsl(152_55%_48%/0.2)] to-transparent",
    orbColor1: "hsl(152 55% 48% / 0.05)",
    orbColor2: "hsl(38 85% 58% / 0.03)",
  },
};

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Stagger children animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", mass: 0.8, stiffness: 120, damping: 16 },
  },
};

export const CenterPageShell = ({ domain, children, className }: CenterPageShellProps) => {
  const { user } = useAuth();
  const theme = DOMAIN_THEMES[domain];
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const greeting = useMemo(getTimeGreeting, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("mx-auto max-w-7xl space-y-5 relative", className)}
    >
      {/* ── Ambient background orbs ── */}
      <div className="absolute inset-0 -top-20 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-60"
          style={{ background: theme.orbColor1 }}
        />
        <div
          className="absolute -top-16 right-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-40"
          style={{ background: theme.orbColor2 }}
        />
      </div>

      {/* ── Hero header ── */}
      <motion.div variants={itemVariants} className="relative">
        <div className={cn(
          "rounded-2xl bg-gradient-to-br p-6 sm:p-8 border border-[hsl(0_0%_100%/0.06)] relative overflow-hidden",
          theme.gradient
        )}>
          {/* Subtle top accent line */}
          <div className={cn("absolute top-0 left-8 right-8 h-px bg-gradient-to-r", theme.accentLine)} />
          
          {/* Floating glow */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full blur-[80px] opacity-50"
            style={{ background: theme.glowColor }}
          />

          <div className="relative flex items-center gap-4">
            {/* Icon with glassmorphic container */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
              className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[hsl(0_0%_100%/0.06)] border border-[hsl(0_0%_100%/0.08)] backdrop-blur-sm shadow-lg"
            >
              <span className="text-3xl">{theme.icon}</span>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-xs text-muted-foreground tracking-wider uppercase"
              >
                {greeting}, {name}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mt-0.5"
              >
                {theme.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-sm text-muted-foreground mt-1 hidden sm:block"
              >
                {theme.subtitle}
              </motion.p>
            </div>

            {/* Decorative dot grid */}
            <div className="hidden sm:grid grid-cols-4 gap-1.5 opacity-20" aria-hidden>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground/40" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      {children}
    </motion.div>
  );
};

/** Wrap each content section for staggered entrance */
export const CenterSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);
