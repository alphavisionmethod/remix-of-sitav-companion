const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,

  // ── System ──────────────────────────────────────────────────
  getSystemInfo: () => ipcRenderer.invoke('system-info'),
  getAppVersion: () => ipcRenderer.invoke('system-info').then((info) => info.appVersion),

  // ── Window Control ──────────────────────────────────────────
  windowControl: (action) => ipcRenderer.send('window-control', action),

  // ── Notifications ───────────────────────────────────────────
  sendNotification: (title, body) => ipcRenderer.send('send-notification', { title, body }),

  // ── Deep Links ──────────────────────────────────────────────
  onDeepLink: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('deep-link', handler);
    return () => ipcRenderer.removeListener('deep-link', handler);
  },

  // ── Menu Actions ────────────────────────────────────────────
  onMenuAction: (callback) => {
    const handler = (_, action) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },

  // ── Navigation ──────────────────────────────────────────────
  onNavigate: (callback) => {
    const handler = (_, path) => callback(path);
    ipcRenderer.on('navigate', handler);
    return () => ipcRenderer.removeListener('navigate', handler);
  },

  // ── Auto-Updater ────────────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  onUpdateStatus: (callback) => {
    const handler = (_, status) => callback(status);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  },

  // ── File System Bridge ──────────────────────────────────────
  exportBackup: (data) => ipcRenderer.invoke('fs-export-backup', data),
  importBackup: () => ipcRenderer.invoke('fs-import-backup'),
  saveFile: (options) => ipcRenderer.invoke('fs-save-file', options),
  readFile: (options) => ipcRenderer.invoke('fs-read-file', options),
  autoBackup: (data) => ipcRenderer.invoke('fs-auto-backup', data),
  listBackups: () => ipcRenderer.invoke('fs-list-backups'),

  // ── Crash Reporter ──────────────────────────────────────────
  getCrashReports: () => ipcRenderer.invoke('get-crash-reports'),
  clearCrashReports: () => ipcRenderer.invoke('clear-crash-reports'),
  reportRendererError: (error) => ipcRenderer.send('renderer-error', error),
});
