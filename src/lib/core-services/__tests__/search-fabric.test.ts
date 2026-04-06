import { describe, it, expect } from "vitest";
import { SearchFabricService } from "../search-fabric";
import type { IndexableItem } from "../search-fabric";

function makeItem(overrides: Partial<IndexableItem> = {}): IndexableItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 6)}`,
    type: "customer",
    domain: "business",
    title: "Acme Corp",
    body: "Enterprise customer in manufacturing sector",
    tags: ["enterprise", "manufacturing"],
    timestamp: Date.now(),
    metadata: {},
    linkedEntities: [],
    sensitivity: "internal",
    ...overrides,
  };
}

describe("SearchFabricService", () => {
  it("adds items to index", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ id: "i1" }));
    expect(svc.getIndexSize()).toBe(1);
  });

  it("updates existing items by id", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ id: "i1", title: "Old" }));
    svc.addToIndex(makeItem({ id: "i1", title: "New" }));
    expect(svc.getIndexSize()).toBe(1);
  });

  it("removes items from index", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ id: "i1" }));
    expect(svc.removeFromIndex("i1")).toBe(true);
    expect(svc.getIndexSize()).toBe(0);
  });

  it("searches by title match", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ title: "Acme Corp", body: "corp data", tags: ["corp"] }));
    svc.addToIndex(makeItem({ title: "Beta Inc", body: "b", tags: [] }));
    const results = svc.search({ query: "acme" });
    expect(results.results).toHaveLength(1);
    expect(results.results[0].title).toBe("Acme Corp");
  });

  it("searches by body content", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ body: "important financial data" }));
    const results = svc.search({ query: "financial" });
    expect(results.results).toHaveLength(1);
  });

  it("filters by domain", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ domain: "business", title: "Biz item" }));
    svc.addToIndex(makeItem({ domain: "finance", title: "Fin item" }));
    const results = svc.search({ query: "item", domains: ["finance"] });
    expect(results.results).toHaveLength(1);
    expect(results.results[0].domain).toBe("finance");
  });

  it("filters by result type", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ type: "customer", title: "A customer" }));
    svc.addToIndex(makeItem({ type: "invoice", title: "An invoice" }));
    const results = svc.search({ query: "a", resultTypes: ["invoice"] });
    expect(results.results).toHaveLength(1);
  });

  it("returns facets", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ domain: "business", title: "Test item" }));
    const results = svc.search({ query: "test" });
    expect(results.facets.byDomain.business).toBe(1);
    expect(results.facets.totalResults).toBe(1);
  });

  it("supports pagination with offset and limit", () => {
    const svc = new SearchFabricService();
    for (let i = 0; i < 5; i++) svc.addToIndex(makeItem({ title: `Test ${i}` }));
    const page1 = svc.search({ query: "test", limit: 2, offset: 0 });
    expect(page1.results).toHaveLength(2);
    expect(page1.hasMore).toBe(true);
  });

  it("returns empty results for no matches", () => {
    const svc = new SearchFabricService();
    svc.addToIndex(makeItem({ title: "Alpha", body: "nothing here", tags: [] }));
    const results = svc.search({ query: "zzzzz" });
    expect(results.results).toHaveLength(0);
  });
});
