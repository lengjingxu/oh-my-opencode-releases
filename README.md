# Super OpenCode

> 开箱即用的多 Agent AI 编程方案 — 不是更聪明的 AI，而是更聪明的使用方式

<!-- 主界面截图 -->
<!-- ![Super OpenCode 主界面](screenshots/main.png) -->

## 为什么需要 Super OpenCode？

用 AI 写代码，你大概率遇到过这些问题：

| 痛点 | 原因 | Super OpenCode 怎么解决 |
|------|------|------------------------|
| AI 聊几轮就"失忆" | 上下文窗口被代码和对话历史填满，指令被丢弃 | 多 Agent 分治，每个 Agent 只处理自己的上下文 |
| 所有任务都用最贵的模型 | 没有任务分类机制 | 智能路由：简单任务用 Haiku，复杂任务才用 Opus |
| 生成的 UI 千篇一律 | AI 缺少设计系统知识 | 内置 67 种设计风格、96 种配色方案的 Skill |
| 国内网络用不了 | Anthropic/OpenAI 需要代理 | 预配置国内可直连的 API 服务 |
| 配置太复杂 | 需要手动编辑多个 JSON 文件 | 桌面应用，图形界面一键配置 |

## 核心优势

### 🤖 多 Agent 协作，不再失忆

单个 AI 承载不了所有上下文。Super OpenCode 把任务拆给专职 Agent，每个只关注自己的领域：

```
                    ┌─────────────┐
                    │  Sisyphus   │  主编排：分解任务、协调全局
                    │  (Master)   │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Oracle  │ │ Explore  │ │ Librarian│
        │ 架构顾问 │ │ 代码搜索 │ │ 文档检索 │
        └──────────┘ └──────────┘ └──────────┘
```

子 Agent 只返回结果，不返回过程 — 主 Agent 的上下文始终保持清洁。

### 💰 智能路由，Token 成本降 50%+

不是所有任务都需要最贵的模型：

| 任务类型 | 传统方式 (全用 GPT-4) | Super OpenCode | 节省 |
|---------|----------------------|----------------|------|
| 文档修正 | $0.60 | $0.02 (Haiku) | -96% |
| 前端页面 | $2.50 | $0.50 (Gemini) | -80% |
| 复杂重构 | $3.00 | $3.00 (Opus) | 0% |

### 🛡️ 防御性设计，AI 不再跑偏

- **防失忆**：任务续接钩子自动检测未完成的 todo，强制 AI 继续
- **防越界**：7 段式委派结构，子 Agent 有明确的 MUST DO / MUST NOT DO
- **防崩溃**：上下文超限自动压缩，编辑失败自动重试

### 🎨 专业级 UI 输出

内置 `ui-ux-pro-max` Skill，告别 AI 生成的"紫粉渐变"审美：

- 67 种设计风格 · 96 种配色方案 · 57 组字体搭配
- 完整交互状态 (Hover/Focus/Active/Disabled)
- WCAG 对比度标准 · Lucide/Heroicons 图标系统

<!-- UI 对比截图 -->
<!-- ![UI 输出对比](screenshots/ui-comparison.png) -->

### 🌐 国内开箱即用

- 预配置国内可直连的 API 代理服务
- 支持 OpenRouter、硅基流动等中转
- 一键配置，无需折腾代理

## 功能一览

<!-- 配置界面截图 -->
<!-- ![配置管理界面](screenshots/config.png) -->

| 功能 | 说明 |
|------|------|
| **安装向导** | 自动安装 OpenCode + Oh-My-OpenCode，选择技术栈，配置 API Key |
| **模型配置** | 为不同 Agent / Category 分配最合适的模型 |
| **Skill 管理** | 启用/配置 10+ 内置 Skill |
| **自动更新** | 基于 GitHub Releases 的热更新 |

### 内置 Skills

| Skill | 能力 |
|-------|------|
| `ui-ux-pro-max` | 专业 UI/UX 设计智能 |
| `deploy-fc` / `deploy-ecs` / `deploy-docker` | 阿里云函数计算 / ECS / Docker 一键部署 |
| `sql-query` | 数据库连接、查询、数据分析 |
| `image-generator` | Stable Diffusion API 图片生成 |
| `test-runner` | 自动化测试生成与执行 |
| `notification` | 飞书 / 企业微信 / 钉钉通知推送 |
| `git-master` | Git 操作规范 |
| `log-standard` | 前后端日志规范 |

### 📱 飞书 Bot — 离开电脑，AI 不停工

通过飞书 Bot 接入 OpenCode，手机上也能指挥 AI 写代码：

<!-- 飞书 Bot 截图 -->
<!-- ![飞书 Bot](screenshots/feishu-bot.png) -->

- 自然语言对话，像跟同事聊天一样指挥 AI
- 实时进度可视化（Todo 进度条、Diff、Git 状态）
- 快捷命令：`/t` 看任务 · `/d` 看 Diff · `/x` 紧急终止
- 零公网依赖，WebSocket 长连接，本地运行

## 快速开始

### 下载安装

从 [Releases](https://github.com/lengjingxu/super_opencode/releases) 下载最新版本：

- macOS Apple Silicon: `Super.OpenCode-x.x.x-arm64.dmg`
- macOS Intel: `Super.OpenCode-x.x.x.dmg`

### 使用流程

```
打开应用 → 安装 OpenCode → 安装 Oh-My-OpenCode 
    → 选择技术栈 → 配置 API Key → 完成！
```

然后在终端运行 `opencode` 开始 AI 辅助编程。

## 开发

```bash
cd config-app

# 安装依赖
npm install

# 开发模式
npm start

# 构建
npm run build:mac
```

## 项目结构

```
├── config-app/          # Electron 桌面应用
│   ├── src/             # 主界面 HTML
│   ├── lib/             # 核心服务（配置管理、托管服务）
│   ├── skills/          # 内置 Skills
│   ├── templates/       # 配置模板
│   ├── feishu_bot/      # 飞书 Bot 模块
│   └── client/          # OpenCode 客户端 (SolidJS)
├── landing-page/        # 产品介绍页
├── templates/           # 全局配置模板
└── tech-stacks/         # 技术栈预设配置
```

## 致谢

基于以下开源项目构建：

- [OpenCode](https://github.com/opencode-ai/opencode) — AI 编程助手核心
- [Oh-My-OpenCode](https://github.com/pinkpixel-dev/oh-my-opencode) — 多代理协作框架

## License

MIT
