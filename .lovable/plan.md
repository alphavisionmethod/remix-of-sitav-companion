

# TPM / Secure Hardware, Storage Schema, IPC Contracts, Trusted Elevation, Audit & Security Foundation

## Current State

The OS security subsystem already has substantial infrastructure across 8 files (~3,500 lines):
- **authd** (504L): PBKDF2+ECDSA, session creation, elevation tokens, rate limiting
- **sessiond** (590L): 10-state lifecycle, token issuer, fast switch, suspend/resume, idle→screensaver→lock
- **secretsd** (709L): AES-256-GCM, HKDF, key hierarchy (master→KEK→DEK), TPM abstraction, versioning, policy bindings, deletion queue, secure buffer
- **controlcenterd** (336L): IPC routing, policy preflight, elevation orchestration
- **policyd** (326L): RBAC + capabilities, environmental context, decision logging
- **auditd** (255L): Hash-chained append-only audit log
- **types.ts** (518L): Full type contracts, 22-rule lockscreen matrix, 8 policy bindings
- **flows** (339L): 10 end-to-end flows wired

## What Needs to Be Added

### 1. Enhanced TPM / Secure Hardware Integration
- Current TPM abstraction is minimal (detect, seal/unseal stubs). Need:
  - Full `DeviceSecurityPosture` model (secure_boot, measured_boot, attestation, degraded reasons)
  - Boot integrity state reporting
  - PCR binding simulation
  - Attestation quote generation
  - Hardware RNG abstraction
  - Non-exportable key slot tracking
  - Posture-aware policy integration (policyd checks device posture)
  - Fallback rules with degraded-security signaling

### 2. Structured IPC Contract System
- Current IPC is ad-hoc method calls. Need:
  - Formal `IPCContract` type with request/response/error schemas
  - Caller validation rules per method
  - Idempotency markers
  - Timeout/retry behavior
  - Complete contract registry for all ~20 IPC methods
  - `promptd` service for trusted secure prompts

### 3. Enhanced Audit Layer
- Current auditd has hash-chaining but lacks:
  - `device_posture_hash` and `previous_event_hash` fields on events
  - Log sealing checkpoints
  - Export/redaction tooling
  - Retention policy enforcement
  - Severity-filtered querying

### 4. Service Identity Registry Enhancement
- Current service registry is a simple map. Need:
  - `signing_identity`, `version`, `status`, `policy_profile_ref`, `last_verified_at` fields
  - Verified service identity with signature validation
  - Service-to-service auth enforcement

### 5. Trusted Prompt / promptd Service
- No dedicated prompt daemon exists. Need:
  - `promptd` that manages secure elevation prompts
  - Prompt states: `idle → presenting → awaiting_input → processing → resolved → timed_out`
  - Non-spoofable prompt with risk-aware messaging
  - "Remember approval for X minutes" policy support
  - Accessibility labels and remote session restrictions

### 6. Permission/Capability Matrix (Complete)
- Extend ACTION_AUTHORIZATION_TABLE with:
  - `trustedPromptRequired` field
  - `policyOverridable` field
  - Missing actions (new wifi credential save, service registration, remote session)

### 7. Failure Modes & Recovery Engine
- No structured failure handling. Need:
  - `FailureMode` type with user message, audit behavior, retry policy, fallback path
  - Recovery flows for each failure scenario
  - Degraded mode definitions

### 8. Beautiful Admin Dashboard — SEC02 Security Foundation
- New multi-tab dashboard with visual richness (not just text):
  - **TPM & Device Posture** tab: visual device security shield with posture indicators, hardware status cards with icons
  - **IPC Contracts** tab: interactive contract explorer with request/response schemas, flow diagrams
  - **Audit Chain** tab: timeline visualization of audit events, hash chain integrity indicator, severity heatmap
  - **Service Identities** tab: service registry with verification badges, trust graph
  - **Trusted Prompts** tab: prompt simulator, prompt state machine visualization
  - **Threat Model** tab: threat cards with mitigation status, risk radar chart
  - **Capability Matrix** tab: interactive permission grid with color-coded cells

---

## Implementation Plan — 4 Batches

### Batch 1: Enhanced Types + TPM + IPC Contracts (~400 lines)

**Extend `src/lib/os-security/types.ts`** — Add:
- `DeviceSecurityPosture`: secure_hw_present, secure_boot_enabled, measured_boot_ok, attestation_supported, system/user_keyring_hardware_backed, degraded_reason, posture_level, last_verified_at
- `IPCContract`: method name, request_schema, response_schema, error_codes, allowed_callers, requires_session_token, requires_elevation, idempotent, timeout_ms, retry_policy, audit_events
- `IPC_CONTRACT_REGISTRY`: Full registry for ~20 methods (session.login, session.lock, auth.verify, auth.begin_elevation, secrets.put, secrets.get_handle, wifi.connect, shield.firewall.disable, cert.install_root, etc.)
- `PromptState`: idle, presenting, awaiting_input, processing, resolved, timed_out, cancelled
- `TrustedPromptConfig`: requester, action, risk_level, messaging, supported_auth_methods, timeout_ms, remember_allowed, screen_reader_labels
- `FailureMode`: failure_id, category, user_message, audit_behavior, retry_policy, fallback_path, degraded_mode, recovery_needed
- `FAILURE_MODE_REGISTRY`: ~15 failure modes (invalid token, corrupted secret, TPM state change, missing audit backend, etc.)
- Extended `ServiceIdentity`: signing_identity, version, status, policy_profile_ref, last_verified_at
- Extended `ActionPolicy`: trusted_prompt_required, policy_overridable fields
- `ThreatEntry`: threat_id, description, mitigation, residual_risk, monitoring_signal, severity

