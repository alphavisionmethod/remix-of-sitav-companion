/**
 * Whitelisted bridge exposed to the installer renderer via contextBridge.
 * No direct Node access leaks to the React UI.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sitaInstaller", {
  runPreflight: () => ipcRenderer.invoke("preflight:run"),
  listDisks:    () => ipcRenderer.invoke("disks:list"),
  install:      (payload) => ipcRenderer.invoke("install:run", payload),
  attest:       () => ipcRenderer.invoke("trust:attest"),
  onProgress:   (cb) => {
    const listener = (_e, p) => cb(p);
    ipcRenderer.on("install:progress", listener);
    return () => ipcRenderer.removeListener("install:progress", listener);
  },
});
