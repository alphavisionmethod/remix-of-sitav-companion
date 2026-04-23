// ═══════════════════════════════════════════════════════════════
// SITA OS — WiFi Daemon (wifid)
// Advanced WiFi management: captive portal, enterprise auth,
// signal roaming, hidden SSID, static IP, DNS, metered, hotspot
// ═══════════════════════════════════════════════════════════════

export type WifiConnectivityState = "offline" | "limited" | "captive_portal" | "online";
export type WifiAuthFailure = "wrong_password" | "cert_rejected" | "timeout" | "radius_reject" | "unknown";
export type WifiSecurityType = "open" | "wep" | "wpa2_personal" | "wpa3_personal" | "wpa2_enterprise" | "wpa3_enterprise";
export type WifiBand = "2.4ghz" | "5ghz" | "6ghz";
export type ThermalPressure = "nominal" | "warm" | "hot" | "throttling" | "critical";

export interface CaptivePortalState {
  detected: boolean;
  loginUrl: string;
  detectedAt: number;
  userDismissed: boolean;
  retryCount: number;
}

export interface EnterpriseAuthConfig {
  username: string;
  anonymousIdentity?: string;
  caCertificate?: string;
  clientCertificate?: string;
  privateKey?: string;
  validated: boolean;
}

export interface PerNetworkSettings {
  useDhcp: boolean;
  staticIp?: string;
  netmask?: string;
  gateway?: string;
  dns1?: string;
  dns2?: string;
  domainSearch?: string;
  isMetered: boolean;
  customDns: boolean;
  autoConnect: boolean;
}

export interface HotspotConfig {
  enabled: boolean;
  ssid: string;
  password: string;
  band: WifiBand;
  security: "wpa2" | "wpa3";
  maxClients: number;
  connectedClients: HotspotClient[];
  dataUsedMb: number;
  dataLimitMb: number | null;
}

export interface HotspotClient {
  mac: string;
  hostname: string;
  connectedAt: number;
  dataMb: number;
}

export interface WifiNetwork {
  ssid: string;
  bssid: string;
  signal: number; // -100 to 0 dBm
  rssiPercent: number; // 0-100
  security: WifiSecurityType;
  band: WifiBand;
  channel: number;
  connected: boolean;
  saved: boolean;
  hidden: boolean;
  enterpriseAuth?: EnterpriseAuthConfig;
  perNetworkSettings: PerNetworkSettings;
  lastConnected?: number;
  authFailure?: WifiAuthFailure;
  authFailureCount: number;
}

export interface WifiState {
  enabled: boolean;
  connectivity: WifiConnectivityState;
  currentNetwork: WifiNetwork | null;
  availableNetworks: WifiNetwork[];
  savedNetworks: WifiNetwork[];
  captivePortal: CaptivePortalState;
  hotspot: HotspotConfig;
  airplaneMode: boolean;
  scanning: boolean;
  weakSignalThreshold: number; // dBm
  roamingSuggestion: string | null;
  dnsLeakPrevention: boolean;
  systemDnsPolicy: "auto" | "cloudflare" | "google" | "custom";
}

const DEFAULT_NETWORK_SETTINGS: PerNetworkSettings = {
  useDhcp: true, isMetered: false, customDns: false, autoConnect: true,
};

const NETWORKS: WifiNetwork[] = [
  { ssid: "SITA-Secure-5G", bssid: "AA:BB:CC:DD:EE:01", signal: -35, rssiPercent: 95, security: "wpa3_personal", band: "5ghz", channel: 36, connected: true, saved: true, hidden: false, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS }, authFailureCount: 0 },
  { ssid: "SITA-Guest", bssid: "AA:BB:CC:DD:EE:02", signal: -55, rssiPercent: 75, security: "open", band: "2.4ghz", channel: 6, connected: false, saved: true, hidden: false, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS, isMetered: true }, authFailureCount: 0 },
  { ssid: "Office-Enterprise", bssid: "AA:BB:CC:DD:EE:03", signal: -45, rssiPercent: 85, security: "wpa2_enterprise", band: "5ghz", channel: 44, connected: false, saved: true, hidden: false, enterpriseAuth: { username: "user@corp.com", validated: true }, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS }, authFailureCount: 0 },
  { ssid: "CoffeeShop-Free", bssid: "AA:BB:CC:DD:EE:04", signal: -72, rssiPercent: 40, security: "open", band: "2.4ghz", channel: 11, connected: false, saved: false, hidden: false, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS, isMetered: true }, authFailureCount: 0 },
  { ssid: "Neighbor-WiFi", bssid: "AA:BB:CC:DD:EE:05", signal: -80, rssiPercent: 25, security: "wpa2_personal", band: "2.4ghz", channel: 1, connected: false, saved: false, hidden: false, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS }, authFailureCount: 0 },
  { ssid: "Airport-5G", bssid: "AA:BB:CC:DD:EE:06", signal: -60, rssiPercent: 65, security: "open", band: "5ghz", channel: 149, connected: false, saved: false, hidden: false, perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS, isMetered: true }, authFailureCount: 0 },
];

export class WifiDaemon {
  private state: WifiState;
  private listeners: Array<(s: WifiState) => void> = [];

