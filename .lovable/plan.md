

# Plan: Advanced Security System, Permission Monitor, and File System Enhancements

## Current State

**What exists but is NOT wired:**
- `CodeVerificationService` — full Ed25519/RSA signing, boot chain attestation, CRL, enforcement modes
- `AppIsolationManager` — 5 isolation levels, namespace flags, cgroup limits, crash isolation
- `CapabilityPermissionSystem` — POSIX DAC + Linux caps + SITA tokens
- `SandboxEngine` — seccomp profiles, Landlock rules, 5-ring trust model

**What is completely missing:**
- AppLoader does NOT call CodeVerification or AppIsolation — apps load without any security checks
- No `PermissionMonitor` service tracking real-time permission usage
- No Security Center UI for transparency
- FileSystemService has no versioning or tagging

---

## Implementation (4 work items)

### 1. Wire Security into AppLoader

**File:** `src/lib/nova-sdk/runtime/loader.ts`

- Add `signature?: string` and `trustRing?: number` to `AppBundle`
- During `load()`, after manifest validation:
  - Call `CodeVerificationService.verify()` — block load if mode is "enforced" and result is not "valid"
  - Call `AppIsolationManager.createSandbox()` with isolation level derived from trust ring (ring 2 → standard, ring 3 → strict, ring 4 → maximum)
  - Log verification result and sandbox ID to console
- On `unload()`, terminate the sandbox via `AppIsolationManager`

### 2. Create PermissionMonitor Service

**New file:** `src/lib/nova-sdk/services/permission-monitor.ts`

A `SystemService` that tracks live permission usage across all running apps:

```text
PermissionMonitor
├── activeGrants: Map<appId, Set<permissionId>>
├── accessLog: { appId, permission, timestamp, granted }[]
├── registerApp(appId, permissions[])
├── recordAccess(appId, permission)
├── revokeApp(appId)
├── getActivePermissions(): Map snapshot
├── getAccessLog(limit?): recent entries
├── getDiagnostics(): total grants, denied count, per-permission stats
```

- Register in `ServiceManager` boot sequence as Phase 2
- Wire into `NovaBridge.send()` to auto-log every permission-gated IPC call
- Wire into AppLoader so `registerApp` is called on load, `revokeApp` on unload
- Export from `services/index.ts`

### 3. Add File Versioning and Tagging to FileSystemService

**File:** `src/lib/nova-sdk/services/filesystem-service.ts`

Extend `FSNode` with:
- `versions?: { version: number; content: string; savedAt: number }[]` — auto-snapshot on `writeFile()`, keep last 10
- `tags?: Set<string>` — user-assignable labels

New methods:
- `getFileHistory(path)` — returns version list for a file
- `restoreVersion(path, version)` — restores content from a specific version
- `addTag(path, tag)` / `removeTag(path, tag)` — manage tags
- `getByTag(tag)` — find all files with a given tag
- `getAllTags()` — list all unique tags in the filesystem

Update `writeFile()` to push current content into versions array before overwriting. Update `getDiagnostics()` to include version count and tag count.

### 4. Build Security Center Window

**New file:** `src/components/sita/shell/windows/SecurityCenterWindow.tsx`

A full window with 4 tabs, following the same pattern as SettingsWindow:

**Tab 1 — Sandbox Monitor:** Grid of cards for each active sandbox from `AppIsolationManager` — app name, isolation level badge (color-coded), namespace flags as dots, resource usage bars (CPU/memory/IO), crash count, state indicator.

**Tab 2 — Code Signing:** Boot chain attestation timeline (UEFI → Shim → Kernel → Initramfs → Runtime), trusted key ring list, verification log table with result badges, enforcement mode selector.

**Tab 3 — Permission Monitor:** Each running app as a row with per-permission indicators:
```text
┌─────────────────────────────────────────────┐
│ Notes.app                                   │
│ Camera: OFF  Files: ●ACTIVE  Network: OFF   │
│ Clipboard: OFF  Location: OFF               │
├─────────────────────────────────────────────┤
│ Browser.app                                 │
│ Camera: OFF  Files: OFF  Network: ●ACTIVE   │
└─────────────────────────────────────────────┘
```
Plus an access log feed at the bottom showing recent permission checks with timestamps.

**Tab 4 — File System:** Mount overview with quota bars, file/version/tag stats, and a simple tag browser.

**Integration:**
- Register as `com.sita.security-center` with manifest
- Add to `ShellLayout.tsx` app launch map
- Add to `DesktopDock.tsx` OS_WINDOW_APPS set
- Add dock icon (Shield)

---

## Files Changed/Created

| File | Action |
|------|--------|
| `src/lib/nova-sdk/runtime/loader.ts` | Wire CodeVerification + AppIsolation |
| `src/lib/nova-sdk/services/permission-monitor.ts` | New service |
| `src/lib/nova-sdk/services/filesystem-service.ts` | Add versioning + tagging |
| `src/lib/nova-sdk/services/index.ts` | Export PermissionMonitor |
| `src/lib/nova-sdk/system/bridge.ts` | Wire permission logging |
| `src/components/sita/shell/windows/SecurityCenterWindow.tsx` | New UI |
| `src/components/sita/ShellLayout.tsx` | Register security-center launch |
| `src/components/sita/DesktopDock.tsx` | Add to OS_WINDOW_APPS |

