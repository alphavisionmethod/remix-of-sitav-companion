// ═══════════════════════════════════════════════════════════════
// SITA OS — Hybrid Microkernel: Socket API
// BSD-style socket abstraction over TCP/IP stack
// ═══════════════════════════════════════════════════════════════

// ── Socket Types ───────────────────────────────────────────────

export type SocketDomain = "AF_INET" | "AF_INET6" | "AF_UNIX" | "AF_NETLINK";
export type SocketType = "SOCK_STREAM" | "SOCK_DGRAM" | "SOCK_RAW" | "SOCK_SEQPACKET";
export type SocketState = "unbound" | "bound" | "listening" | "connecting" | "connected" | "closing" | "closed";
export type ShutdownHow = "SHUT_RD" | "SHUT_WR" | "SHUT_RDWR";

// ── Socket Options ─────────────────────────────────────────────

export interface SocketOptions {
  reuseAddr: boolean;
  reusePort: boolean;
  keepAlive: boolean;
  keepAliveIdle: number;     // seconds
  keepAliveInterval: number; // seconds
  keepAliveCount: number;
  noDelay: boolean;          // TCP_NODELAY (Nagle)
  linger: { enabled: boolean; timeout: number };
  sendBufferSize: number;
  recvBufferSize: number;
  sendTimeout: number;       // ms, 0 = infinite
  recvTimeout: number;       // ms, 0 = infinite
  broadcast: boolean;
  oobInline: boolean;
  dontRoute: boolean;
}

const DEFAULT_SOCKET_OPTIONS: SocketOptions = {
  reuseAddr: false, reusePort: false,
  keepAlive: false, keepAliveIdle: 7200, keepAliveInterval: 75, keepAliveCount: 9,
  noDelay: false,
  linger: { enabled: false, timeout: 0 },
  sendBufferSize: 131072, recvBufferSize: 131072,
  sendTimeout: 0, recvTimeout: 0,
  broadcast: false, oobInline: false, dontRoute: false,
};

// ── Socket Address ─────────────────────────────────────────────

export interface SocketAddress {
  family: SocketDomain;
  address: string;
  port: number;
  flowInfo?: number;   // IPv6
  scopeId?: number;    // IPv6
}

// ── Socket Descriptor ──────────────────────────────────────────

export interface SocketDescriptor {
  fd: number;
  domain: SocketDomain;
  type: SocketType;
  protocol: number;
  state: SocketState;
  localAddress: SocketAddress | null;
  remoteAddress: SocketAddress | null;
  options: SocketOptions;
  pid: number;
  backlog: number;
  pendingConnections: number;
  sendQueue: number;    // bytes queued
  recvQueue: number;    // bytes available
  bytesSent: number;
  bytesReceived: number;
  createdAt: number;
  nonBlocking: boolean;
  closeOnExec: boolean;
}

// ── Socket API Stats ───────────────────────────────────────────

export interface SocketAPIStats {
  totalSockets: number;
  streamSockets: number;
  dgramSockets: number;
  rawSockets: number;
  activeFDs: number;
  peakFDs: number;
  totalBytesSent: number;
  totalBytesReceived: number;
}

// ── Socket API Implementation ──────────────────────────────────

export class SocketAPI {
  private sockets: Map<number, SocketDescriptor> = new Map();
  private nextFD = 3; // 0=stdin, 1=stdout, 2=stderr
  private peakFDs = 0;

  socket(domain: SocketDomain, type: SocketType, protocol: number, pid: number): number {
    const fd = this.nextFD++;
    this.sockets.set(fd, {
      fd, domain, type, protocol, state: "unbound",
      localAddress: null, remoteAddress: null,
      options: { ...DEFAULT_SOCKET_OPTIONS },
      pid, backlog: 0, pendingConnections: 0,
      sendQueue: 0, recvQueue: 0,
      bytesSent: 0, bytesReceived: 0,
      createdAt: Date.now(),
      nonBlocking: false, closeOnExec: false,
    });
    this.peakFDs = Math.max(this.peakFDs, this.sockets.size);
    return fd;
  }

  bind(fd: number, address: SocketAddress): boolean {
    const sock = this.sockets.get(fd);
    if (!sock || sock.state !== "unbound") return false;
    sock.localAddress = address;
    sock.state = "bound";
    return true;
  }

