import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness, Wallet, HeartHandshake,
  FolderOpen, Presentation, ShieldCheck,
} from "lucide-react";

const apps = [
  { id: "business", name: "Business", accent: "from-violet-500 to-indigo-500", icon: BriefcaseBusiness },
  { id: "finance", name: "Finance", accent: "from-emerald-500 to-teal-500", icon: Wallet },
  { id: "concierge", name: "Concierge", accent: "from-amber-400 to-rose-400", icon: HeartHandshake },
  { id: "finder", name: "Files", accent: "from-slate-400 to-slate-600", icon: FolderOpen },
  { id: "boardroom", name: "Boardroom", accent: "from-fuchsia-500 to-violet-500", icon: Presentation },
  { id: "trust", name: "Trust", accent: "from-sky-400 to-cyan-500", icon: ShieldCheck },
];

interface DesktopLeftRailProps {
  onLaunchApp?: (appId: string) => void;
}

export function DesktopLeftRail({ onLaunchApp }: DesktopLeftRailProps) {
  return (
    <div className="w-[88px] flex flex-col gap-4">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-3 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
        <div className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/45">Apps</div>
        <div className="flex flex-col gap-3">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onLaunchApp?.(app.id)}
              title={app.name}
              className={cn(
                "group relative flex h-14 w-14 items-center justify-center rounded-[18px] border transition",
                "border-white/[0.08] bg-white/[0.06] hover:bg-white/10"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-[18px] bg-gradient-to-br transition",
                  app.accent,
                  "opacity-0 group-hover:opacity-20"
                )}
              />
              <div className="relative text-white/90">
                <app.icon className="h-5 w-5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
