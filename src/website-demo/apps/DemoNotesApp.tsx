import React, { useState } from "react";
import { NOTES_DATA } from "../demo-data";
import { cn } from "@/lib/utils";

export function DemoNotesApp() {
  const [active, setActive] = useState(NOTES_DATA[0].id);
  const note = NOTES_DATA.find((n) => n.id === active)!;
  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-white/[0.06] overflow-auto"
        style={{ background: "linear-gradient(180deg, hsl(225 12% 8% / 0.5), hsl(225 12% 6% / 0.3))" }}>
        {NOTES_DATA.map((n) => (
          <button key={n.id} onClick={() => setActive(n.id)}
            className={cn("w-full text-left px-4 py-3 border-b border-white/[0.04] transition-all duration-200 relative",
              active === n.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
            {active === n.id && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[hsl(38,85%,58%)] to-[hsl(38,75%,45%)]" />}
            <div className="text-[13px] text-white/90 truncate font-medium">{n.title}</div>
            <div className="text-[10px] text-white/25 mt-0.5">{n.date} · {n.folder}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 p-5">
        <h2 className="text-lg font-bold text-white mb-1" style={{ textShadow: "0 0 20px rgba(255,255,255,0.04)" }}>{note.title}</h2>
        <p className="text-[10px] text-white/25 mb-4 uppercase tracking-wider">{note.date} — {note.folder}</p>
        <p className="text-sm text-white/60 leading-relaxed">{note.preview}</p>
      </div>
    </div>
  );
}