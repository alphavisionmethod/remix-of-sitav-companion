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
import "./finance-capabilities";
import "./business-capabilities";
import "./concierge-capabilities";
import "./system-capabilities";
import "./admin-capabilities";
import "./digital-presence-capabilities";
import "./investment-capabilities";
import "./workspace-capabilities";
import "./atlas-capabilities";
import "./enterprise-capabilities";
import "./app-platform-capabilities";
