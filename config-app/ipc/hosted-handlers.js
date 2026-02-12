const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { CONFIG_DIR } = require('../lib/config-service');
const hostedService = require('../lib/hosted-service');
const hostedConfig = require('../lib/hosted-config');

function register() {
  ipcMain.handle('hosted-set-base-url', async (event, url) => {
    hostedService.setBaseUrl(url);
    return { success: true };
  });

  ipcMain.handle('hosted-login', async (event, username, password) => {
    try {
      const result = await hostedService.login(username, password);
      if (result.success !== false) {
        hostedConfig.saveHostedConfig({ username, lastLogin: new Date().toISOString() });
      }
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-register', async (event, username, password, email, code, aff) => {
    try {
      const result = await hostedService.register(username, password, email, code, aff);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-logout', async () => {
    try {
      await hostedService.logout();
      hostedConfig.saveHostedConfig({ enabled: false, apiKey: '' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-current-user', async () => {
    try {
      const result = await hostedService.getCurrentUser();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-send-verification-code', async (event, email) => {
    try {
      const result = await hostedService.sendVerificationCode(email);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-tokens', async (event, page, pageSize) => {
    try {
      const result = await hostedService.getTokens(page, pageSize);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-create-token', async (event, name, quota, unlimited, expired) => {
    try {
      const result = await hostedService.createToken(name, quota, unlimited, expired);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-delete-token', async (event, id) => {
    try {
      const result = await hostedService.deleteToken(id);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-available-models', async () => {
    try {
      const result = await hostedService.getAvailableModels();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-config', async () => {
    try {
      return { success: true, data: hostedConfig.getHostedConfig() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-save-config', async (event, config) => {
    try {
      return { success: true, data: hostedConfig.saveHostedConfig(config) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-plan-models', async (event, plan) => {
    try {
      return { success: true, data: hostedConfig.getModelsForPlan(plan) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-apply-config', async (event, apiKey, plan) => {
    try {
      const config = hostedConfig.getHostedConfig();
      config.apiKey = apiKey;
      config.plan = plan || config.plan || 'free';
      config.enabled = true;
      hostedConfig.saveHostedConfig(config);

      let remoteConfig = null;
      try {
        const modelsResult = await hostedService.getAvailableModels();
        if (modelsResult && modelsResult.data) {
          remoteConfig = { baseUrl: config.baseUrl, models: modelsResult.data.map(m => m.id || m) };
        }
      } catch (e) {
        console.error('[hosted-apply] Failed to fetch models, using fallback:', e.message);
      }

      const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
      const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
      let opencodeConfig = fs.existsSync(opencodeConfigPath) ? JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8')) : {};
      let ohMyConfig = fs.existsSync(ohMyConfigPath) ? JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8')) : {};

      const result = hostedConfig.applyHostedServiceConfig(opencodeConfig, ohMyConfig, config, remoteConfig);
      fs.writeFileSync(opencodeConfigPath, JSON.stringify(result.opencodeConfig, null, 2));
      fs.writeFileSync(ohMyConfigPath, JSON.stringify(result.ohMyConfig, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-remove-config', async () => {
    try {
      hostedConfig.saveHostedConfig({ enabled: false, apiKey: '' });
      const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
      const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
      let opencodeConfig = fs.existsSync(opencodeConfigPath) ? JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8')) : {};
      let ohMyConfig = fs.existsSync(ohMyConfigPath) ? JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8')) : {};
      const result = hostedConfig.removeHostedServiceConfig(opencodeConfig, ohMyConfig);
      fs.writeFileSync(opencodeConfigPath, JSON.stringify(result.opencodeConfig, null, 2));
      fs.writeFileSync(ohMyConfigPath, JSON.stringify(result.ohMyConfig, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-usage-logs', async (event, page, pageSize) => {
    try {
      const result = await hostedService.getUsageLogs(page, pageSize);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-redeem-code', async (event, code) => {
    try {
      const result = await hostedService.redeemCode(code);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('hosted-get-statistics', async (event, startTime, endTime) => {
    try {
      const result = await hostedService.getStatistics(startTime, endTime);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { register };