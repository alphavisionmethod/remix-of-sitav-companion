// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Module Barrel Export
// ═══════════════════════════════════════════════════════════════

// Batch 1 — Detection & Monitoring
export * from "./intrusion-detection-engine";
export * from "./audit-trail-engine";
export * from "./device-attestation-service";

// Batch 2 — Enforcement & Governance
export * from "./resource-governor";
export * from "./zero-trust-validator";
export * from "./ai-trust-enforcer";
export * from "./human-factor-guard";

// Batch 3 — Reliability & Resilience
export * from "./event-consistency-engine";
export * from "./update-safety-system";
export * from "./chaos-testing-framework";

// Batch 4 — Integration Fabric
export * from "./security-fabric";

// Legacy re-export (selective to avoid conflicts)
export { SecurityPostureEngine, createSecurityPostureEngine } from "./security-posture-engine";
