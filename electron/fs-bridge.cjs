// ═══════════════════════════════════════════════════════════════
// SITA OS — File System Bridge
// Secure IPC file operations with dialog-gated path selection
// ═══════════════════════════════════════════════════════════════

const { ipcMain, dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');

const ALLOWED_EXTENSIONS = ['json', 'csv', 'txt', 'pdf', 'png', 'jpg', 'md'];

function getBackupDir() {
  return path.join(app.getPath('userData'), 'backups');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function setupFSBridge(mainWindow) {
  // Export backup — user chooses save location
  ipcMain.handle('fs-export-backup', async (_, data) => {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export SITA OS Backup',
        defaultPath: path.join(
          app.getPath('documents'),
          `sita-backup-${new Date().toISOString().slice(0, 10)}.json`
        ),
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (canceled || !filePath) return { success: false, reason: 'Cancelled' };

      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');

      return { success: true, path: filePath, size: Buffer.byteLength(content) };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // Import backup — user chooses file to open
  ipcMain.handle('fs-import-backup', async () => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
        title: 'Import SITA OS Backup',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (canceled || !filePaths.length) return { success: false, reason: 'Cancelled' };

      const content = fs.readFileSync(filePaths[0], 'utf8');
      const parsed = JSON.parse(content);

      return { success: true, data: parsed, path: filePaths[0] };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // Save file — generic dialog-gated save
  ipcMain.handle('fs-save-file', async (_, { content, defaultName, filters }) => {
    try {
      const ext = path.extname(defaultName || 'file.txt').slice(1);
      if (!ALLOWED_EXTENSIONS.includes(ext) && ext !== '*') {
        return { success: false, reason: `Extension .${ext} not allowed` };
      }

      const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
        title: 'Save File',
        defaultPath: path.join(app.getPath('documents'), defaultName || 'file.txt'),
        filters: filters || [{ name: 'All Files', extensions: ['*'] }],
      });

      if (canceled || !filePath) return { success: false, reason: 'Cancelled' };

      const buf = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      fs.writeFileSync(filePath, buf, 'utf8');

      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // Read file — generic dialog-gated read
  ipcMain.handle('fs-read-file', async (_, { filters }) => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
        title: 'Open File',
        filters: filters || [{ name: 'All Files', extensions: ['*'] }],
        properties: ['openFile'],
      });

      if (canceled || !filePaths.length) return { success: false, reason: 'Cancelled' };

      const filePath = filePaths[0];
      const stat = fs.statSync(filePath);

      // 50MB limit
      if (stat.size > 50 * 1024 * 1024) {
        return { success: false, reason: 'File too large (max 50MB)' };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return {
        success: true,
        content,
        path: filePath,
        name: path.basename(filePath),
        size: stat.size,
      };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // Auto-backup to userData (no dialog needed)
  ipcMain.handle('fs-auto-backup', async (_, data) => {
    try {
      const backupDir = getBackupDir();
      ensureDir(backupDir);

      const filename = `auto-backup-${Date.now()}.json`;
      const filePath = path.join(backupDir, filename);
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, content, 'utf8');

      // Keep only last 10 auto-backups
      const backups = fs.readdirSync(backupDir)
        .filter((f) => f.startsWith('auto-backup-'))
        .sort()
        .reverse();

      for (const old of backups.slice(10)) {
        fs.unlinkSync(path.join(backupDir, old));
      }

      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  });

  // List auto-backups
  ipcMain.handle('fs-list-backups', () => {
    try {
      const backupDir = getBackupDir();
      if (!fs.existsSync(backupDir)) return { success: true, backups: [] };

      const backups = fs.readdirSync(backupDir)
        .filter((f) => f.startsWith('auto-backup-') || f.endsWith('.json'))
        .map((f) => {
          const stat = fs.statSync(path.join(backupDir, f));
          return { name: f, size: stat.size, created: stat.birthtime.toISOString() };
        })
        .sort((a, b) => b.created.localeCompare(a.created));

      return { success: true, backups };
    } catch (err) {
      return { success: false, reason: err.message, backups: [] };
    }
  });
}

module.exports = { setupFSBridge };
