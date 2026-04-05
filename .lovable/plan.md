# SITA OS — Dual Reality System Implementation Plan

## Phase 1: Database Schema (Migration)
Create all 14 tables from the prompt's data model:
- `reality_modes` — mode registry (real/demo/sandbox/dev_demo)
- `reality_mode_resolutions` — how mode was resolved per session
- `demo_scenarios` — scenario packs
- `demo_scenario_entities` — synthetic entities in scenarios
- `demo_scenario_relationships` — entity relationships
- `demo_scenario_artifacts` — generated scenario artifacts
- `mode_aware_providers` — provider contract registry
- `demo_policy_profiles` — demo-safe policy definitions
- `demo_actions` — tracked demo actions
- `demo_receipts` — demo proof objects
- `demo_analytics` — segregated demo events
- `mode_access_policies` — who can enter which mode
- `scenario_launch_profiles` — how scenarios launch
- `mode_truth_labels` — labeling/truth semantics

All with RLS, timestamps, user_id scoping.

## Phase 2: Core Runtime Architecture (~6 files)
- **Reality Mode Registry** — canonical mode definitions + resolver
- **Reality Mode Context** — React context providing current mode to entire app
- **Mode-Aware Provider System** — generic provider resolution by domain + mode
- **Demo Policy Engine** — side-effect blocking, safety controls, kill switches
- **Demo Scenario Loader** — loads scenario packs with entities/relationships/artifacts
- **Demo Analytics Segregation** — labels all demo events, prevents contamination

## Phase 3: Provider Interfaces + Demo Providers (~8 domain providers)
Create provider interfaces and demo implementations for:
- Boardroom, Investment, Money, Business, Workspace, Owner, Calendar, Advisor

Each gets: interface → real provider stub → demo scenario provider

## Phase 4: Admin Workspaces (10 pages)
- DRS01: Reality Mode Overview
- DRS02: Mode Registry Console
- DRS03: Scenario Library
- DRS04: Scenario Entity Graph
- DRS05: Provider Console
- DRS06: Demo Policy & Safety Board
- DRS07: Demo AI Control Center
- DRS08: Analytics Segregation Board
- DRS09: Truth & Labeling Review
- DRS10: Dual Reality Launch Gate

## Phase 5: Seed Data
Insert default reality modes (real, demo, sandbox) and a flagship investor demo scenario pack.

## Estimated Changes
- **1 migration** — all 14 tables
- **~6 core runtime files** — mode system
- **~16 provider files** — 8 domains × (interface + demo impl)
- **10 admin pages** — DRS01–DRS10
- **Route updates** — App.tsx
- **~35 files total**
