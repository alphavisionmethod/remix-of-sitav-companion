

# Phase F — Sita Spatial & Multi-Device (Most Advanced Tier)

Goal: Push Sita past a single-screen assistant into a **spatial, multi-device, multi-modal operator** — handoff between devices, gesture/gaze input, a holographic Boardroom layer over the desktop, and a spatial workspace where windows, advisors, and Sita herself coexist in a 3D field.

## What you'll get

1. **Multi-Device Handoff** — start a task on desktop, continue on mobile (or vice-versa). A live "handoff baton" shows current intent, plan, and cursor position; one tap passes control. Powered by Supabase Realtime + a per-user `sita_handoff_sessions` channel.
2. **Gesture & Gaze Input (web-native)** — uses `MediaDevices` + lightweight on-device pose/face landmark detection (TFJS already loadable on demand) for:
   - **Air-tap / pinch** → activate HUD button under cursor
   - **Look-to-focus** → window the user is looking at gets soft focus glow
   - **Palm-up** → opens Sita
   - **Swipe-away** → dismisses current whisper
   All gesture detection runs locally; nothing leaves the device.
3. **Holographic Boardroom Layer** — when invoked ("Sita, convene the board"), the active app dims and a translucent 3D council ring of advisor portraits floats above it. Each advisor can speak (TTS) with positional audio. Decisions feed straight into the Phase E Action Plan card.
4. **Spatial Workspace** — opt-in mode (`Cmd+Shift+Space`) that re-projects open windows onto a curved depth plane with parallax. Drag windows in Z-axis with scroll-wheel + Shift. Persistent per user.
5. **Sita Presence Beacon** — a low-power BLE-style beacon emitted via WebRTC data channels so other Sita-enabled devices on the same network/account see "Sita is active here" and can request handoff.
6. **Cross-modal Memory** — every spatial / gesture / handoff event writes to `sita_spatial_events` so the agent learns which input modality the user prefers per task.

## User experience

- On laptop, you start *"Draft the Q3 board memo"*. Walk to the kitchen, pick up your phone — a banner says **"Continue with Sita?"**. Tap → the same plan resumes on mobile with voice.
- Look at the Calendar window and say *"Move tomorrow's standup to 10am"* — gaze gives Sita the target window, voice gives the intent.
- Pinch-air over the HUD orb to open Sita without touching the trackpad.
- Say *"Convene the board for Q3 strategy"* → 6 advisor holograms ring the screen, debate live, return a single Action Plan you approve once.
- Hit `Cmd+Shift+Space` → desktop becomes a curved depth field; push less-important windows back, pull priority work forward.

## Technical implementation

**New files**
- `src/lib/sita-spatial/handoff-bus.ts` — Realtime channel `sita_handoff:{user_id}` with `{intent, plan_id, cursor, device_label, ts}` payload
- `src/lib/sita-spatial/useSitaHandoff.ts` — hook: emit + subscribe + accept/decline
- `src/lib/sita-spatial/gesture-engine.ts` — wraps `@mediapipe/tasks-vision` (lazy-loaded) for hand + face landmarks
- `src/lib/sita-spatial/gaze-tracker.ts` — derives a normalised gaze vector and maps to window-id under cursor
- `src/lib/sita-spatial/spatial-workspace.ts` — depth/Z model for open windows, persisted to `sita_spatial_layout`
- `src/lib/sita-spatial/presence-beacon.ts` — WebRTC data-channel beacon (graceful no-op if blocked)
- `src/lib/sita-spatial/index.ts` — barrel
- `src/components/sita/shell/sita-spatial/SitaHandoffBanner.tsx` — incoming-handoff toast
- `src/components/sita/shell/sita-spatial/SitaGestureLayer.tsx` — invisible canvas + activation pulses
- `src/components/sita/shell/sita-spatial/SitaHolographicBoardroom.tsx` — translucent advisor ring overlay
- `src/components/sita/shell/sita-spatial/SitaSpatialField.tsx` — curved-plane re-projection container
- `src/components/sita/shell/sita-spatial/SitaSpatialControls.tsx` — Control Center toggles (gesture / gaze / spatial / handoff)
- `supabase/functions/sita-handoff-broker/index.ts` — server-validates handoff requests against autonomy + receipts
- `mem://features/sita-spatial-phase-f.md`

**Edited files**
- `src/components/sita/shell/ShellLiveLayer.tsx` — mount handoff banner, gesture layer, holographic boardroom, spatial field
- `src/components/sita/shell/ControlCenter.tsx` — add `SitaSpatialControls` row
- `src/lib/sita-voice/voice-intent-router.ts` — recognize spatial verbs (`convene the board`, `hand off to phone`, `spatial mode`)
- `src/components/sita/shell/sita-hud/index.ts` — re-export new components

**Pipeline & safety**
- All handoff and spatial actions still flow through `useAction` → 12-stage kernel.
- Gesture and gaze processing is **on-device only** — never streams video off the user's machine.
- Holographic Boardroom decisions surface as standard Phase E `ActionPlan`s — same approval, same receipts.
- All new tables RLS-locked to `auth.uid() = user_id`. Realtime channels use per-user topics + JWT.
- Feature flags via `personal_brain_preferences.sita_spatial_features` (`{gesture, gaze, spatial, handoff}`) all default OFF; user opts in from Control Center.

**Data**
- New table `sita_handoff_sessions` (id, user_id, source_device, target_device, intent, plan_id, status, payload, created_at, accepted_at, expires_at)
- New table `sita_spatial_layout` (user_id PK, layout jsonb, updated_at)
- New table `sita_spatial_events` (id, user_id, kind, payload, created_at) with 30-day TTL
- Add column `sita_spatial_features` jsonb to `personal_brain_preferences`

**Memory rule added**
- `mem://features/sita-spatial-phase-f` describing handoff topic, gesture engine boundaries (on-device only), holographic boardroom contract, and spatial layout persistence. Index updated.

## Out of scope (Phase G+)
- Native AR/VR (visionOS, Quest) shells, real holography, cross-account collaboration.

