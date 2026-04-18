// ═══════════════════════════════════════════════════════════════
// SITA OS — Help Engine
// Explainers, guided troubleshooting, remediation actions,
// safe repair workflows
// ═══════════════════════════════════════════════════════════════

export interface HelpArticle {
  id: string;
  area: "wifi" | "bluetooth" | "battery" | "shield" | "system";
  title: string;
  summary: string;
  steps?: string[];
}

export interface RemediationAction {
  id: string;
  label: string;
  description: string;
  area: string;
  risk: "safe" | "moderate" | "elevated";
  estimatedTimeMs: number;
  execute: () => Promise<{ success: boolean; message: string }>;
}

const HELP_ARTICLES: HelpArticle[] = [
  { id: "h1", area: "wifi", title: "Connecting to Wi-Fi", summary: "Select a network from the list and enter the password if required." },
  { id: "h2", area: "wifi", title: "Captive Portal Networks", summary: "Some public networks require you to sign in through a browser. Look for the 'Sign in required' banner.", steps: ["Connect to the network", "Click 'Open' on the captive portal banner", "Complete the sign-in process", "Your connection will be verified automatically"] },
  { id: "h3", area: "wifi", title: "Wrong Password", summary: "If your password is incorrect, you can retry, show the password for verification, or forget the network to start fresh." },
  { id: "h4", area: "bluetooth", title: "Pairing a Device", summary: "Put your device in pairing mode and click 'Discover' in the Bluetooth panel." },
  { id: "h5", area: "bluetooth", title: "Audio Route Switching", summary: "Connected audio devices appear in the Audio Route section. Click to switch output or input." },
  { id: "h6", area: "battery", title: "Optimized Charging", summary: "Holding charge at 80% reduces battery wear. The system learns your schedule to finish charging before you unplug." },
  { id: "h7", area: "shield", title: "Shield Protection", summary: "Shield protects you with secure networking, smart threat blocking, and firewall controls." },
  { id: "h8", area: "shield", title: "VPN Auto-Connect", summary: "When you join an open or public WiFi network, Shield can automatically enable VPN to secure your traffic." },
  { id: "h9", area: "system", title: "Power Profiles", summary: "Choose between Performance, Balanced, Power Saver, and Quiet mode. Each adjusts CPU, GPU, display, and fan behavior." },
  { id: "h10", area: "system", title: "System Self-Repair", summary: "Use the Diagnostics panel to reset network, flush DNS, restart Bluetooth, or rebuild firewall rules with one click." },
];

const simulateRepair = (label: string) => async (): Promise<{ success: boolean; message: string }> => {
  await new Promise(r => setTimeout(r, 1200));
  return { success: true, message: `${label} completed successfully.` };
};

const REMEDIATION_ACTIONS: RemediationAction[] = [
  { id: "r1", label: "Reset Network Stack", description: "Restart all network interfaces and flush routing tables", area: "wifi", risk: "moderate", estimatedTimeMs: 3000, execute: simulateRepair("Network stack reset") },
  { id: "r2", label: "Flush DNS Cache", description: "Clear the DNS resolver cache to fix name resolution issues", area: "wifi", risk: "safe", estimatedTimeMs: 500, execute: simulateRepair("DNS cache flush") },
  { id: "r3", label: "Restart Bluetooth", description: "Reset the Bluetooth controller and re-initialize all pairings", area: "bluetooth", risk: "moderate", estimatedTimeMs: 2000, execute: simulateRepair("Bluetooth restart") },
  { id: "r4", label: "Rebuild Firewall Policy", description: "Regenerate all firewall rules from the current security posture", area: "shield", risk: "moderate", estimatedTimeMs: 2500, execute: simulateRepair("Firewall policy rebuild") },
  { id: "r5", label: "Verify VPN Configuration", description: "Check VPN certificates, tunnel routes, and DNS leak prevention", area: "shield", risk: "safe", estimatedTimeMs: 1500, execute: simulateRepair("VPN verification") },
  { id: "r6", label: "Recalibrate Battery", description: "Update battery capacity estimation from current firmware readings", area: "battery", risk: "safe", estimatedTimeMs: 1000, execute: simulateRepair("Battery recalibration") },
];

export class HelpEngine {
  getArticles(area?: string): HelpArticle[] {
    if (!area) return HELP_ARTICLES;
    return HELP_ARTICLES.filter(a => a.area === area);
  }

  getArticle(id: string): HelpArticle | undefined {
    return HELP_ARTICLES.find(a => a.id === id);
  }

  searchHelp(query: string): HelpArticle[] {
    const q = query.toLowerCase();
    return HELP_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    );
  }

  getRemediationActions(area?: string): RemediationAction[] {
    if (!area) return REMEDIATION_ACTIONS;
    return REMEDIATION_ACTIONS.filter(a => a.area === area);
  }

  async executeRemediation(id: string): Promise<{ success: boolean; message: string }> {
    const action = REMEDIATION_ACTIONS.find(a => a.id === id);
    if (!action) return { success: false, message: "Action not found" };
    return action.execute();
  }
}

let instance: HelpEngine | null = null;
export function getHelpEngine(): HelpEngine {
  if (!instance) instance = new HelpEngine();
  return instance;
}
