# Oh-My-OpenCode 最佳实践配置包 - 设计文档

## 一、项目定位

### 1.1 解决的问题

| 痛点 | 现状 | 我们的方案 |
|------|------|-----------|
| **配置复杂** | 用户需理解 Agent、Category、Skill、MCP 等概念 | 开箱即用，预配置好的 AI 开发团队 |
| **模型选择难** | 不知道哪个模型适合什么任务 | 按任务类型自动分配最优模型 |
| **成本不可控** | 简单任务也用贵模型 | 分层定价：简单→便宜，复杂→贵 |
| **质量不稳定** | 缺乏测试、日志、验证流程 | 内置质量门禁：测试通过才交付 |
| **技术栈不匹配** | 通用提示词不了解项目上下文 | 技术栈模块化，prompt 自动适配 |

### 1.2 核心价值

```
用户获得的不是"配置文件"，而是：
┌─────────────────────────────────────────────────────────┐
│  一个配置好的 AI 开发团队                                │
│  + 按任务自动选择最优模型                                │
│  + 内置质量保障流程（测试、日志、验证）                   │
│  + 匹配用户技术栈的专业知识                              │
│  + 常用能力开箱即用（数据库、部署、测试等）               │
│  + 任务完成自动通知                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 二、Agent 团队架构

### 2.1 Agent 模型分配（基于官方推荐）

| Agent | 职责 | 推荐模型 | 成本 |
|-------|------|---------|------|
| **Sisyphus** | 主编排、决策 | claude-opus-4-5 | 高 |
| **Oracle** | 架构审查、调试 | gpt-5.2 | 高 |
| **Prometheus** | 任务规划、分解 | claude-opus-4-5 | 高 |
| **Explore** | 代码搜索 | claude-haiku-4-5 | 低 |
| **Librarian** | 文档/OSS 查找 | glm-4.7 | 低 |
| **Multimodal** | 图片/PDF 分析 | gemini-3-flash | 中 |
| **Metis** | 需求分析 | claude-opus-4-5 | 中 |
| **Momus** | 方案审查 | gpt-5.2 | 中 |

### 2.2 Category 任务分发

| Category | 用途 | 推荐模型 | 原因 |
|----------|------|---------|------|
| **visual-engineering** | 前端/UI | gemini-3-pro | 设计感强 |
| **ultrabrain** | 复杂逻辑 | gpt-5.2-codex (xhigh) | 深度推理 |
| **deep** | 深度问题 | gpt-5.2-codex | 彻底研究 |
| **artistry** | 创意设计 | gemini-3-pro (max) | 创造力强 |
| **quick** | 简单任务 | claude-haiku-4-5 | 快速便宜 |
| **unspecified-low** | 通用低复杂度 | claude-sonnet-4-5 | 平衡 |
| **unspecified-high** | 通用高复杂度 | claude-opus-4-5 (max) | 最强能力 |
| **writing** | 文档撰写 | gemini-3-flash | 文字流畅 |

---

## 三、技术栈模块

用户选择技术栈后，自动注入对应的 `prompt_append` 到相关 Category。

### 3.1 前端技术栈

#### Vue 3 + Tailwind + DaisyUI
```
- 框架：Vue.js 3 (CDN模式)
- 样式：Tailwind CSS + DaisyUI
- 设计风格：苹果液态玻璃风格
- 禁止使用需要编译的构建工具
```

#### React + Next.js + shadcn
```
- 框架：React 18 + Next.js 14 (App Router)
- UI库：shadcn/ui + Tailwind CSS
- 状态管理：Zustand 或 React Context
- 优先使用 Server Components
```

#### Angular
```
- 框架：Angular 17+
- UI库：Angular Material
- 使用 Standalone Components
```

#### 纯 HTML/CSS/JS
```
- 无框架依赖
- 原生 JavaScript
- 适合简单页面
```

### 3.2 后端技术栈

#### Python + FastAPI
```
- 框架：FastAPI
- ORM：SQLAlchemy 2.0 (async)
- 数据验证：Pydantic v2
- 日志：loguru
```

#### Java + Spring Boot
```
- 框架：Spring Boot 3.x
- ORM：MyBatis-Plus
- 规范：阿里巴巴 Java 开发手册
- 日志：SLF4J + Logback
```

#### Node.js + Express
```
- 框架：Express.js
- ORM：Prisma
- 语言：TypeScript
- 日志：winston
```

#### Go + Gin
```
- 框架：Gin
- ORM：GORM
- 高性能场景
- 日志：zap
```

---

## 四、Skills 清单

### 4.1 数据库
| Skill | 功能 | 配置项 |
|-------|------|--------|
| **sql-query** | 通用 SQL 查询 | host/port/user/password/database |

### 4.2 测试
| Skill | 功能 | 说明 |
|-------|------|------|
| **test-runner** | 测试执行 | 支持 pytest/jest/junit |

### 4.3 日志
| Skill | 功能 | 说明 |
|-------|------|------|
| **log-standard** | 日志规范 | 前后端日志格式要求 |

### 4.4 部署
| Skill | 功能 | 配置项 | 推荐度 |
|-------|------|--------|--------|
| **deploy-fc** | 阿里云函数计算 | AccessKey ID/Secret | ⭐⭐⭐ 推荐 |
| **deploy-docker** | Docker 部署 | Registry/用户名/密码 | ⭐⭐ |
| **deploy-server** | 服务器部署 | SSH Host/用户名/密钥 | ⭐⭐ |
| **deploy-vercel** | Vercel 部署 | Token | ⭐ |

### 4.5 通知
| Skill | 功能 | 配置项 |
|-------|------|--------|
| **notification** | Webhook 通知 | 飞书/企微/钉钉 Webhook URL |

### 4.6 其他
| Skill | 功能 | 配置项 |
|-------|------|--------|
| **data-storytelling** | 数据分析可视化 | 无 |
| **image-generator** | AI 图片生成 | SD API Key |

---

## 五、插件集成

### 5.1 必装插件

| 插件 | 功能 | 说明 |
|------|------|------|
| **opencode-notificator** | 桌面通知 | 任务完成/需要输入时弹窗提醒 |
| **opencode-supermemory** | 持久记忆 | 跨会话记住项目背景 |
| **opencode-dynamic-context-pruning** | Token 优化 | 自动裁剪过时的上下文 |

### 5.2 插件配置

```json
{
  "plugins": {
    "opencode-notificator": {
      "enabled": true,
      "sound": true,
      "events": ["task_complete", "permission_request", "error"]
    },
    "opencode-supermemory": {
      "enabled": true
    },
    "opencode-dynamic-context-pruning": {
      "enabled": true
    }
  }
}
```

---

## 六、通知系统

### 6.1 桌面通知
使用 `opencode-notificator` 插件，开箱即用。

### 6.2 Webhook 通知（飞书/企微/钉钉）

需要配置 opencode 的 Hook 机制：

#### opencode.json 配置
```json
{
  "hooks": {
    "session_complete": "~/.config/opencode/hooks/notify.sh complete",
    "permission_request": "~/.config/opencode/hooks/notify.sh permission",
    "error": "~/.config/opencode/hooks/notify.sh error"
  }
}
```

#### Hook 脚本 (notify.sh)
```bash
#!/bin/bash
EVENT_TYPE=$1
WEBHOOK_URL=$(cat ~/.config/opencode/credentials.json | jq -r '.notification.webhook_url')
PLATFORM=$(cat ~/.config/opencode/credentials.json | jq -r '.notification.platform')

