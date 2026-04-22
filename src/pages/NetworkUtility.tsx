import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Wifi, Globe, Shield, Activity, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Clock, Server, Bluetooth, Battery,
  Router, Radio, Thermometer, Heart, Volume2, Mic, Lock,
  Wrench, Sparkles, Eye, Search,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getWifiDaemon } from "@/lib/os-services/wifid";
import { getBluetoothDaemon } from "@/lib/os-services/btd";
import { getPowerDaemon } from "@/lib/os-services/powerd";
import { getSearchIndexer } from "@/lib/os-services/search-indexer";
import { getHelpEngine } from "@/lib/os-services/help-engine";
import { PageShell } from "@/components/sita/PageShell";

export default function NetworkUtility() {
  const wifi = getWifiDaemon().getState();
  const bt = getBluetoothDaemon().getState();
  const power = getPowerDaemon().getState();
  const help = getHelpEngine();
  const search = getSearchIndexer();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = searchQuery ? search.search(searchQuery) : [];
  const [runningRepair, setRunningRepair] = useState<string | null>(null);

  const handleRepair = async (id: string) => {
    setRunningRepair(id);
    const result = await help.executeRemediation(id);
    setRunningRepair(null);
    toast({ title: result.success ? "Success" : "Failed", description: result.message, variant: result.success ? "default" : "destructive" });
  };

  const diagnostics = [
    { test: "DNS resolution", result: "OK", time: "12ms", ok: true },
    { test: "TLS handshake", result: "OK", time: "34ms", ok: true },
    { test: "API gateway", result: "OK", time: "48ms", ok: true },
    { test: "WebSocket connection", result: "OK", time: "22ms", ok: true },
    { test: "Realtime subscription", result: "OK", time: "56ms", ok: true },
    { test: "DNS leak check", result: wifi.dnsLeakPrevention ? "OK" : "WARN", time: "—", ok: wifi.dnsLeakPrevention },
  ];

  return (
    <PageShell width="wide">
      <SitaPageHeader
        icon={<Wifi className="h-6 w-6" />}
        title="Network & Connectivity Center"
        subtitle="Connection health, device management, diagnostics, and self-repair"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search settings…"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-input bg-background text-sm w-48 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 p-1">
                {searchResults.map(r => (
                  <a key={r.id} href={r.deepLink} className="block px-3 py-2 rounded text-xs hover:bg-muted transition-colors">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-muted-foreground text-[10px]">{r.description}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1.5" /> Run Diagnostics
          </Button>
        </div>
      </SitaPageHeader>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Globe className="h-5 w-5 mx-auto text-emerald-500" />
            <p className="text-sm font-medium">Internet</p>
            <Badge variant="default">{wifi.connectivity === "online" ? "Connected" : wifi.connectivity}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Bluetooth className="h-5 w-5 mx-auto text-indigo-400" />
            <p className="text-sm font-medium">Bluetooth</p>
            <Badge variant="default">{bt.devices.filter(d => d.connected).length} connected</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Shield className="h-5 w-5 mx-auto text-primary" />
            <p className="text-sm font-medium">Shield</p>
            <Badge variant="secondary">Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Battery className="h-5 w-5 mx-auto text-amber-400" />
            <p className="text-sm font-medium">Battery</p>
            <Badge variant={power.level > 20 ? "default" : "destructive"}>{power.level}% · {power.activeProfile}</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wifi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wifi"><Wifi className="w-3.5 h-3.5 mr-1" /> Wi-Fi</TabsTrigger>
          <TabsTrigger value="bluetooth"><Bluetooth className="w-3.5 h-3.5 mr-1" /> Bluetooth</TabsTrigger>
          <TabsTrigger value="shield"><Shield className="w-3.5 h-3.5 mr-1" /> Shield</TabsTrigger>
          <TabsTrigger value="diagnostics"><Activity className="w-3.5 h-3.5 mr-1" /> Diagnostics</TabsTrigger>
          <TabsTrigger value="help"><Sparkles className="w-3.5 h-3.5 mr-1" /> Help</TabsTrigger>
        </TabsList>

        {/* WiFi Tab */}
        <TabsContent value="wifi">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Current Connection</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {wifi.currentNetwork ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{wifi.currentNetwork.ssid}</span>
                      <Badge>{wifi.connectivity}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Band: {wifi.currentNetwork.band}</div>
                      <div>Channel: {wifi.currentNetwork.channel}</div>
                      <div>Security: {wifi.currentNetwork.security.replace(/_/g, " ")}</div>
                      <div>Signal: {wifi.currentNetwork.rssiPercent}%</div>
                    </div>
                    <Progress value={wifi.currentNetwork.rssiPercent} className="h-1.5" />
                    {wifi.captivePortal.detected && <Badge variant="destructive">Captive Portal Detected</Badge>}
                    {wifi.roamingSuggestion && <p className="text-xs text-amber-500">{wifi.roamingSuggestion}</p>}
                  </>
                ) : <p className="text-muted-foreground">Not connected</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Saved Networks ({wifi.savedNetworks.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {wifi.savedNetworks.map(n => (
                  <div key={n.bssid} className="flex items-center justify-between p-2 rounded-lg border border-border/30 text-sm">
                    <div className="flex items-center gap-2">
                      {n.connected ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Wifi className="h-4 w-4 text-muted-foreground" />}
                      <span>{n.ssid}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {n.perNetworkSettings.isMetered && <Badge variant="outline" className="text-xs">Metered</Badge>}
                      {n.security !== "open" && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Hotspot</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div>Status: <Badge variant={wifi.hotspot.enabled ? "default" : "outline"}>{wifi.hotspot.enabled ? "On" : "Off"}</Badge></div>
                <div>SSID: {wifi.hotspot.ssid}</div>
                <div>Security: {wifi.hotspot.security.toUpperCase()}</div>
                <div>Band: {wifi.hotspot.band}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">DNS & Privacy</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">DNS Policy</span><span>{wifi.systemDnsPolicy}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Leak Prevention</span><Badge variant={wifi.dnsLeakPrevention ? "default" : "destructive"}>{wifi.dnsLeakPrevention ? "Active" : "Off"}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Airplane Mode</span><Badge variant={wifi.airplaneMode ? "destructive" : "outline"}>{wifi.airplaneMode ? "On" : "Off"}</Badge></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bluetooth Tab */}
        <TabsContent value="bluetooth">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Paired Devices</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {bt.devices.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2">
                      {d.connected ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Bluetooth className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.type} · {d.reconnectPolicy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {d.battery.main !== undefined && <span>{d.battery.main}%</span>}
                      {d.battery.left !== undefined && <span>L:{d.battery.left}% R:{d.battery.right}%</span>}
                      {d.codec && <Badge variant="outline" className="text-[10px]">{d.codec}</Badge>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Audio Route</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Volume2 className="w-4 h-4" /> Output</span><span>{bt.devices.find(d => d.id === bt.audioRoute.outputDevice)?.name || "System"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Mic className="w-4 h-4" /> Input</span><span>{bt.devices.find(d => d.id === bt.audioRoute.inputDevice)?.name || "System"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="outline">{bt.audioRoute.activeRole}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">BLE Privacy</span><Badge variant={bt.blePrivacyEnabled ? "default" : "secondary"}>{bt.blePrivacyEnabled ? "On" : "Off"}</Badge></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shield Tab */}
        <TabsContent value="shield">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-emerald-500" />
                <p className="font-medium">Firewall</p>
                <Badge variant="default">Active</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Globe className="h-8 w-8 mx-auto text-blue-400" />
                <p className="font-medium">VPN</p>
                <Badge variant="secondary">Ready</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Lock className="h-8 w-8 mx-auto text-primary" />
                <p className="font-medium">DNS Privacy</p>
                <Badge variant={wifi.dnsLeakPrevention ? "default" : "destructive"}>{wifi.dnsLeakPrevention ? "Protected" : "Exposed"}</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Connectivity Tests</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {diagnostics.map(d => (
                  <div key={d.test} className="flex items-center justify-between text-sm p-2 rounded border border-border/20">
                    <div className="flex items-center gap-2">
                      {d.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      <span>{d.test}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{d.time}</Badge>
                      <span className={`text-xs font-medium ${d.ok ? "text-emerald-500" : "text-amber-500"}`}>{d.result}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Self-Repair</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {help.getRemediationActions().map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleRepair(action.id)}
                    disabled={runningRepair === action.id}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/20 hover:bg-muted/30 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="w-7 h-7 rounded bg-muted/50 flex items-center justify-center shrink-0">
                      {runningRepair === action.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{action.label}</p>
                      <p className="text-[10px] text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help">
          <div className="grid gap-4 md:grid-cols-2">
            {help.getArticles().map(article => (
              <Card key={article.id}>
                <CardContent className="p-4 space-y-2">
                  <Badge variant="outline" className="text-xs">{article.area}</Badge>
                  <p className="text-sm font-medium">{article.title}</p>
                  <p className="text-xs text-muted-foreground">{article.summary}</p>
                  {article.steps && (
                    <ol className="text-xs text-muted-foreground space-y-1 pl-4 list-decimal">
                      {article.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
