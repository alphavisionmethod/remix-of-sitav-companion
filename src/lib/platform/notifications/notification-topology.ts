// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Notification Topology
// Layer 3 · cross-surface notification routing + delivery truth
// Companion doc: docs/architecture/NOTIFICATION_RUNTIME_MODEL.md
// ═══════════════════════════════════════════════════════════════

export type NotificationClass =
  | "system.alert"          // critical system event
  | "security.event"        // login, MFA, suspicious activity
  | "approval.required"     // approval queue item
  | "approval.decided"      // approval outcome
  | "advisor.recommendation"// advisor produced something
  | "execution.completed"   // action ran
  | "execution.failed"      // action failed
  | "incident.opened"       // incident raised
  | "boardroom.escalation"  // boardroom requires attention
  | "marketing.update"      // product updates
  | "calm.summary";         // batched calm digest

export type DeliveryChannel =
  | "in-app"          // visible inside UI shell
  | "push-web"        // web push (VAPID)
  | "push-mobile"     // FCM (Android)
  | "push-apple"      // APNs (Apple — deferred)
  | "email"           // transactional email
  | "sms"             // SMS via Twilio
  | "system-tray";    // desktop shell

export type DeliveryAudience = "user" | "admin" | "owner" | "household" | "org";

export type CalmCategory = "interrupting" | "important" | "ambient" | "digestible";

export interface NotificationClassEntry {
  readonly className: NotificationClass;
  readonly displayName: string;
  readonly defaultChannels: readonly DeliveryChannel[];
  readonly fallbackChannels: readonly DeliveryChannel[];
  readonly audience: DeliveryAudience;
  readonly calmCategory: CalmCategory;
  readonly fatigueWindowMinutes: number;     // suppress repeats inside this window
  readonly proofOfDeliveryRequired: boolean;
  readonly proofOfOpenRequired: boolean;
  readonly killSwitchTarget: string | null;
  readonly notes: string;
}

export const NOTIFICATION_TOPOLOGY: readonly NotificationClassEntry[] = [
  { className: "system.alert",            displayName: "System Alert",            defaultChannels: ["in-app","push-web","email","system-tray"], fallbackChannels: ["sms"],         audience: "admin",  calmCategory: "interrupting", fatigueWindowMinutes: 5,    proofOfDeliveryRequired: true,  proofOfOpenRequired: true,  killSwitchTarget: null,                  notes: "Critical bypasses calm gate" },
  { className: "security.event",          displayName: "Security Event",          defaultChannels: ["in-app","push-web","email"],              fallbackChannels: ["sms"],         audience: "user",   calmCategory: "interrupting", fatigueWindowMinutes: 1,    proofOfDeliveryRequired: true,  proofOfOpenRequired: true,  killSwitchTarget: null,                  notes: "Always delivered, never batched" },
  { className: "approval.required",       displayName: "Approval Required",       defaultChannels: ["in-app","push-web"],                       fallbackChannels: ["email"],       audience: "user",   calmCategory: "important",    fatigueWindowMinutes: 15,   proofOfDeliveryRequired: true,  proofOfOpenRequired: false, killSwitchTarget: "notifications-kill",  notes: "Routes to /approval-chamber" },
  { className: "approval.decided",        displayName: "Approval Decided",        defaultChannels: ["in-app"],                                  fallbackChannels: ["push-web"],    audience: "user",   calmCategory: "ambient",      fatigueWindowMinutes: 60,   proofOfDeliveryRequired: false, proofOfOpenRequired: false, killSwitchTarget: "notifications-kill",  notes: "Confirmation only" },
  { className: "advisor.recommendation",  displayName: "Advisor Recommendation",  defaultChannels: ["in-app"],                                  fallbackChannels: ["push-web"],    audience: "user",   calmCategory: "digestible",   fatigueWindowMinutes: 30,   proofOfDeliveryRequired: false, proofOfOpenRequired: false, killSwitchTarget: "advisor-kill",        notes: "Eligible for digest" },
  { className: "execution.completed",     displayName: "Action Completed",        defaultChannels: ["in-app"],                                  fallbackChannels: [],              audience: "user",   calmCategory: "ambient",      fatigueWindowMinutes: 60,   proofOfDeliveryRequired: false, proofOfOpenRequired: false, killSwitchTarget: null,                  notes: "Quiet feedback" },
  { className: "execution.failed",        displayName: "Action Failed",           defaultChannels: ["in-app","push-web"],                       fallbackChannels: ["email"],       audience: "user",   calmCategory: "important",    fatigueWindowMinutes: 5,    proofOfDeliveryRequired: true,  proofOfOpenRequired: false, killSwitchTarget: null,                  notes: "Always shown" },
  { className: "incident.opened",         displayName: "Incident Opened",         defaultChannels: ["in-app","push-web","system-tray","email"], fallbackChannels: ["sms"],         audience: "admin",  calmCategory: "interrupting", fatigueWindowMinutes: 1,    proofOfDeliveryRequired: true,  proofOfOpenRequired: true,  killSwitchTarget: null,                  notes: "Bypasses calm" },
  { className: "boardroom.escalation",    displayName: "Boardroom Escalation",    defaultChannels: ["in-app","push-web","email"],               fallbackChannels: [],              audience: "owner",  calmCategory: "important",    fatigueWindowMinutes: 30,   proofOfDeliveryRequired: true,  proofOfOpenRequired: false, killSwitchTarget: null,                  notes: "Owner-only escalation" },
  { className: "marketing.update",        displayName: "Marketing / Product Update", defaultChannels: ["in-app","email"],                       fallbackChannels: [],              audience: "user",   calmCategory: "digestible",   fatigueWindowMinutes: 60*24, proofOfDeliveryRequired: false, proofOfOpenRequired: false, killSwitchTarget: "marketing-kill",      notes: "Subject to user opt-out" },
  { className: "calm.summary",            displayName: "Calm Daily Digest",       defaultChannels: ["email","in-app"],                          fallbackChannels: ["push-web"],    audience: "user",   calmCategory: "digestible",   fatigueWindowMinutes: 60*24, proofOfDeliveryRequired: false, proofOfOpenRequired: false, killSwitchTarget: null,                  notes: "Aggregates ambient/digestible items" },
] as const;

