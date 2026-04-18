// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: VPN Tunnel Manager
// WireGuard-style tunnel management with key exchange
// ═══════════════════════════════════════════════════════════════

// ── Tunnel Types ───────────────────────────────────────────────

export type VPNProtocol = "wireguard" | "ipsec" | "openvpn" | "sita-tunnel";
export type TunnelState = "inactive" | "connecting" | "active" | "reconnecting" | "failed" | "disabled";
export type TunnelAuthMethod = "preshared-key" | "certificate" | "eap" | "public-key";

// ── Peer Configuration ─────────────────────────────────────────

export interface VPNPeer {
  id: string;
  publicKey: string;
  presharedKey: string | null;
  endpoint: string | null;          // host:port
  allowedIPs: string[];             // CIDR list
  keepAliveInterval: number;        // seconds, 0 = disabled
  lastHandshake: number | null;     // timestamp
  rxBytes: number;
  txBytes: number;
}

// ── Tunnel Configuration ───────────────────────────────────────

export interface VPNTunnel {
  id: string;
  name: string;
  protocol: VPNProtocol;
  state: TunnelState;
  interface: string;               // virtual network interface name
  listenPort: number;
  privateKey: string;              // Would be in kernel secure memory
  publicKey: string;
  addresses: string[];             // Tunnel addresses (CIDR)
  dns: string[];
  mtu: number;
  peers: VPNPeer[];
  authMethod: TunnelAuthMethod;
  // Traffic stats
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  // Timing
  connectedAt: number | null;
  lastActivity: number | null;
  createdAt: number;
  // Security
  fwmark: number | null;
  routingTable: number | null;     // Custom routing table ID
  killSwitch: boolean;             // Block traffic if tunnel drops
}

// ── Split Tunneling ────────────────────────────────────────────

export interface SplitTunnelRule {
  id: string;
  tunnelId: string;
  type: "include" | "exclude";
  target: string;                  // CIDR, domain, or app ID
  targetType: "cidr" | "domain" | "application";
}

// ── VPN Stats ──────────────────────────────────────────────────

export interface VPNStats {
  totalTunnels: number;
  activeTunnels: number;
  totalPeers: number;
  connectedPeers: number;
  totalRxBytes: number;
  totalTxBytes: number;
  splitTunnelRules: number;
}

// ── VPN Manager Implementation ─────────────────────────────────

export class VPNManager {
  private tunnels: Map<string, VPNTunnel> = new Map();
  private splitRules: Map<string, SplitTunnelRule> = new Map();
  private nextId = 1;

  createTunnel(config: {
    name: string;
    protocol: VPNProtocol;
    listenPort: number;
    addresses: string[];
    dns?: string[];
    mtu?: number;
    authMethod?: TunnelAuthMethod;
    killSwitch?: boolean;
  }): VPNTunnel {
    const id = `vpn-${this.nextId++}`;
    // Generate simulated keys
    const privateKey = this.generateKey();
    const publicKey = this.derivePublicKey(privateKey);
    const tunnel: VPNTunnel = {
      id, name: config.name, protocol: config.protocol,
      state: "inactive", interface: `wg${this.nextId - 1}`,
      listenPort: config.listenPort,
      privateKey, publicKey,
      addresses: config.addresses,
      dns: config.dns ?? ["1.1.1.1", "1.0.0.1"],
      mtu: config.mtu ?? 1420,
      peers: [],
      authMethod: config.authMethod ?? "public-key",
      rxBytes: 0, txBytes: 0, rxPackets: 0, txPackets: 0,
      connectedAt: null, lastActivity: null, createdAt: Date.now(),
      fwmark: null, routingTable: null,
      killSwitch: config.killSwitch ?? false,
    };
    this.tunnels.set(id, tunnel);
    return tunnel;
  }

  removeTunnel(id: string): boolean {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return false;
    if (tunnel.state === "active") this.deactivate(id);
    this.tunnels.delete(id);
    // Remove associated split rules
    for (const [ruleId, rule] of this.splitRules) {
      if (rule.tunnelId === id) this.splitRules.delete(ruleId);
    }
    return true;
  }

  addPeer(tunnelId: string, peer: Omit<VPNPeer, "id" | "rxBytes" | "txBytes" | "lastHandshake">): VPNPeer | null {
    const tunnel = this.tunnels.get(tunnelId);
    if (!tunnel) return null;
    const fullPeer: VPNPeer = {
      ...peer, id: `peer-${this.nextId++}`,
      rxBytes: 0, txBytes: 0, lastHandshake: null,
    };
    tunnel.peers.push(fullPeer);
    return fullPeer;
  }

  removePeer(tunnelId: string, peerId: string): boolean {
    const tunnel = this.tunnels.get(tunnelId);
    if (!tunnel) return false;
    const idx = tunnel.peers.findIndex(p => p.id === peerId);
    if (idx === -1) return false;
    tunnel.peers.splice(idx, 1);
    return true;
  }

  activate(id: string): boolean {
    const tunnel = this.tunnels.get(id);
    if (!tunnel || tunnel.state === "active") return false;
    tunnel.state = "connecting";
    // Simulate handshake
    tunnel.state = "active";
    tunnel.connectedAt = Date.now();
    tunnel.lastActivity = Date.now();
    for (const peer of tunnel.peers) {
      peer.lastHandshake = Date.now();
    }
    return true;
  }

  deactivate(id: string): boolean {
    const tunnel = this.tunnels.get(id);
    if (!tunnel || tunnel.state === "inactive") return false;
    tunnel.state = "inactive";
    tunnel.connectedAt = null;
    return true;
  }

  // ── Split Tunneling ──────────────────────────────────────

  addSplitRule(rule: Omit<SplitTunnelRule, "id">): SplitTunnelRule {
    const id = `split-${this.nextId++}`;
    const full: SplitTunnelRule = { ...rule, id };
    this.splitRules.set(id, full);
    return full;
  }

  removeSplitRule(id: string): boolean {
    return this.splitRules.delete(id);
  }

  getSplitRules(tunnelId?: string): SplitTunnelRule[] {
    const all = Array.from(this.splitRules.values());
    return tunnelId ? all.filter(r => r.tunnelId === tunnelId) : all;
  }

  // ── Accessors ────────────────────────────────────────────

  getTunnel(id: string): VPNTunnel | undefined {
    return this.tunnels.get(id);
  }

  listTunnels(): VPNTunnel[] {
    return Array.from(this.tunnels.values());
  }

  // ── Helpers ──────────────────────────────────────────────

  private generateKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  private derivePublicKey(privateKey: string): string {
    // Simulated derivation — in real kernel, Curve25519
    let hash = 0;
    for (let i = 0; i < privateKey.length; i++) {
      hash = ((hash << 5) - hash + privateKey.charCodeAt(i)) | 0;
    }
    return this.generateKey(); // Simplified
  }

  // ── Stats ────────────────────────────────────────────────

  getStats(): VPNStats {
    let activeTunnels = 0, totalPeers = 0, connectedPeers = 0, rx = 0, tx = 0;
    for (const t of this.tunnels.values()) {
      if (t.state === "active") activeTunnels++;
      totalPeers += t.peers.length;
      connectedPeers += t.peers.filter(p => p.lastHandshake !== null).length;
      rx += t.rxBytes;
      tx += t.txBytes;
    }
    return {
      totalTunnels: this.tunnels.size, activeTunnels,
      totalPeers, connectedPeers,
      totalRxBytes: rx, totalTxBytes: tx,
      splitTunnelRules: this.splitRules.size,
    };
  }
}
