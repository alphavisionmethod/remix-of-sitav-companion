// ═══════════════════════════════════════════════════════════════
// SITA OS — Sita HUD barrel (Phase A)
// ═══════════════════════════════════════════════════════════════

export { SitaPresenceOrb } from "./SitaPresenceOrb";
export { SitaHudStrip } from "./SitaHudStrip";
export { SitaFirstRunReveal } from "./SitaFirstRunReveal";
export { useSitaAmbientMood } from "./useSitaAmbientMood";
export { SitaWhisper } from "./SitaWhisper";
export { SitaProactiveRunner } from "./SitaProactiveRunner";
export {
  publishSitaHud,
  readSitaHud,
  subscribeSitaHud,
  useSitaHud,
  type SitaPresenceState,
  type SitaHudSnapshot,
} from "./sita-hud-bus";
