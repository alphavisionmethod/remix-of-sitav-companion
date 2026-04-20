# Web Platform (Web-Target Deployability)

## Purpose
**Web-target deployability contract.** Declares browser min-version, runtime contract, and release-gating rules specific to the web build target (vs. Electron, mobile).

## Layer
**Deployability contract** layer — adjacent to but distinct from `platform/` runtime. Consumed by release gates and the web build pipeline.

## What lives here
- `release/` — web release-gating rules (browser support matrix, feature-detect contracts).
- Web-specific runtime contract checks.

## What does NOT belong here
- Generic platform plumbing → `src/lib/platform/`.
- Electron-specific contracts → `electron/`.
- Mobile-specific contracts → mobile build pipeline.
- BFF/RBAC routing → `src/lib/platform-plane/`.

## Canonical neighbors
- `src/lib/platform/` — generic platform primitives.
- `electron/_layout.cjs` — Electron-target contract (BLOCK gate #20).
- `.github/workflows/os-build-iso.yml` — OS-target CI (BLOCK gate #21).
