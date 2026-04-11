import { useState } from "react";
import { Monitor, Volume2, Wifi, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "display", label: "Display", icon: Monitor },
  { id: "sound", label: "Sound", icon: Volume2 },
  { id: "network", label: "Network", icon: Wifi },
];

export function SettingsWindow() {
  const [active, setActive] = useState("general");

  return (
    <div className="flex min-h-[240px]">
      <div className="w-40 border-r border-[hsl(0_0%_0%/0.06)] dark:border-[hsl(0_0%_100%/0.06)] p-2 space-y-0.5">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors",
              active === id
                ? "bg-[hsl(0_0%_0%/0.06)] dark:bg-[hsl(0_0%_100%/0.08)] font-medium text-[hsl(0_0%_10%)] dark:text-[hsl(0_0%_90%)]"
                : "text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_0%/0.03)] dark:hover:bg-[hsl(0_0%_100%/0.04)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4">
        <h3 className="text-sm font-semibold text-[hsl(0_0%_15%)] dark:text-[hsl(0_0%_85%)] mb-3 capitalize">{active}</h3>
        <div className="rounded-xl bg-[hsl(0_0%_0%/0.03)] dark:bg-[hsl(0_0%_100%/0.04)] p-4 text-xs text-[hsl(0_0%_40%)] dark:text-[hsl(0_0%_60%)]">
          {active === "display" && "Brightness · Resolution · Night Shift"}
          {active === "sound" && "Volume · Output Device · Alert Sounds"}
          {active === "network" && "WiFi · Bluetooth · VPN · Proxy"}
          {active === "general" && "Appearance · Language · About This Mac"}
        </div>
      </div>
    </div>
  );
}
