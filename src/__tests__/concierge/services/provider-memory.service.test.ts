import { describe, it, expect } from "vitest";
import {
  findProvider,
  getFavorites,
  suggestProvider,
} from "@/lib/services/concierge-os/provider-memory.service";
import { makeProvider } from "@/__tests__/concierge/_helpers/concierge-fixtures";

describe("provider-memory.service", () => {
  it("findProvider filters by category and sorts by rating descending", () => {
    const out = findProvider(
      [
        makeProvider({ id: "lo", rating: 3.0, category: "plumber" }),
        makeProvider({ id: "hi", rating: 4.8, category: "plumber" }),
        makeProvider({ id: "other", rating: 5.0, category: "vet" }),
      ],
      "plumber",
    );
    expect(out.map((p) => p.id)).toEqual(["hi", "lo"]);
  });

  it("getFavorites returns only favorites sorted by rating", () => {
    const out = getFavorites([
      makeProvider({ id: "a", isFavorite: true, rating: 3 }),
      makeProvider({ id: "b", isFavorite: false, rating: 5 }),
      makeProvider({ id: "c", isFavorite: true, rating: 4 }),
    ]);
    expect(out.map((p) => p.id)).toEqual(["c", "a"]);
  });

  it("suggestProvider prefers a favorite over a higher-rated non-favorite", () => {
    const pick = suggestProvider(
      [
        makeProvider({ id: "fav-low", category: "plumber", rating: 4.0, isFavorite: true }),
        makeProvider({ id: "nonfav-hi", category: "plumber", rating: 4.9, isFavorite: false }),
      ],
      "plumber",
    );
    expect(pick?.id).toBe("fav-low");
  });

  it("suggestProvider returns null when no provider matches", () => {
    expect(suggestProvider([], "plumber")).toBeNull();
  });
});