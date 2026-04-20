# Stable Native ABI & 3rd-Party App Platform — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

A versioned, binary-stable ABI; SDK + headers; signing & notarization; a sandboxing model with capabilities/entitlements at the kernel boundary; an app store with platform-binary delivery; and developer certification.

## What SITA OS actually does today

- Ships an **App Store of SITA-built JS/TS apps** (real install lifecycle, real `installed_apps` table — Phase K).
- 3rd-party apps would today need to be **web apps** (PWA-class) — there is no native ABI.
- Permissions are policy-level (RLS + `app_entitlement_map`), not kernel-enforced.

## Honesty boundary

- ❌ No claim of "native binary apps" or "sandboxed kernel-enforced entitlements."
- ✅ "SITA App Store delivers first-party and PWA-class apps with policy-based entitlements" is accurate.
