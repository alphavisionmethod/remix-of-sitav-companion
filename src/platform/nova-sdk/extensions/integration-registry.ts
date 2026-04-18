// ═══════════════════════════════════════════════════════════════
// Nova SDK — Integration Registry
// Third-party service connectors with lifecycle management
// ═══════════════════════════════════════════════════════════════

export type IntegrationType = "oauth" | "api-key" | "webhook" | "native";
export type IntegrationStatus = "disconnected" | "connecting" | "connected" | "error";

export interface IntegrationManifest {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: IntegrationType;
  capabilities: string[];
  configSchema?: Record<string, { type: string; required?: boolean; label?: string }>;
  icon?: string;
}

export interface IntegrationInstance {
  manifest: IntegrationManifest;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  connectedAt?: number;
  lastError?: string;
}

class IntegrationRegistryClass {
  private integrations = new Map<string, IntegrationInstance>();

  registerIntegration(manifest: IntegrationManifest): void {
    if (this.integrations.has(manifest.id)) {
      console.warn(`[IntegrationRegistry] "${manifest.id}" already registered`);
      return;
    }
    this.integrations.set(manifest.id, {
      manifest,
      status: "disconnected",
      config: {},
    });
  }

  async connect(id: string, config: Record<string, unknown> = {}): Promise<boolean> {
    const instance = this.integrations.get(id);
    if (!instance) return false;

    instance.status = "connecting";
    instance.config = config;

    try {
      // Simulate connection handshake
      await new Promise(r => setTimeout(r, 200));
      instance.status = "connected";
      instance.connectedAt = Date.now();
      instance.lastError = undefined;
      return true;
    } catch (e) {
      instance.status = "error";
      instance.lastError = String(e);
      return false;
    }
  }

  disconnect(id: string): boolean {
    const instance = this.integrations.get(id);
    if (!instance) return false;
    instance.status = "disconnected";
    instance.config = {};
    instance.connectedAt = undefined;
    return true;
  }

  async invoke(id: string, action: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const instance = this.integrations.get(id);
    if (!instance) throw new Error(`Integration "${id}" not found`);
    if (instance.status !== "connected") throw new Error(`Integration "${id}" not connected`);
    if (!instance.manifest.capabilities.includes(action)) {
      throw new Error(`Integration "${id}" does not support action "${action}"`);
    }
    // In a real implementation this would call the actual API
    console.log(`[Integration] ${id}.${action}(`, params, ")");
    return { ok: true, action, params };
  }

  getIntegration(id: string): IntegrationInstance | undefined {
    return this.integrations.get(id);
  }

  getIntegrations(): IntegrationInstance[] {
    return Array.from(this.integrations.values());
  }

  reset(): void {
    this.integrations.clear();
  }

  getStats() {
    const all = this.getIntegrations();
    return {
      total: all.length,
      connected: all.filter(i => i.status === "connected").length,
      disconnected: all.filter(i => i.status === "disconnected").length,
      errored: all.filter(i => i.status === "error").length,
    };
  }
}

export const IntegrationRegistry = new IntegrationRegistryClass();
