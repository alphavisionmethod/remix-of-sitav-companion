import React, { useState } from "react";
import { FILES_DATA } from "../demo-data";
import { Folder, FileSpreadsheet, FileText, Image, File, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

const FILE_ICON: Record<string, React.ElementType> = {
  spreadsheet: FileSpreadsheet, pdf: FileText, image: Image, document: File, presentation: Presentation,
};

export function DemoFilesApp() {
  const [activeFolder, setActiveFolder] = useState("Documents");
  return (
    <div className="flex h-full">
      <div className="w-44 shrink-0 border-r border-white/10 p-3 space-y-0.5">
        {FILES_DATA.folders.map((f) => (
          <button key={f.name} onClick={() => setActiveFolder(f.name)}
            className={cn("w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg transition",
              activeFolder === f.name ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5")}>
            <Folder className="w-4 h-4" />
            <span className="flex-1 text-left">{f.name}</span>
            <span className="text-xs text-white/30">{f.items}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 grid grid-cols-3 gap-3 content-start">
        {FILES_DATA.files.map((f) => {
          const Icon = FILE_ICON[f.type] ?? File;
          return (
            <div key={f.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col items-center gap-2 hover:bg-white/[0.06] transition cursor-pointer">
              <Icon className="w-8 h-8 text-white/40" />
              <span className="text-xs text-white/80 text-center truncate w-full">{f.name}</span>
              <span className="text-[10px] text-white/30">{f.size} · {f.modified}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}