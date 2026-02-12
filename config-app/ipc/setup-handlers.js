const { ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');
const {
  CONFIG_DIR, CONFIG_APP_DIR, AUTH_DIR, SKILLS_DIR, HOOKS_DIR, CREDENTIALS_PATH,
  ensureDir
} = require('../lib/config-service');
const { copyDirSync, matchModelsToAgents, applyModelMapping } = require('../lib/utils');
const { getAppDir } = require('./shared-state');

function installSkills() {
  const skillsSourceDir = path.join(getAppDir(), 'skills');
  if (fs.existsSync(skillsSourceDir)) {
    ensureDir(SKILLS_DIR);
    copyDirSync(skillsSourceDir, SKILLS_DIR);
    console.log('[startup] Skills installed from:', skillsSourceDir, 'to:', SKILLS_DIR);
    return true;
  } else {
    console.log('[startup] Skills source dir not found:', skillsSourceDir);
    return false;
  }
}

function applyTechStack(frontendFile, backendFile, designStyle, colorPalette) {
  const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  let promptAppend = '';

  if (designStyle) {
    const stylesPath = path.join(getAppDir(), 'templates', 'design-styles.json');
    if (fs.existsSync(stylesPath)) {
      const styles = JSON.parse(fs.readFileSync(stylesPath, 'utf-8'));
      const style = styles.styles.find(s => s.id === designStyle);
      const palette = colorPalette ? styles.color_palettes.find(p => p.id === colorPalette) : null;

      if (style) {
        promptAppend += `## 设计风格要求\n`;
        promptAppend += `- 风格：${style.name}\n`;
        promptAppend += `- 特点：${style.description}\n`;
        promptAppend += `- 关键词：${style.keywords}\n`;
        promptAppend += `- 使用 /ui-ux-pro-max skill 获取详细设计指南\n\n`;
      }

      if (palette) {
        promptAppend += `## 配色方案\n`;
        promptAppend += `- 方案：${palette.name}\n`;
        promptAppend += `- 主色：${palette.colors.primary}\n`;
        promptAppend += `- 辅色：${palette.colors.secondary}\n`;
        promptAppend += `- 强调色：${palette.colors.accent}\n`;
        promptAppend += `- 背景色：${palette.colors.background}\n`;
        promptAppend += `- 文字色：${palette.colors.text}\n\n`;
      }
    }
  }

  if (frontendFile && fs.existsSync(frontendFile)) {
    const frontend = JSON.parse(fs.readFileSync(frontendFile, 'utf-8'));
    promptAppend += (frontend.prompt_append || '');
  }

  if (backendFile && fs.existsSync(backendFile)) {
    const backend = JSON.parse(fs.readFileSync(backendFile, 'utf-8'));
    if (promptAppend) {
      promptAppend += '\n\n' + (backend.prompt_append || '');
    } else {
      promptAppend = backend.prompt_append || '';
    }
  }

  if (promptAppend && config.categories && config.categories['visual-engineering']) {
    config.categories['visual-engineering'].prompt_append = promptAppend;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function register() {
  ipcMain.handle('check-install-status', async () => {
    const status = {
      opencode: false,
      ohMyOpencode: false,
      configExists: false,
      needsSetup: true,
      uiuxProMax: false,
      imageGenerator: false
    };

    try {
      execSync('which opencode', { stdio: 'pipe' });
      status.opencode = true;
    } catch (e) {}

    try {
      const omoConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
      if (fs.existsSync(omoConfigPath)) {
        status.ohMyOpencode = true;
      }
    } catch (e) {}

    status.configExists = fs.existsSync(path.join(CONFIG_DIR, 'oh-my-opencode.json'));

    const uiuxSkillPath = path.join(CONFIG_DIR, 'skills', 'ui-ux-pro-max');
    const uiuxSkillPath2 = path.join(os.homedir(), '.claude', 'skills', 'ui-ux-pro-max');
    status.uiuxProMax = fs.existsSync(uiuxSkillPath) || fs.existsSync(uiuxSkillPath2);

    const imageGenSkillPath = path.join(CONFIG_DIR, 'skills', 'image-generator');
    const imageGenSkillPath2 = path.join(os.homedir(), '.claude', 'skills', 'image-generator');
    status.imageGenerator = fs.existsSync(imageGenSkillPath) || fs.existsSync(imageGenSkillPath2);

    status.needsSetup = !status.opencode || !status.configExists;

    return status;
  });

  ipcMain.handle('install-opencode', async () => {
    return new Promise((resolve) => {
      const cmd = 'curl -fsSL https://opencode.ai/install | bash';
      exec(cmd, { timeout: 120000 }, (error) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('install-oh-my-opencode', async () => {
    return new Promise((resolve) => {
      exec('bunx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no', (error) => {
        if (error) {
          exec('npx oh-my-opencode install --no-tui --claude=no --gemini=no --copilot=no', (error2) => {
            if (error2) {
              resolve({ success: false, error: error2.message });
            } else {
              resolve({ success: true });
            }
          });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('install-plugins', async () => {
    const plugins = ['opencode-notificator', 'opencode-supermemory', 'opencode-dynamic-context-pruning'];
    const results = [];

    for (const plugin of plugins) {
      try {
        await new Promise((resolve, reject) => {
          exec(`opencode plugin add ${plugin}`, { timeout: 30000 }, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        results.push({ plugin, success: true });
      } catch (e) {
        console.log(`[install-plugins] Failed to install ${plugin}:`, e.message);
        results.push({ plugin, success: false, error: e.message });
      }
    }

    return results;
  });

  ipcMain.handle('install-uiux-skill', async () => {
    return new Promise((resolve) => {
      const cmd = 'npx uipro init --ai opencode --yes 2>/dev/null || bunx uipro init --ai opencode --yes 2>/dev/null';
      exec(cmd, { timeout: 60000 }, (error) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('install-skills', async () => {
    try {
      const result = installSkills();
      return { success: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  registerSetupConfig();
  registerConfigReaders();
}

function registerSetupConfig() {
  ipcMain.handle('setup-config', async (event, options) => {
    try {
      ensureDir(CONFIG_DIR);
      ensureDir(SKILLS_DIR);
      ensureDir(HOOKS_DIR);

      const templatesDir = path.join(getAppDir(), 'templates');
      const skillsSourceDir = path.join(getAppDir(), 'skills');
      const hooksSourceDir = path.join(getAppDir(), 'hooks');
      const techStacksDir = path.join(getAppDir(), 'tech-stacks');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupDir = path.join(CONFIG_DIR, `backup-${timestamp}`);

      const filesToBackup = ['oh-my-opencode.json', 'opencode.json', 'AGENTS.md'];

      let hasExistingConfig = false;
      for (const file of filesToBackup) {
        if (fs.existsSync(path.join(CONFIG_DIR, file))) {
          hasExistingConfig = true;
          break;
        }
      }

      if (hasExistingConfig) {
        fs.mkdirSync(backupDir, { recursive: true });
        for (const file of filesToBackup) {
          const srcPath = path.join(CONFIG_DIR, file);
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(backupDir, file));
          }
        }
      }

      fs.mkdirSync(CONFIG_DIR, { recursive: true });
      fs.mkdirSync(SKILLS_DIR, { recursive: true });
      fs.mkdirSync(HOOKS_DIR, { recursive: true });

      console.log('[setup-config] Templates dir:', templatesDir);
      console.log('[setup-config] Tech stacks dir:', techStacksDir);

      if (!fs.existsSync(templatesDir)) {
        return { success: false, error: `模板目录不存在: ${templatesDir}` };
      }

      const ohMyOpencodeTemplate = path.join(templatesDir, 'oh-my-opencode.json');
      const opencodeTemplate = path.join(templatesDir, 'opencode.json');

      if (!fs.existsSync(ohMyOpencodeTemplate)) {
        return { success: false, error: `模板文件不存在: ${ohMyOpencodeTemplate}` };
      }
      if (!fs.existsSync(opencodeTemplate)) {
        return { success: false, error: `模板文件不存在: ${opencodeTemplate}` };
      }

      fs.copyFileSync(ohMyOpencodeTemplate, path.join(CONFIG_DIR, 'oh-my-opencode.json'));
      fs.copyFileSync(opencodeTemplate, path.join(CONFIG_DIR, 'opencode.json'));

      ensureDir(CONFIG_APP_DIR);
      const credentialsTemplate = path.join(templatesDir, 'credentials.json.template');
      if (!fs.existsSync(CREDENTIALS_PATH) && fs.existsSync(credentialsTemplate)) {
        fs.copyFileSync(credentialsTemplate, CREDENTIALS_PATH);
      }

      const agentsMdTemplate = path.join(templatesDir, 'AGENTS.md.template');
      if (fs.existsSync(agentsMdTemplate)) {
        let agentsMd = fs.readFileSync(agentsMdTemplate, 'utf-8');
        if (options.nickname) {
          agentsMd = agentsMd.replace(/主人/g, options.nickname);
        }
        fs.writeFileSync(path.join(CONFIG_DIR, 'AGENTS.md'), agentsMd);
      }

      if (fs.existsSync(skillsSourceDir)) {
        console.log('[setup-config] Copying skills from:', skillsSourceDir, 'to:', SKILLS_DIR);
        copyDirSync(skillsSourceDir, SKILLS_DIR);
        console.log('[setup-config] Skills copied successfully');
      } else {
        console.log('[setup-config] Skills source dir not found:', skillsSourceDir);
      }

      if (fs.existsSync(hooksSourceDir)) {
        copyDirSync(hooksSourceDir, HOOKS_DIR);
        const notifyScript = path.join(HOOKS_DIR, 'notify.sh');
        if (fs.existsSync(notifyScript)) {
          fs.chmodSync(notifyScript, '755');
        }
      }

      if ((options.frontend || options.designStyle) && fs.existsSync(techStacksDir)) {
        const frontendFile = options.frontend
          ? path.join(techStacksDir, 'frontend', `${options.frontend}.json`)
          : null;
        const backendFile = options.backend
          ? path.join(techStacksDir, 'backend', `${options.backend}.json`)
          : null;

        applyTechStack(
          frontendFile && fs.existsSync(frontendFile) ? frontendFile : null,
          backendFile && fs.existsSync(backendFile) ? backendFile : null,
          options.designStyle || null,
          options.colorPalette || null
        );
      }

      if (options.apiKey) {
        let cred = {};
        if (fs.existsSync(CREDENTIALS_PATH)) {
          cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        }
        cred.model_service = cred.model_service || {};
        cred.model_service.api_key = options.apiKey;
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));

        fs.mkdirSync(AUTH_DIR, { recursive: true });
        const authPath = path.join(AUTH_DIR, 'auth.json');
        let auth = {};
        if (fs.existsSync(authPath)) {
          try {
            auth = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
          } catch (e) {
            auth = {};
          }
        }

        const providerName = (options.providerName || 'unified-proxy').trim().toLowerCase().replace(/\s+/g, '-');
        auth[providerName] = {
          type: 'api',
          key: options.apiKey
        };
        fs.writeFileSync(authPath, JSON.stringify(auth, null, 2));
      }

      if (options.baseURL || options.providerName) {
        const opencodeConfigPath = path.join(CONFIG_DIR, 'opencode.json');
        const ohMyConfigPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');

        if (fs.existsSync(opencodeConfigPath)) {
          const config = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));
          const providerName = (options.providerName || 'unified-proxy').trim().toLowerCase().replace(/\s+/g, '-');
          const baseURL = (options.baseURL || '').trim().replace(/\/+$/, '');

          config.provider = config.provider || {};

          if (config.provider['unified-proxy'] && providerName !== 'unified-proxy') {
            config.provider[providerName] = config.provider['unified-proxy'];
            delete config.provider['unified-proxy'];
          }

          if (config.provider[providerName]) {
            if (baseURL) {
              config.provider[providerName].options = config.provider[providerName].options || {};
              config.provider[providerName].options.baseURL = baseURL;
            }
            config.provider[providerName].name = options.providerName || '统一代理服务';
          }

          fs.writeFileSync(opencodeConfigPath, JSON.stringify(config, null, 2));

          if (fs.existsSync(ohMyConfigPath)) {
            let ohMyConfig = JSON.parse(fs.readFileSync(ohMyConfigPath, 'utf-8'));

            const models = config.provider[providerName]?.models || {};
            const modelMapping = matchModelsToAgents(providerName, models);

            if (modelMapping) {
              ohMyConfig = applyModelMapping(ohMyConfig, modelMapping);
            } else if (providerName !== 'unified-proxy') {
              let ohMyContent = JSON.stringify(ohMyConfig);
              ohMyContent = ohMyContent.replace(/unified-proxy\//g, providerName + '/');
              ohMyConfig = JSON.parse(ohMyContent);
            }

            fs.writeFileSync(ohMyConfigPath, JSON.stringify(ohMyConfig, null, 2));
          }
        }
      }

      if (options.webhook && options.webhook.enabled && options.webhook.url) {
        let cred = {};
        if (fs.existsSync(CREDENTIALS_PATH)) {
          cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        }
        cred.notification = {
          webhook: {
            enabled: true,
            platform: options.webhook.platform || 'feishu',
            webhook_url: options.webhook.url,
            secret: options.webhook.secret || ''
          }
        };
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));

        const hookPath = path.join(HOOKS_DIR, 'notify.sh');
        if (fs.existsSync(hookPath)) {
          fs.chmodSync(hookPath, '755');
        }
      }

      if (options.database && options.database.enabled) {
        let cred = {};
        if (fs.existsSync(CREDENTIALS_PATH)) {
          cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        }
        cred.database = cred.database || {};
        cred.database.default = {
          type: options.database.type || 'mysql',
          host: options.database.host,
          port: options.database.port,
          user: options.database.username,
          password: options.database.password,
          database: options.database.database
        };
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
      }

      if (options.deploy) {
        let cred = {};
        if (fs.existsSync(CREDENTIALS_PATH)) {
          cred = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
        }
        cred.deploy = cred.deploy || {};

        if (options.deploy.fc && options.deploy.fc.enabled) {
          cred.deploy.aliyun_fc = {
            enabled: true,
            access_key_id: options.deploy.fc.accessKeyId,
            access_key_secret: options.deploy.fc.accessKeySecret,
            region: options.deploy.fc.region || 'cn-shanghai'
          };
        }

        if (options.deploy.docker && options.deploy.docker.enabled) {
          cred.deploy.docker = {
            enabled: true,
            registry: options.deploy.docker.registry,
            namespace: options.deploy.docker.namespace || '',
            username: options.deploy.docker.username,
            password: options.deploy.docker.password
          };
        }

        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(cred, null, 2));
      }

      return { success: true, backupDir: hasExistingConfig ? backupDir : null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

function registerConfigReaders() {
  ipcMain.handle('get-opencode-config', async () => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    try {
      if (fs.existsSync(configPath)) {
        return { success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
      }
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-oh-my-opencode-config', async () => {
    const configPath = path.join(CONFIG_DIR, 'oh-my-opencode.json');
    try {
      if (fs.existsSync(configPath)) {
        return { success: true, data: JSON.parse(fs.readFileSync(configPath, 'utf-8')) };
      }
      return { success: true, data: {} };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('save-opencode-config', async (event, config) => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    try {
      let existingConfig = {};
      if (fs.existsSync(configPath)) {
        existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      const mergedConfig = { ...existingConfig, ...config };
      fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('launch-opencode', async (event, mode) => {
    return new Promise((resolve) => {
      let cmd;
      switch (mode) {
        case 'web':
          cmd = 'opencode web';
          break;
        case 'tui':
          cmd = 'opencode';
          break;
        case 'serve':
          cmd = 'opencode serve';
          break;
        default:
          cmd = 'opencode';
      }

      exec(cmd, { detached: true, stdio: 'ignore' }, (error) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  });

  ipcMain.handle('open-web-ui', async () => {
    const configPath = path.join(CONFIG_DIR, 'opencode.json');
    let port = 4096;

    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.server && config.server.port) {
          port = config.server.port;
        }
      }
    } catch (e) {}

    shell.openExternal(`http://localhost:${port}`);
  });
}

module.exports = { register, installSkills };
