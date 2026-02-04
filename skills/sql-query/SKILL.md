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
    }
  }
}
```

## 使用方式

### 查看表结构
```
请查看 users 表的结构
```

### 执行查询
```
查询最近 10 条订单记录
```

### 数据分析
```
统计每个月的订单数量
```

## 安全提示
- 只执行 SELECT 查询，不执行 INSERT/UPDATE/DELETE
- 如需修改数据，请明确告知并确认
- 敏感数据查询需要用户确认
