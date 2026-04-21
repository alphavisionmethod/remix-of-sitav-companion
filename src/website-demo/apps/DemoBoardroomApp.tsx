import React from "react";
import { BOARDROOM_DATA } from "../demo-data";
import { MockAvatar, MockGauge } from "../demo-primitives";

export function DemoBoardroomApp() {
  return (
    <div className="p-5 overflow-auto space-y-5">
      <div className="flex gap-5">
        <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs text-white/50 uppercase mb-4">Advisor Council</h3>
          <div className="grid grid-cols-3 gap-4">
            {BOARDROOM_DATA.advisors.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] p-3">
                <MockAvatar src={a.avatar} name={a.name} size={56} />
                <span className="text-sm text-white/90 font-medium text-center">{a.name}</span>
                <span className="text-[10px] text-white/40">{a.domain}</span>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400/70" style={{ width: `${a.confidence}%` }} />
                </div>
                <span className="text-[10px] text-white/30">{a.confidence}% confidence</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-48 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col items-center">
            <h3 className="text-xs text-white/50 uppercase mb-2">Consensus</h3>
            <MockGauge value={BOARDROOM_DATA.consensus} size={90} color="hsl(45,80%,55%)" />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-xs text-white/50 uppercase mb-2">Active Debate</h3>
            <p className="text-xs text-white/70 mb-2">{BOARDROOM_DATA.activeDebate.topic}</p>
            <div className="flex gap-2 text-[10px]">
              <span className="text-emerald-400">For: {BOARDROOM_DATA.activeDebate.for}</span>
              <span className="text-rose-400">Against: {BOARDROOM_DATA.activeDebate.against}</span>
              <span className="text-white/30">Abstain: {BOARDROOM_DATA.activeDebate.abstain}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}