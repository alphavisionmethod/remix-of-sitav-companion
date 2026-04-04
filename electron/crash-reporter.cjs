// ═══════════════════════════════════════════════════════════════
// SITA OS — Crash Reporter
// Captures main/renderer crashes with local dump + optional upload
// ═══════════════════════════════════════════════════════════════

const { crashReporter, ipcMain, app } = require('electron');
const fs = require('fs');
const path = require('path');

let crashLog = [];
const MAX_CRASH_LOG = 50;

function getCrashDir() {
  return path.join(app.getPath('userData'), 'crashes');
}

function initCrashReporter() {
  const submitURL = process.env.SITA_CRASH_REPORT_URL || '';

  crashReporter.start({
    productName: 'SITA OS',
    companyName: 'SITA',
    submitURL: submitURL || 'https://localhost/crash-void',
    uploadToServer: !!submitURL,
    compress: true,
    extra: {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
    },
  });

  // Capture unhandled rejections in main process
  process.on('unhandledRejection', (reason) => {
    const entry = {
      type: 'unhandled-rejection',
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    addCrashEntry(entry);
  });

  process.on('uncaughtException', (error) => {
    const entry = {
      type: 'uncaught-exception',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
    addCrashEntry(entry);
    writeCrashLog();
  });

  console.log('[CrashReporter] Initialized');
}

function addCrashEntry(entry) {
  crashLog.push(entry);
  if (crashLog.length > MAX_CRASH_LOG) {
    crashLog = crashLog.slice(-MAX_CRASH_LOG);
  }
}

function writeCrashLog() {
  try {
    const crashDir = getCrashDir();
    if (!fs.existsSync(crashDir)) {
      fs.mkdirSync(crashDir, { recursive: true });
    }
    const filePath = path.join(crashDir, `crash-${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(crashLog, null, 2), 'utf8');

    // Keep only last 20 crash files
    const files = fs.readdirSync(crashDir)
      .filter((f) => f.startsWith('crash-') && f.endsWith('.json'))
      .sort()
      .reverse();
    for (const old of files.slice(20)) {
      fs.unlinkSync(path.join(crashDir, old));
    }
  } catch {
    // Can't write crash log — ironic but non-fatal
  }
}

function setupCrashReporterIPC() {
  ipcMain.handle('get-crash-reports', () => {
    try {
      const crashDir = getCrashDir();
      if (!fs.existsSync(crashDir)) return { reports: [], inMemory: crashLog };

      const files = fs.readdirSync(crashDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 5);

      const reports = files.map((f) => {
        try {
          const content = fs.readFileSync(path.join(crashDir, f), 'utf8');
          return { file: f, entries: JSON.parse(content) };
        } catch {
          return { file: f, entries: [] };
        }
      });

      return { reports, inMemory: crashLog };
    } catch {
      return { reports: [], inMemory: crashLog };
    }
  });

  ipcMain.handle('clear-crash-reports', () => {
    try {
      const crashDir = getCrashDir();
      if (fs.existsSync(crashDir)) {
        const files = fs.readdirSync(crashDir);
        for (const f of files) {
          fs.unlinkSync(path.join(crashDir, f));
        }
      }
      crashLog = [];
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // Renderer crash reporting
  ipcMain.on('renderer-error', (_, error) => {
    addCrashEntry({
      type: 'renderer-error',
      message: error.message || String(error),
      stack: error.stack,
      url: error.url,
      timestamp: new Date().toISOString(),
    });
  });
}

module.exports = { initCrashReporter, setupCrashReporterIPC, addCrashEntry };
