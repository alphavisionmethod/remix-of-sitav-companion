import { useState } from "react";
import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import { Folder, Image, Music, AppWindow, Code, StickyNote, ChevronRight, Monitor, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const folders = [
  { label: "Docs", icon: Folder, gradient: ICON_GRADIENTS.blue },
  { label: "Images", icon: Image, gradient: ICON_GRADIENTS.purple },
  { label: "Music", icon: Music, gradient: ICON_GRADIENTS.pink },
  { label: "Apps", icon: AppWindow, gradient: ICON_GRADIENTS.green },
  { label: "Projects", icon: Code, gradient: ICON_GRADIENTS.orange },
  { label: "Notes", icon: StickyNote, gradient: ICON_GRADIENTS.gold },
];

const favorites = [
  { label: "Desktop", icon: Monitor },
  { label: "Documents", icon: FileText },
  { label: "Downloads", icon: Download },
];

export function FinderWindow() {
  const [activeFav, setActiveFav] = useState("Desktop");
  const [path, setPath] = useState(["Home"]);

  return (
    <div className="flex min-h-[260px]">
      {/* Sidebar */}
      <div className="w-36 border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] p-2 space-y-3">
        <p className="text-[10px] font-semibold text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] uppercase tracking-wider px-2">
          Favorites
        </p>
        <div className="space-y-0.5">
          {favorites.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => { setActiveFav(label); setPath(["Home", label]); }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors",
                activeFav === label
                  ? "bg-[hsl(210_80%_55%/0.15)] text-[hsl(210_80%_45%)] dark:text-[hsl(210_80%_65%)] font-medium"
                  : "text-[hsl(0_0%_35%)] dark:text-[hsl(0_0%_65%)] hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.04)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb path bar */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[hsl(0_0%_0%/0.04)] dark:border-[hsl(0_0%_100%/0.04)]">
          {path.map((seg, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-2.5 w-2.5 text-[hsl(0_0%_50%)]" />}
              <button
                onClick={() => setPath(path.slice(0, i + 1))}
                className={cn(
                  "text-[11px] transition-colors",
                  i === path.length - 1
                    ? "font-medium text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]"
                    : "text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_30%)] dark:hover:text-[hsl(0_0%_70%)]"
                )}
              >
                {seg}
              </button>
            </span>
          ))}
        </div>

        {/* File grid */}
        <div className="p-3 grid grid-cols-3 gap-3 flex-1">
          {folders.map(({ label, icon: Icon, gradient }) => (
            <button
              key={label}
              onClick={() => setPath([...path, label])}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)] transition-colors cursor-default"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} shadow flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
              </div>
              <span className="text-[10px] text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)] leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
