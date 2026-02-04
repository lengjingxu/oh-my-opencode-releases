# test-runner 技能质量提升方案

## 问题诊断

### 当前验证机制的缺陷

```javascript
// 当前验证 (test-runner.js)
const rules = {
  1: ['## 源代码文件清单', '## 统计'],  // 只检查字符串存在
  2: ['## L1 单元测试计划', '## TODO 清单'],
  4: ['## 总体覆盖率', '## 测试结果']
};
```

**问题**:
1. **只检查章节标题** - 不验证内容质量
2. **无交叉验证** - Phase 2 不检查是否覆盖 Phase 1 的函数
3. **无量化指标** - 不检查最小用例数、覆盖率等
4. **无 Agent 审查** - 缺少高级 Agent 的质量把关

---

## 改进方案

### 方案 1: 增强脚本验证 (已实现)

创建 `test-runner-enhanced.js`，增加:

| 验证类型 | 说明 | 示例 |
|----------|------|------|
| 深度内容验证 | 检查表格格式、数据完整性 | 必须有函数签名表格 |
| 量化指标检查 | 最小数量要求 | 至少 5 个测试用例 |
| 交叉验证 | Phase N 覆盖 Phase N-1 | 测试计划覆盖所有分析的函数 |
| 质量门禁 | 覆盖率、通过率阈值 | 覆盖率 >= 80% |

### 方案 2: Agent 审查集成

在每个阶段完成后，调用专业 Agent 审查:

| 阶段 | 审查 Agent | 审查要点 |
|------|------------|----------|
| Phase 1 | **Momus** | 分析完整性、函数签名准确性 |
| Phase 2 | **Oracle** | 测试策略合理性、边界条件充分性 |
| Phase 3 | **执行验证** | 测试语法正确、可运行 |
| Phase 4 | **Momus** | 报告数据准确性、改进建议 |

### 方案 3: 闭环验证流程

```
┌─────────────────────────────────────────────────────────────┐
│                    闭环验证流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1 ──→ [脚本验证] ──→ [Momus 审查] ──┐               │
│              ↑                              │               │
│              └──── 不通过 ←─────────────────┘               │
│                              │                              │
│                              ↓ 通过                         │
│  Phase 2 ──→ [脚本验证] ──→ [交叉验证] ──→ [Oracle 审查]   │
│              ↑                                    │         │
│              └──── 不通过 ←───────────────────────┘         │
│                              │                              │
│                              ↓ 通过                         │
│  Phase 3 ──→ [脚本验证] ──→ [交叉验证] ──→ [执行测试]      │
│              ↑                                    │         │
│              └──── 不通过 ←───────────────────────┘         │
│                              │                              │
│                              ↓ 通过                         │
│  Phase 4 ──→ [脚本验证] ──→ [覆盖率检查] ──┐               │
│              ↑                              │               │
│              │    覆盖率 < 80%              │               │
│              └──── 返回 Phase 2 ←───────────┘               │
│                              │                              │
│                              ↓ 覆盖率 >= 80%                │
│                           ✅ 完成                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 具体实现

### 1. 更新 SKILL.md frontmatter

```yaml
---
name: test-runner
description: 测试执行框架 - 多代理协作完成代码分析、测试规划、测试生成、验证执行
version: 2.0.0

outputs:
  - name: CODE_ANALYSIS.md
    phase: 1
    required: true
    description: 代码分析报告
    validation:
      - contains: "## 源代码文件清单"
      - contains: "## 统计"
      - matches: "总文件数[：:]\\s*\\d+"
      - matches: "总函数数[：:]\\s*\\d+"
      - min_tables: 1
    agent_review:
      agent: momus
      prompt: "审查完整性和准确性"

  - name: TEST_PLAN.md
    phase: 2
    required: true
    description: 测试计划
    validation:
      - contains: "## L1 单元测试计划"
      - contains: "## TODO 清单"
      - min_test_cases: 5
    cross_validation:
      source: CODE_ANALYSIS.md
      check: functions_covered
    agent_review:
      agent: oracle
      prompt: "审查测试策略合理性"

  - name: tests/
    phase: 3
    required: true
    description: 测试代码
    validation:
      - min_files: 1
    cross_validation:
      source: TEST_PLAN.md
      check: todos_implemented
    execution_check: true

  - name: COVERAGE_REPORT.md
    phase: 4
    required: true
    description: 覆盖率报告
    validation:
      - contains: "## 总体覆盖率"
      - contains: "## 测试结果"
      - min_coverage: 80
    quality_gate:
      coverage_target: 80
      pass_rate_target: 95
      action_on_fail: return_to_phase_2
