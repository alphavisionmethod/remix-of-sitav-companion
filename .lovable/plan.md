

# SITA OS — Setup Phases 2.3–2.7: Network, Readiness, Ownership, Account, Access Protection

## Current State

The OSSetupExperience has 27 phases in a DAG-based orchestration engine. The flow goes: boot → welcome → restore/enterprise → cinematic-intro → setup-style → identity → ... → trust-certificate. **None of the 5 requested phases exist.** The current "boot" phase does hardware detection but has no network setup, update checking, device ownership selection, environment account flow, or access protection.

## What Will Be Built

5 new fully-advanced setup phases inserted into the early boot flow, between `boot` and `welcome`:

```text
boot → network-setup → device-readiness → device-ownership → account-environment → access-protection → welcome → cinematic-intro → ...
```

---

### Phase 1: Contract & Engine Updates

**1a. Add 5 new phase IDs to `SetupPhaseId` union** in `setup-orchestration.ts`:
- `"network-setup"`, `"device-readiness"`, `"device-ownership"`, `"account-environment"`, `"access-protection"`

**1b. Add 5 phase definitions** to `setup-phase-definitions.ts` with proper DAG dependencies:
- `network-setup`: depends on `["boot"]`, blocking, required, background tasks: `["wifi-scan", "ethernet-detect"]`
- `device-readiness`: depends on `["network-setup"]`, blocking, required, background tasks: `["check-updates", "driver-check"]`
- `device-ownership`: depends on `["device-readiness"]`, blocking, required
- `account-environment`: depends on `["device-ownership"]`, blocking, required
- `access-protection`: depends on `["account-environment"]`, blocking, required

Update `welcome` dependency from `["boot"]` to `["access-protection"]`.

**1c. Add new SetupState fields** in `OSSetupExperience.tsx`:
- `networkState`, `deviceOwnership`, `accountPath`, `accessMethod`, `recoveryMethod`, `updateStrategy`

---

### Phase 2: Network Setup Component (~350 lines)

**File**: `src/components/sita/onboarding/NetworkSetupStep.tsx`

Full implementation with:
- **Wi-Fi discovery simulation**: animated scanning → discovered networks list with signal strength bars, lock icons, channel info
- **Password entry**: secure input with show/hide for protected networks
- **Hidden network**: manual SSID/password entry form
- **Enterprise network**: EAP type selector, certificate upload placeholder, identity/password fields
- **Proxy options**: expandable section with HTTP/SOCKS proxy config, auto-detect, PAC URL
- **Captive portal handling**: detected banner with "Open portal" action
- **Ethernet detection**: auto-detected with animated plug icon
- **Offline limited setup**: clear CTA to continue without network, showing what's limited
- **Connection states**: full state machine (scanning → connecting → connected/failed_password/weak_signal/no_networks_found/captive_portal_required/ethernet_connected/offline_mode_selected)
- **Right-side value preview**: animated list of online capabilities that illuminate when connected
- **Wow factor**: network node graph animation — when connected, nodes illuminate across an environment map, ambient glow intensifies, capabilities slide in with staggered animation

---

### Phase 3: Device Readiness Component (~300 lines)

**File**: `src/components/sita/onboarding/DeviceReadinessStep.tsx`

Full implementation with:
- **Update categories split**: "Critical now" vs "Background later" with clear visual separation
- **Critical updates**: security patches, boot essentials — shown with shield icons, auto-applied with progress bars
- **Background updates**: visual enhancements, optional packs — queued silently, shown as deferred items
- **Device readiness checks**: animated checklist — display/input, battery/power, biometric detection, network stack, recovery environment — each with status (checking → ready/warning/unavailable)
- **Reboot behavior**: if reboot needed, clear explanation, save progress button, premium continuation screen preview
- **Progress visualization**: per-update progress bars, overall completion ring
- **No update purgatory**: always allow "Continue" once critical items complete, background items run in parallel

---

### Phase 4: Device Ownership Component (~250 lines)

**File**: `src/components/sita/onboarding/DeviceOwnershipStep.tsx`

