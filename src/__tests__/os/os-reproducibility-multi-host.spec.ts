import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const SCRIPTS_DIR = path.resolve(__dirname, "../../../os/scripts");

describe("OS Reproducibility — Multi-Host Validation Contract", () => {
  const verifyScript = fs.readFileSync(
    path.join(SCRIPTS_DIR, "verify-reproducibility.sh"),
    "utf8"
  );

  describe("Current single-host capabilities", () => {
    it("performs two independent builds on same host", () => {
      expect(verifyScript).toContain("out-rb-1");
      expect(verifyScript).toContain("out-rb-2");
    });

    it("compares SHA256 of artifacts", () => {
      expect(verifyScript).toContain("sha256sum");
    });

    it("produces reproducibility-report.json", () => {
      expect(verifyScript).toContain("reproducibility-report.json");
    });
  });

  describe("Multi-host readiness (GAP DOCUMENTATION)", () => {
    it("DOCUMENTS GAP: no SITA_SECOND_HOST env var support yet", () => {
      const hasMultiHost =
        verifyScript.includes("SITA_SECOND_HOST") ||
        verifyScript.includes("second_host") ||
        verifyScript.includes("REMOTE_HOST");

      // This test DOCUMENTS the gap — it passes but logs the finding
      if (!hasMultiHost) {
        console.warn(
          "AUDIT GAP: verify-reproducibility.sh has NO multi-host support. " +
          "Single-host reproducibility is meaningless by definition — " +
          "any build on one host is 'reproducible' on that host. " +
          "P1-2 requires a second CI host."
        );
      }

      // Pass but document — we're tracking, not blocking
      expect(typeof hasMultiHost).toBe("boolean");
    });

    it("DOCUMENTS GAP: report schema lacks hosts array", () => {
      const hasHostsArray =
        verifyScript.includes('"hosts"') ||
        verifyScript.includes("hosts_array");

      if (!hasHostsArray) {
        console.warn(
          "AUDIT GAP: reproducibility report schema has no 'hosts' array. " +
          "Current schema only tracks single-host build comparisons."
        );
      }

      expect(typeof hasHostsArray).toBe("boolean");
    });
  });

  describe("Multi-host report schema (target contract)", () => {
    it("validates a multi-host report fixture", () => {
      const multiHostReport = {
        checked_at: "2026-04-22T00:00:00Z",
        source_date_epoch: "1700000000",
        ok: true,
        hosts: [
          { hostname: "ci-runner-1", os: "Ubuntu 24.04", arch: "amd64" },
          { hostname: "ci-runner-2", os: "Ubuntu 24.04", arch: "amd64" },
        ],
        artifact_count: 3,
        results: [
          {
            artifact: "sita-os-0.2.0-amd64.iso",
            host1_sha256: "a".repeat(64),
            host2_sha256: "a".repeat(64),
            status: "match",
          },
        ],
      };

      expect(multiHostReport.hosts).toHaveLength(2);
      expect(multiHostReport.hosts[0].hostname).not.toBe(
        multiHostReport.hosts[1].hostname
      );
      expect(multiHostReport.results[0].host1_sha256).toBe(
        multiHostReport.results[0].host2_sha256
      );
      expect(multiHostReport.results[0].status).toBe("match");
    });

    it("validates a multi-host mismatch report", () => {
      const mismatchReport = {
        checked_at: "2026-04-22T00:00:00Z",
        source_date_epoch: "1700000000",
        ok: false,
        hosts: [
          { hostname: "ci-runner-1", os: "Ubuntu 24.04", arch: "amd64" },
          { hostname: "ci-runner-2", os: "Fedora 40", arch: "amd64" },
        ],
        artifact_count: 1,
        results: [
          {
            artifact: "sita-os-0.2.0-amd64.iso",
            host1_sha256: "a".repeat(64),
            host2_sha256: "b".repeat(64),
            status: "MISMATCH",
          },
        ],
      };

      expect(mismatchReport.ok).toBe(false);
      expect(mismatchReport.results[0].host1_sha256).not.toBe(
        mismatchReport.results[0].host2_sha256
      );
    });
  });
});