
The user wants v3 of the strategy document with five specific additions:

1. **Exact demo code** matching the current SITA design system (read brand tokens, existing `DemoEmbed`, desktop visual system, kernel/widget components — paste real component code as ship-ready snippets, not pseudo-code).
2. **More mind-blowing wow moments** — invent additional category-defining interactions no marketing site has ever shipped.
3. **App approval flow visualization** — how a SITA decision moves from suggestion → approval → execution → receipt, on the marketing site.
4. **Full backend tutorial** for operators: how to manage email list, donator list, beta-tester list, upload web/iOS/Ubuntu app builds, fulfill rewards. Step-by-step admin UI walkthrough + edge function specs + DB schema.
5. **Kickstarter-clone donation page spec** — exact layout, copy, mechanics, tier visuals, comments, updates, FAQ, risks/challenges, project story IA — modeled on Kickstarter campaign anatomy.

Quick exploration needed before drafting (read-only):
- Brand tokens in `src/index.css` + `tailwind.config.ts`
- Existing `DemoEmbed.tsx` (already have it)
- Existing widget/desktop components to mirror in spec
- Existing admin pages structure for the operator tutorial
- Existing edge functions (waitlist, beta, etc.) so the spec stays accurate

## Plan

Generate **`SITA_WEBSITE_DEMO_STRATEGY_v3.pdf`** + `.md` (~50–70 pages, branded). v2 stays as baseline. This is a pure document task — no app changes.

### New / heavily expanded sections in v3

**Part A — Pixel-accurate demo code (NEW, ~12 pages)**
- A.1 Brand tokens registry (HSL exports from `index.css`, font stack, motion specs)
- A.2 `<DemoEmbed/>` v2 — full component code, drop-in ready, matching current desktop look
- A.3 `<HeroOSPreview/>` — ship-ready Three.js-free SVG/HTML preview with widget bezels
- A.4 `<ApprovalFlow/>` — 6-frame animated component (Suggest → Explain → Approve → Execute → Verify → Receipt) with code
- A.5 `<ReceiptTicker/>` — real-time receipt stream component, exact code
- A.6 `<CrowdfundThermometer/>` — code with live Supabase Realtime hook
- A.7 `<TierCard/>`, `<BackerWall/>`, `<StretchStaircase/>` — full code
- A.8 `<MagneticButton/>`, `<CursorSpotlight/>`, `<KonamiConsole/>` — full code
- All snippets: TypeScript, Tailwind, framer-motion, semantic tokens — match current codebase conventions exactly

**Part B — The approval-flow showcase (NEW, ~6 pages)**
- B.1 Why approvals are the wow story (sovereignty made visible)
- B.2 The 6-step canonical flow with exact UI states + microcopy
- B.3 Where it appears: hero, `/demo`, `/proof`, `/trust`, founder letter
- B.4 Receipt anatomy (hash, prev_hash, signature, evidence chain) — visual + code
- B.5 Failure mode display: refusals as positive proof (Negative Receipts)

**Part C — Mind-blowing wow additions never shipped before (NEW, ~6 pages)**
1. **Live "build a receipt" interactive** — visitor picks an action; site mints a real signed receipt for them on the spot, viewable on `/proof`.
2. **Pledge-with-proof** — every backer gets a personalized SVG certificate with their unique kernel hash + position number — shareable as OG card.
3. **The "Sovereign Mirror"** — a one-click scan that shows the visitor how many SaaS tools they likely use vs. how SITA replaces them (uses cookie data they already have).
4. **Whisper mode** — entire site narratable by founder voice (real audio overlay, opt-in, per-section).
5. **"Watch us build" live stream pin** — tiny floating window of the founders' actual coding stream when on.
6. **Constitutional preview** — visitor types a value (e.g. "I never share health data") and SITA shows what governance rule would enforce it.
7. **Concierge sandbox chat** — 30-second live chat with the actual SITA concierge, scoped to demo intents.
8. **Backer-only Easter eggs** — hidden URLs only revealed in pledge confirmation emails.
9. **Proof-of-craft scroll** — as you scroll the home page, a counter shows lines of code, gates green, receipts minted *in real time*.
10. **Time-warp roadmap** — a drag-the-handle timeline showing what SITA looked like 6 months ago vs. today vs. projected 6 months out.

