import React from "react";
import { FINANCE_DATA } from "../demo-data";
import { MockGauge, MockBarChart } from "../demo-primitives";

export function DemoFinanceApp() {
  return (
    <div className="p-5 overflow-auto space-y-5">
      <div className="flex gap-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center">
          <h3 className="text-xs text-white/50 uppercase mb-3">Peace Score</h3>
          <MockGauge value={FINANCE_DATA.peaceScore} label="Financial Health" size={120} color="hsl(160,70%,50%)" />
        </div>
        <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-xs text-white/50 uppercase mb-3">Accounts</h3>
          <div className="space-y-3">
            {FINANCE_DATA.accounts.map((a) => (
              <div key={a.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">{a.name}</div>
                  <div className="text-xs text-white/40">{a.type}</div>
                </div>
                <span className="text-lg font-semibold text-white">{a.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-3">Spending Breakdown</h3>
          <MockBarChart data={FINANCE_DATA.spending.map((s) => ({ label: s.category, pct: s.pct, color: "hsl(160,60%,50%)" }))} />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-3">Upcoming Bills</h3>
          <div className="space-y-2">
            {FINANCE_DATA.bills.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white/80">{b.name}</span>
                  <span className="text-white/30 ml-2">Due {b.due}</span>
                </div>
                <span className="text-white/90 font-medium">{b.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}