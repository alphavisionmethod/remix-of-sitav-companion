import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { Sun, CloudSun } from "lucide-react";

export function DesktopWeatherWidget() {
  return (
    <DesktopWidgetCard>
      <div className="flex items-center gap-4">
        <Sun className="h-10 w-10 text-amber-400" />
        <div>
          <p className="text-3xl font-light text-white/90">72°</p>
          <p className="text-[11px] text-white/40">Sunny · H:78° L:62°</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
        <CloudSun className="h-3 w-3" />
        <span>Partly cloudy tonight</span>
      </div>
    </DesktopWidgetCard>
  );
}
