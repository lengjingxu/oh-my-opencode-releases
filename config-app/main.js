const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initAutoUpdater } = require('./updater');
const { setMainWindow } = require('./ipc/shared-state');

const configHandlers = require('./ipc/config-handlers');
const credentialHandlers = require('./ipc/credential-handlers');
const modelHandlers = require('./ipc/model-handlers');
const serverHandlers = require('./ipc/server-handlers');
const webhookHandlers = require('./ipc/webhook-handlers');
const hostedHandlers = require('./ipc/hosted-handlers');
const feishuHandlers = require('./ipc/feishu-handlers');
const setupHandlers = require('./ipc/setup-handlers');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
  });

  mainWindow.loadFile('src/index.html');
  setMainWindow(mainWindow);
}

function registerAllHandlers() {
  configHandlers.register();
  credentialHandlers.register();
  modelHandlers.register();
  serverHandlers.register();
  webhookHandlers.register();
  hostedHandlers.register();
  feishuHandlers.register();
  setupHandlers.register();
}

app.whenReady().then(() => {
  setupHandlers.installSkills();
  registerAllHandlers();
  createWindow();
  initAutoUpdater(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  serverHandlers.stopOpencodeServer();
});
