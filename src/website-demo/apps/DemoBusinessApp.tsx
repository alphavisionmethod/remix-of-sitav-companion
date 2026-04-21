import React, { useState } from "react";
import { BUSINESS_DATA } from "../demo-data";
import { MockCard, MockChart, MockSidebar } from "../demo-primitives";

const NAV = ["Dashboard", "Pipeline", "Leads", "Invoices", "Reports"];

export function DemoBusinessApp() {
  const [section, setSection] = useState("Dashboard");
  return (
    <div className="flex h-full">
      <MockSidebar items={NAV} active={section} onSelect={setSection} />
      <div className="flex-1 p-5 overflow-auto space-y-5">
        <div className="grid grid-cols-4 gap-3">
          {BUSINESS_DATA.kpis.map((k) => (
            <MockCard key={k.label} {...k} />
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-3">Revenue Trend</h3>
          <MockChart data={BUSINESS_DATA.chartData} height={80} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs text-white/50 uppercase mb-3">Pipeline</h3>
            <div className="space-y-2">
              {BUSINESS_DATA.pipeline.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{d.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">{d.stage}</span>
                    <span className="text-white/90 font-medium">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs text-white/50 uppercase mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {BUSINESS_DATA.activity.map((a, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-white/30 text-xs w-12 shrink-0">{a.time}</span>
                  <span className="text-white/70">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}