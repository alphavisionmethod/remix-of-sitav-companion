---
name: sita-spatial-phase-f
description: Phase F of Sita-as-Jarvis — spatial & multi-device. Multi-device handoff via Realtime, on-device gesture/gaze, holographic boardroom overlay, spatial workspace (⌘⇧Space). All features opt-in via Control Center toggles.
type: feature
---

## Sita Spatial (Phase F)

- **Feature flags** live in `localStorage["sita_spatial_features_v1"]` via `useSpatialFeatures()` (`src/lib/sita-spatial/feature-flags.ts`). Defaults: handoff & boardroom ON, gesture/gaze/spatial OFF.
- **Handoff** uses Postgres table `sita_handoff_sessions` + Supabase Realtime channel `sita_handoff:{user_id}`. Each device labels itself via `getDeviceLabel()` (persisted). Edge function `sita-handoff-broker` validates accepts server-side.
- **Gesture engine** (`gesture-engine.ts`) is camera-based and **on-device only** — never streams off the machine. Heuristic baseline; a richer MediaPipe model can be plugged in behind the same `emit()` API. Gestures map to OS events: `palm_up` → `sita:open`, `swipe_away` → dismiss whisper, `air_tap`/`pinch` → click element under point.
- **Gaze tracker** (`gaze-tracker.ts`) currently uses cursor-position + dwell as a proxy; resolves window IDs via `data-window-id` attributes. Fires when dwell > 700ms.
- **Holographic Boardroom** (`SitaHolographicBoardroom.tsx`) is CSS-3D only (no three.js). Open via `window.dispatchEvent(new CustomEvent("sita-boardroom:convene", { detail: { topic } }))`.
- **Spatial workspace** (`SitaSpatialField.tsx`) toggled with `Cmd/Ctrl + Shift + Space`; sets `body[data-sita-spatial="on"]` so apps can opt into parallax styling. Layout persisted via `sita_spatial_layout` (one row per user).
- **Cross-modal memory** writes to `sita_spatial_events` (30-day TTL) for every handoff/gesture/gaze/spatial event.
- **Safety**: All actions still flow through `useAction` → 12-stage kernel. Boardroom decisions emit standard Phase E `ActionPlan`s — same approval gates and receipts.
- **RLS**: All three new tables are user-scoped (`auth.uid() = user_id`).
