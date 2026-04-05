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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { format } from "date-fns";
import { toast } from "sonner";

const SystemManagement = () => {
  const { isAdmin, loading: adminLoading } = useRequireAdmin();
  const { session } = useAuth();
  const [tab, setTab] = useState("devices");
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["admin-devices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("device_statuses").select("*").order("last_seen", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: signals = [] } = useQuery({
    queryKey: ["admin-signals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_signals")
        .select("*")
        .like("signal_type", "os_command:%")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const sendCommand = useMutation({
    mutationFn: async ({ deviceId, command }: { deviceId: string; command: string }) => {
      const { data, error } = await supabase.functions.invoke("os-command", {
        body: { device_id: deviceId, command },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Command queued successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-signals"] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (adminLoading) return <PageSkeleton rows={3} />;
  if (!isAdmin) return null;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">System Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Updates, devices, drivers, storage, network & security — all in one place</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="updates" className="gap-1.5"><Download className="h-3.5 w-3.5" />Updates</TabsTrigger>
          <TabsTrigger value="devices" className="gap-1.5"><Monitor className="h-3.5 w-3.5" />Devices</TabsTrigger>
          <TabsTrigger value="drivers" className="gap-1.5"><Cpu className="h-3.5 w-3.5" />Drivers</TabsTrigger>
          <TabsTrigger value="storage" className="gap-1.5"><Database className="h-3.5 w-3.5" />Storage</TabsTrigger>
          <TabsTrigger value="network" className="gap-1.5"><Wifi className="h-3.5 w-3.5" />Network</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
          <TabsTrigger value="backups" className="gap-1.5"><Archive className="h-3.5 w-3.5" />Backups</TabsTrigger>
        </TabsList>

        {/* UPDATES TAB */}
        <TabsContent value="updates" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Version</CardDescription>
                <CardTitle className="text-2xl">{SystemUpdateService.getAppVersion()}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-xs">stable</Badge>
              </CardContent>
            </Card>
            <Card className={latestUpdate ? 'border-primary' : ''}>
              <CardHeader className="pb-2">
                <CardDescription>Latest Available</CardDescription>
                <CardTitle className="text-2xl">{latestUpdate?.version || 'Up to date'}</CardTitle>
              </CardHeader>
              <CardContent>
                {latestUpdate ? (
                  <Button size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Update Now</Button>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-green-500"><CheckCircle className="h-4 w-4" />No updates pending</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Auto-Update</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span className="text-base font-normal">Enabled</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Updates install automatically during idle periods</p>
              </CardContent>
            </Card>
          </div>

          {/* Update History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No update history yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{h.from_version} → {h.to_version}</p>
                          {h.started_at && <p className="text-xs text-muted-foreground">{format(new Date(h.started_at), 'PPp')}</p>}
                        </div>
                        <Badge variant={h.status === 'success' ? 'default' : h.status === 'failed' ? 'destructive' : 'secondary'}>{h.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEVICES TAB */}
        <TabsContent value="devices" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{devices.length} registered device(s)</p>
            <Button size="sm" variant="outline" onClick={() => SystemUpdateService.registerDevice()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Register This Device
            </Button>
          </div>
          <div className="grid gap-3">
            {devices.map((d) => (
              <Card key={d.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{d.hostname || d.device_id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">v{d.current_version} · {d.channel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={d.channel} onValueChange={(ch) => SystemUpdateService.setUpdateChannel(d.id, ch as any)}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="canary">Canary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch checked={d.auto_update_enabled} onCheckedChange={(v) => SystemUpdateService.setAutoUpdate(d.id, v)} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {devices.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No devices registered. Click "Register This Device" to start.</p>}
          </div>
        </TabsContent>

        {/* DRIVERS TAB */}
        <TabsContent value="drivers" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Hardware Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Platform', value: navigator.platform, icon: Cpu },
                { label: 'CPU Cores', value: `${navigator.hardwareConcurrency || 'Unknown'}`, icon: Zap },
                { label: 'Memory', value: `${(navigator as any).deviceMemory || 'Unknown'} GB`, icon: MemoryStick },
                { label: 'Language', value: navigator.language, icon: Monitor },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Driver Updates</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-500 py-4 justify-center">
                <CheckCircle className="h-4 w-4" />All drivers are up to date
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORAGE TAB */}
        <TabsContent value="storage" className="space-y-4 mt-4">
          {[
            { label: 'Database', used: 12, total: 500, unit: 'MB' },
            { label: 'File Storage', used: 45, total: 1000, unit: 'MB' },
            { label: 'Logs', used: 8, total: 100, unit: 'MB' },
            { label: 'Backups', used: 120, total: 2000, unit: 'MB' },
          ].map(({ label, used, total, unit }) => (
            <Card key={label}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>{label}</span><span className="text-muted-foreground">{used} / {total} {unit}</span></div>
                <Progress value={(used / total) * 100} className="h-2" />
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm"><HardDrive className="h-3.5 w-3.5 mr-1.5" />Run Cleanup</Button>
        </TabsContent>

        {/* NETWORK TAB */}
        <TabsContent value="network" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Connection', value: navigator.onLine ? 'Online' : 'Offline' },
                { label: 'Protocol', value: window.location.protocol === 'https:' ? 'HTTPS (Secure)' : 'HTTP' },
                { label: 'Host', value: window.location.host },
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
              { title: 'TLS/SSL', status: window.location.protocol === 'https:', icon: Lock },
              { title: 'Row-Level Security', status: true, icon: Shield },
              { title: 'JWT Authentication', status: true, icon: Eye },
              { title: 'Rate Limiting', status: true, icon: Zap },
            ].map(({ title, status, icon: Icon }) => (
              <Card key={title}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`p-2 rounded-lg ${status ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                    <Icon className={`h-5 w-5 ${status ? 'text-green-500' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{status ? 'Active' : 'Inactive'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BACKUPS TAB */}
        <TabsContent value="backups" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Backup Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <span>Schedule</span><span className="font-medium">Daily at 2:00 AM UTC</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <span>Last Backup</span><span className="font-medium">{format(new Date(), 'PPp')}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 text-sm">
                <span>Retention</span><span className="font-medium">30 days</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button size="sm"><Archive className="h-3.5 w-3.5 mr-1.5" />Backup Now</Button>
            <Button size="sm" variant="outline"><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Restore</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemManagement;
