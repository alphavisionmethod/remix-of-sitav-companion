# .lovable/ — AI Planning Workspace

> ⚠️ **Non-canonical. Non-runtime. Non-release-truth.**

This directory is an **internal AI planning workspace** used by Lovable during
development sessions. Its contents are working memory and planning artifacts.

## What this is

- Scratch planning documents created during AI-assisted development
- Implementation plans that may or may not reflect current repository state
- Working notes and task breakdowns

## What this is NOT

- ❌ Product truth or specification
- ❌ Runtime code or configuration
- ❌ Release readiness evidence
- ❌ Deployment truth or proof
- ❌ Canonical architecture documentation
- ❌ Audit evidence

## Rules

1. **Do not import** from `.lovable/` in any source code.
2. **Do not reference** `.lovable/` files in CI workflows or validators.
3. **Do not treat** plan.md as current product truth — it is historical planning context.
4. Canonical architecture docs live in `docs/`.
5. Canonical runtime truth lives in `src/` and `generated/`.

## For auditors

If you are auditing this repository, ignore `.lovable/` entirely.
All canonical truth is in `docs/`, `src/`, `generated/`, and `supabase/`.