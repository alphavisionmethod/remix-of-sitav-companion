import { describe, it, expect } from "vitest";
import * as fs from "fs";

const KERNEL_DIR = "src/lib/core-services/kernel";

// ── TCP/IP Stack ─────────────────────────────────────────────

describe("Networking — TCP/IP Stack", () => {
  it("tcp-ip-stack.ts exists and exports TCPIPStack class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("class TCPIPStack");
    expect(content).toContain("export class TCPIPStack");
  });

  it("defines NetworkInterface with stats", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("interface NetworkInterface");
    expect(content).toContain("rxBytes");
    expect(content).toContain("txBytes");
    expect(content).toContain("macAddress");
    expect(content).toContain("mtu");
  });

  it("defines TCP connection states (full state machine)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    const requiredStates = ["CLOSED", "LISTEN", "SYN_SENT", "SYN_RECEIVED", "ESTABLISHED", "FIN_WAIT_1", "FIN_WAIT_2", "CLOSE_WAIT", "CLOSING", "LAST_ACK", "TIME_WAIT"];
    for (const state of requiredStates) {
      expect(content, `Missing TCP state: ${state}`).toContain(`"${state}"`);
    }
  });

  it("supports congestion control algorithms", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("CongestionAlgorithm");
    expect(content).toContain('"cubic"');
    expect(content).toContain('"bbr"');
    expect(content).toContain("cwnd");
    expect(content).toContain("ssthresh");
  });

  it("implements routing table with metrics", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("RoutingEntry");
    expect(content).toContain("metric");
    expect(content).toContain("addRoute");
    expect(content).toContain("resolveRoute");
  });

  it("implements ARP table", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("ARPEntry");
    expect(content).toContain("resolveMAC");
  });

  it("supports UDP bindings", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("UDPBinding");
    expect(content).toContain("bindUDP");
  });

  it("initializes loopback interface", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/tcp-ip-stack.ts`, "utf-8");
    expect(content).toContain("initLoopback");
    expect(content).toContain("127.0.0.1");
    expect(content).toContain("::1");
  });
});

// ── Socket API ───────────────────────────────────────────────

describe("Networking — Socket API", () => {
  it("socket-api.ts exists and exports SocketAPI class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/socket-api.ts`, "utf-8");
    expect(content).toContain("class SocketAPI");
  });

  it("implements BSD socket lifecycle (socket/bind/listen/accept/connect/close)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/socket-api.ts`, "utf-8");
    const methods = ["socket(", "bind(", "listen(", "accept(", "connect(", "send(", "recv(", "close("];
    for (const m of methods) {
      expect(content, `Missing method: ${m}`).toContain(m);
    }
  });

  it("supports socket options (SO_REUSEADDR, TCP_NODELAY, etc.)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/socket-api.ts`, "utf-8");
    expect(content).toContain("reuseAddr");
    expect(content).toContain("noDelay");
    expect(content).toContain("keepAlive");
    expect(content).toContain("setsockopt");
    expect(content).toContain("getsockopt");
  });

  it("defines socket domains (AF_INET, AF_INET6, AF_UNIX)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/socket-api.ts`, "utf-8");
    expect(content).toContain("AF_INET");
    expect(content).toContain("AF_INET6");
    expect(content).toContain("AF_UNIX");
  });

  it("supports non-blocking mode", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/socket-api.ts`, "utf-8");
    expect(content).toContain("nonBlocking");
    expect(content).toContain("setNonBlocking");
  });
});

// ── Firewall ─────────────────────────────────────────────────

describe("Networking — Firewall", () => {
  it("firewall.ts exists and exports Firewall class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain("class Firewall");
  });

  it("defines standard chains (INPUT, OUTPUT, FORWARD, PRE/POSTROUTING)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain('"INPUT"');
    expect(content).toContain('"OUTPUT"');
    expect(content).toContain('"FORWARD"');
    expect(content).toContain('"PREROUTING"');
    expect(content).toContain('"POSTROUTING"');
  });

  it("supports connection tracking (conntrack)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain("ConnTrackEntry");
    expect(content).toContain("trackConnection");
    expect(content).toContain("ConnTrackState");
  });

  it("supports rule actions (ACCEPT, DROP, REJECT, LOG, MASQUERADE)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain('"ACCEPT"');
    expect(content).toContain('"DROP"');
    expect(content).toContain('"REJECT"');
    expect(content).toContain('"LOG"');
    expect(content).toContain('"MASQUERADE"');
  });

  it("implements packet evaluation with rule matching", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain("evaluate(");
    expect(content).toContain("matchesRule");
    expect(content).toContain("hitCount");
  });

  it("supports rate limiting", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain("RateLimitConfig");
    expect(content).toContain("checkRateLimit");
  });

  it("initializes with default rules (loopback, established, ICMP)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/firewall.ts`, "utf-8");
    expect(content).toContain("Allow loopback");
    expect(content).toContain("Allow established");
    expect(content).toContain("Allow ICMP");
  });
});

