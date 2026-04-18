// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Catalog
// Formal registry of all system capabilities with metadata
// ═══════════════════════════════════════════════════════════════

export type CapabilityRisk = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type CapabilityPrompt = 'silent' | 'inform' | 'confirm' | 'approve' | 'mfa';
export type CapabilityAudit = 'none' | 'basic' | 'detailed' | 'forensic';
export type CapabilityScope = 'user' | 'app' | 'system' | 'device' | 'network';

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  scope: CapabilityScope;
  risk: CapabilityRisk;
  prompt: CapabilityPrompt;
  audit: CapabilityAudit;
  defaultPolicy: 'allow' | 'deny' | 'ask';
  category: string;
  dependencies?: string[];
  deprecated?: boolean;
  sinceVersion?: string;
}

// ── Capability Catalog Singleton ──────────────────────────────

class CapabilityCatalog {
  private capabilities = new Map<string, CapabilityDefinition>();

  register(def: CapabilityDefinition): void {
    this.capabilities.set(def.id, def);
  }

  registerAll(defs: CapabilityDefinition[]): void {
    defs.forEach(d => this.register(d));
  }

  get(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  getByCategory(category: string): CapabilityDefinition[] {
    return [...this.capabilities.values()].filter(c => c.category === category);
  }

  getByRisk(risk: CapabilityRisk): CapabilityDefinition[] {
    return [...this.capabilities.values()].filter(c => c.risk === risk);
  }

  getByScope(scope: CapabilityScope): CapabilityDefinition[] {
    return [...this.capabilities.values()].filter(c => c.scope === scope);
  }

  all(): CapabilityDefinition[] {
    return [...this.capabilities.values()];
  }

  count(): number { return this.capabilities.size; }

  /** Check if a capability requires user prompt */
  requiresPrompt(id: string): boolean {
    const cap = this.capabilities.get(id);
    return !!cap && cap.prompt !== 'silent';
  }

  /** Get risk summary */
  riskSummary(): Record<CapabilityRisk, number> {
    const result: Record<CapabilityRisk, number> = { none: 0, low: 0, medium: 0, high: 0, critical: 0 };
    this.capabilities.forEach(c => result[c.risk]++);
    return result;
  }

  /** Search by name/description */
  search(query: string): CapabilityDefinition[] {
    const q = query.toLowerCase();
    return [...this.capabilities.values()].filter(c =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }
}

export const capabilityCatalog = new CapabilityCatalog();

// ── Register Core Capabilities ────────────────────────────────

const CORE_CAPABILITIES: CapabilityDefinition[] = [
  // Network
  { id: 'wifi.connect', name: 'Wi-Fi Connect', description: 'Connect to a wireless network', scope: 'network', risk: 'low', prompt: 'silent', audit: 'basic', defaultPolicy: 'allow', category: 'network' },
  { id: 'wifi.saved_credentials.read', name: 'Read Saved Wi-Fi Credentials', description: 'Access stored Wi-Fi passwords', scope: 'system', risk: 'high', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'deny', category: 'network' },
  { id: 'wifi.saved_credentials.write', name: 'Write Wi-Fi Credentials', description: 'Store Wi-Fi passwords', scope: 'system', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'network' },
  { id: 'network.vpn.connect', name: 'VPN Connect', description: 'Establish VPN tunnel', scope: 'network', risk: 'medium', prompt: 'inform', audit: 'basic', defaultPolicy: 'allow', category: 'network' },
  { id: 'network.firewall.modify', name: 'Modify Firewall Rules', description: 'Change firewall configuration', scope: 'system', risk: 'critical', prompt: 'approve', audit: 'forensic', defaultPolicy: 'deny', category: 'network' },
  { id: 'bluetooth.pair', name: 'Bluetooth Pair', description: 'Pair with Bluetooth device', scope: 'device', risk: 'low', prompt: 'confirm', audit: 'basic', defaultPolicy: 'ask', category: 'network' },

  // Security
  { id: 'shield.firewall.disable', name: 'Disable Firewall', description: 'Temporarily disable firewall protection', scope: 'system', risk: 'critical', prompt: 'mfa', audit: 'forensic', defaultPolicy: 'deny', category: 'security' },
  { id: 'shield.threat.quarantine', name: 'Quarantine Threat', description: 'Isolate detected threat', scope: 'system', risk: 'medium', prompt: 'inform', audit: 'detailed', defaultPolicy: 'allow', category: 'security' },
  { id: 'secrets.read', name: 'Read Secrets', description: 'Access encrypted secret store', scope: 'app', risk: 'high', prompt: 'confirm', audit: 'forensic', defaultPolicy: 'deny', category: 'security' },
  { id: 'secrets.write', name: 'Write Secrets', description: 'Store secrets in encrypted vault', scope: 'app', risk: 'high', prompt: 'confirm', audit: 'forensic', defaultPolicy: 'ask', category: 'security' },

  // System
  { id: 'system.update.install', name: 'Install System Update', description: 'Apply system update to device', scope: 'system', risk: 'high', prompt: 'approve', audit: 'detailed', defaultPolicy: 'ask', category: 'system' },
  { id: 'system.update.rollback', name: 'Rollback Update', description: 'Revert to previous system version', scope: 'system', risk: 'high', prompt: 'approve', audit: 'forensic', defaultPolicy: 'ask', category: 'system' },
  { id: 'system.reboot', name: 'System Reboot', description: 'Restart the operating system', scope: 'system', risk: 'medium', prompt: 'confirm', audit: 'basic', defaultPolicy: 'ask', category: 'system' },
  { id: 'system.safe_mode', name: 'Enter Safe Mode', description: 'Boot into safe mode', scope: 'system', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'system' },
  { id: 'system.factory_reset', name: 'Factory Reset', description: 'Erase all data and reset to defaults', scope: 'system', risk: 'critical', prompt: 'mfa', audit: 'forensic', defaultPolicy: 'deny', category: 'system' },

  // Drivers
  { id: 'driver.load', name: 'Load Driver', description: 'Load a device driver', scope: 'system', risk: 'medium', prompt: 'inform', audit: 'basic', defaultPolicy: 'allow', category: 'drivers' },
  { id: 'driver.load.third_party', name: 'Load Third-Party Driver', description: 'Load unsigned third-party driver', scope: 'system', risk: 'critical', prompt: 'approve', audit: 'forensic', defaultPolicy: 'deny', category: 'drivers' },
  { id: 'driver.rollback', name: 'Rollback Driver', description: 'Revert driver to previous version', scope: 'system', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'drivers' },

  // Apps
  { id: 'app.install', name: 'Install App', description: 'Install application from package', scope: 'app', risk: 'medium', prompt: 'confirm', audit: 'basic', defaultPolicy: 'ask', category: 'apps' },
  { id: 'app.uninstall', name: 'Uninstall App', description: 'Remove installed application', scope: 'app', risk: 'low', prompt: 'confirm', audit: 'basic', defaultPolicy: 'allow', category: 'apps' },
  { id: 'app.background.run', name: 'Run in Background', description: 'Allow app to run in background', scope: 'app', risk: 'low', prompt: 'inform', audit: 'basic', defaultPolicy: 'ask', category: 'apps' },
  { id: 'app.permissions.grant', name: 'Grant App Permissions', description: 'Grant permissions to application', scope: 'app', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'apps' },

  // Filesystem
  { id: 'fs.documents.readwrite', name: 'Document Access', description: 'Read/write user documents', scope: 'user', risk: 'medium', prompt: 'confirm', audit: 'basic', defaultPolicy: 'ask', category: 'filesystem' },
  { id: 'fs.system.write', name: 'System File Write', description: 'Write to system directories', scope: 'system', risk: 'critical', prompt: 'approve', audit: 'forensic', defaultPolicy: 'deny', category: 'filesystem' },
  { id: 'fs.removable.mount', name: 'Mount Removable Media', description: 'Mount external storage device', scope: 'device', risk: 'medium', prompt: 'inform', audit: 'basic', defaultPolicy: 'ask', category: 'filesystem' },

  // Power
  { id: 'power.suspend', name: 'Suspend System', description: 'Put system into sleep mode', scope: 'system', risk: 'low', prompt: 'silent', audit: 'basic', defaultPolicy: 'allow', category: 'power' },
  { id: 'power.hibernate', name: 'Hibernate', description: 'Hibernate system to disk', scope: 'system', risk: 'low', prompt: 'confirm', audit: 'basic', defaultPolicy: 'allow', category: 'power' },
  { id: 'power.shutdown', name: 'Shutdown', description: 'Power off the system', scope: 'system', risk: 'medium', prompt: 'confirm', audit: 'basic', defaultPolicy: 'ask', category: 'power' },

  // Audio/Media
  { id: 'audio.microphone', name: 'Microphone Access', description: 'Access microphone input', scope: 'app', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'media' },
  { id: 'audio.output.route', name: 'Audio Output Routing', description: 'Change audio output device', scope: 'user', risk: 'none', prompt: 'silent', audit: 'none', defaultPolicy: 'allow', category: 'media' },
  { id: 'camera.access', name: 'Camera Access', description: 'Access camera device', scope: 'app', risk: 'high', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'media' },

  // Privacy
  { id: 'privacy.telemetry.configure', name: 'Configure Telemetry', description: 'Change telemetry settings', scope: 'user', risk: 'low', prompt: 'inform', audit: 'basic', defaultPolicy: 'allow', category: 'privacy' },
  { id: 'privacy.data.export', name: 'Export User Data', description: 'Export all user data', scope: 'user', risk: 'medium', prompt: 'confirm', audit: 'detailed', defaultPolicy: 'ask', category: 'privacy' },
  { id: 'privacy.data.delete', name: 'Delete User Data', description: 'Permanently delete user data', scope: 'user', risk: 'critical', prompt: 'mfa', audit: 'forensic', defaultPolicy: 'deny', category: 'privacy' },
];

capabilityCatalog.registerAll(CORE_CAPABILITIES);
