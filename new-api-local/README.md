# new-api 本地开发环境

用于 Super OpenCode 托管服务功能开发测试。

## 快速启动

```bash
cd new-api-local
docker compose up -d
```

## 访问地址

- **Web 管理界面**: http://localhost:3001
- **API 基础地址**: http://localhost:3001/api
- **OpenAI 兼容端点**: http://localhost:3001/v1

## 默认账号

首次启动后，访问 Web 界面注册管理员账号。

或使用初始 Root Token 直接调用 API：
```
Authorization: Bearer sk-dev-root-token-12345
```

## 常用命令

```bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down

# 重置数据（删除所有数据重新开始）
docker compose down
rm -rf data
docker compose up -d
```

## API 测试

### 注册用户
```bash
curl -X POST http://localhost:3001/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
  }'
```

### 登录
```bash
curl -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### 获取用户信息
```bash
curl http://localhost:3001/api/user/self \
  -b cookies.txt
```

### 创建 Token
```bash
curl -X POST http://localhost:3001/api/token/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "my-api-key",
    "remain_quota": 100000,
    "unlimited_quota": false
  }'
```

### 获取 Token 列表
```bash
curl http://localhost:3001/api/token/ \
  -b cookies.txt
```

## 配置上游渠道

启动后需要在 Web 管理界面配置上游 API 渠道：

1. 登录管理界面 http://localhost:3001
2. 进入「渠道管理」
3. 添加渠道（如 OpenAI、Anthropic、DeepSeek 等）
4. 配置对应的 API Key 和模型

## 注意事项

- 开发环境已关闭邮箱验证
- 数据存储在 `./data` 目录
- 端口 3001 可在 docker-compose.yml 中修改
