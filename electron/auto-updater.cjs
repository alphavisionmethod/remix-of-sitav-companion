// ═══════════════════════════════════════════════════════════════
// SITA OS — Electron Auto-Updater Module
// Manages OTA updates via electron-updater or manual check
// ═══════════════════════════════════════════════════════════════

const { ipcMain, app } = require('electron');
const path = require('path');
const fs = require('fs');

let autoUpdater = null;
let mainWindow = null;
let updateState = {
  checking: false,
  available: false,
  downloaded: false,
  progress: null,
  error: null,
  info: null,
};

function getUpdateState() {
  return {
    ...updateState,
    currentVersion: app.getVersion(),
  };
}

function initAutoUpdater(win) {
  mainWindow = win;

  // Try to load electron-updater (available when packaged with electron-builder)
  try {
    const { autoUpdater: eu } = require('electron-updater');
    autoUpdater = eu;

    // Configure
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Custom feed URL from env or app-update.yml
    const feedUrl = process.env.SITA_UPDATE_URL;
    if (feedUrl) {
      autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl });
    }

    // Events
    autoUpdater.on('checking-for-update', () => {
      updateState.checking = true;
      sendToRenderer('update-status', getUpdateState());
    });

    autoUpdater.on('update-available', (info) => {
      updateState.checking = false;
      updateState.available = true;
      updateState.info = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      };
      sendToRenderer('update-status', getUpdateState());
    });

    autoUpdater.on('update-not-available', () => {
      updateState.checking = false;
      updateState.available = false;
      sendToRenderer('update-status', getUpdateState());
    });

    autoUpdater.on('download-progress', (progress) => {
      updateState.progress = {
        percent: Math.round(progress.percent),
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      };
      sendToRenderer('update-status', getUpdateState());
    });

    autoUpdater.on('update-downloaded', () => {
      updateState.downloaded = true;
      updateState.progress = null;
      sendToRenderer('update-status', getUpdateState());
    });

    autoUpdater.on('error', (err) => {
      updateState.checking = false;
      updateState.error = err.message;
      sendToRenderer('update-status', getUpdateState());
    });

    console.log('[AutoUpdater] Initialized with electron-updater');
  } catch {
    console.log('[AutoUpdater] electron-updater not available — using manual check mode');
  }
}

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function setupAutoUpdaterIPC() {
  ipcMain.handle('check-for-updates', async () => {
    if (autoUpdater) {
      try {
        updateState.error = null;
        const result = await autoUpdater.checkForUpdates();
        return {
          available: !!result?.updateInfo,
          currentVersion: app.getVersion(),
          latestVersion: result?.updateInfo?.version,
        };
      } catch (err) {
        return {
          available: false,
          currentVersion: app.getVersion(),
          error: err.message,
        };
      }
    }

    // Fallback: manual version check via update manifest
    const feedUrl = process.env.SITA_UPDATE_URL;
    if (feedUrl) {
      try {
        const response = await fetch(`${feedUrl}/latest.json`);
        const info = await response.json();
        return {
          available: info.version !== app.getVersion(),
          currentVersion: app.getVersion(),
          latestVersion: info.version,
          downloadUrl: info.downloadUrl,
        };
      } catch {
        // Network unavailable
      }
    }

    return { available: false, currentVersion: app.getVersion() };
  });

  ipcMain.handle('download-update', async () => {
    if (!autoUpdater) return { success: false, reason: 'Auto-updater not available' };
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  ipcMain.handle('install-update', () => {
    if (!autoUpdater) return { success: false, reason: 'Auto-updater not available' };
    autoUpdater.quitAndInstall(false, true);
    return { success: true };
  });

  ipcMain.handle('get-update-status', () => getUpdateState());
}

module.exports = { initAutoUpdater, setupAutoUpdaterIPC };
