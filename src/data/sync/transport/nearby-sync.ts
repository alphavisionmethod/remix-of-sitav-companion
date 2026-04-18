// ═══════════════════════════════════════════════════════════════
// SITA OS — Nearby Sync (Peer-to-Peer)
// Local discovery, mutual auth, encrypted transfer, trust gating
// ═══════════════════════════════════════════════════════════════

/** Nearby device discovered on local network */
export interface NearbyDevice {
  deviceId: string;
  name: string;
  platform: string;
  userId: string;
  trustLevel: "trusted" | "semi-trusted" | "unknown";
  ipAddress: string;
  port: number;
  signalStrength: number; // -100 to 0 dBm
  discoveredAt: string;
  lastSeenAt: string;
  capabilities: NearbyCapabilities;
  transferState: "idle" | "offering" | "receiving" | "transferring" | "completed" | "failed";
}

export interface NearbyCapabilities {
  supportsFileTransfer: boolean;
  supportsSessionHandoff: boolean;
  supportsBootstrap: boolean;
  maxTransferSizeMB: number;
  encryptionSupported: boolean;
}

/** Transfer offer from a nearby device */
export interface NearbyTransferOffer {
  id: string;
  fromDeviceId: string;
  fromDeviceName: string;
  type: "file" | "session" | "bootstrap" | "clipboard";
  description: string;
  sizeBytes: number;
  objectCount: number;
  expiresAt: string;
  accepted: boolean | null;
}

/** Nearby sync session */
export interface NearbySession {
  id: string;
  localDeviceId: string;
  remoteDeviceId: string;
  direction: "sending" | "receiving";
  state: "authenticating" | "transferring" | "verifying" | "completed" | "failed";
  totalBytes: number;
  transferredBytes: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  encrypted: boolean;
}

/** Discovery configuration */
export interface NearbyConfig {
  discoveryEnabled: boolean;
  autoAcceptFromTrusted: boolean;
  maxDiscoveryRadius: "local" | "network" | "wide";
  allowedTransferTypes: ("file" | "session" | "bootstrap" | "clipboard")[];
  requireEncryption: boolean;
  maxTransferSizeMB: number;
}

type DeviceDiscoveredHandler = (device: NearbyDevice) => void;
type OfferReceivedHandler = (offer: NearbyTransferOffer) => void;

class NearbySyncManager {
  private config: NearbyConfig = {
    discoveryEnabled: true,
    autoAcceptFromTrusted: false,
    maxDiscoveryRadius: "local",
    allowedTransferTypes: ["file", "session", "bootstrap"],
    requireEncryption: true,
    maxTransferSizeMB: 5120,
  };

  private discoveredDevices = new Map<string, NearbyDevice>();
  private pendingOffers = new Map<string, NearbyTransferOffer>();
  private activeSessions = new Map<string, NearbySession>();
  private sessionHistory: NearbySession[] = [];

  private discoveryHandlers: DeviceDiscoveredHandler[] = [];
  private offerHandlers: OfferReceivedHandler[] = [];
  private discoveryInterval: ReturnType<typeof setInterval> | null = null;
  private running = false;

  /** Start nearby discovery */
  startDiscovery(): void {
    if (this.running || !this.config.discoveryEnabled) return;
    this.running = true;

    // Simulate periodic discovery
    this.discoveryInterval = setInterval(() => this.scanForDevices(), 5000);
    console.log("[NearbySyncManager] Discovery started");
  }

  /** Stop discovery */
  stopDiscovery(): void {
    this.running = false;
    if (this.discoveryInterval) clearInterval(this.discoveryInterval);
    this.discoveryInterval = null;
    this.discoveredDevices.clear();
  }

  /** Create a transfer offer to a nearby device */
  createOffer(params: {
    targetDeviceId: string;
    type: NearbyTransferOffer["type"];
    description: string;
    sizeBytes: number;
    objectCount: number;
  }): NearbyTransferOffer | null {
    const target = this.discoveredDevices.get(params.targetDeviceId);
    if (!target) return null;

    // Trust gating
    if (target.trustLevel === "unknown" && this.config.requireEncryption) {
      return null;
    }

    if (!this.config.allowedTransferTypes.includes(params.type)) return null;

    const offer: NearbyTransferOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fromDeviceId: "current-device",
      fromDeviceName: "This Device",
      type: params.type,
      description: params.description,
      sizeBytes: params.sizeBytes,
      objectCount: params.objectCount,
      expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 min expiry
      accepted: null,
    };

