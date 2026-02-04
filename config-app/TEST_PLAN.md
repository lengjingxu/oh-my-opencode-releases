# 测试计划

## 基于代码分析
- 分析文档: CODE_ANALYSIS.md
- 规划时间: 2026-02-04T10:16:00
- 测试框架: Jest + Playwright

## L1 单元测试计划

### utils 模块 (lib/utils.js)

#### copyDirSync
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U001 | 复制空目录 | `(emptyDir, destDir)` | 目标目录创建成功 | 正常 |
| U002 | 复制含文件目录 | `(dirWithFiles, destDir)` | 文件完整复制 | 正常 |
| U003 | 递归复制嵌套目录 | `(nestedDir, destDir)` | 嵌套结构保持 | 正常 |
| U004 | 目标目录已存在 | `(srcDir, existingDir)` | 正常覆盖 | 边界 |

#### matchModelsToAgents
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U005 | 空模型列表 | `('provider', {})` | `null` | 边界 |
| U006 | null模型 | `('provider', null)` | `null` | 边界 |
| U007 | 匹配opus模型 | `('anthropic', {'claude-opus-4-5-20251101': {}})` | `{primary: 'anthropic/claude-opus-4-5-20251101', ...}` | 正常 |
| U008 | 匹配sonnet模型 | `('anthropic', {'claude-sonnet-4-5': {}})` | `{secondary: 'anthropic/claude-sonnet-4-5', ...}` | 正常 |
| U009 | 匹配haiku模型 | `('anthropic', {'claude-haiku': {}})` | `{fast: 'anthropic/claude-haiku', ...}` | 正常 |
| U010 | 匹配gemini-pro | `('google', {'gemini-2.5-pro': {}})` | `{multimodal: 'google/gemini-2.5-pro', ...}` | 正常 |
| U011 | 匹配gemini-flash | `('google', {'gemini-2.5-flash': {}})` | `{fast: 'google/gemini-2.5-flash', ...}` | 正常 |
| U012 | 匹配gpt-4 | `('openai', {'gpt-4o': {}})` | `{primary: 'openai/gpt-4o', ...}` | 正常 |
| U013 | 匹配gpt-4-mini | `('openai', {'gpt-4o-mini': {}})` | `{fast: 'openai/gpt-4o-mini', ...}` | 正常 |
| U014 | 多模型混合匹配 | `('provider', {opus, sonnet, haiku})` | 正确分配各角色 | 正常 |
| U015 | 无匹配时使用首个 | `('provider', {'unknown-model': {}})` | `{primary: 'provider/unknown-model'}` | 边界 |

#### applyModelMapping
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U016 | null映射 | `({}, null)` | 原配置不变 | 边界 |
| U017 | 空配置应用映射 | `({}, modelMapping)` | 添加agents和categories | 正常 |
| U018 | 已有配置追加 | `({agents: {...}}, mapping)` | 合并配置 | 正常 |
| U019 | 完整映射应用 | `({}, fullMapping)` | 所有agent和category配置 | 正常 |

#### readCredentials
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U020 | 文件存在且有效 | `(validPath)` | 解析后的对象 | 正常 |
| U021 | 文件不存在 | `(nonExistPath)` | `{}` | 边界 |
| U022 | 文件内容无效JSON | `(invalidJsonPath)` | `{}` | 错误 |

#### writeCredentials
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U023 | 正常写入 | `(path, {key: 'value'})` | 文件写入成功 | 正常 |
| U024 | 覆盖已有文件 | `(existingPath, newData)` | 文件被覆盖 | 正常 |

#### maskSecret
- **优先级**: P2
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U025 | 空字符串 | `('')` | `''` | 边界 |
| U026 | null输入 | `(null)` | `''` | 边界 |
| U027 | 默认全遮蔽 | `('secret123')` | `'••••••••'` | 正常 |
| U028 | 显示前N位 | `('secret123', 3)` | `'sec••••••••'` | 正常 |
| U029 | visibleChars=0 | `('secret', 0)` | `'••••••••'` | 边界 |

---

### config-service 模块 (lib/config-service.js)

#### ensureDir
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U030 | 目录不存在 | `(newDir)` | 目录创建成功 | 正常 |
| U031 | 目录已存在 | `(existingDir)` | 无操作，无报错 | 边界 |
| U032 | 嵌套目录创建 | `(a/b/c/d)` | 递归创建成功 | 正常 |

#### readJsonFile
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U033 | 有效JSON文件 | `(validJsonPath)` | 解析后对象 | 正常 |
| U034 | 文件不存在 | `(nonExistPath)` | `null` | 边界 |
| U035 | 无效JSON | `(invalidJsonPath)` | `null` | 错误 |

#### writeJsonFile
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U036 | 正常写入 | `(path, obj)` | 格式化JSON写入 | 正常 |
| U037 | 父目录不存在 | `(nested/path, obj)` | 自动创建目录 | 正常 |

#### getCredentials / saveCredentials / updateCredentials
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U038 | 获取空凭证 | `()` | `{}` | 边界 |
| U039 | 获取已有凭证 | `()` | 凭证对象 | 正常 |
| U040 | 保存凭证 | `(data)` | 文件写入成功 | 正常 |
| U041 | 更新单个key | `('key', 'value')` | 返回更新后对象 | 正常 |

