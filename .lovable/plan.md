

# Settings App — Comprehensive Gap Analysis & Enhancement Plan

## What's Already Working Well
The unified SettingsWindow has 26 sections across 8 groups with Nova SDK styling. Core sections (WiFi, Bluetooth, Sound, Display, Keyboard, Appearance, Privacy, Notifications, System Updates) are fully functional with real `useSettingsValue` hooks.

## Gaps Found

### A. OS Settings Sections — Missing Depth

1. **Accessibility** — Uses local `useState` instead of `useSettingsValue` for highContrast, largeText, screenReader. Missing 6 SettingsSchema keys already defined: `accessibility.boldText`, `accessibility.reduceAutoPlayEffects`, `accessibility.fullKeyboardNav`, `accessibility.focusIndicators`, `accessibility.voiceOver`, `accessibility.zoom/zoomLevel`, `accessibility.stickyKeys`, `accessibility.cursorSize`, `accessibility.announcementVerbosity`, `accessibility.textSize`. The standalone `AccessibilitySettings.tsx` page has all of these wired — the Settings window version is a stripped-down copy.

2. **Network/WiFi** — Only shows a single hardcoded "SITA-Network" with toggle. Missing: available networks list, signal strength, DNS settings (`network.dns`), proxy config (`network.proxy`), captive portal indicator, VPN connect/disconnect action, wifid service integration.

3. **Bluetooth** — Only 2 hardcoded devices. Missing: discovery scan button, device category icons, battery levels (btd tracks accessory batteries), forget/disconnect per device, audio routing indicator.

4. **Sound** — Missing: input device selector, alert volume slider (`sound.alertVolume`), alert sound picker (`sound.alertSound`), mute toggle (`sound.mute`), input volume/gain.

5. **Keyboard** — Missing: key repeat delay (`input.keyRepeatDelay`), trackpad speed (`input.trackpadSpeed`), natural scrolling (`input.naturalScrolling`), tap to click (`input.tapToClick`), keyboard shortcuts viewer.

6. **Cloud & Sync** — Basic toggle only. The full `UserCloudSettings.tsx` (445 lines) has selective sync per namespace, encryption levels, file browser, trash manager, activity timeline, device safety, import/export — none of this is in the Settings window.

7. **Display** — Missing: scaling slider (`display.scaling`), night shift intensity (`display.nightShiftIntensity`), True Tone toggle, auto-brightness toggle, refresh rate selector.

8. **General** — Missing: date/time format, timezone (timed service exists), startup behavior, default browser.

### B. App-Level Settings — Missing or Shallow

9. **Advisors & AI** — All values use local `useState`, not persisted. Missing: per-advisor enable/disable, model preference selector, AI gateway stats, token budget alerts, prompt history toggle.

10. **Privacy** — Missing: per-app permission management (which apps have location/camera/mic), tracking prevention level, cookie policy, ad personalization toggle.

11. **Trust & Security** — Missing: session timeout config, IP allowlisting, login history/audit log, security key management (FIDO2/WebAuthn).

12. **Devices & Sessions** — Missing: revoke session button, rename device, set trust level per device, last IP/location display.

13. **Household** — All static/hardcoded. Missing: actual invite flow, permission level editor, shared spending limits, parental controls.

14. **Business Rules** — All `onChange={() => {}}` no-ops. Not persisted.

15. **Workflows** — All static. Missing: create/edit/delete automation, trigger config, run history.

16. **Backup & Recovery** — All static. Missing: actual backup trigger, restore action, backup schedule config, export format selector.

### C. Mobile Settings — Missing Parity

17. **MobileSettings** — Very sparse (6 toggles + 2 nav rows). Missing most of what the OS version has: appearance options, AI settings, cloud sync, accessibility, operating modes.

### D. Cross-Cutting Gaps

18. **Settings Search** — No search/filter in the sidebar to find settings quickly (26 sections is a lot to scroll).
19. **Settings Persistence** — Many sections use local `useState` instead of `useSettingsValue`, meaning changes are lost on reload.
20. **UserCloudSettings integration** — The rich 445-line cloud settings page is completely separate from the Settings window.

