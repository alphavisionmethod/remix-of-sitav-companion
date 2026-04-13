import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface BusinessStatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
}

export function BusinessStatCard({ label, value, change, trend, icon: Icon, gradientFrom, gradientTo }: BusinessStatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[140px]"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="absolute inset-0 opacity-20" style={{
        background: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3), transparent 60%)`,
      }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-white/80" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-2">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-white/80" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3.5 w-3.5 text-white/80" />
          ) : null}
          <span className="text-[11px] font-medium text-white/70">{change}</span>
        </div>
      </div>
    </div>
  );
}
