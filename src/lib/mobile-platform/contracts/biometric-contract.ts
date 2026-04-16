// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Biometric Contract
// Platform-agnostic biometric flow surface.
// ═══════════════════════════════════════════════════════════════

export type BiometricKind = "face" | "fingerprint" | "iris" | "passcode";

export type BiometricAvailability =
  | "available"
  | "not-enrolled"
  | "hardware-missing"
  | "lockout"
  | "permission-denied";

export interface BiometricPromptRequest {
  reason: string;
  /** When true, OS may permit fallback to device passcode. */
  allowDevicePasscode?: boolean;
  /** Optional correlation id forwarded to trust ledger. */
  correlationId?: string;
}

export interface BiometricPromptResult {
  success: boolean;
  kind: BiometricKind | null;
  failureReason?: string;
  /** Opaque token bound to this auth event, used to gate sensitive ops. */
  authToken?: string;
}

export interface BiometricContract {
  availability(): Promise<BiometricAvailability>;
  enrolledKinds(): Promise<ReadonlyArray<BiometricKind>>;
  prompt(req: BiometricPromptRequest): Promise<BiometricPromptResult>;
}
