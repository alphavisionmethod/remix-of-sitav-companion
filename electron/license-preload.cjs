// ═══════════════════════════════════════════════════════════════
// SITA OS — License Activation Preload Script
// Exposes license IPC to the activation window
// ═══════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('licenseAPI', {
  activate: (key) => ipcRenderer.invoke('license-activate', key),
  close: () => ipcRenderer.send('license-window-close'),
});
