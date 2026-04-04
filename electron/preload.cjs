const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,

  getSystemInfo: () => ipcRenderer.invoke('system-info'),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  getAppVersion: () => ipcRenderer.invoke('system-info').then((info) => info.appVersion),

  windowControl: (action) => ipcRenderer.send('window-control', action),

  sendNotification: (title, body) => ipcRenderer.send('send-notification', { title, body }),

  onDeepLink: (callback) => {
    const handler = (_, payload) => callback(payload);
    ipcRenderer.on('deep-link', handler);
    return () => ipcRenderer.removeListener('deep-link', handler);
  },

  onMenuAction: (callback) => {
    const handler = (_, action) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },

  onNavigate: (callback) => {
    const handler = (_, path) => callback(path);
    ipcRenderer.on('navigate', handler);
    return () => ipcRenderer.removeListener('navigate', handler);
  },
});