**Enhance TPM in `src/lib/os-security/secretsd.ts`**:
- `DeviceSecurityPostureManager` class: compute and cache posture, expose to policyd
- PCR binding simulation with value tracking
- Attestation quote generation (simulated)
- Hardware RNG wrapper
- Non-exportable key slot registry
- `getDevicePosture()` method on SecretsDaemon

### Batch 2: promptd + Enhanced Audit + Service Identity (~350 lines)

**Create `src/lib/os-security/promptd.ts`** — Trusted Prompt Daemon:
- `PromptDaemon` class managing prompt lifecycle
- Prompt queue with priority
- State machine (idle → presenting → awaiting → resolved/timed_out)
- Risk-aware message generation (maps action to human-friendly explanation)
- "Remember for X minutes" with policy check
- Rate limiting (prevent prompt flooding)
- Remote session restrictions
- Accessibility metadata (screen reader labels, high-contrast mode support)
- Integration with controlcenterd (replaces raw elevation callback)
- Prompt history for audit

**Enhance `src/lib/os-security/auditd.ts`**:
- Add `device_posture_hash`, `elevation_used`, `auth_method_used`, `result` fields to events
- Log sealing: periodic checkpoints that summarize and seal event batches
- `exportEvents()` with privacy-aware redaction (strip user PII, keep structure)
- `getChainIntegrity()`: verify full hash chain, return integrity report
- Retention policy: configurable max age, auto-archive old events
- Severity-filtered query methods

**Enhance service identity in `src/lib/os-security/policyd.ts`**:
- Extended `ServiceIdentity` with verification and status tracking
- `verifyServiceIdentity()` with signature check
- Service-to-service authorization validation
- Policy profile references per service

### Batch 3: Integration Flows + Failure Recovery (~250 lines)

**Extend `src/lib/os-security/flows/index.ts`** — Add:
- Full WiFi connect flow with trusted prompt path
- VPN root cert import flow with validation, non-exportable key, trust store update
- Firewall disable with single-use token, user-safe denial explanation
- Session unlock via trusted compositor path
- VPN private key usage with operation-specific handle and service binding
- Each flow now includes: posture check, prompt via promptd, structured error handling, recovery path

**Extend `src/lib/os-security/controlcenterd.ts`**:
- Wire promptd as elevation handler (replace raw callback)
- Add posture-aware command validation
- Service identity verification before dispatch
- Structured failure responses with recovery hints

**Create `src/lib/os-security/recovery.ts`** — Recovery Engine:
- `RecoveryEngine` class
- Handle failure modes: expired tokens, corrupted secret metadata, TPM state change, partial boot
- Degraded mode management with user-visible posture
- Safe defaults on policy load failure
- Service startup dependency order definition

### Batch 4: SEC02 Security Foundation Dashboard (~600 lines)

**Create `src/pages/admin/SEC02SecurityFoundation.tsx`** — Beautiful multi-tab dashboard:

- **Tab 1 — Device Security Posture**: Large visual shield icon showing overall posture (green/amber/red). Cards for TPM status, secure boot, measured boot, attestation — each with icon, status badge, and last-checked timestamp. Posture history sparkline.

- **Tab 2 — IPC Contract Explorer**: Searchable list of all IPC methods. Click to expand: request schema, response schema, error codes, caller validation rules, timeout behavior. Visual flow diagram connecting UI → controlcenterd → service chain.

- **Tab 3 — Audit Chain**: Timeline visualization with colored severity dots. Hash chain integrity bar (verified/broken). Recent events table with actor, action, decision, severity. Export button. Sealing checkpoint markers on timeline.

- **Tab 4 — Service Identities**: Cards for each registered service with verification badge (green check or warning). Shows allowed actions, secret scopes, last verified timestamp. Trust relationship lines between services.

- **Tab 5 — Trusted Prompts**: Live prompt queue status. Prompt history with outcomes (approved/denied/timed-out). Prompt simulator for testing. State machine diagram showing prompt lifecycle.

- **Tab 6 — Threat Model**: Threat cards arranged in severity grid. Each card shows threat, mitigation, residual risk, monitoring signal. Color-coded by severity. Overall threat coverage percentage.

- **Tab 7 — Capability Matrix**: Interactive grid (actions × requirements). Color-coded cells: green (allowed), red (denied), amber (elevation). Filterable by role, severity, prompt requirement.

**Register route** in `AdminRoutes.tsx`: `/admin/security/foundation`
**Add dashboard card** in `AdminDashboard.tsx`

## Design Language
- Same glassmorphic style as SEC01: `bg-white/[0.04]`, `backdrop-blur-xl`, `border-white/[0.06]`
- TPM/Hardware = purple theme, IPC = blue, Audit = amber, Services = emerald, Prompts = cyan, Threats = red
- Visual shields, lock icons, key icons — not just text tables
- Animated posture indicator (pulsing green shield when healthy)
- Interactive contract expansion with syntax-highlighted schemas
- Audit timeline with severity-colored dots and connecting lines

## File Summary
| Action | File | Lines |
|--------|------|-------|
| Modify | `types.ts` | +180 |
| Modify | `secretsd.ts` | +80 |
| Create | `promptd.ts` | ~200 |
| Modify | `auditd.ts` | +100 |
| Modify | `policyd.ts` | +50 |
| Modify | `flows/index.ts` | +100 |
| Modify | `controlcenterd.ts` | +50 |
| Create | `recovery.ts` | ~100 |
| Create | `SEC02SecurityFoundation.tsx` | ~600 |
| Modify | `AdminRoutes.tsx` | +5 |
| Modify | `AdminDashboard.tsx` | +20 |
| **Total** | **11 files** | **~1,485 lines** |

