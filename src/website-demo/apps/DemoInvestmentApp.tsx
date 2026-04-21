import React from "react";
import { INVESTMENT_DATA } from "../demo-data";
import { MockChart } from "../demo-primitives";
import { cn } from "@/lib/utils";

export function DemoInvestmentApp() {
  return (
    <div className="p-4 sm:p-5 overflow-auto space-y-4">
      <div className="rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, hsl(160 60% 50% / 0.05), transparent 60%)" }} />
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-3xl font-bold text-white" style={{ textShadow: "0 0 20px rgba(255,255,255,0.06)" }}>{INVESTMENT_DATA.totalValue}</span>
          <span className="text-sm text-emerald-400 font-semibold">{INVESTMENT_DATA.dayChange}</span>
        </div>
        <MockChart data={INVESTMENT_DATA.sparkline} height={80} color="hsl(160,60%,50%)" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Positions</h3>
          <div className="space-y-1">
            {INVESTMENT_DATA.positions.map((p) => (
              <div key={p.symbol} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div>
                  <span className="text-white/90 font-bold">{p.symbol}</span>
                  <span className="text-white/25 ml-2 text-[10px]">{p.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white/85 font-medium">{p.value}</div>
                  <div className={cn("text-[11px] font-semibold", p.up ? "text-emerald-400" : "text-rose-400")}>{p.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Allocation</h3>
          {/* Ring chart placeholder */}
          <div className="flex justify-center mb-4">
            <svg width="100" height="100" className="-rotate-90">
              {INVESTMENT_DATA.allocation.reduce<{ elements: React.ReactNode[]; offset: number }>((acc, a, i) => {
                const circ = 2 * Math.PI * 38;
                const dashLen = (a.pct / 100) * circ;
                acc.elements.push(
                  <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={a.color} strokeWidth="8"
                    strokeDasharray={`${dashLen} ${circ - dashLen}`} strokeDashoffset={-acc.offset}
                    strokeLinecap="round" opacity="0.85"
                    style={{ filter: `drop-shadow(0 0 4px ${a.color}44)` }} />
                );
                acc.offset += dashLen;
                return acc;
              }, { elements: [], offset: 0 }).elements}
            </svg>
          </div>
          <div className="space-y-2">
            {INVESTMENT_DATA.allocation.map((a) => (
              <div key={a.label} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}44` }} />
                <span className="text-[12px] text-white/60 flex-1">{a.label}</span>
                <span className="text-[12px] text-white/40 font-mono font-medium">{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}