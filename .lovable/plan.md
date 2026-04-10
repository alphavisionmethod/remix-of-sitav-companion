

# Business Formation Ceremony — Final Polish Plan

## Audit Result

After reading all 20 screens, branching.ts (363 LOC), business-twin.ts (332 LOC), FormationShell, LiveOfficeSidebar, SitaInsightCallout, and all primitives, the system is nearly complete. Here are the 6 genuine gaps remaining:

## Gap 1: ConversionScreen missing "What feels weakest?" section
**Spec requirement (RO-ONB-05):** After pre-buy behavior and close options, ask "What part feels weakest today?" with options: lead capture, follow-up, show-up rate, quote conversion, checkout conversion, nurture, trust/reputation, objection handling.
**Current state:** Only has pre-buy + close toggles. No weakness selector.
**Fix:** Add `conversionWeakness` field to OnboardingState + add weakness toggle section to ConversionScreen + add SitaInsightCallout based on weakness selection.

## Gap 2: RevenueModelScreen missing "What would you like to grow most?"
**Spec requirement (RO-ONB-03):** Ask growth emphasis question with options: leads, conversions, average order value, repeat business, retention, referrals, reviews/reputation.
**Current state:** Has revenue sources + growing/weakest selectors but no growth goal.
**Fix:** Add `growthGoals` field to OnboardingState + add growth goal toggle section to RevenueModelScreen.

## Gap 3: TeamScreen missing granular approval list
**Spec requirement (RO-ONB-08):** Ask specifically what requires approval: discounts, quote sending, campaign launches, automation activation, reputation responses, VIP client actions.
**Current state:** Only has a single "needs approvals" checkbox.
**Fix:** Add `approvalActions` field to OnboardingState + add granular approval toggle grid that appears when `needsApprovals` is checked. Also add a "support" role to the roles list.

## Gap 4: ReconciliationScreen missing action buttons
**Spec requirement (RO-ONB-15):** Show "Looks right", "Adjust this", "Show details", "Continue" action buttons for the intelligence summary.
**Current state:** Just displays data passively with no interactive confirmation.
**Fix:** Add action buttons row with "Looks right" (confirmation badge) and "Adjust this" (link back to relevant screens).

## Gap 5: RevealScreen missing secondary CTAs
**Spec requirement (RO-ONB-19):** Show "Enter Revenue Office" (primary), "Review setup" (secondary), "Continue imports later" (tertiary).
**Current state:** Only has "Enter Your Revenue Office".
**Fix:** Add "Review setup" button (goes back to shape_summary) and "Continue imports later" text link.

## Gap 6: URLIntakeScreen missing specific inference categories
**Spec requirement (RO-ONB-14):** Show what SITA will specifically infer from each URL type (service vs product, booking vs checkout, offer structure, CTA structure, funnel complexity).
**Current state:** Shows generic "SITA will infer" text.
**Fix:** Add per-URL-type inference descriptions that appear when a URL is entered.

## Files Changed

| File | Change |
|------|--------|
| `types.ts` | Add `conversionWeakness: string[]`, `growthGoals: string[]`, `approvalActions: string[]` fields |
| `ConversionScreen.tsx` | Add "What feels weakest?" toggle section + SitaInsightCallout |
| `RevenueModelScreen.tsx` | Add "What would you like to grow most?" toggle section |
| `TeamScreen.tsx` | Add granular approval actions grid + "support" role |
| `ReconciliationScreen.tsx` | Add "Looks right" / "Adjust" confirmation buttons |
| `RevealScreen.tsx` | Add "Review setup" and "Continue imports later" CTAs |
| `URLIntakeScreen.tsx` | Add per-URL inference category descriptions |

Total: ~7 files edited, ~120 net LOC added. No new files needed.

