

# SITA OS — Revenue-Generating App Upgrade

## Problem

The 4 newest business apps (Website Builder, Proposals & Contracts, Lead Recovery, Social Command) are static shells — ~100 lines each with hardcoded demo data, no interactivity, no revenue tracking, and no advisor automation. Compare this to mature pages like Collections Command Center (415 lines) or Revenue Autopilot (232 lines) which have KPI engines, advisor cards, action buttons, approval workflows, and real data hooks.

Every app in SITA OS should actively help the user make money — with revenue attribution, AI advisor suggestions, one-tap actions, and cross-domain intelligence.

## What Changes

### 1. Website Builder — Full Revenue Attribution Engine
**Current**: 99 lines, 3 static sites, 4 templates, basic stats.
**Upgrade to**:
- **Revenue attribution per page** — show how many leads each landing page captured and their dollar value from CRM
- **A/B test tracking** — variant performance with conversion rates
- **AI copy advisor** — InAppAdvisorStrip suggestions like "Your CTA has 2.1% conversion — try this variant for 4x"
- **SEO health scores** per page with keyword rankings
- **Heatmap summary cards** — click zones, scroll depth, bounce rate
- **Lead capture form builder** with field preview and thank-you page editor
- **Quick actions**: Publish, Duplicate, A/B Test, View Analytics, Edit SEO
- **Revenue KPI row**: Total leads captured, conversion rate, revenue attributed, cost per lead

### 2. Proposals & Contracts — Deal Closing Machine
**Current**: 84 lines, 4 static proposals, basic status badges.
**Upgrade to**:
- **Proposal engagement timeline** — when client opened, which sections they read, time spent per section
- **Smart follow-up advisor** — "Sarah viewed pricing 3x but hasn't signed — suggest a 5% discount?" with one-tap execution
- **Template library** with industry-specific proposals (consulting, agency, SaaS, freelance)
- **E-signature workflow** — signature slots, countersign status, legally binding timestamp
- **Clause library** — payment terms, scope, SLA, termination, IP assignment with drag-drop
- **Revenue pipeline integration** — proposals feed directly into revenue forecast
- **Expiration alerts** with auto-extend or re-send actions
- **Win/loss analysis** — why proposals were accepted vs rejected, advisor-generated insights

### 3. Lead Recovery — Automated Revenue Rescue
**Current**: 102 lines, 4 campaigns, 3 cold leads, basic play/pause.
**Upgrade to**:
- **AI-powered re-engagement scoring** — which cold leads have the highest recovery probability
- **Multi-channel sequence builder** — email + SMS + call + LinkedIn touch in a visual timeline
- **Revenue recovered dashboard** — actual dollars brought back with before/after comparison
- **Trigger-based automation** — "If lead opens email but doesn't reply within 48h, escalate to phone"
- **Personalized message previews** — AI generates the actual email/SMS text based on lead history
- **Advisor automation panel** — toggle auto-pilot per campaign (Watch/Suggest/Execute with approval gates)
- **Integration with CRM** — recovered leads auto-update in Leads Inbox with a "Recovered" badge
- **ROI calculator** — cost of campaign vs revenue recovered per sequence

### 4. Social Command — Content-to-Revenue Pipeline
**Current**: 100 lines, 4 platforms, 4 scheduled posts, engagement stats.
**Upgrade to**:
- **Content-to-lead attribution** — which posts generated profile visits → website clicks → leads → revenue
- **AI content generator** — generate post drafts from blog posts, proposals, case studies
- **Best time to post** optimizer with engagement prediction per platform
- **Competitor monitoring cards** — track competitor posting frequency and engagement
- **Hashtag performance analyzer** — which tags drive most reach and engagement
- **Content calendar** with drag-drop scheduling and visual week/month views
- **Comment management inbox** — reply to comments across all platforms from one place
- **Revenue attribution row** — posts → clicks → leads → deals closed, with dollar values

### 5. Cross-App Revenue Intelligence (shared upgrade)
Add to ALL 4 apps plus existing Business Overview:
- **Revenue Impact Badge** on every card/row showing the dollar impact of that item
- **Advisor LiveCard** with domain-specific suggestions (already exists in mature pages, missing from new ones)
- **Quick Action Toolbar** — contextual actions that change based on item status
- **Proof Receipt integration** — every action generates a visible proof receipt
- **Cross-app links** — "This lead came from your Landing Page → was nurtured by Lead Recovery → proposal sent via Proposals"

### 6. Business Center Tab Integration
Add the 4 new apps as proper tabs in BusinessCenter.tsx with sub-routes already wired (they exist but aren't in the tab bar).

## Files Changed

| File | Change |
|------|--------|
| `src/pages/business/WebsiteBuilder.tsx` | Full rewrite: ~300 lines, revenue attribution, A/B testing, SEO scores, form builder, AI advisor |
| `src/pages/business/ProposalsContracts.tsx` | Full rewrite: ~350 lines, engagement timeline, smart follow-ups, templates, e-sign workflow, clause library |
| `src/pages/business/LeadRecovery.tsx` | Full rewrite: ~320 lines, AI re-engagement scoring, sequence builder, revenue recovered dashboard, triggers |
| `src/pages/business/SocialCommand.tsx` | Full rewrite: ~300 lines, content attribution, AI generator, best-time optimizer, content calendar, comment inbox |
| `src/pages/BusinessCenter.tsx` | Add Website Builder, Proposals, Lead Recovery, Social Command tabs |

## Outcome
Every app becomes a revenue engine — not just a viewer. Users see exactly how each tool makes them money, get AI advisor suggestions to increase conversion, and can take action with one tap. The entire business suite becomes a closed-loop system: capture leads (Website Builder) → nurture cold leads (Lead Recovery) → close deals (Proposals) → promote success stories (Social Command) → track revenue across all of them.

