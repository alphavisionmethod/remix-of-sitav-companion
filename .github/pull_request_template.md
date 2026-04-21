## Summary

<!-- Brief description of what this PR does and why -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ Feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 🏗️ Infrastructure / CI / Config
- [ ] 🗄️ Database migration
- [ ] ⚡ Edge function change
- [ ] 🧠 AI / Advisor change
- [ ] 📝 Documentation
- [ ] 🧹 Refactor / Cleanup (no functional change)

## Quality Checklist

### Required (blocks merge)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Unit tests pass (`npx vitest run`)
- [ ] Build succeeds (`npm run build`)
- [ ] No secrets, PII, or credentials committed

### Recommended
- [ ] Lint passes (`npx eslint src/ --max-warnings 0`)
- [ ] New code has appropriate test coverage
- [ ] Database migrations include RLS policies where applicable
- [ ] Edge functions use shared CORS/auth helpers from `_shared/`
- [ ] Contracts updated if API surface changed

## Architecture Impact

- [ ] Changes stay within existing [6-layer boundaries](docs/architecture/)
- [ ] No new service directories without registry entry (~45 canonical services max)
- [ ] No duplicate implementations of existing canonical systems
- [ ] Import boundaries respected (no App → Kernel direct imports)

### If this PR adds database tables:
- [ ] RLS policies added
- [ ] Roles stored in separate `user_roles` table (not on profiles)
- [ ] Validation uses triggers, not CHECK constraints with `now()`

### If this PR adds edge functions:
- [ ] Entry added to `edge-function-owner-map.ts`
- [ ] Uses `_shared/validate-service-role.ts` for admin auth
- [ ] CORS imported from `_shared/cors.ts`

### If this PR changes AI/advisor behavior:
- [ ] Epistemic firewall applied for high-stakes outputs
- [ ] Structured negative receipt for blocked actions
- [ ] Budget/cost implications documented

## Testing

<!-- How was this tested? Manual? Unit? E2E? -->

## Related Issues

<!-- Fixes #123, Relates to #456 -->

## Screenshots / Evidence

<!-- For UI changes, include before/after screenshots -->