

# Talking Avatars — Cinematic "Wow" Upgrade

## Current State
The TalkingAvatar has a basic mouth ellipse, 12 waveform bars, subtle breathing, and a bottom glow. It works but feels like a simple animated circle — not cinematic or "wow."

## What Changes

### 1. `TalkingAvatar.tsx` — Major visual overhaul

**Double-ring pulsing aura**: Replace the single waveform ring with two concentric glowing rings that pulse outward like sonar/radar when speaking — one fast, one slow, both using the advisor's accentColor with radial gradient fade.

**Eye blink animation**: Add two small white-highlight dots (eyes) that periodically "blink" (scale to 0 and back) every 3-4 seconds — makes the avatar feel alive even when idle.

**Holographic shimmer overlay**: A rotating gradient overlay (conic-gradient) that slowly sweeps across the portrait like a holographic card effect — very subtle, adds premium depth.

**Enhanced mouth**: Replace the plain dark ellipse with a gradient mouth that has inner shadow and slight blur, making it look more natural against real photos.

**Ripple burst on speak start**: When transitioning from idle to speaking, fire a single expanding ring that fades out — like a "ping" activation effect.

**Ambient particle field**: 4-5 tiny floating dots that orbit slowly around the avatar when speaking, like ambient energy particles — each at a different radius and speed.

**Dynamic border glow**: The avatar's circular border itself becomes a rotating gradient (like a loading spinner but smooth and continuous) when speaking, using the accentColor.

**Idle state upgrade**: Even when not speaking, add a very subtle "alive" indicator — a faint breathing glow ring that pulses at resting heart rate (~1Hz).

### 2. `BoardroomAdvisorCouncil.tsx` — Enhance council presentation

**Name text glow**: The speaking advisor's name gets a subtle text-shadow glow matching their accentColor.

**"LIVE" badge**: Add a small pulsing red dot + "LIVE" text next to the speaking advisor's nameplate.

**Sound wave mini-bars**: Add 3 tiny animated bars (like a music equalizer) next to the mic icon for the speaking advisor.

## Files

| File | Change |
|------|--------|
| `TalkingAvatar.tsx` | Double-ring aura, eye blinks, holographic shimmer, particle orbit, rotating border glow, ripple burst, enhanced mouth |
| `BoardroomAdvisorCouncil.tsx` | Name glow, LIVE badge, equalizer bars on speaking advisor |

2 files. No database changes.

