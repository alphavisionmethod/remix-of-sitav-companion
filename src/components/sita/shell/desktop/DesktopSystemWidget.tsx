import { MoonStar, LayoutGrid } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";
import { useOSWindowContext } from "@/components/sita/os/WindowContext";

export function DesktopSystemWidget() {
  const { openWindows } = useOSWindowContext();
  const activeApps = openWindows
    .filter(w => !w.isMinimized)
    .map(w => w.title);
  const displayApps = activeApps.length > 0 ? activeApps : ["Desktop"];

  return (
    <DesktopWidgetCard title="System" accent="from-sky-400/[0.12] via-white/[0.05] to-white/[0.05]" delay={0.4}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
            <MoonStar className="h-4 w-4" />
            Calm mode
          </div>
          <p className="text-sm text-white/60">
            Notifications are softened and the system is prioritizing review-first surfaces.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
            <LayoutGrid className="h-4 w-4" />
            Open apps
          </div>
          <div className="flex flex-wrap gap-2">
            {displayApps.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs text-white/70"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DesktopWidgetCard>
  );
}
