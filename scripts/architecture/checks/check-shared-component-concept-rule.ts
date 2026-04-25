#!/usr/bin/env tsx
// Wave 0.9 — alias entry point so the foundation-tier validator discovery
// (which scans scripts/architecture/checks/check-*.ts) picks up the
// concept-rule validator. The real implementation lives one directory up.
import "../check-shared-component-concept-rule";