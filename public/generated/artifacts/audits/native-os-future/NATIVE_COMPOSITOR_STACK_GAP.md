# Native Compositor Stack — GAP

**Classification:** Future / native-substrate. **Not implemented.**

## What this would require

A SITA-owned display server / compositor (Wayland/Quartz/DWM-class), input stack (keyboard/mouse/touch/pen routing), color management, multi-display orchestration, and a stable surface protocol for third-party apps.

## What SITA OS actually does today

- Renders inside the browser DOM (web tier) or a Chromium/Electron window (desktop tier).
- The "windowing system" (`AppWindow`, snap guides, virtual desktops) is **DOM-based**, not a compositor.
- All input routing is delegated to the host platform.

## Honesty boundary

- ❌ No claim of native compositor or display-server ownership.
- ✅ "SITA OS provides a window-management UX layer" is accurate and currently true (`AppWindow` + snap guides shipped Phase R).
