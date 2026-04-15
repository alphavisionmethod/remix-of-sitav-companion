// ═══════════════════════════════════════════════════════════════
// SITA OS — Action Safety Classifier
// Formal safety classification for all OS actions
// ═══════════════════════════════════════════════════════════════

import { loadServiceState, debouncedSaveServiceState } from "@/lib/persistence/universal-service-persistence";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_KEY = "action-safety";

// ── Types ────────────────────────────────────────────────────────

export type SafetyClass = "passive" | "assisted" | "active_reversible" | "high_risk";

export interface SafetyClassification {
  actionKey: string;
  safetyClass: SafetyClass;
  trustThreshold: number;
  requiresConfirmation: boolean;
  requiresAudit: boolean;
  confirmationPrompt: string | null;
  rollbackCapable: boolean;
  maxAutonomyLevel: number;
  domain: string;
  description: string | null;
}

export interface SafetyRequirements {
  safetyClass: SafetyClass;
  trustThreshold: number;
  confirmationRequired: boolean;
  confirmationPrompt: string;
  auditLevel: "none" | "standard" | "full" | "forensic";
  rollbackAvailable: boolean;
  maxAutonomyLevel: number;
  promptStyle: "silent" | "info" | "confirm" | "warning" | "danger";
  backgroundRestrictions: boolean;
  sandboxRequired: boolean;
}

export interface PreExecutionValidation {
  allowed: boolean;
  safetyClass: SafetyClass;
  requirements: SafetyRequirements;
  blockers: string[];
  warnings: string[];
  trustMet: boolean;
  confirmationNeeded: boolean;
}

export interface ActionSafetyService {
  classifyAction(actionKey: string): SafetyClassification;
  getSafetyRequirements(safetyClass: SafetyClass): SafetyRequirements;
  validatePreExecution(actionKey: string, currentTrust: number, isAutonomous?: boolean): PreExecutionValidation;
  registerClassification(classification: SafetyClassification): void;
  getClassifications(): SafetyClassification[];
  getClassificationsByClass(safetyClass: SafetyClass): SafetyClassification[];
  getStats(): { passive: number; assisted: number; active_reversible: number; high_risk: number; total: number };
  syncFromDatabase(): Promise<void>;
  loadPersistedState(): Promise<void>;
}

// ── Default classifications ──────────────────────────────────────

