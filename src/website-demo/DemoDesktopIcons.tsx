import React, { useState } from "react";
import { DEMO_APPS, type DemoAppId } from "./demo-data";
import { Briefcase, DollarSign, Sparkles, Users, TrendingUp, FolderOpen, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, DollarSign, Sparkles, Users, TrendingUp, FolderOpen, FileText, Settings,
};

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
              "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-all",
              app.gradient,
              selected === app.id && "ring-2 ring-blue-400/80",
            )}>
              {Icon && <Icon className="w-6 h-6 text-white" />}
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