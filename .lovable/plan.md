
The user wants a full repository audit written into `MISSING_AUDIT.md`. This is a documentation task — generate a fresh, deeply-researched audit and write it to all 6 mirror locations. Read-only mode now; default mode will execute.

Plan needs to be concise. The actual audit content will be produced in default mode after exec/grep traversal. I'll declare the audit methodology, the targets, and the file outputs.

Key methodology for default mode:
1. Filesystem traversal: `find src/ scripts/ supabase/ electron/ os/ -type d` + cluster sizing
2. Route audit: grep `<Route` in `src/App.tsx` + `src/routes/`
3. Edge function inventory: `ls supabase/functions/`
4. Migration count: `ls supabase/migrations/`
5. Generated reports: `ls generated/*.json` + check `ok:` status of each
6. Master aggregator: read full `check-os-release-readiness.ts` to inventory all gates
7. Cross-check claimed registries against on-disk reality
8. Cross-check memory claims against code (already know structure from context)

Output: write the v3 audit to all 6 mirrors. Because the file is large (~1300 lines historically), I'll structure it as the 15 PARTS the user requested, with file-evidence-backed findings.

Keep plan short.
