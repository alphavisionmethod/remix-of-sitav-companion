// ═══════════════════════════════════════════════════════════════
// SITA OS — License Activation UI Window
// Shows activation prompt; blocks app until valid license
// ═══════════════════════════════════════════════════════════════

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let activationWindow = null;

function createActivationWindow() {
  return new Promise((resolve) => {
    activationWindow = new BrowserWindow({
      width: 520,
      height: 420,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      title: 'SITA OS — License Activation',
      backgroundColor: '#0a0a0a',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'license-preload.cjs'),
      },
    });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a; color: #e4e4e7;
      display: flex; align-items: center; justify-content: center;
      height: 100vh; padding: 32px;
    }
    .container { width: 100%; max-width: 420px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .subtitle { color: #71717a; font-size: 13px; margin-bottom: 32px; }
    .input-group { margin-bottom: 20px; text-align: left; }
    label { display: block; font-size: 12px; color: #a1a1aa; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
    input {
      width: 100%; padding: 12px 16px; background: #18181b; border: 1px solid #27272a;
      border-radius: 8px; color: #e4e4e7; font-size: 15px; font-family: monospace;
      outline: none; transition: border-color 0.2s;
    }
    input:focus { border-color: #3b82f6; }
    input::placeholder { color: #52525b; }
    .btn {
      width: 100%; padding: 12px; background: #3b82f6; color: white;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn:hover { background: #2563eb; }
    .btn:disabled { background: #27272a; cursor: not-allowed; color: #52525b; }
    .error { color: #ef4444; font-size: 13px; margin-top: 12px; min-height: 20px; }
    .info { color: #71717a; font-size: 11px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SITA OS</div>
    <div class="subtitle">Enter your license key to activate</div>
    <div class="input-group">
      <label>License Key</label>
      <input type="text" id="key" placeholder="XXXX-XXXX-XXXX-XXXX" spellcheck="false" autocomplete="off" />
    </div>
    <button class="btn" id="activate" onclick="doActivate()">Activate</button>
    <div class="error" id="error"></div>
    <div class="info">
      Your license is bound to this device.<br>
      Need help? support@sita.app
    </div>
  </div>
  <script>
    async function doActivate() {
      const key = document.getElementById('key').value.trim();
      const btn = document.getElementById('activate');
      const err = document.getElementById('error');
      if (!key) { err.textContent = 'Please enter a license key'; return; }
      btn.disabled = true;
      btn.textContent = 'Activating...';
      err.textContent = '';
      try {
        const result = await window.licenseAPI.activate(key);
        if (result.activated) {
          btn.textContent = '✓ Activated';
          err.style.color = '#22c55e';
          err.textContent = 'License activated successfully!';
          setTimeout(() => window.licenseAPI.close(), 800);
        } else {
          err.textContent = result.error || 'Activation failed';
          btn.disabled = false;
          btn.textContent = 'Activate';
        }
      } catch (e) {
        err.textContent = e.message || 'Network error — check connection';
        btn.disabled = false;
        btn.textContent = 'Activate';
      }
    }
    document.getElementById('key').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doActivate();
    });
  </script>
</body>
</html>`;

    activationWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    // IPC for activation result
    const handler = (_, result) => {
      if (result.activated) {
        if (activationWindow && !activationWindow.isDestroyed()) {
          activationWindow.close();
        }
        activationWindow = null;
        ipcMain.removeListener('license-activation-result', handler);
        resolve(true);
      }
    };
    ipcMain.on('license-activation-result', handler);

    activationWindow.on('closed', () => {
      activationWindow = null;
      ipcMain.removeListener('license-activation-result', handler);
      resolve(false); // User closed without activating
    });
  });
}

module.exports = { createActivationWindow };
