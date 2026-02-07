# 飞书机器人 - 产品设计文档

## 1. 概述

飞书机器人模块（`feishu_bot`），作为可整合到现有 app 中的独立模块，通过飞书 SDK 的 **WebSocket 长连接**模式，在本地电脑接收飞书消息，调用 opencode 执行任务，并将结果回复到飞书。

### 1.1 核心价值

- **零公网依赖**：WebSocket 长连接，无需公网 IP / 域名 / 内网穿透
- **即插即用**：配置 App ID + App Secret 即可启动
- **与 github_discussion_bot 同构**：复用相同的 opencode 调用模式和项目结构

### 1.2 与现有系统的关系

```
现有 app 结构:
├── github_discussion_bot/   ← GitHub Discussion 消息源
│   ├── config.py
│   ├── github_client.py
│   ├── opencode_processor.py
│   ├── bot.py
│   └── main.py
│
├── feishu_bot/              ← 新增：飞书消息源（本模块）
│   ├── config.py
│   ├── feishu_client.py
│   ├── opencode_processor.py
│   ├── bot.py
│   └── main.py
```

## 2. 架构设计

### 2.1 数据流

```
飞书用户发消息
       │
       ▼
飞书开放平台 ──WebSocket长连接──▶ 本地 feishu_bot
                                    │
                                    ▼
                            opencode_processor
                            (subprocess 调用 opencode CLI)
                                    │
                                    ▼
                            feishu_client.reply()
                            (SDK API 回复消息到飞书)
```

### 2.2 模块职责

| 模块 | 职责 |
|------|------|
| `config.py` | 配置管理：飞书应用凭证、opencode 路径、工作目录 |
| `feishu_client.py` | 飞书 SDK 封装：发消息、回复消息 |
| `opencode_processor.py` | opencode CLI 调用：构建 prompt、异步执行、结果提取 |
| `bot.py` | 核心编排：事件处理器注册、消息过滤、流程串联 |
| `main.py` | 入口：CLI 参数解析、启动 WebSocket 长连接 |

## 3. 详细设计

### 3.1 config.py

```python
@dataclass
class FeishuConfig:
    app_id: str              # 飞书应用 App ID
    app_secret: str          # 飞书应用 App Secret
    opencode_path: str       # opencode CLI 路径，默认 "opencode"
    working_dir: str | None  # opencode 工作目录
    model: str               # opencode 使用的模型，默认 "fox-cc/claude-opus-4-6"
    log_level: str           # 日志级别，默认 "INFO"
```

支持两种配置方式：
1. **环境变量**：`FEISHU_APP_ID`, `FEISHU_APP_SECRET` 等
2. **CLI 参数**：`--app-id`, `--app-secret` 等（优先级高于环境变量）

### 3.2 feishu_client.py

封装飞书 SDK 的消息发送能力：

```python
class FeishuClient:
    def __init__(self, config: FeishuConfig)
    def reply_text(self, message_id: str, text: str) -> bool
    def send_text(self, chat_id: str, text: str) -> bool
```

- 使用 `lark_oapi.Client` 进行 API 调用
- 回复使用 `im.v1.message.reply` API（保持会话上下文）
- 长文本自动截断（飞书单条消息限制）

### 3.3 opencode_processor.py

复用 github_discussion_bot 的模式：

```python
class OpenCodeProcessor:
    def process_message_async(self, message: FeishuMessage, reply_callback) -> None
    def _run_opencode(self, prompt: str) -> str
    def _build_prompt(self, message: FeishuMessage) -> str
```

- 异步线程执行，不阻塞 WebSocket 消息接收
- 超时 1800s（与现有 bot 一致）
- 回调模式：执行完成后调用 `reply_callback` 回复飞书

### 3.4 bot.py

核心编排逻辑：

```python
class FeishuBot:
    def __init__(self, config: FeishuConfig)
    def _build_event_handler(self) -> EventDispatcherHandler
    def _on_message_receive(self, data: P2ImMessageReceiveV1) -> None
    def start(self) -> None  # 阻塞，启动 WebSocket 长连接
```

消息过滤规则：
- 忽略机器人自己发的消息
- 只处理文本类型消息（`msg_type == "text"`）
- 去重：基于 message_id 防止重复处理

### 3.5 main.py

CLI 入口：

```
usage: python -m feishu_bot [options]

options:
  --app-id          飞书 App ID
  --app-secret      飞书 App Secret
  --opencode-path   opencode CLI 路径 (default: opencode)
  --working-dir     opencode 工作目录
  --model           opencode 模型 (default: fox-cc/claude-opus-4-6)
  --log-level       日志级别 (default: INFO)
```

## 4. 飞书开放平台配置要求

使用前需在飞书开发者后台完成：

| 步骤 | 操作 |
|------|------|
| 1 | 创建企业自建应用 |
| 2 | 添加「机器人」能力 |
| 3 | 事件订阅方式选择「使用长连接接收事件」 |
| 4 | 添加事件 `im.message.receive_v1` |
| 5 | 申请权限 `im:message`、`im:message:send_as_bot` |
| 6 | 发布应用版本 |

## 5. 依赖

```
lark-oapi >= 1.4.0
```

## 6. 服务管理

提供 `service.sh` 脚本（与 github_discussion_bot 同构）：
- `install` / `uninstall`：macOS LaunchAgent 注册
- `start` / `stop` / `restart`：服务控制
- `status` / `logs`：状态查看
