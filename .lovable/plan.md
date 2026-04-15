

# Plan: Generate `description.md` — Full Project Audit

## What This Involves

The project is massive — roughly **700+ source files** across pages, components, hooks, services, engines, contexts, routes, edge functions, migrations, scripts, docs, deploy configs, Electron, and test files. Generating a thorough file-by-file inventory requires:

1. **Writing a Python script** that traverses the project tree, reads each relevant file, and outputs structured Markdown
2. **Manual augmentation** with wiring/status assessments based on the directory exploration already completed

## Approach

Rather than hand-writing 700+ entries (which would be error-prone and incomplete), I will:

1. **Write a Python audit script** (`/tmp/audit.py`) that:
   - Recursively walks the project, skipping `node_modules`, `.git`, `dist`, `coverage`, lockfiles
   - For each file: records path, size, extension, and extracts key signals (imports, exports, TODO/STUB/PLACEHOLDER markers, route references)
   - Cross-references route registrations against page files to detect orphans
   - Cross-references component imports to detect unused components
   - Checks edge function directories for `index.ts` presence
   - Checks migration count and naming
   - Detects files with `as any`, `TODO`, `FIXME`, `placeholder`, `stub`, `mock` markers

2. **Generate `description.md`** at project root with the exact format requested:
   - Summary stats (total files, complete count, incomplete count, risk areas)
   - Legend
   - Per-file entry with Status, Purpose, Expected Role, Wiring Check, Problems
   - Final assessment with broken files, unfinished features, orphans, next steps

3. **Categorize files into sections** for readability:
   - Root config files
   - Source entry (`App.tsx`, `main.tsx`, `index.css`)
   - Auth pages
   - Mobile pages (25 files)
   - Business pages (48 files)
   - Money pages (34 files)
   - Concierge pages (21 files)
   - Investment Office pages (41 files)
   - Admin pages (~200+ files)
   - Cloud admin pages (48 files)
   - OS/Shell components
   - Desktop widgets
   - Windowed apps
   - UI primitives
   - Hooks (~110 files)
   - Contexts (22 files)
   - Services (~200+ directories)
   - Engines (~37 files)
   - Routes (11 files)
   - Edge functions (~65 directories)
   - Migrations (~125 files)
   - Scripts (~80 files)
   - Docs (~28 files)
   - Deploy configs
   - Electron files
   - Tests
   - Public/PWA assets

4. **Status assignment logic**:
   - ✅ if file exists, has real code (not just TODO), is imported/routed somewhere
   - ❌ if file has TODO/STUB markers, is not imported anywhere, has broken imports, or references missing dependencies

## Output

A single `description.md` file at project root, estimated 3000-5000 lines, covering every relevant file with the exact audit format requested.

## Technical Details

- The script will use `os.walk` + `re` for pattern matching
- Import/export cross-referencing via grep-style search
- Route wiring verified by parsing `App.tsx` and route family files
- Edge function completeness checked by verifying `index.ts` exists in each function dir
- File will be generated directly as Markdown, not requiring any runtime

