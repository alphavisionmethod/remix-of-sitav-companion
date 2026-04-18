// ═══════════════════════════════════════════════════════════════
// SITA OS — Provider Registration & Hooks
// Registers all 8 domain providers and exposes React hooks
// ═══════════════════════════════════════════════════════════════

import { registerProvider, resolveProvider, type ProviderDomain } from "../mode-aware-provider";
import type { RealityModeKey } from "../reality-mode-registry";
import type {
  BoardroomProvider, InvestmentProvider, MoneyProvider, BusinessProvider,
  WorkspaceProvider, OwnerProvider, CalendarProvider, AdvisorProvider,
} from "./provider-interfaces";

import {
  demoBoardroomProvider, demoInvestmentProvider, demoMoneyProvider,
  demoBusinessProvider, demoWorkspaceProvider, demoOwnerProvider,
  demoCalendarProvider, demoAdvisorProvider,
} from "./demo-providers";

import {
  realBoardroomProvider, realInvestmentProvider, realMoneyProvider,
  realBusinessProvider, realWorkspaceProvider, realOwnerProvider,
  realCalendarProvider, realAdvisorProvider,
} from "./real-providers";

// ── Register All Providers ──────────────────────────────────────

let _registered = false;

export function registerAllProviders(): void {
  if (_registered) return;
  _registered = true;

  registerProvider<BoardroomProvider>("boardroom", { real: realBoardroomProvider, demo: demoBoardroomProvider });
  registerProvider<InvestmentProvider>("investment", { real: realInvestmentProvider, demo: demoInvestmentProvider });
  registerProvider<MoneyProvider>("money", { real: realMoneyProvider, demo: demoMoneyProvider });
  registerProvider<BusinessProvider>("business", { real: realBusinessProvider, demo: demoBusinessProvider });
  registerProvider<WorkspaceProvider>("workspace", { real: realWorkspaceProvider, demo: demoWorkspaceProvider });
  registerProvider<OwnerProvider>("owner", { real: realOwnerProvider, demo: demoOwnerProvider });
  registerProvider<CalendarProvider>("calendar", { real: realCalendarProvider, demo: demoCalendarProvider });
  registerProvider<AdvisorProvider>("advisor", { real: realAdvisorProvider, demo: demoAdvisorProvider });
}

// ── Typed Resolution Helpers ────────────────────────────────────

export function getBoardroomProvider(mode: RealityModeKey): BoardroomProvider {
  return resolveProvider<BoardroomProvider>("boardroom", mode);
}

export function getInvestmentProvider(mode: RealityModeKey): InvestmentProvider {
  return resolveProvider<InvestmentProvider>("investment", mode);
}

export function getMoneyProvider(mode: RealityModeKey): MoneyProvider {
  return resolveProvider<MoneyProvider>("money", mode);
}

export function getBusinessProvider(mode: RealityModeKey): BusinessProvider {
  return resolveProvider<BusinessProvider>("business", mode);
}

export function getWorkspaceProvider(mode: RealityModeKey): WorkspaceProvider {
  return resolveProvider<WorkspaceProvider>("workspace", mode);
}

export function getOwnerProvider(mode: RealityModeKey): OwnerProvider {
  return resolveProvider<OwnerProvider>("owner", mode);
}

export function getCalendarProvider(mode: RealityModeKey): CalendarProvider {
  return resolveProvider<CalendarProvider>("calendar", mode);
}

export function getAdvisorProvider(mode: RealityModeKey): AdvisorProvider {
  return resolveProvider<AdvisorProvider>("advisor", mode);
}

// ── Re-export interfaces ────────────────────────────────────────

export type * from "./provider-interfaces";
