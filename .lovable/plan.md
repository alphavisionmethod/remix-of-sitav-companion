

# SITA OS — Surfaces/Window Runtime Layer + Device Capability/Trust Layer

## What Already Exists (NOT to duplicate)

### Surfaces/Windows (scattered, no unified truth layer)
- `useWindowManager.ts`: Window state, open/close/minimize/maximize, position memory
- `useWindowSnap.ts`: 7-zone snap detection, guide overlays
- `src/lib/design-system/snap-zones.ts`: Snap geometry engine
- `FloatingWindow.tsx`: Full drag/snap/resize implementation
- `WidgetGrid.tsx`: Widget layout with drag reorder, local `WIDGET_REGISTRY`
- `src/lib/nova-sdk/extensions/widget-registry.ts`: SDK-level widget manifest/placement registry
- `src/lib/nova-sdk/kernel/wayland.ts`: Simulated Wayland compositor
- `src/lib/engine/compositor-sim.ts`: Compositor simulation layer
- `WindowManagerContext.tsx`: React context for window manager
- `src/packages/contracts/runtime/unified-surface-runtime.ts`: Surface command/proof/degraded contracts
- `src/packages/contracts/native/desktop-host-runtime.ts`: Electron host vs renderer ownership contracts
- `session-persistence.ts`: Window snapshot serialization

### Devices (scattered, no unified truth layer)
- `src/lib/sync-engine/security/device-identity.ts`: Full DeviceIdentityManager (register, trust, heartbeat, fleet summary, 280 LOC)
- `src/lib/core-services/security/device-attestation-service.ts`: Device enrollment, boot integrity, attestation chain (453 LOC)
- `src/lib/core-services/security/security-fabric.ts`: Device attestation integration
- `src/lib/core-services/security/trust-boundary-model.ts`: Trust zones with device-trust requirements
- `src/lib/sync-engine/security/sync-policy.ts`: Device-trust policy conditions
- `src/packages/contracts/native/desktop-host-runtime.ts`: Desktop biometrics, TPM, file system capabilities

### Deployment (FULLY EXISTS — skip entirely)
- `src/lib/deployment/` has all 11 files: deployment-unit-registry, release-unit-map, rollback-behavior-map, health-probe-map, package-output-map, runtime-deployment-map, dependency-chain-map, edge-ingress-classification, ingress-topology-registry, ingress-owner-map, deployment-consequence-map

## What's Missing

### Surface/Window Layer — No single truth file answering:
- What surfaces exist and their runtime classification (real host vs simulated shell)
- What window capabilities each surface supports (snap, resize, minimize, maximize, tile)
- What layout persistence rules apply per surface
- What widget capabilities each surface supports
- What shell elements compose each surface
- What drag/snap behaviors are available per surface

### Device Layer — No unified registry answering:
- What device form factors exist in the ecosystem
- What capabilities each device class has
- What trust levels apply per device class
- What attestation methods each device class supports
- What biometric capabilities are available per device class
- How mobile vs desktop vs appliance capabilities differ

## Implementation Plan

### Area 1: Surface/Window Runtime Layer (7 files)

**`src/lib/surfaces/surface-runtime-registry.ts`**
Master registry of all OS surfaces. Each entry declares: surface ID, type (host-window | simulated-shell | hybrid), runtime target (browser | electron | mobile), compositor mode (react-dom | wayland-sim | native), supported window operations, max concurrent windows, z-layer range. Links to existing `unified-surface-runtime.ts` contracts and `useWindowManager`.

**`src/lib/surfaces/window-capability-matrix.ts`**
Per-surface window capability declarations: supports drag, resize, snap, minimize, maximize, tile, split-view, picture-in-picture, fullscreen, always-on-top. References existing snap-zones.ts config and FloatingWindow capabilities. Maps which surfaces get which subset of window behaviors.

**`src/lib/surfaces/layout-persistence-map.ts`**
Declares layout persistence rules per surface: what gets persisted (window positions, sizes, z-order, snap state, widget placements), storage backend (localStorage | sessionStorage | cloud), TTL, max entries. References existing `session-persistence.ts` and `useWindowManager`'s position memory.

**`src/lib/surfaces/widget-capability-matrix.ts`**
Per-surface widget capability declarations: supported widget sizes, max widget count, supports drag-reorder, supports resize, supports auto-refresh, supports permission-gated widgets. References existing `WidgetRegistry` and `WidgetGrid` capabilities.

