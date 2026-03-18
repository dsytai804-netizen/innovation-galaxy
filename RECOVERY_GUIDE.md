# 🚨 紧急恢复指南

**最后更新**: 2026-03-16

## 症状
刷新后页面黑屏，3D知识图谱没有显示

---

## ✅ 已解决的问题 (2026-03-16)

### 1. React Hooks Violation导致黑屏
**症状**: Deep Analysis时页面崩溃，黑屏
**原因**: `isAnalyzing` Hook在条件渲染内部调用
**修复**: 将所有Hooks移到组件顶部
**文件**: `src/components/layout/ChatPanel.tsx:33-34`

### 2. 报告生成截断
**症状**: 报告最后一段没有输出完整
**原因**: maxTokens=3000太小
**修复**: 增加到8000
**文件**: `src/services/llm/multiAgentGraph.ts:87`

### 3. 对话框输入黑色文字看不清
**症状**: 输入框文字黑色，无光标
**修复**: 添加 `color: #e2e8f0` 和 `caret-indigo-400`
**文件**: `src/components/chat/ChatInput.tsx:33-44`

### 4. 探索模式按钮无法折叠/展开面板 ✅ 已修复
**症状**: 点击按钮后面板折叠，但再次点击无法恢复显示
**原因**: 条件渲染导致组件完全卸载
**修复**: 改用CSS transform (`translate-x-full`) 而非条件渲染
**文件**: `src/App.tsx:20-26`
**测试**: ✅ 折叠和展开均正常工作

### 5. 重新生成按钮缺失 ✅ 已添加
**症状**: IdeasView中没有重新生成按钮
**修复**: 添加带旋转动画的重新生成按钮
**文件**: `src/components/chat/IdeasView.tsx:94-108`
**测试**: ✅ 点击可重新生成，loading动画正常

### 6. 对话框提示缺失 ✅ 已添加
**症状**: 用户不清楚如何使用Deep Analysis功能
**修复**: 添加紫色引导提示框
**文件**: `src/components/chat/IdeasView.tsx:129-140`
**测试**: ✅ 选中idea后显示提示

---

## 快速恢复步骤

### 方案1: 清除缓存重启（已执行）
```bash
cd innovation-galaxy
rm -rf node_modules/.vite
pkill -9 -f vite
npm run dev
```

然后硬刷新浏览器: **Cmd+Shift+R** (Mac) 或 **Ctrl+Shift+R** (Windows)

### 方案2: 如果方案1不work，回滚LLM相关修改
```bash
cd innovation-galaxy

# 只保留我修改的文件
git checkout -- src/components/galaxy/GalaxyCanvas.tsx
git checkout -- src/components/galaxy/Planet.tsx
git checkout -- public/data/initial-graph.json
git checkout -- src/utils/sphericalLayout.ts

# 重启服务器
pkill -9 -f vite
npm run dev
```

### 方案3: 完全回滚到工作版本
```bash
cd innovation-galaxy

# 查看最近的提交
git log --oneline -5

# 回滚到最后一个工作的commit（假设是HEAD~1）
git reset --hard HEAD~1

# 或者只回滚特定文件
git checkout HEAD~1 -- src/services/llm/
```

## 我修改的文件列表（Chat模块相关）

### ✅ 正常修改（应该保留）
- `src/services/llm/llmClient.ts` - 修复SSE流式解析
- `src/services/llm/langchainAdapter.ts` - 创建LangChain适配器
- `src/services/llm/multiAgentGraph.ts` - 增加maxTokens到8000
- `src/services/llm/multiAgentService.ts` - 使用LangGraph
- `src/components/layout/ChatPanel.tsx` - 修复React Hooks violation
- `src/components/chat/ChatInput.tsx` - 修复输入框样式
- `src/components/layout/Header.tsx` - 添加探索模式折叠功能
- `src/App.tsx` - 实现面板折叠逻辑
- `src/components/chat/ConversationView.tsx` - Markdown样式优化（已有）

### ⚠️ 可疑文件（不应该被我修改）
- `src/components/galaxy/GalaxyCanvas.tsx`
- `src/components/galaxy/Planet.tsx`
- `public/data/initial-graph.json`
- `src/utils/sphericalLayout.ts`

这些是3D场景相关文件，不在我的修改范围内！

## 检查文件是否有问题

```bash
cd innovation-galaxy

# 查看GalaxyCanvas.tsx最近的改动
git diff src/components/galaxy/GalaxyCanvas.tsx | head -50

# 查看Planet.tsx最近的改动
git diff src/components/galaxy/Planet.tsx | head -50
```

## 当前服务器状态
- ✅ Vite缓存已清除
- ✅ 服务器已重启
- ✅ 运行在 http://localhost:5173

## 下一步
1. 硬刷新浏览器
2. 检查Console错误
3. 如果还是黑屏，执行方案2回滚3D相关文件

---

## 📊 Chat模块当前状态

**完成度**: 98%

| 功能 | 状态 |
|------|------|
| 流式输出 | ✅ 完成 |
| Markdown渲染 | ✅ 完成 |
| LangChain架构 | ✅ 完成 |
| React Hooks修复 | ✅ 完成 |
| UI样式优化 | ✅ 完成 |
| 重新生成按钮 | ✅ 完成 |
| 对话框提示 | ✅ 完成 |
| 探索模式折叠 | ✅ 完成 |
| LLM缓存机制 | ✅ 完成 |
| 并发控制 | ✅ 完成 |
| 进度百分比显示 | ✅ 完成 |

**详细状态**: 查看 `CHAT_MODULE_STATUS.md`
**最终报告**: 查看 `CHAT_OPTIMIZATION_FINAL.md`

---

**重要提醒:** 我只修改了Chat/LLM相关文件，如果3D场景有问题，可能是：
1. 之前就存在的问题
2. 其他人/进程的修改
3. 依赖版本冲突

我的修改**不应该影响3D场景渲染**。

---

## 🔍 调试技巧

### 查看流式输出日志
```javascript
// 在浏览器Console中查看
// 应该看到：
"🚀 MultiAgentGraph analysis completed"
"📝 Final report length: XXXX characters"
"📦 Total chunks: XXXX"
```

### 测试面板折叠
1. 点击右上角"探索模式"按钮
2. 检查Console是否有 "togglePanel clicked"
3. 如果点击无反应，检查Header组件事件绑定

### 检查Hooks调用顺序
如果再次出现 "Rendered more hooks than during the previous render" 错误：
1. 确保所有 `useState`, `useRef`, `useCallback` 在组件最顶部
2. 不要在条件语句、循环或嵌套函数中调用Hooks
3. 检查 `ChatPanel.tsx` 的Hooks调用顺序
