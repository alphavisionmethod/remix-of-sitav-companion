// ═══════════════════════════════════════════════════════════════
// SITA OS — Search Indexer
// Settings registry, deep-link routing, intent/action mapping
// ═══════════════════════════════════════════════════════════════

export interface SearchEntry {
  id: string;
  title: string;
  keywords: string[];
  deepLink: string;
  category: "network" | "bluetooth" | "battery" | "security" | "system" | "automation" | "display" | "audio";
  description: string;
}

const SETTINGS_REGISTRY: SearchEntry[] = [
  { id: "wifi", title: "Wi-Fi Settings", keywords: ["wifi", "wireless", "network", "ssid", "connect", "internet"], deepLink: "/admin/system-intelligence?tab=network", category: "network", description: "Manage wireless networks, passwords, and connectivity" },
  { id: "vpn", title: "VPN Configuration", keywords: ["vpn", "tunnel", "privacy", "secure", "proxy"], deepLink: "/admin/security/foundation", category: "security", description: "Configure VPN connections and privacy settings" },
  { id: "firewall", title: "Firewall Settings", keywords: ["firewall", "nftables", "block", "rules", "strict"], deepLink: "/admin/security/foundation", category: "security", description: "Manage firewall rules and security policies" },
  { id: "bluetooth", title: "Bluetooth Devices", keywords: ["bluetooth", "pair", "headphones", "keyboard", "mouse", "connect"], deepLink: "/admin/system-intelligence?tab=bluetooth", category: "bluetooth", description: "Pair, connect, and manage Bluetooth devices" },
  { id: "battery", title: "Battery & Power", keywords: ["battery", "power", "charging", "saver", "performance", "thermal"], deepLink: "/admin/system-intelligence?tab=power", category: "battery", description: "Battery health, power profiles, and charging optimization" },
  { id: "battery-health", title: "Battery Health", keywords: ["battery health", "cycle count", "capacity", "aging", "degradation"], deepLink: "/admin/system-intelligence?tab=power", category: "battery", description: "View battery health metrics and aging information" },
  { id: "dns", title: "DNS Settings", keywords: ["dns", "nameserver", "resolve", "cloudflare", "google dns", "leak"], deepLink: "/admin/system-intelligence?tab=network", category: "network", description: "Configure DNS resolution and leak prevention" },
  { id: "hotspot", title: "Personal Hotspot", keywords: ["hotspot", "tethering", "share", "mobile", "ap"], deepLink: "/admin/system-intelligence?tab=network", category: "network", description: "Share your internet connection with other devices" },
  { id: "airplane", title: "Airplane Mode", keywords: ["airplane", "flight", "offline", "radios"], deepLink: "/admin/system-intelligence?tab=network", category: "network", description: "Disable all wireless radios for flight mode" },
  { id: "automation", title: "Automation Rules", keywords: ["automation", "rules", "trigger", "action", "smart", "auto"], deepLink: "/admin/system-intelligence?tab=automation", category: "automation", description: "Configure automated system responses and smart rules" },
  { id: "audio", title: "Audio Route Settings", keywords: ["audio", "output", "input", "speaker", "microphone", "headphones", "route"], deepLink: "/admin/system-intelligence?tab=bluetooth", category: "audio", description: "Manage audio input/output routing between devices" },
  { id: "quiet-mode", title: "Quiet Mode Schedule", keywords: ["quiet", "calm", "focus", "dnd", "notifications", "schedule"], deepLink: "/admin/system-intelligence?tab=automation", category: "system", description: "Schedule quiet mode and notification suppression" },
  { id: "diagnostics", title: "System Diagnostics", keywords: ["diagnose", "repair", "fix", "troubleshoot", "reset", "flush"], deepLink: "/admin/system-intelligence?tab=diagnostics", category: "system", description: "Run diagnostics and self-repair actions" },
  { id: "thermal", title: "Thermal Management", keywords: ["thermal", "temperature", "fan", "heat", "throttle", "cool"], deepLink: "/admin/system-intelligence?tab=power", category: "battery", description: "Monitor thermal state and fan control" },
];

export class SearchIndexer {
  private entries: SearchEntry[] = SETTINGS_REGISTRY;

  search(query: string): SearchEntry[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.entries
      .filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.keywords.some(k => k.includes(q)) ||
        e.description.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }

  getAllEntries(): SearchEntry[] { return [...this.entries]; }

  getByCategory(category: SearchEntry["category"]): SearchEntry[] {
    return this.entries.filter(e => e.category === category);
  }
}

let instance: SearchIndexer | null = null;
export function getSearchIndexer(): SearchIndexer {
  if (!instance) instance = new SearchIndexer();
  return instance;
}
