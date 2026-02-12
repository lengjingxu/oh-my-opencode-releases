const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  CONFIG_DIR, SKILLS_DIR,
  getFcConfigMasked, saveFcConfig,
  getSqlConfigMasked, saveSqlConfig,
  saveImageGeneratorConfig
} = require('../lib/config-service');

function register() {
  ipcMain.handle('get-fc-config', async () => {
    try {
      return { success: true, data: getFcConfigMasked() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-fc-config', async (event, config) => {
    try {
      saveFcConfig(config);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-sql-config', async () => {
    try {
      return { success: true, data: getSqlConfigMasked() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-sql-config', async (event, config) => {
    try {
      saveSqlConfig(config);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-image-generator-skill', async (event, serviceUrl, apiKey) => {
    try {
      saveImageGeneratorConfig(serviceUrl, apiKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('check-skill-installed', async (event, skillName) => {
    const skillPath1 = path.join(CONFIG_DIR, 'skills', skillName);
    const skillPath2 = path.join(os.homedir(), '.claude', 'skills', skillName);
    const installed = fs.existsSync(skillPath1) || fs.existsSync(skillPath2);
    return {
      installed,
      path: installed ? (fs.existsSync(skillPath1) ? skillPath1 : skillPath2) : null
    };
  });
}

module.exports = { register };
