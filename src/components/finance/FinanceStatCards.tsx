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
    <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: gradient }}>
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.06]" />
      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white/90">{value}</p>
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
      <button className="w-full rounded-2xl border border-dashed border-white/10 p-3 flex items-center justify-center gap-2 text-white/40 hover:text-white/60 hover:border-white/20 transition-colors text-[12px]">
        <Plus className="h-4 w-4" />
        Open New Account
      </button>

      {/* Total Balance */}
      <StatCard
        label="Total Balance"
        value="$24,800"
        change="+5.27% this month"
        positive
        gradient="linear-gradient(135deg, hsl(10 65% 45%), hsl(25 60% 35%))"
      />

      {/* Income + Expenses side by side */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Income"
          value="$4,800"
          change="+12%"
          positive
          gradient="linear-gradient(135deg, hsl(152 55% 38%), hsl(165 50% 30%))"
        />
        <StatCard
          label="Expenses"
          value="$1,450"
          change="+3%"
          positive={false}
          gradient="linear-gradient(135deg, hsl(270 40% 40%), hsl(285 35% 30%))"
        />
      </div>

      {/* Safe to Spend */}
      <div className="rounded-2xl p-4 bg-[#12121e] border border-[#1a1a2e]">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <p className="text-[10px] uppercase tracking-wider text-white/40">Safe to Spend</p>
        </div>
        <p className="text-2xl font-bold text-emerald-400">$3,200</p>
        <p className="text-[11px] text-white/30 mt-0.5">After bills & reserves</p>
      </div>
    </div>
  );
}
