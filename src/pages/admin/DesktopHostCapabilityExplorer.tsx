import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DESKTOP_CAPABILITIES, probeDesktopCapabilities, type CapabilityStatus } from "@/lib/runtime/desktop/desktop-host-capabilities";
import { DESKTOP_SECURITY_BOUNDARIES, getSecurityPostureSummary } from "@/lib/runtime/desktop/desktop-security-boundaries";
import { RELEASE_CHANNELS, getCurrentReleaseChannel } from "@/lib/runtime/desktop/desktop-release-channel-map";
import { isElectronRuntime } from "@/lib/runtime/desktop/desktop-runtime-detection";

const DesktopHostCapabilityExplorer = () => {
  const [capStatuses, setCapStatuses] = useState<Map<string, CapabilityStatus>>(new Map());
  const isDesktop = isElectronRuntime();
  const posture = getSecurityPostureSummary();
  const currentChannel = getCurrentReleaseChannel();

  useEffect(() => {
    setCapStatuses(probeDesktopCapabilities());
  }, []);

  const statusColors: Record<string, string> = {
    available: "bg-green-500/20 text-green-300",
    unavailable: "bg-red-500/20 text-red-300",
    degraded: "bg-yellow-500/20 text-yellow-300",
    unknown: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Desktop Host Capability Explorer</h1>
        <p className="text-muted-foreground">
          Runtime: {isDesktop ? "Electron Desktop" : "Web Browser"} | Channel: {currentChannel} | {DESKTOP_CAPABILITIES.length} capabilities
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Capabilities</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{DESKTOP_CAPABILITIES.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Available</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-400">{Array.from(capStatuses.values()).filter((s) => s === "available").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Security Boundaries</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{posture.totalBoundaries}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Verified</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-400">{posture.verifiedBoundaries}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Capabilities</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bridge Method</TableHead>
                <TableHead>Web Fallback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DESKTOP_CAPABILITIES.map((cap) => (
                <TableRow key={cap.id}>
                  <TableCell className="font-medium text-sm">{cap.name}</TableCell>
                  <TableCell><Badge variant="secondary">{cap.category}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[capStatuses.get(cap.id) || "unknown"]}>{capStatuses.get(cap.id) || "unknown"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{cap.bridgeMethod}</TableCell>
                  <TableCell className="text-xs max-w-32 truncate">{cap.webFallback || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security Boundaries</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boundary</TableHead>
                <TableHead>Enforcement</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Threats Mitigated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DESKTOP_SECURITY_BOUNDARIES.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-sm">{b.name}</TableCell>
                  <TableCell><Badge variant="secondary">{b.enforcement}</Badge></TableCell>
                  <TableCell>{b.verified ? <Badge className="bg-green-500/20 text-green-300">✓</Badge> : <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>}</TableCell>
                  <TableCell className="text-xs">{b.threatVectors.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Release Channels</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Auto-Update</TableHead>
                <TableHead>Force Update</TableHead>
                <TableHead>Telemetry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELEASE_CHANNELS.map((ch) => (
                <TableRow key={ch.id}>
                  <TableCell className="font-medium">{ch.name}{ch.id === currentChannel && <Badge className="ml-2 bg-primary/20 text-primary">Current</Badge>}</TableCell>
                  <TableCell className="text-xs">{ch.audience}</TableCell>
                  <TableCell>{ch.autoUpdate ? "✓" : "—"}</TableCell>
                  <TableCell>{ch.forceUpdateEnabled ? "✓" : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{ch.telemetryLevel}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopHostCapabilityExplorer;
