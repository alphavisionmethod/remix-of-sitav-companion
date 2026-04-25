// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Page Header
// Reusable premium header for all admin/owner/mission surfaces
// ═══════════════════════════════════════════════════════════════

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Typography } from "@/platform/sita/components/sita/Typography";

interface AdminPageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  accent?: "primary" | "trust" | "accent" | "destructive";
}

export function AdminPageHeader({ icon: Icon, title, subtitle, children, accent = "primary" }: AdminPageHeaderProps) {
  const accentMap = {
    primary: "from-primary/5 border-primary/15 shadow-primary/10 bg-primary/10 text-primary",
    trust: "from-trust-verified/5 border-trust-verified/15 shadow-trust-safe/10 bg-trust-verified/10 text-trust-safe",
    accent: "from-accent/5 border-accent/15 shadow-accent/10 bg-accent/10 text-accent",
    destructive: "from-destructive/5 border-destructive/15 shadow-destructive/10 bg-destructive/10 text-destructive",
  };
  const parts = accentMap[accent].split(" ");
  const gradFrom = parts[0];
  const border = parts[1];
  const shadow = parts[2];
  const iconBg = parts[3];
  const iconColor = parts[4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border bg-gradient-to-br via-card to-card p-6", gradFrom, border)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shrink-0", iconBg, shadow)}>
            <Icon className={cn("h-7 w-7", iconColor)} />
          </div>
          <div>
            <Typography role="appTitle" as="h1">{title}</Typography>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
