

# Make Every Advisor Board Super Interactive & Wow

## Current State

The **Investment Office AdvisorBoard** is the gold standard — it has 5 view modes (Council, Synthesis, Debate, Ask the Board, Compare), clickable advisor detail panels, confidence badges, and recommendation badges. But the **Money Advisor Board** and **Business Boardroom** are much simpler — static cards in a grid with no interactivity beyond mode switching (Money) or tab switching (Business). There is no way to chat with advisors inline, see disagreements visualized, or drill into reasoning chains.

## Plan

### Step 1: Create a shared `AdvisorCouncilShell` component

Create `src/components/advisors/AdvisorCouncilShell.tsx` — a reusable interactive wrapper that any domain's advisor board can use. It provides:

- **View mode switcher**: Council Grid, Synthesis, Debate, Ask the Board, Timeline
- **Advisor detail drawer**: Click any advisor card to expand a slide-over panel showing full reasoning, knowledge sources, memory, confidence breakdown, and action history
- **Animated transitions**: Framer Motion layout animations between views
- **Confidence heatmap bar**: A horizontal strip showing all advisors' confidence at a glance with colored segments

### Step 2: Create `AdvisorDebateView` component

Create `src/components/advisors/AdvisorDebateView.tsx`:
- Shows where advisors **disagree** side-by-side with animated "versus" cards
- Each position shows confidence score, reasoning chain, and data sources
- User can vote/decide, and the decision is recorded
- Visual: two cards facing each other with a glowing "VS" divider and pulse animation

### Step 3: Create `AskAdvisorChat` inline component

Create `src/components/advisors/AskAdvisorChat.tsx`:
- Inline chat bubble that calls `chat-advisor` edge function with the selected advisor context
- Renders markdown responses with `react-markdown`
- Shows typing indicator with advisor's domain accent color
- Suggested quick-ask questions based on advisor domain
- Conversation stays in-panel (no page navigation)

### Step 4: Create `AdvisorTimelineView` component

Create `src/components/advisors/AdvisorTimelineView.tsx`:
- Vertical timeline showing recent advisor actions, recommendations, and state changes
- Each entry has: timestamp, advisor avatar, action summary, confidence at time of action, and outcome status
- Pulls from `advisor_action_queue` and `ai_workforce_recommendations` tables
- Animated entry with staggered fade-in

### Step 5: Create `AdvisorDetailDrawer` component

Create `src/components/advisors/AdvisorDetailDrawer.tsx`:
- Slide-from-right drawer (uses existing Sheet component)
- Tabs inside: Overview, Knowledge, Memory, Actions, Feedback
- Overview: mission, confidence gauge (animated SVG ring), personality traits, current mode
- Knowledge tab: embedded `AdvisorKnowledgePanel`
- Memory tab: shows `advisor_memories` entries with importance scores
- Actions tab: recent actions from `advisor_action_queue`
- Feedback tab: thumbs up/down on past recommendations, writes to `advisor_feedback`

### Step 6: Upgrade `MoneyAdvisorBoard` to use the new shell

Replace the flat grid layout with `AdvisorCouncilShell`, passing the 8 money advisors as structured data. Keep the mode personality switcher as a toolbar above the council. Wire up the detail drawer, debate view, ask-the-board chat, and timeline.

### Step 7: Upgrade `BusinessBoardroom` advisor section

Add an "Advisor Council" tab/view to `BusinessBoardroom` that uses `AdvisorCouncilShell` with business-domain advisors. The existing boardroom content stays as the default "Executive Review" tab.

### Step 8: Add micro-interactions and visual polish

- Advisor cards: hover reveals a subtle glow ring in the domain's accent color
- Confidence scores: animated count-up on mount (0 → actual value)
- Status dots: live pulse animation (green = active, amber = thinking, red = error)
- Card transitions: spring-based layout animations when switching views
- "Thinking" state: shimmer gradient sweep across card while advisor is processing

## Files

- **Create**: `src/components/advisors/AdvisorCouncilShell.tsx` (~200 lines)
- **Create**: `src/components/advisors/AdvisorDebateView.tsx` (~150 lines)
- **Create**: `src/components/advisors/AskAdvisorChat.tsx` (~180 lines)
- **Create**: `src/components/advisors/AdvisorTimelineView.tsx` (~120 lines)
- **Create**: `src/components/advisors/AdvisorDetailDrawer.tsx` (~250 lines)
- **Edit**: `src/pages/money/MoneyAdvisorBoard.tsx` (use AdvisorCouncilShell)
- **Edit**: `src/pages/business/BusinessBoardroom.tsx` (add advisor council tab)

## Technical Details

- `AskAdvisorChat` calls `chat-advisor` via `supabase.functions.invoke("chat-advisor", { body: { advisor, message, history } })`
- `AdvisorDetailDrawer` queries `advisor_memories`, `advisor_action_queue`, and `advisor_feedback` via Supabase client
- `AdvisorDebateView` generates disagreement pairs by comparing recommendation directions across advisors in the same domain
- All new components use the existing design tokens: `APP_MATERIALS`, `APP_SHADOWS`, domain accent colors
- Animated confidence gauge uses SVG `stroke-dashoffset` with Framer Motion `animate`
- Timeline pulls from `advisor_action_queue` ordered by `created_at DESC`, limit 20

