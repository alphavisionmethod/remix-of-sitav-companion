import React from "react";
import { DEMO_APPS, type DemoAppId } from "./demo-data";
import { Briefcase, DollarSign, Sparkles, Users, TrendingUp, FolderOpen, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, DollarSign, Sparkles, Users, TrendingUp, FolderOpen, FileText, Settings,
};

interface Props {
  openApps: DemoAppId[];
  onLaunch: (id: DemoAppId) => void;
}

export function DemoDock({ openApps, onLaunch }: Props) {
  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-end gap-1 px-3 py-1.5 rounded-2xl"
      style={{ background: "rgba(20,20,30,0.65)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.1)" }}>
      {DEMO_APPS.map((app) => {
        const Icon = ICON_MAP[app.icon];
        const isOpen = openApps.includes(app.id);
        return (
          <button key={app.id} onClick={() => onLaunch(app.id)}
            className="group flex flex-col items-center gap-0.5 transition-transform hover:scale-125 duration-200">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
              app.gradient,
            )}>
              {Icon && <Icon className="w-5 h-5 text-white" />}
            </div>
            {isOpen && <div className="w-1 h-1 rounded-full bg-white/70" />}
          </button>
        );
      })}
    </div>
  );
}