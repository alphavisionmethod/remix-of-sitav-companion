# SITA OS — Platform Scope (Canonical)

> **Status:** Authoritative · Version 1.0 · 2026-04-18
> Single source of truth for what platforms are **active**, **partial**, or **inactive**.

## ✅ Active platforms (production scope)

| Surface | Status | Canonical entry | CI gate |
|---|---|---|---|
| Web SPA | 🟢 GA | `src/main.tsx` + `dist/` | `web-deployability` |
| Backend / Edge | 🟢 GA | `supabase/functions/` | `edge-function-health` |
| Ubuntu-native ISO | 🟢 GA | `os/scripts/release.sh` | `os-build-pipeline` |
| Electron desktop shell (on Ubuntu base) | 🟢 GA | `electron/main.cjs` | `electron-shell-session-readiness` |
| QEMU VM validation | 🟢 GA | `os/qemu-validate.sh` | `qemu-vm-readiness` |

## 🟡 Partial / evolving

| Surface | Status | Notes |
|---|---|---|
| VMware OVA appliance | 🟡 Partial | `os/vmware/` present; hardware support matrix in progress |
| Hardware support matrix | 🟡 Partial | See `docs/os/HARDWARE_SUPPORT_MATRIX.md` |
| PWA (browser-installable) | 🟡 Optional | Lives inside the Web SPA via `public/sw.js` + manifest |

## ⛔ Inactive (archived; not in active scope)

| Surface | Reason | Archive location |
|---|---|---|
| iOS native runtime | Decision: not pursuing Apple distribution | `archive/ios-templates/`, `docs/archive/ios/`, `scripts/archive/ios/` |
| Android native runtime | Decision: not pursuing Play Store | `archive/android-templates/` |
| Capacitor bridge | Removed alongside iOS/Android | Deleted `capacitor.config.ts` + 12 `@capacitor/*` deps |
| App Store / TestFlight | Not active distribution channel | n/a |
| Apple Developer enrollment | Not a project blocker | n/a |
| APNs push (Apple) | Replaced by Web Push (VAPID) | n/a |

## Decision boundary rules

1. **No new feature may add an iOS / Android / Capacitor dependency** without a written scope-change decision.
2. CI gates must not enforce inactive-platform readiness — readiness for the 8 native checks above is canonical.
3. Docs that reference iOS / Apple / Capacitor as live scope must be rewritten or archived.
4. Mobile experience for users = **responsive web + PWA**, served by the Web SPA.

## Future revisit conditions

The inactive surfaces may be reconsidered if:
- A signed business decision reverses platform scope, **and**
- An owner is assigned for the runtime, store enrollment, signing infrastructure, and ongoing maintenance.

Until then, all active engineering effort is on **Web + Ubuntu-native + Electron**.

## References

- `docs/os/SITA_OS_NATIVE_DEPLOYMENT_AUDIT.md`
- `docs/os/SITA_OS_NATIVE_RUNTIME.md`
- `docs/os/IMAGE_LAYOUT_AND_PARTITIONS.md`
- `archive/README.md`
