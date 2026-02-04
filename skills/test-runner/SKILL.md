---
name: test-runner
description: 测试执行框架 - 多代理协作完成代码分析、测试规划、测试生成、验证执行
triggers:
  - 运行测试
  - 测试
  - pytest
  - jest
  - 单元测试
  - 集成测试
  - E2E测试
  - 添加测试
  - 创建测试
  - 测试覆盖
---

# 测试执行 Skill (多代理协作版)

## 核心理念

**问题**: 单个代理难以同时完成代码分析 + 测试规划 + 测试生成，上下文不足导致测试覆盖不充分。

**解决方案**: 4 阶段流水线，每阶段由专门代理负责，通过文档传递上下文。

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  阶段1      │    │  阶段2      │    │  阶段3      │    │  阶段4      │
│  代码分析   │ →  │  测试规划   │ →  │  测试生成   │ →  │  验证执行   │
│  (Explore)  │    │  (Plan)     │    │  (Code×N)   │    │  (Test)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      ↓                  ↓                  ↓                  ↓
 CODE_ANALYSIS.md   TEST_PLAN.md      测试文件           覆盖率报告
```

---

## 阶段1: 代码分析 (Explore Agent)

### 目标
分析项目代码结构，识别所有需要测试的模块、函数、类。

### 执行指令
```
delegate_task(
  subagent_type="explore",
  run_in_background=false,
  load_skills=[],
  prompt="""
分析项目代码结构，生成 CODE_ANALYSIS.md 文档。

要求:
1. 列出所有源代码文件 (排除 node_modules, __pycache__, dist 等)
2. 对每个文件，提取:
   - 导出的函数/类/常量
   - 函数签名 (参数和返回值)
   - 复杂度评估 (低/中/高)
   - 外部依赖 (数据库/文件/网络/第三方API)
3. 识别关键用户流程 (用于 E2E 测试)
4. 输出格式见下方模板

项目路径: {PROJECT_PATH}
"""
)
```

### 输出文档: CODE_ANALYSIS.md

```markdown
# 代码分析报告

## 项目信息
- 项目名称: {PROJECT_NAME}
- 项目类型: {JavaScript/Python/Electron}
- 分析时间: {TIMESTAMP}

## 源代码文件清单

### {FILE_PATH_1}
| 导出名称 | 类型 | 签名 | 复杂度 | 外部依赖 |
|----------|------|------|--------|----------|
| functionA | function | (input: string) => boolean | 低 | 无 |
| functionB | function | (data: object) => Promise<Result> | 高 | 数据库 |
| ClassC | class | constructor(config) | 中 | 文件系统 |

### {FILE_PATH_2}
...

## 关键用户流程
1. **流程名称**: 用户登录
   - 入口: login.js
   - 步骤: 输入凭证 → 验证 → 跳转首页
   - 涉及模块: auth.js, user.js, router.js

2. **流程名称**: 配置保存
   - 入口: settings.js
   - 步骤: 填写表单 → 验证 → 保存 → 提示成功
   - 涉及模块: config.js, storage.js, ui.js

## 统计
- 总文件数: {N}
- 总函数数: {M}
- 高复杂度函数: {H}
- 有外部依赖的函数: {D}
```

---

## 阶段2: 测试规划 (主代理执行)

### 目标
基于 CODE_ANALYSIS.md，制定详细的测试计划，确定每个函数的测试用例。

### 执行步骤

1. **读取 CODE_ANALYSIS.md**
2. **为每个函数规划测试用例**:
   - 正常输入 → 期望输出
   - 边界条件 (空值、极值、特殊字符)
   - 错误处理 (无效输入、异常情况)
3. **确定测试优先级**:
   - P0: 核心业务逻辑、高复杂度函数
   - P1: 有外部依赖的函数
   - P2: 工具函数、辅助函数
4. **生成 TEST_PLAN.md**

### 输出文档: TEST_PLAN.md

```markdown
# 测试计划

## 基于代码分析
- 分析文档: CODE_ANALYSIS.md
- 规划时间: {TIMESTAMP}

