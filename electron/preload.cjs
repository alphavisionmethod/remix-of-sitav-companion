const { contextBridge, ipcRenderer, webFrame } = require('electron');
const fs = require('fs');
const path = require('path');

// ── Bridge contract version (see docs/os/ELECTRON_PRELOAD_CONTRACT.md) ──
const BRIDGE_VERSION = '1.0.0';

// ── Deployment Profile Injection ─────────────────────────────
// Reads /etc/sita/deployment-profile.json (baked into the ISO by
// the image builder) and exposes it to the renderer BEFORE app
// scripts run, so getDeploymentProfile() returns the real profile.
const PROFILE_PATH = process.env.SITA_DEPLOYMENT_PROFILE_PATH || '/etc/sita/deployment-profile.json';
let __sitaDeploymentProfile = null;
try {
  if (fs.existsSync(PROFILE_PATH)) {
    const raw = fs.readFileSync(PROFILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.profile === 'user' || parsed.profile === 'operator')) {
      __sitaDeploymentProfile = parsed;
    }
  }
} catch (err) {
  // Non-fatal — renderer will fall back to user profile.
  // eslint-disable-next-line no-console
  console.warn('[sita-preload] deployment profile read failed:', err && err.message);
}
// Inject into renderer's window before any app code runs.
try {
  contextBridge.exposeInMainWorld('__SITA_DEPLOYMENT_PROFILE__', __sitaDeploymentProfile);
} catch {
  // contextBridge will reject non-cloneable values; fall through silently.
}

// ── Heartbeat: liveness signal consumed by os/runtime/check-shell-health.sh
// Writes mtime every 5s. Stale > 30s = renderer hung → exit code 14.
const HEARTBEAT_PATH = process.env.SITA_HEARTBEAT_PATH || '/var/lib/sita/state/shell-heartbeat';
function writeHeartbeat() {
  try {
    fs.mkdirSync(path.dirname(HEARTBEAT_PATH), { recursive: true });
    const tmp = `${HEARTBEAT_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, String(Date.now()));
    fs.renameSync(tmp, HEARTBEAT_PATH);
  } catch { /* read-only fs in dev / sandbox — ignore */ }
}
writeHeartbeat();
setInterval(writeHeartbeat, 5000).unref?.();

contextBridge.exposeInMainWorld('electron', {
  bridgeVersion: BRIDGE_VERSION,
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

  // ── License ────────────────────────────────────────────────
  getLicenseInfo: () => ipcRenderer.invoke('license-info'),
  activateLicense: (key) => ipcRenderer.invoke('license-activate', key),
  deactivateLicense: () => ipcRenderer.invoke('license-deactivate'),

  // ── Security Status ──────────────────────────────────────────
  getDLPStatus: () => ipcRenderer.invoke('get-dlp-status'),
  getNetworkSentinelStatus: () => ipcRenderer.invoke('get-network-sentinel-status'),
  getShieldStatus: () => ipcRenderer.invoke('get-shield-status'),
});

// ── App Platform — native app launch bridge ──────────────────
contextBridge.exposeInMainWorld('sitaApps', {
  launchNativeApp: (appId) => ipcRenderer.invoke('sita-apps:launch-native', appId),
  checkNativeAppAvailability: (appId) => ipcRenderer.invoke('sita-apps:check-native', appId),
  openExternalUrl: (url) => ipcRenderer.invoke('sita-apps:open-external', url),
  getHostCapabilities: () => ipcRenderer.invoke('sita-apps:host-capabilities'),
});
