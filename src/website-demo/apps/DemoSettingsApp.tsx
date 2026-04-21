import React, { useState } from "react";
import { SETTINGS_DATA } from "../demo-data";
import { MockToggle } from "../demo-primitives";
import iconSettings from "@/assets/app-icons/settings.png";

export function DemoSettingsApp() {
  const [state, setState] = useState(() =>
    Object.fromEntries(SETTINGS_DATA.flatMap((c) => c.items.map((i) => [i.label, i.value])))
  );
  return (
    <div className="p-5 overflow-auto space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <img src={iconSettings} alt="Settings" className="w-8 h-8 rounded-lg" width={32} height={32} />
        <h2 className="text-base font-semibold text-white/90">Settings</h2>
      </div>
      {SETTINGS_DATA.map((cat) => (
        <div key={cat.category}>
          <h3 className="text-xs text-white/50 uppercase tracking-wider mb-3">{cat.category}</h3>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.06]">
            {cat.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-white/80">{item.label}</span>
                {item.type === "toggle" ? (
                  <MockToggle value={!!state[item.label]} onChange={(v) => setState((p) => ({ ...p, [item.label]: v }))} />
                ) : (
                  <span className="text-sm text-white/50">{String(state[item.label])}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}