## L1 单元测试计划

### {MODULE_NAME} ({FILE_PATH})

#### {FUNCTION_NAME}
- **优先级**: P0
- **复杂度**: 高
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U001 | 正常输入返回正确结果 | `{valid_input}` | `{expected}` | 正常 |
| U002 | 空输入返回默认值 | `null` | `{}` | 边界 |
| U003 | 无效输入抛出异常 | `{invalid}` | `throw Error` | 异常 |
| U004 | 特殊字符处理 | `"<script>"` | `escaped` | 边界 |

---

## L2 集成测试计划

### {SERVICE_NAME}

#### CRUD 操作测试
| 用例ID | 描述 | 前置条件 | 操作 | 期望结果 |
|--------|------|----------|------|----------|
| I001 | 创建数据成功 | 数据库连接正常 | create(data) | 返回带ID的对象 |
| I002 | 读取存在的数据 | 数据已存在 | read(id) | 返回数据对象 |
| I003 | 读取不存在的数据 | 数据不存在 | read(invalid_id) | 抛出 NotFound |
| I004 | 更新数据成功 | 数据已存在 | update(id, data) | 返回更新后对象 |
| I005 | 删除数据成功 | 数据已存在 | delete(id) | 无异常 |

---

## L3 E2E 测试计划

### 流程: {FLOW_NAME}

| 用例ID | 步骤 | 操作 | 期望结果 |
|--------|------|------|----------|
| E001 | 1. 打开页面 | goto(url) | 页面加载成功 |
| E002 | 2. 填写表单 | fill(selector, value) | 输入显示正确 |
| E003 | 3. 点击提交 | click(submit) | 显示加载状态 |
| E004 | 4. 验证结果 | expect(success) | 显示成功消息 |

---

## 测试统计
| 层级 | 用例数 | P0 | P1 | P2 |
|------|--------|----|----|----| 
| L1 单元测试 | {N1} | {P0_1} | {P1_1} | {P2_1} |
| L2 集成测试 | {N2} | {P0_2} | {P1_2} | {P2_2} |
| L3 E2E测试 | {N3} | {P0_3} | {P1_3} | {P2_3} |
| **总计** | {TOTAL} | | | |

## TODO 清单
- [ ] L1: {module1} - {function1} ({N} 用例)
- [ ] L1: {module1} - {function2} ({N} 用例)
- [ ] L2: {service1} - CRUD ({N} 用例)
- [ ] L3: {flow1} ({N} 用例)
```

---

## 阶段3: 测试生成 (Code Agent × N)

### 目标
根据 TEST_PLAN.md 中的 TODO 清单，分发给多个子代理并行生成测试代码。

### 分发策略
- **按模块分发**: 每个子代理负责一个模块的所有测试
- **携带上下文**: 每个子代理都携带 TEST_PLAN.md 中该模块的测试用例
- **使用模板**: 从 `@templates/` 复制基础模板，填充具体用例

### 执行指令 (为每个模块调用)

```
delegate_task(
  category="quick",
  run_in_background=true,
  load_skills=["test-runner"],
  prompt="""
根据测试计划生成测试代码。

## 上下文
- 项目类型: {JavaScript/Python}
- 模块路径: {MODULE_PATH}
- 模板位置: @templates/{javascript/python}/

## 测试用例 (来自 TEST_PLAN.md)
{PASTE_TEST_CASES_FOR_THIS_MODULE}

## 要求
1. 从模板复制基础结构
2. 替换所有 {{PLACEHOLDER}} 为实际值
3. 为每个用例编写具体的测试代码
4. 确保测试可独立运行
5. 添加必要的 setup/teardown

## 输出
- 测试文件路径: {OUTPUT_PATH}
"""
)
```

### 模板位置
```
@templates/javascript/   # Node.js 项目
  ├── jest.config.js
  ├── setup.js
  ├── unit.test.js       # L1 模板
  ├── integration.test.js # L2 模板
  ├── e2e.test.js        # L3 模板
  └── playwright.config.js

