

# SITA OS — Anti-Piracy & License Protection System

## Problem

SITA OS currently has **zero licensing or anti-piracy protection**. The Electron app can be freely copied, redistributed, and run on any machine without validation. There is no license key system, no hardware binding, no tamper detection, and no server-side license verification.

## Strategy: Defense in Depth (5 Layers)

No single protection is unbreakable. The goal is to make piracy economically unattractive by stacking multiple layers.

```text
┌─────────────────────────────────────────┐
│  Layer 5: Server-Side License Gate      │  ← Hardest to bypass
│  (Edge function validates license+device)│
├─────────────────────────────────────────┤
│  Layer 4: Hardware-Bound Licensing      │
│  (Machine fingerprint tied to license)  │
├─────────────────────────────────────────┤
│  Layer 3: Tamper Detection              │
│  (ASAR integrity check, code signing)   │
├─────────────────────────────────────────┤
│  Layer 2: Heartbeat & Phone-Home        │
│  (Periodic online validation)           │
├─────────────────────────────────────────┤
│  Layer 1: Obfuscation & Binary Shield   │
│  (Code obfuscation, anti-debug)         │
└─────────────────────────────────────────┘
```

## Implementation Plan

### Database Migration — License Tables

Create 3 new tables with RLS:

- **`licenses`** — `id`, `user_id`, `license_key` (unique), `product_tier`, `status` (active/suspended/revoked), `max_devices`, `issued_at`, `expires_at`
- **`license_activations`** — `id`, `license_id`, `device_fingerprint`, `device_name`, `platform`, `activated_at`, `last_heartbeat`, `is_active`
- **`license_audit_log`** — `id`, `license_id`, `event` (activated/deactivated/revoked/heartbeat_failed/tamper_detected), `device_fingerprint`, `ip_address`, `details`, `created_at`

RLS: All scoped to `auth.uid() = user_id` (via join to licenses). Audit log insert-only for authenticated users.

### File 1: `electron/license-guard.cjs` — Hardware Fingerprinting & License Validation

The core anti-piracy module for the Electron main process:

- **Machine fingerprint**: Generates a deterministic hardware ID from CPU model + total RAM + OS hostname + disk serial (via `os` module + `child_process`). Hashed with SHA-256 to produce a stable `device_fingerprint`.
- **License key validation**: On app launch, checks for stored license key in encrypted local storage. If missing, shows activation prompt.
- **Server activation**: Calls `license-gateway` edge function with `{action: "activate", license_key, device_fingerprint}`. Server checks max device limit, stores activation, returns JWT-signed activation token.
- **Activation token caching**: Stores a signed activation receipt locally (encrypted). Allows 72-hour offline grace period before requiring re-validation.
- **Heartbeat**: Every 4 hours, pings server with `{action: "heartbeat", license_key, device_fingerprint}`. If server responds with `revoked` or device count exceeded, app enters read-only/locked mode.
- **Tamper detection**: On startup, validates ASAR integrity hash against expected value embedded at build time. If mismatch, logs tamper event and enters restricted mode.

### File 2: `electron/license-ui.cjs` — Activation Window

A separate BrowserWindow that shows the license activation form:
- Input field for license key
- "Activate" button that calls license-guard
- Error display for invalid/exceeded/revoked keys
- Cannot be bypassed — main app window only opens after successful activation

### File 3: `supabase/functions/license-gateway/index.ts` — Server-Side License API

Edge function handling all license operations:

- **`activate`**: Validates license key exists and is active, checks device count vs `max_devices`, creates activation record, returns signed activation token
- **`heartbeat`**: Updates `last_heartbeat` timestamp, checks license status, returns `{valid: true/false, reason}`
- **`deactivate`**: Removes a device activation (for device transfer)
- **`validate`**: Quick check if license + device combo is valid
- **`revoke`**: Admin-only action to revoke a license (requires `has_role` admin check)

All actions logged to `license_audit_log`.

### File 4: `electron/integrity-check.cjs` — Binary Integrity Verification

- Computes SHA-256 hash of the ASAR archive at runtime
- Compares against build-time embedded hash
- If mismatch: logs to server, shows warning, enters degraded mode
- Checks code signing certificate validity on macOS/Windows

### File 5: `src/lib/os-security/license-manager.ts` — Frontend License State

Client-side license state management:
- Exposes `useLicenseStatus()` hook for UI components
- Communicates with Electron main process via IPC (`window.electronAPI`)
- Provides license tier info for feature gating
- Falls back gracefully in browser mode (web SPA uses auth-based access)

### File 6: Wire into `electron/main.cjs`

- Import and initialize `license-guard` before `createWindow()`
- Block app launch until license validation passes
- Register heartbeat interval
- Register tamper check on startup

### File 7: Wire into `src/lib/os-security/index.ts`

- Export `license-manager` from the security barrel

### File 8: Update `generated/remediation/REMEDIATION_PENDING_BLOCKERS.md`

- Log anti-piracy system as implemented

## How It Protects Against Common Piracy Vectors

| Attack Vector | Protection |
|--------------|------------|
| **Copy binary to another machine** | Hardware fingerprint won't match activation |
| **Share license key online** | Max device limit (e.g., 3) blocks mass sharing |
| **Modify ASAR to remove checks** | Integrity hash detects tampering |
| **Run offline forever** | 72-hour grace period, then locks |
| **Patch Electron binary** | Code signing verification catches modifications |
| **Torrent distribution** | No valid license key = can't activate |
| **Key generators** | Server-side validation, keys are UUID + HMAC signed |
| **Credential sharing** | Device-bound activation, not just account-bound |

## Files Created/Modified

| # | File | Action |
|---|------|--------|
| 1 | DB migration (3 tables) | Create |
| 2 | `electron/license-guard.cjs` | Create |
| 3 | `electron/license-ui.cjs` | Create |
| 4 | `electron/integrity-check.cjs` | Create |
| 5 | `supabase/functions/license-gateway/index.ts` | Create |
| 6 | `src/lib/os-security/license-manager.ts` | Create |
| 7 | `electron/main.cjs` | Wire license guard |
| 8 | `src/lib/os-security/index.ts` | Export license-manager |
| 9 | `generated/remediation/REMEDIATION_PENDING_BLOCKERS.md` | Update |

## What This Does NOT Do (Honest Limitations)

- **No DRM is 100% unbreakable** — determined hackers with reverse engineering skills can eventually bypass any client-side protection. The goal is to make it not worth the effort.
- **Requires internet for activation** — first launch and periodic heartbeats need connectivity. The 72-hour offline grace period mitigates this.
- **Hardware changes** (new CPU, RAM upgrade) may invalidate fingerprint — the `deactivate` + `reactivate` flow handles legitimate hardware changes.

