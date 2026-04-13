

# Advisor Meeting Room with AI-Generated Avatars

## What We're Building

A **virtual boardroom meeting** experience where you sit at a table with your AI advisors — each with a unique, AI-generated character portrait. You can run live multi-advisor discussions, see advisors react to each other's points, and get synthesized decisions.

## Plan

### Step 1: Generate and store advisor avatar portraits

Create an edge function `advisor-avatar-generate` that uses the Lovable AI image generation model (`google/gemini-3.1-flash-image-preview`) to generate unique character portraits for each advisor persona. Portraits are stored in the `user-files` storage bucket under `advisor-avatars/`. Each advisor gets a distinct visual identity:

- **Money advisors**: Sharp-suited financial professionals, emerald/green tones
- **Business advisors**: Executive/corporate styling, purple tones  
- **Concierge advisors**: Polished hospitality aesthetic, gold/amber tones
- **Strategy/Growth**: Futuristic/analytical look, blue/cyan tones

A database migration adds an `avatar_url` column to `advisor_knowledge` (or a new `advisor_profiles` table) to persist the generated portrait URL per advisor.

### Step 2: Create `AdvisorPortrait` component

Create `src/components/advisors/AdvisorPortrait.tsx` — replaces the icon-based `AdvisorAvatar` with a rich portrait component:
- Circular cropped AI-generated image with domain-colored gradient border ring
- Animated speaking indicator (pulsing ring + subtle scale) when the advisor is "talking"
- Fallback to the existing icon-based avatar if no portrait exists
- Sizes: `sm` (32px), `md` (48px), `lg` (80px), `xl` (120px for meeting view)

### Step 3: Create `AdvisorMeetingRoom` component

Create `src/components/advisors/AdvisorMeetingRoom.tsx` — the hero feature:

**Visual layout**: A dark, premium "conference table" view:
- Advisors arranged in a semicircle around a virtual table (CSS grid + absolute positioning)
- Each advisor shows their portrait, name plate, and a live status indicator
- Center area shows the current topic/question and synthesized output
- Active speaker gets a glowing highlight ring and their card elevates

**Interaction flow**:
1. User types a question or selects a topic
2. Each advisor "responds" in sequence via `chat-advisor` calls (with slight stagger delay for realism)
3. Responses appear as speech bubbles next to each advisor's portrait
4. A synthesis panel at the bottom shows the combined recommendation
5. User can tap any advisor to get them to elaborate

**Animations**:
- Advisors fade in with staggered entrance when meeting "starts"
- Active speaker portrait scales up with a breathing glow
- Speech bubbles slide in from the advisor's position
- Thinking state shows animated dots below the advisor's portrait

### Step 4: Create `AdvisorMeetingControls` component

Create `src/components/advisors/AdvisorMeetingControls.tsx`:
- "Start Meeting" button with a premium animation (ripple + glow)
- Topic input field with suggested topics per domain
- "Mute/Unmute" individual advisors (exclude from responses)
- "End Meeting" with a summary export
- Meeting duration timer

### Step 5: Add "Meeting" view mode to `AdvisorCouncilShell`

Add a fifth tab "Meeting" (with a `Video` icon) to the existing council shell. When selected, renders `AdvisorMeetingRoom` with the domain's advisors. This makes the meeting available in both Money and Business boards.

### Step 6: Create avatar generation admin tool

Add a "Generate Avatars" button in the advisor settings (where `AdvisorKnowledgePanel` lives). Clicking it calls the edge function to generate portraits for all advisors in that domain. Shows a progress indicator during generation. Generated avatars are cached — only regenerate on demand.

## Files

- **Create**: `supabase/functions/advisor-avatar-generate/index.ts` (~120 lines)
- **Create**: `src/components/advisors/AdvisorPortrait.tsx` (~80 lines)
- **Create**: `src/components/advisors/AdvisorMeetingRoom.tsx` (~300 lines)
- **Create**: `src/components/advisors/AdvisorMeetingControls.tsx` (~100 lines)
- **Edit**: `src/components/advisors/AdvisorCouncilShell.tsx` (add Meeting tab)
- **Edit**: `src/components/advisors/AdvisorDetailDrawer.tsx` (use AdvisorPortrait)
- **Migration**: Add `advisor_profiles` table (id, advisor_id, domain, display_name, avatar_url, personality_traits, visual_style)

## Technical Details

- Avatar generation uses `google/gemini-3.1-flash-image-preview` via the Lovable AI Gateway with `LOVABLE_API_KEY`
- Generated images are base64 → uploaded to `user-files` bucket under `advisor-avatars/{advisor_id}.png`
- Meeting room calls `chat-advisor` for each advisor in parallel with `Promise.allSettled`, then renders responses with staggered animation
- The semicircle layout uses CSS `transform: rotate()` + `translateX()` for responsive positioning
- Speech bubble positioning uses `getBoundingClientRect` relative to the advisor's portrait element
- All animations use Framer Motion with spring physics matching existing OS conventions

