// ═══════════════════════════════════════════════════════════════
// SITA OS — Verification Module Views (Phase 5 wave 1)
//
// Canonical home for verification sub-board screens. The files in
// src/pages/admin/verification/V0*.tsx are now thin re-export shims
// pointing here. Future consumers should import from this barrel.
// ═══════════════════════════════════════════════════════════════
export { default as V01SurfaceInventoryBoard } from "./V01SurfaceInventoryBoard";
export { default as V02InteractionCoverageBoard } from "./V02InteractionCoverageBoard";
export { default as V03P0JourneyBoard } from "./V03P0JourneyBoard";
export { default as V04ModeVerificationBoard } from "./V04ModeVerificationBoard";
export { default as V06EvidenceExplorer } from "./V06EvidenceExplorer";
export { default as V07LaunchBlockerBoard } from "./V07LaunchBlockerBoard";
export { default as LaunchHonestyBoard } from "./LaunchHonestyBoard";
