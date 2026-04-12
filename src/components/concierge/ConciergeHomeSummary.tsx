import { motion } from "framer-motion";
import { GlassCard } from "@/components/sita/PremiumPageComponents";
import { Sparkles, Sun, CloudRain, Shield, Zap } from "lucide-react";

interface ConciergeHomeSummaryProps {
  todayCount: number;
  preparedCount: number;
  slippingCount: number;
  automationMode: "active" | "review" | "quiet";
  greeting?: string;
}

const modeLabel = { active: "Active support", review: "Review-first", quiet: "Quiet mode" };
const modeColor = { active: "text-chart-2", review: "text-amber-500", quiet: "text-muted-foreground" };

export function ConciergeHomeSummary({ todayCount, preparedCount, slippingCount, automationMode, greeting }: ConciergeHomeSummaryProps) {
  const hour = new Date().getHours();
  const timeGreeting = greeting ?? (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
  const Icon = hour < 17 ? Sun : CloudRain;

  return (
    <GlassCard glow="accent" intensity="medium" className="p-5 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-accent/8 to-primary/5 blur-3xl pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">{timeGreeting}</h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-md">
              {slippingCount > 0
                ? `You have ${slippingCount} item${slippingCount !== 1 ? "s" : ""} slipping — let's handle what matters first.`
                : preparedCount > 0
                  ? `${preparedCount} action${preparedCount !== 1 ? "s" : ""} prepared and ready for your review.`
                  : "Everything looks clear. Enjoy your day."}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className={`text-[10px] font-medium ${modeColor[automationMode]}`}>{modeLabel[automationMode]}</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          {[
            { label: "Today", value: todayCount, icon: Zap, color: "text-primary" },
            { label: "Prepared", value: preparedCount, icon: Sparkles, color: "text-accent" },
            { label: "Slipping", value: slippingCount, icon: CloudRain, color: slippingCount > 0 ? "text-destructive" : "text-chart-2" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <div>
                <p className={`text-lg font-bold font-display ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </GlassCard>
  );
}
