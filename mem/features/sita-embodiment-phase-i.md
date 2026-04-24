---
name: Sita Embodiment Layer (Phase I)
description: Persona ↔ voice spine bridge. Maps active personality (Phase H) onto existing voice spine (Phase B) for consistent voice/rate/pitch and persona-shaped replies.
type: feature
---

Phase I of Sita-as-Jarvis — the Embodiment Layer that makes Sita *sound* like the persona the user picked, without duplicating Phase B's voice spine.

## Surfaces
- **Persona-voice bridge** (`src/lib/sita-embodiment/persona-voice-bridge.ts`): pure helpers — `pickVoiceForActivePersona`, `rateForActivePersona`, `pitchForActivePersona`, `shapeReplyForActivePersona`. Reads from `sita_personality_profiles` cache (Phase H).
- **Mount** (`SitaEmbodimentMount`): listens to `sita-voice-reply` (Phase B emits) and re-emits `sita-voice-reply-shaped` so HUD whisper / agent receipts can adopt persona tone.
- **Controls** (`SitaEmbodimentControls`): Control Center row 1g — toggle bridge, pick system voice, suggested voice per persona.

## Invariants
- **No new STT/TTS engines.** Phase B `useWakeWord` + `useSpeechSynthesis` remain the only audio I/O. Phase I only *biases* them.
- Quiet-hours suppression honored (Phase H rule); user-initiated voice commands can `override`.
- Voice URI persisted in localStorage (`sita.embodiment.voiceURI`); bridge enabled flag in `sita.embodiment.enabled`.
- Pure client-side — no DB schema changes.
