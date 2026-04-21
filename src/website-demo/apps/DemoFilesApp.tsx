import React, { useState } from "react";
import { FILES_DATA } from "../demo-data";
import { Folder, FileSpreadsheet, FileText, Image, File, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

const FILE_ICON: Record<string, React.ElementType> = {
  spreadsheet: FileSpreadsheet, pdf: FileText, image: Image, document: File, presentation: Presentation,
};
const FILE_COLORS: Record<string, string> = {
  spreadsheet: "hsl(152,55%,48%)", pdf: "hsl(0,65%,52%)", image: "hsl(210,80%,60%)", document: "hsl(220,15%,55%)", presentation: "hsl(38,85%,58%)",
};

export function DemoFilesApp() {
  const [activeFolder, setActiveFolder] = useState("Documents");
  return (
    <div className="flex h-full">
      <div className="w-44 shrink-0 border-r border-white/[0.06] p-3 space-y-0.5"
        style={{ background: "linear-gradient(180deg, hsl(225 12% 8% / 0.5), hsl(225 12% 6% / 0.3))" }}>
        {FILES_DATA.folders.map((f) => (
          <button key={f.name} onClick={() => setActiveFolder(f.name)}
            className={cn("w-full flex items-center gap-2 text-[13px] px-2.5 py-2 rounded-xl transition-all duration-200 relative",
              activeFolder === f.name ? "bg-white/[0.08] text-white font-medium" : "text-white/40 hover:bg-white/[0.04]")}>
            {activeFolder === f.name && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-gradient-to-b from-[hsl(190,60%,50%)] to-[hsl(210,80%,60%)]" />}
            <Folder className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{f.name}</span>
            <span className="text-[10px] text-white/20 font-mono">{f.items}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
        {FILES_DATA.files.map((f) => {
          const Icon = FILE_ICON[f.type] ?? File;
          const iconColor = FILE_COLORS[f.type] ?? "hsl(220,15%,55%)";
          return (
            <div key={f.name} className="rounded-2xl border border-white/[0.06] p-4 flex flex-col items-center gap-2.5 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
              style={{ background: "linear-gradient(180deg, hsl(225 10% 11%), hsl(225 10% 9%))" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}15` }}>
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
              </div>
              <span className="text-[12px] text-white/85 text-center truncate w-full font-medium">{f.name}</span>
              <span className="text-[9px] text-white/25">{f.size} · {f.modified}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}