# Oh-My-OpenCode 配置工具说明

## 一、配置文件结构

### 1. opencode.json (`~/.config/opencode/opencode.json`)

OpenCode 官方配置文件，配置工具**可以修改**但需遵循官方 schema。

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "provider/model-name",           // 默认模型
  "plugin": ["oh-my-opencode@latest"],      // 插件列表
  "provider": {                              // 服务商配置
    "provider-name": {
      "name": "provider-name",
      "npm": "@ai-sdk/xxx",
      "options": {
        "baseURL": "https://api.xxx.com",
        "apiKey": "xxx"                      // 敏感信息，实际存在 auth.json
      },
      "models": {
        "model-id": {
          "name": "Model Display Name",
          "attachment": true,
          "variants": { "high": {}, "medium": {}, "low": {} },
          "limit": { "context": 200000, "output": 64000 }
        }
      }
    }
  },
  "mcp": { ... },                            // MCP 服务配置
  "compaction": { "auto": true, "prune": true }
}
```

**配置工具管理的字段：**
- `provider` - 服务商和模型配置
- 其他字段保持不变

---

### 2. oh-my-opencode.json (`~/.config/opencode/oh-my-opencode.json`)

Oh-My-OpenCode 插件配置文件，配置工具**主要管理**此文件。

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",
  "version": "1.0.0",
  
  // 官方字段：Agent 模型配置
  "agents": {
    "sisyphus":          { "model": "provider/model", "prompt_append": "..." },
    "oracle":            { "model": "provider/model", "prompt_append": "..." },
    "prometheus":        { "model": "provider/model", "prompt_append": "..." },
    "explore":           { "model": "provider/model", "prompt_append": "..." },
    "librarian":         { "model": "provider/model", "prompt_append": "..." },
    "multimodal-looker": { "model": "provider/model", "prompt_append": "..." },
    "metis":             { "model": "provider/model", "prompt_append": "..." },
    "momus":             { "model": "provider/model", "prompt_append": "..." }
  },
  
  // 官方字段：Category 模型配置
  "categories": {
    "visual-engineering": { "model": "provider/model", "variant": "high", "prompt_append": "..." },
    "ultrabrain":         { "model": "provider/model", "variant": "xhigh", "prompt_append": "..." },
    "deep":               { "model": "provider/model", "prompt_append": "..." },
    "artistry":           { "model": "provider/model", "variant": "max", "prompt_append": "..." },
    "quick":              { "model": "provider/model", "prompt_append": "..." },
    "unspecified-low":    { "model": "provider/model", "prompt_append": "..." },
    "unspecified-high":   { "model": "provider/model", "variant": "max", "prompt_append": "..." },
    "writing":            { "model": "provider/model", "prompt_append": "..." }
  }
}
```

---

### 3. auth.json (`~/.local/share/opencode/auth.json`)

认证信息存储，配置工具**可以修改**。

```json
{
  "provider-name": {
    "type": "api",
    "key": "api-key-here"
  }
}
```

---

### 4. 配置工具私有配置 (`~/.config/opencode/config-app/`)

配置工具自己的配置，**不侵入**官方配置文件。

```
~/.config/opencode/config-app/
├── credentials.json      # 配置工具保存的凭证信息
└── app-config.json       # 配置工具应用设置
```

---

## 二、前端界面配置项

### Tab 1: 向导 (Wizard)

| 配置项 | UI 元素 | 保存位置 | 更新逻辑 |
|--------|---------|----------|----------|
| 服务商名称 | 输入框 | `opencode.json` → `provider.{name}` | 合并更新 |
| API Base URL | 输入框 | `opencode.json` → `provider.{name}.options.baseURL` | 合并更新 |
| API Key | 输入框 | `auth.json` → `{provider}.key` | 合并更新 |
| 前端框架 | 下拉选择 | `oh-my-opencode.json` → `frontend` | 覆盖 |
| 后端框架 | 下拉选择 | `oh-my-opencode.json` → `backend` | 覆盖 |
| 设计风格 | 下拉选择 | `oh-my-opencode.json` → `designStyle` | 覆盖 |

