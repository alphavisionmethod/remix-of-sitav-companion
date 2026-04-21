import React, { useState } from "react";
import { DEMO_APPS, APP_ICON_MAP, type DemoAppId } from "./demo-data";
import { cn } from "@/lib/utils";

interface Props {
  onOpen: (id: DemoAppId) => void;
}

export function DemoDesktopIcons({ onOpen }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="absolute top-10 right-6 flex flex-col gap-5 z-10">
      {DEMO_APPS.map((app) => {
        const Icon = ICON_MAP[app.icon];
        return (
          <button key={app.id}
            onClick={() => setSelected(app.id)}
            onDoubleClick={() => onOpen(app.id)}
            className="flex flex-col items-center gap-1 group">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-black/80 shadow-lg transition-all",
              selected === app.id && "ring-2 ring-blue-400/80",
            )}>
              <img src={APP_ICON_MAP[app.id]} alt={app.label} className="w-full h-full object-cover" loading="lazy" width={56} height={56} />
            </div>
            <span className={cn(
              "text-[10px] text-white/80 font-medium px-1 rounded",
              selected === app.id && "bg-blue-500/60",
            )}>{app.label}</span>
          </button>
        );
      })}
    </div>
  );
}