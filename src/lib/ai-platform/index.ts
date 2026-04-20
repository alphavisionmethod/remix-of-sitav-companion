// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Platform: Canonical Barrel
//
// Single navigable root for the entire AI family. Replaces the
// historical sprawl of `src/lib/ai`, `ai-engineering`, `ai-gateway`,
// and `sovereign-ai-gateway` with one canonical home and four
// subdomains. The four legacy folders are kept as transparent
// re-export shims to preserve every existing import path.
//
// Canonical import:    import { Runtime, Gateway, Engineering, Sovereign } from "@/lib/ai-platform";
// Subdomain import:    import { invokeAICapability } from "@/lib/ai-platform/runtime";
// Legacy import (ok):  import { invokeAICapability } from "@/lib/ai";   // shim
// ═══════════════════════════════════════════════════════════════

export * as Runtime from "./runtime";
export * as Gateway from "./gateway";
export * as Engineering from "./engineering";
export * as Sovereign from "./sovereign";
