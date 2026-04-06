// ═══════════════════════════════════════════════════════════════
// SITA OS — MSA Contract: Shell Implementations
// Each surface has a concrete shell that adapts the core runtime
// ═══════════════════════════════════════════════════════════════

import type { ShellType, SurfaceKey } from "./surface-types";

export interface ShellCapability {
  capabilityKey: string;
  supported: boolean;
  interactionPattern: string;
  constraints?: string[];
}

export interface ShellManifest {
  shellType: ShellType;
  surfaceKey: SurfaceKey;
  version: string;
  technologyStack: string[];
  capabilities: ShellCapability[];
  entryPoint: string;
  configPath?: string;
}

/** Laws of the sovereign runtime — every shell must obey */
export const SOVEREIGN_LAWS = [
  "One core runtime — no second business logic stack per surface",
  "One contract vocabulary — no web-only truth model",
  "One workflow language — no alternate state semantics by surface",
  "One trust/proof model — receipts, lineage, approvals stay canonical",
  "Surfaces adapt presentation, not core truth",
  "Future surfaces consume capabilities, not page logic",
] as const;

export type SovereignLaw = typeof SOVEREIGN_LAWS[number];

/** Web shell manifest — the first and richest shell */
export const WEB_SHELL_MANIFEST: ShellManifest = {
  shellType: "WebShell",
  surfaceKey: "web",
  version: "1.0.0",
  technologyStack: ["React 18", "Vite 5", "Tailwind CSS", "TypeScript", "Supabase"],
  entryPoint: "src/main.tsx",
  configPath: "vite.config.ts",
  capabilities: [],
};