case $EVENT_TYPE in
  "complete")
    MESSAGE="✅ OpenCode 任务已完成"
    ;;
  "permission")
    MESSAGE="⚠️ OpenCode 需要您的输入"
    ;;
  "error")
    MESSAGE="❌ OpenCode 任务出错"
    ;;
esac

# 根据平台发送消息
case $PLATFORM in
  "feishu")
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"$MESSAGE\"}}"
    ;;
  "wecom")
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"$MESSAGE\"}}"
    ;;
  "dingtalk")
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"$MESSAGE\"}}"
    ;;
esac
```

---

## 七、质量保障体系

### 7.1 测试门禁

```
开发完成 → 自动触发测试 → 测试通过? → 交付
                              ↓ 否
                         自动修复 → 重新测试 → 循环直到通过
```

**三层测试要求**：
| 层级 | 测试类型 | 工具 |
|------|---------|------|
| L1 | 功能测试 | pytest / jest / junit |
| L2 | API 测试 | httpx / supertest |
| L3 | 页面测试 | playwright |

### 7.2 日志规范

**开发时**：
- 后端：关键函数入口/出口打印参数和返回值
- 前端：关键用户操作和 API 调用记录到 console
- 格式：`[时间戳] [级别] [模块] 消息`

**上线后**：
- 配置日志收集（阿里云 SLS / ELK）
- 关键业务操作必须有审计日志

### 7.3 交付标准

```
代码交付前必须通过：
- [ ] 功能测试通过
- [ ] API 测试通过 (如有)
- [ ] 页面可访问 (如有前端)
- [ ] 日志完整
- [ ] 部署成功 (如需)
```

---

## 八、配置文件结构

### 8.1 目录结构

```
oh-my-opencode-starter/
├── config-app/                   # Electron 配置应用
│   ├── package.json
│   ├── main.js
│   ├── preload.js
│   └── src/
│       ├── App.vue
│       ├── pages/
│       │   ├── Setup.vue         # 初始化向导
│       │   ├── Prompts.vue       # 提示词配置
│       │   └── AgentsMd.vue      # 全局规范编辑
│       └── utils/
│           └── config.js
│
├── templates/
│   ├── oh-my-opencode.json       # Agent + Category 配置
│   ├── opencode.json.template    # 模型提供商模板
│   ├── credentials.json.template # 凭证模板
│   └── AGENTS.md.template        # 全局规范模板
│
├── tech-stacks/
│   ├── frontend/
│   │   ├── vue3-tailwind.json
│   │   ├── react-nextjs.json
│   │   ├── angular.json
│   │   └── vanilla.json
│   └── backend/
│       ├── python-fastapi.json
│       ├── java-springboot.json
│       ├── node-express.json
│       └── go-gin.json
│
├── skills/
│   ├── sql-query/
│   ├── test-runner/
│   ├── log-standard/
│   ├── deploy-fc/
│   ├── deploy-docker/
│   ├── deploy-server/
│   ├── deploy-vercel/
│   ├── notification/
│   ├── data-storytelling/
│   └── image-generator/
│
└── hooks/
    └── notify.sh                 # Webhook 通知脚本
