import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield, Smartphone, AlertTriangle, Pause, LogOut, Lock, Eye, CheckCircle
} from "lucide-react";
import { cloudDeviceService } from "@/platform/cloud/cloud-device-service";
import { toast } from "sonner";

export function CloudDeviceSafety() {
  const devices = cloudDeviceService.getDemoDevices();
  const [syncPaused, setSyncPaused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Emergency Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Safety Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={syncPaused ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => { setSyncPaused(!syncPaused); toast.success(syncPaused ? "Sync resumed" : "Sync paused — emergency mode active"); }}
          >
            <Pause className="h-4 w-4 mr-2" />
            {syncPaused ? "⚠️ Sync Paused — Click to Resume" : "Emergency Sync Pause"}
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("All sessions revoked")}>
            <LogOut className="h-4 w-4 mr-2" /> Revoke All Sessions
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Recovery key displayed")}>
            <Lock className="h-4 w-4 mr-2" /> View Recovery Key
          </Button>
        </CardContent>
      </Card>

      {/* Device Trust */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" /> Device Trust & Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {devices.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
              <div className="flex items-center gap-3">
                <span className="text-lg">{cloudDeviceService.getPlatformIcon(d.platform)}</span>
                <div>
                  <p className="text-sm font-medium">{d.deviceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.isCurrent ? "This device" : `Last seen ${new Date(d.lastSeenAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.isCurrent && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                )}
                <Badge variant={cloudDeviceService.getTrustBadgeVariant(d.trustState)} className="text-xs capitalize">
                  {d.trustState}
                </Badge>
                {!d.isCurrent && (
                  <Button size="sm" variant="ghost" className="text-xs text-red-400" onClick={() => toast.info(`Revoked ${d.deviceName}`)}>
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suspicious Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/20">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-foreground">No suspicious activity detected</p>
              <p className="text-xs text-muted-foreground">All devices and sessions look normal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
