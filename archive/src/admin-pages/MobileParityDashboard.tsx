// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Parity Admin Dashboard
// Truth surface: capability matrix, parity, sync health, push status.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MOBILE_PARITY_MAP,
  getMobileSyncHealth,
  getIOSCapability,
  getAndroidCapability,
  MOBILE_PLATFORM_FLAGS,
  type MobileCapabilityId,
  type MobileCapabilityStatus,
  type ParityStatus,
} from "@/lib/mobile-platform";
import { resolveParity } from "@/lib/mobile-platform/runtime/mobile-parity-resolver";

const CAPABILITY_IDS: MobileCapabilityId[] = [
  "biometric.faceid",
  "biometric.touchid",
  "biometric.fingerprint",
  "secure-storage.keychain",
  "secure-storage.keystore",
  "push.apns",
  "push.fcm",
  "push.web",
  "background.refresh",
  "background.fetch",
  "background.processing",
  "deep-link.universal",
  "deep-link.app-link",
  "deep-link.custom-scheme",
  "lifecycle.state-restore",
  "offline.durable-queue",
  "offline.optimistic-mutation",
  "device-trust.attestation",
  "device-trust.integrity",
  "permissions.notifications",
  "permissions.camera",
  "permissions.photos",
];

function capabilityVariant(status: MobileCapabilityStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "supported": return "default";
    case "fallback":  return "secondary";
    case "simulated": return "outline";
    case "roadmap":   return "outline";
    case "unsupported": return "destructive";
    default: return "secondary";
  }
}

function parityVariant(status: ParityStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "full-parity":     return "default";
    case "degraded-parity": return "secondary";
    case "mobile-only":     return "outline";
    case "unsupported":     return "destructive";
  }
}

export default function MobileParityDashboard() {
  const [health, setHealth] = useState(() => getMobileSyncHealth());

  useEffect(() => {
    const i = setInterval(() => setHealth(getMobileSyncHealth()), 2000);
    return () => clearInterval(i);
  }, []);

  const rows = useMemo(() => CAPABILITY_IDS.map((cap) => ({
    cap,
    ios: getIOSCapability(cap),
    android: getAndroidCapability(cap),
  })), []);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mobile Parity & Health</h1>
        <p className="text-muted-foreground">
          Truth view of iOS / Android capability, feature parity, sync queue, and push channel status.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Queue depth</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{health.totalQueued}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Failed</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{health.failedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Conflicts</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-semibold">{health.conflictCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Oldest queued</CardDescription></CardHeader>
          <CardContent>
            <div className="text-sm">{health.oldestQueuedAt ? new Date(health.oldestQueuedAt).toLocaleString() : "—"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="capabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="capabilities">Capability Matrix</TabsTrigger>
          <TabsTrigger value="parity">Feature Parity</TabsTrigger>
          <TabsTrigger value="push">Push Channels</TabsTrigger>
          <TabsTrigger value="sync">Sync by Domain</TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities">
          <Card>
            <CardHeader>
              <CardTitle>iOS / Android capability truth</CardTitle>
              <CardDescription>Status, fallback, and notes per capability per OS.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Capability</th>
                    <th className="py-2 pr-4">iOS</th>
                    <th className="py-2 pr-4">Android</th>
                    <th className="py-2 pr-4">iOS note</th>
                    <th className="py-2">Android note</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.cap} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{r.cap}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={capabilityVariant(r.ios?.status ?? "unsupported")}>
                          {r.ios?.status ?? "unsupported"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={capabilityVariant(r.android?.status ?? "unsupported")}>
                          {r.android?.status ?? "unsupported"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.ios?.note || "—"}</td>
                      <td className="py-2 text-muted-foreground">{r.android?.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parity">
          <Card>
            <CardHeader>
              <CardTitle>Feature parity vs desktop / web</CardTitle>
              <CardDescription>Honest claims only. Degraded means it works but with reduced UX.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOBILE_PARITY_MAP.map((r) => {
                const parity = resolveParity(r.featureId);
                return (
                  <div key={r.featureId} className="flex items-start justify-between gap-4 border rounded-md p-3">
                    <div>
                      <div className="font-medium">{r.featureId}</div>
                      <div className="text-xs text-muted-foreground">{r.note || "—"}</div>
                      {r.desktopEquivalent && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Desktop equivalent: <span className="font-mono">{r.desktopEquivalent}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={parityVariant(parity?.status ?? r.status)}>
                      {parity?.status ?? r.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push">
          <Card>
            <CardHeader>
              <CardTitle>Push channel status</CardTitle>
              <CardDescription>Kill-switch + capability resolution per transport.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">APNs (iOS)</div>
                  <div className="text-xs text-muted-foreground">
                    Apple Developer membership required. Currently on roadmap.
                  </div>
                </div>
                <Badge variant={MOBILE_PLATFORM_FLAGS.apnsDisabled ? "outline" : "default"}>
                  {MOBILE_PLATFORM_FLAGS.apnsDisabled ? "roadmap" : "active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">FCM (Android)</div>
                  <div className="text-xs text-muted-foreground">
                    Firebase service-account credentials pending.
                  </div>
                </div>
                <Badge variant={MOBILE_PLATFORM_FLAGS.fcmDisabled ? "outline" : "default"}>
                  {MOBILE_PLATFORM_FLAGS.fcmDisabled ? "roadmap" : "active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">Web push (VAPID)</div>
                  <div className="text-xs text-muted-foreground">
                    Active per platform constraint. iOS 16.4+ requires PWA install.
                  </div>
                </div>
                <Badge>active</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Mobile sync queue by domain</CardTitle>
              <CardDescription>Live snapshot of queued mutations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(health.byDomain).map(([dom, count]) => (
                  <div key={dom} className="border rounded-md p-3">
                    <div className="text-xs uppercase text-muted-foreground">{dom}</div>
                    <div className="text-xl font-semibold">{count}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Sampled at {new Date(health.lastSampledAt).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
