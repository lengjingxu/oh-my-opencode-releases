---
name: deploy-fc
description: 阿里云函数计算部署 - 支持代码打包、函数创建/更新、自动发布
triggers:
  - 部署到阿里云
  - 函数计算
  - FC部署
  - serverless
  - 发布上线
---

# 阿里云函数计算部署 Skill

## 功能
- 代码打包上传
- 创建/更新函数
- 自动发布新版本
- 配置自定义域名

## 配置
在 `~/.config/opencode/credentials.json` 中配置：

```json
{
  "deploy": {
    "aliyun_fc": {
      "enabled": true,
      "access_key_id": "YOUR_ACCESS_KEY_ID",
      "access_key_secret": "YOUR_ACCESS_KEY_SECRET",
      "region": "cn-shanghai"
    }
  }
}
```

## 使用方式

### 部署项目
```
部署到阿里云函数计算
```

### 指定函数名
```
部署到阿里云 FC，函数名为 my-api
```

### 查看函数状态
```
查看 FC 函数 my-api 的状态
```

## 部署流程

```
1. 检测项目类型 (Python/Node.js/Go/Java)
2. 安装依赖
3. 打包代码
4. 上传到 FC
5. 创建/更新函数
6. 发布新版本
7. 返回访问地址
```

## 支持的运行时

| 语言 | 运行时 | 入口文件 |
|------|--------|----------|
| Python | python3.10 | index.handler |
| Node.js | nodejs18 | index.handler |
| Go | go1.x | main |
| Java | java11 | com.example.Handler |

## 注意事项
- 确保代码中有正确的入口函数
- Python 项目需要 requirements.txt
- Node.js 项目需要 package.json
- 部署前会自动运行测试