```

### 8.2 credentials.json 结构

```json
{
  "model_service": {
    "api_key": "sk-xxx",
    "base_url": "https://your-proxy.com/v1"
  },
  "database": {
    "default": {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "xxx",
      "database": "mydb"
    }
  },
  "deploy": {
    "aliyun_fc": {
      "access_key_id": "LTAI...",
      "access_key_secret": "xxx",
      "region": "cn-shanghai"
    },
    "docker": {
      "registry": "registry.cn-shanghai.aliyuncs.com",
      "username": "xxx",
      "password": "xxx"
    },
    "server": {
      "host": "192.168.1.100",
      "port": 22,
      "username": "root",
      "auth_type": "key",
      "key_path": "~/.ssh/id_rsa"
    },
    "vercel": {
      "token": "xxx"
    }
  },
  "image_generator": {
    "api_key": "xxx"
  },
  "notification": {
    "platform": "wecom",
    "webhook_url": "https://qyapi.weixin.qq.com/...",
    "triggers": ["task_complete", "need_input", "error"]
  }
}
```

---

## 九、配置应用界面

### 9.1 初始化向导流程

```
[1.技术栈] → [2.模型服务] → [3.数据库] → [4.部署] → [5.通知] → [6.规范]
```

### 9.2 步骤 1：技术栈选择

```
┌─────────────────────────────────────────────────────────────────┐
│  选择前端技术栈：                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Vue 3       │ │ React       │ │ Angular     │ │ 纯 HTML   │ │
│  │ + Tailwind  │ │ + Next.js   │ │             │ │           │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  选择后端技术栈：                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ Python      │ │ Java        │ │ Node.js     │ │ Go        │ │
│  │ FastAPI     │ │ SpringBoot  │ │ Express     │ │ Gin       │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 步骤 2：模型服务

```
┌─────────────────────────────────────────────────────────────────┐
│  模型服务 API Key：                                              │
│                                                                 │
│  API Key: [________________________________] [获取 Key]         │
│                                                                 │
│  ℹ️ 我们提供统一的模型服务，包含 Claude、GPT、Gemini 等          │
│     一个 Key 即可使用所有模型                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 9.4 步骤 3：数据库配置

```
┌─────────────────────────────────────────────────────────────────┐
│  ☑️ 启用数据库查询功能                                           │
│                                                                 │
│  数据库类型：[MySQL ▼]                                          │
│  主机：[localhost_________]  端口：[3306____]                   │
│  用户名：[root____________]  密码：[••••••••__]                  │
│  数据库名：[mydb___________]                                    │
│                                                                 │
│  [测试连接]                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 步骤 4：部署配置