---

## Implementation Plan

### Batch 1: Wire Real Persistence + Accessibility Parity
- **AccessibilityContent**: Replace all `useState` with `useSettingsValue` for all 12 schema keys. Add Bold Text, VoiceOver, Zoom/Zoom Level, Sticky Keys, Cursor Size, Full Keyboard Nav, Focus Indicators, Announcement Verbosity, Text Size slider — matching the standalone page.
- **AdvisorsAIContent**: Add settings schema keys for `ai.autonomyLevel`, `ai.confidenceThreshold`, `ai.budgetMode`, `ai.contradictionDisplay`. Wire with `useSettingsValue`.
- **BusinessRulesContent / WorkflowsContent / HouseholdContent**: Wire onChange handlers to persist values via `useSettingsValue` or localStorage.
- Extend `SettingsSchema` with ~12 new keys for AI, trust, and business settings.

### Batch 2: Deepen OS Hardware Sections
- **NetworkContent**: Add available networks list (simulated wifid scan), DNS/proxy config fields, VPN connect action, signal strength bars.
- **BluetoothContent**: Add scan button, battery level per device, forget device, category-based icons (headphones/keyboard/mouse/speaker).
- **SoundContent**: Add input device, alert volume, alert sound picker, mute toggle.
- **KeyboardContent**: Add key repeat delay, trackpad speed, natural scrolling, tap to click toggles.
- **DisplayContent**: Add scaling slider, night shift intensity, auto-brightness, refresh rate.

### Batch 3: Enrich App-Level Sections
- **CloudSyncContent**: Port selective sync namespaces, encryption display, and key actions from `UserCloudSettings.tsx` into Nova SDK components.
- **PrivacyContent**: Add per-app permissions list, tracking prevention level chooser, ad personalization toggle.
- **TrustSecurityContent**: Add session timeout config, login history preview, security key status.
- **DevicesSessionsContent**: Add revoke session button, rename device, set trust level dropdown, last IP display.
- **GeneralContent**: Add timezone (from timed), date format, startup behavior, default browser.

### Batch 4: Settings Search + Mobile Parity
- **Settings search bar**: Add a filter input at the top of the sidebar that fuzzy-matches section labels and highlights/scrolls to matching sections.
- **MobileSettings**: Expand to match OS parity — add grouped sections for Appearance (accent color, wallpaper preview), AI (autonomy, budget mode), Connectivity (WiFi/BT status), Cloud (sync toggle + last sync), Accessibility (reduce motion, large text), Operating Mode selector. Use the existing `ToggleRow`/`NavRow` patterns.

### Files Modified/Created

| File | Action |
|---|---|
| `src/lib/nova-sdk/services/settings-service.ts` | Extend SettingsSchema with ~12 new keys |
| `src/components/sita/shell/windows/settings/SystemSections.tsx` | Rewrite Accessibility, Display, General with full depth |
| `src/components/sita/shell/windows/settings/ConnectivitySections.tsx` | Enhance Network, Bluetooth, CloudSync |
| `src/components/sita/shell/windows/settings/SoundInputSections.tsx` | Enhance Sound, Keyboard with all missing controls |
| `src/components/sita/shell/windows/settings/AISections.tsx` | Wire persistence, add per-advisor controls |
| `src/components/sita/shell/windows/settings/PrivacyTrustSections.tsx` | Enhance Privacy, Trust, Devices |
| `src/components/sita/shell/windows/settings/AdvancedSections.tsx` | Wire onChange handlers, deepen Backup/Workflows |
| `src/components/sita/shell/windows/settings/shared.tsx` | Add SettingsSearch component + extended SECTION_KEYS |
| `src/components/sita/shell/windows/SettingsWindow.tsx` | Add search bar to sidebar |
| `src/pages/mobile/MobileSettings.tsx` | Expand to grouped sections with OS parity |

