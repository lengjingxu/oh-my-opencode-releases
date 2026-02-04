const fs = require('fs');
const path = require('path');
const { CONFIG_DIR, readJsonFile, writeJsonFile, ensureDir } = require('./config-service');

const HOSTED_CONFIG_PATH = path.join(CONFIG_DIR, 'hosted-service.json');

const DEFAULT_HOSTED_CONFIG = {
  enabled: false,
  baseUrl: 'http://8.153.201.122:3000',
  username: '',
  apiKey: '',
  plan: 'free',
  lastLogin: null
};

const PLAN_MODELS = {
  free: {
    primary: 'deepseek-chat',
    secondary: 'deepseek-chat',
    fast: 'gemini-2.0-flash',
    multimodal: 'gemini-2.0-flash',
    reasoning: 'deepseek-reasoner'
  },
  pro: {
    primary: 'claude-sonnet-4-20250514',
    secondary: 'claude-sonnet-4-20250514',
    fast: 'claude-haiku-3-5-20241022',
    multimodal: 'gemini-2.5-pro-preview-05-06',
    reasoning: 'claude-opus-4-20250514'
  },
  ultimate: {
    primary: 'claude-opus-4-20250514',
    secondary: 'claude-sonnet-4-20250514',
    fast: 'claude-haiku-3-5-20241022',
    multimodal: 'gemini-2.5-pro-preview-05-06',
    reasoning: 'o1'
  }
};

const AGENT_MODEL_MAPPING = {
  sisyphus: 'primary',
  oracle: 'reasoning',
  prometheus: 'primary',
  explore: 'fast',
  librarian: 'multimodal',
  'multimodal-looker': 'multimodal',
  metis: 'primary',
  momus: 'reasoning',
  'sisyphus-junior': 'secondary'
};

const CATEGORY_MODEL_MAPPING = {
  'visual-engineering': 'multimodal',
  'ultrabrain': 'reasoning',
  'deep': 'reasoning',
  'artistry': 'multimodal',
  'quick': 'fast',
  'unspecified-low': 'fast',
  'unspecified-high': 'primary',
  'writing': 'secondary'
};

function getHostedConfig() {
  const config = readJsonFile(HOSTED_CONFIG_PATH);
  return { ...DEFAULT_HOSTED_CONFIG, ...config };
}

function saveHostedConfig(config) {
  const current = getHostedConfig();
  const updated = { ...current, ...config };
  writeJsonFile(HOSTED_CONFIG_PATH, updated);
  return updated;
}

function getModelsForPlan(plan) {
  return PLAN_MODELS[plan] || PLAN_MODELS.free;
}

function buildAgentModels(plan, providerName = 'hosted') {
  const models = getModelsForPlan(plan);
  const agentModels = {};
  
  for (const [agent, modelType] of Object.entries(AGENT_MODEL_MAPPING)) {
    const modelName = models[modelType] || models.primary;
    agentModels[agent] = `${providerName}/${modelName}`;
  }
  
  return agentModels;
}

function buildCategoryModels(plan, providerName = 'hosted') {
  const models = getModelsForPlan(plan);
  const categoryModels = {};
  
  for (const [category, modelType] of Object.entries(CATEGORY_MODEL_MAPPING)) {
    const modelName = models[modelType] || models.primary;
    categoryModels[category] = `${providerName}/${modelName}`;
  }
  
  return categoryModels;
}

function buildHostedProvider(baseUrl, apiKey) {
  const allModels = new Set();
  Object.values(PLAN_MODELS).forEach(planModels => {
    Object.values(planModels).forEach(model => allModels.add(model));
  });

  return {
    name: 'Oh-My-OpenCode 托管服务',
    type: 'openai',
    baseUrl: baseUrl.replace(/\/$/, '') + '/v1',
    apiKey: apiKey,
    models: Object.fromEntries([...allModels].map(m => [m, {}]))
  };
}

function applyHostedServiceConfig(opencodeConfig, ohMyConfig, hostedConfig) {
  const { baseUrl, apiKey, plan, enabled } = hostedConfig;
  
  if (!enabled || !apiKey) {
    return { opencodeConfig, ohMyConfig };
  }

  opencodeConfig.providers = opencodeConfig.providers || {};
  opencodeConfig.providers.hosted = buildHostedProvider(baseUrl, apiKey);

  const agentModels = buildAgentModels(plan, 'hosted');
  const categoryModels = buildCategoryModels(plan, 'hosted');

  ohMyConfig.agents = ohMyConfig.agents || {};
  for (const [agent, model] of Object.entries(agentModels)) {
    ohMyConfig.agents[agent] = ohMyConfig.agents[agent] || {};
    ohMyConfig.agents[agent].model = model;
  }

  ohMyConfig.categories = ohMyConfig.categories || {};
  for (const [category, model] of Object.entries(categoryModels)) {
    ohMyConfig.categories[category] = ohMyConfig.categories[category] || {};
    ohMyConfig.categories[category].model = model;
  }

  return { opencodeConfig, ohMyConfig };
}

function removeHostedServiceConfig(opencodeConfig, ohMyConfig) {
  if (opencodeConfig.providers?.hosted) {
    delete opencodeConfig.providers.hosted;
  }

  if (ohMyConfig.agents) {
    for (const agent of Object.keys(ohMyConfig.agents)) {
      if (ohMyConfig.agents[agent]?.model?.startsWith('hosted/')) {
        delete ohMyConfig.agents[agent].model;
      }
    }
  }

  if (ohMyConfig.categories) {
    for (const category of Object.keys(ohMyConfig.categories)) {
      if (ohMyConfig.categories[category]?.model?.startsWith('hosted/')) {
        delete ohMyConfig.categories[category].model;
      }
    }
  }

  return { opencodeConfig, ohMyConfig };
}

function isHostedServiceEnabled() {
  const config = getHostedConfig();
  return config.enabled && !!config.apiKey;
}

module.exports = {
  HOSTED_CONFIG_PATH,
  DEFAULT_HOSTED_CONFIG,
  PLAN_MODELS,
  AGENT_MODEL_MAPPING,
  CATEGORY_MODEL_MAPPING,
  
  getHostedConfig,
  saveHostedConfig,
  getModelsForPlan,
  buildAgentModels,
  buildCategoryModels,
  buildHostedProvider,
  applyHostedServiceConfig,
  removeHostedServiceConfig,
  isHostedServiceEnabled
};
