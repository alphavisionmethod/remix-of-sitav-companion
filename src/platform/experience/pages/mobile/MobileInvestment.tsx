import { MobileShell } from "@/platform/experience/components/mobile/MobileShell";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const holdings = [
  { name: "S&P 500 Index", allocation: "42%", change: "+1.2%", up: true },
  { name: "Bond Portfolio", allocation: "28%", change: "+0.3%", up: true },
  { name: "Real Estate Fund", allocation: "18%", change: "-0.5%", up: false },
  { name: "Cash & Equivalents", allocation: "12%", change: "0.0%", up: true },
];

const MobileInvestment = () => (
  <MobileShell title="Investment">
      <div className="mb-2"><PageTruthBanner truthState="partial" /></div>
    {/* Portfolio summary */}
    <div className="rounded-2xl border border-border/40 bg-card p-4 mb-4">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Total Portfolio</p>
      <p className="text-2xl font-bold text-foreground">$2,847,500</p>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-medium text-emerald-500">+2.4% this month</span>
      </div>
    </div>

    {/* Holdings */}
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Holdings</h2>
    <div className="space-y-2 mb-6">
      {holdings.map((h) => (
        <div key={h.name} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{h.name}</p>
            <p className="text-[11px] text-muted-foreground">{h.allocation} allocation</p>
          </div>
          <div className="flex items-center gap-1">
            {h.up ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className={`text-xs font-medium ${h.up ? "text-emerald-500" : "text-destructive"}`}>{h.change}</span>
          </div>
        </div>
      ))}
    </div>

    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h2>
    <div className="rounded-xl border border-border/40 bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">No recent transactions</p>
    </div>
  </MobileShell>
);

export default MobileInvestment;
