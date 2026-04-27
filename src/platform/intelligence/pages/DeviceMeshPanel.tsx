import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Monitor, Smartphone, Tablet, Laptop, Wifi, WifiOff, Shield, ArrowRight, RefreshCw } from "lucide-react";
import { useOSOrchestration } from "@/platform/orchestration/hooks/useOSOrchestration";
import type { MeshPeer, DeviceRole } from "@/lib/services/device-mesh/index";

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
};

const ROLE_COLORS: Record<DeviceRole, string> = {
  anchor: "text-sita-purple border-sita-purple/30",
  sensor: "text-emerald-400 border-emerald-400/30",
  display: "text-blue-400 border-blue-400/30",
  portable: "text-amber-400 border-amber-400/30",
  companion: "text-sita-gold border-sita-gold/30",
};

export default function DeviceMeshPanel() {
  const os = useOSOrchestration();
  const topology = os.getMeshTopology();
  const onlinePeers = os.getOnlinePeers();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sita-purple/20">
            <Wifi className="h-6 w-6 text-sita-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Device Mesh</h1>
            <p className="text-sm text-muted-foreground">
              {onlinePeers.length} device{onlinePeers.length !== 1 ? "s" : ""} online · Health: {Math.round(topology.healthScore * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Mesh Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Devices" value={topology.peers.length} />
        <StatCard label="Online" value={onlinePeers.length} />
        <StatCard label="Connections" value={topology.connections.length} />
        <StatCard label="Health" value={`${Math.round(topology.healthScore * 100)}%`} />
      </div>

      {/* Anchor Device */}
      {topology.anchor && (
        <Card className="bg-gradient-to-r from-sita-purple/10 to-transparent border-sita-purple/20 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sita-purple/20">
              <Monitor className="h-6 w-6 text-sita-purple" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{topology.anchor.deviceName}</p>
                <Badge variant="outline" className="text-xs text-sita-purple border-sita-purple/30">Anchor</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Trust: {Math.round(topology.anchor.trustScore * 100)}% · {topology.anchor.platform}
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
              Online
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Device List */}
      <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">All Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {topology.peers.map((peer) => (
                <DeviceCard key={peer.id} peer={peer} onRoleChange={(role) => os.setDeviceRole(peer.id, role)} />
              ))}
              {topology.peers.length === 0 && (
                <div className="text-center py-12">
                  <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No devices registered</p>
                  <p className="text-xs text-muted-foreground mt-1">Devices appear when you sign in from different surfaces</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Connections */}
      {topology.connections.length > 0 && (
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-foreground">Active Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topology.connections.map((conn, i) => {
              const fromPeer = topology.peers.find(p => p.id === conn.from);
              const toPeer = topology.peers.find(p => p.id === conn.to);
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-foreground truncate max-w-[80px]">{fromPeer?.deviceName ?? "?"}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground truncate max-w-[80px]">{toPeer?.deviceName ?? "?"}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{conn.latencyMs}ms</Badge>
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-sita-purple"
                        style={{ width: `${conn.strength * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function DeviceCard({ peer, onRoleChange }: { peer: MeshPeer; onRoleChange: (role: DeviceRole) => void }) {
  const Icon = DEVICE_ICONS[peer.deviceType] ?? Monitor;
  const roleColor = ROLE_COLORS[peer.role] ?? "text-muted-foreground border-white/[0.06]";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="p-2 rounded-lg bg-white/[0.04]">
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{peer.deviceName}</p>
          <Badge variant="outline" className={`text-xs capitalize ${roleColor}`}>{peer.role}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{peer.platform}</span>
          {peer.batteryLevel != null && (
            <span className="text-xs text-muted-foreground">🔋 {peer.batteryLevel}%</span>
          )}
          <span className="text-xs text-muted-foreground capitalize">{peer.proximityStatus}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${peer.isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
        <Shield className={`h-3.5 w-3.5 ${peer.trustScore > 0.7 ? "text-emerald-400" : peer.trustScore > 0.4 ? "text-amber-400" : "text-red-400"}`} />
      </div>
    </div>
  );
}
