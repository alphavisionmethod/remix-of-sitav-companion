/**
 * Programmatic launcher for Mission Control windowed app.
 */
export function openMissionControlModule(module: string = "dashboard") {
  (window as any).__missionControlInitialModule = module;
  window.dispatchEvent(new CustomEvent("sita-open-mission-control", { detail: { module } }));
}
