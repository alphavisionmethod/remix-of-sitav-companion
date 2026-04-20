# SITA OS — Product Reality Tiers

> Canonical 4-tier model. Authoritative source: `src/lib/runtime/runtime-tier-model.ts`.

## The Four Tiers

| Tier | ID | Host Authority | Honest OS Authority |
|------|----|----------------|---------------------|
| **1 — Web Application** | `WEB_APP` | browser-sandbox | ❌ |
| **2 — Desktop Host** | `DESKTOP_HOST` | host-bridge | ❌ |
| **3 — Appliance Runtime** | `APPLIANCE_RUNTIME` | appliance-runtime | ✅ |
| **4 — Simulated OS Experience** | `SIMULATED_OS_EXPERIENCE` | ux-only | ❌ |

### Tier 1 — Web Application
Browser-first. Sandbox-bound. May simulate desktop UX, but **must not** claim host privilege, kernel access, or unrestricted filesystem.

### Tier 2 — Desktop Host (Electron)
Host-bridge gives richer file integration, native notifications, auto-updates, and window control. **Wraps** the OS — does not become the OS.

### Tier 3 — Appliance Runtime (ISO/OVA)
Packaged appliance with first-boot ceremony, recovery, OTA agent. The only tier where claims of "managed runtime authority" are honest. Bespoke-kernel claims still require real implementation.

### Tier 4 — Simulated OS Experience
The UX/interaction grammar (dock, windows, lock screen, control center) that *looks* like an OS. Pure presentation. Renders on Tier 1/2/3.

## Hard Rules

1. Every runtime-sensitive feature MUST declare supported / simulated / prohibited / roadmap tiers in `src/lib/runtime/feature-tier-registry.ts`.
2. Surfaces MUST consume `useCapability(id)` rather than assume capability presence.
3. Unsupported tiers MUST fail honestly — explain why, offer a fallback, never silently hide.
4. The Simulated OS layer must NEVER claim host authority. Where it imitates OS behavior, it must be marked `simulated` per `SURFACE_SIMULATION_RULES`.
5. Web pages MUST NOT import appliance modules or Electron preload modules directly. Use the runtime context.

## Files

- `src/lib/runtime/runtime-tier-model.ts` — canonical 4-Tier model
- `src/lib/runtime/runtime-detection.ts` — active-tier detection
- `src/lib/runtime/runtime-context.tsx` — `<RuntimeTierProvider>` + hooks
- `src/lib/runtime/feature-tier-registry.ts` — feature → tier classification
- `src/lib/runtime/runtime-capability-matrix.ts` — capability matrix
- `src/lib/runtime/web/` — web tier contracts
- `src/lib/runtime/desktop/` — desktop tier contracts
- `src/lib/runtime/appliance/` — appliance tier contracts
- `src/lib/runtime/simulation/` — simulated OS layer contracts
- `src/lib/runtime/launch-honesty-rules.ts` — anti-drift rules
- `src/lib/runtime/portability-rules.ts` — cross-tier import boundaries
- `src/lib/migration/runtime-feature-classification-map.ts` — file-level classification
- `src/lib/migration/runtime-conflict-map.ts` — known conflicts

## Governance

CI gate: `bun run scripts/runtime/run-runtime-tier-governance.ts` →
`generated/runtime-tier-governance-report.json` + `RUNTIME_TIER_GOVERNANCE_REPORT.md`.