**联动逻辑：**
- 选择前端/后端/风格 → 自动生成 `prompt_append` → 更新到 `categories.visual-engineering.prompt_append`
- 选择后端 → 自动生成测试要求 → 更新到 `categories.{ultrabrain,quick,deep}.prompt_append`

---

### Tab 2: 服务商配置

| 配置项 | UI 元素 | 保存位置 | 更新逻辑 |
|--------|---------|----------|----------|
| 服务商列表 | 动态表单 | `opencode.json` → `provider` | 合并更新，保留现有字段 |
| 模型列表 | 动态表单 | `opencode.json` → `provider.{name}.models` | 合并更新 |
| API Key | 输入框 | `auth.json` → `{provider}.key` | 合并更新 |

---

### Tab 3: Agent 模型配置

| 配置项 | UI 元素 | 保存位置 | 更新逻辑 |
|--------|---------|----------|----------|
| Agent 模型选择 | 下拉选择 x8 | `oh-my-opencode.json` → `agents.{name}.model` | 合并更新 |
| Category 模型选择 | 下拉选择 x8 | `oh-my-opencode.json` → `categories.{name}.model` | 合并更新 |
| Category 追加提示词 | 文本框 x8 | `oh-my-opencode.json` → `categories.{name}.prompt_append` | 合并更新（非空时） |

**自动匹配逻辑：**
1. 读取 `opencode.json` 中的可用模型
2. 按模型类型匹配：opus → primary, haiku → fast, gemini → multimodal
3. 按 Agent/Category 的 tier 分配推荐模型
4. 用户可手动覆盖

---

### Tab 4: Skills 配置

| 配置项 | UI 元素 | 保存位置 | 更新逻辑 |
|--------|---------|----------|----------|
| FC 账号配置 | 动态表单 | `~/.config/opencode/skills/retail-fc/config.json` | 覆盖（密码脱敏） |
| Docker 仓库配置 | 动态表单 | `~/.config/opencode/skills/deploy-docker/config.json` | 覆盖（密码脱敏） |
| ECS 服务器配置 | 动态表单 | `~/.config/opencode/skills/deploy-ecs/config.json` | 覆盖（密码脱敏） |
| SQL 连接配置 | 动态表单 | `~/.config/opencode/skills/retail-sql/config.json` | 覆盖（密码脱敏） |

---

### Tab 5: 通知配置

| 配置项 | UI 元素 | 保存位置 | 更新逻辑 |
|--------|---------|----------|----------|
| Webhook URL | 输入框 | `~/.config/opencode/plugins/feishu-webhook-config.json` | 覆盖 |
| 启用状态 | 开关 | 同上 | 覆盖 |
| 通知场景 | 多选 | 同上 | 覆盖 |

**联动逻辑：**
- 保存时自动创建 `~/.config/opencode/plugins/feishu-webhook.js` 插件文件
- OpenCode 自动加载 `plugins/` 目录下的插件

---

## 三、保存逻辑规则

### 1. 合并更新（Merge）

适用于：`opencode.json`, `oh-my-opencode.json`, `auth.json`

```javascript
// 读取现有配置
const existing = await readConfig();
// 合并更新
const merged = { ...existing, ...newValues };
// 深度合并嵌套对象
merged.provider = { ...existing.provider, ...newValues.provider };
// 保存
await saveConfig(merged);
```

### 2. 覆盖更新（Overwrite）

适用于：Skills 配置、插件配置

```javascript
// 直接写入新配置
await saveConfig(newConfig);
```

### 3. 条件更新

适用于：`prompt_append` 字段

```javascript
// 只在有新值时更新，避免用空值覆盖现有内容
if (newValue !== undefined && newValue !== '') {
    config.prompt_append = newValue;
}
```

### 4. 密码脱敏