const DEFAULT_CLASSIFICATIONS: SafetyClassification[] = [
  { actionKey: "view_dashboard", safetyClass: "passive", trustThreshold: 0, requiresConfirmation: false, requiresAudit: false, confirmationPrompt: null, rollbackCapable: false, maxAutonomyLevel: 10, domain: "general", description: "View dashboard data" },
  { actionKey: "view_report", safetyClass: "passive", trustThreshold: 0, requiresConfirmation: false, requiresAudit: false, confirmationPrompt: null, rollbackCapable: false, maxAutonomyLevel: 10, domain: "general", description: "View reports" },
  { actionKey: "suggest_action", safetyClass: "passive", trustThreshold: 0, requiresConfirmation: false, requiresAudit: false, confirmationPrompt: null, rollbackCapable: false, maxAutonomyLevel: 10, domain: "general", description: "Show suggestion" },
  { actionKey: "summarize_data", safetyClass: "passive", trustThreshold: 0, requiresConfirmation: false, requiresAudit: false, confirmationPrompt: null, rollbackCapable: false, maxAutonomyLevel: 10, domain: "general", description: "Summarize data" },
  { actionKey: "prepare_draft", safetyClass: "assisted", trustThreshold: 0.3, requiresConfirmation: false, requiresAudit: true, confirmationPrompt: null, rollbackCapable: true, maxAutonomyLevel: 7, domain: "general", description: "Prepare draft content" },
  { actionKey: "fill_form", safetyClass: "assisted", trustThreshold: 0.3, requiresConfirmation: false, requiresAudit: true, confirmationPrompt: null, rollbackCapable: true, maxAutonomyLevel: 7, domain: "general", description: "Auto-fill form fields" },
  { actionKey: "pre_open_view", safetyClass: "assisted", trustThreshold: 0.2, requiresConfirmation: false, requiresAudit: false, confirmationPrompt: null, rollbackCapable: true, maxAutonomyLevel: 8, domain: "general", description: "Pre-open likely views" },
  { actionKey: "move_item", safetyClass: "active_reversible", trustThreshold: 0.5, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Move this item?", rollbackCapable: true, maxAutonomyLevel: 5, domain: "general", description: "Move item to new location" },
  { actionKey: "start_workflow", safetyClass: "active_reversible", trustThreshold: 0.5, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Start this workflow?", rollbackCapable: true, maxAutonomyLevel: 5, domain: "general", description: "Start automated workflow" },
  { actionKey: "group_files", safetyClass: "active_reversible", trustThreshold: 0.4, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Organize these files?", rollbackCapable: true, maxAutonomyLevel: 6, domain: "general", description: "Auto-group related files" },
  { actionKey: "send_email", safetyClass: "high_risk", trustThreshold: 0.8, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Send this email? This cannot be undone.", rollbackCapable: false, maxAutonomyLevel: 2, domain: "communication", description: "Send external email" },
  { actionKey: "financial_action", safetyClass: "high_risk", trustThreshold: 0.9, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Execute this financial action? Verify carefully.", rollbackCapable: false, maxAutonomyLevel: 1, domain: "finance", description: "Financial transaction" },
  { actionKey: "delete_data", safetyClass: "high_risk", trustThreshold: 0.85, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Delete this data? This may be irreversible.", rollbackCapable: false, maxAutonomyLevel: 2, domain: "general", description: "Permanent data deletion" },
  { actionKey: "share_sensitive", safetyClass: "high_risk", trustThreshold: 0.85, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Share sensitive data externally?", rollbackCapable: false, maxAutonomyLevel: 1, domain: "general", description: "Share sensitive information" },
  { actionKey: "change_policy", safetyClass: "high_risk", trustThreshold: 0.9, requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Modify system policy? This affects all operations.", rollbackCapable: true, maxAutonomyLevel: 1, domain: "admin", description: "Change system-wide policy" },
];

// ── Implementation ───────────────────────────────────────────────

export function createActionSafety(): ActionSafetyService {
  const classifications = new Map<string, SafetyClassification>();

  // Seed defaults
  for (const c of DEFAULT_CLASSIFICATIONS) classifications.set(c.actionKey, c);

  const REQUIREMENTS: Record<SafetyClass, SafetyRequirements> = {
    passive: {
      safetyClass: "passive", trustThreshold: 0, confirmationRequired: false,
      confirmationPrompt: "", auditLevel: "none", rollbackAvailable: false,
      maxAutonomyLevel: 10, promptStyle: "silent", backgroundRestrictions: false, sandboxRequired: false,
    },
    assisted: {
      safetyClass: "assisted", trustThreshold: 0.3, confirmationRequired: false,
      confirmationPrompt: "Proceed with assisted action?", auditLevel: "standard", rollbackAvailable: true,
      maxAutonomyLevel: 7, promptStyle: "info", backgroundRestrictions: false, sandboxRequired: false,
    },
    active_reversible: {
      safetyClass: "active_reversible", trustThreshold: 0.5, confirmationRequired: true,
      confirmationPrompt: "Execute this action?", auditLevel: "full", rollbackAvailable: true,
      maxAutonomyLevel: 5, promptStyle: "confirm", backgroundRestrictions: true, sandboxRequired: false,
    },
    high_risk: {
      safetyClass: "high_risk", trustThreshold: 0.8, confirmationRequired: true,
      confirmationPrompt: "⚠️ High-risk action. Are you sure?", auditLevel: "forensic", rollbackAvailable: false,
      maxAutonomyLevel: 2, promptStyle: "danger", backgroundRestrictions: true, sandboxRequired: true,
    },
  };

  function classifyAction(actionKey: string): SafetyClassification {
    return classifications.get(actionKey) ?? {
      actionKey, safetyClass: "assisted", trustThreshold: 0.5,
      requiresConfirmation: true, requiresAudit: true, confirmationPrompt: "Proceed?",
      rollbackCapable: false, maxAutonomyLevel: 5, domain: "general", description: null,
    };
  }

  function getSafetyRequirements(safetyClass: SafetyClass): SafetyRequirements {
    return REQUIREMENTS[safetyClass];
  }

  function validatePreExecution(actionKey: string, currentTrust: number, isAutonomous = false): PreExecutionValidation {
    const classification = classifyAction(actionKey);
    const requirements = getSafetyRequirements(classification.safetyClass);
    const blockers: string[] = [];
    const warnings: string[] = [];

    const trustMet = currentTrust >= classification.trustThreshold;
    if (!trustMet) blockers.push(`Trust ${(currentTrust * 100).toFixed(0)}% below threshold ${(classification.trustThreshold * 100).toFixed(0)}%`);

    if (isAutonomous && classification.requiresConfirmation) {
      blockers.push("Action requires user confirmation but was invoked autonomously");
    }

    if (classification.safetyClass === "high_risk") {
      warnings.push("This is a high-risk action with potential irreversible consequences");
    }

    if (!classification.rollbackCapable) {
      warnings.push("This action cannot be rolled back");
    }

    return {
      allowed: blockers.length === 0,
      safetyClass: classification.safetyClass,
      requirements,
      blockers,
      warnings,
      trustMet,
      confirmationNeeded: classification.requiresConfirmation,
    };
  }

  function registerClassification(c: SafetyClassification) {
    classifications.set(c.actionKey, c);
    debouncedSaveServiceState(SERVICE_KEY, { custom: Array.from(classifications.values()).filter(cl => !DEFAULT_CLASSIFICATIONS.find(d => d.actionKey === cl.actionKey)) });
  }

  function getClassifications(): SafetyClassification[] {
    return Array.from(classifications.values());
  }

  function getClassificationsByClass(safetyClass: SafetyClass): SafetyClassification[] {
    return Array.from(classifications.values()).filter(c => c.safetyClass === safetyClass);
  }

  function getStats() {
    const all = Array.from(classifications.values());
    return {
      passive: all.filter(c => c.safetyClass === "passive").length,
      assisted: all.filter(c => c.safetyClass === "assisted").length,
      active_reversible: all.filter(c => c.safetyClass === "active_reversible").length,
      high_risk: all.filter(c => c.safetyClass === "high_risk").length,
      total: all.length,
    };
  }

  async function syncFromDatabase() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await fromDynamicTable("action_safety_classifications")
      .select("*").eq("user_id", user.id);
    if (data) {
      for (const row of data as any[]) {
        classifications.set(row.action_key, {
          actionKey: row.action_key,
          safetyClass: row.safety_class,
          trustThreshold: Number(row.trust_threshold),
          requiresConfirmation: row.requires_confirmation,
          requiresAudit: row.requires_audit,
          confirmationPrompt: row.confirmation_prompt,
          rollbackCapable: row.rollback_capable,
          maxAutonomyLevel: row.max_autonomy_level,
          domain: row.domain ?? "general",
          description: row.description,
        });
      }
    }
  }

  async function loadPersistedState() {
    const saved = await loadServiceState(SERVICE_KEY);
    if (saved?.custom) {
      for (const c of saved.custom as SafetyClassification[]) {
        classifications.set(c.actionKey, c);
      }
    }
    await syncFromDatabase();
  }

  return {
    classifyAction, getSafetyRequirements, validatePreExecution,
    registerClassification, getClassifications, getClassificationsByClass,
    getStats, syncFromDatabase, loadPersistedState,
  };
}
