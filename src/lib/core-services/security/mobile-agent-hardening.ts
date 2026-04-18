// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile App & OS Agent Hardening
// Biometric gates, device enrollment, root detection, mutual auth,
// command signing, replay protection, flood resilience
// Covers: Master Prompt Sections 28, 29
// ═══════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────

export type BiometricStatus = "available" | "unavailable" | "locked-out" | "not-enrolled";
export type DeviceEnrollmentStatus = "enrolled" | "pending" | "revoked" | "unknown";
export type AgentAuthStatus = "authenticated" | "unauthenticated" | "expired" | "revoked";
export type RootDetectionResult = "clean" | "rooted" | "jailbroken" | "emulated" | "unknown";

export interface MobileDeviceState {
  deviceId: string;
  platform: "ios" | "android" | "web";
  enrollmentStatus: DeviceEnrollmentStatus;
  biometricStatus: BiometricStatus;
  rootDetection: RootDetectionResult;
  appAttestationPassed: boolean;
  sessionExpiresAt: string | null;
  sensitiveModeTTLMs: number;
  lastBiometricAt: string | null;
  pushTokenVerified: boolean;
  trustedSince: string | null;
}

export interface AgentState {
  agentId: string;
  authStatus: AgentAuthStatus;
  mutualAuthCompleted: boolean;
  lastHandshakeAt: string | null;
  replayWindow: Map<string, number>; // nonce → timestamp
  replayWindowMs: number;
  commandsProcessed: number;
  commandsRejected: number;
  floodThreshold: number; // max commands per minute
  commandsThisMinute: number;
  minuteResetAt: number;
  localPolicyVersion: string;
  telemetryIntegrityHash: string | null;
}

export interface CommandVerification {
  commandId: string;
  signatureValid: boolean;
  replayDetected: boolean;
  withinScope: boolean;
  policyAllowed: boolean;
  floodDetected: boolean;
  reason: string;
  allowed: boolean;
}

export interface EnrollmentCeremony {
  id: string;
  deviceId: string;
  platform: string;
  startedAt: string;
  completedAt: string | null;
  steps: Array<{ step: string; status: "pending" | "passed" | "failed"; timestamp: string | null }>;
  status: "in-progress" | "completed" | "failed" | "revoked";
}

export interface MobileHardeningEvent {
  id: string;
  timestamp: string;
  type: "biometric-challenge" | "root-detected" | "attestation-fail" | "session-expired" | "device-enrolled" | "device-revoked" | "push-verified" | "command-rejected" | "flood-detected" | "replay-detected" | "mutual-auth" | "scope-violation";
  deviceId: string;
  severity: "info" | "warn" | "error" | "critical";
  description: string;
  context: Record<string, unknown>;
}

// ── Mobile Hardening ──────────────────────────────────────────

export class MobileAgentHardening {
  private devices = new Map<string, MobileDeviceState>();
  private agents = new Map<string, AgentState>();
  private enrollments = new Map<string, EnrollmentCeremony>();
  private events: MobileHardeningEvent[] = [];
  private listeners: Array<(event: MobileHardeningEvent) => void> = [];
  private readonly maxEvents = 500;

  // ── Device Management ─────────────────────────────────────

