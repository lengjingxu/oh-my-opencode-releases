const { app } = require('electron');
const path = require('path');

let mainWindow = null;
let clientWindow = null;
let opencodeServerProcess = null;
let opencodeServerPort = null;
let opencodeServerPassword = null;
let opencodeServerCwd = null;
let feishuBotProcess = null;

const APP_DIR = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');

function getAppDir() { return APP_DIR; }
function getMainWindow() { return mainWindow; }
function setMainWindow(win) { mainWindow = win; }
function getClientWindow() { return clientWindow; }
function setClientWindow(win) { clientWindow = win; }

function getServerState() {
  return {
    process: opencodeServerProcess,
    port: opencodeServerPort,
    password: opencodeServerPassword,
    cwd: opencodeServerCwd
  };
}

function setServerState({ process, port, password, cwd }) {
  if (process !== undefined) opencodeServerProcess = process;
  if (port !== undefined) opencodeServerPort = port;
  if (password !== undefined) opencodeServerPassword = password;
  if (cwd !== undefined) opencodeServerCwd = cwd;
}

function clearServerState() {
  opencodeServerProcess = null;
  opencodeServerPort = null;
  opencodeServerPassword = null;
  opencodeServerCwd = null;
}

function getFeishuBotProcess() { return feishuBotProcess; }
function setFeishuBotProcess(proc) { feishuBotProcess = proc; }

module.exports = {
  getAppDir,
  getMainWindow, setMainWindow,
  getClientWindow, setClientWindow,
  getServerState, setServerState, clearServerState,
  getFeishuBotProcess, setFeishuBotProcess
};
