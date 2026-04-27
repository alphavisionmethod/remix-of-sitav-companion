// Shared assertion helpers for Concierge page-state honesty tests.
// Every page MUST surface at least ONE of:
//   • an explicit empty/setup PremiumEmptyState / EmptyState / ConciergeEmptyState
//   • a SectionSkeleton / animate-pulse loader
//   • the canonical PageTruthBanner
//   • a recognizable header/title that proves the page mounted
// without throwing.
import { screen } from "@testing-library/react";
import { expect } from "vitest";

/**
 * Asserts the page rendered an honest state signal (heading, empty,
 * skeleton, or truth banner). Uses container scan because some
 * pages render skeletons via class names (animate-pulse) instead of
 * accessible roles.
 */
export function expectHonestStateSignal(container: HTMLElement, headingText: string | RegExp) {
  // 1) Heading or title: the page mounted at all
  const heading = screen.queryByText(headingText);

  // 2) Empty/loading grammar markers
  const html = container.innerHTML;
  const hasEmptyOrLoading =
    /animate-pulse|SectionSkeleton|PremiumEmptyState|EmptyState|truthState=|PageTruthBanner|No\s+\w+|Sign in|Set up|Connect|Add a|Add your|Create/i.test(html);

  expect(
    !!heading || hasEmptyOrLoading,
    `Page must render heading "${headingText}" or an empty/loading grammar marker.`,
  ).toBe(true);
}
