import { MoonStar, LayoutGrid } from "lucide-react";
import { DesktopWidgetCard } from "./DesktopWidgetCard";

const openApps = ["Business", "Finance", "Concierge", "Files"];

export function DesktopSystemWidget() {
  return (
    <DesktopWidgetCard title="System" accent="from-sky-400/[0.12] via-white/[0.05] to-white/[0.05]">
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
            {openApps.map((name) => (
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
