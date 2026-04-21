import React, { useState } from "react";
import { SETTINGS_DATA } from "../demo-data";
import { MockToggle } from "../demo-primitives";
import { AppIconRenderer } from "../AppIconRenderer";

export function DemoSettingsApp() {
  const [state, setState] = useState(() =>
    Object.fromEntries(SETTINGS_DATA.flatMap((c) => c.items.map((i) => [i.label, i.value])))
  );
  return (
    <div className="p-5 overflow-auto space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <AppIconRenderer appId="settings" size={32} />
        <h2 className="text-base font-bold text-white/90">Settings</h2>
      </div>
      {SETTINGS_DATA.map((cat) => (
        <div key={cat.category}>
          <h3 className="text-[10px] text-white/35 uppercase tracking-widest mb-3 font-medium">{cat.category}</h3>
          <div className="rounded-2xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden"
            style={{ background: "linear-gradient(180deg, hsl(225 10% 11%), hsl(225 10% 9%))" }}>
            {cat.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-[13px] text-white/80 font-medium">{item.label}</span>
                {item.type === "toggle" ? (
                  <MockToggle value={!!state[item.label]} onChange={(v) => setState((p) => ({ ...p, [item.label]: v }))} />
                ) : (
                  <span className="text-[13px] text-white/40">{String(state[item.label])}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}