# OS-Level i18n & Accessibility Substrate — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

OS-level accessibility services (screen reader, magnifier, switch control, voice-control fabric), system-wide IME and locale services, RTL substrate, and platform-level captioning.

## What SITA OS actually does today

- Relies on **host-platform accessibility** (browser ARIA, macOS VoiceOver, Windows Narrator, etc.).
- Component-level a11y attributes (ARIA, keyboard handlers) are implemented per-component but not as an OS substrate.
- i18n is web-i18n, not an OS-level locale service.

## Honesty boundary

- ❌ No claim of "OS-wide accessibility platform."
- ✅ "SITA OS is built with accessible components and inherits host-platform a11y" is accurate.
