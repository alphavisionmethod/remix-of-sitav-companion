# SITA OS — Runtime Tier Governance Report

> Generated: 2026-04-16T18:46:28.106Z

**Status:** 6/6 checks passed (100%)

## 4-Tier Model

| Tier | ID | Host Authority | Honest OS |
|------|----|----------------|----------|
| 1 — Web Application | `WEB_APP` | browser-sandbox | ❌ |
| 2 — Desktop Host | `DESKTOP_HOST` | host-bridge | ❌ |
| 3 — Appliance Runtime | `APPLIANCE_RUNTIME` | appliance-runtime | ✅ |
| 4 — Simulated OS | `SIMULATED_OS_EXPERIENCE` | ux-only | ❌ |

## Checks

| Check | Status | Exit |
|-------|--------|------|
| feature-tier-classification | ✅ | 0 |
| runtime-capability-enforcement | ✅ | 0 |
| launch-honesty | ✅ | 0 |
| desktop-bridge-isolation | ✅ | 0 |
| appliance-isolation | ✅ | 0 |
| simulated-os-truth | ✅ | 0 |

## Detailed Output

### feature-tier-classification

```
📋 48 runtime-tiered features registered
✅ check-feature-tier-classification: All checks passed
```

### runtime-capability-enforcement

```
🛡️  0/1 runtime-sensitive call sites have a capability gate
  ⚠️ [ungated-capability] src/hooks/use-realtime-notifications.ts: Uses runtime-sensitive API for "any-electron-bridge" without a capability gate
--- stderr ---
⚠️ check-runtime-capability-enforcement: 1 warning(s)
```

### launch-honesty

```
📣 Scanned 1900 files, 0 claims flagged for review
✅ check-launch-honesty: All checks passed
```

### desktop-bridge-isolation

```
🔒 1937 files scanned, 0 desktop-bridge leaks
✅ check-desktop-bridge-isolation: All checks passed
```

### appliance-isolation

```
📦 1008 pages scanned, 0 appliance-isolation breaches
✅ check-appliance-isolation: All checks passed
```

### simulated-os-truth

```
🎭 6 simulated-surface files checked, 6 missing disclosure
  ⚠️ [missing-disclosure] src/components/sita/boot/BootAccessibilityShortcut.tsx: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
  ⚠️ [missing-disclosure] src/components/sita/boot/BootHandoffTransition.tsx: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
  ⚠️ [missing-disclosure] src/components/sita/boot/BootRecoveryCard.tsx: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
  ⚠️ [missing-disclosure] src/components/sita/boot/HardwareDetectionPanel.tsx: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
  ⚠️ [missing-disclosure] src/components/sita/boot/SecureInitCeremony.tsx: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
  ⚠️ [missing-disclosure] src/components/sita/boot/bootStatePersistence.ts: boot-sequence surface lacks tier disclosure. Boot UI must reference simulation context outside APPLIANCE_RUNTIME.
--- stderr ---
⚠️ check-simulated-os-truth: 6 warning(s)
```

