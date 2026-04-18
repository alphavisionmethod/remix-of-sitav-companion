// ═══════════════════════════════════════════════════════════════
// SITA OS — Device Mesh Fabric
// Cooperative multi-device ecosystem management
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/data/persistence/universal-service-persistence";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_KEY = "device-mesh";

// ── Types ────────────────────────────────────────────────────────

export type DeviceRole = "anchor" | "sensor" | "display" | "portable" | "companion";
export type ProximityStatus = "local" | "nearby" | "remote" | "offline";
export type DeviceCapability =
  | "keyboard" | "mouse" | "touch" | "biometric" | "camera"
  | "microphone" | "gps" | "nfc" | "bluetooth" | "compute"
  | "display_large" | "display_small" | "storage_large" | "battery";

export interface MeshPeer {
  id: string;
  deviceName: string;
  deviceType: string;
  role: DeviceRole;
  capabilities: DeviceCapability[];
  trustScore: number;
  proximityStatus: ProximityStatus;
  lastHandshake: string | null;
  meshGroup: string;
  isOnline: boolean;
  platform: string;
  osVersion: string | null;
  batteryLevel: number | null;
  networkType: string;
}

export interface HandoffRequest {
  taskId: string;
  fromDeviceId: string;
  toDeviceId: string;
  payload: Record<string, unknown>;
  preserveState: boolean;
}

export interface HandoffResult {
  success: boolean;
  taskId: string;
  fromDevice: string;
  toDevice: string;
  stateTransferred: boolean;
  resumeToken?: string;
}

export interface MeshTopology {
  peers: MeshPeer[];
  connections: Array<{ from: string; to: string; strength: number; latencyMs: number }>;
  anchor: MeshPeer | null;
  meshGroup: string;
  healthScore: number;
}

export interface DeviceMeshService {
  discoverPeers(): Promise<MeshPeer[]>;
  registerSelf(peer: Omit<MeshPeer, "id">): Promise<MeshPeer | null>;
  advertiseCapabilities(deviceId: string, caps: DeviceCapability[]): Promise<boolean>;
  requestHandoff(req: HandoffRequest): Promise<HandoffResult>;
  getDeviceRoles(): Map<string, DeviceRole>;
  getMeshTopology(): MeshTopology;
  setDeviceRole(deviceId: string, role: DeviceRole): void;
  removeDevice(deviceId: string): Promise<boolean>;
  getPeer(deviceId: string): MeshPeer | null;
  getOnlinePeers(): MeshPeer[];
  loadPersistedState(): Promise<void>;
}

// ── Implementation ───────────────────────────────────────────────

