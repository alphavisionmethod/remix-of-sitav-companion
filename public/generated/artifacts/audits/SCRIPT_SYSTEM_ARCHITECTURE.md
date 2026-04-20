# SITA OS — Script System Architecture

## Overview

The `scripts/` directory is a governed platform control subsystem organized into **11 canonical domains** with a **script registry** that classifies every script by class, owner, CI binding, and runtime consequence.

## Directory Structure

```
scripts/
├─ registry/          # Script governance: registry, taxonomy, ownership, CI bindings
├─ architecture/      # Structural invariants, layer boundaries, admin IA
│  ├─ checks/         # Admin governance checks
│  └─ lib/            # Shared utilities (ViolationCollector, scanDir, etc.)
├─ contracts/         # Contract integrity, import boundaries
│  ├─ checks/
│  └─ generate/
├─ manifests/         # Manifest truth: authority, drift, dashboards
│  ├─ validate/
│  ├─ generate/
│  └─ reports/
├─ runtime/           # Runtime truth: capability matrices, edge functions
│  ├─ checks/
│  ├─ generate/
│  ├─ probes/
│  └─ edge-functions/
├─ db/                # DB truth: schema, RLS, migrations, tenancy
│  ├─ checks/
│  ├─ generate/
│  └─ backup/
├─ deployment/        # Build, deploy, ingress
│  ├─ checks/
│  ├─ build/
│  └─ ingress/
├─ release/           # Desktop, appliance, VMware packaging
├─ support/           # Diagnostics, drills, runbooks, kill-switches
│  ├─ coverage/
│  ├─ runbooks/
│  ├─ diagnostics/
│  └─ drills/
├─ security/          # Secret rotation, tenant isolation
├─ bootstrap/         # Feature/service scaffolding
├─ codemods/          # Automated code transforms
├─ legacy/            # Archived phase-era scripts and migration tools
│  ├─ migration-tools/
│  ├─ archived-phase-scripts/
│  └─ wrappers/
├─ generate-all.ts    # Registry-driven master generator
└─ validate-all.ts    # Registry-driven master validator
```

## Script Taxonomy

11 canonical classes: `assert`, `check`, `validate`, `generate`, `bootstrap`, `migrate`, `emit`, `codemod`, `drill`, `restore`, `rotate`

## Ownership Domains

9 domains: architecture, platform-runtime, contracts, deployment-release, db, security, supportability, admin-control-plane, migration-refactor

## CI Phases

7 phases: pr, nightly, manual, release-gate, deploy-gate, support-drill, local-only

## Domain-Specific Validation

```bash
npx tsx scripts/validate-all.ts                    # All validators
npx tsx scripts/validate-all.ts architecture       # Architecture only
npx tsx scripts/validate-all.ts runtime            # Runtime only
npx tsx scripts/validate-all.ts db                 # DB only
npx tsx scripts/generate-all.ts                    # All generators
npx tsx scripts/generate-all.ts runtime            # Runtime generators only
```
