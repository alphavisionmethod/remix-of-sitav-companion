import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const PAGES_DIR = "src/pages";
const DATA_HOOKS = ["useQuery", "useMutation", "useSuspenseQuery", "supabase.from", "supabase.rpc"];
const STATE_PATTERNS = [
  "isLoading", "loading", "isPending", "isFetching",
  "Skeleton", "PageSkeleton", "Loader", "spinner", "animate-pulse", "animate-spin",
  "error", "isError", "Error", "ErrorBoundary",
  "empty", "EmptyState", "SitaEmptyState", "No ", "no items", "nothing",
];

function getAllPages(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllPages(full));
    else if (entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) results.push(full);
  }
  return results;
}

describe("Page State Grammar Coverage", () => {
  const pages = getAllPages(PAGES_DIR);

  it("pages with data hooks include loading or error handling", () => {
    const dataPages: string[] = [];
    const violations: string[] = [];
    for (const p of pages) {
      const code = fs.readFileSync(p, "utf8");
      const usesData = DATA_HOOKS.some(h => code.includes(h));
      if (!usesData) continue;
      dataPages.push(p);
      const hasState = STATE_PATTERNS.some(s => code.includes(s));
      if (!hasState) violations.push(path.relative(PAGES_DIR, p));
    }
    // Allow up to 10% violation rate for pages using data hooks
    const rate = dataPages.length > 0 ? violations.length / dataPages.length : 0;
    expect(rate).toBeLessThan(0.10);
  });
});