适用于：所有包含敏感信息的配置

```javascript
// 读取时脱敏
if (config.password) {
    config.password = '••••••••';
}

// 保存时还原
if (newConfig.password === '••••••••') {
    newConfig.password = existingConfig.password;  // 保留原值
}
```

---

## 四、配置联动关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面操作                               │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 选择技术栈     │     │ 选择 Agent 模型  │     │ 配置 Skills     │
│ (前端/后端/风格)│     │                 │     │                 │
└───────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 生成 prompt   │     │ 更新 model 字段  │     │ 写入 skill      │
│ _append       │     │                 │     │ config.json     │
└───────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌─────────────────────┐
                    │ oh-my-opencode.json │
                    │   - agents.*.model  │
                    │   - categories.*    │
                    │     .model          │
                    │     .prompt_append  │
                    └─────────────────────┘
```

---

## 五、Agents 和 Categories 定义

### Agents（8个）

| ID | 名称 | 用途 | 推荐模型层级 |
|----|------|------|-------------|
| `sisyphus` | 主力执行 | 核心任务执行 | primary (opus/gpt4) |
| `oracle` | 架构顾问 | 架构审查和调试 | reasoning (gpt4/opus) |
| `prometheus` | 任务规划 | 任务分解和规划 | primary |
| `explore` | 代码搜索 | 快速代码搜索 | fast (haiku/flash) |
| `librarian` | 文档查找 | 文档和开源项目查找 | multimodal (gemini) |
| `multimodal-looker` | 图像分析 | 图片和PDF分析 | multimodal |
| `metis` | 需求分析 | 发现隐藏意图和歧义 | primary |
| `momus` | 方案审查 | 严格评审工作计划 | reasoning |

### Categories（8个）

| ID | 名称 | 用途 | 推荐模型层级 |
|----|------|------|-------------|
| `visual-engineering` | 前端/UI开发 | 前端、UI/UX、设计 | multimodal |
| `ultrabrain` | 复杂逻辑 | 复杂逻辑任务 | reasoning + xhigh |
| `deep` | 深度研究 | 深度问题研究 | reasoning |
| `artistry` | 创意设计 | 非常规创意方案 | multimodal + max |
| `quick` | 快速任务 | 简单任务快速完成 | fast |
| `unspecified-low` | 通用低复杂度 | 不明确的低复杂度任务 | secondary |
| `unspecified-high` | 高复杂度 | 不明确的高复杂度任务 | primary + max |
| `writing` | 文档撰写 | 文档和技术写作 | fast |

---

## 六、模型自动匹配规则

```javascript
// 模型识别模式
const patterns = {
    opus: /opus|o1|4-5.*20251101/i,
    sonnet: /sonnet|4-5(?!.*20251101)/i,
    haiku: /haiku/i,
    gemini_pro: /gemini.*pro|gemini-3.*pro/i,
    gemini_flash: /gemini.*flash|gemini-3.*flash/i,
    gpt4: /gpt-4\.1(?!.*mini)|gpt-4o(?!.*mini)|gpt-5/i,
    gpt4_mini: /gpt-4\.1-mini|gpt-4o-mini/i
};

// 层级到模型的映射
const tierToModel = {
    primary: opus || gpt4 || sonnet || 第一个可用模型,
    reasoning: gpt4 || opus || sonnet,
    fast: haiku || gemini_flash || gpt4_mini || sonnet,
    multimodal: gemini_pro || gemini_flash,
    secondary: sonnet || gpt4_mini || gemini_pro
};
```

---

## 七、已知问题和待修复项

1. ~~`state.promptAppends` 初始化为空对象，避免空字符串覆盖~~ ✅ 已修复
2. ~~保存时条件判断改为 `!== undefined && !== ''`~~ ✅ 已修复
3. ~~`saveAgentModels` 直接保存到配置文件，不再调用两次~~ ✅ 已修复
4. 需要确保 `generateTechStackPrompt` 生成的内容正确写入
