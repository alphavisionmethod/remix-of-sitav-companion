import React, { useState } from "react";
import { NOTES_DATA } from "../demo-data";
import { cn } from "@/lib/utils";

export function DemoNotesApp() {
  const [active, setActive] = useState(NOTES_DATA[0].id);
  const note = NOTES_DATA.find((n) => n.id === active)!;
  return (
    <div className="flex h-full">
      <div className="w-56 shrink-0 border-r border-white/10 overflow-auto">
        {NOTES_DATA.map((n) => (
          <button key={n.id} onClick={() => setActive(n.id)}
            className={cn("w-full text-left px-3 py-2.5 border-b border-white/[0.05] transition",
              active === n.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]")}>
            <div className="text-sm text-white/90 truncate">{n.title}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{n.date} · {n.folder}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 p-5">
        <h2 className="text-lg font-semibold text-white mb-1">{note.title}</h2>
        <p className="text-xs text-white/30 mb-4">{note.date} — {note.folder}</p>
        <p className="text-sm text-white/70 leading-relaxed">{note.preview}</p>
      </div>
    </div>
  );
}