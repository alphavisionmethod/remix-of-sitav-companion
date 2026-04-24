
# Human-User Production-Proof Closure — Real Gaps Only

## Inventory of existing strong coverage (KEEP — DO NOT DUPLICATE)

`tests/e2e/` already has a deep, real-user verification layer. After full inventory, the following are already proven and will be **left untouched**:

| Area | Existing proof | Status |
|---|---|---|
| Sign in (form + flow + reload persistence) | `customer-journey/auth/sign-in-primary.spec.ts` | KEEP |
| Sign out + protected-route block after | `customer-journey/auth/sign-out-primary.spec.ts` | KEEP |
| First-boot + setup continuation | `customer-journey/auth/{first-boot,setup-continuation}.spec.ts` | KEEP |
| Dashboard load + sidebar clickable | `customer-journey/dashboard/dashboard-load-primary.spec.ts` | KEEP |
| Stale-leads dashboard | `customer-journey/dashboard/stale-leads.spec.ts` | KEEP |
| Assistant/advisor chat input + degraded fallback | `customer-journey/assistant/assistant-chat-primary.spec.ts` | KEEP |
| Boardroom approve outbound + review proof + mobile | `customer-journey/boardroom/*.spec.ts` | KEEP |
| Connectors connect-CRM + OAuth + sync | `customer-journey/connectors/*.spec.ts` | KEEP |
| Files real upload round-trip | `customer-journey/files/files-upload-real-roundtrip.spec.ts` | KEEP |
| Settings restore + account open | `customer-journey/settings/*.spec.ts` | KEEP |
| Demo-vs-real for assistant/boardroom/connectors | `customer-journey/demo-vs-real/*.spec.ts` | KEEP |
| Degraded mode (assistant provider, connectors) | `customer-journey/degraded/*.spec.ts` | KEEP |
| Admin envelope (AI team, env recovery, owner intervention, runtime/launch truth, workflow replay) | `customer-journey/admin/*.spec.ts` | KEEP |
| Full-route deep navigation across 9 domains | `tests/e2e/full-journey.spec.ts` | KEEP |
| Permission gating + unauth redirect to login | `auth-journeys.spec.ts`, `full-journey.spec.ts` | KEEP |
| Approvals, advisor action execution, advisor portrait, accessibility, route health, page content, edge contracts, push notifications, mobile responsive, visual regression, error states, recovery | top-level specs in `tests/e2e/` | KEEP |

**Conclusion**: existing coverage is strong and must not be re-implemented. Only true gaps remain.

---

## Real gaps identified (the only things to add)

### Gap A — Personal Brain v2 surfaces have ZERO human-journey coverage
We just shipped:
- 11-step calibration onboarding (`PersonalBrainOnboarding`)
- 11-section settings hub with sticky sidebar (`/personal-brain/settings/{profile,memory,modes,workspaces,files,notifications,labs,security,data,voice-settings}`)
- Brain Command Center (`/personal-brain/command-center`) with Brain Snapshot, Learning Momentum, Insights Feed
- "Scan now" parallel-scan flow + post-scan refresh
- Insights Feed refresh button + IntersectionObserver infinite scroll

None of these have an E2E spec. They are the highest-value missing journeys.

### Gap B — Auxiliary auth surfaces (signup, forgot-password, reset-password)
The existing `auth.spec.ts` only checks **render**. There is no journey proof that:
- the signup form submits and shows the "check your email" confirmation state
- forgot-password submit shows the "email sent" confirmation
- reset-password page enforces validation (length, mismatch) and shows the success state

### Gap C — Public download page user journey
`/download` and `/downloads` (DownloadsCenter, marketing/Download) currently only have a "renders" check in `full-journey.spec.ts`. There is no proof that:
- the page exposes the documented install/VMware guidance
- gated artifacts are not shown publicly without an access path
- the primary "Get SITA OS" CTA either leads somewhere or honestly represents its state

### Gap D — Honest-state "no broken Brain" smoke
A shipped feature should not crash unauth users who land on its routes.

---

## Plan: add 4 new spec files + 1 helper, run, fix, report

### New file 1 — `tests/e2e/customer-journey/personal-brain/calibration-flow.spec.ts`
Real-user journey through the 11-step ceremony. Covers:
1. Authenticated user opens `/personal-brain` for the first time → sees calibration shell with step 0 ("Let's shape your Brain") + visible progress indicator.
2. Clicks "Begin" → step 1 (Identity) → fills name + role → "Continue" gates correctly when name empty (negative case) and unlocks when filled.
3. Walks through Use cases → Cognition → Privacy steps using the `OnboardingChoiceCard` selectors.
4. "Save & exit" link is visible from step 2+ (resume contract).
5. On the final summary step, the recap text reflects choices made earlier (real persistence proof, not just navigation).
6. Clicking "Enter your Brain" lands on `/personal-brain` dashboard with `onboarded_at` reflected (no longer shows the calibration intro).

Skipped honestly with `test.skip(!hasTestCredentials())` if no test user.

### New file 2 — `tests/e2e/customer-journey/personal-brain/settings-hub.spec.ts`
Real-user proof for the 11-section Settings Hub:
1. Authenticated user navigates to `/personal-brain/settings` → Overview renders live tiles (personalization depth, memory count, voice on/off, security level).
2. Sticky `SettingsSidebarNav` is visible and contains all 11 sections.
3. Click each section in turn (Profile, Memory, Modes, Workspaces, Files, Notifications, Voice, Security, Data, Labs) → assert the URL changes to the section route AND the page renders meaningful content (>50 chars) AND no fatal error.
4. **Save proof**: on Notifications, toggle one switch → click Save → reload → assert toggle state persisted (writes to `pb_notification_prefs`).
5. **Save proof**: on Profile, change `tone` → Save → reload → assert persisted.
6. Empty-state honesty: on Files (if no files) the empty state shows an explanation, not a blank panel.

