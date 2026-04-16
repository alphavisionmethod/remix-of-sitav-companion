# Script Taxonomy and Execution Policy

## Script Classes

| Class | Purpose | CI Default | Permanence |
|-------|---------|-----------|------------|
| `assert` | Architecture invariant assertions | PR | Permanent |
| `check` | Structural checks — boundaries, ownership, coverage | PR | Permanent |
| `validate` | Truth validation — generated artifacts match source | PR | Permanent |
| `generate` | Artifact generation — JSON manifests from source | PR | Permanent |
| `bootstrap` | Scaffold creation — new features/services | Local-only | Permanent |
| `migrate` | Migration tooling — import/data transforms | Manual | Migration |
| `emit` | Artifact emission — OVA, ISO, bundles | Release-gate | Permanent |
| `codemod` | Automated code transformations | Manual | Migration |
| `drill` | Operational drills — DR, backup verification | Support-drill | Ops |
| `restore` | Recovery operations — backup restoration | Support-drill | Ops |
| `rotate` | Secret/credential rotation | Manual | Ops |

## Execution Policy

1. **PR-blocking**: All `assert`, `check`, `validate` scripts in architecture/contracts/runtime/db/security
2. **Nightly**: Reports, runtime generators, DB generators
3. **Release-gate**: Release checks, deployment checks
4. **Manual**: Migration tools, secret rotation, codemods
5. **Local-only**: Bootstrap, legacy tools
