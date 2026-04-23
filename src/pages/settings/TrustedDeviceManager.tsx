import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Monitor, Tablet, Shield, Trash2, Clock } from "lucide-react";

const MOCK_DEVICES = [
  { id: "1", name: "This Device", type: "desktop" as const, lastActive: "Now", trusted: true, current: true },
  { id: "2", name: "iPhone 15 Pro", type: "phone" as const, lastActive: "2 hours ago", trusted: true, current: false },
  { id: "3", name: "iPad Air", type: "tablet" as const, lastActive: "3 days ago", trusted: false, current: false },
];

const deviceIcon = (type: "desktop" | "phone" | "tablet") => {
  if (type === "phone") return <Smartphone className="h-5 w-5" />;
  if (type === "tablet") return <Tablet className="h-5 w-5" />;
  return <Monitor className="h-5 w-5" />;
};

const TrustedDeviceManager = () => {
  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Trusted Devices</h1>
        <p className="text-muted-foreground mt-1">Manage devices that can access your SITA environment</p>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">What are trusted devices?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Trusted devices can approve high-sensitivity actions, receive push notifications for approvals,
              and act as secondary authentication factors. Only trust devices you physically control.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(MOCK_DEVICES).map(device => (
          <Card key={device.id}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-muted">{deviceIcon(device.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{device.name}</p>
                  {device.current && <Badge variant="default" className="text-xs">Current</Badge>}
                  {device.trusted && !device.current && <Badge variant="outline" className="text-xs text-emerald-600">Trusted</Badge>}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> Last active: {device.lastActive}
                </p>
              </div>
              {!device.current && (
                <div className="flex gap-2">
                  {!device.trusted && <Button variant="outline" size="sm">Trust</Button>}
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full gap-2">
        <Smartphone className="h-4 w-4" /> Enroll New Device
      </Button>
    </div>
  );
};

export default TrustedDeviceManager;
