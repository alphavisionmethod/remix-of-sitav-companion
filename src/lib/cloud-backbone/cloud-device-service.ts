// ═══════════════════════════════════════════════════════════════
// SITA OS — Cloud Device Service
// Device identity, trust state, platform detection, management
// ═══════════════════════════════════════════════════════════════

export type TrustState = "trusted" | "suspicious" | "revoked" | "pending";

export interface CloudDevice {
  id: string;
  userId: string;
  userName: string;
  deviceName: string;
  platform: "ios" | "android" | "macos" | "windows" | "linux" | "web";
  clientVersion: string;
  trustState: TrustState;
  lastSeenAt: string;
  ipAddress: string;
  isCurrent: boolean;
  requiresReauth: boolean;
  createdAt: string;
}

export interface DeviceFleetReport {
  totalDevices: number;
  trustedDevices: number;
  suspiciousDevices: number;
  revokedDevices: number;
  pendingDevices: number;
  platformBreakdown: Record<string, number>;
  avgDevicesPerUser: number;
  outdatedVersions: number;
  devicesNeedingReauth: number;
}

class CloudDeviceService {
  private static instance: CloudDeviceService;
  static getInstance() {
    if (!this.instance) this.instance = new CloudDeviceService();
    return this.instance;
  }

  getFleetReport(): DeviceFleetReport {
    const devices = this.getDemoDevices();
    const platforms: Record<string, number> = {};
    devices.forEach(d => { platforms[d.platform] = (platforms[d.platform] || 0) + 1; });
    return {
      totalDevices: devices.length,
      trustedDevices: devices.filter(d => d.trustState === "trusted").length,
      suspiciousDevices: devices.filter(d => d.trustState === "suspicious").length,
      revokedDevices: devices.filter(d => d.trustState === "revoked").length,
      pendingDevices: devices.filter(d => d.trustState === "pending").length,
      platformBreakdown: platforms,
      avgDevicesPerUser: 2.4,
      outdatedVersions: devices.filter(d => d.clientVersion < "2.0.0").length,
      devicesNeedingReauth: devices.filter(d => d.requiresReauth).length,
    };
  }

  getDemoDevices(): CloudDevice[] {
    const data: Array<[string, string, string, CloudDevice["platform"], string, TrustState]> = [
      ["Alice Chen", "MacBook Pro 16\"", "macOS Safari", "macos", "2.1.0", "trusted"],
      ["Alice Chen", "iPhone 15 Pro", "iOS App", "ios", "2.1.0", "trusted"],
      ["Bob Martinez", "ThinkPad X1", "Chrome/Win", "windows", "2.0.3", "trusted"],
      ["Bob Martinez", "Pixel 8", "Android App", "android", "1.9.2", "suspicious"],
      ["Carol Singh", "MacBook Air M3", "macOS Safari", "macos", "2.1.0", "trusted"],
      ["Carol Singh", "iPad Pro", "iOS Safari", "ios", "2.0.1", "trusted"],
      ["Dave Kim", "Desktop PC", "Chrome/Linux", "linux", "2.1.0", "trusted"],
      ["Dave Kim", "Galaxy S24", "Android App", "android", "2.1.0", "trusted"],
      ["Eve Johnson", "Surface Pro", "Edge/Win", "windows", "1.8.0", "revoked"],
      ["Eve Johnson", "Chrome Browser", "Web App", "web", "2.1.0", "trusted"],
      ["Frank Li", "MacBook Pro 14\"", "macOS Chrome", "macos", "2.0.0", "trusted"],
      ["Frank Li", "Unknown Device", "Web App", "web", "2.1.0", "pending"],
      ["Grace Okafor", "Dell XPS 15", "Chrome/Win", "windows", "2.1.0", "trusted"],
      ["Hiro Tanaka", "iMac 27\"", "macOS Safari", "macos", "2.1.0", "trusted"],
      ["Hiro Tanaka", "iPhone 14", "iOS App", "ios", "2.0.2", "trusted"],
    ];
    return data.map(([userName, deviceName, ua, platform, version, trust], i) => ({
      id: crypto.randomUUID(),
      userId: crypto.randomUUID(),
      userName,
      deviceName,
      platform,
      clientVersion: version,
      trustState: trust,
      lastSeenAt: new Date(Date.now() - Math.random() * 86400000 * (i < 8 ? 1 : 7)).toISOString(),
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      isCurrent: i === 0,
      requiresReauth: trust === "suspicious" || version < "2.0.0",
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 90).toISOString(),
    }));
  }

  async revokeDevice(deviceId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  async forceReauth(deviceId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 500));
    return true;
  }

  async renameDevice(deviceId: string, newName: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 300));
    return true;
  }

  getPlatformIcon(platform: CloudDevice["platform"]): string {
    const map: Record<string, string> = {
      ios: "📱", android: "🤖", macos: "💻", windows: "🖥️", linux: "🐧", web: "🌐",
    };
    return map[platform] || "❓";
  }

  getTrustColor(state: TrustState): string {
    const map: Record<TrustState, string> = {
      trusted: "text-emerald-400",
      suspicious: "text-amber-400",
      revoked: "text-red-400",
      pending: "text-blue-400",
    };
    return map[state];
  }

  getTrustBadgeVariant(state: TrustState): "default" | "secondary" | "destructive" | "outline" {
    const map: Record<TrustState, "default" | "secondary" | "destructive" | "outline"> = {
      trusted: "default",
      suspicious: "secondary",
      revoked: "destructive",
      pending: "outline",
    };
    return map[state];
  }
}

export const cloudDeviceService = CloudDeviceService.getInstance();
