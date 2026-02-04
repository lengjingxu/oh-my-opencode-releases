# Super OpenCode 最佳实践配置包

开箱即用的 AI 开发团队配置。下载应用，按向导完成配置，即可开始使用。

## 特性

- **一键安装** - 自动安装 OpenCode + Super OpenCode + 推荐插件
- **预配置的 Agent 团队** - 8 个专业 Agent，按任务自动分配最优模型
- **技术栈适配** - 支持 Vue/React/Angular + Python/Java/Node/Go
- **质量保障** - 内置测试、日志规范
- **一键部署** - 支持阿里云 FC、Docker
- **智能通知** - 任务完成自动通知（飞书/企微/钉钉）

## 快速开始

### 方式一：使用配置应用（推荐）

```bash
# 克隆仓库
git clone https://github.com/xxx/oh-my-opencode-starter.git
cd oh-my-opencode-starter/config-app

# 安装依赖并启动
npm install
npm start
```

打开应用后，按向导完成配置即可。应用会自动：
1. 安装 OpenCode
2. 安装 Super OpenCode
3. 安装推荐插件
4. 配置技术栈
5. 生成配置文件

### 方式二：使用安装脚本

```bash
cd oh-my-opencode-starter
./install.sh
```

## 安装完成后

直接在终端运行：

```bash
opencode
```

## 目录结构

```
oh-my-opencode-starter/
├── config-app/                   # 配置应用（Electron）
│   ├── main.js
│   ├── package.json
│   └── src/index.html
│
├── install.sh                    # 命令行安装脚本
├── README.md
├── DESIGN.md                     # 设计文档
│
├── templates/                    # 配置模板
│   ├── oh-my-opencode.json       # Agent + Category 配置
│   ├── opencode.json             # 模型提供商配置
│   ├── credentials.json.template # 凭证模板
│   └── AGENTS.md.template        # 全局规范模板
│
├── tech-stacks/                  # 技术栈模块
│   ├── frontend/                 # Vue3/React/Angular/Vanilla
│   └── backend/                  # Python/Java/Node/Go
│
├── skills/                       # 预置 Skills
│   ├── sql-query/                # 数据库查询
│   ├── test-runner/              # 测试执行
│   ├── log-standard/             # 日志规范
│   ├── deploy-fc/                # 阿里云 FC 部署
│   ├── deploy-docker/            # Docker 部署
│   ├── notification/             # 通知服务
│   ├── data-storytelling/        # 数据分析
│   └── image-generator/          # 图片生成
│
└── hooks/
    └── notify.sh                 # Webhook 通知脚本
```

## Agent 团队

| Agent | 职责 | 模型 |
|-------|------|------|
| Sisyphus | 主编排、决策 | Claude Opus |
| Oracle | 架构审查、调试 | GPT-5.2 |
| Prometheus | 任务规划 | Claude Opus |
| Explore | 代码搜索 | Claude Haiku |
| Librarian | 文档查找 | Gemini Pro |
| Multimodal | 图片分析 | Gemini Flash |

## 技术栈支持

### 前端
- Vue 3 + Tailwind + DaisyUI（液态玻璃风格）
- React + Next.js + shadcn/ui
- Angular + Material
- 纯 HTML/CSS/JS

### 后端
- Python + FastAPI + SQLAlchemy
- Java + Spring Boot + MyBatis-Plus
- Node.js + Express + Prisma
- Go + Gin + GORM

## 配置文件

安装后，配置文件位于 `~/.config/opencode/`：

| 文件 | 说明 |
|------|------|
| `opencode.json` | 模型提供商配置 |
| `oh-my-opencode.json` | Agent + Category 配置 |
| `credentials.json` | 凭证（API Key、数据库等） |
| `AGENTS.md` | 全局开发规范 |

## 通知配置

支持飞书、企业微信、钉钉 Webhook 通知。

编辑 `~/.config/opencode/credentials.json`：

```json
{
  "notification": {
    "webhook": {
      "enabled": true,
      "platform": "wecom",
      "webhook_url": "https://qyapi.weixin.qq.com/..."
    }
  }
}
```

## 常见问题

### Q: 如何更换技术栈？
打开配置应用，在"提示词配置"中修改，或手动编辑 `~/.config/opencode/oh-my-opencode.json`

### Q: 如何添加自定义 Skill？
在 `~/.config/opencode/skills/` 目录下创建新的 Skill 文件夹

### Q: 如何修改 AI 称呼？
打开配置应用，在"全局规范"中修改，或编辑 `~/.config/opencode/AGENTS.md`

## License

MIT
