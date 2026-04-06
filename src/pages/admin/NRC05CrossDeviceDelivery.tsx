import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitorSmartphone, Smartphone, Watch, Monitor } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const NRC05CrossDeviceDelivery = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <MonitorSmartphone className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Cross-Device Delivery Review</h1>
        <p className="text-muted-foreground">How notifications are routed across surfaces based on presence and context</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { surface: "Desktop/Web", icon: Monitor, channels: ["In-app banner", "Browser notification", "Work queue", "Boardroom card"] },
        { surface: "Phone (iOS/Android)", icon: Smartphone, channels: ["Push notification", "Lock screen action", "App inbox", "Bubble/conversation"] },
        { surface: "Watch (Apple/Wear OS)", icon: Watch, channels: ["Haptic alert", "Glance card", "Micro-action", "Complication update"] },
      ].map((s) => (
        <Card key={s.surface}>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><s.icon className="h-4 w-4" /> {s.surface}</CardTitle></CardHeader>
          <CardContent className="text-xs space-y-1">
            {s.channels.map((c) => <div key={c} className="p-1.5 rounded border">{c}</div>)}
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Delivery Principles</CardTitle></CardHeader>
      <CardContent className="text-xs space-y-1">
        <p>• Never duplicate the same notification across all surfaces simultaneously</p>
        <p>• Route to the most appropriate device based on user presence</p>
        <p>• Respect focus mode / DND on each platform</p>
        <p>• Escalate across surfaces only when justified by urgency + time</p>
        <p>• Track delivery receipt per surface for coherent follow-up</p>
      </CardContent>
    </Card>
  </div>
);

export default NRC05CrossDeviceDelivery;
