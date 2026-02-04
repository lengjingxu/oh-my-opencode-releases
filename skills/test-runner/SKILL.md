---
name: test-runner
description: 测试执行框架 - 支持 pytest/jest/junit 测试运行、结果分析、自动修复
triggers:
  - 运行测试
  - 测试
  - pytest
  - jest
  - junit
  - 单元测试
---

# 测试执行 Skill

## 功能
- 自动检测项目测试框架
- 运行测试并分析结果
- 测试失败时自动修复代码
- 生成测试报告

## 支持的测试框架

| 语言 | 框架 | 检测文件 |
|------|------|----------|
| Python | pytest | pytest.ini, pyproject.toml |
| JavaScript/TypeScript | Jest | jest.config.js, package.json |
| Java | JUnit | pom.xml, build.gradle |
| Go | go test | go.mod |

## 测试流程

```
代码完成 → 运行测试 → 分析结果 → 通过? → 完成
                                    ↓ 否
                              自动修复 → 重新测试
```

## 使用方式

### 运行所有测试
```
运行测试
```

### 运行特定测试
```
运行 test_user.py 的测试
```

### 测试并修复
```
运行测试，如果失败请自动修复
```

## 测试要求

### L1: 单元测试
- 核心业务逻辑必须有测试
- 覆盖率目标：80%+

### L2: 集成测试
- API 接口测试
- 数据库操作测试

### L3: E2E 测试
- 使用 Playwright 进行页面测试
- 关键用户流程覆盖
