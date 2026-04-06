import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Smartphone, Watch, Shield, Heart, Wifi } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const APL01AppleEcosystemCenter = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <Apple className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Ecosystem Center</h1>
        <p className="text-muted-foreground">Unified view of Apple surfaces, identity, trust, and health readiness</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title: "iPhone Shell", stage: "alpha", icon: Smartphone, desc: "Primary mobile surface — task, approval, advisor flows" },
        { title: "iPad Shell", stage: "planned", icon: Smartphone, desc: "Tablet surface — expanded layouts, sidebar navigation" },
        { title: "Apple Watch", stage: "planned", icon: Watch, desc: "Glance cards, micro-approvals, haptic routing" },
        { title: "Sign in with Apple", stage: "planned", icon: Shield, desc: "Identity provider, linked accounts, session semantics" },
        { title: "Apple Health / HealthKit", stage: "planned", icon: Heart, desc: "Readiness signals, consent-driven health integration" },
        { title: "Apple Continuity", stage: "planned", icon: Wifi, desc: "Handoff, Universal Clipboard, cross-device flows" },
      ].map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <item.icon className="h-4 w-4" /> {item.title}
              </CardTitle>
              <Badge variant={item.stage === "alpha" ? "default" : "secondary"}>{item.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">{item.desc}</p></CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Apple Provider Family</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {["apple_identity", "apple_mobile_shell", "apple_watch_surface", "apple_health_readiness", "apple_push_channel", "apple_device_trust", "apple_continuity"].map((cap) => (
            <div key={cap} className="p-2 rounded border bg-muted/30">
              <span className="font-mono">{cap}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default APL01AppleEcosystemCenter;
