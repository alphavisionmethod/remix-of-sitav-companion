

# OS Subsystem Enhancement Plan: PolicyD + Onboarding + UpdateD

## Current State Assessment

### PolicyD (policyd.ts — 277 lines)
- Has basic RBAC, capability checks, environmental context, deny-by-default, decision logging
- **Missing**: Device modes (home/work/school/kiosk/guest), policy bundles, signed policy validation, policy schema/YAML format, effective policy merge, precedence engine, simulate/explain APIs, contextual battery/presentation/network decisions, policy caching

### Onboarding (OSSetupExperience.tsx — 1136 lines + 47 step components)
- Has 24-phase flow with personalization ceremony, persistence, orchestration engine
- **Missing**: OS-level policy-driven defaults, device protection "wow" card, hardware detection integration, update preflight during setup, restore/import from backup, secure foundation wiring to policyd/shieldd, resumable state machine with required-completion markers

### UpdateD (system-updates/index.ts — 143 lines + UpdateCenterWindow.tsx — 315 lines)
- Has basic check/download/log/rollback with DB persistence, channel switching, UI
- **Missing**: A/B slot model, atomic staging, signature verification, health validation, boot success markers, preflight policy checks (battery/storage/network), delta updates, recovery integration, real rollback state machine

## Implementation Plan

### Batch 1: Enhanced PolicyD Core (3 files)

**`src/lib/os-security/policyd-bundles.ts`** (~350 lines)
- `DeviceMode` type: home | work | school | kiosk | guest_demo
- `PolicyBundle` interface: id, source (platform/org/device/user/session), version, signed, content hash, active, raw policy content
- `PolicyPrecedence` engine: hardcoded invariants > signed platform > org > device > mode > user > session overrides
- `EffectivePolicy` merge: deep-merge with precedence, invariant protection (e.g., `baseline_firewall_required` cannot be weakened)
- Default policy bundles for each device mode (YAML-equivalent JS objects covering wifi, shield, bluetooth, power, updates, privacy, apps, kernel domains)
- Policy validation: schema check, signature stub verification, version compatibility
- Bundle install/uninstall/activate/deactivate lifecycle

**`src/lib/os-security/policyd-decisions.ts`** (~250 lines)
- Enhanced `PolicyContext` with battery_percent, charging, presentation_active, network_type, managed_device, device_mode, threat_posture, update_state
- Contextual decision engine: evaluates all environmental factors (not just role/capability)
- Example rules: block open Wi-Fi on school mode, auto-VPN on public wifi, deny BT pair while locked, block update if battery < 40%, require charger for firmware
- Decision output: allow/deny/allow-with-prompt/allow-with-elevation/allow-forced + reason_code + policy_source + can_override + audit_severity + UX message
- `policy.simulate()` API: dry-run without side effects
- `policy.explain()` API: returns full decision chain with sources

**Modify `src/lib/os-security/policyd.ts`** — Integrate bundles + enhanced decisions
- Add `switchDeviceMode()`, `getEffectivePolicy()`, `installBundle()`, `validateBundle()`, `simulateAction()`, `getActiveConstraints()`, `evaluateUpdatePreflight()`, `evaluateOnboardingDefaults()`
- Wire enhanced contextual decision engine into `evaluate()`
- Add policy cache with TTL and invalidation

### Batch 2: Update Daemon (updated) — 2 files

**`src/lib/os-security/updated.ts`** (~400 lines)
- `UpdateDaemon` class: full lifecycle state machine (Idle → Checking → Downloading → Staging → AwaitingReboot → Validating → Succeeded/Failed/RolledBack)
- A/B slot model: SlotA (current), SlotB (target), with boot attempt tracking
- Signature verification stub (SHA-256 checksum validation)
- Preflight checks: battery threshold, charger requirement, storage, filesystem health, network suitability, channel eligibility, policy approval
- Download with resume support (byte tracking)
- Staging to inactive slot with integrity verification
- Health validation after "boot": kernel, root FS, policyd, sessiond, UI shell, networking, shieldd, powerd, crash loop detection, boot time threshold
- Rollback trigger logic: auto-rollback on health failure, boot failure, service failure
- Boot success marker management
- Release channel management (stable/beta/dev with policy-driven eligibility)
- Integration with policyd for all preflight decisions
- Audit event emission for every state transition

