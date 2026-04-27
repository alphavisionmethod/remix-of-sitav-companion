// Shared assertion helpers for Concierge page-state honesty tests.
// Every page MUST surface at least ONE of:
//   • an explicit empty/setup PremiumEmptyState / EmptyState / ConciergeEmptyState
//   • a SectionSkeleton / animate-pulse loader
//   • the canonical PageTruthBanner
//   • a recognizable header/title that proves the page mounted
// without throwing.
import { expect } from "vitest";

/**
 * Asserts the page rendered an honest state signal: a recognizable
 * heading/title, an empty/setup grammar marker, or a skeleton. We
 * scan the rendered HTML directly because (a) many pages duplicate
 * the heading text in tabs/breadcrumbs/labels (queryByText would
 * throw on multiples) and (b) skeletons are class-based, not
 * role-based.
 */
export function expectHonestStateSignal(container: HTMLElement, headingText: string | RegExp) {
  const html = container.innerHTML;
  const re = headingText instanceof RegExp ? headingText : new RegExp(String(headingText), "i");
  const headingMatched = re.test(html.replace(/<[^>]+>/g, " "));
  const hasEmptyOrLoading =
    /animate-pulse|SectionSkeleton|PremiumEmptyState|EmptyState|truthState=|PageTruthBanner|No\s+\w+|Sign in|Set up|Connect|Add a|Add your|Create/i.test(html);

  expect(
    headingMatched || hasEmptyOrLoading,
    `Page must render heading matching ${re} or an empty/loading grammar marker.`,
  ).toBe(true);
}
