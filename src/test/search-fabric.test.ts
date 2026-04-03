import { describe, it, expect } from "vitest";
import { SearchFabricService, type IndexableItem } from "@/lib/core-services/search-fabric";

describe("Search Fabric Service", () => {
  const mockItems: IndexableItem[] = [
    { id: "1", type: "document", domain: "business", title: "Service Agreement", body: "Contract with NDA clause", tags: ["contract"], timestamp: Date.now(), metadata: {}, linkedEntities: ["Apex Corp"], sensitivity: "confidential", actionUrl: "/files" },
    { id: "2", type: "invoice", domain: "business", title: "Invoice #1038", body: "Design services invoice $4,200", tags: ["invoice", "design"], timestamp: Date.now(), metadata: { value: 4200 }, linkedEntities: ["Marcus"], sensitivity: "internal", actionUrl: "/money" },
    { id: "3", type: "task", domain: "concierge", title: "School Enrollment", body: "Complete enrollment form by April 15", tags: ["school", "deadline"], timestamp: Date.now(), metadata: {}, linkedEntities: ["Family"], sensitivity: "internal", actionUrl: "/concierge" },
  ];

  it("searches and returns ranked results", () => {
    const service = new SearchFabricService();
    service.addBatch(mockItems);
    const response = service.search({ query: "contract" });
    expect(response.results.length).toBeGreaterThan(0);
  });

  it("filters by domain", () => {
    const service = new SearchFabricService();
    service.addBatch(mockItems);
    const response = service.search({ query: "", domains: ["concierge"] });
    expect(response.results.every(r => r.domain === "concierge")).toBe(true);
  });

  it("returns facets", () => {
    const service = new SearchFabricService();
    service.addBatch(mockItems);
    const response = service.search({ query: "" });
    expect(response.facets).toBeDefined();
    expect(response.facets.totalResults).toBe(3);
  });
});
