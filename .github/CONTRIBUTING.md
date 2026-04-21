# Contributing to SITA OS

Thank you for your interest in contributing! This document explains the process.

## Development Setup

```bash
git clone https://github.com/sita-os/sita-os.git
cd sita-os
npm ci
npm run build
npm test
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected — requires PR + CI pass. |
| `develop` | Integration branch for feature work. |
| `feature/*` | Individual feature branches. |
| `fix/*` | Bug fix branches. |
| `release/*` | Release preparation branches. |

## Pull Request Process

1. **Fork & branch** from `main` or `develop`.
2. **Make changes** — follow the architecture rules in `docs/architecture/`.
3. **Run checks locally**:
   ```bash
   npx tsc --noEmit          # typecheck
   npx eslint src/           # lint
   npx vitest run            # unit tests
   npm run build             # build
   ```
4. **Open a PR** using the [pull request template](pull_request_template.md).
5. **CI must pass** — the Launch Gate in `ci.yml` is the merge requirement.
6. **Get review** — CODEOWNERS auto-assigns reviewers.

## Architecture Rules

- **6-Layer Model**: Web → App → OS → Admin → Kernel → Domain. No layer-skipping imports.
- **One canonical system per concern** — search before creating new abstractions.
- **No `as any`** in `src/pages/`.
- **All AI outputs** through the Epistemic Firewall for high-stakes domains.
- **RLS on every table** — no exceptions without explicit security review.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(advisor): add confidence threshold display
fix(auth): handle expired refresh tokens
chore(ci): update Node.js to v20
docs(api): document rate limiting headers
```

## Code Style

- TypeScript strict mode.
- Tailwind CSS with semantic design tokens — never raw color classes.
- shadcn/ui components with proper variants.
- Prefer small, focused components and hooks.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting. Never commit secrets, API keys, or credentials.

## Questions?

Open a [support request](../../issues/new?template=support_request.yml) or check [SUPPORT.md](SUPPORT.md).