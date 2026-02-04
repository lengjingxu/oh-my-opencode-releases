---
name: sql-query
description: 通用 SQL 数据库查询助手 - 支持 MySQL/PostgreSQL 连接、表结构探索、SQL 查询执行
triggers:
  - SQL查询
  - 数据库查询
  - MySQL
  - PostgreSQL
  - 查询数据
  - 表结构
---

# SQL 数据库查询 Skill

## 功能
- 连接 MySQL / PostgreSQL 数据库
- 查看数据库表结构
- 执行 SQL 查询
- 数据导出
- 支持多数据库连接管理

## 配置
在 `~/.config/opencode/credentials.json` 中配置数据库连接：

```json
{
  "database": {
    "default": {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "your_password",
      "database": "your_database"
    },
    "production": {
      "type": "mysql",
      "host": "prod-db.example.com",
      "port": 3306,
      "user": "readonly",
      "password": "prod_password",
      "database": "prod_db"
    },
    "analytics": {
      "type": "postgres",
      "host": "analytics.example.com",
      "port": 5432,
      "user": "analyst",
      "password": "analytics_password",
      "database": "analytics"
    }
  }
}
```

## 配置字段说明

| 字段 | 说明 |
|------|------|
| `database` | 数据库连接配置对象，key 为连接名称 |
| `database.<name>` | 连接名称，如 "default", "production" 等 |
| `type` | 数据库类型: "mysql" 或 "postgres" |
| `host` | 数据库主机地址 |
| `port` | 端口号 (MySQL 默认 3306, PostgreSQL 默认 5432) |
| `user` | 数据库用户名 |
| `password` | 数据库密码 |
| `database` | 数据库名称 |

## 使用方式

### 查看表结构（使用 default 连接）
```
请查看 users 表的结构
```

### 指定连接查询
```
在 production 数据库中查询最近 10 条订单记录
```

### 执行查询
```
查询最近 10 条订单记录
```

### 数据分析
```
统计每个月的订单数量
```

### 跨库查询说明
```
在 analytics 库中分析用户行为数据
```

## 安全提示
- 默认只执行 SELECT 查询，不执行 INSERT/UPDATE/DELETE
- 如需修改数据，请明确告知并确认
- 敏感数据查询需要用户确认
- 建议为不同环境配置不同权限的账号（如只读账号）
