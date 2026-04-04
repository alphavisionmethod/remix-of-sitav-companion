const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage } = require('electron');
const path = require('path');
const os = require('os');
const { initCrashReporter, setupCrashReporterIPC } = require('./crash-reporter.cjs');
const { initAutoUpdater, setupAutoUpdaterIPC } = require('./auto-updater.cjs');
const { setupFSBridge } = require('./fs-bridge.cjs');

let mainWindow;
let tray;

// ── Initialize crash reporter early ─────────────────────────
initCrashReporter();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'SITA OS',
    icon: path.join(__dirname, '..', 'dist', 'favicon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  // Initialize auto-updater with window reference
  initAutoUpdater(mainWindow);

  // Setup file system bridge with window reference
  setupFSBridge(mainWindow);

  // Capture renderer crashes
  mainWindow.webContents.on('render-process-gone', (_, details) => {
    const { addCrashEntry } = require('./crash-reporter.cjs');
    addCrashEntry({
      type: 'renderer-crash',
      reason: details.reason,
      exitCode: details.exitCode,
      timestamp: new Date().toISOString(),
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── Native Menu ─────────────────────────────────────────────────

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: 'SITA OS',
      submenu: [
        { role: 'about', label: 'About SITA OS' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Quick Add',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu-action', 'quick-add'),
        },
        { type: 'separator' },
        {
          label: 'Export Backup...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('menu-action', 'export-backup'),
        },
        {
          label: 'Import Backup...',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => mainWindow?.webContents.send('menu-action', 'import-backup'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Command Palette',
          accelerator: 'CmdOrCtrl+K',
          click: () => mainWindow?.webContents.send('menu-action', 'command-palette'),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' },
        ] : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'SITA OS Documentation',
          click: () => {
            const { shell } = require('electron');
            shell.openExternal('https://docs.sita.os');
          },
        },
        {
          label: 'Check for Updates...',
          click: () => mainWindow?.webContents.send('menu-action', 'check-updates'),
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'CmdOrCtrl+/',
          click: () => mainWindow?.webContents.send('menu-action', 'keyboard-shortcuts'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ── System Tray ─────────────────────────────────────────────────

function createTray() {
  try {
    const iconPath = path.join(__dirname, '..', 'dist', 'favicon.ico');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open SITA OS', click: () => mainWindow?.show() },
      { type: 'separator' },
      { label: 'Mission Control', click: () => mainWindow?.webContents.send('navigate', '/') },
      { label: 'Owner Center', click: () => mainWindow?.webContents.send('navigate', '/owner') },
      { label: 'Business', click: () => mainWindow?.webContents.send('navigate', '/business') },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);

    tray.setToolTip('SITA OS');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow?.show());
  } catch {
    // Tray icon not available (headless, CI, etc.)
  }
}

// ── IPC Handlers ────────────────────────────────────────────────

function setupIPC() {
  ipcMain.handle('system-info', () => ({
    platform: process.platform,
    arch: process.arch,
    hostname: os.hostname(),
    cpuCount: os.cpus().length,
    totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
    freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
    osVersion: os.release(),
    electronVersion: process.versions.electron || 'unknown',
    appVersion: app.getVersion(),
  }));

  ipcMain.on('window-control', (_, action) => {
    if (!mainWindow) return;
    switch (action) {
      case 'minimize': mainWindow.minimize(); break;
      case 'maximize': mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); break;
      case 'close': mainWindow.close(); break;
      case 'fullscreen': mainWindow.setFullScreen(!mainWindow.isFullScreen()); break;
      case 'restore': mainWindow.restore(); break;
    }
  });

  ipcMain.on('send-notification', (_, { title, body }) => {
    const { Notification } = require('electron');
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // Auto-updater IPC
  setupAutoUpdaterIPC();

  // Crash reporter IPC
  setupCrashReporterIPC();
}

// ── Deep Link Protocol ──────────────────────────────────────────

function setupDeepLinks() {
  const PROTOCOL = 'sita';

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  // Windows/Linux: second-instance
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
  } else {
    app.on('second-instance', (_, argv) => {
      const deepLink = argv.find((a) => a.startsWith(`${PROTOCOL}://`));
      if (deepLink) handleDeepLink(deepLink);
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  }
}

function handleDeepLink(url) {
  try {
    const parsed = new URL(url);
    const params = {};
    parsed.searchParams.forEach((v, k) => { params[k] = v; });
    mainWindow?.webContents.send('deep-link', {
      protocol: parsed.protocol.replace(':', ''),
      path: parsed.pathname,
      params,
    });
  } catch {
    // Invalid URL
  }
}

// ── App Lifecycle ───────────────────────────────────────────────

app.whenReady().then(() => {
  setupIPC();
  setupDeepLinks();
  buildMenu();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
