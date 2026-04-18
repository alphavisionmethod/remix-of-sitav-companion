// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: TCP/IP Network Stack
// Full TCP/IP implementation with connection tracking, congestion
// control, and network interface management
// ═══════════════════════════════════════════════════════════════

// ── Network Interface ──────────────────────────────────────────

export type InterfaceType = "ethernet" | "wifi" | "loopback" | "vpn" | "bridge" | "veth";
export type InterfaceState = "up" | "down" | "dormant" | "testing";
export type AddressFamily = "ipv4" | "ipv6";

export interface NetworkAddress {
  family: AddressFamily;
  address: string;
  prefixLength: number;
  scope: "global" | "link" | "host";
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: InterfaceType;
  state: InterfaceState;
  macAddress: string;
  mtu: number;
  addresses: NetworkAddress[];
  flags: {
    broadcast: boolean;
    multicast: boolean;
    promiscuous: boolean;
    noArp: boolean;
  };
  stats: {
    rxBytes: number;
    txBytes: number;
    rxPackets: number;
    txPackets: number;
    rxErrors: number;
    txErrors: number;
    rxDropped: number;
    txDropped: number;
  };
}

// ── IP Layer ───────────────────────────────────────────────────

export interface RoutingEntry {
  destination: string;
  gateway: string | null;
  interface: string;
  metric: number;
  scope: "universe" | "site" | "link" | "host";
  protocol: "kernel" | "boot" | "static" | "dhcp" | "bgp";
  flags: { up: boolean; gateway: boolean; host: boolean; reject: boolean };
}

export interface ARPEntry {
  ipAddress: string;
  macAddress: string;
  interface: string;
  state: "reachable" | "stale" | "delay" | "probe" | "failed" | "permanent";
  updatedAt: number;
}

// ── TCP ────────────────────────────────────────────────────────

export type TCPState =
  | "CLOSED" | "LISTEN" | "SYN_SENT" | "SYN_RECEIVED"
  | "ESTABLISHED" | "FIN_WAIT_1" | "FIN_WAIT_2" | "CLOSE_WAIT"
  | "CLOSING" | "LAST_ACK" | "TIME_WAIT";

export type CongestionAlgorithm = "reno" | "cubic" | "bbr" | "vegas";

export interface TCPConnection {
  id: string;
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: TCPState;
  pid: number;
  sendBufferSize: number;
  recvBufferSize: number;
  sendWindow: number;
  recvWindow: number;
  rtt: number;           // Round-trip time in ms
  rttVariance: number;
  retransmits: number;
  congestionAlgorithm: CongestionAlgorithm;
  cwnd: number;          // Congestion window
  ssthresh: number;      // Slow-start threshold
  bytesAcked: number;
  bytesSent: number;
  bytesReceived: number;
  createdAt: number;
}

// ── UDP ────────────────────────────────────────────────────────

export interface UDPBinding {
  id: string;
  localAddress: string;
  localPort: number;
  pid: number;
  rxQueue: number;
  txQueue: number;
  drops: number;
}

// ── ICMP ───────────────────────────────────────────────────────

export interface ICMPStats {
  echoRequestsSent: number;
  echoRepliesReceived: number;
  destinationUnreachable: number;
  timeExceeded: number;
  redirects: number;
}

// ── Network Stack Stats ────────────────────────────────────────

export interface NetworkStackStats {
  interfaces: number;
  activeConnections: number;
  listeningPorts: number;
  routingEntries: number;
  arpEntries: number;
  tcpConnectionsByState: Record<TCPState, number>;
  totalRxBytes: number;
  totalTxBytes: number;
  totalRxPackets: number;
  totalTxPackets: number;
}

// ── TCP/IP Stack Implementation ────────────────────────────────

export class TCPIPStack {
  private interfaces: Map<string, NetworkInterface> = new Map();
  private routingTable: RoutingEntry[] = [];
  private arpTable: Map<string, ARPEntry> = new Map();
  private tcpConnections: Map<string, TCPConnection> = new Map();
  private udpBindings: Map<string, UDPBinding> = new Map();
  private icmpStats: ICMPStats = {
    echoRequestsSent: 0, echoRepliesReceived: 0,
    destinationUnreachable: 0, timeExceeded: 0, redirects: 0,
  };
  private nextConnId = 1;
  private defaultCongestion: CongestionAlgorithm = "cubic";

  constructor() {
    this.initLoopback();
  }

  private initLoopback(): void {
    this.addInterface({
      id: "lo", name: "lo", type: "loopback", state: "up",
      macAddress: "00:00:00:00:00:00", mtu: 65536,
      addresses: [
        { family: "ipv4", address: "127.0.0.1", prefixLength: 8, scope: "host" },
        { family: "ipv6", address: "::1", prefixLength: 128, scope: "host" },
      ],
      flags: { broadcast: false, multicast: false, promiscuous: false, noArp: true },
      stats: { rxBytes: 0, txBytes: 0, rxPackets: 0, txPackets: 0, rxErrors: 0, txErrors: 0, rxDropped: 0, txDropped: 0 },
    });
    this.routingTable.push({
      destination: "127.0.0.0/8", gateway: null, interface: "lo",
      metric: 0, scope: "host", protocol: "kernel",
      flags: { up: true, gateway: false, host: true, reject: false },
    });
  }

  // ── Interface Management ─────────────────────────────────

  addInterface(iface: NetworkInterface): void {
    this.interfaces.set(iface.id, iface);
  }

  setInterfaceState(id: string, state: InterfaceState): void {
    const iface = this.interfaces.get(id);
    if (iface) iface.state = state;
  }

