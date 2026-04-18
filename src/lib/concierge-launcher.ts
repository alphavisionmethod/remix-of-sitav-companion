/**
 * Opens the Concierge OS windowed app at the specified module.
 * Use this from components outside the Concierge app window.
 */
export function openConciergeModule(module: string = "overview") {
  window.dispatchEvent(
    new CustomEvent("sita-open-concierge", { detail: { module } })
  );
}
