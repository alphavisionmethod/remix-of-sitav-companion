// ═══════════════════════════════════════════════════════════════
// SITA OS — Outbound Communication Policy Service
// Validates outbound comms against OUTBOUND_POLICIES
// ═══════════════════════════════════════════════════════════════

import { OUTBOUND_POLICIES, type OutboundCommunicationPolicy } from "@/packages/policy-contracts";

export interface OutboundRequest {
  type: "email" | "sms" | "phone" | "bulk";
  recipientId: string;
  recipientTimezoneOffset?: number; // hours from UTC
  sentTodayCount: number;
  lastSentAt?: string;
  hasOptedOut?: boolean;
}

export interface OutboundValidation {
  allowed: boolean;
  requiresApproval: boolean;
  requiresDualApproval: boolean;
  blockedReasons: string[];
  warnings: string[];
  matchedPolicy: OutboundCommunicationPolicy | null;
  cooldownRemainingMinutes: number;
}

export function validateOutboundCommunication(request: OutboundRequest): OutboundValidation {
  const policy = OUTBOUND_POLICIES.find((p) => p.type === request.type);

  if (!policy) {
    return {
      allowed: false,
      requiresApproval: false,
      requiresDualApproval: false,
      blockedReasons: [`No policy found for communication type: ${request.type}`],
      warnings: [],
      matchedPolicy: null,
      cooldownRemainingMinutes: 0,
    };
  }

  const reasons: string[] = [];
  const warnings: string[] = [];

  // Opt-out check
  if (policy.optOutCheckRequired && request.hasOptedOut) {
    reasons.push("Recipient has opted out of this communication type");
  }

  // Rate limit check
  if (request.sentTodayCount >= policy.maxPerDay) {
    reasons.push(`Daily limit reached: ${request.sentTodayCount}/${policy.maxPerDay} ${request.type} messages sent today`);
  } else if (request.sentTodayCount >= policy.maxPerDay * 0.8) {
    warnings.push(`Approaching daily limit: ${request.sentTodayCount}/${policy.maxPerDay}`);
  }

  // Cooldown check
  let cooldownRemaining = 0;
  if (request.lastSentAt && policy.cooldownMinutes > 0) {
    const elapsed = (Date.now() - new Date(request.lastSentAt).getTime()) / 60000;
    if (elapsed < policy.cooldownMinutes) {
      cooldownRemaining = Math.ceil(policy.cooldownMinutes - elapsed);
      reasons.push(`Cooldown active: ${cooldownRemaining} minutes remaining`);
    }
  }

  // Time window check
  const recipientHour = getCurrentRecipientHour(request.recipientTimezoneOffset);
  if (recipientHour < policy.timeRestrictions.startHour || recipientHour >= policy.timeRestrictions.endHour) {
    reasons.push(`Outside allowed hours: ${policy.timeRestrictions.startHour}:00–${policy.timeRestrictions.endHour}:00 (recipient time: ${recipientHour}:00)`);
  }

  return {
    allowed: reasons.length === 0,
    requiresApproval: policy.requiresApproval,
    requiresDualApproval: policy.requiresDualApproval,
    blockedReasons: reasons,
    warnings,
    matchedPolicy: policy,
    cooldownRemainingMinutes: cooldownRemaining,
  };
}

function getCurrentRecipientHour(offsetHours?: number): number {
  const now = new Date();
  const utcHour = now.getUTCHours();
  return (utcHour + (offsetHours || 0) + 24) % 24;
}

export function getPolicyForType(type: OutboundCommunicationPolicy["type"]): OutboundCommunicationPolicy | undefined {
  return OUTBOUND_POLICIES.find((p) => p.type === type);
}

export function getRemainingQuota(type: OutboundCommunicationPolicy["type"], sentToday: number): number {
  const policy = OUTBOUND_POLICIES.find((p) => p.type === type);
  if (!policy) return 0;
  return Math.max(0, policy.maxPerDay - sentToday);
}