Full implementation with:
- **Three ownership options** as premium OptionCards:
  - Personal device — single-owner trust, strong personalization, private-by-default
  - Family/shared device — shared/private separation, multi-profile readiness, household surfaces
  - Work/managed device — org-aware policies, professional workflows, managed enrollment
- **Selection impact preview**: right panel showing privacy model, sharing model, trust implications, and later recommendations that update live when selection changes
- **Visual response**: ambient environment shifts (icon set, color warmth, privacy shield intensity) based on selection
- **Device icon animation**: device silhouette morphs to show single-user, multi-user, or enterprise context

---

### Phase 5: Account / Environment Component (~400 lines)

**File**: `src/components/sita/onboarding/AccountEnvironmentStep.tsx`

Full implementation with:
- **Five paths** as premium cards:
  1. Sign in to SITA (email + password, transitions to auth flow)
  2. Restore previous environment (detects available backups, shows profile/avatar, previous environment name, last device/date, active modules)
  3. Create new environment (name + email signup flow)
  4. Continue with limited offline setup (clear limitations listed)
  5. Work/managed environment setup (org code entry, MDM detection)
- **OAuth providers**: Apple, Google, Microsoft buttons with branded styling
- **Restore UX**: if restore data detected, shows previous profile card with avatar, environment name, last device, date, modules — "Your world is coming back" feeling with warm animation
- **Identity is environment creation**: framed as "Connect your environment" not "create account"
- **Wired to AuthContext**: actual `signIn`, `signUp`, and OAuth via `lovable.auth.signInWithOAuth`

---

### Phase 6: Access Protection Component (~280 lines)

**File**: `src/components/sita/onboarding/AccessProtectionStep.tsx`

Full implementation with:
- **PIN or password**: choice between PIN (6-digit) and password, with strength meter
- **Biometric enrollment**: detect availability via `PublicKeyCredential` / `navigator.credentials`, show fingerprint/face icon, enrollment simulation
- **Recovery method**: email recovery, recovery key generation (displayed once, download as text file)
- **Trusted-access framing**: "Your access method protects this device and your environment"
- **UX**: spacious, premium, non-technical language, clearly protective
- **Recovery explained without fear**: warm microcopy, no scary warnings
- **Completion feeling**: trust layer stabilization animation — shield solidifies, "This is mine now" moment with haptic-style pulse animation
- **Persist to user_memory**: save access method preferences

---

### Phase 7: Wire Into OSSetupExperience

Update `OSSetupExperience.tsx`:
- Import all 5 new step components
- Add phase rendering blocks between `boot` and `welcome` in the `AnimatePresence` switch
- Wire state fields (networkState, deviceOwnership, etc.) to each component
- Add `canAdvance` conditions for each new phase
- Update `finishSetup` to persist new state fields to `user_memory`

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/packages/contracts/specialized/setup-orchestration.ts` | Add 5 phase IDs |
| `src/lib/engines/setup-phase-definitions.ts` | Add 5 phase definitions, update welcome dependency |
| `src/components/sita/onboarding/NetworkSetupStep.tsx` | Create (~350 lines) |
| `src/components/sita/onboarding/DeviceReadinessStep.tsx` | Create (~300 lines) |
| `src/components/sita/onboarding/DeviceOwnershipStep.tsx` | Create (~250 lines) |
| `src/components/sita/onboarding/AccountEnvironmentStep.tsx` | Create (~400 lines) |
| `src/components/sita/onboarding/AccessProtectionStep.tsx` | Create (~280 lines) |
| `src/components/sita/OSSetupExperience.tsx` | Wire 5 new phases + state |

## Technical Notes

- All components use existing `PhaseCard`, `OptionCard`, `NavButtons` patterns from OSSetupExperience
- Network scanning and update checking are simulated client-side (no real Wi-Fi API in browser) but structured to accept real adapters later
- AccountEnvironmentStep wires to real AuthContext for sign-in/sign-up and `lovable.auth.signInWithOAuth` for OAuth
- Access protection preferences are persisted to `user_memory` table alongside existing setup data
- No new database tables needed — all data goes into existing `user_memory` and `setup_sessions`
- All animations use framer-motion, consistent with existing onboarding components