  enrollDevice(deviceId: string, platform: MobileDeviceState["platform"]): EnrollmentCeremony {
    const ceremony: EnrollmentCeremony = {
      id: `enroll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      deviceId, platform, startedAt: new Date().toISOString(), completedAt: null, status: "in-progress",
      steps: [
        { step: "identity-verification", status: "pending", timestamp: null },
        { step: "device-attestation", status: "pending", timestamp: null },
        { step: "biometric-enrollment", status: "pending", timestamp: null },
        { step: "push-token-verification", status: "pending", timestamp: null },
        { step: "key-exchange", status: "pending", timestamp: null },
      ],
    };
    this.enrollments.set(ceremony.id, ceremony);

    // Simulate successful enrollment
    for (const step of ceremony.steps) {
      step.status = "passed";
      step.timestamp = new Date().toISOString();
    }
    ceremony.status = "completed";
    ceremony.completedAt = new Date().toISOString();

    const device: MobileDeviceState = {
      deviceId, platform, enrollmentStatus: "enrolled",
      biometricStatus: "available", rootDetection: "clean",
      appAttestationPassed: true, sessionExpiresAt: new Date(Date.now() + 3600000).toISOString(),
      sensitiveModeTTLMs: 300000, lastBiometricAt: null, pushTokenVerified: true,
      trustedSince: new Date().toISOString(),
    };
    this.devices.set(deviceId, device);
    this.emit("device-enrolled", deviceId, "info", `Device ${deviceId} enrolled on ${platform}`, { platform });

    return ceremony;
  }

  revokeDevice(deviceId: string, reason: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    device.enrollmentStatus = "revoked";
    device.sessionExpiresAt = null;
    this.emit("device-revoked", deviceId, "critical", `Device ${deviceId} revoked: ${reason}`, { reason });
    return true;
  }

  getDevice(deviceId: string): MobileDeviceState | null { return this.devices.get(deviceId) ?? null; }
  getAllDevices(): MobileDeviceState[] { return Array.from(this.devices.values()); }

  // ── Biometric Gate ────────────────────────────────────────

  requireBiometric(deviceId: string): { required: boolean; reason: string } {
    const device = this.devices.get(deviceId);
    if (!device) return { required: true, reason: "Unknown device" };
    if (device.biometricStatus !== "available") return { required: false, reason: "Biometric unavailable" };
    if (!device.lastBiometricAt) return { required: true, reason: "Never verified" };
    const age = Date.now() - new Date(device.lastBiometricAt).getTime();
    if (age > device.sensitiveModeTTLMs) return { required: true, reason: `Last verification ${Math.round(age / 1000)}s ago (TTL: ${device.sensitiveModeTTLMs / 1000}s)` };
    return { required: false, reason: "Recently verified" };
  }

  completeBiometric(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastBiometricAt = new Date().toISOString();
      this.emit("biometric-challenge", deviceId, "info", "Biometric verification completed", {});
    }
  }

  // ── Root/Jailbreak Detection ──────────────────────────────

  performRootDetection(deviceId: string): RootDetectionResult {
    const device = this.devices.get(deviceId);
    if (!device) return "unknown";

    // Simulated heuristics
    const indicators = [
      typeof globalThis !== "undefined" && "Cydia" in (globalThis as Record<string, unknown>),
      typeof globalThis !== "undefined" && "su" in (globalThis as Record<string, unknown>),
    ];

    const result: RootDetectionResult = indicators.some(Boolean) ? (device.platform === "ios" ? "jailbroken" : "rooted") : "clean";
    device.rootDetection = result;

    if (result !== "clean") {
      this.emit("root-detected", deviceId, "critical", `Device ${deviceId} detected as ${result}`, { result });
    }

    return result;
  }

  // ── App Attestation ───────────────────────────────────────

  verifyAttestation(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;
    // Simulated: pass if enrolled and clean
    const passed = device.enrollmentStatus === "enrolled" && device.rootDetection === "clean";
    device.appAttestationPassed = passed;
    if (!passed) {
      this.emit("attestation-fail", deviceId, "error", `Attestation failed for ${deviceId}`, { enrollmentStatus: device.enrollmentStatus, rootDetection: device.rootDetection });
    }
    return passed;
  }

  // ── OS Agent Management ───────────────────────────────────

  registerAgent(agentId: string): void {
    this.agents.set(agentId, {
      agentId, authStatus: "unauthenticated", mutualAuthCompleted: false,
      lastHandshakeAt: null, replayWindow: new Map(), replayWindowMs: 300000,
      commandsProcessed: 0, commandsRejected: 0,
      floodThreshold: 120, commandsThisMinute: 0, minuteResetAt: Date.now() + 60000,
      localPolicyVersion: "1.0.0", telemetryIntegrityHash: null,
    });
  }

  performMutualAuth(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    // Simulated mutual TLS handshake
    agent.mutualAuthCompleted = true;
    agent.authStatus = "authenticated";
    agent.lastHandshakeAt = new Date().toISOString();
    this.emit("mutual-auth", agentId, "info", `Agent ${agentId} mutual auth completed`, {});
    return true;
  }

  // ── Command Verification ──────────────────────────────────

  verifyCommand(agentId: string, commandId: string, nonce: string, scope: string): CommandVerification {
    const agent = this.agents.get(agentId);
    if (!agent) return { commandId, signatureValid: false, replayDetected: false, withinScope: false, policyAllowed: false, floodDetected: false, reason: "Unknown agent", allowed: false };

    // Signature check (simulated)
    const signatureValid = agent.authStatus === "authenticated";

    // Replay protection
    const existingNonce = agent.replayWindow.get(nonce);
    const replayDetected = existingNonce !== undefined;
    if (!replayDetected) {
      agent.replayWindow.set(nonce, Date.now());
      // Evict old nonces
      const cutoff = Date.now() - agent.replayWindowMs;
      for (const [key, ts] of agent.replayWindow) { if (ts < cutoff) agent.replayWindow.delete(key); }
    }

    // Flood detection
    if (Date.now() > agent.minuteResetAt) { agent.commandsThisMinute = 0; agent.minuteResetAt = Date.now() + 60000; }
    agent.commandsThisMinute++;
    const floodDetected = agent.commandsThisMinute > agent.floodThreshold;

    // Scope validation (simulated)
    const withinScope = !scope.includes("kernel") && !scope.includes("admin-bypass");
    const policyAllowed = agent.authStatus === "authenticated" && !floodDetected;

    const allowed = signatureValid && !replayDetected && withinScope && policyAllowed && !floodDetected;

    if (allowed) agent.commandsProcessed++;
    else {
      agent.commandsRejected++;
      const reasons: string[] = [];
      if (!signatureValid) reasons.push("invalid-signature");
      if (replayDetected) reasons.push("replay-detected");
      if (!withinScope) reasons.push("scope-violation");
      if (floodDetected) reasons.push("flood-detected");
      const type = replayDetected ? "replay-detected" : floodDetected ? "flood-detected" : "command-rejected";
      this.emit(type, agentId, replayDetected || floodDetected ? "error" : "warn", `Command ${commandId} rejected: ${reasons.join(", ")}`, { commandId, reasons });
    }

    return { commandId, signatureValid, replayDetected, withinScope, policyAllowed, floodDetected, reason: allowed ? "OK" : "Rejected", allowed };
  }

  getAgent(agentId: string): AgentState | null { return this.agents.get(agentId) ?? null; }
  getAllAgents(): Array<Omit<AgentState, "replayWindow"> & { replayWindowSize: number }> {
    return Array.from(this.agents.values()).map(({ replayWindow, ...rest }) => ({ ...rest, replayWindowSize: replayWindow.size }));
  }

  // ── Events ────────────────────────────────────────────────

  private emit(type: MobileHardeningEvent["type"], deviceId: string, severity: MobileHardeningEvent["severity"], description: string, context: Record<string, unknown>): void {
    const event: MobileHardeningEvent = { id: `mh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString(), type, deviceId, severity, description, context };
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events = this.events.slice(-this.maxEvents);
    for (const l of this.listeners) { try { l(event); } catch { /* swallow */ } }
  }

  getEvents(limit = 50): MobileHardeningEvent[] { return this.events.slice(-limit); }

  onEvent(listener: (event: MobileHardeningEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  // ── Metrics ───────────────────────────────────────────────

  getMetrics() {
    const devices = Array.from(this.devices.values());
    const agents = Array.from(this.agents.values());
    return {
      totalDevices: devices.length,
      enrolledDevices: devices.filter((d) => d.enrollmentStatus === "enrolled").length,
      revokedDevices: devices.filter((d) => d.enrollmentStatus === "revoked").length,
      rootedDevices: devices.filter((d) => d.rootDetection !== "clean").length,
      attestationsPassed: devices.filter((d) => d.appAttestationPassed).length,
      totalAgents: agents.length,
      authenticatedAgents: agents.filter((a) => a.authStatus === "authenticated").length,
      totalCommandsProcessed: agents.reduce((a, ag) => a + ag.commandsProcessed, 0),
      totalCommandsRejected: agents.reduce((a, ag) => a + ag.commandsRejected, 0),
      totalEvents: this.events.length,
    };
  }
}

// ── Factory ───────────────────────────────────────────────────

export function createMobileAgentHardening(): MobileAgentHardening {
  return new MobileAgentHardening();
}
