#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — BLOCK gate #29: Recovery Boot Evidence loop wiring
// Asserts the real-device recovery boot evidence pipeline is wired
// end-to-end: append-only DB table, mutation-blocking triggers, edge
// ingest function, on-device collector, and systemd service wiring.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}
const issues: Issue[] = [];

const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => readFileSync(`${migDir}/${f}`, "utf8"))
      .join("\n")
  : "";

// 1. Table + columns
if (!/create table[^;]*recovery_boot_evidence/i.test(sqlBlob)) {
  issues.push({
    severity: "error",
    area: "schema",
    message: "recovery_boot_evidence table not declared",
  });
} else {
  const required = [
    "device_id",
    "recovery_reason",
    "slot",
    "evidence_hash",
    "signature",
    "collected_at",
  ];
  for (const col of required) {
    if (!new RegExp(`\\b${col}\\b`).test(sqlBlob)) {
      issues.push({
        severity: "error",
        area: "schema",
        message: `recovery_boot_evidence missing column: ${col}`,
      });
    }
  }
  if (!/recovery_boot_evidence\s+enable\s+row\s+level\s+security/i.test(sqlBlob)) {
    issues.push({
      severity: "error",
      area: "rls",
      message: "RLS not enabled on recovery_boot_evidence",
    });
  }
}

// 2. Append-only triggers + mutation blocker
if (!/block_recovery_boot_evidence_mutation/.test(sqlBlob)) {
  issues.push({
    severity: "error",
    area: "append-only",
    message: "block_recovery_boot_evidence_mutation function missing",
  });
}
if (!/recovery_boot_evidence_no_update/.test(sqlBlob)) {
  issues.push({
    severity: "error",
    area: "append-only",
    message: "recovery_boot_evidence_no_update trigger missing",
  });
}
if (!/recovery_boot_evidence_no_delete/.test(sqlBlob)) {
  issues.push({
    severity: "error",
    area: "append-only",
    message: "recovery_boot_evidence_no_delete trigger missing",
  });
}

// 3. Edge function
const fnPath = "supabase/functions/recovery-evidence-ingest/index.ts";
if (!existsSync(fnPath)) {
  issues.push({
    severity: "error",
    area: "edge-function",
    message: `${fnPath} missing`,
  });
} else {
  const fnSrc = readFileSync(fnPath, "utf8");
  if (!/recovery_boot_evidence/.test(fnSrc)) {
    issues.push({
      severity: "error",
      area: "edge-function",
      message: "edge function does not insert into recovery_boot_evidence",
    });
  }
  if (!/sha256/i.test(fnSrc)) {
    issues.push({
      severity: "error",
      area: "edge-function",
      message: "edge function missing SHA-256 hashing",
    });
  }
}

// 4. On-device collector
const collectorPath = "os/recovery/recovery-evidence-collect.sh";
if (!existsSync(collectorPath)) {
  issues.push({
    severity: "error",
    area: "collector",
    message: `${collectorPath} missing`,
  });
} else {
  try {
    const mode = statSync(collectorPath).mode & 0o777;
    if ((mode & 0o111) === 0) {
      issues.push({
        severity: "warning",
        area: "collector",
        message: "collector not executable (chmod +x recommended)",
      });
    }
  } catch {
    /* ignore */
  }
  const src = readFileSync(collectorPath, "utf8");
  if (!/recovery-mode-evidence\.json/.test(src)) {
    issues.push({
      severity: "error",
      area: "collector",
      message: "collector does not emit recovery-mode-evidence.json",
    });
  }
  if (!/recovery-evidence-ingest/.test(src)) {
    issues.push({
      severity: "error",
      area: "collector",
      message: "collector does not POST to recovery-evidence-ingest",
    });
  }
}

// 5. systemd service wiring
const svcPath = "os/image-builder/recovery/sita-recovery.service";
if (!existsSync(svcPath)) {
  issues.push({
    severity: "error",
    area: "service",
    message: `${svcPath} missing`,
  });
} else {
  const svc = readFileSync(svcPath, "utf8");
  if (!/ExecStartPre=.*recovery-evidence-collect/.test(svc)) {
    issues.push({
      severity: "error",
      area: "service",
      message: "sita-recovery.service missing ExecStartPre for evidence collector",
    });
  }
}

// 6. README documents the loop
const readmePath = "os/recovery/README.md";
if (!existsSync(readmePath)) {
  issues.push({
    severity: "warning",
    area: "docs",
    message: `${readmePath} missing`,
  });
} else {
  const readme = readFileSync(readmePath, "utf8");
  if (!/recovery-evidence-collect/.test(readme)) {
    issues.push({
      severity: "warning",
      area: "docs",
      message: "README does not document recovery-evidence-collect loop",
    });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  "generated/recovery-boot-evidence-report.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "recovery-boot-evidence",
      phase: "phase-12-native-deployability",
      ok,
      errorCount,
      warningCount,
      issues,
    },
    null,
    2,
  ),
);

console.log(
  `${ok ? "✅" : "❌"} recovery-boot-evidence: ${errorCount} errors, ${warningCount} warnings`,
);
if (!ok) {
  for (const i of issues) console.error(`[${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
