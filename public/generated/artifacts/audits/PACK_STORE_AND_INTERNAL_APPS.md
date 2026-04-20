# SITA OS — Pack Store & Internal Apps

## Core Truth

The Pack Store is the curated expansion layer of SITA OS.
Packs are modular operating layers, not simple add-ons.

## Pack vs Internal App

| Aspect | Internal App | Pack |
|--------|-------------|------|
| Nature | Shell workspace/space | Operating intelligence layer |
| Examples | Money, Business, Concierge | Founder Boardroom, Revenue Autopilot |
| Install | Enable/disable | Install with setup flow |
| Effect | Adds navigation entry | Changes workflows, advisors, dashboards |

## Pack Manifest

Every pack defines:
- `pack_id`, `name`, `subtitle`, `description`
- `pack_class` (persona/vertical/workflow/role/advisor/template/connector/surface)
- `owner_type` (first-party/curated-partner/internal-private)
- `target_segments`, `required_domains`
- `shell_spaces_added/modified`
- `advisors_enabled`, `workflow_families`
- `boardroom_views`, `templates`
- `connectors_supported/required`
- `policy_presets`, `approval_presets`
- `permissions_required`, `entitlement_tier`
- `trial_supported`, `dependencies`
- `version`, `migration_rules`
- `proof_models_used`, `events_emitted`

## Store Layers

1. **Core Store** — First-party packs and apps
2. **Partner Store** — Curated partner modules (later)
3. **Open Ecosystem** — Broader marketplace (much later)

## Install Flow (10 Steps)

Preview → See changes → Check connectors → See trust impact → Choose mode → Confirm permissions → Install → Onboard → Configure → First win

## Proof Model

Every install/update/uninstall generates visible proof:
- What changed, what version, what affected, who approved, when