**Modify `src/lib/os-security/index.ts`** — Add `updated` to boot sequence and barrel exports

### Batch 3: Onboarding Enhancement — 2 files

**`src/lib/os-security/onboardingd.ts`** (~300 lines)
- `OnboardingDaemon` class: persistent state machine for first-boot
- Step definitions: welcome, region/timezone, accessibility, network, account/security, privacy/security-defaults, restore/import, update-check, device-optimization, finish
- Required vs optional step tracking with validation per step
- Resumable flow: save/restore state on interruption
- Hardware detection: battery, TPM, biometric, network devices
- Policy-driven defaults: queries policyd for initial settings per device mode
- Guarded transitions: cannot skip required steps, cannot launch desktop until markers set
- Integration with policyd (apply protection defaults), shieldd (firewall/VPN), powerd (battery optimization)
- Completion markers gate desktop launch

**`src/components/sita/onboarding/DeviceProtectionWow.tsx`** (~200 lines)
- Premium "Device Protection Setup" card during onboarding
- Shows: Firewall baseline (On), VPN on public Wi-Fi (Recommended), Smart threat blocking (On), Quiet mode schedule (Optional)
- Each item shows policy source, required vs optional, plain-language benefit
- Accept All / Review Each toggle
- Animated shield/lock icons with glassmorphic cards
- Persists choices to policyd + shieldd + powerd

### Batch 4: Enhanced Update Center UI — 1 file

**Modify `src/components/sita/shell/windows/UpdateCenterWindow.tsx`**
- Add preflight checks panel: battery bar, storage bar, network status, policy approval indicator
- Add A/B slot visualization: two-slot diagram showing active/inactive/pending states
- Add health validation results panel after update
- Add rollback reason display with human-readable messages
- Add signature verification status badges
- Add estimated time and size display
- Replace simulated progress with UpdateDaemon state integration
- Add recovery mode panel

### Batch 5: Wiring & Integration — 3 files

**Modify `src/lib/os-security/controlcenterd.ts`** — Add service routing for `update.*` and `onboarding.*` actions + device mode to environment

**Modify `src/lib/os-security/types.ts`** — Add update/onboarding action policies to ACTION_AUTHORIZATION_TABLE and capabilities to CAPABILITY_REGISTRY

**Modify `src/hooks/useOSSecurity.ts`** — Expose `deviceMode`, `switchDeviceMode()`, `getUpdateState()`, `getOnboardingState()` from hook

### Batch 6: Integration Flows — 1 file

**`src/lib/os-security/flows/os-subsystem-flows.ts`** (~200 lines)
- End-to-end flow implementations:
  - Open Wi-Fi on school device: wifid → policyd (deny) → audit
  - Public Wi-Fi detected: wifid → policyd → shieldd (auto-VPN) → notifyd
  - BT pair while locked: lockscreen → policyd (deny) → explanation
  - First boot: onboardingd → required steps → account → policy defaults → update check → launch
  - Update with rollback: discover → preflight → stage → validate → success/rollback

## Design Language
All UI follows existing SITA OS patterns: dark glassmorphic cards, `hsl(265 55% 58%)` purple, `hsl(38 85% 58%)` gold, Space Grotesk display, Inter body, Framer Motion animations, Nova SDK components.

## File Summary
- **Create**: policyd-bundles.ts, policyd-decisions.ts, updated.ts, onboardingd.ts, DeviceProtectionWow.tsx, os-subsystem-flows.ts (6 files)
- **Modify**: policyd.ts, index.ts, controlcenterd.ts, types.ts, useOSSecurity.ts, UpdateCenterWindow.tsx (6 files)
- **Total**: 12 files, ~2500 lines of new/modified code