### New file 3 — `tests/e2e/customer-journey/personal-brain/command-center.spec.ts`
Real-user proof for the dashboard Command Center:
1. Navigate to `/personal-brain/command-center` → Brain Snapshot, Learning Momentum bar chart, Insights Feed, Active Goals all render.
2. Click "Scan now" → button enters loading state → loading toast visible → after settle, Brain Snapshot/Insights Feed re-fetch (network call observable; the button returns to idle and a success toast appears).
3. Insights Feed: click the refresh icon-button → spinning state visible → settles.
4. Insights Feed infinite scroll: scroll the list to the bottom; if `hasMore`, sentinel triggers `loadMore` (next page appears or "Load more" CTA falls back); if no more, "You're all caught up" terminal text is visible.
5. Insight pin/dismiss: pick a signal → click dismiss → row disappears from the list (optimistic UI proof).

### New file 4 — `tests/e2e/auth-auxiliary-flows.spec.ts`
Closes Gap B + Gap C without duplicating existing render checks:
- **Signup submit flow**: goto `/signup` → fill random-burner email + password (or skip if no `TEST_SIGNUP_EMAIL` env) → submit → expect either the "check your email" confirmation panel OR a Sonner error toast. (Honest dual-path: works in projects with signups enabled, honestly skipped where disabled.)
- **Signup validation**: short password (<6) → expect inline error toast, no navigation.
- **Forgot-password flow**: goto `/forgot-password` → fill any email → submit → expect a confirmation state (text contains "sent" / "check") OR honest error.
- **Reset-password validation**: goto `/reset-password` → submit with password mismatch → expect error toast → submit with too-short password → expect error toast. (We do not exercise the recovery token path because it requires a real email link.)
- **Download page honesty**: goto `/download` → page renders → primary CTA (`Get SITA OS` / `Download`) is visible OR an honest "coming soon / request access" state is shown. Assert no broken artifact link (no `href="#"` on the primary CTA).

### New helper — `tests/e2e/helpers/personal-brain.ts`
Tiny helpers used by the three Brain specs:
- `gotoBrainRoute(page, path)` — login + navigate, with idle wait
- `assertBrainShellLoaded(page)` — checks for the shared `BrainHero` test-id or fallback heading
- `clickBrainNavSection(page, label)` — clicks a section in the settings sidebar

Adds `data-testid` attributes to a small number of Brain components where selectors don't already exist (read-only inspection shows these are missing). The additions are **non-functional** (no behavior change), purely test hooks:
- `data-testid="brain-onboarding-shell"` on the `OnboardingShell` root
- `data-testid="brain-onboarding-progress"` on the progress bar
- `data-testid="brain-onboarding-continue"` on the primary footer button
- `data-testid="brain-settings-sidebar"` on `SettingsSidebarNav` root
- `data-testid="brain-command-scan-now"` on the Scan-now button
- `data-testid="brain-insights-refresh"` on the refresh button
- `data-testid="brain-insights-list"` and `="brain-insights-sentinel"` on the feed
- `data-testid="brain-insight-row"` per row, plus `="brain-insight-dismiss"` per row

---

## Run & fix loop
1. `npx playwright test --project=customer-journey --grep "personal-brain|auth-auxiliary"` (and `tests/e2e/auth-auxiliary-flows.spec.ts` for the auxiliary spec).
2. Triage: any failure that is a real product bug (crash, dead CTA, broken save, fatal console error) gets fixed at the source. Any failure that's selector noise gets a stronger selector (not a weakened assertion).
3. Re-run until stable, capturing journey-reporter output.

## Report — `HUMAN_USER_PRODUCTION_PROOF_REPORT.md` (new, at repo root)
Structured per the requested 6-part format:
1. Existing coverage reused (the "KEEP" table above, condensed).
2. New human-user verification added (the 4 specs + helper, with the journey IDs each adds).
3. Failures found and fixed (root causes only — no test-weakening).
4. Newly proven user journeys (explicit list of `[journey:*]` tags).
5. Remaining blocked / deferred (e.g. real reset-password recovery-token requires email; signup confirmation requires real inbox; install-artifact download requires authorized binary — represented honestly).
6. Final readiness truth: clear statement of what is now proven from a real user perspective vs. what is still externally blocked.

---

## Files added
- `tests/e2e/customer-journey/personal-brain/calibration-flow.spec.ts`
- `tests/e2e/customer-journey/personal-brain/settings-hub.spec.ts`
- `tests/e2e/customer-journey/personal-brain/command-center.spec.ts`
- `tests/e2e/auth-auxiliary-flows.spec.ts`
- `tests/e2e/helpers/personal-brain.ts`
- `HUMAN_USER_PRODUCTION_PROOF_REPORT.md`

## Files edited (test-id hooks only — zero behavior change)
- `src/components/personal-brain/onboarding/PersonalBrainOnboarding.tsx`
- `src/components/personal-brain/onboarding/OnboardingShell.tsx` (if it lacks an outer test-id)
- `src/components/personal-brain/settings/SettingsSidebarNav.tsx`
- `src/pages/personal-brain/BrainCommandCenter.tsx`

## Out of scope (explicitly)
- Re-implementing already-strong journeys listed in the KEEP table.
- Real recovery-token or magic-link flows that require an actual mailbox.
- Real billable AI calls inside Brain scan (we assert UI behavior + network observability, not provider responses).
- Visual-regression snapshots for the new Brain surfaces (existing `visual-regression.spec.ts` covers the global system; Brain visuals can be added later if requested).

