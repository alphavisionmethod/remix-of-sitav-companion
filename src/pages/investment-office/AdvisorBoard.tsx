import { Brain, ChevronRight, Eye, BarChart3 } from "lucide-react";
import { INVESTMENT_ADVISORS } from "@/lib/investment-office/mock-data";

export default function AdvisorBoard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Brain className="h-6 w-6 text-primary" /> Investment Advisor Council</h1>
        <p className="text-sm text-muted-foreground mt-1">Multi-angle intelligence across every domain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INVESTMENT_ADVISORS.map(adv => (
          <div key={adv.id} className="rounded-2xl border border-border bg-card p-5 space-y-3 hover:border-primary/15 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{adv.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{adv.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">{adv.domain}</span>
                </div>
                <p className="text-xs text-muted-foreground">{adv.title}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{adv.confidence}%</p>
                <p className="text-[9px] text-muted-foreground">confidence</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/20 p-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Insight</p>
              <p className="text-xs text-foreground leading-relaxed">{adv.currentInsight}</p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Watching {adv.watchingCount} signals</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Active</span>
            </div>

            {/* Confidence bar */}
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{
                width: `${adv.confidence}%`,
                backgroundColor: adv.color,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