#### getFcConfig / saveFcConfig
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U042 | 获取空FC配置 | `()` | `{accounts: [], default_account: ''}` | 边界 |
| U043 | 获取已有FC配置 | `()` | FC配置对象 | 正常 |
| U044 | 保存新账户 | `({accounts: [...]})` | 账户保存成功 | 正常 |
| U045 | 保存时保留密码 | `({accounts: [{secret: '••••••••'}]})` | 原密码保留 | 正常 |

#### getSqlConfig / saveSqlConfig
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U046 | 获取空SQL配置 | `()` | `{connections: {}}` | 边界 |
| U047 | 获取已有SQL配置 | `()` | SQL配置对象 | 正常 |
| U048 | 保存新连接 | `({connections: {...}})` | 连接保存成功 | 正常 |
| U049 | 保存时保留密码 | `({connections: {db: {password: '••••••••'}}})` | 原密码保留 | 正常 |

#### getImageGeneratorConfig / saveImageGeneratorConfig
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U050 | 获取空配置 | `()` | `{enabled: false}` | 边界 |
| U051 | 保存配置 | `(url, apiKey)` | 配置保存成功 | 正常 |

#### checkSkillInstalled
- **优先级**: P1
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U052 | Skill已安装 | `('existing-skill')` | `true` | 正常 |
| U053 | Skill未安装 | `('non-exist-skill')` | `false` | 正常 |

#### createBackup / listBackups / restoreBackup
- **优先级**: P0
- **测试用例**:

| 用例ID | 描述 | 输入 | 期望输出 | 类型 |
|--------|------|------|----------|------|
| U054 | 创建备份 | `('opencode', data)` | `{backupName, backupPath}` | 正常 |
| U055 | 列出空备份 | `('opencode')` | `[]` | 边界 |
| U056 | 列出已有备份 | `('opencode')` | 备份列表(按时间倒序) | 正常 |
| U057 | 恢复opencode备份 | `('opencode-xxx.json')` | 配置恢复成功 | 正常 |
| U058 | 恢复oh备份 | `('oh-xxx.json')` | 配置恢复成功 | 正常 |
| U059 | 恢复credentials备份 | `('credentials-xxx.json')` | 配置恢复成功 | 正常 |
| U060 | 恢复不存在备份 | `('non-exist.json')` | 抛出错误 | 错误 |
| U061 | 恢复无效备份 | `('invalid.json')` | 抛出错误 | 错误 |
| U062 | 未知配置类型 | `('unknown-xxx.json')` | 抛出错误 | 错误 |

---

## L2 集成测试计划

### 凭证管理集成测试
| 用例ID | 描述 | 涉及模块 | 类型 |
|--------|------|----------|------|
| I001 | FC配置完整流程 | config-service, utils | 集成 |
| I002 | SQL配置完整流程 | config-service, utils | 集成 |
| I003 | 备份恢复完整流程 | config-service | 集成 |

---

## L3 E2E 测试计划

### 用户流程测试 (Playwright)
| 用例ID | 描述 | 入口 | 类型 |
|--------|------|------|------|
| E001 | 首次安装流程 | 启动应用 → 安装向导 | E2E |
| E002 | 配置编辑保存 | 配置页 → 编辑 → 保存 | E2E |
| E003 | 备份恢复操作 | 备份页 → 创建 → 恢复 | E2E |

---

## TODO 清单

### L1 单元测试 (已完成)
- [x] L1: utils - copyDirSync (4 用例)
- [x] L1: utils - matchModelsToAgents (11 用例)
- [x] L1: utils - applyModelMapping (4 用例)
- [x] L1: utils - readCredentials (3 用例)
- [x] L1: utils - writeCredentials (2 用例)
- [x] L1: utils - maskSecret (5 用例)
- [x] L1: config-service - ensureDir (3 用例)
- [x] L1: config-service - readJsonFile (3 用例)
- [x] L1: config-service - writeJsonFile (2 用例)
- [x] L1: config-service - credentials系列 (4 用例)
- [x] L1: config-service - FC配置系列 (4 用例)
- [x] L1: config-service - SQL配置系列 (4 用例)
- [x] L1: config-service - ImageGenerator系列 (2 用例)
- [x] L1: config-service - checkSkillInstalled (2 用例)
- [x] L1: config-service - backup系列 (9 用例)

### L2 集成测试 (待补充)
- [ ] L2: 凭证管理集成测试 (3 用例)

### L3 E2E 测试 (待补充)
- [ ] L3: 首次安装流程 (1 用例)
- [ ] L3: 配置编辑保存 (1 用例)
- [ ] L3: 备份恢复操作 (1 用例)

---

## 测试统计

| 层级 | 用例数 | P0 | P1 | P2 |
|------|--------|----|----|----| 
| L1 单元测试 | 62 | 38 | 19 | 5 |
| L2 集成测试 | 3 | 3 | 0 | 0 |
| L3 E2E测试 | 3 | 3 | 0 | 0 |
| **总计** | **68** | **44** | **19** | **5** |

## 现有测试覆盖
- 已有测试用例: 54
- 测试通过率: 100%
- 主要覆盖: lib/utils.js, lib/config-service.js
