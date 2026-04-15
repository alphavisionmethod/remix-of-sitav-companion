// ═══════════════════════════════════════════════════════════════
// SITA OS — Founder Plane Public API (Complete)
// Strategic command, simulations, AI cost governance, objectives.
// May depend on: shared. Must NOT import from os/admin/mobile.
// ═══════════════════════════════════════════════════════════════

// ── Environment Config ──
export { environmentConfig } from "@/lib/platform-plane/environment-config";
export type { EnvironmentKey, EnvironmentInfo } from "@/lib/platform-plane/environment-config";

// ── Plane Registry ──
export { planeRegistry } from "@/lib/platform-plane/plane-registry";
export type { PlaneKey, PlaneInfo } from "@/lib/platform-plane/plane-registry";

// ── Service Auth ──
export { serviceAuth } from "@/lib/platform-plane/service-auth";
export type { ServiceIdentity, ServiceToken } from "@/lib/platform-plane/service-auth";

// ── Strategic Intelligence ──
export * from "@/lib/strategic-intelligence";

// ── Compute Governance ──
export * from "@/lib/compute-governance";

// ── Intelligence Architecture ──
export * from "@/lib/intelligence-architecture";

// ── Delivery Methodology ──
export * from "@/lib/delivery-methodology";
