

# Boardroom Advisor Council — Cinematic Visual Upgrade + Live Discussion

## What We're Building

Transforming the advisor experience from static cards into a **cinematic boardroom table visualization** (inspired by the reference images) where advisors sit around a virtual table, each with a circular portrait, name, and role. When a topic is being reviewed, advisors **actively discuss it** with visible thinking, reasoning chains, and sequential commentary — not just static quotes.

## Key Gaps to Fix

1. **No visual "boardroom table" layout** — Advisors are shown as a flat grid. The reference images show circular portraits arranged around a table with cinematic lighting. Need a dedicated `AdvisorCouncilTable` component.

2. **DomainAdvisorBoard modes are mostly placeholder** — Roundtable just shows emoji+specialty. Ask One says "Connect data sources." Debate says "Connect data to generate analysis." Synthesis says "Connect data sources." Evidence says "Awaiting data." All 5 modes need rich mock content showing actual advisor thinking/reasoning.

3. **No live discussion thread** — When reviewing an agenda item, there should be a discussion feed where advisors weigh in sequentially with reasoning, like a real boardroom debate. Each advisor speaks in turn with their perspective, evidence cited, confidence, and reasoning chain visible.

4. **No advisor portrait/avatar beyond emoji** — The reference shows real circular portrait photos. We'll use gradient-based generated avatars with initials (since we can't bundle photos), styled cinematically with glowing ring borders.

## Architecture

```text
New Components:
├── BoardroomAdvisorCouncil.tsx     — Cinematic table layout with advisor seats
├── BoardroomDiscussionThread.tsx   — Live sequential advisor discussion on a topic
└── DomainAdvisorBoard.tsx          — Rewrite all 5 modes with rich mock content

Modified:
├── BoardroomSynthesisView.tsx      — Replace grid with AdvisorCouncilTable + Discussion
├── BoardroomExecutiveView.tsx      — Embed mini council strip
└── BoardroomAppShell.tsx           — Add "Council" module to sidebar
```

## Detailed Changes

### 1. `BoardroomAdvisorCouncil.tsx` (new)

A cinematic circular/oval table layout:
- Advisors arranged in a **horseshoe/arc formation** (CSS flex with transforms)
- Each advisor seat: large circular avatar (gradient background + initials), glowing accent ring, name, role title
- Active/speaking advisor has pulsing glow + spotlight effect
- Clicking an advisor opens their deep-focus panel
- The center of the arc shows the **current topic being discussed** with a spotlight effect
- Cinematic background: darker than the rest, subtle radial light from center

### 2. `BoardroomDiscussionThread.tsx` (new)

A sequential discussion feed showing advisors debating a topic:
- Each entry: advisor avatar + name + role, their statement, reasoning chain (2-3 bullet points of "thinking"), confidence score, evidence cited count, timestamp
- Entries appear with staggered animation (as if advisors are speaking in turn)
- Different visual treatment for: agreement (green accent), concern (amber), dissent (red), question (blue)
- "Thinking" section shows the advisor's reasoning process: "Considering X... Based on Y... Therefore Z"
- Mock data: 6-8 discussion entries for a collections review topic

### 3. `DomainAdvisorBoard.tsx` (rewrite)

Replace placeholder content in all 5 modes:

**Roundtable**: Each advisor shows their current stance with a speech bubble, confidence bar, and 2-line reasoning summary. Not just "specialty" text.

**Ask One**: When an advisor is selected, show their full analysis: recommendation, reasoning chain (3-4 steps), evidence cited, confidence, uncertainty areas, and what they'd need to be more certain.

**Debate**: Pre-populated with actual opposing arguments. Each side shows: position statement, 3 supporting points, 2 risks acknowledged, confidence. Bottom shows AI-generated verdict with reasoning.

**Synthesis**: Shows combined board output: unified recommendation, where advisors agree, where they diverge, overall confidence, aggregate evidence, and final motion.

**Evidence**: Each advisor's evidence chain populated with mock data: source type (verified/inferred/assumed), freshness, confidence per source, and gaps identified.

### 4. `BoardroomSynthesisView.tsx` (modify)

- Add a new section at the top: **"The Council"** — renders `BoardroomAdvisorCouncil` showing all scope-relevant advisors in the cinematic arc layout
- Below it: **"Live Discussion"** — renders `BoardroomDiscussionThread` showing the current topic being debated
- Keep existing consensus meter, disagreement cards, and evidence chains below

### 5. `BoardroomExecutiveView.tsx` (modify)

- Replace the simple "Advisor Voices" horizontal strip with a compact version of the council (3 advisors in a mini arc with the active topic in center)

### 6. `BoardroomAppShell.tsx` (modify)

- Add "Advisor Council" as a new sidebar module between "Advisor Synthesis" and "Simulation"
- Routes to a dedicated view showing the full `BoardroomAdvisorCouncil` + `BoardroomDiscussionThread`

## Visual Design

- **Advisor avatars**: Large circles (64px in council, 48px in discussion), gradient backgrounds using each advisor's `accentColor`, white initials, glowing ring border when speaking
- **Speaking indicator**: Pulsing ring animation + subtle spotlight cone from above
- **Discussion bubbles**: Glass cards with left-border accent color, "thinking" section in slightly dimmer text with a brain icon
- **Table center**: The agenda topic rendered as a spotlighted card with radial glow
- **Overall atmosphere**: Even darker than current Boardroom views, with more dramatic lighting

## Files

| File | Action |
|------|--------|
| `src/components/sita/apps/boardroom/BoardroomAdvisorCouncil.tsx` | **New** — Cinematic arc table with advisor seats |
| `src/components/sita/apps/boardroom/BoardroomDiscussionThread.tsx` | **New** — Sequential advisor discussion with reasoning |
| `src/components/sita/domain-shared/DomainAdvisorBoard.tsx` | **Rewrite** — All 5 modes with rich mock content |
| `src/components/sita/apps/boardroom/BoardroomSynthesisView.tsx` | **Modify** — Add council + discussion at top |
| `src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx` | **Modify** — Mini council in advisor voices section |
| `src/components/sita/apps/boardroom/BoardroomAppShell.tsx` | **Modify** — Add Council module to sidebar |

6 files. No database changes.

