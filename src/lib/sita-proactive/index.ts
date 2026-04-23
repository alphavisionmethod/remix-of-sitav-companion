// Public surface for the Phase D proactive layer.
export {
  publishNudge,
  dismissActiveNudge,
  clearNudgeDismissals,
  subscribeNudges,
  useActiveNudge,
  type SitaNudge,
  type SitaNudgeKind,
  type SitaNudgePriority,
  type SitaNudgeAction,
} from "./sita-nudge-bus";
export { startSitaSignalSources } from "./sita-signal-sources";