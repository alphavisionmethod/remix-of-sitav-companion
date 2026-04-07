import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Watch, Laptop, Monitor, Wifi, WifiOff, Shield, Activity } from "lucide-react";
import { db } from "@/integrations/supabase/db";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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
  const { isDemoMode } = useDataMode();
  const [devices, setDevices] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);

  useEffect(() => {
    db.from("connected_devices").select("*").order("last_seen_at", { ascending: false }).then(({ data }: any) => setDevices(data || []));
    db.from("device_families").select("*").order("name").then(({ data }: any) => setFamilies(data || []));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div>
        <h1 className="text-2xl font-bold text-foreground">DWE01 — Connected Devices Center</h1>
        <p className="text-muted-foreground">All phones, watches, desktops, wearables, and their trust/connection state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Device Families</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{families.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Connected Devices</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{devices.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Online Now</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-green-500">{devices.filter((d: any) => d.connection_state === "connected").length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Device Families</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {families.map((f: any) => (
              <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                {iconMap[f.device_family_key] || <Monitor className="h-5 w-5" />}
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.interaction_class} · {f.sensor_class}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">{f.trust_support_level}</Badge>
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
              {devices.map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {d.connection_state === "connected" ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{d.device_label}</p>
                    <p className="text-xs text-muted-foreground">{d.platform} · {d.device_model || "Unknown model"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{d.trust_level}</Badge>
                  <Badge variant={d.connection_state === "connected" ? "default" : "secondary"} className="text-xs">{d.connection_state}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}