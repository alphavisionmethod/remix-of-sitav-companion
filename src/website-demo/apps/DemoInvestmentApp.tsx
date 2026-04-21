import React from "react";
import { INVESTMENT_DATA } from "../demo-data";
import { MockChart } from "../demo-primitives";
import { cn } from "@/lib/utils";

export function DemoInvestmentApp() {
  return (
    <div className="p-5 overflow-auto space-y-5">
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold text-white">{INVESTMENT_DATA.totalValue}</span>
        <span className="text-sm text-emerald-400">{INVESTMENT_DATA.dayChange}</span>
      </div>
      <MockChart data={INVESTMENT_DATA.sparkline} height={80} color="hsl(160,60%,50%)" />
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-3">Positions</h3>
          <div className="space-y-2">
            {INVESTMENT_DATA.positions.map((p) => (
              <div key={p.symbol} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white/90 font-medium">{p.symbol}</span>
                  <span className="text-white/30 ml-2 text-xs">{p.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white/80">{p.value}</div>
                  <div className={cn("text-xs", p.up ? "text-emerald-400" : "text-rose-400")}>{p.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-3">Allocation</h3>
          <div className="space-y-2">
            {INVESTMENT_DATA.allocation.map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                <span className="text-sm text-white/70 flex-1">{a.label}</span>
                <span className="text-sm text-white/50">{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}