export interface ChannelCapability {
  readonly channel: DeliveryChannel;
  readonly displayName: string;
  readonly availableOn: { readonly web: boolean; readonly desktop: boolean; readonly appliance: boolean; readonly mobile: boolean };
  readonly requiresUserOptIn: boolean;
  readonly requiresCredential: string | null;   // e.g. "VAPID_PUBLIC_KEY"
  readonly proofTable: string | null;
}

export const CHANNEL_CAPABILITIES: readonly ChannelCapability[] = [
  { channel: "in-app",       displayName: "In-App",       availableOn: { web: true,  desktop: true,  appliance: true,  mobile: true  }, requiresUserOptIn: false, requiresCredential: null,                proofTable: "notification_deliveries" },
  { channel: "push-web",     displayName: "Web Push",     availableOn: { web: true,  desktop: true,  appliance: true,  mobile: false }, requiresUserOptIn: true,  requiresCredential: "VAPID_PUBLIC_KEY",  proofTable: "notification_deliveries" },
  { channel: "push-mobile",  displayName: "Android Push", availableOn: { web: false, desktop: false, appliance: false, mobile: true  }, requiresUserOptIn: true,  requiresCredential: "FCM_SERVICE_ACCOUNT_JSON", proofTable: "notification_deliveries" },
  { channel: "push-apple",   displayName: "Apple Push",   availableOn: { web: false, desktop: false, appliance: false, mobile: true  }, requiresUserOptIn: true,  requiresCredential: "APNS_KEY_ID",       proofTable: "notification_deliveries" },
  { channel: "email",        displayName: "Email",        availableOn: { web: true,  desktop: true,  appliance: true,  mobile: true  }, requiresUserOptIn: false, requiresCredential: null,                proofTable: "notification_deliveries" },
  { channel: "sms",          displayName: "SMS",          availableOn: { web: true,  desktop: true,  appliance: true,  mobile: true  }, requiresUserOptIn: true,  requiresCredential: "TWILIO_AUTH_TOKEN", proofTable: "notification_deliveries" },
  { channel: "system-tray",  displayName: "System Tray",  availableOn: { web: false, desktop: true,  appliance: true,  mobile: false }, requiresUserOptIn: false, requiresCredential: null,                proofTable: "notification_deliveries" },
] as const;

export function getNotificationClass(className: NotificationClass): NotificationClassEntry | undefined {
  return NOTIFICATION_TOPOLOGY.find((n) => n.className === className);
}

export function getChannelCapability(channel: DeliveryChannel): ChannelCapability | undefined {
  return CHANNEL_CAPABILITIES.find((c) => c.channel === channel);
}

export function isChannelAvailable(channel: DeliveryChannel, tier: "web" | "desktop" | "appliance" | "mobile"): boolean {
  const cap = getChannelCapability(channel);
  return !!cap && cap.availableOn[tier];
}

/** Resolve effective delivery plan: filter to channels actually available on a tier. */
export function resolveDeliveryPlan(
  className: NotificationClass,
  tier: "web" | "desktop" | "appliance" | "mobile",
): { primary: readonly DeliveryChannel[]; fallback: readonly DeliveryChannel[] } | null {
  const entry = getNotificationClass(className);
  if (!entry) return null;
  const primary = entry.defaultChannels.filter((c) => isChannelAvailable(c, tier));
  const fallback = entry.fallbackChannels.filter((c) => isChannelAvailable(c, tier));
  return { primary, fallback };
}