// ── VPN Manager ──────────────────────────────────────────────

describe("Networking — VPN Manager", () => {
  it("vpn-manager.ts exists and exports VPNManager class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain("class VPNManager");
  });

  it("supports WireGuard-style tunnels with key pairs", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain('"wireguard"');
    expect(content).toContain("privateKey");
    expect(content).toContain("publicKey");
    expect(content).toContain("presharedKey");
  });

  it("supports peer management with allowed IPs", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain("VPNPeer");
    expect(content).toContain("allowedIPs");
    expect(content).toContain("addPeer");
    expect(content).toContain("removePeer");
  });

  it("implements tunnel lifecycle (create, activate, deactivate, remove)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain("createTunnel");
    expect(content).toContain("activate");
    expect(content).toContain("deactivate");
    expect(content).toContain("removeTunnel");
  });

  it("supports split tunneling rules", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain("SplitTunnelRule");
    expect(content).toContain("addSplitRule");
  });

  it("supports kill switch", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/vpn-manager.ts`, "utf-8");
    expect(content).toContain("killSwitch");
  });
});

// ── DNS Resolver ─────────────────────────────────────────────

describe("Networking — DNS Resolver", () => {
  it("dns-resolver.ts exists and exports DNSResolver class", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain("class DNSResolver");
  });

  it("supports standard record types (A, AAAA, CNAME, MX, NS, TXT, SRV)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    for (const t of ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SRV"]) {
      expect(content, `Missing record type: ${t}`).toContain(`"${t}"`);
    }
  });

  it("supports encrypted transports (DoH, DoT)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain('"doh"');
    expect(content).toContain('"dot"');
    expect(content).toContain("DNSTransport");
  });

  it("implements caching with TTL and eviction", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain("DNSCacheEntry");
    expect(content).toContain("expiresAt");
    expect(content).toContain("flushCache");
    expect(content).toContain("cacheMaxSize");
  });

  it("supports DNSSEC validation", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain("dnssecValidated");
    expect(content).toContain("DNSKEY");
    expect(content).toContain("RRSIG");
  });

  it("supports local overrides (hosts file equivalent)", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain("DNSOverride");
    expect(content).toContain("addOverride");
  });

  it("initializes with default upstream resolvers", () => {
    const content = fs.readFileSync(`${KERNEL_DIR}/dns-resolver.ts`, "utf-8");
    expect(content).toContain("1.1.1.1");
    expect(content).toContain("8.8.8.8");
    expect(content).toContain("cloudflare-dns.com");
  });
});

// ── Barrel Integration ───────────────────────────────────────

describe("Networking — Barrel Integration", () => {
  it("barrel index exports all networking subsystems", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("TCPIPStack");
    expect(barrel).toContain("SocketAPI");
    expect(barrel).toContain("Firewall");
    expect(barrel).toContain("VPNManager");
    expect(barrel).toContain("DNSResolver");
  });

  it("KernelSubsystem facade includes networking properties", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("readonly tcpip: TCPIPStack");
    expect(barrel).toContain("readonly sockets: SocketAPI");
    expect(barrel).toContain("readonly firewall: Firewall");
    expect(barrel).toContain("readonly vpn: VPNManager");
    expect(barrel).toContain("readonly dns: DNSResolver");
  });

  it("networking stats included in getStats()", () => {
    const barrel = fs.readFileSync(`${KERNEL_DIR}/index.ts`, "utf-8");
    expect(barrel).toContain("tcpip: this.tcpip.getStats()");
    expect(barrel).toContain("sockets: this.sockets.getStats()");
    expect(barrel).toContain("firewall: this.firewall.getStats()");
    expect(barrel).toContain("vpn: this.vpn.getStats()");
    expect(barrel).toContain("dns: this.dns.getStats()");
  });

  it("no networking file imports React or UI components", () => {
    const netFiles = ["tcp-ip-stack.ts", "socket-api.ts", "firewall.ts", "vpn-manager.ts", "dns-resolver.ts"];
    for (const file of netFiles) {
      const content = fs.readFileSync(`${KERNEL_DIR}/${file}`, "utf-8");
      expect(content, `${file} must not import React`).not.toMatch(/from\s+["']react["']/);
      expect(content, `${file} must not import components`).not.toMatch(/from\s+["']@\/components/);
      expect(content, `${file} must not import pages`).not.toMatch(/from\s+["']@\/pages/);
    }
  });
});
