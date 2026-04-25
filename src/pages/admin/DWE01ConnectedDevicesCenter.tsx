import DWESubNav from "@/platform/admin/components/admin/DWESubNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Watch, Laptop, Monitor, Wifi, WifiOff, Shield, Activity } from "lucide-react";
import { fromTable } from "@/lib/supabase-helpers";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { ConnectedDeviceRow, DeviceFamilyRow } from "@/lib/types/dwe-types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { DemoOnlyBanner } from "@/platform/trust/components/claim-safety/DemoOnlyBanner";

const iconMap: Record<string, React.ReactNode> = {
  phone: <Smartphone className="h-5 w-5" />,
  smartwatch: <Watch className="h-5 w-5" />,
  tablet: <Smartphone className="h-5 w-5" />,
  desktop: <Laptop className="h-5 w-5" />,
  ring: <Activity className="h-5 w-5" />,
  sports_band: <Activity className="h-5 w-5" />,
  headset: <Monitor className="h-5 w-5" />,
};

export default function DWE01ConnectedDevicesCenter() {
  const { user } = useAuth();

  const { data: devices = [] } = useQuery<ConnectedDeviceRow[]>({
    queryKey: ["dwe01-devices", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("connected_devices").select("*").order("last_seen_at", { ascending: false });
      return (data ?? []) as ConnectedDeviceRow[];
    },
  });

  const { data: families = [] } = useQuery<DeviceFamilyRow[]>({
    queryKey: ["dwe01-families", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await fromTable("device_families").select("*").order("name");
      return (data ?? []) as DeviceFamilyRow[];
    },
  });

  return (
    <div className="space-y-6 p-6">
      <DWESubNav />
      <DemoOnlyBanner surfaceId="DWE01" />
<div>
        <h1 className="text-2xl font-bold text-foreground">DWE01 — Connected Devices Center</h1>
        <p className="text-muted-foreground">All phones, watches, desktops, wearables, and their trust/connection state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Device Families</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{families.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Connected Devices</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{devices.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Online Now</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{devices.filter((d) => d.health_status === "online").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Device Families</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {families.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                {iconMap[f.family_key] || <Monitor className="h-5 w-5" />}
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.interaction_type} · {f.sensor_support ? "Sensor" : "No sensor"}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">{f.launch_stage}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Connected Devices</CardTitle></CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No devices connected yet. Devices will appear here as they register.</p>
          ) : (
            <div className="space-y-2">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {d.health_status === "online" ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.device_name}</p>
                    <p className="text-xs text-muted-foreground">{d.platform} · {d.os_version || "Unknown version"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{d.trust_level}</Badge>
                  <Badge variant={d.health_status === "online" ? "default" : "secondary"} className="text-xs">{d.health_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
