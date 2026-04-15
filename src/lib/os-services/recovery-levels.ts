// ═══════════════════════════════════════════════════════════════
// SITA OS — Recovery Levels
// 8-level progressive repair escalation
// ═══════════════════════════════════════════════════════════════

export type RecoveryLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RecoveryAction {
  level: RecoveryLevel;
  name: string;
  description: string;
  destructive: boolean;
  requiresConfirmation: boolean;
  requiresMFA: boolean;
  estimatedDuration: string;
  dataLoss: 'none' | 'settings' | 'app_data' | 'partial' | 'complete';
  rollbackable: boolean;
}

export interface RecoveryAttempt {
  id: string;
  level: RecoveryLevel;
  target: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  startedAt: number;
  completedAt?: number;
  error?: string;
}

const RECOVERY_ACTIONS: RecoveryAction[] = [
  { level: 1, name: 'Restart Service', description: 'Restart the affected service daemon', destructive: false, requiresConfirmation: false, requiresMFA: false, estimatedDuration: '2-5 seconds', dataLoss: 'none', rollbackable: true },
  { level: 2, name: 'Reset Subsystem Settings', description: 'Reset settings for the affected subsystem to defaults', destructive: false, requiresConfirmation: true, requiresMFA: false, estimatedDuration: '5-10 seconds', dataLoss: 'settings', rollbackable: true },
  { level: 3, name: 'Restore Last Known Good Config', description: 'Revert to the last configuration that was working correctly', destructive: false, requiresConfirmation: true, requiresMFA: false, estimatedDuration: '10-30 seconds', dataLoss: 'settings', rollbackable: true },
  { level: 4, name: 'Disable Problematic Component', description: 'Disable the app or driver causing issues', destructive: false, requiresConfirmation: true, requiresMFA: false, estimatedDuration: '5-10 seconds', dataLoss: 'none', rollbackable: true },
  { level: 5, name: 'Rollback Update', description: 'Revert to the previous system version using A/B slots', destructive: false, requiresConfirmation: true, requiresMFA: true, estimatedDuration: '1-3 minutes', dataLoss: 'none', rollbackable: true },
  { level: 6, name: 'Safe Mode', description: 'Boot with minimal services and drivers', destructive: false, requiresConfirmation: true, requiresMFA: false, estimatedDuration: '30-60 seconds', dataLoss: 'none', rollbackable: true },
  { level: 7, name: 'Reinstall Without Data Loss', description: 'Reinstall system while preserving user data', destructive: true, requiresConfirmation: true, requiresMFA: true, estimatedDuration: '5-15 minutes', dataLoss: 'partial', rollbackable: false },
  { level: 8, name: 'Factory Reset', description: 'Erase all data and restore to factory defaults', destructive: true, requiresConfirmation: true, requiresMFA: true, estimatedDuration: '10-20 minutes', dataLoss: 'complete', rollbackable: false },
];

let _rid = 0;

class RecoveryEngine {
  private attempts: RecoveryAttempt[] = [];
  private currentLevel: RecoveryLevel = 1;

  /** Get the recovery action definition for a level */
  getAction(level: RecoveryLevel): RecoveryAction {
    return RECOVERY_ACTIONS[level - 1];
  }

  allActions(): RecoveryAction[] { return [...RECOVERY_ACTIONS]; }

  /** Attempt recovery at a specific level */
  attempt(level: RecoveryLevel, target: string, reason: string): RecoveryAttempt {
    const attempt: RecoveryAttempt = {
      id: `recovery_${++_rid}`, level, target, reason,
      status: 'in_progress', startedAt: Date.now(),
    };
    this.attempts.push(attempt);
    this.currentLevel = level;

    // Simulate recovery execution
    setTimeout(() => {
      attempt.status = 'success';
      attempt.completedAt = Date.now();
    }, 1000);

    return attempt;
  }

  /** Escalate to next level after failure */
  escalate(target: string, reason: string): RecoveryAttempt | null {
    if (this.currentLevel >= 8) return null;
    const nextLevel = (this.currentLevel + 1) as RecoveryLevel;
    return this.attempt(nextLevel, target, reason);
  }

  /** Get recommended recovery level based on problem severity */
  recommend(problemType: 'service_crash' | 'config_corruption' | 'driver_failure' | 'update_failure' | 'system_unstable' | 'data_corruption'): RecoveryLevel {
    const recommendations: Record<string, RecoveryLevel> = {
      service_crash: 1,
      config_corruption: 3,
      driver_failure: 4,
      update_failure: 5,
      system_unstable: 6,
      data_corruption: 7,
    };
    return recommendations[problemType] ?? 1;
  }

  /** Mark an attempt as failed */
  fail(attemptId: string, error: string): void {
    const attempt = this.attempts.find(a => a.id === attemptId);
    if (attempt) {
      attempt.status = 'failed';
      attempt.error = error;
      attempt.completedAt = Date.now();
    }
  }

  /** Roll back an attempt */
  rollback(attemptId: string): boolean {
    const attempt = this.attempts.find(a => a.id === attemptId);
    if (!attempt) return false;
    const action = this.getAction(attempt.level);
    if (!action.rollbackable) return false;
    attempt.status = 'rolled_back';
    attempt.completedAt = Date.now();
    return true;
  }

  getAttempts(target?: string): RecoveryAttempt[] {
    return target ? this.attempts.filter(a => a.target === target) : [...this.attempts];
  }

  getCurrentLevel(): RecoveryLevel { return this.currentLevel; }

  stats() {
    return {
      totalAttempts: this.attempts.length,
      successful: this.attempts.filter(a => a.status === 'success').length,
      failed: this.attempts.filter(a => a.status === 'failed').length,
      currentLevel: this.currentLevel,
    };
  }
}

export const recoveryEngine = new RecoveryEngine();
