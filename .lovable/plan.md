

# Boardroom Enhancement — Interactive Advisors + Full Spec Compliance

## Audit Results

After reviewing all 8 Boardroom files against the detailed product spec, here is what is fully implemented and what gaps remain:

### Already Solid
- Shell with cinematic atmosphere, sidebar, ambient spotlight
- Header with scope/trust/freshness/session mode
- Executive View: agenda table with scope filtering, what-changed, cross-domain signals, recommended motion, evidence chain, freshness timestamps, wired buttons
- Pulse View: domain tabs synced to scope, metrics, priorities, advisor stances, overdue pressure
- Synthesis View: consensus meter, advisor stance cards with AdvisorAvatar, disagreement cards with collapsible evidence chains
- Simulation View: scenario comparison, confidence band, downstream effects, assumptions with freshness and type badges
- Approval View: execution chain, blockers panel, receipt generation, pending approvals with ApprovalGate, decision seals, proof receipts
- Decision Memory: expandable timeline with outcomes, advisor positions, receipt hashes

### Gaps Found (5 issues)

**1. Advisors are static text — no interactivity, no "talking", no role identity**
The spec says advisors should be interactive — the user should be able to hear what each advisor "thinks" and challenge them. Currently advisors are just name + quote + confidence bar. The `DomainAdvisorBoard` with its 5 interaction modes (Roundtable, Ask One, Debate, Synthesis, Evidence) already exists but is NOT used anywhere in the Boardroom. Each advisor has a defined role, specialty, and emoji but these aren't surfaced in the Boardroom views.

**2. Synthesis View advisors don't match the topology**
The Synthesis View uses hardcoded `ADVISOR_STANCES` with generic names ("Revenue Advisor", "CRM Advisor") instead of pulling from the canonical `ADVISOR_ROSTERS` in `advisor-topology.ts`. Advisors should show their emoji, full role description, and specialty.

**3. No interactive advisor panel in the Boardroom**
The spec requires users to be able to: "inspect evidence, challenge assumptions, ask advisors to debate, compare scenarios." The Boardroom has no way to interact with individual advisors or trigger debates between them.

**4. Session mode in header doesn't react to active module**
When user navigates to Simulation view, the header still says "Review Mode." It should auto-update to reflect the current module context.

**5. Synthesis View not scope-filtered**
Changing scope in the header doesn't filter advisors in the Synthesis View to show only the relevant domain's advisors.

## Fix Plan

### File 1: `BoardroomAppShell.tsx`
- Derive `sessionMode` from `activeModule` (executive/pulse/synthesis → "review", simulation → "simulation", approvals → "approval")
- Pass `sessionMode` to `BoardroomHeader`

### File 2: `BoardroomHeader.tsx`
- Accept and display the dynamic `sessionMode` (already supported, just needs to be wired)

### File 3: `BoardroomSynthesisView.tsx` — Major Enhancement
- Replace hardcoded `ADVISOR_STANCES` with data from `getAdvisorRoster()` for each domain
- Show each advisor's emoji, full role, and specialty from topology
- Filter advisors by scope (business advisors when scope=business, all when global)
- Add an **"Open Advisor Board"** button that toggles a `DomainAdvisorBoard` panel inline — this gives access to all 5 interaction modes (Roundtable, Ask One, Debate, Synthesis, Evidence) directly inside the Boardroom
- Each advisor stance card becomes clickable — clicking opens that advisor's "Ask One" deep-focus view with their full specialty and role description
- Add advisor "voice" — each advisor card shows a mini speech bubble with their current stance, styled as if they're speaking at the table

### File 4: `BoardroomExecutiveView.tsx`
- Add a compact "Advisor Voices" strip below the recommended motion showing the top 3 advisors' stances with emoji and speaking indicators
- Each voice is clickable to navigate to Synthesis view

### File 5: `BoardroomPulseView.tsx`
- Enhance advisor stance cards to show emoji and role from topology
- Make advisor cards clickable to navigate to Synthesis

### File 6: `BoardroomApprovalView.tsx`
- Add "Advisor Recommendation" to each approval card showing which advisor suggested the action and their confidence

## Files

| File | Change |
|------|--------|
| `BoardroomAppShell.tsx` | Derive + pass sessionMode from activeModule |
| `BoardroomSynthesisView.tsx` | Use real advisor topology, scope filter, embed DomainAdvisorBoard, interactive advisor cards with voice bubbles |
| `BoardroomExecutiveView.tsx` | Add compact advisor voices strip below motion |
| `BoardroomPulseView.tsx` | Enhance advisor cards with emoji + clickable navigation |
| `BoardroomApprovalView.tsx` | Add advisor recommendation to approval cards |

5 files modified. No new files. No database changes.

