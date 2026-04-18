/**
 * Opens the Business OS windowed app at the specified module.
 * Use this from components outside the Business app window.
 */
export function openBusinessModule(module: string = "crm-home") {
  window.dispatchEvent(
    new CustomEvent("sita-open-business", { detail: { module } })
  );
}
