// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Fake Mode Service
// Mock connector for development/demo
// ═══════════════════════════════════════════════════════════════

export interface FakeModeConfig {
  enabled: boolean;
  latencyMs: number;
  failureRate: number;
  connectors: string[];
}

let fakeConfig: FakeModeConfig = {
  enabled: false,
  latencyMs: 100,
  failureRate: 0,
  connectors: [],
};

export function enableFakeMode(config?: Partial<FakeModeConfig>): FakeModeConfig {
  fakeConfig = { ...fakeConfig, enabled: true, ...config };
  return fakeConfig;
}

export function disableFakeMode(): void {
  fakeConfig.enabled = false;
}

export function isFakeModeEnabled(connectorId?: string): boolean {
  if (!fakeConfig.enabled) return false;
  if (connectorId && fakeConfig.connectors.length > 0) {
    return fakeConfig.connectors.includes(connectorId);
  }
  return true;
}

export function getFakeResponse(connectorId: string, action: string): { success: boolean; data: Record<string, unknown>; fake: true } {
  const shouldFail = Math.random() < fakeConfig.failureRate;
  return {
    success: !shouldFail,
    data: shouldFail
      ? { error: "Simulated failure", connectorId, action }
      : { connectorId, action, result: "synthetic-data", generatedAt: new Date().toISOString(), recordCount: Math.floor(Math.random() * 20) + 1 },
    fake: true,
  };
}

export function getFakeModeConfig(): FakeModeConfig {
  return { ...fakeConfig };
}