**Part D — Kickstarter-grade `/donate` page (NEW, ~10 pages)**
Full Kickstarter-anatomy clone, adapted:
- D.1 Project header (hero video, by-line, location, category, save/share)
- D.2 Funding bar + days left + backer count + "All-or-nothing" toggle decision
- D.3 Tier rail (sticky right, scroll-snapped) — exact card spec, claimed counters, ship dates
- D.4 Project story tabs: Story · Updates · Comments · Community · FAQ · Risks & Challenges
- D.5 Story long-form structure (problem, solution, demo, team, timeline, budget, why this matters)
- D.6 Updates feed (markdown, attachable to backer-only)
- D.7 Comments with backer-only filter, founder-pinned answers
- D.8 Risks & Challenges (legally important, builds trust)
- D.9 Recommendation engine (related campaigns, in our case: blog posts, demo, beta)
- D.10 Mobile-first sticky pledge bar
- D.11 Post-pledge experience (thank-you page, certificate, share kit, referral leaderboard)
- D.12 Funding model: All-or-nothing vs. Keep-it-all — recommendation + rationale
- D.13 Currency multi-display, FX disclosure
- D.14 Anti-fraud: address verification, velocity checks, backer history

**Part E — Full operator backend tutorial (NEW, ~14 pages)**
For the founder/admin running the show day-to-day:
- E.1 Admin IA map — where every list lives in the existing admin shell
- E.2 **Email list management** — view waitlist, segment by referral source, export CSV, push to newsletter (with edge function + UI mock)
- E.3 **Donator/backer list management** — view pledges, fulfillment status, mark physical perks shipped, issue refunds, message backers (per-tier or all)
- E.4 **Beta-tester list management** — view applications, score column, approve/reject, send beta key, track install
- E.5 **Investor request list** — review requests, approve, mint signed dealroom token (one-click), revoke
- E.6 **Press inquiry list** — assign, status, send press kit
- E.7 **App builds upload tutorial** — exact steps to upload:
  - Web app: it's auto-deployed via Lovable Publish — UI walkthrough
  - PWA: how the manifest + service worker already wire it; how to test "Add to Home Screen"
  - Ubuntu ISO: where build artifact lands (`os/scripts/release.sh`), how to upload to `/download`, signing + checksum disclosure
  - Electron: same pattern
  - iOS: explicit honesty — currently archived per `docs/PLATFORM_SCOPE.md`; what reactivation requires; meanwhile PWA install is the iOS path
  - Android: same as iOS
- E.8 **Download page management** — admin UI to publish a new build version (tag, changelog, file URL, signature) and `/download` reflects it
- E.9 **Crowdfund operations** — open/close campaign, edit tiers, post updates, mark stretch goals unlocked, escrow release flow
- E.10 **Receipt chain operations** — verify a receipt, search by hash, audit log
- E.11 **Analytics dashboards** — where to see funnel + conversion + revenue
- E.12 **Daily/weekly operator runbook** — what to check every morning (5 min), every week (30 min), every month (2 hr)
- E.13 **Required edge functions for operator surfaces** — list with status (built / to-build)
- E.14 **DB schema additions for operator surfaces** — admin views + RLS

**Part F — All v2 sections retained**, lightly polished. v2 → v3 is additive.

**Part G — Implementation order** (post-approval) updated to include the new components.

### Generation approach
1. Read brand tokens + existing `DemoEmbed` (for code accuracy)
2. List `src/components/admin/` and `supabase/functions/` (for operator tutorial accuracy)
3. Write `doc.md` (long, ~50k words) and PDF renderer (reuse v2's, already proven)
4. Build PDF, QA pages 1, cover, mid-doc, table-heavy section, code-heavy section, last page
5. Save both `.md` + `.pdf` to `/mnt/documents/`

### Files
**Created:**
- `/mnt/documents/SITA_WEBSITE_DEMO_STRATEGY_v3.md`
- `/mnt/documents/SITA_WEBSITE_DEMO_STRATEGY_v3.pdf`

**Untouched:** v1 + v2 stay as baselines. Zero code changes to the site. Implementation of the new components is a separate approval after you've reviewed v3.