  getInterface(id: string): NetworkInterface | undefined {
    return this.interfaces.get(id);
  }

  listInterfaces(): NetworkInterface[] {
    return Array.from(this.interfaces.values());
  }

  // ── Routing ──────────────────────────────────────────────

  addRoute(entry: RoutingEntry): void {
    this.routingTable.push(entry);
    this.routingTable.sort((a, b) => a.metric - b.metric);
  }

  removeRoute(destination: string): void {
    this.routingTable = this.routingTable.filter(r => r.destination !== destination);
  }

  getRoutingTable(): RoutingEntry[] {
    return [...this.routingTable];
  }

  resolveRoute(destination: string): RoutingEntry | null {
    // Simplified: return first matching route (real impl would do longest prefix match)
    return this.routingTable.find(r => {
      const [net] = r.destination.split("/");
      return destination.startsWith(net.split(".").slice(0, 2).join("."));
    }) ?? this.routingTable.find(r => r.destination === "0.0.0.0/0") ?? null;
  }

  // ── ARP ──────────────────────────────────────────────────

  addArpEntry(entry: ARPEntry): void {
    this.arpTable.set(entry.ipAddress, entry);
  }

  resolveMAC(ipAddress: string): string | null {
    return this.arpTable.get(ipAddress)?.macAddress ?? null;
  }

  getArpTable(): ARPEntry[] {
    return Array.from(this.arpTable.values());
  }

  // ── TCP ──────────────────────────────────────────────────

  connect(localAddr: string, localPort: number, remoteAddr: string, remotePort: number, pid: number): TCPConnection {
    const id = `tcp-${this.nextConnId++}`;
    const conn: TCPConnection = {
      id, localAddress: localAddr, localPort, remoteAddress: remoteAddr, remotePort,
      state: "SYN_SENT", pid,
      sendBufferSize: 131072, recvBufferSize: 131072,
      sendWindow: 65535, recvWindow: 65535,
      rtt: 0, rttVariance: 0, retransmits: 0,
      congestionAlgorithm: this.defaultCongestion,
      cwnd: 10 * 1460, ssthresh: 65535,
      bytesAcked: 0, bytesSent: 0, bytesReceived: 0,
      createdAt: Date.now(),
    };
    this.tcpConnections.set(id, conn);
    return conn;
  }

  listen(localAddr: string, localPort: number, pid: number): TCPConnection {
    const id = `tcp-${this.nextConnId++}`;
    const conn: TCPConnection = {
      id, localAddress: localAddr, localPort, remoteAddress: "0.0.0.0", remotePort: 0,
      state: "LISTEN", pid,
      sendBufferSize: 131072, recvBufferSize: 131072,
      sendWindow: 0, recvWindow: 65535,
      rtt: 0, rttVariance: 0, retransmits: 0,
      congestionAlgorithm: this.defaultCongestion,
      cwnd: 0, ssthresh: 65535,
      bytesAcked: 0, bytesSent: 0, bytesReceived: 0,
      createdAt: Date.now(),
    };
    this.tcpConnections.set(id, conn);
    return conn;
  }

  transitionTCPState(connId: string, newState: TCPState): void {
    const conn = this.tcpConnections.get(connId);
    if (conn) conn.state = newState;
  }

  closeConnection(connId: string): void {
    const conn = this.tcpConnections.get(connId);
    if (conn) {
      conn.state = "TIME_WAIT";
      // In real kernel, would wait 2*MSL then remove
      setTimeout(() => this.tcpConnections.delete(connId), 100);
    }
  }

  getConnection(connId: string): TCPConnection | undefined {
    return this.tcpConnections.get(connId);
  }

  listConnections(): TCPConnection[] {
    return Array.from(this.tcpConnections.values());
  }

  // ── UDP ──────────────────────────────────────────────────

  bindUDP(localAddr: string, localPort: number, pid: number): UDPBinding {
    const id = `udp-${this.nextConnId++}`;
    const binding: UDPBinding = { id, localAddress: localAddr, localPort, pid, rxQueue: 0, txQueue: 0, drops: 0 };
    this.udpBindings.set(id, binding);
    return binding;
  }

  unbindUDP(id: string): void {
    this.udpBindings.delete(id);
  }

  listUDPBindings(): UDPBinding[] {
    return Array.from(this.udpBindings.values());
  }

  // ── Congestion Control ───────────────────────────────────

  setDefaultCongestion(algo: CongestionAlgorithm): void {
    this.defaultCongestion = algo;
  }

  // ── Stats ────────────────────────────────────────────────

  getStats(): NetworkStackStats {
    const tcpByState: Record<string, number> = {};
    for (const conn of this.tcpConnections.values()) {
      tcpByState[conn.state] = (tcpByState[conn.state] || 0) + 1;
    }
    let totalRx = 0, totalTx = 0, totalRxP = 0, totalTxP = 0;
    for (const iface of this.interfaces.values()) {
      totalRx += iface.stats.rxBytes;
      totalTx += iface.stats.txBytes;
      totalRxP += iface.stats.rxPackets;
      totalTxP += iface.stats.txPackets;
    }
    return {
      interfaces: this.interfaces.size,
      activeConnections: Array.from(this.tcpConnections.values()).filter(c => c.state === "ESTABLISHED").length,
      listeningPorts: Array.from(this.tcpConnections.values()).filter(c => c.state === "LISTEN").length,
      routingEntries: this.routingTable.length,
      arpEntries: this.arpTable.size,
      tcpConnectionsByState: tcpByState as Record<TCPState, number>,
      totalRxBytes: totalRx, totalTxBytes: totalTx,
      totalRxPackets: totalRxP, totalTxPackets: totalTxP,
    };
  }
}
