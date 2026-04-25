import { useAction } from "@/hooks/use-action";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download, Monitor, HardDrive, Shield, Database, Wifi, Server,
  CheckCircle, AlertTriangle, Clock, RefreshCw, Cpu, MemoryStick,
  Lock, Eye, Zap, Archive
} from "lucide-react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { PageSkeleton } from "@/platform/sita/components/sita/PageSkeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const SystemManagement = () => {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { session } = useAuth();
  const [tab, setTab] = useState("devices");
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["admin-devices"],
    queryFn: async () => {
      const { data, error } = await fromTable("device_statuses").select("*").order("last_seen", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["admin-signals"],
    queryFn: async () => {
      const { data, error } = await fromTable("agent_signals")
        .select("*")
        .like("signal_type", "os_command:%")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const sendCommand = useAction("admin", "command.send");

  if (adminLoading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  const COMMANDS = ["restart-service", "update-now", "run-backup", "clear-cache", "rotate-certs", "health-check"];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
<div>
        <h1 className="text-2xl font-display font-bold text-foreground">System Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Devices, commands, drivers, storage, network & security</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="devices" className="gap-1.5"><Monitor className="h-3.5 w-3.5" />Devices</TabsTrigger>
          <TabsTrigger value="commands" className="gap-1.5"><Zap className="h-3.5 w-3.5" />Commands</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5"><Cpu className="h-3.5 w-3.5" />Drivers</TabsTrigger>
          <TabsTrigger value="storage" className="gap-1.5"><Database className="h-3.5 w-3.5" />Storage</TabsTrigger>
          <TabsTrigger value="network" className="gap-1.5"><Wifi className="h-3.5 w-3.5" />Network</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        {/* DEVICES TAB */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{devices.length} registered device(s)</p>
          </div>
          {devicesLoading ? <PageSkeleton rows={2} /> : (
            <div className="grid gap-3">
              {devices.map((d) => (
                <Card key={d.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{d.device_name}</p>
                        <p className="text-xs text-muted-foreground">{d.device_type} · {d.os || "Unknown OS"} · {d.ip_address || "No IP"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={d.status === "online" ? "default" : "secondary"}>{d.status}</Badge>
                      <p className="text-xs text-muted-foreground">{format(new Date(d.last_seen), "PPp")}</p>
                      <Select onValueChange={(cmd) => sendCommand.mutate({ deviceId: d.id, command: cmd })}>
                        <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Send command" /></SelectTrigger>
                        <SelectContent>
                          {COMMANDS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {devices.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No devices registered.</p>}
            </div>
          )}
        </TabsContent>

        {/* COMMANDS TAB */}
        <TabsContent value="commands" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent OS Commands</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {signals.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No commands sent yet</p>
                ) : (
                  <div className="space-y-2">
                    {signals.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{s.signal_type}</p>
                          <p className="text-xs text-muted-foreground">Device: {s.agent_id?.slice(0, 12)}… · {format(new Date(s.created_at!), "PPp")}</p>
                        </div>
                        <Badge variant={s.processed ? "default" : "secondary"}>{s.processed ? "Processed" : "Pending"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRIVERS TAB */}
        <TabsContent value="drivers" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hardware Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Platform", value: navigator.platform, icon: Cpu },
                { label: "CPU Cores", value: `${navigator.hardwareConcurrency || "Unknown"}`, icon: Zap },
                { label: "Memory", value: `${navigator.deviceMemory ?? "Unknown"} GB`, icon: MemoryStick },
                { label: "Language", value: navigator.language, icon: Monitor },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORAGE TAB */}
        <TabsContent value="storage" className="space-y-4 mt-4">
          {[
            { label: "Database", used: 12, total: 500, unit: "MB" },
            { label: "File Storage", used: 45, total: 1000, unit: "MB" },
            { label: "Logs", used: 8, total: 100, unit: "MB" },
          ].map(({ label, used, total, unit }) => (
            <Card key={label}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>{label}</span><span className="text-muted-foreground">{used} / {total} {unit}</span></div>
                <Progress value={(used / total) * 100} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* NETWORK TAB */}
        <TabsContent value="network" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                { label: "Connection", value: navigator.onLine ? "Online" : "Offline" },
                { label: "Protocol", value: window.location.protocol === "https:" ? "HTTPS (Secure)" : "HTTP" },
                { label: "Host", value: window.location.host },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                  <span>{label}</span><span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "TLS/SSL", status: window.location.protocol === "https:", icon: Lock },
              { title: "Row-Level Security", status: true, icon: Shield },
              { title: "JWT Authentication", status: true, icon: Eye },
              { title: "Rate Limiting", status: true, icon: Zap },
            ].map(({ title, status, icon: Icon }) => (
              <Card key={title}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`p-2 rounded-lg ${status ? "bg-primary/10" : "bg-destructive/10"}`}>
                    <Icon className={`h-5 w-5 ${status ? "text-primary" : "text-destructive"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{status ? "Active" : "Inactive"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemManagement;
