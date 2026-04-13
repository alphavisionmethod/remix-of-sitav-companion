import { MoonStar, ShieldCheck, Wifi } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";

export function DesktopSystemWidget() {
  const { openWindows } = useOSWindowContext();
  const activeCount = openWindows.filter(w => !w.isMinimized).length;

  return (
    <DesktopWidgetCard title="System Status" accent="from-sky-400/[0.12] via-white/[0.05] to-white/[0.05]">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-black/20 p-3">
          <ShieldCheck className="h-4 w-4 text-cyan-300" />
          <span className="text-[10px] text-white/50">Trust</span>
          <span className="text-xs font-medium text-cyan-300">Safe</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-black/20 p-3">
          <MoonStar className="h-4 w-4 text-violet-300" />
          <span className="text-[10px] text-white/50">Mode</span>
          <span className="text-xs font-medium text-white">Calm</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-xl bg-black/20 p-3">
          <Wifi className="h-4 w-4 text-emerald-300" />
          <span className="text-[10px] text-white/50">Apps</span>
          <span className="text-xs font-medium text-white">{activeCount || 0}</span>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