  listen(fd: number, backlog: number): boolean {
    const sock = this.sockets.get(fd);
    if (!sock || (sock.state !== "bound" && sock.state !== "unbound")) return false;
    if (sock.type !== "SOCK_STREAM" && sock.type !== "SOCK_SEQPACKET") return false;
    sock.state = "listening";
    sock.backlog = backlog;
    return true;
  }

  accept(fd: number, pid: number): number | null {
    const sock = this.sockets.get(fd);
    if (!sock || sock.state !== "listening") return null;
    if (sock.pendingConnections <= 0) return null;
    sock.pendingConnections--;
    const newFD = this.socket(sock.domain, sock.type, sock.protocol, pid);
    const newSock = this.sockets.get(newFD)!;
    newSock.state = "connected";
    newSock.localAddress = sock.localAddress ? { ...sock.localAddress } : null;
    return newFD;
  }

  connect(fd: number, remoteAddress: SocketAddress): boolean {
    const sock = this.sockets.get(fd);
    if (!sock) return false;
    sock.remoteAddress = remoteAddress;
    sock.state = sock.type === "SOCK_DGRAM" ? "connected" : "connecting";
    // In real kernel, TCP handshake would happen here
    if (sock.type === "SOCK_STREAM") {
      sock.state = "connected"; // simplified
    }
    return true;
  }

  send(fd: number, bytes: number): number {
    const sock = this.sockets.get(fd);
    if (!sock || sock.state !== "connected") return -1;
    sock.bytesSent += bytes;
    sock.sendQueue += bytes;
    return bytes;
  }

  recv(fd: number, maxBytes: number): number {
    const sock = this.sockets.get(fd);
    if (!sock || sock.state !== "connected") return -1;
    const available = Math.min(sock.recvQueue, maxBytes);
    sock.bytesReceived += available;
    sock.recvQueue -= available;
    return available;
  }

  shutdown(fd: number, _how: ShutdownHow): boolean {
    const sock = this.sockets.get(fd);
    if (!sock) return false;
    sock.state = "closing";
    return true;
  }

  close(fd: number): boolean {
    const sock = this.sockets.get(fd);
    if (!sock) return false;
    sock.state = "closed";
    this.sockets.delete(fd);
    return true;
  }

  setsockopt<K extends keyof SocketOptions>(fd: number, option: K, value: SocketOptions[K]): boolean {
    const sock = this.sockets.get(fd);
    if (!sock) return false;
    sock.options[option] = value;
    return true;
  }

  getsockopt<K extends keyof SocketOptions>(fd: number, option: K): SocketOptions[K] | null {
    const sock = this.sockets.get(fd);
    if (!sock) return null;
    return sock.options[option];
  }

  getpeername(fd: number): SocketAddress | null {
    return this.sockets.get(fd)?.remoteAddress ?? null;
  }

  getsockname(fd: number): SocketAddress | null {
    return this.sockets.get(fd)?.localAddress ?? null;
  }

  setNonBlocking(fd: number, nonBlocking: boolean): boolean {
    const sock = this.sockets.get(fd);
    if (!sock) return false;
    sock.nonBlocking = nonBlocking;
    return true;
  }

  getSocket(fd: number): SocketDescriptor | undefined {
    return this.sockets.get(fd);
  }

  listSockets(): SocketDescriptor[] {
    return Array.from(this.sockets.values());
  }

  getStats(): SocketAPIStats {
    let stream = 0, dgram = 0, raw = 0, sent = 0, recv = 0;
    for (const s of this.sockets.values()) {
      if (s.type === "SOCK_STREAM") stream++;
      else if (s.type === "SOCK_DGRAM") dgram++;
      else if (s.type === "SOCK_RAW") raw++;
      sent += s.bytesSent;
      recv += s.bytesReceived;
    }
    return {
      totalSockets: this.sockets.size,
      streamSockets: stream, dgramSockets: dgram, rawSockets: raw,
      activeFDs: this.sockets.size, peakFDs: this.peakFDs,
      totalBytesSent: sent, totalBytesReceived: recv,
    };
  }
}