---
```

### 2. 更新 phase-*.md 模板

在每个阶段末尾添加:

```markdown
## 质量验证 (REQUIRED)

### 脚本验证
\`\`\`bash
node test-runner-enhanced.js validate {PHASE} {PROJECT_PATH}
\`\`\`

### Agent 审查 (推荐)
\`\`\`
delegate_task(
  subagent_type="{AGENT}",
  load_skills=[],
  prompt="审查 {OUTPUT_FILE}: {REVIEW_POINTS}",
  run_in_background=false
)
\`\`\`

### 验证检查点
- [ ] 脚本验证通过
- [ ] Agent 审查通过 (或记录豁免原因)
- [ ] 交叉验证通过 (如适用)

⚠️ 未通过验证不得进入下一阶段
```

### 3. 更新主 SKILL.md 指引

```markdown
## 执行流程 (v2.0)

### 阶段执行模式

每个阶段必须完成以下步骤:

1. **执行任务** - 按阶段指引完成工作
2. **脚本验证** - `node test-runner-enhanced.js validate <phase>`
3. **Agent 审查** - 调用指定 Agent 进行质量审查
4. **交叉验证** - 确保覆盖前置阶段的内容
5. **进入下一阶段** - `node test-runner-enhanced.js next <phase>`

### 质量门禁

| 阶段 | 脚本验证 | Agent 审查 | 交叉验证 |
|------|----------|------------|----------|
| 1 | ✅ 必须 | ⭐ 推荐 (Momus) | - |
| 2 | ✅ 必须 | ⭐ 推荐 (Oracle) | ✅ 必须 |
| 3 | ✅ 必须 | - | ✅ 必须 |
| 4 | ✅ 必须 | ⭐ 推荐 (Momus) | ✅ 必须 |

### 失败处理

- **脚本验证失败** → 修复后重新验证
- **Agent 审查不通过** → 按建议修改后重新审查
- **交叉验证失败** → 返回前置阶段补充
- **覆盖率不达标** → 返回 Phase 2 补充测试计划
```

---

## 效果预期

| 指标 | 改进前 | 改进后 |
|------|--------|--------|
| 内容完整性 | 22% (只覆盖 4/18 模块) | 80%+ (交叉验证确保覆盖) |
| 数据准确性 | 70% (数据混乱) | 95%+ (量化指标检查) |
| 测试质量 | 60% (边界条件不足) | 85%+ (Oracle 审查策略) |
| 覆盖率 | 无保证 | 80%+ (质量门禁) |

---

## 实施步骤

1. **部署增强脚本** ✅
   - `test-runner-enhanced.js` 已创建

2. **更新 SKILL.md** (待实施)
   - 添加 outputs 验证规则
   - 添加 agent_review 配置

3. **更新 phase-*.md** (待实施)
   - 添加质量验证章节
   - 添加 Agent 审查调用示例

4. **测试验证** (待实施)
   - 在实际项目上测试改进效果
   - 收集反馈并迭代

---

## 总结

提高 test-runner 内容质量的核心策略:

| 策略 | 实现方式 | 效果 |
|------|----------|------|
| **脚本检查** | 增强验证规则，检查内容而非标题 | 确保格式和数量达标 |
| **交叉验证** | Phase N 必须覆盖 Phase N-1 | 确保内容连贯完整 |
| **Agent 审查** | Momus/Oracle 进行质量把关 | 确保策略合理、深度足够 |
| **闭环机制** | 不达标则返回修改 | 确保最终质量 |

**关键洞察**: 单纯的脚本检查只能保证"形式"，需要 Agent 审查来保证"内容质量"。两者结合才能真正提升产出物质量。
