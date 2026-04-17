// ═══════════════════════════════════════════════════════════════
// SITA OS — MFA Service (Phase 19.A)
// Real Supabase TOTP enroll/challenge/verify wiring
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface MFAEnrollResult {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
}

export interface MFAFactor {
  id: string;
  factorType: string;
  status: "verified" | "unverified";
  friendlyName?: string;
  createdAt: string;
}

export const MFAService = {
  /** Enroll a new TOTP factor — returns QR + secret to show to user. */
  async enrollTOTP(friendlyName = "Authenticator App"): Promise<MFAEnrollResult> {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName,
    });
    if (error) throw error;
    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  },

  /** Create a challenge for a factor (returns challengeId to verify against). */
  async challenge(factorId: string): Promise<{ challengeId: string }> {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) throw error;
    return { challengeId: data.id };
  },

  /** Verify a TOTP code against a challenge. Promotes session to AAL2 on success. */
  async verify(factorId: string, challengeId: string, code: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    return !error;
  },

  /** One-shot challenge + verify helper. */
  async challengeAndVerify(factorId: string, code: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    return !error;
  },

  /** Unenroll (remove) a factor. */
  async unenroll(factorId: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return !error;
  },

  /** List enrolled factors for current user. */
  async listFactors(): Promise<MFAFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return (data?.all ?? []).map((f) => ({
      id: f.id,
      factorType: f.factor_type,
      status: f.status as "verified" | "unverified",
      friendlyName: f.friendly_name ?? undefined,
      createdAt: f.created_at,
    }));
  },

  /** Returns current Authenticator Assurance Level. AAL2 = MFA satisfied. */
  async getAAL(): Promise<{ currentLevel: string | null; nextLevel: string | null }> {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return {
      currentLevel: data.currentLevel,
      nextLevel: data.nextLevel,
    };
  },

  /** Returns true if AAL2 is required but not yet satisfied. */
  async requiresStepUp(): Promise<boolean> {
    const { currentLevel, nextLevel } = await this.getAAL();
    return nextLevel === "aal2" && currentLevel !== "aal2";
  },
};
