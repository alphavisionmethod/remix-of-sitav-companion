import React from "react";
import { BOARDROOM_DATA } from "../demo-data";
import { MockAvatar, MockGauge } from "../demo-primitives";

export function DemoBoardroomApp() {
  return (
    <div className="p-4 sm:p-5 overflow-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, hsl(45 80% 55% / 0.04), transparent 60%)" }} />
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-4 font-medium">Advisor Council</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BOARDROOM_DATA.advisors.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] p-3 hover:bg-white/[0.03] transition-all group"
                style={{ background: "linear-gradient(180deg, hsl(225 10% 11%), hsl(225 10% 9%))" }}>
                <MockAvatar src={a.avatar} name={a.name} size={48} />
                <span className="text-[12px] text-white/90 font-semibold text-center">{a.name}</span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider">{a.domain}</span>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${a.confidence}%`, background: "linear-gradient(90deg, hsl(152 55% 48%), hsl(160 60% 55%))", boxShadow: "0 0 6px hsl(152 55% 48% / 0.3)" }} />
                </div>
                <span className="text-[9px] text-white/25 font-mono">{a.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full sm:w-48 shrink-0 flex flex-col gap-4">
          <div className="rounded-2xl border border-white/[0.06] p-4 flex flex-col items-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, hsl(45 80% 55% / 0.04), transparent 60%)" }} />
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-medium">Consensus</h3>
            <MockGauge value={BOARDROOM_DATA.consensus} size={90} color="hsl(45,80%,55%)" />
          </div>
          <div className="rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(225 12% 10%), hsl(225 10% 8%))" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-medium">Active Debate</h3>
            <p className="text-[11px] text-white/65 mb-3 leading-relaxed">{BOARDROOM_DATA.activeDebate.topic}</p>
            <div className="flex gap-2 text-[10px] font-semibold">
              <span className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">For: {BOARDROOM_DATA.activeDebate.for}</span>
              <span className="text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">Against: {BOARDROOM_DATA.activeDebate.against}</span>
              <span className="text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">{BOARDROOM_DATA.activeDebate.abstain}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}