    this.pendingOffers.set(offer.id, offer);
    return offer;
  }

  /** Accept a transfer offer */
  acceptOffer(offerId: string): NearbySession | null {
    const offer = this.pendingOffers.get(offerId);
    if (!offer || new Date(offer.expiresAt).getTime() < Date.now()) return null;

    offer.accepted = true;

    const session: NearbySession = {
      id: `nsess_${Date.now()}`,
      localDeviceId: "current-device",
      remoteDeviceId: offer.fromDeviceId,
      direction: "receiving",
      state: "authenticating",
      totalBytes: offer.sizeBytes,
      transferredBytes: 0,
      startedAt: new Date().toISOString(),
      encrypted: this.config.requireEncryption,
    };

    this.activeSessions.set(session.id, session);

    // Simulate transfer progress
    this.simulateTransfer(session);

    return session;
  }

  /** Reject a transfer offer */
  rejectOffer(offerId: string): void {
    const offer = this.pendingOffers.get(offerId);
    if (offer) {
      offer.accepted = false;
      this.pendingOffers.delete(offerId);
    }
  }

  /** Get discovered devices */
  getDiscoveredDevices(): NearbyDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  /** Get pending offers */
  getPendingOffers(): NearbyTransferOffer[] {
    return Array.from(this.pendingOffers.values()).filter(o => o.accepted === null);
  }

  /** Get active sessions */
  getActiveSessions(): NearbySession[] {
    return Array.from(this.activeSessions.values());
  }

  /** Get session history */
  getSessionHistory(): NearbySession[] {
    return [...this.sessionHistory];
  }

  /** Update configuration */
  setConfig(config: Partial<NearbyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Get config */
  getConfig(): NearbyConfig {
    return { ...this.config };
  }

  /** Subscribe to device discovery */
  onDeviceDiscovered(handler: DeviceDiscoveredHandler): () => void {
    this.discoveryHandlers.push(handler);
    return () => { this.discoveryHandlers = this.discoveryHandlers.filter(h => h !== handler); };
  }

  /** Subscribe to transfer offers */
  onOfferReceived(handler: OfferReceivedHandler): () => void {
    this.offerHandlers.push(handler);
    return () => { this.offerHandlers = this.offerHandlers.filter(h => h !== handler); };
  }

  // ─── Internal ───────────────────────────────

  private scanForDevices(): void {
    // Simulated discovery
    const now = new Date().toISOString();
    const simDevices: NearbyDevice[] = [
      {
        deviceId: "nearby_phone_1", name: "Kaelyn's Phone", platform: "android",
        userId: "current-user", trustLevel: "trusted", ipAddress: "192.168.1.42",
        port: 8443, signalStrength: -35, discoveredAt: now, lastSeenAt: now,
        capabilities: { supportsFileTransfer: true, supportsSessionHandoff: true, supportsBootstrap: true, maxTransferSizeMB: 2048, encryptionSupported: true },
        transferState: "idle",
      },
      {
        deviceId: "nearby_tablet_1", name: "Living Room Tablet", platform: "sita-os",
        userId: "current-user", trustLevel: "trusted", ipAddress: "192.168.1.55",
        port: 8443, signalStrength: -52, discoveredAt: now, lastSeenAt: now,
        capabilities: { supportsFileTransfer: true, supportsSessionHandoff: true, supportsBootstrap: false, maxTransferSizeMB: 5120, encryptionSupported: true },
        transferState: "idle",
      },
    ];

    for (const device of simDevices) {
      const isNew = !this.discoveredDevices.has(device.deviceId);
      this.discoveredDevices.set(device.deviceId, device);
      if (isNew) {
        for (const handler of this.discoveryHandlers) handler(device);
      }
    }
  }

  private async simulateTransfer(session: NearbySession): Promise<void> {
    // Auth phase
    await new Promise(r => setTimeout(r, 500));
    session.state = "transferring";

    // Transfer phase
    const chunks = 20;
    for (let i = 0; i < chunks; i++) {
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      if (session.state !== "transferring") break;
      session.transferredBytes = Math.floor((i + 1) / chunks * session.totalBytes);
    }

    // Verify phase
    session.state = "verifying";
    await new Promise(r => setTimeout(r, 300));
    session.state = "completed";
    session.completedAt = new Date().toISOString();
    session.transferredBytes = session.totalBytes;

    this.sessionHistory.push({ ...session });
    this.activeSessions.delete(session.id);
  }
}

/** Singleton nearby sync manager */
export const nearbySync = new NearbySyncManager();
