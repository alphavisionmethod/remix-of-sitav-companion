import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Battery, Wifi, HardDrive, Shield, Cpu, RefreshCw } from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

const MOCK_DEVICE = {
  name: "SITA Environment — Primary",
  platform: navigator.platform,
  cores: navigator.hardwareConcurrency,
  online: navigator.onLine,
  language: navigator.language,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  pixelRatio: window.devicePixelRatio,
  storage: "Available",
  securityStatus: "Standard",
};

const DeviceSettings = () => {
  
  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Device</h1>
        <p className="text-muted-foreground mt-1">Information about this environment's hardware and capabilities</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Monitor className="h-4 w-4" /> Device Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Device Name</p><p className="font-medium">{MOCK_DEVICE.name}</p></div>
            <div><p className="text-muted-foreground">Platform</p><p className="font-medium">{MOCK_DEVICE.platform}</p></div>
            <div><p className="text-muted-foreground">Display</p><p className="font-medium">{MOCK_DEVICE.screenWidth}×{MOCK_DEVICE.screenHeight} @{MOCK_DEVICE.pixelRatio}x</p></div>
            <div><p className="text-muted-foreground">Language</p><p className="font-medium">{MOCK_DEVICE.language}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4" /> Performance</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">CPU Cores</span><span className="font-medium">{MOCK_DEVICE.cores}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><Badge variant="outline">{MOCK_DEVICE.cores >= 8 ? "High" : MOCK_DEVICE.cores >= 4 ? "Medium" : "Low"}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wifi className="h-4 w-4" /> Network</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={MOCK_DEVICE.online ? "default" : "destructive"}>{MOCK_DEVICE.online ? "Online" : "Offline"}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4" /> Storage</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{MOCK_DEVICE.storage}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Protection</span><Badge variant="outline">{MOCK_DEVICE.securityStatus}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Check for Updates</p>
            <p className="text-xs text-muted-foreground">Verify system components are current</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><RefreshCw className="h-3 w-3" /> Check Now</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceSettings;