```
┌─────────────────────────────────────────────────────────────────┐
│  选择部署方式（可多选）：                                        │
│                                                                 │
│  ☑️ 阿里云函数计算 (FC) ⭐推荐                                   │
│     AccessKey ID：[LTAI________________]                        │
│     AccessKey Secret：[••••••••••••••••__]                      │
│     地域：[cn-shanghai ▼]                                       │
│                                                                 │
│  ☐ Docker 镜像                                                  │
│  ☐ 服务器部署                                                   │
│  ☐ Vercel                                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.6 步骤 5：通知配置

```
┌─────────────────────────────────────────────────────────────────┐
│  桌面通知：                                                      │
│  ☑️ 启用桌面弹窗通知                                             │
│  ☑️ 启用声音提醒                                                 │
│                                                                 │
│  Webhook 通知：                                                  │
│  ○ 飞书    ● 企业微信    ○ 钉钉                                 │
│  Webhook URL：[https://qyapi.weixin.qq.com/...]                 │
│                                                                 │
│  [发送测试消息]                                                  │
│                                                                 │
│  通知触发条件：                                                  │
│  ☑️ 任务完成时    ☑️ 需要输入时    ☐ 任务失败时                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.7 步骤 6：全局规范

```
┌─────────────────────────────────────────────────────────────────┐
│  全局规范 (AGENTS.md)：                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # 项目开发规范                                              ││
│  │                                                             ││
│  │ ## 称呼                                                     ││
│  │ - 称呼我为：[主人____]                                      ││
│  │                                                             ││
│  │ ## 质量要求                                                 ││
│  │ - 代码完成后必须通过测试                                    ││
│  │ - 关键操作必须有日志                                        ││
│  │ - 所有注释使用中文                                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 9.8 主界面（安装后）

```
┌─────────────────────────────────────────────────────────────────┐
│  Oh-My-OpenCode 配置中心                                        │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  📋 提示词    │  [Category 选择器]                               │
│              │                                                  │
│  📝 全局规范  │  当前编辑：visual-engineering                    │
│              │  ┌────────────────────────────────────────────┐  │
│  ⚙️ 设置     │  │ ## 技术栈要求                              │  │
│              │  │ - 前端：Vue 3 + Tailwind + DaisyUI         │  │
│              │  │ - 设计风格：苹果液态玻璃风格               │  │
│              │  │                                            │  │
│              │  │ ## 自定义追加                              │  │
│              │  │ [在此添加项目特定要求...]                  │  │
│              │  └────────────────────────────────────────────┘  │
│              │                                                  │
│              │  [保存]  [重置为默认]                            │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## 十、实现计划

### 阶段 1：核心配置
- [ ] oh-my-opencode.json 模板
- [ ] opencode.json 模板
- [ ] credentials.json 模板
- [ ] AGENTS.md 模板

### 阶段 2：技术栈模块
- [ ] 前端：vue3-tailwind / react-nextjs / angular / vanilla
- [ ] 后端：python-fastapi / java-springboot / node-express / go-gin

### 阶段 3：Skills
- [ ] sql-query
- [ ] test-runner
- [ ] log-standard
- [ ] deploy-fc / deploy-docker / deploy-server / deploy-vercel
- [ ] notification
- [ ] data-storytelling
- [ ] image-generator

### 阶段 4：通知系统
- [ ] Hook 脚本 (notify.sh)
- [ ] 飞书/企微/钉钉 适配

### 阶段 5：配置应用
- [ ] Electron 项目搭建
- [ ] 初始化向导 UI
- [ ] 提示词配置 UI
- [ ] 全局规范编辑 UI

---

## 十一、商业模式

### 11.1 价值主张
- 不是卖"更便宜的 API"
- 而是卖"配置好的 AI 开发团队 + 更好的结果/成本比"

### 11.2 收费点
- 统一模型服务 API Key（中转服务）
- 按 Token 使用量计费
- 简单任务用便宜模型，复杂任务用贵模型，整体成本更优

### 11.3 竞争优势
| 维度 | Claude Code | Cursor | 我们的方案 |
|------|-------------|--------|-----------|
| 模型 | 单一 | 单一 | 多模型按任务分配 |
| 配置成本 | 低 | 低 | 零 (预配置) |
| 单次成本 | 高 | 中 | 低 (分层定价) |
| 质量保障 | 无 | 无 | 内置测试门禁 |
| 技术栈适配 | 无 | 无 | 模块化 prompt |
