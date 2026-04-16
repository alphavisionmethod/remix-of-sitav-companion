# SITA OS — Global Refactor Wrapper Map

Generated: 2026-04-16

## Summary

No compatibility wrappers were required for this refactor. All consumers were updated directly to canonical paths.

## Rationale

- All 77 broken imports were fixed in-place (relative path corrections)
- All registry references were updated to canonical locations
- All admin page string references were updated directly
- All doc references were updated directly
- No runtime re-export shims were needed since scripts are executed via CLI, not imported at build time

## Future Wrapper Policy

If future script moves require backward compatibility:
1. Create a thin re-export at the old path
2. Mark with `@deprecated` JSDoc tag
3. Add to this wrapper map with removal criteria
4. Remove after one release cycle