  constructor() {
    this.state = {
      enabled: true,
      connectivity: "online",
      currentNetwork: NETWORKS[0],
      availableNetworks: [...NETWORKS],
      savedNetworks: NETWORKS.filter(n => n.saved),
      captivePortal: { detected: false, loginUrl: "", detectedAt: 0, userDismissed: false, retryCount: 0 },
      hotspot: { enabled: false, ssid: "SITA-Hotspot", password: "secure2024", band: "5ghz", security: "wpa3", maxClients: 8, connectedClients: [], dataUsedMb: 0, dataLimitMb: null },
      airplaneMode: false,
      scanning: false,
      weakSignalThreshold: -70,
      roamingSuggestion: null,
      dnsLeakPrevention: true,
      systemDnsPolicy: "auto",
    };
  }

  getState(): WifiState { return { ...this.state }; }

  subscribe(fn: (s: WifiState) => void) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private emit() { this.listeners.forEach(fn => fn(this.getState())); }

  async scan(): Promise<WifiNetwork[]> {
    this.state.scanning = true;
    this.emit();
    await new Promise(r => setTimeout(r, 1500));
    this.state.scanning = false;
    this.emit();
    return this.state.availableNetworks;
  }

  async connect(ssid: string, password?: string): Promise<{ success: boolean; error?: WifiAuthFailure }> {
    const net = this.state.availableNetworks.find(n => n.ssid === ssid);
    if (!net) return { success: false, error: "unknown" };

    // Simulate auth failure on wrong password
    if (net.security !== "open" && password === "wrong") {
      net.authFailure = "wrong_password";
      net.authFailureCount++;
      this.emit();
      return { success: false, error: "wrong_password" };
    }

    await new Promise(r => setTimeout(r, 800));
    this.state.availableNetworks.forEach(n => n.connected = false);
    net.connected = true;
    net.saved = true;
    net.authFailure = undefined;
    net.authFailureCount = 0;
    net.lastConnected = Date.now();
    this.state.currentNetwork = net;
    this.state.connectivity = net.security === "open" ? "captive_portal" : "online";

    if (this.state.connectivity === "captive_portal" && net.ssid.includes("Free")) {
      this.state.captivePortal = { detected: true, loginUrl: `https://portal.${ssid.toLowerCase()}.com/login`, detectedAt: Date.now(), userDismissed: false, retryCount: 0 };
    } else {
      this.state.captivePortal = { detected: false, loginUrl: "", detectedAt: 0, userDismissed: false, retryCount: 0 };
      this.state.connectivity = "online";
    }

    this.checkWeakSignal();
    this.emit();
    return { success: true };
  }

  disconnect() {
    if (this.state.currentNetwork) {
      this.state.currentNetwork.connected = false;
      this.state.currentNetwork = null;
      this.state.connectivity = "offline";
      this.emit();
    }
  }

  forgetNetwork(ssid: string) {
    const net = this.state.availableNetworks.find(n => n.ssid === ssid);
    if (net) {
      net.saved = false;
      net.authFailure = undefined;
      net.authFailureCount = 0;
      if (net.connected) this.disconnect();
    }
    this.state.savedNetworks = this.state.availableNetworks.filter(n => n.saved);
    this.emit();
  }

  connectHidden(ssid: string, security: WifiSecurityType, password?: string) {
    const hidden: WifiNetwork = {
      ssid, bssid: "XX:XX:XX:XX:XX:XX", signal: -50, rssiPercent: 70, security, band: "5ghz",
      channel: 36, connected: false, saved: true, hidden: true,
      perNetworkSettings: { ...DEFAULT_NETWORK_SETTINGS }, authFailureCount: 0,
    };
    this.state.availableNetworks.push(hidden);
    return this.connect(ssid, password);
  }

  setAirplaneMode(enabled: boolean) {
    this.state.airplaneMode = enabled;
    if (enabled) {
      this.state.enabled = false;
      this.disconnect();
      this.state.hotspot.enabled = false;
    }
    this.emit();
  }

  toggleHotspot(enabled: boolean) {
    if (this.state.airplaneMode) return;
    this.state.hotspot.enabled = enabled;
    if (enabled) this.disconnect();
    this.emit();
  }

  updateHotspotConfig(config: Partial<HotspotConfig>) {
    Object.assign(this.state.hotspot, config);
    this.emit();
  }

  updateNetworkSettings(ssid: string, settings: Partial<PerNetworkSettings>) {
    const net = this.state.availableNetworks.find(n => n.ssid === ssid);
    if (net) Object.assign(net.perNetworkSettings, settings);
    this.emit();
  }

  setDnsPolicy(policy: WifiState["systemDnsPolicy"]) {
    this.state.systemDnsPolicy = policy;
    this.emit();
  }

  dismissCaptivePortal() {
    this.state.captivePortal.userDismissed = true;
    this.state.connectivity = "online";
    this.emit();
  }

  private checkWeakSignal() {
    if (!this.state.currentNetwork) return;
    const current = this.state.currentNetwork;
    const stronger = this.state.availableNetworks.find(
      n => !n.connected && n.ssid === current.ssid && n.signal > current.signal + 10
    );
    this.state.roamingSuggestion = stronger
      ? `Stronger AP available on channel ${stronger.channel} (${stronger.band})`
      : current.signal < this.state.weakSignalThreshold
        ? "Weak signal — consider moving closer to the router"
        : null;
  }
}

let instance: WifiDaemon | null = null;
export function getWifiDaemon(): WifiDaemon {
  if (!instance) instance = new WifiDaemon();
  return instance;
}
