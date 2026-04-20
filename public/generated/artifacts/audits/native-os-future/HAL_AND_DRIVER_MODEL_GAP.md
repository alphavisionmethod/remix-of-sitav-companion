# HAL & Driver Model — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

A hardware abstraction layer with a stable driver ABI, kernel-mode driver loading, signed third-party drivers, GPU/storage/network/USB/Bluetooth/audio stacks, and a driver certification program.

## What SITA OS actually does today

- Uses host-OS device APIs (Web USB / Web Bluetooth / Electron native modules / Linux device files).
- Has **no** driver model of its own.
- Cannot accept third-party hardware drivers.

## Honesty boundary

- ❌ No "we support hardware X via our driver" claims.
- ✅ "SITA OS uses the host platform's device support" is accurate.
