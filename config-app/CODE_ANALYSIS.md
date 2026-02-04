# 代码分析报告

## 项目信息
- 项目名称: super-opencode (Super OpenCode 配置管理中心)
- 项目类型: Electron 桌面应用
- 分析时间: 2026-02-04T10:15:00
- 运行时: Node.js + Electron
- 测试框架: Jest (单元测试) + Playwright (E2E测试)

## 源代码文件清单

### lib/utils.js
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| copyDirSync | function | (src: string, dest: string) => void | 中 | fs, path |
| matchModelsToAgents | function | (providerName: string, models: object) => object\|null | 高 | 无 |
| applyModelMapping | function | (ohMyConfig: object, modelMapping: object) => object | 中 | 无 |
| readCredentials | function | (credentialsPath: string) => object | 低 | fs |
| writeCredentials | function | (credentialsPath: string, data: object) => void | 低 | fs |
| maskSecret | function | (secret: string, visibleChars?: number) => string | 低 | 无 |

### lib/config-service.js
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| CONFIG_DIR | constant | string | - | os, path |
| CONFIG_APP_DIR | constant | string | - | path |
| SKILLS_DIR | constant | string | - | path |
| CREDENTIALS_PATH | constant | string | - | path |
| ensureDir | function | (dir: string) => void | 低 | fs |
| readJsonFile | function | (filePath: string) => object\|null | 低 | fs |
| writeJsonFile | function | (filePath: string, data: object) => void | 低 | fs |
| getCredentials | function | () => object | 低 | 内部依赖 readJsonFile |
| saveCredentials | function | (data: object) => void | 低 | 内部依赖 writeJsonFile |
| updateCredentials | function | (key: string, value: any) => object | 低 | 内部依赖 |
| getFcConfig | function | () => object | 中 | 内部依赖 getCredentials |
| saveFcConfig | function | (config: object) => void | 高 | 内部依赖 |
| getSqlConfig | function | () => object | 低 | 内部依赖 getCredentials |
| saveSqlConfig | function | (config: object) => void | 高 | 内部依赖 |
| getImageGeneratorConfig | function | () => object | 低 | 内部依赖 getCredentials |
| saveImageGeneratorConfig | function | (serviceUrl: string, apiKey: string) => void | 低 | 内部依赖 |
| checkSkillInstalled | function | (skillName: string) => boolean | 低 | fs, path |
| createBackup | function | (configType: string, data: object) => object | 中 | fs, path |
| listBackups | function | (configType: string) => array | 中 | fs |
| restoreBackup | function | (backupName: string) => object | 高 | fs, 内部依赖 |

### main.js
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| (Electron主进程) | module | N/A | 高 | electron, fs, path, child_process |

**IPC Handlers (共 30+ 个):**
- read-config, write-config
- read-agents-md, write-agents-md
- check-install-status, install-opencode, install-oh-my-opencode
- install-plugins, install-uiux-skill, setup-config
- launch-opencode, open-web-ui, open-config-dir
- get-opencode-config, save-opencode-config
- get-oh-my-opencode-config
- load-all-configs, save-config-with-backup
- list-backups, restore-backup
- check-skill-installed, install-image-generator-skill
- get-fc-config, save-fc-config
- get-sql-config, save-sql-config
- get-agent-recommendations, get-available-models, save-agent-models
- get-webhook-config, save-webhook-plugin, test-webhook
- read-skill-config, write-skill-config, install-skills

### preload.js
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| configAPI | contextBridge | object (22 methods) | 低 | electron |
| api | contextBridge | object (35 methods) | 低 | electron |

## 关键用户流程

1. **配置初始化流程**
   - 入口: main.js (check-install-status)
   - 涉及模块: main.js, lib/config-service.js
   - 步骤: 检查安装状态 → 安装 opencode → 安装 oh-my-opencode → 安装插件 → 配置设置

2. **凭证管理流程**
   - 入口: main.js (get-fc-config, save-fc-config)
   - 涉及模块: lib/config-service.js, lib/utils.js
   - 步骤: 读取凭证 → 脱敏显示 → 用户编辑 → 保存凭证(保留原密码)

3. **备份恢复流程**
   - 入口: main.js (save-config-with-backup, list-backups, restore-backup)
   - 涉及模块: lib/config-service.js
   - 步骤: 创建备份 → 列出备份 → 选择恢复

4. **模型配置流程**
   - 入口: main.js (get-available-models, save-agent-models)
   - 涉及模块: lib/utils.js (matchModelsToAgents, applyModelMapping)
   - 步骤: 获取可用模型 → 匹配到代理 → 应用映射 → 保存配置

## 测试覆盖现状

### 已有测试文件
| 文件 | 测试数量 | 覆盖模块 |
|------|----------|----------|
| __tests__/utils.test.js | 27 | lib/utils.js |
| __tests__/config-service.test.js | 27 | lib/config-service.js |

### 未覆盖模块
| 模块 | 原因 | 建议 |
|------|------|------|
| main.js | Electron 主进程，需要 mock | 集成测试或 E2E 测试 |
| preload.js | contextBridge API，需要 Electron 环境 | E2E 测试 |

## 统计
- 总源文件数: 4
- 总函数数: 26 (不含 IPC handlers)
- 总 IPC handlers: 30+
- 高复杂度函数: 5 (matchModelsToAgents, saveFcConfig, saveSqlConfig, restoreBackup, main.js整体)
- 已有测试用例: 54
- 测试通过率: 100%
