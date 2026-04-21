import React, { useEffect, useState } from "react";
import { Wifi, Battery, Bell } from "lucide-react";

export function DemoMenuBar({ focusedApp }: { focusedApp: string | null }) {
  const [time, setTime] = useState(formatTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-7 shrink-0 flex items-center justify-between px-4 text-xs text-white/70 select-none"
      style={{ background: "rgba(10,10,20,0.65)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}>
      <div className="flex items-center gap-3">
        <span className="font-bold text-white/90">SITA OS</span>
        {focusedApp && <span className="text-white/50">{focusedApp}</span>}
      </div>
      <div className="flex items-center gap-3">
        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-3.5 h-3.5" />
        <Bell className="w-3.5 h-3.5" />
        <span>{time}</span>
      </div>
    </div>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}