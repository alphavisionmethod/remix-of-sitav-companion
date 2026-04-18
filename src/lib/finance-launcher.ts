/**
 * Opens the Finance OS windowed app at the specified module.
 * Use this from components outside the Finance app window.
 */
export function openFinanceModule(module: string = "overview") {
  window.dispatchEvent(
    new CustomEvent("sita-open-finance", { detail: { module } })
  );
}
