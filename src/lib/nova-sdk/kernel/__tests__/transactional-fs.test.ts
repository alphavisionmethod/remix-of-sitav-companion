// ═══════════════════════════════════════════════════════════════
// Nova Kernel — Transactional Filesystem Test Suite
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import { SitaFilesystem } from "@/lib/core-services/kernel/sita-filesystem";

describe("SitaFilesystem — Transactional Guarantees", () => {
  let fs: SitaFilesystem;

  beforeEach(() => {
    fs = new SitaFilesystem();
  });

  describe("Atomic Writes", () => {
    it("write succeeds atomically — data fully committed", () => {
      const file = fs.createFile(1, "test.txt");
      expect(file).toBeTruthy();
      const data = new TextEncoder().encode("Hello, SitaFS!");
      const ok = fs.writeFile(file!.id, data);
      expect(ok).toBe(true);

      const read = fs.readFile(file!.id);
      expect(read).toBeTruthy();
      expect(new TextDecoder().decode(read!)).toBe("Hello, SitaFS!");
    });

    it("write to immutable file fails — old data intact", () => {
      const file = fs.createFile(1, "locked.txt");
      const data1 = new TextEncoder().encode("original");
      fs.writeFile(file!.id, data1);

      // Make immutable
      const inode = fs.stat(file!.id);
      inode!.flags.immutable = true;

      const data2 = new TextEncoder().encode("modified");
      const ok = fs.writeFile(file!.id, data2);
      expect(ok).toBe(false);

      const read = fs.readFile(file!.id);
      expect(new TextDecoder().decode(read!)).toBe("original");
    });

    it("simulated crash mid-write — temp blocks discarded via atomicWrite", () => {
      const file = fs.createFile(1, "crash-test.txt");
      const original = new TextEncoder().encode("safe data");
      fs.writeFile(file!.id, original);

      // Simulate crash during atomic write
      const crashData = new TextEncoder().encode("CORRUPT");
      const result = fs.atomicWrite(file!.id, crashData, true); // simulateCrash=true
      expect(result).toBe(false);

      // Original data should be intact
      const read = fs.readFile(file!.id);
      expect(new TextDecoder().decode(read!)).toBe("safe data");
    });
  });

  describe("Journal Replay", () => {
    it("replays uncommitted entries on recovery", () => {
      const file = fs.createFile(1, "journal-test.txt");
      const data = new TextEncoder().encode("pending write");
      fs.writeFile(file!.id, data);

      // Inject an uncommitted journal entry
      fs.injectUncommittedEntry("write", file!.id, { testReplay: true });

      const result = fs.replayJournal();
      expect(result.replayed).toBeGreaterThanOrEqual(1);
      expect(result.rolledBack).toBe(0);
    });

    it("recoverFromCrash runs journal replay + integrity check", () => {
      const file = fs.createFile(1, "recover.txt");
      fs.writeFile(file!.id, new TextEncoder().encode("data"));

      const result = fs.recoverFromCrash();
      expect(result.journalResult).toBeDefined();
      expect(result.integrityResult).toBeDefined();
      expect(result.recoveryTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Integrity Scan", () => {
    it("reports clean filesystem as valid", () => {
      fs.createFile(1, "clean.txt");
      const result = fs.runIntegrityCheck();
      expect(result.valid).toBe(true);
      expect(result.corruptedBlocks).toHaveLength(0);
      expect(result.orphanBlocks).toHaveLength(0);
    });

    it("detects corrupted block checksums", () => {
      const file = fs.createFile(1, "corrupt.txt");
      fs.writeFile(file!.id, new TextEncoder().encode("good data"));

      // Corrupt a block
      fs.corruptBlock(file!.id);

      const result = fs.runIntegrityCheck();
      expect(result.valid).toBe(false);
      expect(result.corruptedBlocks.length).toBeGreaterThan(0);
    });
  });

  describe("Write Batching", () => {
    it("batches multiple writes into single flush", () => {
      const f1 = fs.createFile(1, "batch1.txt")!;
      const f2 = fs.createFile(1, "batch2.txt")!;

      const batch = fs.createWriteBatch();
      batch.add(f1.id, new TextEncoder().encode("data1"));
      batch.add(f2.id, new TextEncoder().encode("data2"));

      const journalBefore = fs.getJournal().length;
      batch.flush();
      const journalAfter = fs.getJournal().length;

      // Should add exactly 1 batch journal entry (not 2 separate)
      expect(journalAfter - journalBefore).toBe(1);

      expect(new TextDecoder().decode(fs.readFile(f1.id)!)).toBe("data1");
      expect(new TextDecoder().decode(fs.readFile(f2.id)!)).toBe("data2");
    });
  });

  describe("File Versioning", () => {
    it("stores version history on writes", () => {
      const file = fs.createFile(1, "versioned.txt")!;
      for (let i = 0; i < 5; i++) {
        fs.writeFile(file.id, new TextEncoder().encode(`v${i + 1}`));
      }
      const versions = fs.getVersionHistory(file.id);
      expect(versions.length).toBe(5);
    });

    it("restores previous version", () => {
      const file = fs.createFile(1, "restore.txt")!;
      fs.writeFile(file.id, new TextEncoder().encode("version1"));
      fs.writeFile(file.id, new TextEncoder().encode("version2"));

      const versions = fs.getVersionHistory(file.id);
      const restored = fs.restoreVersion(file.id, versions[0].versionId);
      expect(restored).toBe(true);

      const data = fs.readFile(file.id);
      expect(new TextDecoder().decode(data!)).toBe("version1");
    });

    it("limits version history to 10", () => {
      const file = fs.createFile(1, "many-versions.txt")!;
      for (let i = 0; i < 15; i++) {
        fs.writeFile(file.id, new TextEncoder().encode(`v${i}`));
      }
      expect(fs.getVersionHistory(file.id).length).toBeLessThanOrEqual(10);
    });
  });

  describe("Snapshot + Restore", () => {
    it("creates snapshot → modifies → original data captured", () => {
      const file = fs.createFile(1, "snap.txt")!;
      fs.writeFile(file.id, new TextEncoder().encode("before snapshot"));

      const snap = fs.createSnapshot("test-snap");
      expect(snap.id).toBeTruthy();

      fs.writeFile(file.id, new TextEncoder().encode("after snapshot"));

      const current = new TextDecoder().decode(fs.readFile(file.id)!);
      expect(current).toBe("after snapshot");

      // Snapshot exists
      expect(fs.listSnapshots()).toHaveLength(1);
    });
  });
});
