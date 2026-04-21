import React from "react";
import { FINANCE_DATA } from "../demo-data";
import { MockGauge, MockBarChart } from "../demo-primitives";

export function DemoFinanceApp() {
  return (
    <div className="p-4 sm:p-5 overflow-auto space-y-4">
      {/* Top row: gauge + accounts — responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="rounded-2xl border border-white/[0.06] p-5 flex flex-col items-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, hsl(160 70% 50% / 0.06), transparent 70%)" }} />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Peace Score</h3>
          <MockGauge value={FINANCE_DATA.peaceScore} label="Financial Health" size={130} color="hsl(160,70%,50%)" />
        </div>
        <div className="flex-1 rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-4 font-medium">Accounts</h3>
          <div className="space-y-3.5">
            {FINANCE_DATA.accounts.map((a) => (
              <div key={a.name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div>
                  <div className="text-[13px] text-white/85 font-medium">{a.name}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{a.type}</div>
                </div>
                <span className="text-lg font-bold text-white" style={{ textShadow: "0 0 16px rgba(255,255,255,0.05)" }}>{a.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom row — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 20% 80%, hsl(160 60% 50% / 0.04), transparent 60%)" }} />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Spending Breakdown</h3>
          <MockBarChart data={FINANCE_DATA.spending.map((s) => ({ label: s.category, pct: s.pct, color: "hsl(160,60%,50%)" }))} />
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Upcoming Bills</h3>
          <div className="space-y-2.5">
            {FINANCE_DATA.bills.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div>
                  <span className="text-white/85 font-medium">{b.name}</span>
                  <span className="text-white/25 ml-2 text-xs">Due {b.due}</span>
                </div>
                <span className="text-white/90 font-bold">{b.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}