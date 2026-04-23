
# SITA = Jarvis: Desktop HUD + System-Wide Voice

Goal: make the desktop the front door of "Sita" — an always-on, voice-first HUD that can see everything on screen, speak across every app, and act through the OS service fleet. Today the Sentinel voice loop is locked inside `/personal-brain`. We promote it to a shell-level service, give the desktop a cinematic "presence" UI, then layer advanced capabilities in 6 incremental phases.

---

## Phase A — Wow-grade desktop "Sita HUD"

Visual goal: the moment you log in, the desktop *feels alive*. Not flat wallpaper + dock, but a cinematic command bridge.

What we build:
- **SitaPresenceOrb** (new shell-level component, mounted in `ShellLiveLayer`)
  - Floating, draggable holographic orb in a corner of the desktop.
  - 4 visual states: idle (slow breathing), listening (fast pulse + ring), thinking (orbiting particles), speaking (audio-reactive waveform around the orb).
  - Uses `framer-motion` + a WebGL/canvas shader for a soft volumetric glow, falling back to CSS gradients on low-power tier.
- **SitaAmbientCanvas** (replaces / wraps `ShellAmbientBackground`)
  - Subtle parallax aurora that *reacts* to system state: tints blue when calm, amber on warnings (from `healthd`), violet when Sentinel is listening.
  - Time-of-day tinting (morning/day/dusk/night) sourced from `timed`.
- **SitaHUD strip** (top-of-screen, above the menu bar)
  - One-line "ambient status" feed: e.g. *"Good morning. 3 boardroom items. Markets calm. Sentinel armed."*
  - Built from existing `LiveActivityBar` + `IntentSuggestionsWidget` + a new "Sita greeting" line driven by the Brain.
- **First-run Sita reveal** — a 6-second cinematic on first desktop arrival: orb materializes, speaks "I'm Sita. Say *Hey Sita* anytime." Persisted via `pb_sita_reveal_v1` in localStorage.

Constraints we respect:
- Glassmorphic depth, vibrant gradients (Premium UX System).
- No marketing clutter. Desktop-first.
- Empty-state honesty — no fake metrics in the HUD strip; if a source has no data, the line is omitted.
- Runtime-tier aware via `useCurrentLayer()` — appliance/simulated tiers get the CSS fallback orb, not the WebGL one.

---

## Phase B — Sentinel becomes the OS voice spine

Today `AlwaysOnVoice.tsx` only runs inside `BrainDashboard`. We promote it.

What we build:
- **`SitaVoiceProvider`** (new, in `src/contexts/`) — boots the wake-word loop once at the shell level, exposes `useSitaVoice()` everywhere.
  - Owns lifecycle (wake → capture → think → speak), persists toggle in user settings (DB-backed via `useSentinelPrefs` mirrored to a `sita_voice_prefs` row).
  - One singleton — no double-listening when the Brain is also open.
- **OS-wide intents** — captured commands flow through a new `voice-intent-router`:
  - "Open Calendar" → uses the existing app launcher (`handleLaunchApp`).
  - "Focus mode 25 minutes" → `useFocusMode().start(25)`.
  - "What's on my calendar today?" → routes to Brain with calendar tool context.
  - "Read me the boardroom brief" → fetches `DesktopBoardroomBriefWidget` data, TTS-reads it.
  - Unrecognized → falls back to Brain `mode='think'` (existing edge function).
- **Voice receipts** — every spoken command writes a row to `ai_action_receipts` (existing table, see `mem://infrastructure/receipt-emission`) so it's auditable.
- **HUD wiring** — the orb's pulse and waveform are driven by the provider, so it's identical whether you're on `/index`, `/calendar`, or inside a windowed app.
- **Privacy controls** — a new `ControlCenter` row "Sentinel: armed / off / mute mic" so the user always knows mic state. Hard kill switch via existing runbook system (`mem://features/runbook-and-simulation-system`).

---

## Phase C — Sita sees what you see (visual context)

What we build:
- **Screen-context hook** `useSitaScreenContext()` — captures the focused window's title, route, and a structured "what's visible" payload that each app opts into via a small `<SitaContext value={...}>` wrapper.
- Brain prompts now include the focused-window context, so "summarize this" and "schedule this" work in any app without the user re-explaining.
- Optional **vision tier**: on Tier 2 (desktop host), allow on-demand screenshot of the focused window (Electron `desktopCapturer`) sent to a multimodal model via the AI gateway. Off by default, requires explicit consent toast each session.

---

## Phase D — Proactive Sita (ambient daemon)

