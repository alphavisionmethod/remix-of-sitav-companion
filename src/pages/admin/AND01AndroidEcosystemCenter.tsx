import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Watch, Shield, Heart, Wifi } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const AND01AndroidEcosystemCenter = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Smartphone className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Android Ecosystem Center</h1>
        <p className="text-muted-foreground">Android phone, tablet, Wear OS, trust, and Health Connect</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title: "Android Phone Shell", stage: "planned", icon: Smartphone, desc: "Primary Android surface — Material Design shell" },
        { title: "Wear OS", stage: "planned", icon: Watch, desc: "Tiles, complications, micro-actions" },
        { title: "Android Device Trust", stage: "planned", icon: Shield, desc: "Biometric, keystore, SafetyNet verification" },
        { title: "Android Push (FCM)", stage: "planned", icon: Wifi, desc: "FCM data/notification channels, DND awareness" },
        { title: "Health Connect", stage: "planned", icon: Heart, desc: "Android health signal path with consent" },
      ].map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><item.icon className="h-4 w-4" /> {item.title}</CardTitle>
              <Badge variant="secondary">{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">{item.desc}</p></CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Android Capabilities</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {["android_mobile_shell", "wearos_surface", "android_push_channel", "android_device_trust", "android_health_readiness"].map((cap) => (
            <div key={cap} className="p-2 rounded border bg-muted/30 font-mono">{cap}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AND01AndroidEcosystemCenter;
