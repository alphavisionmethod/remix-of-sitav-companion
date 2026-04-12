import { describe, it, expect, beforeEach } from "vitest";

describe("MemoryManager", () => {
  let MemoryManager: any;

  beforeEach(async () => {
    const mod = await import("../memory-manager");
    MemoryManager = mod.MemoryManager;
  });

  it("exports MemoryManager", () => {
    expect(MemoryManager).toBeDefined();
  });

  it("createAddressSpace returns address space with pid", () => {
    const as = MemoryManager.createAddressSpace(1);
    expect(as.pid).toBe(1);
    expect(as.pageTableRoot).toBeDefined();
    expect(as.mappings).toEqual([]);
  });

  it("switchAddressSpace returns true for valid pid", () => {
    MemoryManager.createAddressSpace(2);
    expect(MemoryManager.switchAddressSpace(2)).toBe(true);
  });

  it("switchAddressSpace returns false for unknown pid", () => {
    expect(MemoryManager.switchAddressSpace(9999)).toBe(false);
  });

  it("addMapping allocates pages", () => {
    MemoryManager.createAddressSpace(3);
    const mapping = MemoryManager.addMapping(3, {
      virtualStart: 0x1000,
      pageCount: 4,
      flags: { readable: true, writable: true, executable: false, guard: false, copyOnWrite: false },
      label: "test",
    });
    expect(mapping).not.toBeNull();
    expect(mapping.pageCount).toBe(4);
  });

  it("getStats returns memory statistics", () => {
    const stats = MemoryManager.getStats();
    expect(stats).toHaveProperty("totalPages");
    expect(stats).toHaveProperty("allocatedPages");
    expect(stats).toHaveProperty("freePages");
    expect(stats).toHaveProperty("guardPages");
  });

  it("destroyAddressSpace cleans up", () => {
    MemoryManager.createAddressSpace(4);
    const result = MemoryManager.destroyAddressSpace(4);
    expect(result).toBe(true);
  });

  it("PAGE_SIZE is 4096", async () => {
    const { PAGE_SIZE } = await import("../memory-manager");
    expect(PAGE_SIZE).toBe(4096);
  });
});
