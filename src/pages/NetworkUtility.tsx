import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wifi, Globe, Shield, Activity, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Clock, Server,
} from "lucide-react";

const connectorHealth = [
  { name: "Google Workspace", status: "connected" as const, latency: 42, lastSync: "2 min ago" },
  { name: "Stripe", status: "connected" as const, latency: 88, lastSync: "5 min ago" },
  { name: "QuickBooks", status: "degraded" as const, latency: 340, lastSync: "15 min ago" },
  { name: "Slack", status: "disconnected" as const, latency: null, lastSync: "Never" },
];

const statusIcon = {
  connected: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  disconnected: <XCircle className="h-4 w-4 text-destructive" />,
};

export default function NetworkUtility() {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <SitaPageHeader
        icon={<Wifi className="h-6 w-6" />}
        title="Network & Connectivity"
        subtitle="Connection health, sync status, and diagnostics"
      >
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1.5" /> Run Diagnostics
        </Button>
      </SitaPageHeader>

      {/* Connectivity overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-sm font-medium">Internet</p>
            <Badge variant="default" className="mt-1">Connected</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Server className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-sm font-medium">Supabase</p>
            <Badge variant="default" className="mt-1">Healthy</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium">Enterprise Trust</p>
            <Badge variant="secondary" className="mt-1">Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">Avg Latency</p>
            <p className="text-lg font-bold mt-1">67ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Connector sync health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connector Sync Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectorHealth.map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
              <div className="flex items-center gap-3">
                {statusIcon[c.status]}
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">Last sync: {c.lastSync}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.latency !== null && (
                  <Badge variant={c.latency > 200 ? "destructive" : "outline"}>
                    {c.latency}ms
                  </Badge>
                )}
                <Badge variant={
                  c.status === "connected" ? "default" :
                  c.status === "degraded" ? "secondary" : "outline"
                }>
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" /> Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { test: "DNS resolution", result: "OK", time: "12ms" },
              { test: "TLS handshake", result: "OK", time: "34ms" },
              { test: "API gateway", result: "OK", time: "48ms" },
              { test: "WebSocket connection", result: "OK", time: "22ms" },
              { test: "Realtime subscription", result: "OK", time: "56ms" },
            ].map((d) => (
              <div key={d.test} className="flex items-center justify-between text-sm p-2 rounded border border-border/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{d.test}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{d.time}</Badge>
                  <span className="text-emerald-500 text-xs font-medium">{d.result}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