@templates/python/       # Python 项目
  ├── pytest.ini
  ├── conftest.py
  ├── test_unit.py       # L1 模板
  ├── test_integration.py # L2 模板
  └── test_e2e.py        # L3 模板

@templates/electron/     # Electron 项目
  ├── jest.config.js
  ├── playwright.config.js
  └── app.e2e.js
```

---

## 阶段4: 验证执行 (Test Agent)

### 目标
运行所有测试，分析覆盖率，识别未覆盖的代码。

### 执行步骤

1. **运行测试**
```bash
# JavaScript
npm test
npm run test:coverage

# Python
pytest --cov=src --cov-report=html
```

2. **分析覆盖率报告**
- 检查总体覆盖率是否达到 80%
- 识别未覆盖的函数/分支
- 生成 COVERAGE_REPORT.md

3. **处理未覆盖代码**
- 如果覆盖率不足，回到阶段2 补充测试计划
- 更新 TEST_PLAN.md 中的 TODO
- 重新执行阶段3

### 输出文档: COVERAGE_REPORT.md

```markdown
# 覆盖率报告

## 总体覆盖率
| 指标 | 覆盖率 | 目标 | 状态 |
|------|--------|------|------|
| Statements | 85% | 80% | ✅ |
| Branches | 72% | 70% | ✅ |
| Functions | 90% | 80% | ✅ |
| Lines | 85% | 80% | ✅ |

## 未覆盖代码
| 文件 | 行号 | 原因 | 建议 |
|------|------|------|------|
| lib/utils.js | 45-48 | 错误处理分支 | 添加异常测试 |
| lib/config.js | 102 | 边界条件 | 添加空值测试 |

## 测试结果
- 总用例数: {TOTAL}
- 通过: {PASSED}
- 失败: {FAILED}
- 跳过: {SKIPPED}

## 失败用例分析
| 用例 | 错误信息 | 建议修复 |
|------|----------|----------|
| test_xxx | AssertionError | 检查期望值 |
```

---

## 快速命令映射

| 用户请求 | 执行阶段 |
|----------|----------|
| "分析代码" / "代码分析" | 阶段1 |
| "规划测试" / "测试计划" | 阶段1 + 阶段2 |
| "生成测试" / "创建测试" / "添加测试" | 阶段1 + 阶段2 + 阶段3 |
| "运行测试" | 阶段4 |
| "完整测试流程" / "测试覆盖" | 阶段1 → 阶段2 → 阶段3 → 阶段4 |
| "补充测试" | 基于 COVERAGE_REPORT.md 执行阶段2 + 阶段3 |

---

## 文档流转

```
阶段1 输出 → CODE_ANALYSIS.md
                    ↓
阶段2 输入    CODE_ANALYSIS.md
阶段2 输出 → TEST_PLAN.md
                    ↓
阶段3 输入    TEST_PLAN.md (按模块拆分)
阶段3 输出 → 测试文件 (__tests__/*.test.js, tests/*.py)
                    ↓
阶段4 输入    测试文件
阶段4 输出 → COVERAGE_REPORT.md
                    ↓
            覆盖率不足? → 回到阶段2
```

---

## 支持的项目类型

| 检测文件 | 项目类型 | 测试框架 |
|----------|----------|----------|
| `package.json` + `electron` | Electron | Jest + Playwright |
| `package.json` | Node.js | Jest + Playwright |
| `pyproject.toml` / `setup.py` | Python | pytest + Playwright |

---

## 测试层级说明

### L1: 单元测试
- **目标**: 测试单个函数/方法的逻辑正确性
- **覆盖率**: 80%+
- **特点**: 快速、隔离、无外部依赖、使用 Mock

### L2: 集成测试
- **目标**: 测试模块间交互、数据流、外部依赖
- **覆盖**: API 接口、数据库操作、文件 I/O
- **特点**: 使用临时目录、真实或 Mock 的外部服务

### L3: E2E 测试
- **目标**: 测试完整用户流程
- **覆盖**: 页面加载、表单交互、导航流程
- **特点**: 使用 Playwright、真实浏览器/Electron 环境
