import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mobilePushRegistration, getMobileSyncHealth, MOBILE_PARITY_MAP, IOS_CAPABILITY_MATRIX, ANDROID_CAPABILITY_MATRIX, isCapacitorAvailable, getCapacitorPlatform, type PushRegistrationOutcome } from "@/lib/mobile-platform";

function StatusBadge({ status }: { status: string }) {
  const variant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    supported: "default",
    fallback: "secondary",
    roadmap: "outline",
    unsupported: "destructive",
    simulated: "secondary",
    "full-parity": "default",
    "degraded-parity": "secondary",
    "mobile-only": "outline",
    registered: "default",
    deferred: "outline",
  };
  return <Badge variant={variant[status] ?? "outline"}>{status}</Badge>;
}

export default function MobileTruthDashboard() {
  const [push, setPush] = useState<PushRegistrationOutcome | null>(null);
  const [sync, setSync] = useState(getMobileSyncHealth());
  const snapshot = mobilePushRegistration.snapshot();

  useEffect(() => {
    void mobilePushRegistration.register().then(setPush);
    const t = setInterval(() => setSync(getMobileSyncHealth()), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile Truth Dashboard</h1>
        <p className="text-muted-foreground">Honest runtime, push, sync, and parity state for iOS + Android.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Native Bridge</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capacitor</span>
              <StatusBadge status={isCapacitorAvailable() ? "supported" : "fallback"} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-mono">{getCapacitorPlatform()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Push</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transport</span>
              <span className="font-mono">{snapshot.transport ?? "n/a"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capability</span>
              <StatusBadge status={snapshot.capabilityStatus} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outcome</span>
              <StatusBadge status={push?.status ?? "deferred"} />
            </div>
            {push?.status === "deferred" && (
              <div className="text-xs text-muted-foreground">Reason: {push.reason}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Sync Queue</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Queued</span>
              <span className="font-mono">{sync.totalQueued}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed</span>
              <span className="font-mono">{sync.failedCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Conflicts</span>
              <span className="font-mono">{sync.conflictCount}</span>
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setSync(getMobileSyncHealth())}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Feature Parity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Desktop Equivalent</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOBILE_PARITY_MAP.map((p) => (
                <TableRow key={p.featureId}>
                  <TableCell className="font-mono text-xs">{p.featureId}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{p.desktopEquivalent ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>iOS Capabilities</CardTitle></CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Capability</TableHead><TableHead>Status</TableHead><TableHead>Min</TableHead></TableRow></TableHeader>
              <TableBody>
                {IOS_CAPABILITY_MATRIX.map((r) => (
                  <TableRow key={r.capability}>
                    <TableCell className="font-mono text-xs">{r.capability}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-xs">{r.minVersion ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Android Capabilities</CardTitle></CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Capability</TableHead><TableHead>Status</TableHead><TableHead>Min SDK</TableHead></TableRow></TableHeader>
              <TableBody>
                {ANDROID_CAPABILITY_MATRIX.map((r) => (
                  <TableRow key={r.capability}>
                    <TableCell className="font-mono text-xs">{r.capability}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="text-xs">{r.minSdk ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
