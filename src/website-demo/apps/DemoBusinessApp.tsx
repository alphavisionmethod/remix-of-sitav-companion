import React, { useState } from "react";
import { BUSINESS_DATA } from "../demo-data";
import { MockCard, MockChart, MockSidebar } from "../demo-primitives";

const NAV = ["Dashboard", "Pipeline", "Leads", "Invoices", "Reports"];

export function DemoBusinessApp() {
  const [section, setSection] = useState("Dashboard");
  return (
    <div className="flex h-full">
      <MockSidebar items={NAV} active={section} onSelect={setSection} />
      <div className="flex-1 p-4 sm:p-5 overflow-auto space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BUSINESS_DATA.kpis.map((k) => (
            <MockCard key={k.label} {...k} />
          ))}
        </div>
        <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 20%, hsl(210 80% 60% / 0.05), transparent 60%)" }} />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Revenue Trend</h3>
          <MockChart data={BUSINESS_DATA.chartData} height={80} color="hsl(210,80%,60%)" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Pipeline</h3>
            <div className="space-y-2.5">
              {BUSINESS_DATA.pipeline.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <span className="text-white/85 font-medium">{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 uppercase">{d.stage}</span>
                    <span className="text-white/90 font-bold">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-3 font-medium">Recent Activity</h3>
            <div className="space-y-2">
              {BUSINESS_DATA.activity.map((a, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-white/25 text-[10px] w-12 shrink-0 font-mono">{a.time}</span>
                  <span className="text-white/65">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}