export function createDeviceMesh(): DeviceMeshService {
  let peers: MeshPeer[] = [];
  let topology: MeshTopology = {
    peers: [],
    connections: [],
    anchor: null,
    meshGroup: "default",
    healthScore: 1.0,
  };

  function rebuildTopology() {
    const onlinePeers = peers.filter(p => p.isOnline);
    const anchor = peers.find(p => p.role === "anchor") ?? onlinePeers[0] ?? null;

    const connections: MeshTopology["connections"] = [];
    if (anchor) {
      for (const peer of onlinePeers) {
        if (peer.id !== anchor.id) {
          const strength = peer.trustScore * (peer.proximityStatus === "local" ? 1.0 : peer.proximityStatus === "nearby" ? 0.7 : 0.4);
          connections.push({
            from: anchor.id,
            to: peer.id,
            strength,
            latencyMs: peer.proximityStatus === "local" ? 5 : peer.proximityStatus === "nearby" ? 50 : 200,
          });
        }
      }
    }

    const healthScore = onlinePeers.length === 0 ? 0 :
      onlinePeers.reduce((sum, p) => sum + p.trustScore, 0) / onlinePeers.length;

    topology = { peers: [...peers], connections, anchor, meshGroup: anchor?.meshGroup ?? "default", healthScore };
    debouncedSaveServiceState(SERVICE_KEY, { peers });
  }

  async function discoverPeers(): Promise<MeshPeer[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return peers;

    const { data, error } = await fromDynamicTable("device_mesh_peers")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      peers = (data as any[]).map(mapRowToPeer);
      rebuildTopology();
    }
    return peers;
  }

  async function registerSelf(peer: Omit<MeshPeer, "id">): Promise<MeshPeer | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await fromDynamicTable("device_mesh_peers")
      .insert({
        user_id: user.id,
        device_name: peer.deviceName,
        device_type: peer.deviceType,
        role: peer.role,
        capabilities: peer.capabilities,
        trust_score: peer.trustScore,
        proximity_status: peer.proximityStatus,
        last_handshake: new Date().toISOString(),
        mesh_group: peer.meshGroup,
        is_online: true,
        platform: peer.platform,
        os_version: peer.osVersion,
        battery_level: peer.batteryLevel,
        network_type: peer.networkType,
      })
      .select()
      .single();

    if (error) { console.error("[device-mesh] register:", error); return null; }
    const newPeer = mapRowToPeer(data as any);
    peers.push(newPeer);
    rebuildTopology();
    return newPeer;
  }

  async function advertiseCapabilities(deviceId: string, caps: DeviceCapability[]): Promise<boolean> {
    const { error } = await fromDynamicTable("device_mesh_peers")
      .update({ capabilities: caps })
      .eq("id", deviceId);
    if (error) return false;

    const peer = peers.find(p => p.id === deviceId);
    if (peer) { peer.capabilities = caps; rebuildTopology(); }
    return true;
  }

  async function requestHandoff(req: HandoffRequest): Promise<HandoffResult> {
    const fromPeer = peers.find(p => p.id === req.fromDeviceId);
    const toPeer = peers.find(p => p.id === req.toDeviceId);

    if (!toPeer || !toPeer.isOnline) {
      return { success: false, taskId: req.taskId, fromDevice: req.fromDeviceId, toDevice: req.toDeviceId, stateTransferred: false };
    }

    if (toPeer.trustScore < 0.3) {
      return { success: false, taskId: req.taskId, fromDevice: req.fromDeviceId, toDevice: req.toDeviceId, stateTransferred: false };
    }

    // Update handshake timestamps
    const now = new Date().toISOString();
    await fromDynamicTable("device_mesh_peers").update({ last_handshake: now }).eq("id", req.toDeviceId);
    if (fromPeer) fromPeer.lastHandshake = now;
    toPeer.lastHandshake = now;

    const resumeToken = `handoff_${req.taskId}_${Date.now()}`;
    rebuildTopology();

    return {
      success: true,
      taskId: req.taskId,
      fromDevice: req.fromDeviceId,
      toDevice: req.toDeviceId,
      stateTransferred: req.preserveState,
      resumeToken,
    };
  }

  function getDeviceRoles(): Map<string, DeviceRole> {
    const map = new Map<string, DeviceRole>();
    for (const p of peers) map.set(p.id, p.role);
    return map;
  }

  function getMeshTopology(): MeshTopology {
    return topology;
  }

  function setDeviceRole(deviceId: string, role: DeviceRole) {
    const peer = peers.find(p => p.id === deviceId);
    if (peer) { peer.role = role; rebuildTopology(); }
    fromDynamicTable("device_mesh_peers").update({ role }).eq("id", deviceId).then(() => {});
  }

  async function removeDevice(deviceId: string): Promise<boolean> {
    const { error } = await fromDynamicTable("device_mesh_peers").delete().eq("id", deviceId);
    if (error) return false;
    peers = peers.filter(p => p.id !== deviceId);
    rebuildTopology();
    return true;
  }

  function getPeer(deviceId: string): MeshPeer | null {
    return peers.find(p => p.id === deviceId) ?? null;
  }

  function getOnlinePeers(): MeshPeer[] {
    return peers.filter(p => p.isOnline);
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.peers && Array.isArray(saved.peers)) {
      peers = saved.peers as MeshPeer[];
      rebuildTopology();
    }
    // Also fetch fresh from DB
    await discoverPeers();
  }

  return {
    discoverPeers, registerSelf, advertiseCapabilities, requestHandoff,
    getDeviceRoles, getMeshTopology, setDeviceRole, removeDevice,
    getPeer, getOnlinePeers, loadPersistedState,
  };
}

// ── Helpers ──────────────────────────────────────────────────────

function mapRowToPeer(row: any): MeshPeer {
  return {
    id: row.id,
    deviceName: row.device_name,
    deviceType: row.device_type,
    role: row.role,
    capabilities: row.capabilities ?? [],
    trustScore: Number(row.trust_score ?? 0.5),
    proximityStatus: row.proximity_status ?? "remote",
    lastHandshake: row.last_handshake,
    meshGroup: row.mesh_group ?? "default",
    isOnline: row.is_online ?? false,
    platform: row.platform ?? "web",
    osVersion: row.os_version,
    batteryLevel: row.battery_level != null ? Number(row.battery_level) : null,
    networkType: row.network_type ?? "unknown",
  };
}
