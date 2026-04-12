import { useState } from "react";
import { ICON_GRADIENTS } from "@/lib/design-system/nova-os";
import { APP_TYPE, APP_COMPONENTS, APP_MATERIALS, SPACE } from "@/lib/design-system/app-window-system";
import { Folder, Image, Music, AppWindow, Code, StickyNote, ChevronRight, Monitor, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStateWrapper } from "@/components/sita/shell/AppStateWrapper";

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
    <AppStateWrapper state="ready" accentGradient="from-[hsl(210_80%_60%)] to-[hsl(250_70%_55%)]">
      <div className="flex min-h-[280px]">
        {/* Sidebar */}
        <div
          className={cn(
            "border-r",
            APP_MATERIALS.sidebarBorder,
          )}
          style={{ width: 144, padding: SPACE.tight }}
        >
          <p className={cn(APP_TYPE.label, "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] uppercase tracking-widest px-2 mb-2")}>
            Favorites
          </p>
          <div className="space-y-0.5">
            {favorites.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => { setActiveFav(label); setPath(["Home", label]); }}
                className={cn(
                  APP_COMPONENTS.listItem.base,
                  activeFav === label ? APP_COMPONENTS.listItem.active : APP_COMPONENTS.listItem.inactive
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
          <div className="flex items-center gap-1 px-3 border-b border-[hsl(0_0%_0%/0.04)] dark:border-[hsl(0_0%_100%/0.04)]" style={{ height: 32 }}>
            {path.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-2.5 w-2.5 text-[hsl(0_0%_50%)]" />}
                <button
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className={cn(
                    APP_TYPE.label,
                    "transition-colors duration-[80ms]",
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
          <div className="flex-1 grid grid-cols-3 gap-2" style={{ padding: SPACE.normal }}>
            {folders.map(({ label, icon: Icon, gradient }) => (
              <button
                key={label}
                onClick={() => setPath([...path, label])}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl cursor-default",
                  "transition-all duration-[80ms] active:scale-[0.97]",
                  "hover:bg-[hsl(0_0%_0%/0.04)] dark:hover:bg-[hsl(0_0%_100%/0.06)]"
                )}
                style={{ padding: SPACE.tight }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  "shadow-[0_2px_8px_hsl(0_0%_0%/0.12)]",
                  gradient
                )}>
                  <Icon className="h-5 w-5 text-[hsl(0_0%_100%/0.9)]" />
                </div>
                <span className={cn(APP_TYPE.label, "text-[hsl(0_0%_20%)] dark:text-[hsl(0_0%_80%)]")}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppStateWrapper>
  );
}
