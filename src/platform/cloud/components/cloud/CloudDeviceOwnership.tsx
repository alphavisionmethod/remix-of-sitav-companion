import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Shield, RefreshCw, Eye, Trash2, Clock, Wifi } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fromTable } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";

interface DeviceOwnershipRow {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  platform: string;
  trust_level: string;
  last_seen_at: string;
  sync_enabled: boolean;
  revoked: boolean;
  created_at: string;
}

const TRUST_COLORS: Record<string, string> = {
  trusted: "text-green-400 bg-green-500/10 border-green-500/30",
  standard: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  restricted: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  untrusted: "text-red-400 bg-red-500/10 border-red-500/30",
};

const DEVICE_ICONS: Record<string, string> = {
  desktop: "💻",
  mobile: "📱",
  tablet: "📲",
  web: "🌐",
};

export function CloudDeviceOwnership() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<DeviceOwnershipRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    if (!user) return;
    const { data } = await fromTable("device_ownership")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("last_seen_at", { ascending: false });
    setDevices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, [user]);

  const revokeDevice = async (deviceId: string) => {
    await fromTable("device_ownership")
      .update({ revoked: true, revoked_at: new Date().toISOString(), revoke_scope: "user" })
      .eq("id", deviceId)
      .eq("owner_user_id", user?.id);
    toast({ title: "Device revoked", description: "The device has been disconnected from your account." });
    loadDevices();
  };

  const activeDevices = devices.filter((d) => !d.revoked);
  const revokedDevices = devices.filter((d) => d.revoked);

  if (loading) {
    return <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">My Devices</h2>
        <Badge variant="outline" className="text-[10px]">{activeDevices.length} active</Badge>
        <Button variant="ghost" size="sm" onClick={loadDevices} className="ml-auto">
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Active Devices */}
      {activeDevices.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No devices registered yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeDevices.map((device) => (
            <Card key={device.id} className="border-border/50 bg-card/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{DEVICE_ICONS[device.device_type] || "💻"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{device.device_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{device.platform} · {device.device_type}</p>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${TRUST_COLORS[device.trust_level] || ""}`}>
                    {device.trust_level}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Last seen: {new Date(device.last_seen_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Sync: {device.sync_enabled ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="text-[10px] h-7 flex-1">
                    <Eye className="h-3 w-3 mr-1" /> Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 text-destructive hover:text-destructive"
                    onClick={() => revokeDevice(device.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Revoked Devices */}
      {revokedDevices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Revoked Devices</h3>
          {revokedDevices.map((device) => (
            <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 opacity-60">
              <span>{DEVICE_ICONS[device.device_type] || "💻"}</span>
              <span className="text-xs text-muted-foreground">{device.device_name}</span>
              <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/30 ml-auto">Revoked</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
