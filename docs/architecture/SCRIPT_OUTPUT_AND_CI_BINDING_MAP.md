# Script Output and CI Binding Map

## Generator → Output Mapping

See `scripts/registry/script-output-map.ts` for the complete mapping.

All generators produce artifacts in `generated/`. Each artifact has:
- A declared generator script
- A version and timestamp envelope
- CI phase binding

## CI Binding Summary

| Phase | Script Count | Blocks Merge | Blocks Release |
|-------|-------------|-------------|----------------|
| PR | ~80 | ✅ | ✅ |
| Nightly | ~15 | ❌ | ❌ |
| Release-gate | ~10 | ❌ | ✅ |
| Deploy-gate | ~5 | ❌ | ✅ |
| Support-drill | ~8 | ❌ | ❌ |
| Manual | ~10 | ❌ | ❌ |
| Local-only | ~10 | ❌ | ❌ |

See `scripts/registry/script-ci-binding-map.ts` for exact bindings.