**`src/lib/surfaces/shell-surface-map.ts`**
Maps which shell elements compose each surface: taskbar, dock, sidebar, launcher, notification center, control center, status bar, menu bar. Per-surface visibility and behavior rules. References existing shell components.

**`src/lib/surfaces/host-window-vs-simulated-map.ts`**
The key truth file: for each surface, declares whether windowing is host-native (Electron BrowserWindow), simulated (React FloatingWindow), or hybrid. Maps Electron IPC channels to simulated equivalents. References `desktop-host-runtime.ts` contracts.

**`src/lib/surfaces/drag-snap-behavior-map.ts`**
Per-surface drag/snap behavior rules: snap threshold, snap zones available, edge resistance, magnetic docking, multi-monitor support, touch drag behavior, keyboard-driven window movement. References existing `snap-zones.ts` and `useWindowSnap`.

**`src/lib/surfaces/index.ts`** — barrel export

### Area 2: Device Capability/Trust Layer (9 files)

**`src/lib/devices/device-identity-registry.ts`**
Unified device identity registry that re-exports and extends `sync-engine/security/device-identity.ts`. Adds ecosystem-level queries: get all devices across users (admin), device population statistics, device health dashboard data. Does NOT duplicate the DeviceIdentityManager — imports and extends it.

**`src/lib/devices/device-capability-registry.ts`**
Canonical registry of device capability classes. Each entry: capability ID, description, detection method (API probe | user-agent | IPC query), fallback behavior. Cross-references `DeviceCapabilities` from device-identity.ts and `DesktopHostCapabilities` from desktop-host-runtime.ts.

**`src/lib/devices/device-trust-registry.ts`**
Unified trust policy registry per device class. Maps trust levels to allowed operations, sync permissions, data access tiers. References `DeviceTrustLevel` from device-identity.ts and `TrustZone` from trust-boundary-model.ts. Does NOT duplicate — provides queryable policy layer on top.

**`src/lib/devices/device-attestation-map.ts`**
Per-device-class attestation requirements. Maps which attestation types (boot-integrity, app-integrity, biometric, remote-challenge) are required/optional/unavailable per device class. References `AttestationType` from device-attestation-service.ts.

**`src/lib/devices/ecosystem-device-map.ts`**
Full ecosystem device topology: what device form factors participate, what roles they play (primary workstation, mobile companion, shared kiosk, server appliance), what sync topology applies. High-level truth map for the device ecosystem.

**`src/lib/devices/mobile-device-capabilities.ts`**
Mobile-specific capability declarations: touch, gyroscope, camera, push notifications, biometrics (FaceID/TouchID), NFC, ARKit, background fetch, offline storage limits. Maps to existing mobile trust flows.

**`src/lib/devices/desktop-device-capabilities.ts`**
Desktop-specific capabilities: file system access, TPM, system tray, auto-update, deep links, clipboard, notifications, multi-monitor. Re-exports and extends `DesktopHostCapabilities` from contracts. Maps to Electron capabilities.

**`src/lib/devices/appliance-device-capabilities.ts`**
Appliance/server-specific capabilities: headless operation, fleet management, OTA updates, hardware monitoring, RAID, UPS detection. Maps to deployment appliance-iso unit.

**`src/lib/devices/biometric-capability-map.ts`**
Per-device-class biometric capability truth: what methods available (fingerprint, face, iris, pin), enrollment status detection, fallback chain, step-up auth triggers. References existing `BiometricCapability` from desktop-host-runtime.ts.

**`src/lib/devices/index.ts`** — barrel export

## Files Summary

| Category | Files | Action |
|----------|-------|--------|
| Surface/Window runtime | 8 (7 + barrel) | Create |
| Device capability/trust | 10 (9 + barrel) | Create |
| Deployment | 0 | Already complete |
| **Total** | **18** | **Create** |

## Implementation Order

1. Surface runtime registry + host-vs-simulated map (foundation)
2. Window + widget + drag-snap capability matrices (reference existing hooks)
3. Layout persistence + shell surface maps
4. Device identity + capability + trust registries (extend existing managers)
5. Device attestation + ecosystem + biometric maps
6. Per-form-factor capability files (mobile, desktop, appliance)
7. Barrel exports

## Key Principle: No Duplication

- Surface layer **references** existing `useWindowManager`, `useWindowSnap`, `snap-zones.ts`, `FloatingWindow`, `WidgetRegistry` — it does not reimplement them
- Device layer **imports and extends** existing `DeviceIdentityManager`, `DeviceAttestationService`, `DesktopHostCapabilities` — it does not duplicate them
- Deployment layer is **skipped entirely** — already fully implemented

