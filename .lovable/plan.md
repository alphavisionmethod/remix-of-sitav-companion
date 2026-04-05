

# SITA OS — Advanced Auto-Personalization System

## Current State

- **Personalization Engine**: 10-line stub — stores theme/language/timezone in a `Map`. No persistence, no learning, no adaptation.
- **PersonalizationStudio page**: 274 lines of hardcoded mock data (fake learnings, fake preferences, fake memory counts). Nothing reads from `user_memory` table or any real source.
- **Preference Memory Service**: Static defaults in a `Map`. No behavioral tracking.
- **user_memory table**: Exists in Supabase, stores key/value pairs per user — but only written during onboarding. Never updated from behavioral signals.
- **Missing entirely**: Behavioral tracking, adaptive learning engine, automatic preference inference, real-time personalization feedback loop.

## What We Build

### 1. Behavioral Learning Engine — `src/lib/services/personalization-engine/behavioral-learning.service.ts`

Tracks every meaningful user interaction and infers preferences automatically:

- **Event ingestion**: `trackEvent(userId, event)` — accepts navigation, click, approval, dismissal, timing events
- **Pattern detection**: Rolling window analysis (last 30 days) to detect:
  - Time-of-day preferences (when user is most active per domain)
  - Navigation patterns (which surfaces visited first, most often)
  - Approval patterns (auto-approve threshold, preferred review times)
  - Communication style (response length, emoji usage, formality)
  - Content density preference (how much data they want to see)
- **Confidence scoring**: Each inference has a confidence (0-1) based on sample size and consistency
- **Auto-apply rules**: When confidence > 0.85 and user has "fully automated" mode, preferences apply automatically. Otherwise queued as suggestions.

### 2. Adaptive Personalization Engine — Rewrite `src/lib/services/personalization-engine/index.ts`

Replace the 10-line stub with a full engine:

- **Deep preference model**: 40+ preference dimensions across communication, display, workflow, trust, scheduling, financial, household
- **Layered preferences**: `explicit` (user-set) > `inferred` (behavioral) > `default` — explicit always wins
- **Domain-specific profiles**: Different preferences per domain (business vs. concierge vs. money)
- **Time-aware adaptation**: Morning vs. evening modes, weekday vs. weekend, seasonal
- **Household-aware**: Per-family-member preferences when in concierge mode
- **Persistence hook**: `syncToSupabase(userId)` writes to `user_memory` table; `loadFromSupabase(userId)` hydrates on login

### 3. Real-Time Personalization Hook — `src/hooks/use-adaptive-personalization.ts`

React hook that connects the engine to the UI:

- Loads preferences from Supabase on mount
- Exposes `preferences`, `learnings`, `automationRules`
- `trackInteraction(event)` method for components to report behavior
- Auto-syncs inferred preferences to Supabase every 5 minutes (debounced)
- Returns personalization "suggestions" the user can accept/dismiss

### 4. Personalization Studio — Rewrite `src/pages/PersonalizationStudio.tsx`

Replace all hardcoded data with real data:

- **Profile tab**: Reads/writes real preferences from `user_memory` via the hook. Edit mode persists to Supabase.
- **Learnings**: Shows real inferred patterns from the behavioral engine with real confidence scores. User can "confirm" (promotes to explicit) or "dismiss" (suppresses inference).
- **Preferences tab**: Real domain-specific preferences with live editing
- **Memory tab**: Reads from `user_memory` table (already exists in MemoryCenter, reuse pattern)
- **Automation tab**: Real automation rules with toggles that persist. Each rule shows: action, current level (suggest/draft/auto), trust badge, override controls.
- **Auto-Pilot toggle**: Master switch — when ON, SITA auto-applies all high-confidence learnings without asking. Shows what it would change before enabling.

### 5. Interaction Tracker Integration — `src/components/sita/InteractionTracker.tsx`

Invisible wrapper component placed at shell level that:

- Tracks page navigation events (which pages, how long, what order)
- Tracks sidebar clicks, command palette usage, advisor interactions
- Tracks approval accept/reject patterns with amounts
- Tracks time-of-day activity patterns
- Feeds all events to the behavioral learning engine
- Respects privacy mode — no tracking in `managed` or when user opts out
- All data stays local + in user's own `user_memory` rows (sovereign data)

### 6. Auto-Personalization Rules Engine — `src/lib/services/personalization-engine/auto-rules.service.ts`

Automatic actions triggered by learned preferences:

- **Display**: Auto-switch to calm mode after 9 PM if user consistently reduces density at night
- **Notifications**: Auto-mute non-urgent during detected focus hours
- **Dashboard**: Reorder surface cards based on actual usage frequency
- **Advisors**: Route to preferred advisor based on topic + time pattern
- **Scheduling**: Suggest meeting times based on user's actual availability patterns
- **Financial**: Adjust safe-to-spend alerts based on spending behavior variance
- Each rule has: trigger condition, confidence threshold, action, user-override flag

### 7. Barrel Export — Edit `src/lib/services/personalization-engine/index.ts`

Re-export all new modules from the barrel.

## File Summary

| # | File | Type |
|---|------|------|
| 1 | `src/lib/services/personalization-engine/index.ts` | Rewrite (stub → full engine) |
| 2 | `src/lib/services/personalization-engine/behavioral-learning.service.ts` | New |
| 3 | `src/lib/services/personalization-engine/auto-rules.service.ts` | New |
| 4 | `src/hooks/use-adaptive-personalization.ts` | New |
| 5 | `src/components/sita/InteractionTracker.tsx` | New |
| 6 | `src/pages/PersonalizationStudio.tsx` | Rewrite (mock → real data) |

**Total: 3 new files, 2 rewrites, 1 new component. All pure TypeScript, no external dependencies. All data stored in user's own `user_memory` rows — fully sovereign.**

## Technical Notes

- Behavioral events stored in-memory with periodic flush to `user_memory` (category: "behavioral")
- Pattern detection uses simple statistical methods (frequency counting, time binning, exponential moving average) — no ML dependencies
- Confidence = `min(1, sampleCount / requiredSamples) * consistencyRatio`
- Auto-apply requires: confidence >= 0.85, user auto-pilot ON, no explicit override for that preference
- Privacy: InteractionTracker checks `privacyMode` from shell state; disabled in `managed` mode
- All preferences follow the layered model: explicit > inferred > default — user always has final say

