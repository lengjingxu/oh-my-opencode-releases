const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { CONFIG_DIR } = require('../lib/config-service');
const hostedConfig = require('../lib/hosted-config');

function register() {
  ipcMain.handle('get-agent-recommendations', async () => {
    return {
      agents: hostedConfig.AGENT_RECOMMENDATIONS,
      categories: hostedConfig.CATEGORY_RECOMMENDATIONS
    };
  });

  ipcMain.handle('get-available-models', async () => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    try {
      if (!fs.existsSync(configPath)) {
        return { success: false, error: 'opencode.json not found' };
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const providers = config.provider || {};
      const models = [];

      for (const [providerName, providerConfig] of Object.entries(providers)) {
        const providerModels = providerConfig.models || {};
        for (const modelId of Object.keys(providerModels)) {
          models.push({
            id: `${providerName}/${modelId}`,
            name: providerModels[modelId].name || modelId,
            provider: providerName
          });
        }
      }
      return { success: true, models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-agent-models', async (event, agentModels, categoryModels) => {
    const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    try {
      if (!fs.existsSync(configPath)) {
        return { success: false, error: 'oh-my-opencode.json not found' };
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      if (agentModels) {
        config.agents = config.agents || {};
        for (const [agent, model] of Object.entries(agentModels)) {
          config.agents[agent] = config.agents[agent] || {};
          config.agents[agent].model = model;
        }
      }

      if (categoryModels) {
        config.categories = config.categories || {};
        for (const [cat, model] of Object.entries(categoryModels)) {
          config.categories[cat] = config.categories[cat] || {};
          config.categories[cat].model = model;
        }
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-compaction-model', async (event, model) => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    try {
      if (!fs.existsSync(configPath)) {
        return { success: false, error: 'opencode.json not found' };
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      if (model) {
        if (!config.agent) config.agent = {};
        config.agent.compaction = { model };
      } else {
        if (config.agent && config.agent.compaction) {
          delete config.agent.compaction;
          if (Object.keys(config.agent).length === 0) delete config.agent;
        }
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-compaction-model', async () => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    try {
      if (!fs.existsSync(configPath)) {
        return { success: true, model: '' };
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const compaction = config.agent?.compaction?.model;
      if (typeof compaction === 'string' && compaction.length > 0) {
        return { success: true, model: compaction };
      }
      if (compaction && compaction.providerID && compaction.modelID) {
        return { success: true, model: `${compaction.providerID}/${compaction.modelID}` };
      }
      return { success: true, model: '' };
    } catch (error) {
      return { success: false, error: error.message, model: '' };
    }
  });
}

module.exports = { register };
