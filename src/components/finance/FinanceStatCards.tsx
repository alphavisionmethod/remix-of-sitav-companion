import { TrendingUp, TrendingDown, Plus, ShieldCheck } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  gradient: string;
}

function StatCard({ label, value, change, positive, gradient }: StatCardProps) {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-[1.02]" style={{ background: gradient }}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/[0.07] group-hover:bg-white/[0.1] transition-colors" />
      <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/[0.03]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white/95" style={{ textShadow: '0 0 20px rgba(255,255,255,0.08)' }}>{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          {positive ? (
            <TrendingUp className="h-3 w-3 text-white/60" />
          ) : (
            <TrendingDown className="h-3 w-3 text-white/60" />
          )}
          <span className="text-[11px] text-white/60">{change}</span>
        </div>
      )}
    </div>
  );
}

export function FinanceStatCards() {
  return (
    <div className="space-y-3">
      {/* Open New Account button */}
      <button className="w-full rounded-2xl border border-dashed border-border/40 p-3 flex items-center justify-center gap-2 text-muted-foreground hover:text-secondary-foreground hover:border-border transition-all text-[12px] hover:bg-card">
        <Plus className="h-4 w-4" />
        Open New Account
      </button>

      {/* Total Balance */}
      <StatCard
        label="Total Balance"
        value="$24,800"
        change="+5.27% this month"
        positive
        gradient="linear-gradient(135deg, hsl(15 75% 50%), hsl(30 70% 38%), hsl(10 65% 30%))"
      />

      {/* Income + Expenses side by side */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Income"
          value="$4,800"
          change="+12%"
          positive
          gradient="linear-gradient(135deg, hsl(152 65% 42%), hsl(170 55% 32%), hsl(145 50% 25%))"
        />
        <StatCard
          label="Expenses"
          value="$1,450"
          change="+3%"
          positive={false}
          gradient="linear-gradient(135deg, hsl(270 50% 45%), hsl(290 40% 32%), hsl(265 35% 25%))"
        />
      </div>

      {/* Safe to Spend */}
      <div className="rounded-2xl p-4 card-vibrant card-vibrant-green">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-trust-safe" />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Safe to Spend</p>
        </div>
        <p className="text-2xl font-bold text-gradient-green">$3,200</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">After bills & reserves</p>
      </div>
    </div>
  );
}
