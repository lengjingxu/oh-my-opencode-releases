const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.config', 'opencode');
const CONFIG_APP_DIR = path.join(CONFIG_DIR, 'config-app');
const AUTH_DIR = path.join(os.homedir(), '.local', 'share', 'opencode');
const SKILLS_DIR = path.join(CONFIG_DIR, 'skills');
const HOOKS_DIR = path.join(CONFIG_DIR, 'hooks');
const PLUGINS_DIR = path.join(CONFIG_DIR, 'plugins');
const CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');
const DEFAULT_SERVER_PORT = 4096;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getCredentials() {
  return readJsonFile(CREDENTIALS_PATH) || {};
}

function saveCredentials(data) {
  writeJsonFile(CREDENTIALS_PATH, data);
}

function updateCredentials(key, value) {
  const cred = getCredentials();
  cred[key] = value;
  saveCredentials(cred);
  return cred;
}

function getFcConfig() {
  const cred = getCredentials();
  const fcConfig = cred.deploy?.aliyun_fc || {};
  return {
    accounts: fcConfig.accounts || [],
    default_account: fcConfig.default_account || ''
  };
}

function saveFcConfig(config) {
  const cred = getCredentials();
  cred.deploy = cred.deploy || {};
  
  const existingAccounts = {};
  if (cred.deploy.aliyun_fc?.accounts) {
    cred.deploy.aliyun_fc.accounts.forEach(acc => {
      if (acc.name && acc.access_key_secret) {
        existingAccounts[acc.name] = acc.access_key_secret;
      }
    });
  }
  
  if (config.accounts) {
    config.accounts = config.accounts.map(acc => {
      if (acc.access_key_secret === '••••••••' && acc.name && existingAccounts[acc.name]) {
        return { ...acc, access_key_secret: existingAccounts[acc.name] };
      }
      return acc;
    });
  }
  
  cred.deploy.aliyun_fc = {
    enabled: true,
    accounts: config.accounts || [],
    default_account: config.default_account || ''
  };
  
  saveCredentials(cred);
}

function getSqlConfig() {
  const cred = getCredentials();
  return { connections: cred.database || {} };
}

function saveSqlConfig(config) {
  const cred = getCredentials();
  
  const existingPasswords = {};
  if (cred.database) {
    for (const [key, conn] of Object.entries(cred.database)) {
      if (conn.password) {
        existingPasswords[key] = conn.password;
      }
    }
  }
  
  if (config.connections) {
    for (const [key, conn] of Object.entries(config.connections)) {
      if (conn.password === '••••••••' && existingPasswords[key]) {
        conn.password = existingPasswords[key];
      }
    }
  }
  
  cred.database = config.connections || {};
  saveCredentials(cred);
}

function getImageGeneratorConfig() {
  const cred = getCredentials();
  return cred.image_generator || { enabled: false };
}

function saveImageGeneratorConfig(serviceUrl, apiKey) {
  const cred = getCredentials();
  cred.image_generator = {
    enabled: true,
    api_key: apiKey || '',
    base_url: serviceUrl || 'http://localhost:7860'
  };
  saveCredentials(cred);
}

function checkSkillInstalled(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  return fs.existsSync(skillPath);
}

function getFcConfigMasked() {
  const data = getFcConfig();
  if (data.accounts.length > 0) {
    data.accounts = data.accounts.map(acc => ({
      ...acc,
      access_key_secret: acc.access_key_secret ? '••••••••' : ''
    }));
  }
  return data;
}

function getSqlConfigMasked() {
  const data = getSqlConfig();
  if (data.connections) {
    for (const key of Object.keys(data.connections)) {
      if (data.connections[key].password) {
        data.connections[key].password = '••••••••';
      }
    }
  }
  return data;
}

function getFeishuConfig() {
  const cred = getCredentials();
  const feishuConfig = cred.feishu || {};
  return {
    app_id: feishuConfig.app_id || '',
    app_secret: feishuConfig.app_secret ? '••••••••' : '',
    working_dir: feishuConfig.working_dir || '',
    server_host: feishuConfig.server_host || '127.0.0.1',
    server_port: feishuConfig.server_port || DEFAULT_SERVER_PORT,
    use_server_mode: feishuConfig.use_server_mode !== false
  };
}

function saveFeishuConfig(config) {
  const cred = getCredentials();
  const existingSecret = cred.feishu?.app_secret || '';
  cred.feishu = {
    app_id: config.app_id || '',
    app_secret: config.app_secret === '••••••••' ? existingSecret : (config.app_secret || ''),
    working_dir: config.working_dir || '',
    server_host: config.server_host || '127.0.0.1',
    server_port: config.server_port || DEFAULT_SERVER_PORT,
    use_server_mode: config.use_server_mode !== false
  };
  saveCredentials(cred);
}

function checkPortAvailable(port) {
  const net = require('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

function createBackup(configType, data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(CONFIG_DIR, 'backups');
  ensureDir(backupDir);
  
  const backupName = `${configType}-${timestamp}.json`;
  const backupPath = path.join(backupDir, backupName);
  writeJsonFile(backupPath, data);
  
  return { backupName, backupPath };
}

function listBackups(configType) {
  const backupDir = path.join(CONFIG_DIR, 'backups');
  if (!fs.existsSync(backupDir)) {
    return [];
  }
  
  const files = fs.readdirSync(backupDir);
  return files
    .filter(f => f.startsWith(configType) && f.endsWith('.json'))
    .map(f => {
      const stat = fs.statSync(path.join(backupDir, f));
      return {
        name: f,
        path: path.join(backupDir, f),
        size: stat.size,
        created: stat.mtime
      };
    })
    .sort((a, b) => b.created - a.created);
}

function restoreBackup(backupName) {
  const backupDir = path.join(CONFIG_DIR, 'backups');
  const backupPath = path.join(backupDir, backupName);
  
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }
  
  const data = readJsonFile(backupPath);
  if (!data) {
    throw new Error(`Invalid backup file: ${backupName}`);
  }
  
  const configType = backupName.split('-')[0];
  let targetPath;
  
  if (configType === 'opencode') {
    targetPath = path.join(CONFIG_DIR, 'opencode.json');
  } else if (configType === 'oh') {
    targetPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
  } else if (configType === 'credentials') {
    targetPath = CREDENTIALS_PATH;
  } else {
    throw new Error(`Unknown config type: ${configType}`);
  }
  
  writeJsonFile(targetPath, data);
  return { targetPath, configType };
}

module.exports = {
  CONFIG_DIR,
  CONFIG_APP_DIR,
  AUTH_DIR,
  SKILLS_DIR,
  HOOKS_DIR,
  PLUGINS_DIR,
  CREDENTIALS_PATH,
  DEFAULT_SERVER_PORT,
  ensureDir,
  readJsonFile,
  writeJsonFile,
  getCredentials,
  saveCredentials,
  updateCredentials,
  getFcConfig,
  saveFcConfig,
  getFcConfigMasked,
  getSqlConfig,
  saveSqlConfig,
  getSqlConfigMasked,
  getImageGeneratorConfig,
  saveImageGeneratorConfig,
  getFeishuConfig,
  saveFeishuConfig,
  checkSkillInstalled,
  checkPortAvailable,
  createBackup,
  listBackups,
  restoreBackup
};