What we build:
- **`sita-ambient` edge function** (scheduled every 5 min) — reads signals from existing widgets/connectors, decides if Sita should speak unprompted (e.g. "You have a meeting in 10 minutes and traffic is bad").
- **Quiet hours + budget** — respects existing `notification-classifier`, focus mode, and `ai-budget` enforcement (`mem://architecture/ai-budget-enforcement`).
- **Spoken vs silent** — proactive items appear in the HUD strip silently by default; user can opt-in to "speak important alerts" per category.
- **Anticipation chips** — small hover chips next to the orb suggesting next actions ("Start standup notes?" 9:58am).

---

## Phase E — Sita acts (agentic execution)

Hooks into the existing **Orchestration Pipeline** (`mem://architecture/orchestration-pipeline`) and **AI Workforce Runtime** (`mem://features/ai-workforce-runtime`).

What we build:
- **Action plan dialog** — when Sita is asked to *do* something multi-step ("draft an email to Alex about Q2 and put a meeting on Thursday"), she shows a transparent plan card on the HUD with each step + a confirm button. No silent writes.
- **Capability gates** — every action flows through existing `PermissionGatedRoute` / capability leases (`useCapabilityLease`). Voice can never bypass approval that the click UI requires.
- **Boardroom hand-off** — strategic asks are routed to the Advisor Boardroom (`mem://features/advisor-boardroom-showcase`) instead of Brain, with the orb morphing into the council ring while they deliberate.

---

## Phase F — Advanced "high-tech" capability set

Picked for impact + feasibility on our current stack:

1. **Spatial workspaces** — extend `SpatialDesktop` so Sita can voice-navigate ("show me last Tuesday's workspace"); workspaces snapshot via Digital Twins (`mem://features/digital-twins`).
2. **Multi-device handoff** — pair desktop + mobile so saying "continue this on my phone" pushes the focused app/window over (uses `sync-engine`).
3. **Gesture + gaze (desktop tier only)** — optional webcam gesture pad: pinch to dismiss notifications, look-away to pause TTS. Off by default; behind a tier-3 capability flag.
4. **Holographic boardroom mode** — full-screen takeover where the 10 advisors visually appear in a ring around the user; Sita is the moderator. Reuses existing boardroom assets.
5. **Wake-on-glance / wake-on-clap** — alternate wake modes besides phrase, for accessibility.
6. **Encrypted voice memory** — long-term "she remembers" via `advisor_board_memory` with per-entry user-controlled retention (TTL governed by `mem://governance/data-retention-policy`).
7. **Sovereign offline mode** — on appliance tier, fall back to local STT/TTS (Web Speech) with a clear "offline Sita" badge so the user always knows the model boundary.
8. **Skill marketplace** — third-party voice "skills" published via the existing App Platform (`mem://architecture/app-platform-and-store`); each skill declares the voice intents it claims, gated by capability review.

---

## Architecture / technical notes

- **No new providers in the kernel.** `SitaVoiceProvider` mounts inside `RuntimeProvider` *after* `NovaSDKProvider`, before `PipelineBootstrap`, so it can publish intents into the orchestration pipeline.
- **Singleton wake-word.** `useWakeWord` is moved behind the provider; `BrainDashboard`'s current local mount is replaced by a thin consumer that just renders the orb panel.
- **All AI through the gateway** (`mem://constraints/sovereign-ai-gateway`). No direct ElevenLabs/OpenAI calls in components.
- **Tier matrix.** WebGL HUD only on Tier 1/2; CSS fallback on Tier 3/4. Vision capture only on Tier 2.
- **Receipts + audit.** Every voice-triggered action writes to `ai_action_receipts` with `source: 'sita_voice'`.
- **Kill-switches.** New runbooks: `sita.voice.disable`, `sita.proactive.pause`, `sita.vision.revoke`.
- **No demo-mode bypass.** When `isDemoMode`, Sita uses canned responses and never hits the network — same pattern as the rest of the app.

---

## Suggested build order

```text
Phase A   Desktop HUD + Presence Orb              (visual wow, no behavior change)
Phase B   SitaVoiceProvider + OS intent router    (Sita becomes system-wide)
Phase C   Screen-context awareness                (Sita understands current app)
Phase D   Proactive ambient daemon                (Sita speaks unprompted)
Phase E   Agentic action plans                    (Sita does multi-step work)
Phase F   Advanced capabilities (pick & choose)   (spatial, handoff, gestures…)
```

Each phase ships independently and is testable on its own. After approval I'll start with **Phase A** (the visual HUD + Presence Orb) so the wow is immediate, then move into Phase B to wire it as the OS voice spine.
