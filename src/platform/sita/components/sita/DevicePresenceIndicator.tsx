import { getCurrentDevicePresence, type DevicePresence } from "@/lib/core-services/device-presence-service";
import { Monitor, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function DevicePresenceIndicator() {
  const [device, setDevice] = useState<DevicePresence | null>(null);

  useEffect(() => {
    setDevice(getCurrentDevicePresence());

    const handleOnline = () => setDevice(getCurrentDevicePresence());
    const handleOffline = () => setDevice(getCurrentDevicePresence());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!device) return null;

  const isOnline = device.status === "online";
  const isMobile = device.os === "iOS" || device.os === "Android";
  const DeviceIcon = isMobile ? Smartphone : Monitor;
  const StatusIcon = isOnline ? Wifi : WifiOff;

  return (
    <div
      role="status"
      aria-label={`Device ${device.deviceName} is ${device.status}`}
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-xs"
    >
      <DeviceIcon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-foreground font-medium">{device.deviceName}</span>
      <div className="flex items-center gap-1">
        <StatusIcon className={`h-3 w-3 ${isOnline ? "text-primary" : "text-destructive"}`} />
        <span className={isOnline ? "text-primary" : "text-destructive"}>
          {device.status}
        </span>
      </div>
    </div>
  );
}
