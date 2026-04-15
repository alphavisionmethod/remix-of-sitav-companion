

# Plan: Generate PROJECT_TREE.md

## What
Create a single comprehensive document (`generated/PROJECT_TREE.md`) containing:
1. **Full directory/file tree** with a one-line description for every file (excluding `.git/`, `node_modules/`, `dist/`, lock files, `.tsbuildinfo`)
2. **Checklist section** — every feature, service, page, component, edge function, migration, contract, and capability organized by domain with status indicators
3. **Missing integrations section** — items identified as not yet wired or incomplete based on the full codebase audit

## Scope
The document will cover ~1,500+ files across:
- 28 top-level config/infra files
- 7 windowed app shells (Business, Finance, Concierge, Investment, Boardroom, Mission Control, App Store)
- ~970 page components across 30+ page directories
- ~830 UI/shell/domain components
- ~200 service modules in `lib/services/`
- ~60 core services in `lib/core-services/`
- 19 security modules
- 14 Nova SDK kernel modules
- 18 capability handlers
- 28 contract packages
- 70+ edge functions
- 130+ database migrations
- 55 generated manifests
- 26 architecture docs
- 120+ hooks
- 22 contexts
- 11 route files

## Implementation
Single file write to `/mnt/documents/PROJECT_TREE.md` using a script that formats all the data I've already gathered. No codebase changes needed.

## Technical Details
- Output format: Markdown with indented tree structure, checkboxes for checklist items
- Each file gets a `— description` suffix
- Grouped by architectural layer (Kernel → Core Services → Domain → Shell → Pages → Edge Functions → Infra)
- Missing items flagged with `[ ] MISSING:` prefix
- Estimated size: ~4,000-5,000 lines

