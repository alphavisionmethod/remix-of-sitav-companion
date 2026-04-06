// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Layer Barrel
// Import this to register all capability handlers
// ═══════════════════════════════════════════════════════════════

export { invokeCapability, listCapabilities, hasCapability, registerCapability } from "./capability-registry";

// Side-effect imports — register handlers on import
import "./files-capability";
import "./advisor-capability";
import "./connector-capability";
import "./money-capability";
